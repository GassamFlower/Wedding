// 管理端 API 调用层 - 使用 HTTP 直接调用云托管服务
const API_BASE = 'https://cloud1-d3gt5vpbuf8acec14.service.tcloudbase.com/admin-api'

// 发送 HTTP 请求
async function apiCall(data) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const text = await res.text()
  let d
  try { d = JSON.parse(text) } catch (e) { throw new Error('响应解析失败') }
  // 云托管 HTTP 触发返回格式：{ body: "..." }
  if (d.body) {
    try { return JSON.parse(d.body) } catch (e) { return d }
  }
  return d
}

// 登录
export const login = async (secret) => {
  const r = await apiCall({ action: 'login', secret })
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
  const r = await apiCall({ action: 'checkIsAdmin', secret })
  return r.code === 0 && r.data?.isAdmin === true
}

// 调用管理端 API
export const callAdmin = async (action, payload = {}) => {
  const secret = localStorage.getItem('admin_secret')
  if (!secret) {
    throw new Error('未登录')
  }
  const r = await apiCall({ action, secret, ...payload })
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
