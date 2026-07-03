// 云函数：admin-api
// 管理后台 HTTP API 入口（云托管 HTTP 触发）
// 负责认证 + 业务数据转发到各业务云函数

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const ADMIN_SECRET = "DaxiAdmin2026";

function httpRes(data, sc) {
  return {
    isBase64Encoded: false,
    statusCode: sc || (data.code === 0 ? 200 : 400),
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type,Authorization", "Access-Control-Allow-Methods": "POST,OPTIONS" },
    body: JSON.stringify(data)
  };
}

// action -> 云函数名 映射
const ACTION_MAP = {
  'dashboard': 'dashboard',
  'orders:list': 'orders',
  'orders:create': 'orders',
  'orders:update': 'orders',
  'orders:remove': 'orders',
  'orders:detail': 'orders',
  'cases:list': 'cases',
  'cases:get': 'cases',
  'cases:save': 'cases',
  'cases:remove': 'cases',
  'cases:featured': 'cases',
  'articles:list': 'articles',
  'articles:get': 'articles',
  'articles:save': 'articles',
  'articles:remove': 'articles',
  'hotels:list': 'hotels',
  'hotels:save': 'hotels',
  'hotels:remove': 'hotels',
  'hotels:detail': 'hotels',
  'props:list': 'props',
  'props:save': 'props',
  'props:remove': 'props',
  'props:detail': 'props',
  'props:categories': 'props',
  'clients:list': 'clients',
  'clients:detail': 'clients',
  'clients:save': 'clients',
  'clients:remove': 'clients',
  'contracts:list': 'contracts',
  'contracts:detail': 'contracts',
  'contracts:save': 'contracts',
  'contracts:remove': 'contracts',
  'contracts:pay': 'contracts',
  'leads:list': 'leads',
  'leads:detail': 'leads',
  'leads:update': 'leads',
  'leads:remove': 'leads',
  'leads:convertToOrder': 'leads',
  'images:list': 'images',
  'images:save': 'images',
  'images:remove': 'images',
  'todos:list': 'todos',
  'todos:create': 'todos',
  'todos:update': 'todos',
  'todos:delete': 'todos',
  'todos:toggle': 'todos',
  'schedule:list': 'schedule',
  'budget:summary': 'budget',
  'user:profile': 'user',
  'user:update': 'user',
  'search:query': 'search',
  'knowledge:search': 'knowledge',
};

// 特殊 action 映射（当管理后台 action 与云函数 action 不一致时）
const CLOUD_ACTION_OVERRIDE = {
  'dashboard': 'summary',
};

async function forwardToCloudFunction(action, payload) {
  const fnName = ACTION_MAP[action];
  if (!fnName) {
    return { code: -1, msg: "未知操作: " + action };
  }

  // 解析 action 为云函数所需的 action 参数
  const parts = action.split(':');
  let cloudAction = parts.length > 1 ? parts[1] : action;

  // 应用特殊映射
  if (CLOUD_ACTION_OVERRIDE[action]) {
    cloudAction = CLOUD_ACTION_OVERRIDE[action];
  }

  try {
    const result = await cloud.callFunction({
      name: fnName,
      data: { ...payload, action: cloudAction }
    });
    return result.result || { code: 0, data: null };
  } catch (err) {
    console.error(`云函数调用失败 [${fnName}:${cloudAction}]:`, err);
    return { code: -1, msg: err.message || "云函数调用失败" };
  }
}

// 公开可读的 action（网站无需认证即可访问）
const PUBLIC_ACTIONS = ['cases:list', 'cases:featured', 'cases:get', 'articles:list', 'articles:get', 'knowledge:search'];

// 网站公开写操作（不经过业务云函数，直接在 admin-api 内处理，避免 OPENID 限制）
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
    return httpRes({ code: 0, data: { isAdmin: true } });
  }
  if (p.action === "logout") return httpRes({ code: 0, data: { loggedOut: true } });

  // 网站公开写操作（直接操作数据库，无需 OPENID）
  if (PUBLIC_WRITE_ACTIONS.includes(p.action)) {
    const result = await handlePublicWrite(p.action, p);
    return httpRes(result, result.code === 0 ? 200 : 400);
  }

  // 公开可读接口（网站无需认证）
  if (PUBLIC_ACTIONS.includes(p.action)) {
    const result = await forwardToCloudFunction(p.action, p);
    return httpRes(result, result.code === 0 ? 200 : 400);
  }

  // 业务接口需要认证
  if (s !== ADMIN_SECRET) return httpRes({ code: 403, msg: "无权限" }, 403);

  // 转发到对应云函数
  const result = await forwardToCloudFunction(p.action, p);
  return httpRes(result, result.code === 0 ? 200 : 400);
};

// ====================== 网站公开写操作 ======================

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
        createdAt: db.serverDate(),
        updatedAt: db.serverDate(),
      },
    });
    return { code: 0, data: { id: res._id } };
  } catch (err) {
    console.error('website lead create error:', err);
    return { code: -1, msg: '提交失败，请稍后重试' };
  }
}
