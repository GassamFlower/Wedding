// 云函数：todos
// 待办事项
// actions: list / create / update / remove / toggle

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const { ok, fail, requireFields, assertOwnership, safeStr, NOT_DELETED, DELETED, notDeleted } = require('./utils');

const COL = 'todos';

exports.main = async (event) => {
  const { action } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    switch (action) {
      case 'list':   return await list(OPENID, event);
      case 'create': return await create(OPENID, event);
      case 'update': return await update(OPENID, event);
      case 'delete': case 'remove': return await remove(OPENID, event);
      case 'toggle': return await toggle(OPENID, event);
      default:
        return fail('未知操作: ' + action);
    }
  } catch (err) {
    return fail(err && err.message ? err.message : String(err));
  }
};

// scene: dashboard | props | hotels | newbie | <orderId>
async function list(openid, { scene = '', includeDone = true, limit = 50, orderId } = {}) {
  const col = db.collection(COL);
  const where = { _openid: openid, isDeleted: notDeleted(_) };
  if (scene) where.scene = scene;
  if (orderId) where.orderId = orderId;
  if (!includeDone) where.done = false;

  const res = await col.where(where).orderBy('done', 'asc').orderBy('createdAt', 'desc').limit(limit).get();
  return ok({ list: res.data.map(toItem) });
}

async function create(openid, { data } = {}) {
  const err = requireFields(data, ['text']);
  if (err) return fail(err);

  const now = new Date();
  const res = await db.collection(COL).add({
    data: {
      _openid: openid,
      text: safeStr(data.text, 200),
      time: safeStr(data.time, 100),
      done: !!data.done,
      priority: data.priority || '中',
      scene: data.scene || 'dashboard',
      orderId: data.orderId || null,
      isDeleted: NOT_DELETED,
      createdAt: now,
      updatedAt: now,
    },
  });
  return ok({ _id: res._id });
}

async function update(openid, { id, data } = {}) {
  if (!id || !data) return fail('缺少参数');
  const owner = await assertOwnership(db, COL, id, openid);
  if (!owner.ok) return fail(owner.msg);

  const upd = {};
  ['text', 'time', 'done', 'priority', 'scene', 'orderId'].forEach(k => {
    if (data[k] !== undefined) upd[k] = data[k];
  });
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

async function toggle(openid, { id } = {}) {
  if (!id) return fail('缺少 id');
  const ref = db.collection(COL).doc(id);
  const doc = await ref.get().catch(() => ({ data: null }));
  if (!doc.data) return fail('待办不存在');
  if (doc.data._openid && doc.data._openid !== openid) return fail('无权访问');

  const done = !doc.data.done;
  await ref.update({ data: { done, updatedAt: new Date() } });
  return ok({ _id: id, done });
}

function toItem(t) {
  return {
    id: t._id,
    text: t.text || '',
    time: t.time || '',
    done: !!t.done,
    priority: t.priority || '中',
    scene: t.scene || 'dashboard',
    orderId: t.orderId || null,
  };
}
