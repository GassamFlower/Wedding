/**
 * AI 会员体系 — membership.js
 *
 * 控制 AI 功能的使用权限和配额。
 * 策划师为专业效率工具付费，AI API 成本由会员费覆盖。
 *
 * 三层定价：
 *   Free     — ¥0/月    — 试用体验
 *   Pro      — ¥99/月   — 专业策划师
 *   Studio   — ¥299/月  — 工作室/团队
 */

// ====================== 会员等级定义 ======================

const TIERS = {
  free: {
    id: 'free',
    name: '免费体验',
    price: 0,
    color: '#B0A090',
    quota: {
      aiChatsPerMonth: 5,        // 每月5次AI对话
      proposalsPerMonth: 2,       // 每月2次方案生成
      renderingsPerMonth: 0,     // 不支持效果图生成
      knowledgeQueriesPerMonth: 20,
      sessionHistory: 3,         // 保留最近3天对话历史
      maxMessagesPerSession: 20,
    },
    features: [
      '每日5次AI设计对话',
      '每月2次方案生成',
      '精选案例浏览',
      '筹备清单工具',
    ],
    limitations: [
      '不含效果图生成',
      '对话历史仅保留3天',
      '方案无水印去除',
    ],
  },

  pro: {
    id: 'pro',
    name: '专业版',
    price: 99,                    // ¥99/月
    priceYearly: 699,            // ¥699/年 (省¥489)
    color: '#C4A882',
    quota: {
      aiChatsPerMonth: -1,       // -1 = 无限制
      proposalsPerMonth: 20,
      renderingsPerMonth: 10,
      knowledgeQueriesPerMonth: -1,
      sessionHistory: 30,        // 保留30天
      maxMessagesPerSession: 100,
    },
    features: [
      '无限次AI设计对话',
      '每月20次方案生成',
      '每月10次场景效果图',
      '成本利润引擎（策划师专享）',
      '方案历史30天保留',
      '无水印方案导出',
    ],
    recommended: true,
  },

  studio: {
    id: 'studio',
    name: '工作室版',
    price: 299,                   // ¥299/月
    priceYearly: 1999,           // ¥1,999/年 (省¥1,589)
    color: '#8A6A4A',
    quota: {
      aiChatsPerMonth: -1,
      proposalsPerMonth: -1,
      renderingsPerMonth: 50,
      knowledgeQueriesPerMonth: -1,
      sessionHistory: -1,        // 永久保留
      maxMessagesPerSession: -1, // 无限制
    },
    features: [
      '全部无限次使用',
      '每月50次场景效果图',
      '支持5个子账号',
      '知识库自定义（上传本地化内容）',
      '方案历史永久保留',
      '优先渲染队列',
      '专属客户经理',
    ],
    teamSize: 5,
  },
};

// ====================== 配额检查中间件 ======================

/**
 * 在 AI 云函数调用前检查配额
 *
 * 使用方式（在云函数入口）:
 *   const { checkQuota, recordUsage } = require('./membership');
 *   const quotaCheck = await checkQuota(openid, 'aiChat');
 *   if (!quotaCheck.allowed) return fail(quotaCheck.message);
 *   // ... 执行 AI 调用 ...
 *   await recordUsage(openid, 'aiChat');
 *
 * @param {string} openid - 用户 openid
 * @param {string} action  - 操作类型: aiChat, proposal, rendering, knowledgeQuery
 * @param {object} db      - 云数据库实例
 * @returns {{ allowed: boolean, message?: string, tier?: string, remaining?: number }}
 */
async function checkQuota(openid, action, db) {
  const _ = db.command;

  // 获取用户会员信息
  const usersCol = db.collection('users');
  let user;
  try {
    const res = await usersCol.where({ _openid: openid }).limit(1).get();
    user = res.data && res.data[0];
  } catch (e) {
    // 用户记录不存在 = 自动视为免费用户
    user = null;
  }

  const tierId = (user && user.membershipTier) || 'free';
  const tier = TIERS[tierId] || TIERS.free;

  // 检查是否过期
  if (tierId !== 'free' && user && user.membershipExpiresAt) {
    if (new Date(user.membershipExpiresAt) < new Date()) {
      // 已过期，降级为免费
      return {
        allowed: true,
        tier: 'free',
        downgraded: true,
        message: '会员已过期，已切换为免费体验模式。续费请前往个人中心。',
        remaining: TIERS.free.quota[getQuotaKey(action)],
      };
    }
  }

  // 无限制
  const quotaKey = getQuotaKey(action);
  const limit = tier.quota[quotaKey];
  if (limit === -1) {
    return { allowed: true, tier: tierId, remaining: -1 };
  }

  // 检查本月使用量
  const usageCol = db.collection('ai_usage');
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const countRes = await usageCol
    .where({
      _openid: openid,
      action,
      createdAt: _.gte(monthStart),
    })
    .count()
    .catch(() => ({ total: 0 }));

  const used = countRes.total || 0;
  const remaining = limit - used;

  if (remaining <= 0) {
    // 推荐升级
    const upgradeMsg = tierId === 'free'
      ? `本月${getActionName(action)}次数已用完（${used}/${limit}）。\n\n💡 升级到专业版（¥99/月）即可无限使用AI设计对话+每月20次方案生成。`
      : `本月${getActionName(action)}次数已用完（${used}/${limit}）。\n\n💡 升级到工作室版（¥299/月）即可无限制使用全部功能。`;

    return {
      allowed: false,
      tier: tierId,
      used,
      limit,
      remaining: 0,
      message: upgradeMsg,
      upgradeSuggestion: tierId === 'free' ? 'pro' : 'studio',
    };
  }

  return { allowed: true, tier: tierId, used, limit, remaining };
}

/**
 * 记录一次 AI 使用
 */
async function recordUsage(openid, action, metadata, db) {
  try {
    const usageCol = db.collection('ai_usage');
    await usageCol.add({
      data: {
        _openid: openid,
        action,
        metadata: metadata || {},
        createdAt: new Date(),
      },
    });
  } catch (e) {
    // 记录失败不阻断业务流程
    console.error('recordUsage error:', e);
  }
}

// ====================== 辅助 ======================

function getQuotaKey(action) {
  const map = {
    'aiChat': 'aiChatsPerMonth',
    'proposal': 'proposalsPerMonth',
    'rendering': 'renderingsPerMonth',
    'knowledgeQuery': 'knowledgeQueriesPerMonth',
  };
  return map[action] || 'aiChatsPerMonth';
}

function getActionName(action) {
  const map = {
    'aiChat': 'AI设计对话',
    'proposal': '方案生成',
    'rendering': '效果图生成',
    'knowledgeQuery': '知识库查询',
  };
  return map[action] || 'AI功能';
}

/**
 * 获取用户当前会员状态
 */
async function getMembershipStatus(openid, db) {
  const usersCol = db.collection('users');
  let user;
  try {
    const res = await usersCol.where({ _openid: openid }).limit(1).get();
    user = res.data && res.data[0];
  } catch (e) {
    user = null;
  }

  const tierId = (user && user.membershipTier) || 'free';
  const tier = TIERS[tierId] || TIERS.free;

  // 本月各操作使用量
  const usageCol = db.collection('ai_usage');
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const _ = db.command;

  const [chatCount, proposalCount, renderingCount, knowledgeCount] = await Promise.all([
    usageCol.where({ _openid: openid, action: 'aiChat', createdAt: _.gte(monthStart) }).count().catch(() => ({ total: 0 })),
    usageCol.where({ _openid: openid, action: 'proposal', createdAt: _.gte(monthStart) }).count().catch(() => ({ total: 0 })),
    usageCol.where({ _openid: openid, action: 'rendering', createdAt: _.gte(monthStart) }).count().catch(() => ({ total: 0 })),
    usageCol.where({ _openid: openid, action: 'knowledgeQuery', createdAt: _.gte(monthStart) }).count().catch(() => ({ total: 0 })),
  ]);

  const usage = {
    aiChat: { used: chatCount.total || 0, limit: tier.quota.aiChatsPerMonth },
    proposal: { used: proposalCount.total || 0, limit: tier.quota.proposalsPerMonth },
    rendering: { used: renderingCount.total || 0, limit: tier.quota.renderingsPerMonth },
    knowledgeQuery: { used: knowledgeCount.total || 0, limit: tier.quota.knowledgeQueriesPerMonth },
  };

  return {
    tier: tierId,
    tierName: tier.name,
    tierColor: tier.color,
    expiresAt: (user && user.membershipExpiresAt) || null,
    isExpired: tierId !== 'free' && user && user.membershipExpiresAt && new Date(user.membershipExpiresAt) < new Date(),
    usage,
    features: tier.features,
    limitations: tier.limitations || [],
    nextTiers: getNextTiers(tierId),
  };
}

/**
 * 获取可升级的会员等级
 */
function getNextTiers(currentTierId) {
  const order = ['free', 'pro', 'studio'];
  const currentIdx = order.indexOf(currentTierId);
  return order
    .slice(currentIdx + 1)
    .map(id => ({
      id: TIERS[id].id,
      name: TIERS[id].name,
      price: TIERS[id].price,
      priceYearly: TIERS[id].priceYearly,
      color: TIERS[id].color,
      features: TIERS[id].features,
      recommended: TIERS[id].recommended,
      teamSize: TIERS[id].teamSize,
    }));
}

module.exports = {
  TIERS,
  checkQuota,
  recordUsage,
  getMembershipStatus,
  getNextTiers,
};
