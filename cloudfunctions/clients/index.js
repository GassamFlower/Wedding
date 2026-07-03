// 云函数：clients
// 客户管理（独立 clients 集合）
// actions: list / summary / detail / create / update / remove

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const {
  ok, fail, requireFields, assertOwnership, validatePhone, NOT_DELETED, DELETED, notDeleted,
  formatMonthDay,
  badgeOf, statusClassOf, takeShort, avatarClassOf,
} = require('./utils');

const CLIENT_COL = 'clients';

exports.main = async (event) => {
  const { action } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    switch (action) {
      case 'list':    return await listClients(OPENID, event);
      case 'summary': return await summaryClients(OPENID);
      case 'detail':  return await detailClient(OPENID, event);
      case 'create':  return await createClient(OPENID, event);
      case 'update':  return await updateClient(OPENID, event);
      case 'remove':  return await removeClient(OPENID, event);
      default:
        return fail('未知操作: ' + action);
    }
  } catch (err) {
    return fail(err && err.message ? err.message : String(err));
  }
};

// ---------- 业务方法 ----------

// 客户列表：从 clients 集合读取
async function listClients(openid, { tab = 'all', keyword = '', page = 1, pageSize = 50 } = {}) {
  const col = db.collection(CLIENT_COL);
  const notDel = notDeleted(_);
  const where = { _openid: openid, isDeleted: notDel };

  if (tab === 'active') where.status = _.neq('已完成').and(_.neq('lost'));
  else if (tab === 'done') where.status = '已完成';

  if (keyword) where.name = db.RegExp({ regexp: keyword, options: 'i' });

  const res = await col.where(where).orderBy('updatedAt', 'desc')
    .skip((page - 1) * pageSize).limit(pageSize).get();

  return ok({
    list: res.data.map(toClientCard),
    total: res.data.length,
  });
}

async function summaryClients(openid) {
  const col = db.collection(CLIENT_COL);
  const baseScope = { _openid: openid, isDeleted: notDeleted(_) };
  const [totalRes, activeRes, doneRes] = await Promise.all([
    col.where(baseScope).count(),
    col.where({ ...baseScope, status: _.neq('已完成').and(_.neq('lost')) }).count(),
    col.where({ ...baseScope, status: '已完成' }).count(),
  ]);
  return ok({
    totalClients: totalRes.total,
    activeCount: activeRes.total,
    doneCount: doneRes.total,
  });
}

async function detailClient(openid, { id } = {}) {
  if (!id) return fail('缺少 id');
  const col = db.collection(CLIENT_COL);
  const res = await col.doc(id).get().catch(() => ({ data: null }));
  if (!res.data) return fail('客户不存在');
  if (res.data._openid && res.data._openid !== openid) return fail('无权访问');
  return ok(res.data);
}

async function createClient(openid, { data } = {}) {
  const err = requireFields(data, ['name']);
  if (err) return fail(err);
  if (data.phone && !validatePhone(data.phone)) return fail('手机号格式不合法');
  const now = new Date();
  // 写入 clients 集合
  const res = await db.collection(CLIENT_COL).add({
    data: {
      _openid: openid,
      name: data.name,
      phone: data.phone || '',
      wechat: data.wechat || '',
      remark: data.remark || '',
      source: data.source || '',
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? String(data.tags).split(',').map(t => t.trim()).filter(Boolean) : []),
      status: 'active',
      orderCount: 0,
      totalBudget: 0,
      isDeleted: NOT_DELETED,
      createdAt: now,
      updatedAt: now,
    },
  });
  return ok({ _id: res._id });
}

async function updateClient(openid, { id, data } = {}) {
  if (!id || !data) return fail('缺少参数');
  const col = db.collection(CLIENT_COL);
  const doc = await col.doc(id).get().catch(() => ({ data: null }));
  if (!doc.data) return fail('客户不存在');
  if (doc.data._openid && doc.data._openid !== openid) return fail('无权访问');
  const upd = {};
  ['name', 'phone', 'wechat', 'remark', 'source', 'tags', 'status'].forEach(k => {
    if (data[k] !== undefined) upd[k] = data[k];
  });
  upd.updatedAt = new Date();
  await col.doc(id).update({ data: upd });
  return ok({ _id: id });
}

async function removeClient(openid, { id } = {}) {
  const owner = await assertOwnership(db, CLIENT_COL, id, openid);
  if (!owner.ok) return fail(owner.msg);
  await db.collection(CLIENT_COL).doc(id).update({
    data: { isDeleted: DELETED, updatedAt: new Date() },
  });
  return ok({ _id: id });
}

// ---------- helpers ----------

function toClientCard(c) {
  return {
    id: c._id,
    name: c.name || '',
    short: takeShort(c.name),
    avatarClass: avatarClassOf(c.name),
    phone: c.phone || '',
    wechat: c.wechat || '',
    venue: c.venue || '',
    date: c.latestOrderDate ? formatMonthDay(c.latestOrderDate) : '',
    amount: c.totalBudget ? String(c.totalBudget) : '',
    tags: Array.isArray(c.tags) ? c.tags : [],
    status: c.status || 'active',
    badgeClass: badgeOf(c.status),
    statusClass: statusClassOf(c.status),
    orderCount: c.orderCount || 0,
  };
}
