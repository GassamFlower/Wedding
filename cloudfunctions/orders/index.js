// 云函数：orders
// 婚礼订单管理
// actions: list / recent / detail / create / update / remove / setStatus

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const {
  ok, fail, safe, requireFields, assertOwnership,
  validateAmount, validateEnum, validateDate, NOT_DELETED, DELETED, notDeleted,
  formatMoney, formatMonthDay, formatYMD,
  badgeOf, statusClassOf, takeShort, avatarClassOf,
} = require('./utils');

const COL = 'orders';

exports.main = async (event) => {
  const { action } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    switch (action) {
      case 'list':      return await listOrders(OPENID, event);
      case 'recent':    return await recentOrders(OPENID, event);
      case 'detail':    return await detailOrder(OPENID, event);
      case 'create':    return await createOrder(OPENID, event);
      case 'update':    return await updateOrder(OPENID, event);
      case 'remove':    return await removeOrder(OPENID, event);
      case 'setStatus': return await setOrderStatus(OPENID, event);
      default:
        return fail('未知操作: ' + action);
    }
  } catch (err) {
    return fail(err && err.message ? err.message : String(err));
  }
};

// ---------- 业务方法 ----------

async function listOrders(openid, { keyword = '', status = '', page = 1, pageSize = 20 } = {}) {
  const col = db.collection(COL);
  const where = { _openid: openid, isDeleted: notDeleted(_.command) };

  if (status === 'active') where.status = _.neq('已完成');
  else if (status === 'done') where.status = '已完成';
  else if (status && status !== 'all') where.status = status;

  if (keyword) where.clientName = db.RegExp({ regexp: keyword, options: 'i' });

  const { skip } = require('./utils').normalizePage({ page, pageSize });
  const [listRes, countRes] = await Promise.all([
    col.where(where).orderBy('weddingDate', 'desc').skip(skip).limit(pageSize).get(),
    col.where(where).count(),
  ]);

  console.log('[listOrders] openid:', openid, 'where:', JSON.stringify(where), 'total:', countRes.total, 'listLen:', listRes.data.length);

  return ok({
    total: countRes.total,
    page,
    pageSize,
    list: listRes.data.map(toCardItem),
  });
}

async function recentOrders(openid, { limit = 5 } = {}) {
  const col = db.collection(COL);
  const now = new Date();
  // 近期：未完成 或 婚礼日期 >= 30 天前
  const minDate = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  const res = await col
    .where({ _openid: openid, isDeleted: notDeleted(_.command), weddingDate: _.gte(minDate) })
    .orderBy('weddingDate', 'asc')
    .limit(limit)
    .get();
  return ok({ list: res.data.map(toCardItem) });
}

async function detailOrder(openid, { id } = {}) {
  if (!id) return fail('缺少 id');
  const col = db.collection(COL);
  const res = await col.doc(id).get().catch(() => ({ data: null }));
  if (!res.data) return fail('订单不存在');
  if (res.data._openid && res.data._openid !== openid) return fail('无权访问');

  const o = res.data;
  return ok({
    id: o._id,
    couple: o.clientName || '',
    date: formatYMD(o.weddingDate),
    style: [o.style, o.venueType].filter(Boolean).join(' · '),
    venue: o.venue || '',
    planner: o.planner || '大喜主理人',
    budget: formatMoney(o.budget),
    paid: formatMoney(o.paid),
    balance: formatMoney(o.balance != null ? o.balance : (Number(o.budget || 0) - Number(o.paid || 0))),
    status: o.status || '筹备中',
    progress: o.progress || 0,
    desc: o.description || '',
    hotelInfo: o.hotelInfo || null,
    costItems: (o.costItems || []).map(c => ({
      name: c.name,
      amount: formatMoney(c.amount),
    })),
    propList: (o.propList || []).map(p => ({
      name: p.name,
      source: p.source || '自有',
      status: p.status || '待出库',
      statusColor: colorOfPropStatus(p.status),
    })),
    raw: o,
  });
}

async function createOrder(openid, event = {}) {
  const data = event.data;
  console.log('[createOrder] event:', JSON.stringify(event));
  console.log('[createOrder] data:', JSON.stringify(data));
  console.log('[createOrder] data.clientName:', JSON.stringify(data && data.clientName));
  
  const err = requireFields(data, ['clientName']);
  if (err) return fail(err);

  // 校验金额（仅当字段存在时校验）
  if (data.budget !== undefined && data.budget !== null && data.budget !== '') {
    const budget = validateAmount(data.budget);
    if (budget === null) return fail('预算金额不合法');
  }
  if (data.paid !== undefined && data.paid !== null && data.paid !== '') {
    const paid = validateAmount(data.paid);
    if (paid === null) return fail('已付金额不合法');
  }

  // 校验日期 - 先解析中文格式（如 "10月15号"、"6月15日"），再验证
  if (data.weddingDate) {
    let dateVal = data.weddingDate;
    // 兼容中文格式："10月15号" / "10月15日" / "6月15"
    const m = String(dateVal).match(/(\d{1,2})月(\d{1,2})/);
    if (m) {
      const year = new Date().getFullYear();
      dateVal = new Date(year, parseInt(m[1]) - 1, parseInt(m[2]));
    }
    const d = validateDate(dateVal, 2024, 2030);
    if (!d) return fail('婚礼日期不合法');
    data.weddingDate = d;
  }

  const col = db.collection(COL);
  const now = new Date();
  const doc = normalizeOrder(data);
  const res = await col.add({
    data: {
      _openid: openid,
      ...doc,
      isDeleted: NOT_DELETED,
      createdAt: now,
      updatedAt: now,
    },
  });
  return ok({ _id: res._id });
}

async function updateOrder(openid, { id, data } = {}) {
  if (!id) return fail('缺少 id');
  if (!data) return fail('缺少 data');
  const col = db.collection(COL);
  const doc = await col.doc(id).get().catch(() => ({ data: null }));
  if (!doc.data) return fail('订单不存在');
  if (doc.data._openid && doc.data._openid !== openid) return fail('无权访问');

  const update = normalizeOrder(data, true);
  await col.doc(id).update({
    data: { ...update, updatedAt: new Date() },
  });
  return ok({ _id: id });
}

async function removeOrder(openid, { id } = {}) {
  const owner = await assertOwnership(db, COL, id, openid);
  if (!owner.ok) return fail(owner.msg);
  await db.collection(COL).doc(id).update({
    data: { isDeleted: DELETED, updatedAt: new Date() },
  });
  return ok({ _id: id });
}

async function setOrderStatus(openid, { id, status, progress } = {}) {
  if (!id || !status) return fail('缺少参数');
  const col = db.collection(COL);
  const doc = await col.doc(id).get().catch(() => ({ data: null }));
  if (!doc.data) return fail('订单不存在');
  if (doc.data._openid && doc.data._openid !== openid) return fail('无权访问');
  const upd = { status, updatedAt: new Date() };
  if (typeof progress === 'number') upd.progress = progress;
  await col.doc(id).update({ data: upd });
  return ok({ _id: id });
}

// ---------- helpers ----------

function toCardItem(o) {
  return {
    id: o._id,
    client: o.clientName || '',
    name: o.clientName || '',
    date: formatMonthDay(o.weddingDate),
    venue: o.venue || '',
    style: o.style || '',
    tags: [o.style, o.venueType].filter(Boolean),
    amount: formatMoney(o.budget),
    status: o.status || '筹备中',
    badgeClass: badgeOf(o.status),
    statusClass: statusClassOf(o.status),
    short: takeShort(o.clientName),
    avatarClass: avatarClassOf(o.clientName),
  };
}

function normalizeOrder(data, isUpdate = false) {
  const out = {};
  const fields = [
    'clientName', 'style', 'venue', 'venueType', 'planner',
    'budget', 'paid', 'balance', 'status', 'progress',
    'description', 'costItems', 'propList', 'hotelInfo',
  ];
  fields.forEach(k => {
    if (data[k] !== undefined) out[k] = data[k];
  });
  if (data.weddingDate !== undefined) {
    if (!data.weddingDate) {
      out.weddingDate = null;
    } else if (data.weddingDate instanceof Date) {
      out.weddingDate = data.weddingDate;
    } else {
      // 兼容前端 "6月15日" / "6月15" / "2026-06-15" 等格式
      const m = String(data.weddingDate).match(/(\d{1,2})月(\d{1,2})/);
      if (m) {
        const year = new Date().getFullYear();
        out.weddingDate = new Date(year, parseInt(m[1]) - 1, parseInt(m[2]));
      } else {
        const d = new Date(data.weddingDate);
        out.weddingDate = isNaN(d.getTime()) ? null : d;
      }
    }
  }
  // 自动结算尾款
  if (!isUpdate && out.budget != null && out.paid != null && out.balance == null) {
    out.balance = Number(out.budget || 0) - Number(out.paid || 0);
  }
  return out;
}

function colorOfPropStatus(status) {
  if (!status) return '#c67a00';
  if (status.includes('已出库') || status.includes('已归还')) return '#2e7d32';
  if (status.includes('待') || status.includes('准备')) return '#c67a00';
  if (status.includes('缺') || status.includes('损')) return '#b71c1c';
  return '#666';
}
