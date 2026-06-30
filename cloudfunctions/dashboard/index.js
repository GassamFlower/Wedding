// 云函数：dashboard
// 工作台首页（策划师）数据汇总
// actions: summary

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const {
  formatMoney, formatMonthDay,
  badgeOf, statusClassOf, takeShort, avatarClassOf,
  ok, fail, safe, NOT_DELETED, DELETED, notDeleted,
} = require('./utils');

exports.main = async (event) => {
  const { action } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    switch (action) {
      case 'summary':
        return await getSummary(OPENID, event);
      default:
        return fail('未知操作: ' + action);
    }
  } catch (err) {
    return fail(err && err.message ? err.message : String(err));
  }
};

async function getSummary(openid, event = {}) {
  const ordersCol = db.collection('orders');
  const todosCol = db.collection('todos');
  const contractsCol = db.collection('contracts');
  const leadsCol = db.collection('leads');

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const overdueMs = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const baseScope = { _openid: openid, isDeleted: notDeleted(_.command) };

  const [monthOrdersRes, activeOrdersRes, monthIncomeAgg, recentOrdersRes, todosRes, pendingLeadsRes, overdueLeadsRes, pendingPaymentsAgg] = await Promise.all([
    safe(ordersCol.where({
      ...baseScope,
      weddingDate: _.gte(monthStart).and(_.lt(monthEnd)),
    }).count(), { total: 0 }),

    safe(ordersCol.where({
      ...baseScope,
      status: _.neq('已完成'),
    }).count(), { total: 0 }),

    safe(
      contractsCol.aggregate()
        .match({ _openid: openid, createdAt: _.gte(monthStart).and(_.lt(monthEnd)) })
        .group({ _id: null, total: db.command.aggregate.sum('$paidAmount') })
        .end(),
      { list: [] }
    ),

    safe(ordersCol.where(baseScope).orderBy('weddingDate', 'desc').limit(event.limit || 5).get(), { data: [] }),

    safe(todosCol.where({ ...baseScope, scene: _.in(['dashboard', null, undefined]) }).orderBy('createdAt', 'desc').limit(8).get(), { data: [] }),

    // 待跟进线索数
    safe(leadsCol.where({ _openid: openid, status: '待跟进' }).count(), { total: 0 }),

    // 24h未跟进线索数
    safe(leadsCol.where({ _openid: openid, status: '待跟进', createdAt: _.lt(overdueMs) }).count(), { total: 0 }),

    // 待收尾款
    safe(
      contractsCol.aggregate()
        .match({ _openid: openid, paymentStatus: '部分付款', isDeleted: notDeleted(_.command) })
        .group({ _id: null, total: _.sum('$balanceAmount'), count: _.sum(1) })
        .end(),
      { list: [] }
    ),
  ]);

  const monthIncome = (monthIncomeAgg.list && monthIncomeAgg.list[0]) ? (monthIncomeAgg.list[0].total || 0) : 0;
  const pendingPayment = (pendingPaymentsAgg.list && pendingPaymentsAgg.list[0]) ? pendingPaymentsAgg.list[0] : { total: 0, count: 0 };

  const orders = (recentOrdersRes.data || []).map(o => ({
    id: o._id,
    client: o.clientName || '',
    date: formatMonthDay(o.weddingDate),
    venue: o.venue || '',
    tags: [o.style, o.venueType].filter(Boolean),
    amount: formatMoney(o.budget),
    status: o.status || '筹备中',
    badgeClass: badgeOf(o.status),
    statusClass: statusClassOf(o.status),
    short: takeShort(o.clientName),
    avatarClass: avatarClassOf(o.clientName),
  }));

  const todos = (todosRes.data || []).map(t => ({
    id: t._id,
    text: t.text || '',
    time: t.time || '',
    done: !!t.done,
    priority: t.priority || '中',
  }));

  return ok({
    monthOrders: monthOrdersRes.total || 0,
    activeOrders: activeOrdersRes.total || 0,
    monthIncome: formatMoney(monthIncome),
    orders,
    todos,
    pendingLeads: pendingLeadsRes.total || 0,
    overdueLeads: overdueLeadsRes.total || 0,
    pendingBalance: pendingPayment.total || 0,
    pendingBalanceCount: pendingPayment.count || 0,
  });
}
