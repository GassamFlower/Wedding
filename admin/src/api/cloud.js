// 管理端 API 调用层 - 使用 @cloudbase/js-sdk callFunction 调用云函数
import cloudbase from '@cloudbase/js-sdk'

// 云环境 ID（与小程序 wx.cloud.init 使用同一个）
const ENV_ID = 'cloud1-d3gt5vpbuf8acec14'

// 初始化 CloudBase
const app = cloudbase.init({ env: ENV_ID })
const auth = app.auth()

// 确保已匿名登录（获取 Web OpenID）
async function ensureLogin() {
  const loginState = await auth.getLoginState()
  if (!loginState) {
    await auth.signInAnonymously()
  }
}

// 调用云函数
async function callFunction(data) {
  await ensureLogin()
  const res = await app.callFunction({
    name: 'admin-api',
    data,
  })
  return res.result
}

// ========== 认证 ==========

// 登录
export const login = async (secret) => {
  const r = await callFunction({ action: 'adminLogin', payload: { secret } })
  if (r.code === 0) {
    localStorage.setItem('admin_secret', secret)
    return r.data
  }
  throw new Error(r.msg || '登录失败')
}

// 检查是否已登录
export const checkIsAdmin = async () => {
  const secret = localStorage.getItem('admin_secret')
  if (!secret) return false
  const r = await callFunction({ action: 'checkIsAdmin', secret })
  return r.code === 0 && r.data?.isAdmin === true
}

// ========== 业务 API ==========

// 调用管理端 API
export const callAdmin = async (action, payload = {}) => {
  const secret = localStorage.getItem('admin_secret')
  if (!secret) {
    throw new Error('未登录')
  }
  const r = await callFunction({ action, payload, secret })
  if (r.code === 0) return r.data
  if (r.code === 403) {
    localStorage.removeItem('admin_secret')
    throw new Error(r.msg || '无权限')
  }
  throw new Error(r.msg || '操作失败')
}

// 登出
export const logout = async () => {
  localStorage.removeItem('admin_secret')
}

// 导出 app 供其他模块使用
export { app, auth }
