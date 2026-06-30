// 云函数：hotels
// 酒店管理
// actions: summary / list / detail / create / update / remove

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const { ok, fail, safe, formatMoney, takeShort, avatarClassOf, statusOfHotel, requireFields, assertOwnership, validatePhone, NOT_DELETED, DELETED, notDeleted } = require('./utils');

const COL = 'hotels';

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
      default:
        return fail('未知操作: ' + action);
    }
  } catch (err) {
    return fail(err && err.message ? err.message : String(err));
  }
};

// ---------- summary ----------

async function summary(openid) {
  const baseScope = { _openid: openid, isDeleted: notDeleted(_.command) };
  const hotelCol = db.collection(COL);
  const orderCol = db.collection('orders');
  const todoCol = db.collection('todos');

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // 押金信息汇总：来自 orders.hotelInfo
  const ordersRes = await safe(
    orderCol.where({ _openid: openid, isDeleted: notDeleted(_.command) }).limit(500).get(),
    { data: [] }
  );

  let activeDeposits = 0;
  let depositTotal = 0;
  let depositPoolUsed = 0;
  (ordersRes.data || []).forEach(o => {
    const hi = o.hotelInfo;
    if (hi && hi.deposit) {
      const amount = Number(hi.deposit) || 0;
      depositTotal += amount;
      if (hi.depositStatus !== '已退') {
        activeDeposits += 1;
        depositPoolUsed += amount;
      }
    }
  });

  const [totalHotelsRes, inUseRes, hotelListRes, todosRes] = await Promise.all([
    safe(hotelCol.where(baseScope).count(), { total: 0 }),
    safe(orderCol.where({ _openid: openid, weddingDate: _.gte(monthStart).and(_.lt(monthEnd)) }).count(), { total: 0 }),
    safe(hotelCol.where(baseScope).orderBy('createdAt', 'desc').limit(50).get(), { data: [] }),
    safe(todoCol.where({ _openid: openid, scene: 'hotels' }).orderBy('createdAt', 'desc').limit(8).get(), { data: [] }),
  ]);

  const depositPoolTotal = 20000;
  const depositPoolRemain = Math.max(0, depositPoolTotal - depositPoolUsed);

  return ok({
    totalHotels: totalHotelsRes.total || 0,
    inUse: inUseRes.total || 0,
    activeDeposits,
    depositTotal: formatMoney(depositTotal),
    depositPoolTotal: formatMoney(depositPoolTotal),
    depositPoolUsed: formatMoney(depositPoolUsed),
    depositPoolRemain: formatMoney(depositPoolRemain),
    hotels: (hotelListRes.data || []).map(toCard),
    todos: (todosRes.data || []).map(t => ({
      id: t._id, text: t.text || '', time: t.time || '', done: !!t.done,
    })),
  });
}

// ---------- list ----------

async function list(openid, { keyword = '', status = '', page = 1, pageSize = 50 } = {}) {
  const col = db.collection(COL);
  const where = { _openid: openid, isDeleted: notDeleted(_.command) };
  if (status) where.status = status;
  if (keyword) where.name = db.RegExp({ regexp: keyword, options: 'i' });

  const res = await col.where(where).orderBy('createdAt', 'desc')
    .skip((page - 1) * pageSize).limit(pageSize).get();
  return ok({ list: res.data.map(toCard) });
}

// ---------- detail ----------

async function detail(openid, { id } = {}) {
  if (!id) return fail('缺少 id');
  const res = await db.collection(COL).doc(id).get().catch(() => ({ data: null }));
  if (!res.data) return fail('酒店不存在');
  if (res.data._openid && res.data._openid !== openid) return fail('无权访问');
  return ok(toCard(res.data, true));
}

// ---------- create/update/remove ----------

async function create(openid, { data } = {}) {
  const err = requireFields(data, ['name']);
  if (err) return fail(err);
  if (data.contactPhone && !validatePhone(data.contactPhone)) return fail('联系电话格式不合法');
  const now = new Date();
  const doc = normalize(data);
  const res = await db.collection(COL).add({
    data: { _openid: openid, ...doc, isDeleted: NOT_DELETED, createdAt: now, updatedAt: now },
  });
  return ok({ _id: res._id });
}

async function update(openid, { id, data } = {}) {
  if (!id || !data) return fail('缺少参数');
  const doc = await db.collection(COL).doc(id).get().catch(() => ({ data: null }));
  if (!doc.data) return fail('酒店不存在');
  if (doc.data._openid && doc.data._openid !== openid) return fail('无权访问');
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

// ---------- helpers ----------

function normalize(data, isUpdate = false) {
  const out = {};
  [
    'name', 'hall', 'address', 'contact', 'contactPhone',
    'capacity', 'depositStandard', 'loadInTime', 'loadOutTime',
    'equipment', 'parking', 'status', 'notes',
    // Phase 4 场地勘测字段
    'ceilingHeight', 'rigging', 'powerSocket', 'loadingPath',
    'pitfalls', 'regionTag', 'customTags', 'darkRoom',
  ].forEach(k => {
    if (data[k] !== undefined) out[k] = data[k];
  });
  return out;
}

function toCard(h, withDetail = false) {
  const st = statusOfHotel(h.status);
  const base = {
    id: h._id,
    name: h.name || '',
    short: takeShort(h.name),
    avatarClass: avatarClassOf(h.name),
    address: h.address || h.hall || '',
    capacity: h.capacity || '',
    deposit: formatMoney(h.depositStandard),
    loadIn: h.loadInTime || '',
    loadOut: h.loadOutTime || '',
    contact: h.contact || '',
    contactPhone: h.contactPhone || '',
    statusText: st.text,
    statusClass: st.cls,
    statusBadge: st.badge,
  };
  if (withDetail) {
    base.equipment = h.equipment || '';
    base.parking = h.parking || '';
    base.notes = h.notes || '';
    base.hall = h.hall || '';
    base.depositStandard = h.depositStandard || 0;
    // Phase 4 场地勘测
    base.ceilingHeight = h.ceilingHeight || '';
    base.rigging = h.rigging || '';
    base.powerSocket = h.powerSocket || '';
    base.loadingPath = h.loadingPath || '';
    base.pitfalls = h.pitfalls || '';
    base.regionTag = h.regionTag || '';
    base.customTags = Array.isArray(h.customTags) ? h.customTags : [];
    base.darkRoom = !!(h.darkRoom);
  }
  return base;
}
