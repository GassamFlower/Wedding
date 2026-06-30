// 云函数：user
// 用户档案（与 registerUser 配合：registerUser 负责注册写入，本函数负责读取/更新）
// actions: profile / update / switchRole

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 兼容历史：registerUser 写入的集合名是 'user'，DATABASE_MODEL.md 用的是 'users'
// 这里两个都尝试读取。
const COLS = ['users', 'user'];

const { ok, fail, validatePhone } = require('./utils');

exports.main = async (event) => {
  const { action } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    switch (action) {
      case 'profile':    return await getProfile(OPENID);
      case 'update':     return await updateProfile(OPENID, event);
      case 'switchRole': return await switchRole(OPENID, event);
      default:
        return fail('未知操作: ' + action);
    }
  } catch (err) {
    return fail(err && err.message ? err.message : String(err));
  }
};

async function findUser(openid) {
  for (const name of COLS) {
    try {
      const res = await db.collection(name).where({ _openid: openid }).limit(1).get();
      if (res.data && res.data.length) return { col: name, doc: res.data[0] };
    } catch (e) { /* 集合不存在则跳过 */ }
  }
  return null;
}

async function getProfile(openid) {
  const found = await findUser(openid);
  if (!found) {
    return ok({
      openid,
      nickName: '',
      avatarUrl: '',
      role: 'newbie',
      roleName: '准新人',
      phone: '',
      exists: false,
    });
  }
  const u = found.doc;
  const role = u.role || 'newbie';
  return ok({
    _id: u._id,
    openid,
    nickName: u.nickName || u.nickname || '',
    avatarUrl: u.avatarUrl || '',
    role,
    roleName: roleNameOf(role),
    phone: u.phone || '',
    exists: true,
  });
}

async function updateProfile(openid, { data } = {}) {
  if (!data) return fail('缺少 data');
  // 校验手机号
  if (data.phone !== undefined && data.phone !== '') {
    if (!validatePhone(data.phone)) return fail('手机号格式不合法');
  }
  // 校验角色
  if (data.role !== undefined && !['newbie', 'planner', 'wedding_pro'].includes(data.role)) return fail('角色不合法');
  const found = await findUser(openid);
  const now = new Date();
  const payload = {};
  ['nickName', 'avatarUrl', 'role', 'phone'].forEach(k => {
    if (data[k] !== undefined) payload[k] = data[k];
  });
  payload.updatedAt = now;

  if (!found) {
    // 不存在则创建在 users 集合
    const res = await db.collection('users').add({
      data: { _openid: openid, ...payload, createdAt: now },
    });
    return ok({ _id: res._id, created: true });
  }
  await db.collection(found.col).doc(found.doc._id).update({ data: payload });
  return ok({ _id: found.doc._id, created: false });
}

async function switchRole(openid, { role } = {}) {
  if (!role || !['newbie', 'planner', 'wedding_pro'].includes(role)) return fail('role 不合法');
  return updateProfile(openid, { data: { role } });
}

function roleNameOf(role) {
  if (role === 'planner' || role === 'wedding_pro') return '婚礼人';
  return '准新人';
}
