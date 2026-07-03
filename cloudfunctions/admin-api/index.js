// 云函数：admin-api
// 管理后台 API 入口
// 支持两种调用方式：
//   1. Web SDK 直接调用（@cloudbase/js-sdk → app.callFunction）— 自动携带 Web OpenID
//   2. HTTP 触发（云托管 HTTP 触发）— 用于小程序或外部调用
// 认证方案：密钥验证 + admin_users 集合绑定 Web OpenID

const cloud = require('wx-server-sdk');

const envId = process.env.CLOUD_ENV_ID || 'cloud1-d3gt5vpbuf8acec14';
cloud.init({ env: envId });
const db = cloud.database();
const _ = db.command;

// 管理密钥（从环境变量读取，默认 DaxiAdmin2026）
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'DaxiAdmin2026';

// ========== 统一入口 ==========
exports.main = async (event, context) => {
  // 获取调用方身份（Web SDK 调用时自动注入）
  const wxContext = cloud.getWXContext();
  const webOpenId = wxContext.OPENID || null;

  // 兼容 HTTP 触发和 SDK 直接调用两种模式
  let p;
  if (event && typeof event.body === 'string') {
    // HTTP 模式：请求体是 JSON 字符串
    try { p = JSON.parse(event.body); } catch (e) { p = {}; }
  } else {
    // SDK 直接调用模式
    p = event || {};
  }

  const { action, payload = {} } = p;
  const secret = p.secret || payload.secret || '';

  // 路由
  switch (action) {
    case 'adminLogin':
      return await adminLogin(webOpenId, payload);
    case 'checkIsAdmin':
      return await checkIsAdmin(webOpenId, secret);
    case 'ping':
      return ok({ msg: 'pong' });
    case 'logout':
      return ok({ loggedOut: true });
    default:
      break;
  }

  // ---- 以下为业务操作，需要管理员认证 ----

  // 公开可读接口（无需认证）
  const PUBLIC_ACTIONS = ['cases:list', 'cases:featured', 'cases:get', 'articles:list', 'articles:get', 'knowledge:search'];
  if (PUBLIC_ACTIONS.includes(action)) {
    return await handleAction(action, payload);
  }

  // 公开写操作（无需认证）
  if (action === 'leads:create') {
    return await createWebsiteLead(payload);
  }

  // 需要认证的操作：先验证密钥，再验证 admin_users
  if (secret !== ADMIN_SECRET) {
    return err(403, '无权限');
  }

  // 如果有 Web OpenID，验证是否在管理员列表中
  if (webOpenId) {
    const isAdmin = await isAdminUser(webOpenId);
    if (!isAdmin) {
      return err(403, '未授权的管理员');
    }
  }

  return await handleAction(action, payload);
};

// ========== 管理员认证 ==========

// 管理员登录：验证密钥 + 绑定 Web OpenID
async function adminLogin(webOpenId, payload) {
  const secret = String(payload?.secret || '').trim();
  if (secret !== ADMIN_SECRET) {
    return err(403, '密钥错误');
  }

  // 如果有 Web OpenID，绑定到 admin_users
  if (webOpenId) {
    await bindAdminUser(webOpenId);
  }

  return ok({ isAdmin: true, msg: '登录成功' });
}

// 检查是否已登录（密钥有效 + OpenID 在管理员列表中）
async function checkIsAdmin(webOpenId, secret) {
  // 先验证密钥
  if (secret !== ADMIN_SECRET) {
    return err(403, '无权限');
  }

  // 如果有 Web OpenID，检查是否在管理员列表中
  if (webOpenId) {
    const isAdmin = await isAdminUser(webOpenId);
    return ok({ isAdmin });
  }

  // 没有 Web OpenID（HTTP 模式），仅验证密钥
  return ok({ isAdmin: true });
}

// 绑定管理员用户
async function bindAdminUser(openid) {
  const col = db.collection('admin_users');
  const existing = await col.where({ openid }).limit(1).get();
  if (existing.data.length > 0) return;
  await col.add({
    data: {
      openid,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  console.log('[admin-api] 新管理员已绑定:', openid);
}

// 检查是否是管理员
async function isAdminUser(openid) {
  const res = await db.collection('admin_users')
    .where({ openid })
    .limit(1)
    .get();
  return res.data.length > 0;
}

// ========== 工具函数 ==========

function ok(data) { return { code: 0, data }; }
function err(code, msg) { return { code, msg }; }

// ========== HTTP 响应包装（仅 HTTP 模式需要） ==========
function httpRes(data, sc) {
  return {
    isBase64Encoded: false,
    statusCode: sc || (data.code === 0 ? 200 : 400),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
    },
    body: JSON.stringify(data),
  };
}

// ========== 业务操作路由 ==========

// action → 数据库集合映射
const COLLECTION_MAP = {
  'orders': 'orders',
  'cases': 'orders',
  'articles': 'articles',
  'clients': 'clients',
  'contracts': 'contracts',
  'hotels': 'hotels',
  'props': 'props',
  'images': 'images',
  'leads': 'leads',
  'todos': 'todos',
};

async function handleAction(action, payload) {
  try {
    const parts = action.split(':');
    const module = parts[0];
    const op = parts[1] || 'list';

    if (module === 'dashboard') {
      return await handleDashboard();
    }

    const collection = COLLECTION_MAP[module];
    if (!collection) {
      return err(-1, '未知模块: ' + module);
    }

    switch (op) {
      case 'list':      return await handleList(collection, payload, module);
      case 'get':
      case 'detail':    return await handleGet(collection, payload);
      case 'save':
      case 'create':
      case 'update':    return await handleSave(collection, payload);
      case 'remove':
      case 'delete':    return await handleRemove(collection, payload);
      case 'featured':  return await handleFeatured(collection, payload);
      case 'categories': return await handleCategories(collection, payload);
      default:          return err(-1, '未知操作: ' + op);
    }
  } catch (err) {
    console.error('处理失败:', err);
    return { code: -1, msg: err.message || '操作失败' };
  }
}

// ========== 仪表盘 ==========
async function handleDashboard() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [ordersRes, monthOrdersRes, leadsRes, todosRes] = await Promise.all([
    db.collection('orders').where({ isDeleted: _.neq(true) }).count(),
    db.collection('orders').where({ isDeleted: _.neq(true), createdAt: _.gte(monthStart) }).count(),
    db.collection('leads').count(),
    db.collection('todos').where({ completed: _.neq(true) }).count(),
  ]);

  const monthIncomeRes = await db.collection('orders')
    .where({ isDeleted: _.neq(true), createdAt: _.gte(monthStart) })
    .get();
  const monthIncome = monthIncomeRes.data.reduce((sum, o) => sum + (o.paid || 0), 0);

  return ok({
    totalOrders: ordersRes.total,
    monthOrders: monthOrdersRes.total,
    monthIncome,
    totalLeads: leadsRes.total,
    pendingTodos: todosRes.total,
  });
}

// ========== 列表查询 ==========
async function handleList(collection, payload, module) {
  const { page = 1, pageSize = 20 } = payload;
  const skip = (page - 1) * pageSize;

  let query = db.collection(collection);

  if (module === 'cases') {
    query = query.where({ isCase: true, isDeleted: _.neq(true) });
  } else if (module === 'orders') {
    query = query.where({ isDeleted: _.neq(true), isCase: _.neq(true) });
  } else {
    query = query.where({ isDeleted: _.neq(true) });
  }

  const [countRes, listRes] = await Promise.all([
    query.count(),
    query.skip(skip).limit(pageSize).orderBy('createdAt', 'desc').get(),
  ]);

  return ok({ list: listRes.data, total: countRes.total });
}

// ========== 详情 ==========
async function handleGet(collection, payload) {
  const { id } = payload;
  if (!id) return err(-1, '缺少 id');
  const res = await db.collection(collection).doc(id).get();
  return ok(res.data);
}

// ========== 保存/更新 ==========
async function handleSave(collection, payload) {
  const { id, data } = payload;
  if (!data) return err(-1, '缺少 data');
  const now = new Date();

  if (id) {
    await db.collection(collection).doc(id).update({ ...data, updatedAt: now });
    return ok({ id });
  } else {
    const res = await db.collection(collection).add({
      ...data,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });
    return ok({ id: res._id });
  }
}

// ========== 删除（软删除） ==========
async function handleRemove(collection, payload) {
  const { id } = payload;
  if (!id) return err(-1, '缺少 id');
  await db.collection(collection).doc(id).update({ isDeleted: true, updatedAt: new Date() });
  return ok({ id });
}

// ========== 推荐 ==========
async function handleFeatured(collection, payload) {
  const { id, featured } = payload;
  if (!id) return err(-1, '缺少 id');
  await db.collection(collection).doc(id).update({ isFeatured: featured !== false, updatedAt: new Date() });
  return ok({ id });
}

// ========== 分类 ==========
async function handleCategories(collection, payload) {
  const res = await db.collection(collection).where({ isDeleted: _.neq(true) }).get();
  const categories = [...new Set(res.data.map(item => item.category).filter(Boolean))];
  return ok(categories);
}

// ========== 网站公开写操作 ==========
async function createWebsiteLead(p) {
  const data = p.data || p;
  if (!data.name || !data.phone) {
    return err(-1, '请填写姓名和电话');
  }
  if (!/^1[3-9]\d{9}$/.test(String(data.phone).trim())) {
    return err(-1, '手机号格式不正确');
  }

  try {
    const res = await db.collection('leads').add({
      data: {
        name: String(data.name).trim(),
        phone: String(data.phone).trim(),
        weddingDate: data.weddingDate || '',
        budget: data.budget || '',
        requirement: data.requirement || '',
        stylePreference: data.stylePreference || '',
        source: data.source || 'website',
        status: '待跟进',
        followUpNotes: [],
        lastFollowUpAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return ok({ id: res._id });
  } catch (err) {
    console.error('website lead create error:', err);
    return err(-1, '提交失败，请稍后重试');
  }
}
