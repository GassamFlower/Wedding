// 云函数：ai-chat (设计顾问 Agent)
// 新人与AI对话描述梦想婚礼 → 提取结构化需求 → 引导方案生成
// actions: chat, history, sessions, extract

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const {
  chat: llmChat,
  extractJSON,
  buildDesignAdvisorPrompt,
} = require('./llm');

const {
  ok, fail, safe, requireFields,
  normalizePage, safeStr,
} = require('./utils');

const {
  checkQuota,
  recordUsage,
  getMembershipStatus,
} = require('./membership');

exports.main = async (event, context) => {
  const { action } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    switch (action) {
      case 'chat':
        return await handleChat(OPENID, event);
      case 'history':
        return await getHistory(OPENID, event);
      case 'sessions':
        return await listSessions(OPENID, event);
      case 'extract':
        return await extractRequirements(OPENID, event);
      case 'membership':
        return await membershipStatus(OPENID);
      default:
        return fail('未知操作: ' + action);
    }
  } catch (err) {
    console.error('ai-chat error:', err);
    return fail(err && err.message ? err.message : String(err));
  }
};

// ====================== 对话处理 ======================

/**
 * 处理一轮对话
 * 1. 获取或创建会话
 * 2. 将用户消息追加到会话
 * 3. 调用 LLM 生成回复
 * 4. 保存回复到会话
 * 5. 尝试提取结构化需求
 */
async function handleChat(openid, event) {
  const { sessionId, message, role } = event;

  if (!message || !message.trim()) {
    return fail('消息不能为空');
  }

  // ── 会员配额检查 ──
  const quotaCheck = await checkQuota(openid, 'aiChat', db);
  if (!quotaCheck.allowed) {
    return fail(quotaCheck.message, -2); // -2 = 配额不足
  }

  const userRole = role || 'newbie'; // newbie | planner
  const sessionsCol = db.collection('design_sessions');

  // 获取或创建会话
  let session;
  if (sessionId) {
    const res = await sessionsCol.doc(sessionId).get().catch(() => null);
    if (res && res.data) {
      session = res.data;
    }
  }

  if (!session) {
    // 创建新会话
    const newSession = {
      _openid: openid,
      role: userRole,
      status: 'chatting',
      extracted: {
        style: '',
        budget: { min: 0, max: 0 },
        guestCount: 0,
        venueType: '',
        preferredColors: [],
        preferredDate: '',
      },
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    };
    const createRes = await sessionsCol.add({ data: newSession });
    session = { ...newSession, _id: createRes._id };
  }

  // 构建对话历史
  const messages = (session.messages || []).slice(-20); // 保留最近20条
  const conversationHistory = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({ role: m.role, content: m.content }));

  // 添加用户消息
  conversationHistory.push({ role: 'user', content: message.trim() });

  // 构建 System Prompt
  const systemPrompt = buildSystemPrompt(userRole, session.extracted);

  // 调用 LLM
  let reply;
  try {
    const result = await llmChat(systemPrompt, conversationHistory);
    reply = result.content;
  } catch (llmErr) {
    console.error('LLM call failed:', llmErr);
    // LLM 不可用时的优雅降级
    reply = generateFallbackReply(message, session.extracted);
  }

  // 保存消息到会话
  const userMsg = {
    role: 'user',
    content: message.trim(),
    type: 'text',
    timestamp: new Date(),
  };
  const assistantMsg = {
    role: 'assistant',
    content: reply,
    type: 'text',
    timestamp: new Date(),
  };

  const updatedMessages = [...messages, userMsg, assistantMsg];

  // 尝试提取结构化需求
  const extracted = await tryExtract(openid, session.extracted, conversationHistory, reply);

  // 更新会话
  await sessionsCol.doc(session._id).update({
    data: {
      messages: updatedMessages,
      extracted,
      status: determineStatus(extracted, updatedMessages.length),
      updatedAt: new Date(),
    },
  });

  // ── 记录使用量 ──
  await recordUsage(openid, 'aiChat', { sessionId: session._id, messageLen: message.length }, db);

  return ok({
    sessionId: session._id,
    reply: {
      role: 'assistant',
      content: reply,
      type: 'text',
      timestamp: assistantMsg.timestamp,
    },
    extracted,
    status: determineStatus(extracted, updatedMessages.length),
    // 当提取到足够信息时，提示可生成方案
    canGenerateProposal: isReadyForProposal(extracted),
    // 会员信息
    membership: {
      tier: quotaCheck.tier,
      remaining: quotaCheck.remaining,
    },
  });
}

// ====================== 历史记录 ======================

async function getHistory(openid, event) {
  const { sessionId } = event;
  if (!sessionId) return fail('缺少 sessionId');

  const sessionsCol = db.collection('design_sessions');
  try {
    const res = await sessionsCol.doc(sessionId).get();
    if (!res.data) return fail('会话不存在');
    if (res.data._openid !== openid) return fail('无权访问', 403);

    return ok({
      sessionId: res.data._id,
      messages: res.data.messages || [],
      extracted: res.data.extracted || {},
      status: res.data.status || 'chatting',
    });
  } catch (e) {
    return fail('会话不存在');
  }
}

async function listSessions(openid, event) {
  const { page, pageSize } = normalizePage(event);
  const sessionsCol = db.collection('design_sessions');

  const [countRes, listRes] = await Promise.all([
    safe(sessionsCol.where({ _openid: openid, isDeleted: false }).count(), { total: 0 }),
    safe(
      sessionsCol
        .where({ _openid: openid, isDeleted: false })
        .field({ _id: true, status: true, extracted: true, updatedAt: true, 'messages.0.content': true })
        .orderBy('updatedAt', 'desc')
        .skip(pageSize * (page - 1))
        .limit(pageSize)
        .get(),
      { data: [] }
    ),
  ]);

  const sessions = (listRes.data || []).map(s => ({
    id: s._id,
    status: s.status,
    extracted: s.extracted,
    updatedAt: s.updatedAt,
    // 用第一条用户消息作为会话标题
    title: getSessionTitle(s),
    messageCount: (s.messages || []).length,
  }));

  return ok({ sessions, total: countRes.total, page, pageSize });
}

// ====================== 需求提取 ======================

async function extractRequirements(openid, event) {
  const { sessionId } = event;
  if (!sessionId) return fail('缺少 sessionId');

  const sessionsCol = db.collection('design_sessions');
  const res = await sessionsCol.doc(sessionId).get().catch(() => null);
  if (!res || !res.data) return fail('会话不存在');
  if (res.data._openid !== openid) return fail('无权访问', 403);

  const session = res.data;
  const messages = (session.messages || []).filter(m => m.role === 'user' || m.role === 'assistant');
  const conversationHistory = messages.map(m => ({ role: m.role, content: m.content }));

  // 调用 LLM 专门做结构化提取
  const extractionPrompt = `你是一个信息提取助手。从以下对话中提取新人的婚礼需求信息，返回严格的 JSON。

格式:
{
  "style": "风格偏好（新中式|韩式简约|森系|现代轻奢|复古田园|古典欧式|未明确）",
  "budget": { "min": 最小预算数字, "max": 最大预算数字 },
  "guestCount": 预估宾客数量,
  "venueType": "场地偏好（室内|户外|都可以|未明确）",
  "preferredColors": ["颜色1", "颜色2"],
  "preferredDate": "偏好的婚期或月份",
  "specificVenue": "提到的具体酒店或场地名称",
  "keyPoints": ["新人关注的关键点"],
  "completeness": "需求完整度（0-1的小数）",
  "missingInfo": ["还缺少的信息"]
}

只返回 JSON，不要包含任何其他文字。`;

  try {
    const extracted = await extractJSON(extractionPrompt, [
      ...conversationHistory,
      { role: 'user', content: '请从以上对话中提取结构化的婚礼需求信息。' }
    ]);

    // 更新会话
    await sessionsCol.doc(sessionId).update({
      data: { extracted, updatedAt: new Date() },
    });

    return ok(extracted);
  } catch (e) {
    // 提取失败时返回已有的提取数据
    return ok(session.extracted || {});
  }
}

// ====================== 会员状态 ======================

async function membershipStatus(openid) {
  const status = await getMembershipStatus(openid, db);
  return ok(status);
}

// ====================== 辅助函数 ======================

/**
 * 构建角色适配的 System Prompt
 */
function buildSystemPrompt(role, extracted) {
  const basePrompt = buildDesignAdvisorPrompt();

  if (role === 'planner') {
    return basePrompt + `

## 策划师模式
当前用户是婚礼策划师本人。你可以：
- 直接讨论方案细节、道具选择、场地技术参数
- 使用更专业的术语
- 帮助策划师完善方案，然后分享给新人`;
  }

  // 如果已有部分提取信息，追加上下文
  if (extracted && (extracted.style || extracted.preferredDate)) {
    let contextAddon = '\n\n## 当前已了解的需求\n';
    if (extracted.style) contextAddon += `- 风格偏好: ${extracted.style}\n`;
    if (extracted.budget && extracted.budget.max) contextAddon += `- 预算: ${extracted.budget.min}-${extracted.budget.max}元\n`;
    if (extracted.guestCount) contextAddon += `- 宾客: 约${extracted.guestCount}人\n`;
    if (extracted.venueType) contextAddon += `- 场地: ${extracted.venueType}\n`;
    if (extracted.preferredColors && extracted.preferredColors.length) contextAddon += `- 偏好颜色: ${extracted.preferredColors.join('、')}\n`;
    contextAddon += '\n请基于以上已有信息继续对话，不要重复询问已知的偏好。';
    return basePrompt + contextAddon;
  }

  return basePrompt;
}

/**
 * 尝试从对话中渐进式提取需求（不额外调用 LLM 的低成本判断）
 */
function tryExtract(openid, existing, history, latestReply) {
  // 简单规则提取 + 保留已有提取结果
  const extracted = { ...existing };
  const allText = history.map(m => m.content).join(' ') + ' ' + latestReply;

  // 风格检测
  if (!extracted.style) {
    const stylePatterns = {
      '新中式': /新中式|中式|中国风|传统|红色.*金色|红.*金/,
      '韩式简约': /韩式|简约|韩风|清新|浅粉|白色.*绿/,
      '森系': /森系|森林|自然|绿色|户外.*自然|原木/,
      '现代轻奢': /现代|轻奢|简约.*大气|香槟|大理石/,
      '复古田园': /复古|田园|乡村|波西米亚|橘色|暖黄/,
      '古典欧式': /欧式|古典|奢华|水晶|罗马|金色.*白色/,
    };
    for (const [style, pattern] of Object.entries(stylePatterns)) {
      if (pattern.test(allText)) {
        extracted.style = style;
        break;
      }
    }
  }

  // 场地类型检测
  if (!extracted.venueType || extracted.venueType === '') {
    if (/户外|草坪|花园|湖边|露天|室外/.test(allText)) extracted.venueType = '户外';
    else if (/酒店|宴会厅|室内|大厅/.test(allText)) extracted.venueType = '室内';
  }

  // 颜色检测
  if (!extracted.preferredColors || extracted.preferredColors.length === 0) {
    const colorMap = {
      '红色': /红色|大红|酒红|玫红/,
      '金色': /金色|金色|香槟金|暖金/,
      '白色': /白色|纯白|象牙白/,
      '粉色': /粉色|浅粉|淡粉|粉红/,
      '绿色': /绿色|森绿|墨绿|浅绿/,
      '蓝色': /蓝色|宝蓝|蒂芙尼蓝|雾霾蓝/,
      '紫色': /紫色|薰衣草紫|浅紫/,
    };
    extracted.preferredColors = [];
    for (const [color, pattern] of Object.entries(colorMap)) {
      if (pattern.test(allText)) extracted.preferredColors.push(color);
    }
  }

  // 预算检测
  if (!extracted.budget || extracted.budget.max === 0) {
    const budgetMatch = allText.match(/(\d[\d,.]*)\s*[万元]\s*(?:左右|以内|以上|预算)?/);
    if (budgetMatch) {
      let amount = parseFloat(budgetMatch[1].replace(/,/g, ''));
      if (allText.includes('万')) amount *= 10000;
      extracted.budget = { min: Math.round(amount * 0.7), max: Math.round(amount * 1.3) };
    }
  }

  // 人数检测
  if (!extracted.guestCount) {
    const guestMatch = allText.match(/(\d+)\s*(?:桌|人|位|宾客)/);
    if (guestMatch) {
      const num = parseInt(guestMatch[1]);
      extracted.guestCount = allText.includes('桌') ? num * 10 : num;
    }
  }

  return extracted;
}

/**
 * 判断对话状态
 */
function determineStatus(extracted, messageCount) {
  if (isReadyForProposal(extracted)) return 'proposal_ready';
  if (messageCount >= 4) return 'designing';
  return 'chatting';
}

/**
 * 判断是否有足够信息生成方案
 */
function isReadyForProposal(extracted) {
  if (!extracted) return false;
  let score = 0;
  if (extracted.style && extracted.style !== '未明确') score += 2;
  if (extracted.budget && extracted.budget.max > 0) score += 2;
  if (extracted.guestCount > 0) score += 1;
  if (extracted.venueType && extracted.venueType !== '都可以') score += 1;
  if (extracted.preferredColors && extracted.preferredColors.length > 0) score += 1;
  return score >= 4;
}

/**
 * 获取会话标题
 */
function getSessionTitle(session) {
  if (!session) return '新对话';
  // 用风格+预算作为标题
  const parts = [];
  if (session.extracted && session.extracted.style) parts.push(session.extracted.style);
  if (session.extracted && session.extracted.guestCount) parts.push(session.extracted.guestCount + '人');
  if (session.extracted && session.extracted.venueType) parts.push(session.extracted.venueType);
  if (parts.length === 0) {
    // 取第一条用户消息的前15字
    const firstMsg = (session.messages || []).find(m => m.role === 'user');
    if (firstMsg) return safeStr(firstMsg.content, 15) + '...';
    return '新对话';
  }
  return parts.join(' · ');
}

// ====================== 降级回复 ======================

/**
 * LLM 不可用时，用规则引擎生成基础回复
 */
function generateFallbackReply(message, extracted) {
  const q = message.trim();

  // 问候检测
  if (/你好|嗨|hello|hi|在吗/.test(q.toLowerCase())) {
    return '你好呀！👋 欢迎来到大喜的日子。我是你的婚礼设计顾问，帮我了解一下你们的想法——你们梦想中的婚礼是什么样的呢？比如喜欢室内还是户外、有没有偏好的风格？';
  }

  // 风格相关
  if (/风格|中式|韩式|森系|欧式|现代|复古|田园/.test(q)) {
    let reply = '这是一个很棒的风格方向！';
    if (/中式/.test(q)) reply += '\n\n新中式婚礼融合了传统韵味和现代审美，以红色和金色为主，特别适合在宴会厅举办。武汉很多新人选择这种风格。\n\n你们有看中的酒店场地吗？';
    else if (/韩式/.test(q)) reply += '\n\n韩式简约风以清新自然著称，白色+浅粉+绿色的搭配很受年轻新人喜欢。这种风格对花艺要求比较高。\n\n你们的婚礼大概是什么时候呢？';
    else if (/森系|自然/.test(q)) reply += '\n\n森系婚礼在武汉的东湖、光谷周边非常适合，绿植+原木色的组合，户外草坪效果特别好！不过户外婚礼需要备用雨棚方案哦。\n\n预算方面你们大概是怎么考虑的？';
    else reply += '\n\n可以多说说你们喜欢的元素吗？比如颜色、氛围感这些细节。';
    return reply;
  }

  // 预算相关
  if (/预算|价格|费用|多少钱|报价/.test(q)) {
    return '在武汉，婚礼场景布置的预算大概分几个档位：\n\n💰 **经济型** 5,000-8,000元（简约布置+基础道具）\n💰 **标准型** 8,000-15,000元（完整场景+花艺+灯光）\n💰 **品质型** 15,000-25,000元（定制设计+高端道具）\n\n具体还要看场地大小、风格复杂度和道具需求。你们大概的预算是多少呢？我可以帮你们做更精准的规划。';
  }

  // 场地相关
  if (/场地|酒店|户外|草坪|宴会厅/.test(q)) {
    return '武汉适合办婚礼的场地很多呢！\n\n🏨 **万达瑞华**、**光谷希尔顿**、**洲际酒店** 都是热门的室内场地\n🌿 喜欢户外的话，**东湖宾馆**和**光谷的草坪场地**都很棒\n\n你们是在汉口、武昌还是光谷这边？场地这块心里有大致方向吗？';
  }

  // 默认回复
  const hasInfo = extracted && (extracted.style || (extracted.budget && extracted.budget.max > 0));
  if (hasInfo) {
    return '好的，我记下了！基于你们的需求，我觉得可以开始整理初步的方案了。要不要现在帮你生成一份方案看看效果？';
  }
  return '明白了！为了帮你设计最合适的婚礼方案，我还想多了解一点：\n\n💒 你们偏好**室内酒店**还是**户外草坪**？\n🎨 有没有特别喜欢的**风格或颜色**？\n💰 大概的**预算范围**是怎样的？\n\n不用全回答，想到什么说什么就好~';
}
