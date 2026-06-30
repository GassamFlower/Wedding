// 云函数：search
// 全局搜索
// actions: query
// 跨集合搜索并返回分类结果

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const { ok, fail, safe, notDeleted } = require('./utils');

exports.main = async (event) => {
  const { action, keyword } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    switch (action) {
      case 'query': return await searchAll(OPENID, keyword);
      default:
        return fail('未知操作: ' + action);
    }
  } catch (err) {
    return fail(err && err.message ? err.message : String(err));
  }
};

async function searchAll(openid, keyword) {
  if (!keyword || !String(keyword).trim()) return ok({ results: [] });
  const kw = String(keyword).trim();

  const baseScope = { _openid: openid, isDeleted: notDeleted(_.command) };

  const [ordersRes, propsRes, hotelsRes, contractsRes, todosRes] = await Promise.all([
    // 订单/客户搜索：按 clientName
    safe(db.collection('orders').where({
      ...baseScope,
      clientName: db.RegExp({ regexp: kw, options: 'i' }),
    }).limit(5).get(), { data: [] }),

    // 道具搜索：按 name
    safe(db.collection('props').where({
      ...baseScope,
      name: db.RegExp({ regexp: kw, options: 'i' }),
    }).limit(5).get(), { data: [] }),

    // 酒店搜索：按 name
    safe(db.collection('hotels').where({
      ...baseScope,
      name: db.RegExp({ regexp: kw, options: 'i' }),
    }).limit(5).get(), { data: [] }),

    // 合同搜索：按 services
    safe(db.collection('contracts').where({
      ...baseScope,
      services: db.RegExp({ regexp: kw, options: 'i' }),
    }).limit(5).get(), { data: [] }),

    // 待办搜索：按 text
    safe(db.collection('todos').where({
      ...baseScope,
      text: db.RegExp({ regexp: kw, options: 'i' }),
    }).limit(5).get(), { data: [] }),
  ]);

  const results = [];

  (ordersRes.data || []).forEach(o => {
    results.push({
      type: 'order',
      id: o._id,
      title: o.clientName || '',
      subtitle: [o.style, o.venueType].filter(Boolean).join(' · ') || '',
      extra: o.status || '',
      route: '/pages/order-detail/order-detail?id=' + o._id,
    });
  });

  (propsRes.data || []).forEach(p => {
    results.push({
      type: 'prop',
      id: p._id,
      title: p.name || '',
      subtitle: (p.category || '') + ' · ' + (p.total || 0) + (p.unit || '件'),
      extra: p.status || '',
      route: '/pages/props/props',
    });
  });

  (hotelsRes.data || []).forEach(h => {
    results.push({
      type: 'hotel',
      id: h._id,
      title: h.name || '',
      subtitle: h.hall || h.address || '',
      extra: h.status || '',
      route: '/pages/hotels/hotels',
    });
  });

  (contractsRes.data || []).forEach(c => {
    results.push({
      type: 'contract',
      id: c._id,
      title: c.services || '',
      subtitle: c.client || '',
      extra: c.paymentStatus || '',
      route: '/pages/contracts/contracts',
    });
  });

  (todosRes.data || []).forEach(t => {
    results.push({
      type: 'todo',
      id: t._id,
      title: t.text || '',
      subtitle: t.time || '',
      extra: t.done ? '已完成' : '',
      route: null, // todos are inline on dashboard
    });
  });

  return ok({ results });
}

