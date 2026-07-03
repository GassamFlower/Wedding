// 云函数：admin-api
// 管理后台 HTTP API 入口（云托管 HTTP 触发）
// 直接操作数据库，不转发到其他云函数

const cloud = require('wx-server-sdk');

// 云托管环境需要显式指定环境 ID
const envId = process.env.CLOUD_ENV_ID || 'cloud1-d3gt5vpbuf8acec14';
cloud.init({ env: envId });
const db = cloud.database();
const _ = db.command;

// 管理密钥（从环境变量读取，默认 DaxiAdmin2026）
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'DaxiAdmin2026';

function httpRes(data, sc) {
  return {
    isBase64Encoded: false,
    statusCode: sc || (data.code === 0 ? 200 : 400),
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type,Authorization", "Access-Control-Allow-Methods": "POST,OPTIONS" },
    body: JSON.stringify(data)
  };
}

// action 到数据库集合的映射
const COLLECTION_MAP = {
  'orders': 'orders',
  'cases': 'orders', // cases 也是存储在 orders 集合，通过 isCase 字段区分
  'articles': 'articles',
  'clients': 'clients',
  'contracts': 'contracts',
  'hotels': 'hotels',
  'props': 'props',
  'images': 'images',
  'leads': 'leads',
  'todos': 'todos',
};

// 公开可读的 action（网站无需认证即可访问）
const PUBLIC_ACTIONS = ['cases:list', 'cases:featured', 'cases:get', 'articles:list', 'articles:get', 'knowledge:search'];

// 网站公开写操作
const PUBLIC_WRITE_ACTIONS = ['leads:create'];

exports.main = async (event) => {
  // CORS 预检
  if (event && event.method === "OPTIONS") return httpRes({ code: 0 }, 200);

  // 解析请求体
  let p = event;
  if (event && typeof event.body === "string") { try { p = JSON.parse(event.body); } catch(e) { p = {}; } }

  const s = p.password || p.secret;

  // ping 健康检查（无需认证）
  if (p.action === "ping") return httpRes({ code: 0, data: { msg: "pong" } });

  // 认证接口（无需 secret 校验）
  if (p.action === "login" || p.action === "checkIsAdmin") {
    // 验证密钥
    if (s !== ADMIN_SECRET) return httpRes({ code: 403, msg: "无权限" }, 403);
    return httpRes({ code: 0, data: { isAdmin: true } });
  }
  if (p.action === "logout") return httpRes({ code: 0, data: { loggedOut: true } });

  // 网站公开写操作
  if (PUBLIC_WRITE_ACTIONS.includes(p.action)) {
    const result = await handlePublicWrite(p.action, p);
    return httpRes(result, result.code === 0 ? 200 : 400);
  }

  // 公开可读接口
  if (PUBLIC_ACTIONS.includes(p.action)) {
    const result = await handleAction(p.action, p);
    return httpRes(result, result.code === 0 ? 200 : 400);
  }

  // 业务接口需要认证
  if (s !== ADMIN_SECRET) return httpRes({ code: 403, msg: "无权限" }, 403);

  // 处理业务操作
  const result = await handleAction(p.action, p);
  return httpRes(result, result.code === 0 ? 200 : 400);
};

// 处理各种 action
async function handleAction(action, payload) {
  try {
    // 解析 action
    const parts = action.split(':');
    const module = parts[0];
    const op = parts[1] || 'list';

    // 特殊处理 dashboard
    if (module === 'dashboard') {
      return await handleDashboard();
    }

    // 获取集合名
    const collection = COLLECTION_MAP[module];
    if (!collection) {
      return { code: -1, msg: "未知模块: " + module };
    }

    // 根据操作类型处理
    switch (op) {
      case 'list':
        return await handleList(collection, payload, module);
      case 'get':
      case 'detail':
        return await handleGet(collection, payload);
      case 'save':
      case 'create':
      case 'update':
        return await handleSave(collection, payload);
      case 'remove':
      case 'delete':
        return await handleRemove(collection, payload);
      case 'featured':
        return await handleFeatured(collection, payload);
      case 'categories':
        return await handleCategories(collection, payload);
      default:
        return { code: -1, msg: "未知操作: " + op };
    }
  } catch (err) {
    console.error('处理失败:', err);
    return { code: -1, msg: err.message || "操作失败" };
  }
}

// 仪表盘统计
async function handleDashboard() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [ordersRes, monthOrdersRes, leadsRes, todosRes] = await Promise.all([
    db.collection('orders').where({ isDeleted: _.neq(true) }).count(),
    db.collection('orders').where({ isDeleted: _.neq(true), createdAt: _.gte(monthStart) }).count(),
    db.collection('leads').count(),
    db.collection('todos').where({ completed: _.neq(true) }).count(),
  ]);

  // 计算本月收入
  const monthIncomeRes = await db.collection('orders')
    .where({ isDeleted: _.neq(true), createdAt: _.gte(monthStart) })
    .get();
  const monthIncome = monthIncomeRes.data.reduce((sum, o) => sum + (o.paid || 0), 0);

  return {
    code: 0,
    data: {
      totalOrders: ordersRes.total,
      monthOrders: monthOrdersRes.total,
      monthIncome,
      totalLeads: leadsRes.total,
      pendingTodos: todosRes.total,
    }
  };
}

// 列表查询
async function handleList(collection, payload, module) {
  const { page = 1, pageSize = 20 } = payload;
  const skip = (page - 1) * pageSize;

  let query = db.collection(collection);

  // cases 模块只查询 isCase=true 的记录
  if (module === 'cases') {
    query = query.where({ isCase: true, isDeleted: _.neq(true) });
  } else if (module === 'orders') {
    // orders 模块查询 isCase!=true 的记录
    query = query.where({ isDeleted: _.neq(true), isCase: _.neq(true) });
  } else {
    query = query.where({ isDeleted: _.neq(true) });
  }

  const [countRes, listRes] = await Promise.all([
    query.count(),
    query.skip(skip).limit(pageSize).orderBy('createdAt', 'desc').get()
  ]);

  return {
    code: 0,
    data: {
      list: listRes.data,
      total: countRes.total
    }
  };
}

// 获取详情
async function handleGet(collection, payload) {
  const { id } = payload;
  if (!id) return { code: -1, msg: "缺少 id" };

  const res = await db.collection(collection).doc(id).get();
  return { code: 0, data: res.data };
}

// 保存/更新
async function handleSave(collection, payload) {
  const { id, data } = payload;
  if (!data) return { code: -1, msg: "缺少 data" };

  const now = new Date();

  if (id) {
    // 更新
    await db.collection(collection).doc(id).update({
      ...data,
      updatedAt: now
    });
    return { code: 0, data: { id } };
  } else {
    // 新增
    const res = await db.collection(collection).add({
      ...data,
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    });
    return { code: 0, data: { id: res._id } };
  }
}

// 删除（软删除）
async function handleRemove(collection, payload) {
  const { id } = payload;
  if (!id) return { code: -1, msg: "缺少 id" };

  await db.collection(collection).doc(id).update({
    isDeleted: true,
    updatedAt: new Date()
  });
  return { code: 0, data: { id } };
}

// 推荐/取消推荐（cases）
async function handleFeatured(collection, payload) {
  const { id, featured } = payload;
  if (!id) return { code: -1, msg: "缺少 id" };

  await db.collection(collection).doc(id).update({
    isFeatured: featured !== false,
    updatedAt: new Date()
  });
  return { code: 0, data: { id } };
}

// 获取分类
async function handleCategories(collection, payload) {
  const res = await db.collection(collection).where({ isDeleted: _.neq(true) }).get();
  const categories = [...new Set(res.data.map(item => item.category).filter(Boolean))];
  return { code: 0, data: categories };
}

// 公开写操作
async function handlePublicWrite(action, p) {
  switch (action) {
    case 'leads:create':
      return await createWebsiteLead(p);
    default:
      return { code: -1, msg: '未支持的公开写操作: ' + action };
  }
}

async function createWebsiteLead(p) {
  const data = p.data || p;
  if (!data.name || !data.phone) {
    return { code: -1, msg: '请填写姓名和电话' };
  }
  if (!/^1[3-9]\d{9}$/.test(String(data.phone).trim())) {
    return { code: -1, msg: '手机号格式不正确' };
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
    return { code: 0, data: { id: res._id } };
  } catch (err) {
    console.error('website lead create error:', err);
    return { code: -1, msg: '提交失败，请稍后重试' };
  }
}
