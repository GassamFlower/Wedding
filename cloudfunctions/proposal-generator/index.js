// 云函数：proposal-generator (方案 Agent)
// 基于提取的需求 + 场地数据 → 生成完整婚礼方案
// actions: generate, listBySession, detail, confirm

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const {
  extractJSON,
  buildProposalGeneratorPrompt,
} = require('./llm');

const {
  calculateFullCost,
  estimateQuick,
} = require('./cost-engine');

const {
  ok, fail, safe, requireFields,
  normalizePage, formatMoney,
} = require('./utils');

exports.main = async (event, context) => {
  const { action } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    switch (action) {
      case 'generate':
        return await generateProposal(OPENID, event);
      case 'listBySession':
        return await listBySession(OPENID, event);
      case 'detail':
        return await getDetail(OPENID, event);
      case 'confirm':
        return await confirmProposal(OPENID, event);
      case 'regenerate':
        return await regenerateProposal(OPENID, event);
	    case 'plannerDetail':
        return await getPlannerDetail(OPENID, event);
      default:
        return fail('未知操作: ' + action);
    }
  } catch (err) {
    console.error('proposal-generator error:', err);
    return fail(err && err.message ? err.message : String(err));
  }
};

// ====================== 方案生成 ======================

/**
 * 生成婚礼方案
 * 输入：sessionId（设计会话）+ 可选 venueId（场地信息）
 * 输出：结构化方案对象 + 持久化到 proposals 集合
 */
async function generateProposal(openid, event) {
  const { sessionId, venueId, style, budget, guestCount, venueType, preferredColors, preferredDate, additionalNotes, options } = event;

  // 从 session 获取需求数据
  let extracted = {};
  if (sessionId) {
    const sessionRes = await db.collection('design_sessions').doc(sessionId).get().catch(() => null);
    if (sessionRes && sessionRes.data) {
      extracted = sessionRes.data.extracted || {};
    }
  }

  // 合并显式传入的参数
  const requirements = {
    style: style || extracted.style || '未明确',
    budget: budget || extracted.budget || { min: 8000, max: 15000 },
    guestCount: guestCount || extracted.guestCount || 100,
    venueType: venueType || extracted.venueType || '室内',
    preferredColors: preferredColors || extracted.preferredColors || [],
    preferredDate: preferredDate || extracted.preferredDate || '',
  };

  // 获取场地信息（如果有）
  let venueInfo = null;
  if (venueId) {
    const venueRes = await db.collection('hotels').doc(venueId).get().catch(() => null);
    if (venueRes && venueRes.data) {
      venueInfo = {
        name: venueRes.data.name || '',
        hall: venueRes.data.hall || '',
        capacity: venueRes.data.capacity || '',
        type: venueRes.data.type || 'hotel',
        address: venueRes.data.address || '',
      };
    }
  }

  // 构建 LLM 请求
  const systemPrompt = buildProposalGeneratorPrompt();
  const userPrompt = buildProposalUserPrompt(requirements, venueInfo, additionalNotes);

  let proposal;
  try {
    proposal = await extractJSON(systemPrompt, [
      { role: 'user', content: userPrompt },
    ]);

    // 校验和补全
    proposal = normalizeProposal(proposal, requirements);
  } catch (llmErr) {
    console.error('LLM proposal generation failed:', llmErr);
    // 降级：用规则引擎生成基础方案
    proposal = generateFallbackProposal(requirements, venueInfo);
  }

  // ── 成本核算引擎 ──
  const costOptions = options || {};
  const costing = calculateFullCost(requirements, proposal.propList, {
    profitRate: costOptions.profitRate || 0.35,
  });

  // 客户报价（4项简洁大类）
  proposal.customerPricing = costing.customerPricing;

  // 兼容旧的 totalCost 字段
  proposal.totalCost = costing.summary.customerPrice;

  // 策划师视图（全部成本+利润+建议报价区间）
  proposal.plannerView = costing.plannerView;
  proposal.summary = costing.summary;

  // 持久化
  const proposalsCol = db.collection('proposals');
  const proposalDoc = {
    _openid: openid,
    sessionId: sessionId || '',
    venueId: venueId || '',
    requirements,
    venueInfo,
    ...proposal,
    status: 'draft',
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
  };

  const createRes = await proposalsCol.add({ data: proposalDoc });

  // 更新会话状态
  if (sessionId) {
    await db.collection('design_sessions').doc(sessionId).update({
      data: {
        status: 'proposal_ready',
        updatedAt: new Date(),
      },
    }).catch(() => {});
  }

  return ok({
    proposalId: createRes._id,
    ...proposal,
    totalCost: proposal.totalCost,
    status: 'draft',
    version: 1,
  });
}

/**
 * 重新生成方案（修改需求后）— 重新跑成本引擎
 */
async function regenerateProposal(openid, event) {
  const { proposalId, feedback } = event;
  if (!proposalId) return fail('缺少 proposalId');

  const proposalsCol = db.collection('proposals');
  const res = await proposalsCol.doc(proposalId).get().catch(() => null);
  if (!res || !res.data) return fail('方案不存在');
  if (res.data._openid !== openid) return fail('无权访问', 403);

  const oldProposal = res.data;

  // 基于反馈重新生成
  const systemPrompt = buildProposalGeneratorPrompt();
  const userPrompt = `请基于以下修改意见重新生成婚礼方案：

## 原始需求
${JSON.stringify(oldProposal.requirements, null, 2)}

## 原始方案
${JSON.stringify({
  designConcept: oldProposal.designConcept,
  propList: oldProposal.propList,
  costBreakdown: oldProposal.costBreakdown,
  timeline: oldProposal.timeline,
  riskNotes: oldProposal.riskNotes,
}, null, 2)}

## 修改意见
${feedback || '请优化方案，提供更多细节'}

请返回完整的 JSON 格式方案。`;

  let newProposal;
  try {
    newProposal = await extractJSON(systemPrompt, [
      { role: 'user', content: userPrompt },
    ]);
    newProposal = normalizeProposal(newProposal, oldProposal.requirements);
  } catch (e) {
    return fail('方案重新生成失败，请重试');
  }

  // 重新核算成本
  const costing = calculateFullCost(oldProposal.requirements, newProposal.propList);
  newProposal.customerPricing = costing.customerPricing;
  newProposal.totalCost = costing.summary.customerPrice;
  newProposal.plannerView = costing.plannerView;
  newProposal.summary = costing.summary;

  // 创建新版本
  const createRes = await proposalsCol.add({
    data: {
      ...oldProposal,
      ...newProposal,
      status: 'draft',
      version: (oldProposal.version || 1) + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return ok({
    proposalId: createRes._id,
    ...newProposal,
    totalCost: newProposal.totalCost,
    status: 'draft',
    version: (oldProposal.version || 1) + 1,
  });
}

// ====================== 查询接口 ======================

async function listBySession(openid, event) {
  const { sessionId } = event;
  if (!sessionId) return fail('缺少 sessionId');

  const proposalsCol = db.collection('proposals');
  const res = await safe(
    proposalsCol
      .where({ sessionId, isDeleted: false })
      .orderBy('version', 'desc')
      .get(),
    { data: [] }
  );

  const proposals = (res.data || []).map(p => ({
    id: p._id,
    designConcept: p.designConcept,
    totalCost: p.totalCost,
    status: p.status,
    version: p.version,
    createdAt: p.createdAt,
  }));

  return ok(proposals);
}

async function getDetail(openid, event) {
  const { proposalId } = event;
  if (!proposalId) return fail('缺少 proposalId');

  const proposalsCol = db.collection('proposals');
  try {
    const res = await proposalsCol.doc(proposalId).get();
    if (!res.data) return fail('方案不存在');

    const p = res.data;
    return ok({
      proposalId: p._id,
      designConcept: p.designConcept,
      propList: p.propList || [],
      // 客户可见：简洁4项报价
      customerPricing: p.customerPricing || null,
      totalCost: p.totalCost,
      timeline: p.timeline || [],
      riskNotes: p.riskNotes || [],
      nextSteps: p.nextSteps || [],
      requirements: p.requirements,
      venueInfo: p.venueInfo,
      summary: p.summary || null,
      status: p.status,
      version: p.version,
      createdAt: p.createdAt,
    });
  } catch (e) {
    return fail('方案不存在');
  }
}

/**
 * 策划师专用详情 — 含成本明细和利润数据
 */
async function getPlannerDetail(openid, event) {
  const { proposalId } = event;
  if (!proposalId) return fail('缺少 proposalId');

  const proposalsCol = db.collection('proposals');
  try {
    const res = await proposalsCol.doc(proposalId).get();
    if (!res.data) return fail('方案不存在');

    const p = res.data;
    return ok({
      proposalId: p._id,
      designConcept: p.designConcept,
      propList: p.propList || [],
      // 客户可见报价
      customerPricing: p.customerPricing || null,
      timeline: p.timeline || [],
      riskNotes: p.riskNotes || [],
      // 策划师专有：完整成本+利润+建议报价区间
      plannerView: p.plannerView || null,
      summary: p.summary || null,
      requirements: p.requirements,
      venueInfo: p.venueInfo,
      status: p.status,
      version: p.version,
      createdAt: p.createdAt,
    });
  } catch (e) {
    return fail('方案不存在');
  }
}

/**
 * 确认方案 → 自动创建 order + contract
 */
async function confirmProposal(openid, event) {
  const { proposalId } = event;
  if (!proposalId) return fail('缺少 proposalId');

  const proposalsCol = db.collection('proposals');
  const res = await proposalsCol.doc(proposalId).get().catch(() => null);
  if (!res || !res.data) return fail('方案不存在');

  const p = res.data;

  // 创建订单
  const ordersCol = db.collection('orders');
  const orderData = {
    _openid: openid,
    clientName: '', // 后续由策划师填写
    weddingDate: p.requirements.preferredDate || '',
    style: p.requirements.style || '',
    venue: p.venueInfo ? p.venueInfo.name : '',
    venueType: p.requirements.venueType || '室内',
    planner: '',
    budget: p.totalCost,
    paid: 0,
    balance: p.totalCost,
    status: '筹备中',
    progress: 0,
    description: p.designConcept || '',
    costItems: (p.costBreakdown || []).map(c => ({ name: c.category, amount: c.amount })),
    propList: (p.propList || []).map(prop => ({
      name: `${prop.name}(${prop.quantity}${prop.unit})`,
      source: prop.source || '自有',
      status: '待出库',
    })),
    proposalId: proposalId,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
  };

  const orderRes = await ordersCol.add({ data: orderData });

  // 创建合同
  const contractsCol = db.collection('contracts');
  const contractData = {
    _openid: openid,
    orderId: orderRes._id,
    orderDate: p.requirements.preferredDate || '',
    services: p.designConcept || '婚礼场景设计与布置',
    totalAmount: p.totalCost,
    paidAmount: 0,
    balanceAmount: p.totalCost,
    paymentStatus: '部分付款',
    items: (p.costBreakdown || []).map(c => ({ name: c.category, amount: c.amount })),
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
  };

  const contractRes = await contractsCol.add({ data: contractData });

  // 更新方案状态
  await proposalsCol.doc(proposalId).update({
    data: { status: 'confirmed', updatedAt: new Date() },
  });

  return ok({
    proposalId,
    orderId: orderRes._id,
    contractId: contractRes._id,
    status: 'confirmed',
  });
}

// ====================== 辅助函数 ======================

/**
 * 构建方案生成的用户 Prompt
 */
function buildProposalUserPrompt(requirements, venueInfo, additionalNotes) {
  let prompt = `请为以下婚礼需求生成完整的方案：

## 新人需求
- 婚礼风格: ${requirements.style}
- 预算范围: ${requirements.budget.min}-${requirements.budget.max}元
- 宾客人数: 约${requirements.guestCount}人（约${Math.ceil(requirements.guestCount / 10)}桌）
- 场地类型: ${requirements.venueType}
- 偏好颜色: ${requirements.preferredColors.join('、') || '未明确'}
- 婚期: ${requirements.preferredDate || '未确定'}`;

  if (venueInfo) {
    prompt += `\n\n## 场地信息
- 场地名称: ${venueInfo.name}
- 宴会厅: ${venueInfo.hall}
- 容纳规模: ${venueInfo.capacity}
- 场地类型: ${venueInfo.type}
- 地址: ${venueInfo.address}`;
  }

  if (additionalNotes) {
    prompt += `\n\n## 补充说明
${additionalNotes}`;
  }

  prompt += `\n\n请返回完整的 JSON 格式方案。道具清单要基于${requirements.guestCount}人（约${Math.ceil(requirements.guestCount / 10)}桌）的规模来估算数量。`;

  return prompt;
}

/**
 * 方案数据规范化和补全
 */
function normalizeProposal(proposal, requirements) {
  if (!proposal.designConcept) {
    proposal.designConcept = `为新人精心设计的${requirements.style}婚礼方案，以${(requirements.preferredColors || []).join('、') || '经典'}为主色调，打造一场值得铭记的婚礼盛宴。`;
  }

  if (!proposal.propList || proposal.propList.length === 0) {
    proposal.propList = generateDefaultProps(requirements);
  }

  if (!proposal.costBreakdown || proposal.costBreakdown.length === 0) {
    const total = requirements.budget.max || 15000;
    proposal.costBreakdown = [
      { category: '场景布置', amount: Math.round(total * 0.35) },
      { category: '花艺设计', amount: Math.round(total * 0.2) },
      { category: '灯光音响', amount: Math.round(total * 0.15) },
      { category: '道具租赁', amount: Math.round(total * 0.15) },
      { category: '运输安装', amount: Math.round(total * 0.1) },
      { category: '其他', amount: Math.round(total * 0.05) },
    ];
  }

  if (!proposal.timeline || proposal.timeline.length === 0) {
    proposal.timeline = generateDefaultTimeline();
  }

  if (!proposal.riskNotes || proposal.riskNotes.length === 0) {
    proposal.riskNotes = ['建议提前确认场地档期和搭建时间窗口'];
  }

  if (!proposal.nextSteps || proposal.nextSteps.length === 0) {
    proposal.nextSteps = ['策划师审核方案', '与新人沟通方案细节', '确认后生成正式合同'];
  }

  return proposal;
}

/**
 * 降级方案生成（LLM 不可用时的规则引擎）
 */
function generateFallbackProposal(requirements, venueInfo) {
  const guestCount = requirements.guestCount || 100;
  const tableCount = Math.ceil(guestCount / 10);
  const style = requirements.style || '新中式';
  const colors = (requirements.preferredColors || ['金色', '白色']).join('、');

  const designConcept = `为新人精心打造的${style}婚礼方案。以${colors}为主色调，${requirements.venueType === '户外' ? '融入自然元素' : '营造温馨典雅氛围'}，为${tableCount}桌宾客呈现一场沉浸式的婚礼体验。`;

  const propList = generateDefaultProps(requirements);

  // 使用成本引擎计算真实成本和报价
  const costing = calculateFullCost(requirements, propList);

  const timeline = generateDefaultTimeline();

  const riskNotes = [];
  if (requirements.venueType === '户外') {
    riskNotes.push('户外婚礼需准备雨棚备用方案，建议提前关注天气预报');
    riskNotes.push('户外音响效果需专业调试，建议提前一天试音');
  }
  if (requirements.preferredDate && requirements.preferredDate.includes('6月') || requirements.preferredDate && requirements.preferredDate.includes('7月') || requirements.preferredDate && requirements.preferredDate.includes('8月')) {
    riskNotes.push('夏季婚礼注意防暑降温，建议为宾客准备扇子或冷饮');
  }
  riskNotes.push('建议至少提前7天确认最终方案和道具清单');

  return {
    designConcept,
    propList,
    customerPricing: costing.customerPricing,
    totalCost: costing.summary.customerPrice,
    plannerView: costing.plannerView,
    summary: costing.summary,
    timeline,
    riskNotes,
    nextSteps: [
      '策划师审核方案并调整个别项目',
      '与新人预约方案讲解（线上/线下）',
      '新人确认后生成正式合同和排期',
      '道具清单确认后启动备货和采购流程',
    ],
  };
}

/**
 * 生成默认道具清单
 */
function generateDefaultProps(requirements) {
  const tableCount = Math.ceil((requirements.guestCount || 100) / 10);
  const style = requirements.style || '新中式';
  const venueType = requirements.venueType || '室内';

  const props = [
    { name: '主背景桁架', category: '背景', quantity: 1, unit: '套', source: '自有', estimatedCost: 1500 },
    { name: '背景纱幔/绸缎', category: '背景', quantity: 3, unit: '组', source: '自有', estimatedCost: 800 },
    { name: '主桌花', category: '花艺', quantity: 1, unit: '个', source: '需采购', estimatedCost: 400 },
    { name: '餐桌花', category: '花艺', quantity: tableCount, unit: '个', source: '需采购', estimatedCost: 100 * tableCount },
    { name: '路引花', category: '花艺', quantity: 12, unit: '对', source: '需采购', estimatedCost: 600 },
    { name: '面光灯', category: '灯光', quantity: 6, unit: '组', source: '自有', estimatedCost: 1200 },
    { name: '氛围染色灯', category: '灯光', quantity: 12, unit: '组', source: '自有', estimatedCost: 800 },
    { name: '竹节椅', category: '桌椅', quantity: tableCount * 10, unit: '把', source: '自有', estimatedCost: 0 },
    { name: '圆桌(1.8m)', category: '桌椅', quantity: tableCount, unit: '张', source: '自有', estimatedCost: 0 },
    { name: '签到台', category: '装饰', quantity: 1, unit: '张', source: '自有', estimatedCost: 200 },
    { name: '迎宾牌', category: '装饰', quantity: 1, unit: '个', source: '需采购', estimatedCost: 300 },
  ];

  return props;
}

/**
 * 生成默认时间线
 */
function generateDefaultTimeline() {
  return [
    { daysBeforeWedding: 30, task: '最终方案确认和调整', assignee: '策划师' },
    { daysBeforeWedding: 21, task: '道具清单确认和备货', assignee: '工程部' },
    { daysBeforeWedding: 14, task: '花艺方案确定和花材预订', assignee: '花艺师' },
    { daysBeforeWedding: 7, task: '场地搭建方案确认（进撤场时间、电力、路线）', assignee: '策划师' },
    { daysBeforeWedding: 3, task: '道具出库检查和装车', assignee: '工程部' },
    { daysBeforeWedding: 1, task: '场地搭建（桁架、灯光、背景）', assignee: '工程部' },
    { daysBeforeWedding: 0, task: '婚礼当天：花艺到场、设备调试、迎宾', assignee: '全员' },
  ];
}
