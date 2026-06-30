// 云函数：props
// 道具管理
// actions: summary / list / categories / detail / create / update / remove / adjust

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

const { ok, fail, safe, requireFields, assertOwnership, validateAmount, NOT_DELETED, DELETED, notDeleted } = require('./utils');

const COL = 'props';

// 分类元数据（key/icon/name）- 与前端 props.wxml 对齐
const CATEGORY_META = [
  { key: 'bg',        icon: 'box',   name: '背景架/桁架' },
  { key: 'flower',    icon: 'flower',name: '花艺道具' },
  { key: 'light',     icon: 'light', name: '灯光设备' },
  { key: 'furniture', icon: 'box',   name: '桌椅/摆件' },
  { key: 'deco',      icon: 'star',  name: '装饰小品' },
];

exports.main = async (event) => {
  const { action } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    switch (action) {
      case 'summary':    return await summary(OPENID);
      case 'list':       return await list(OPENID, event);
      case 'categories': return await categories(OPENID);
      case 'detail':     return await detail(OPENID, event);
      case 'create':     return await create(OPENID, event);
      case 'update':     return await update(OPENID, event);
      case 'remove':     return await remove(OPENID, event);
      case 'adjust':     return await adjust(OPENID, event);
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
  const all = await safe(col.where({ _openid: openid, isDeleted: notDeleted(_) }).limit(1000).get(), { data: [] });
  const data = all.data || [];

  let total = 0, inUse = 0, available = 0, needBuy = 0;
  data.forEach(p => {
    total   += Number(p.total || 0);
    inUse   += Number(p.inUse || 0);
    available += Number(p.available != null ? p.available : (Number(p.total || 0) - Number(p.inUse || 0)));
    if (p.status === '需采购') needBuy += 1;
  });

  const cats = await aggregateCategories(openid);

  // 同时拉取道具相关 todos（scene=props）
  const todosRes = await safe(
    db.collection('todos').where({ _openid: openid, scene: 'props' }).orderBy('createdAt', 'desc').limit(8).get(),
    { data: [] }
  );

  return ok({
    totalProps: total,
    inUse,
    available,
    needBuy,
    categories: cats,
    todos: (todosRes.data || []).map(t => ({
      id: t._id, text: t.text || '', time: t.time || '', done: !!t.done,
    })),
  });
}

// ---------- list ----------

async function list(openid, { category = '', status = '', keyword = '', page = 1, pageSize = 50 } = {}) {
  const col = db.collection(COL);
  const where = { _openid: openid, isDeleted: notDeleted(_) };
  if (category) where.category = category;
  if (status) where.status = status;
  if (keyword) where.name = db.RegExp({ regexp: keyword, options: 'i' });

  const res = await col.where(where).orderBy('updatedAt', 'desc')
    .skip((page - 1) * pageSize).limit(pageSize).get();
  return ok({
    list: res.data.map(toItem),
  });
}

// ---------- categories ----------

async function categories(openid) {
  return ok({ categories: await aggregateCategories(openid) });
}

async function aggregateCategories(openid) {
  const col = db.collection(COL);
  // 按类别聚合数量
  let stats = [];
  try {
    const agg = await col.aggregate()
      .match({ _openid: openid, isDeleted: notDeleted(_) })
      .group({
        _id: '$category',
        count: $.sum(1),
        inUse: $.sum('$inUse'),
        total: $.sum('$total'),
      })
      .end();
    stats = agg.list || [];
  } catch (e) {
    stats = [];
  }
  const byKey = {};
  stats.forEach(s => { byKey[s._id] = s; });

  return CATEGORY_META.map(meta => {
    const s = byKey[meta.key] || byKey[meta.name] || {};
    return {
      key: meta.key,
      icon: meta.icon,
      name: meta.name,
      count: s.total || s.count || 0,
      inUse: s.inUse || 0,
    };
  }).concat([{ key: 'more', icon: 'add', name: '更多', count: 0, inUse: 0 }]);
}

// ---------- detail ----------

async function detail(openid, { id } = {}) {
  if (!id) return fail('缺少 id');
  const res = await db.collection(COL).doc(id).get().catch(() => ({ data: null }));
  if (!res.data) return fail('道具不存在');
  if (res.data._openid && res.data._openid !== openid) return fail('无权访问');
  return ok(toItem(res.data));
}

// ---------- create/update/remove/adjust ----------

async function create(openid, { data } = {}) {
  const err = requireFields(data, ['name', 'category']);
  if (err) return fail(err);
  const total = validateAmount(data.total);
  const inUse = validateAmount(data.inUse);
  if (data.total !== undefined && total === null) return fail('道具总数不合法');
  if (data.inUse !== undefined && inUse === null) return fail('使用数不合法');
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
  if (!doc.data) return fail('道具不存在');
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

// 出/入库快捷调整: { id, deltaInUse, deltaTotal }
async function adjust(openid, { id, deltaInUse = 0, deltaTotal = 0 } = {}) {
  if (!id) return fail('缺少 id');
  const ref = db.collection(COL).doc(id);
  const doc = await ref.get().catch(() => ({ data: null }));
  if (!doc.data) return fail('道具不存在');
  if (doc.data._openid && doc.data._openid !== openid) return fail('无权访问');

  const total = Math.max(0, Number(doc.data.total || 0) + Number(deltaTotal));
  const inUse = Math.max(0, Number(doc.data.inUse || 0) + Number(deltaInUse));
  const available = Math.max(0, total - inUse);

  await ref.update({
    data: { total, inUse, available, updatedAt: new Date() },
  });
  return ok({ _id: id, total, inUse, available });
}

// ---------- helpers ----------

function normalize(data, isUpdate = false) {
  const out = {};
  ['name', 'category', 'unit', 'status', 'notes'].forEach(k => {
    if (data[k] !== undefined) out[k] = data[k];
  });
  ['total', 'inUse', 'available'].forEach(k => {
    if (data[k] !== undefined) out[k] = Number(data[k]) || 0;
  });
  if (data.lastReconciled !== undefined) {
    out.lastReconciled = data.lastReconciled ? new Date(data.lastReconciled) : null;
  }
  if (!isUpdate) {
    if (out.total != null && out.inUse != null && out.available == null) {
      out.available = Math.max(0, out.total - out.inUse);
    }
  }
  return out;
}

function toItem(p) {
  return {
    id: p._id,
    name: p.name || '',
    category: p.category || '',
    total: Number(p.total || 0),
    inUse: Number(p.inUse || 0),
    available: Number(p.available != null ? p.available : (Number(p.total || 0) - Number(p.inUse || 0))),
    unit: p.unit || '件',
    status: p.status || '闲置',
    lastReconciled: p.lastReconciled || null,
    notes: p.notes || '',
  };
}
