// 宪法要求：默认 cloud 模式，生产环境使用云函数
const CONFIG = { mode: 'cloud', baseUrl: '' };

// 不需要登录即可访问的公开接口
const PUBLIC_APIS = [
  'cases/list', 'cases/featured', 'cases/get',
  'cases/categories',
  'user/login', 'user/update', 'user/profile'
];

function callCloud(path, data) {
  return new Promise((resolve, reject) => {
    const [name, action] = String(path).split('/');
    const fullPath = `${name}/${action}`;
    
    // API 层登录拦截：只拦截敏感业务操作，公开接口放行
    const app = getApp();
    if (!app.globalData.isLoggedIn && !PUBLIC_APIS.includes(fullPath)) {
      reject(new Error('请先登录'));
      return;
    }
    
    wx.cloud.callFunction({ name, data: { action: action || path, ...(data || {}) } })
      .then(res => { const r = res.result; if (r && typeof r === 'object' && 'code' in r) { r.code === 0 ? resolve(r) : reject(new Error(r.msg || '失败')) } else { resolve({ code: 0, data: r }) } })
      .catch(reject);
  });
}
function callOrDefault(path, data, fallback) { return CONFIG.mode === 'demo' ? Promise.resolve(fallback) : callCloud(path, data).then(r => (r && 'data' in r) ? r.data : fallback).catch(() => fallback); }
const apis = {
  // 案例
  cases: { list: (p,f) => callOrDefault('cases/list',p||{},f), featured: (f) => callOrDefault('cases/featured',{},f), get: (p,f) => callOrDefault('cases/get',p||{},f) },
  // 咨询线索
  leads: { create: (d) => callCloud('leads/create',{data:d}), list: (p,f) => callOrDefault('leads/list',p||{},f), get: (i,f) => callOrDefault('leads/detail',{id:i},f), update: (i,d) => callCloud('leads/update',{id:i,data:d}), addNote: (i,n) => callCloud('leads/addNote',{id:i,note:n}), convertToOrder: (i) => callCloud('leads/convertToOrder',{id:i}) },
  // 工作台
  dashboard: { summary: (f) => callOrDefault('dashboard/summary',{},f) },
  // 订单管理
  orders: { list: (p,f) => callOrDefault('orders/list',p||{},f), recent: (l,f) => callOrDefault('orders/recent',{limit:l},f), get: (i,f) => callOrDefault('orders/detail',{id:i},f), create: (d) => callCloud('orders/create',{data:d}), update: (i,d) => callCloud('orders/update',{id:i,data:d}), delete: (i) => callCloud('orders/remove',{id:i}), setStatus: (i,s,p) => callCloud('orders/setStatus',{id:i,status:s,progress:p}) },
  // 客户管理
  clients: { list: (p,f) => callOrDefault('clients/list',p||{},f), summary: (f) => callOrDefault('clients/summary',{},f), get: (i,f) => callOrDefault('clients/detail',{id:i},f), create: (d) => callCloud('clients/create',{data:d}), update: (i,d) => callCloud('clients/update',{id:i,data:d}), delete: (i) => callCloud('clients/remove',{id:i}) },
  // 道具管理
  props: { summary: (f) => callOrDefault('props/summary',{},f), list: (p,f) => callOrDefault('props/list',p||{},f), categories: (f) => callOrDefault('props/categories',{},f), get: (i,f) => callOrDefault('props/detail',{id:i},f), create: (d) => callCloud('props/create',{data:d}), update: (i,d) => callCloud('props/update',{id:i,data:d}), delete: (i) => callCloud('props/remove',{id:i}), adjust: (i,du,dt) => callCloud('props/adjust',{id:i,deltaInUse:du,deltaTotal:dt}) },
  // 道具市场参考
  propMarket: { list: (p,f) => callOrDefault('prop-market-data/list',p||{},f), compare: (p,f) => callOrDefault('prop-market-data/compare',p||{},f), get: (i,f) => callOrDefault('prop-market-data/get',{id:i},f) },
  // 酒店管理
  hotels: { summary: (f) => callOrDefault('hotels/summary',{},f), list: (p,f) => callOrDefault('hotels/list',p||{},f), get: (i,f) => callOrDefault('hotels/detail',{id:i},f), create: (d) => callCloud('hotels/create',{data:d}), update: (i,d) => callCloud('hotels/update',{id:i,data:d}), delete: (i) => callCloud('hotels/remove',{id:i}) },
  // 合同管理
  contracts: { summary: (f) => callOrDefault('contracts/summary',{},f), list: (p,f) => callOrDefault('contracts/list',p||{},f), get: (i,f) => callOrDefault('contracts/detail',{id:i},f), create: (d) => callCloud('contracts/create',{data:d}), update: (i,d) => callCloud('contracts/update',{id:i,data:d}), delete: (i) => callCloud('contracts/remove',{id:i}), pay: (i,a) => callCloud('contracts/pay',{id:i,amount:a}) },
  // 待办事项
  todos: { list: (p,f) => callOrDefault('todos/list',p||{},f), create: (d) => callCloud('todos/create',{data:d}), update: (i,d) => callCloud('todos/update',{id:i,data:d}), delete: (i) => callCloud('todos/delete',{id:i}), toggle: (i) => callCloud('todos/toggle',{id:i}) },
  // 排期
  schedule: { list: (p,f) => callOrDefault('schedule/list',p||{},f), checkConflict: (p) => callCloud('schedule/checkConflict',p) },
  // 预算
  budget: { summary: (p,f) => callOrDefault('budget/summary',p||{},f) },
  // 用户
  user: { profile: (f) => callOrDefault('user/profile',{},f), update: (d) => callCloud('user/update',{data:d}), switchRole: (r) => callCloud('user/switchRole',{role:r}) },
  // 搜索
  search: { query: (k) => callOrDefault('search/query',{keyword:k},{results:[]}) },
  // 知识库智能体
  knowledge: { search: (q) => callOrDefault('knowledge/search',q,{answer:'',sources:[]}) },
  // AI 设计对话 (设计顾问 Agent)
  aiChat: {
    chat: (d) => callCloud('ai-chat/chat', d),
    history: (d) => callCloud('ai-chat/history', d),
    sessions: (p) => callOrDefault('ai-chat/sessions', p || {}, { sessions: [], total: 0 }),
    extract: (d) => callCloud('ai-chat/extract', d),
    membership: () => callOrDefault('ai-chat/membership', {}, { tier: 'free', usage: {} }),
  },
  // AI 方案生成 (方案 Agent)
  proposalAi: {
    generate: (d) => callCloud('proposal-generator/generate', d),
    listBySession: (d) => callCloud('proposal-generator/listBySession', d),
    detail: (d) => callCloud('proposal-generator/detail', d),
    confirm: (d) => callCloud('proposal-generator/confirm', d),
    regenerate: (d) => callCloud('proposal-generator/regenerate', d),
    plannerDetail: (d) => callCloud('proposal-generator/plannerDetail', d),
  },
};
// 登录态守卫：检查是否已登录，未登录则触发登录弹窗
// 用法：api.requireLogin(callback) — callback 为登录成功后的回调函数
function requireLogin(callback) {
  const app = getApp();
  if (app.globalData.isLoggedIn) {
    if (typeof callback === 'function') callback();
    return;
  }
  // 未登录：通过全局事件触发登录弹窗
  if (app.globalData._loginCallbacks) {
    app.globalData._loginCallbacks.push(callback);
  } else {
    app.globalData._loginCallbacks = [callback];
  }
  // 触发所有已注册的登录弹窗（数组机制）
  const showFns = app.globalData._loginModalShowFns || [];
  showFns.forEach(fn => {
    if (typeof fn === 'function') fn(true); // true 表示显示弹窗
  });
}

module.exports = { config:CONFIG, useCloud:()=>{CONFIG.mode='cloud';return !!wx.cloud}, useDemo:()=>{CONFIG.mode='demo'}, isCloud:()=>CONFIG.mode==='cloud', requireLogin, ...apis };
