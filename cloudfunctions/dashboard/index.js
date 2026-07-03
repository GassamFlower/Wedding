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

// 检查集合是否存在
async function checkMissingCollections(collectionNames) {
  const missing = [];
  for (const name of collectionNames) {
    try {
      await db.collection(name).limit(1).get();
    } catch (e) {
      if (e.errCode === -502005 || (e.message && e.message.includes('not exist'))) {
        missing.push(name);
      }
    }
  }
  return missing;
}

async function getSummary(openid, event = {}) {
  // 检查必要的集合是否存在，不存在则返回空数据
  const collectionsToCheck = ['orders', 'todos', 'contracts', 'leads'];
  const missingCols = await checkMissingCollections(collectionsToCheck);
  
  if (missingCols.length > 0) {
    console.log('[dashboard] missing collections:', missingCols);
    // 返回空数据，让前端使用 DEMO 数据
    return ok({
      monthOrders: 0,
      activeOrders: 0,
      monthIncome: '0',
      orders: [],
      todos: [],
      pendingLeads: 0,
      overdueLeads: 0,
      pendingBalance: 0,
      pendingBalanceCount: 0,
    });
  }

  const ordersCol = db.collection('orders');
  const todosCol = db.collection('todos');
  const contractsCol = db.collection('contracts');
  const leadsCol = db.collection('leads');

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const overdueMs = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // 测试数据（isSeed: true）所有人可见，用户自创数据按 _openid 隔离
  const ownerFilter = _.or([{ _openid: openid }, { isSeed: true }]);
  const notDel = notDeleted(_.command);

  const [monthOrdersRes, activeOrdersRes, monthIncomeAgg, recentOrdersRes, todosRes, pendingLeadsRes, overdueLeadsRes, pendingPaymentsAgg] = await Promise.all([
    safe(ordersCol.where(ownerFilter).where({
      isDeleted: notDel,
      weddingDate: _.gte(monthStart).and(_.lt(monthEnd)),
    }).count(), { total: 0 }),

    safe(ordersCol.where(ownerFilter).where({
      isDeleted: notDel,
      status: _.neq('已完成'),
    }).count(), { total: 0 }),

    safe(
      contractsCol.aggregate()
        .match(_.and([
          ownerFilter,
          { createdAt: _.gte(monthStart).and(_.lt(monthEnd)) },
        ]))
        .group({ _id: null, total: db.command.aggregate.sum('$paidAmount') })
        .end(),
      { list: [] }
    ),

    safe(ordersCol.where(ownerFilter).where({
      isDeleted: notDel,
    }).orderBy('weddingDate', 'desc').limit(event.limit || 5).get(), { data: [] }),

    safe(todosCol.where(ownerFilter).where({
      isDeleted: notDel,
      scene: _.in(['dashboard', null, undefined]),
    }).orderBy('createdAt', 'desc').limit(8).get(), { data: [] }),

    // 待跟进线索数
    safe(leadsCol.where(ownerFilter).where({
      status: '待跟进',
    }).count(), { total: 0 }),

    // 24h未跟进线索数
    safe(leadsCol.where(ownerFilter).where({
      status: '待跟进',
      createdAt: _.lt(overdueMs),
    }).count(), { total: 0 }),

    // 待收尾款
    safe(
      contractsCol.aggregate()
        .match(_.and([
          ownerFilter,
          { paymentStatus: '部分付款', isDeleted: notDel },
        ]))
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
