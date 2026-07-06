// 云函数：admin-api
// 管理后台 HTTP API 入口（云托管 HTTP 触发）
// 使用 @cloudbase/node-sdk 直接操作数据库

const cloudbase = require('@cloudbase/node-sdk');

// 从环境变量读取配置
const envId = process.env.CLOUD_ENV_ID || 'cloud1-d3gt5vpbuf8acec14';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'DaxiAdmin2026';

// 初始化 CloudBase Admin SDK（需要腾讯云密钥）
const app = cloudbase.init({
  envId,
  credentials: {
    secretId: process.env.TENCENT_SECRET_ID,
    secretKey: process.env.TENCENT_SECRET_KEY,
  }
});

const db = app.database();
const _ = db.command;

// ========== 工具函数 ==========
function ok(data) { return { code: 0, data }; }
function err(code, msg) { return { code, msg }; }

// ========== HTTP 响应包装 ==========
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

// ========== 统一入口 ==========
exports.main = async (event) => {
  // CORS 预检
  if (event && event.method === 'OPTIONS') return httpRes({ code: 0 }, 200);

  // 解析请求体
  let p = event;
  if (event && typeof event.body === 'string') {
    try { p = JSON.parse(event.body); } catch (e) { p = {}; }
  }

  const { action, payload = {} } = p;
  const secret = p.secret || payload.secret || '';

  // 路由
  switch (action) {
    case 'adminLogin':
      return httpRes(await adminLogin(payload));
    case 'checkIsAdmin':
      return httpRes(await checkIsAdmin(secret));
    case 'ping':
      return httpRes(ok({ msg: 'pong' }));
    case 'logout':
      return httpRes(ok({ loggedOut: true }));
    default:
      break;
  }

  // ---- 以下为业务操作，需要管理员认证 ----

  // 公开可读接口（无需认证）
  const PUBLIC_ACTIONS = ['cases:list', 'cases:featured', 'cases:get', 'articles:list', 'articles:get', 'knowledge:search'];
  if (PUBLIC_ACTIONS.includes(action)) {
    return httpRes(await handleAction(action, payload));
  }

  // 公开写操作（无需认证）
  if (action === 'leads:create') {
    return httpRes(await createWebsiteLead(payload));
  }

  // 需要认证的操作
  if (secret !== ADMIN_SECRET) {
    return httpRes(err(403, '无权限'), 403);
  }

  return httpRes(await handleAction(action, payload));
};

// ========== 管理员认证 ==========

// 管理员登录：验证密钥
async function adminLogin(payload) {
  const secret = String(payload?.secret || '').trim();
  if (secret !== ADMIN_SECRET) {
    return err(403, '密钥错误');
  }
  return ok({ isAdmin: true, msg: '登录成功' });
}

// 检查是否已登录
async function checkIsAdmin(secret) {
  if (secret !== ADMIN_SECRET) {
    return err(403, '无权限');
  }
  return ok({ isAdmin: true });
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
    return ok({ id: res.id });
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
    return ok({ id: res.id });
  } catch (err) {
    console.error('website lead create error:', err);
    return err(-1, '提交失败，请稍后重试');
  }
}
