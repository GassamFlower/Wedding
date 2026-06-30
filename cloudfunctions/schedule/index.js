// 云函数：schedule
// 排期看板：婚礼 + 酒店占用
// actions: list

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const { ok, fail, safe, formatMoney, formatMonthDay, badgeOf, statusClassOf, takeShort, avatarClassOf, NOT_DELETED, DELETED, notDeleted } = require('./utils');

exports.main = async (event) => {
  const { action } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    switch (action) {
      case 'list': return await list(OPENID, event);
      case 'checkConflict': return await checkConflict(OPENID, event);
      default:
        return fail('未知操作: ' + action);
    }
  } catch (err) {
    return fail(err && err.message ? err.message : String(err));
  }
};

// list: { rangeDays = 90 } 默认返回最近 -7 天 ~ +90 天
async function list(openid, { rangeDays = 90 } = {}) {
  const now = new Date();
  const start = new Date(now.getTime() - 7 * 86400000);
  const end = new Date(now.getTime() + rangeDays * 86400000);

  const ordersRes = await safe(
    db.collection('orders')
      .where({ _openid: openid, isDeleted: notDeleted(_.command), weddingDate: _.gte(start).and(_.lt(end)) })
      .orderBy('weddingDate', 'asc')
      .limit(50)
      .get(),
    { data: [] }
  );

  // 酒店排期：从 orders.hotelInfo 反向聚合（同时支持 hotels 集合做基础数据）
  const hotelsRes = await safe(
    db.collection('hotels').where({ _openid: openid, isDeleted: notDeleted(_.command) }).limit(100).get(),
    { data: [] }
  );
  const hotelMap = {};
  (hotelsRes.data || []).forEach(h => { hotelMap[h._id] = h; });

  const weddings = (ordersRes.data || []).map(o => ({
    id: o._id,
    client: o.clientName || '',
    date: formatMonthDay(o.weddingDate),
    venue: o.venue || '',
    style: o.style || '',
    status: o.status || '筹备中',
    badgeClass: badgeOf(o.status),
  }));

  const hotelUsage = (ordersRes.data || [])
    .filter(o => o.hotelInfo || o.venue)
    .map(o => {
      const hi = o.hotelInfo || {};
      const hotel = hi.hotelId ? hotelMap[hi.hotelId] : null;
      const name = (hotel && hotel.name) || o.venue || '';
      const isDone = o.status && o.status.includes('完成');
      return {
        id: o._id,
        short: takeShort(name),
        avatarClass: avatarClassOf(name),
        name,
        date: (isDone ? '' : '') + formatMonthDay(o.weddingDate) + '使用',
        deposit: formatMoney(hi.deposit || 0),
        depositStatus: hi.depositStatus || '未缴',
        contact: (hotel && hotel.contact) || '',
        loadIn: hi.loadIn || (hotel && hotel.loadInTime) || '',
        status: isDone ? '已结算' : '使用中',
        statusClass: isDone ? 'done' : 'progress',
        badgeClass: isDone ? 'badge-done' : 'badge-progress',
      };
    });

  return ok({
    weddings,
    hotels: hotelUsage,
  });
}

// checkConflict: 检测道具在同日是否被多个订单占用
// 输入: { propId, weddingDate, excludeOrderId? }
// 输出: { conflicts: [{ orderId, clientName, venue }] }
async function checkConflict(openid, { propId, weddingDate, excludeOrderId }) {
  if (!propId || !weddingDate) return fail('缺少 propId 或 weddingDate');

  const where = {
    _openid: openid,
    weddingDate: new Date(weddingDate),
    'propList.propId': propId,
    isDeleted: notDeleted(_.command),
    status: _.nin(['已完成', '已关闭', '已取消']),
  };
  if (excludeOrderId) {
    where._id = _.neq(excludeOrderId);
  }

  const res = await safe(
    db.collection('orders').where(where).limit(20).get(),
    { data: [] }
  );

  const conflicts = (res.data || []).map(o => ({
    orderId: o._id,
    clientName: o.clientName || '',
    venue: o.venue || '',
    status: o.status || '',
  }));

  return ok({ conflicts, hasConflict: conflicts.length > 0 });
}
