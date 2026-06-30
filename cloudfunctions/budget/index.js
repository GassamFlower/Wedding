// 云函数：budget
// 准新人预算（基于自己名下的 orders 聚合）
// actions: summary

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const { ok, fail, safe, formatMoney, NOT_DELETED, DELETED, notDeleted } = require('./utils');

// 与前端 budget_gift.js 中 items 对齐
const ITEM_META = [
  { id: 1, icon: 'star',  name: '场景布置', desc: '主舞台+迎宾区',     match: ['场景', '布置', '舞台', '迎宾'] },
  { id: 2, icon: 'flower',name: '花艺',     desc: '手捧花+桌花+舞台', match: ['花艺', '花'] },
  { id: 3, icon: 'light', name: '灯光音响', desc: '灯光设备+音响',     match: ['灯光', '音响'] },
  { id: 4, icon: 'box',   name: '运输安装', desc: '道具运输+搭建',     match: ['运输', '安装', '搭建'] },
  { id: 5, icon: 'gift',  name: '其他',     desc: '杂项支出',          match: [] },
];

exports.main = async (event) => {
  const { action } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    switch (action) {
      case 'summary': return await summary(OPENID, event);
      default:
        return fail('未知操作: ' + action);
    }
  } catch (err) {
    return fail(err && err.message ? err.message : String(err));
  }
};

async function summary(openid, { orderId } = {}) {
  const col = db.collection('orders');
  // 默认拿用户名下首张订单作为新人婚礼数据来源
  const ordersRes = orderId
    ? await safe(col.doc(orderId).get(), { data: null })
    : await safe(col.where({ _openid: openid, isDeleted: notDeleted(_.command) }).orderBy('createdAt', 'desc').limit(1).get(), { data: [] });

  const order = orderId
    ? (ordersRes.data || null)
    : (ordersRes.data && ordersRes.data[0]);

  if (!order) {
    // 没有订单：返回零数据 + 默认项目结构
    return ok({
      totalBudget: '0',
      spent: '0',
      remain: '0',
      items: ITEM_META.map(m => ({ id: m.id, icon: m.icon, name: m.name, desc: m.desc, amount: '0' })),
    });
  }

  const total = Number(order.budget || 0);
  const paid = Number(order.paid || 0);
  const balance = Math.max(0, total - paid);

  // 按 costItems 分桶到 5 个固定类目
  const buckets = {};
  ITEM_META.forEach(m => { buckets[m.id] = 0; });

  (order.costItems || []).forEach(ci => {
    const name = String(ci.name || '');
    let matchedId = ITEM_META[ITEM_META.length - 1].id; // 默认其他
    for (const m of ITEM_META) {
      if (m.match.some(k => name.includes(k))) {
        matchedId = m.id;
        break;
      }
    }
    buckets[matchedId] += Number(ci.amount || 0);
  });

  return ok({
    totalBudget: formatMoney(total),
    spent: formatMoney(paid),
    remain: formatMoney(balance),
    items: ITEM_META.map(m => ({
      id: m.id,
      icon: m.icon,
      name: m.name,
      desc: m.desc,
      amount: formatMoney(buckets[m.id]),
    })),
  });
}
