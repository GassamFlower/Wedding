// 云函数：contracts
// 合同/费用管理
// actions: summary / list / detail / create / update / remove / pay

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

const { ok, fail, safe, formatMoney, formatYMD, requireFields, assertOwnership, validateAmount, validateEnum, validateDate, NOT_DELETED, DELETED, notDeleted } = require('./utils');

const COL = 'contracts';

exports.main = async (event) => {
  const { action } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    switch (action) {
      case 'summary': return await summary(OPENID);
      case 'list':    return await list(OPENID, event);
      case 'detail':  return await detail(OPENID, event);
      case 'create':  return await create(OPENID, event);
      case 'update':  return await update(OPENID, event);
      case 'remove':  return await remove(OPENID, event);
      case 'pay':     return await pay(OPENID, event);
      default:
        return fail('未知操作: ' + action);
    }
  } catch (err) {
    return fail(err && err.message ? err.message : String(err));
  }
};

// ---------- summary ----------

async function summary(openid) {
  const col = db.collection(COL);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const notDel = notDeleted(_);
  const baseScope = { _openid: openid, isDeleted: notDel };

  const [monthInRes, pendingRes, monthCostRes, listRes] = await Promise.all([
    // 本月收入 = 本月创建合同的 paidAmount 之和
    safe(col.aggregate()
      .match({ ...baseScope, createdAt: _.gte(monthStart).and(_.lt(monthEnd)) })
      .group({ _id: null, total: $.sum('$paidAmount') })
      .end(), { list: [] }),

    // 待收尾款 = 所有未结清合同 balanceAmount 之和
    safe(col.aggregate()
      .match({ ...baseScope, paymentStatus: _.neq('已结清') })
      .group({ _id: null, total: $.sum('$balanceAmount') })
      .end(), { list: [] }),

    // 本月支出（如有 expenses 字段，则求和；这里作为预留接口）
    safe(col.aggregate()
      .match({ ...baseScope, createdAt: _.gte(monthStart).and(_.lt(monthEnd)) })
      .group({ _id: null, total: $.sum('$expenseAmount') })
      .end(), { list: [] }),

    safe(col.where(baseScope).orderBy('createdAt', 'desc').limit(20).get(), { data: [] }),
  ]);

  const monthTotal = pick(monthInRes);
  const pendingTotal = pick(pendingRes);
  const monthCost = pick(monthCostRes);

  return ok({
    monthTotal: formatMoney(monthTotal),
    pendingTotal: formatMoney(pendingTotal),
    monthCost: formatMoney(monthCost),
    contracts: (listRes.data || []).map(toCard),
  });
}

function pick(r) {
  return (r.list && r.list[0]) ? (r.list[0].total || 0) : 0;
}

// ---------- list ----------

async function list(openid, { keyword = '', status = '', page = 1, pageSize = 30 } = {}) {
  const col = db.collection(COL);
  const where = { _openid: openid, isDeleted: notDeleted(_) };
  if (status) where.paymentStatus = status;
  if (keyword) where.services = db.RegExp({ regexp: keyword, options: 'i' });

  const { skip } = require('./utils').normalizePage({ page, pageSize });
  const res = await col.where(where).orderBy('createdAt', 'desc')
    .skip(skip).limit(pageSize).get();
  return ok({ list: res.data.map(toCard) });
}

// ---------- detail ----------

async function detail(openid, { id } = {}) {
  if (!id) return fail('缺少 id');
  const res = await db.collection(COL).doc(id).get().catch(() => ({ data: null }));
  if (!res.data) return fail('合同不存在');
  if (res.data._openid && res.data._openid !== openid) return fail('无权访问');
  return ok(toCard(res.data, true));
}

// ---------- CRUD ----------

async function create(openid, { data } = {}) {
  const err = requireFields(data, ['services']);
  if (err) return fail(err);

  // 校验金额（仅当字段存在时校验）
  if (data.totalAmount !== undefined && data.totalAmount !== null && data.totalAmount !== '') {
    const total = validateAmount(data.totalAmount);
    if (total === null) return fail('合同金额不合法');
  }
  if (data.paidAmount !== undefined && data.paidAmount !== null && data.paidAmount !== '') {
    const paid = validateAmount(data.paidAmount);
    if (paid === null) return fail('已付金额不合法');
  }

  if (data.orderDate) {
    const d = validateDate(data.orderDate, 2024, 2030);
    if (!d) return fail('合同日期不合法');
    data.orderDate = d;
  }

  const now = new Date();
  const doc = normalize(data);
  const res = await db.collection(COL).add({
    data: { _openid: openid, ...doc, isDeleted: NOT_DELETED, createdAt: now, updatedAt: now },
  });
  return ok({ _id: res._id });
}

async function update(openid, { id, data } = {}) {
  const owner = await assertOwnership(db, COL, id, openid);
  if (!owner.ok) return fail(owner.msg);
  if (data.totalAmount !== undefined && data.totalAmount !== null && data.totalAmount !== '' && validateAmount(data.totalAmount) === null) return fail('合同金额不合法');
  if (data.paidAmount !== undefined && data.paidAmount !== null && data.paidAmount !== '' && validateAmount(data.paidAmount) === null) return fail('已付金额不合法');
  const upd = normalize(data, true);
  upd.updatedAt = new Date();
  await db.collection(COL).doc(id).update({ data: upd });
  return ok({ _id: id });
}

async function remove(openid, { id } = {}) {
  const owner = await assertOwnership(db, COL, id, openid);
  if (!owner.ok) return fail(owner.msg);
  await db.collection(COL).doc(id).update({
    data: { isDeleted: DELETED, updatedAt: new Date() },
  });
  return ok({ _id: id });
}

// 收款：{ id, amount }
async function pay(openid, { id, amount } = {}) {
  const payAmount = validateAmount(amount);
  if (!id || payAmount === null || payAmount === 0) return fail('缺少收款金额');
  const ref = db.collection(COL).doc(id);
  const doc = await ref.get().catch(() => ({ data: null }));
  if (!doc.data) return fail('合同不存在');
  if (doc.data._openid && doc.data._openid !== openid) return fail('无权访问');

  const paidAmount = Number(doc.data.paidAmount || 0) + Number(amount);
  const totalAmount = Number(doc.data.totalAmount || 0);
  const balanceAmount = Math.max(0, totalAmount - paidAmount);
  const paymentStatus = balanceAmount === 0 ? '已结清' : '部分付款';

  await ref.update({
    data: { paidAmount, balanceAmount, paymentStatus, updatedAt: new Date() },
  });
  return ok({ _id: id, paidAmount, balanceAmount, paymentStatus });
}

// ---------- helpers ----------

function normalize(data, isUpdate = false) {
  const out = {};
  ['orderId', 'services', 'paymentStatus', 'items'].forEach(k => {
    if (data[k] !== undefined) out[k] = data[k];
  });
  ['totalAmount', 'paidAmount', 'balanceAmount', 'expenseAmount'].forEach(k => {
    if (data[k] !== undefined) out[k] = Number(data[k]) || 0;
  });
  if (data.client !== undefined) out.client = data.client; // 兼容字段
  if (data.orderDate !== undefined) {
    out.orderDate = data.orderDate ? new Date(data.orderDate) : null;
  }
  // 自动计算 balanceAmount
  if (!isUpdate && out.totalAmount != null && out.paidAmount != null && out.balanceAmount == null) {
    out.balanceAmount = Math.max(0, out.totalAmount - out.paidAmount);
    out.paymentStatus = out.paymentStatus || (out.balanceAmount === 0 ? '已结清' : '部分付款');
  }
  return out;
}

function toCard(c, withDetail = false) {
  const base = {
    id: c._id,
    client: c.client || '',
    date: formatYMD(c.orderDate),
    services: c.services || '',
    total: formatMoney(c.totalAmount),
    paid: formatMoney(c.paidAmount),
    balance: formatMoney(c.balanceAmount != null ? c.balanceAmount : (Number(c.totalAmount || 0) - Number(c.paidAmount || 0))),
    paymentStatus: c.paymentStatus || '部分付款',
  };
  if (withDetail) {
    base.orderId = c.orderId || '';
    base.items = (c.items || []).map(it => ({
      name: it.name,
      amount: formatMoney(it.amount),
    }));
    base.expenseAmount = formatMoney(c.expenseAmount);
  }
  return base;
}
