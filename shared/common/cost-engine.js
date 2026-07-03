/**
 * 婚礼策划成本利润引擎 — cost-engine.js
 *
 * 核心原理：
 *   客户报价 = 硬成本 + 人工成本 + 运营分摊 + 利润
 *
 * 每项都有底价（成本端），最终生成客户可见报价和策划师可见成本明细两张表。
 * 客户看到的是透明的"钱花在哪"；策划师看到的是"赚了多少"。
 */

// ====================== 成本单价定义 ======================

/**
 * 硬成本单价表（2026年武汉市场行情）
 * 单位：元
 */
const COST_RATES = {

  // ── 道具类（每次使用成本） ──
  props: {
    // 自有道具 — 按折旧分摊到每次使用
    '桁架背景架': { ownPerUse: 150, rentMarket: 500,  unit: '组',   lifetime: 30 },
    '背景纱幔':     { ownPerUse: 40,  rentMarket: 150,  unit: '组',   lifetime: 15 },
    '竹节椅':       { ownPerUse: 3,   rentMarket: 8,    unit: '把',   lifetime: 40 },
    '圆桌':         { ownPerUse: 8,   rentMarket: 20,   unit: '张',   lifetime: 50 },
    '签到台':       { ownPerUse: 10,  rentMarket: 30,   unit: '张',   lifetime: 40 },
    '迎宾牌架':     { ownPerUse: 15,  rentMarket: 40,   unit: '个',   lifetime: 30 },
    '面光灯':       { ownPerUse: 25,  rentMarket: 80,   unit: '组',   lifetime: 25 },
    '染色灯':       { ownPerUse: 15,  rentMarket: 50,   unit: '组',   lifetime: 20 },
    '追光灯':       { ownPerUse: 30,  rentMarket: 100,  unit: '组',   lifetime: 20 },
    'LED屏幕':      { ownPerUse: 150, rentMarket: 600,  unit: '组',   lifetime: 20 },
    '音响设备':     { ownPerUse: 100, rentMarket: 400,  unit: '套',   lifetime: 20 },
    // 默认 — 未知道具按此估算
    '_default':     { ownPerUse: 20,  rentMarket: 60,   unit: '件',   lifetime: 25 },
  },

  // ── 花艺类 ──
  floral: {
    '主桌花':       { cost: 200, unit: '个', note: '含花材+人工' },
    '餐桌花':       { cost: 50,  unit: '个', note: '含花材+人工' },
    '路引花':       { cost: 30,  unit: '对', note: '含花材' },
    '手捧花':       { cost: 150, unit: '束', note: '含花材+扎花' },
    '拱门花艺':     { cost: 300, unit: '个', note: '含花材+架构' },
    '花艺补充':     { cost: 200, unit: '项', note: '胸花/手腕花/花瓣等' },
    '_default':     { cost: 80,  unit: '项', note: '花艺' },
  },

  // ── 运输类 ──
  transport: {
    '市内小面':     { cost: 150,  unit: '趟', note: '面包车，少量道具' },
    '市内中面':     { cost: 300,  unit: '趟', note: '依维柯/中面包' },
    '市内大车':     { cost: 600,  unit: '趟', note: '4.2m厢货' },
    '跨城附加':     { cost: 500,  unit: '趟', note: '武汉→周边城市' },
    '_default':     { cost: 300,  unit: '趟', note: '运输' },
  },

  // ── 人工类 ──
  labor: {
    '策划师':       { dailyRate: 800,  unit: '人天', note: '方案设计+客户沟通+现场跟进' },
    '工程主管':     { dailyRate: 600,  unit: '人天', note: '搭建指挥+技术' },
    '搭建工人':     { dailyRate: 400,  unit: '人天', note: '道具搭建/拆卸' },
    '花艺师':       { dailyRate: 600,  unit: '人天', note: '花艺布置' },
    '婚礼管家':     { dailyRate: 500,  unit: '人天', note: '现场协调' },
    '_default':     { dailyRate: 400,  unit: '人天', note: '人工' },
  },

  // ── 场地相关 ──
  venue: {
    '酒店押金':     { cost: 3000, unit: '次', note: '可退，但占用现金流' },
    '进场费':       { cost: 300,  unit: '次', note: '部分酒店收取' },
  },

  // ── 平台/技术成本 ──
  platform: {
    'LLM Token':     { ratePer1K: 0.002,  note: 'DeepSeek: ¥0.002/1K tokens' },
    '图片生成':       { ratePerImage: 0.5, note: '预计每次方案约生成2-4张参考图' },
    '云函数调用':     { ratePerCall: 0.0003, note: '微信云函数按量计费' },
    '云存储':         { monthlyRate: 5, note: '图片存储 + 数据库' },
  },

  // ── 其他 ──
  other: {
    '消耗品补充':   { rate: 0.02, note: '按硬成本2%计提：胶带/扎带/清洁等' },
    '保险':         { flat: 200, unit: '次', note: '活动责任险' },
    '意外损耗':     { rate: 0.03, note: '按硬成本3%计提：道具损坏/遗失' },
  },
};

// ====================== 人工配置计算 ======================

/**
 * 根据婚礼规模计算所需人工
 */
function calcLaborConfig(guestCount, venueType) {
  const tableCount = Math.ceil(guestCount / 10);
  const isOutdoor = venueType === '户外';

  // 基础配置：策划师全程 + 2个工人
  const labor = [
    { role: '策划师', days: 2, count: 1, note: '方案设计1天 + 现场1天' },
    { role: '工程主管', days: 1, count: 1, note: '搭建指挥' },
    { role: '婚礼管家', days: 1, count: 1, note: '当天现场跟进' },
  ];

  // 工人数量：每5桌多1个工人，最少2个
  const workerCount = Math.max(2, Math.ceil(tableCount / 5));
  labor.push({ role: '搭建工人', days: 1.5, count: workerCount, note: '搭建+拆卸（跨1.5天）' });

  // 户外需要更多人工
  if (isOutdoor) {
    labor.push({ role: '搭建工人', days: 1, count: 1, note: '户外加固+雨棚' });
  }

  // 花艺师（如果有花艺需求）
  labor.push({ role: '花艺师', days: 1, count: 1, note: '花艺布置' });

  return labor;
}

/**
 * 计算人工总成本
 */
function calcLaborCost(guestCount, venueType) {
  const config = calcLaborConfig(guestCount, venueType);
  let totalLaborCost = 0;
  const breakdown = [];

  config.forEach(item => {
    const rate = COST_RATES.labor[item.role] || COST_RATES.labor._default;
    const cost = rate.dailyRate * item.days * item.count;
    totalLaborCost += cost;
    breakdown.push({
      role: item.role,
      count: item.count,
      days: item.days,
      dailyRate: rate.dailyRate,
      subtotal: cost,
      note: item.note,
    });
  });

  return { total: totalLaborCost, breakdown };
}

// ====================== 道具成本计算 ======================

/**
 * 根据道具清单计算硬成本
 */
function calcPropCost(propList) {
  let totalPropCost = 0;
  const breakdown = [];

  (propList || []).forEach(prop => {
    const name = prop.name || '';
    const quantity = prop.quantity || 1;

    // 查找匹配的成本项
    let rate = COST_RATES.props[name];
    if (!rate) {
      // 模糊匹配
      for (const [key, val] of Object.entries(COST_RATES.props)) {
        if (key !== '_default' && name.includes(key)) {
          rate = val;
          break;
        }
      }
    }
    if (!rate) rate = COST_RATES.props._default;

    const unitCost = prop.source === '需租赁' ? rate.rentMarket : rate.ownPerUse;
    const subtotal = unitCost * quantity;

    totalPropCost += subtotal;
    breakdown.push({
      name,
      quantity,
      unit: rate.unit || '件',
      source: prop.source || '自有',
      unitCost,
      subtotal,
      note: prop.source === '需租赁' ? '外部租赁' : '自有折旧',
    });
  });

  return { total: totalPropCost, breakdown };
}

// ====================== 运输成本计算 ======================

function calcTransportCost(propList, guestCount, venueType) {
  const tableCount = Math.ceil(guestCount / 10);
  const totalItems = (propList || []).reduce((sum, p) => sum + (p.quantity || 0), 0);

  // 根据道具数量和桌数估算车型和趟数
  let vehicle = '市内中面';
  let trips = 2; // 最少两趟：送去+撤回

  if (totalItems > 80 || tableCount > 20) {
    vehicle = '市内大车';
    trips = 2;
  } else if (totalItems < 20 && tableCount < 8) {
    vehicle = '市内小面';
  }

  // 湖北二三线城市附加
  const rate = COST_RATES.transport[vehicle] || COST_RATES.transport._default;
  const transportCost = rate.cost * trips;

  return {
    total: transportCost,
    breakdown: [{
      vehicle,
      trips,
      costPerTrip: rate.cost,
      subtotal: transportCost,
      note: venueType === '户外' ? '户外场地需额外注意装卸路线' : '',
    }],
  };
}

// ====================== 花艺成本计算 ======================

function calcFloralCost(propList, guestCount) {
  let floralCost = 0;
  const breakdown = [];
  const tableCount = Math.ceil(guestCount / 10);

  // 从道具清单中提取花艺类
  (propList || []).forEach(prop => {
    if (prop.category === '花艺') {
      const name = prop.name || '';
      let rate = COST_RATES.floral[name];
      if (!rate) {
        for (const [key, val] of Object.entries(COST_RATES.floral)) {
          if (key !== '_default' && name.includes(key)) {
            rate = val;
            break;
          }
        }
      }
      if (!rate) rate = COST_RATES.floral._default;

      const cost = rate.cost * (prop.quantity || 1);
      floralCost += cost;
      breakdown.push({ name, quantity: prop.quantity, unitCost: rate.cost, subtotal: cost });
    }
  });

  // 如果没有花艺项，补充基础配置
  if (breakdown.length === 0) {
    const items = [
      { name: '主桌花', qty: 1 },
      { name: '餐桌花', qty: tableCount },
      { name: '路引花', qty: 12 },
      { name: '手捧花', qty: 2 },
      { name: '花艺补充', qty: 1 },
    ];
    items.forEach(item => {
      const rate = COST_RATES.floral[item.name] || COST_RATES.floral._default;
      const cost = rate.cost * item.qty;
      floralCost += cost;
      breakdown.push({ name: item.name, quantity: item.qty, unitCost: rate.cost, subtotal: cost });
    });
  }

  return { total: floralCost, breakdown };
}

// ====================== 平台成本计算 ======================

function calcPlatformCost() {
  // 单次方案生成预估 token 消耗 + 图片生成
  const llmCost = 0.5;    // 约250K tokens × ¥0.002/1K
  const imageCost = 2.0;  // 4张参考图 × ¥0.5
  const cloudCost = 0.5;  // 云函数调用 + 存储

  return {
    total: llmCost + imageCost + cloudCost,
    breakdown: [
      { item: 'AI对话+方案生成 (LLM Token)', cost: llmCost, note: 'DeepSeek API' },
      { item: '参考图生成 (×4)', cost: imageCost, note: '图片生成API' },
      { item: '云函数+云存储', cost: cloudCost, note: '微信云开发' },
    ],
  };
}

// ====================== 主计算函数 ======================

/**
 * 计算完整成本与报价
 *
 * @param {Object} requirements - 需求信息 { style, budget, guestCount, venueType, ... }
 * @param {Array}  propList      - AI生成的道具清单
 * @param {Object} options       - { profitRate: 0.35, platformFeeFlat: 10 }
 *
 * @returns {{
 *   cost: { 每项成本明细 },
 *   pricing: { 客户报价明细 },
 *   summary: { 总成本, 总收入, 毛利润, 利润率 },
 *   plannerView: { 策划师后台看到的数据 }
 * }}
 */
function calculateFullCost(requirements, propList, options = {}) {
  const guestCount = requirements.guestCount || 100;
  const venueType = requirements.venueType || '室内';
  const profitRate = options.profitRate || 0.35; // 默认35%利润率

  // ── 1. 各模块成本 ──
  const propCost = calcPropCost(propList);
  const floralCost = calcFloralCost(propList, guestCount);
  const laborCost = calcLaborCost(guestCount, venueType);
  const transportCost = calcTransportCost(propList, guestCount, venueType);
  const platformCost = calcPlatformCost();

  // ── 2. 其他成本 ──
  const hardCostSubtotal = propCost.total + floralCost.total;
  const consumables = Math.round(hardCostSubtotal * COST_RATES.other['消耗品补充'].rate); // 消耗品2%
  const insurance = COST_RATES.other['保险'].flat || 200;
  const contingency = Math.round(hardCostSubtotal * COST_RATES.other['意外损耗'].rate);   // 意外损耗3%

  // ── 3. 汇总 ──
  const totalHardCost = propCost.total + floralCost.total + consumables + insurance + contingency;
  const totalSoftCost = laborCost.total + transportCost.total + platformCost.total;
  const totalCost = totalHardCost + totalSoftCost;

  // ── 4. 客户看到的价格明细（简洁：只说他们关心的）──
  const customerPricing = {
    description: `${requirements.style || '婚礼'}场景设计 · ${guestCount}人${requirements.venueType || '室内'}婚礼`,
    items: [
      {
        icon: '🎪',
        title: '场景设计与道具',
        detail: `${propList.length}项道具布置 · ${venueType === '户外' ? '户外' : '宴会厅'}场景搭建`,
        amount: Math.round(propCost.total * 1.35),  // 道具成本 + 35%附加（灯光/装饰/利润）
      },
      {
        icon: '💐',
        title: '花艺设计',
        detail: `${floralCost.breakdown.length}项花艺布置`,
        amount: Math.round(floralCost.total * 1.35),
      },
      {
        icon: '👥',
        title: '策划与执行服务',
        detail: `${laborCost.breakdown.length}人专业团队 · 方案设计+现场搭建+全程跟进`,
        amount: Math.round(laborCost.total * 1.30),
      },
      {
        icon: '🚛',
        title: '运输与物流',
        detail: '道具运输及现场装卸',
        amount: transportCost.total,
      },
    ],
    // 用备注方式提示"还有其他小项已综合处理"
    note: '以上报价已包含灯光音响、消耗材料、意外保险等杂项费用',
  };
  // 客户报价总额（基于明细项累加）
  const customerPrice = customerPricing.items.reduce((sum, item) => sum + item.amount, 0);

  // ── 6. 策划师视图（全部成本明细 + 利润）──
  const plannerView = {
    // 道具成本明细
    propCostDetail: propCost.breakdown,
    totalPropCost: propCost.total,

    // 花艺成本明细
    floralCostDetail: floralCost.breakdown,
    totalFloralCost: floralCost.total,

    // 人工成本明细
    laborCostDetail: laborCost.breakdown,
    totalLaborCost: laborCost.total,

    // 运输成本明细
    transportCostDetail: transportCost.breakdown,
    totalTransportCost: transportCost.total,

    // 杂项成本（客户看不到的这些）
    hiddenCosts: {
      lighting: { label: '灯光音响', amount: Math.round(propCost.total * 0.15) },
      consumables: { label: '消耗品（胶带/扎带/清洁）', amount: consumables },
      insurance: { label: '活动责任险', amount: insurance },
      contingency: { label: '意外损耗准备金(3%)', amount: contingency },
      platform: { label: '平台技术成本（AI + 云服务）', amount: platformCost.total },
    },
    totalHiddenCost: Math.round(propCost.total * 0.15) + consumables + insurance + contingency + platformCost.total,

    // 平台技术成本明细
    platformCostDetail: platformCost.breakdown,
    totalPlatformCost: platformCost.total,

    // 核心汇总
    totalHardCost: propCost.total + floralCost.total + consumables + insurance + contingency,
    totalSoftCost: laborCost.total + transportCost.total + platformCost.total,
    totalCost: propCost.total + floralCost.total + consumables + insurance + contingency + laborCost.total + transportCost.total + platformCost.total,

    // 利润
    profit: customerPrice - (propCost.total + floralCost.total + consumables + insurance + contingency + laborCost.total + transportCost.total + platformCost.total),
    customerPrice,
    profitRate: ((customerPrice / (propCost.total + floralCost.total + consumables + insurance + contingency + laborCost.total + transportCost.total + platformCost.total) - 1) * 100).toFixed(1),
    profitMargin: (((customerPrice - (propCost.total + floralCost.total + consumables + insurance + contingency + laborCost.total + transportCost.total + platformCost.total)) / customerPrice) * 100).toFixed(1),

    // 建议报价区间
    suggestedRange: {
      minimum: Math.round((propCost.total + floralCost.total + consumables + insurance + contingency + laborCost.total + transportCost.total + platformCost.total) * 1.20),
      standard: customerPrice,
      premium: Math.round((propCost.total + floralCost.total + consumables + insurance + contingency + laborCost.total + transportCost.total + platformCost.total) * 1.55),
    },
  };

  return {
    // 客户看到：4项核心大类 + 一句备注
    customerPricing,
    // 策划师看到：全面成本+建议报价区间
    plannerView,
    // 快速摘要
    summary: {
      customerPrice,
      totalCost: plannerView.totalCost,
      profit: plannerView.profit,
      profitRate: plannerView.profitRate + '%',
      profitMargin: plannerView.profitMargin + '%',
    },
  };
}

/**
 * 快捷方法：从 requirements 估算（道具清单未生成时使用）
 */
function estimateQuick(requirements) {
  const guestCount = requirements.guestCount || 100;
  const budget = (requirements.budget && requirements.budget.max) || 15000;

  // 基于桌数估算道具清单
  const tableCount = Math.ceil(guestCount / 10);
  const estimatedProps = [
    { name: '主背景桁架', category: '背景', quantity: 1, source: '自有' },
    { name: '背景纱幔', category: '背景', quantity: 3, source: '自有' },
    { name: '竹节椅', category: '桌椅', quantity: tableCount * 10, source: '自有' },
    { name: '圆桌', category: '桌椅', quantity: tableCount, source: '自有' },
    { name: '面光灯', category: '灯光', quantity: 6, source: '自有' },
    { name: '染色灯', category: '灯光', quantity: 10, source: '自有' },
    { name: '签到台', category: '装饰', quantity: 1, source: '自有' },
    { name: '迎宾牌架', category: '装饰', quantity: 1, source: '需采购' },
  ];

  return calculateFullCost(requirements, estimatedProps);
}

module.exports = {
  COST_RATES,
  calculateFullCost,
  estimateQuick,
  calcPropCost,
  calcFloralCost,
  calcLaborCost,
  calcTransportCost,
  calcPlatformCost,
  calcLaborConfig,
};
