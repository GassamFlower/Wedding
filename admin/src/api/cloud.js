import cloudbase from '@cloudbase/js-sdk'

// 云环境ID
const ENV_ID = 'cloud1-d3gt5vpbuf8acec14'

const app = cloudbase.init({
  env: ENV_ID
})

const auth = app.auth()

// 登录函数
export const login = async (secret) => {
  // 1. 先匿名登录获取 OpenID (Web端 OpenID)
  const loginState = await auth.getLoginState()
  if (!loginState) {
    await auth.signInAnonymously()
  }
  
  // 2. 调用云函数验证密钥并绑定管理员
  const res = await app.callFunction({
    name: 'admin-api',
    data: {
      action: 'adminLogin',
      payload: { secret }
    }
  })
  
  if (res.result.code === 0) {
    // 登录成功，保存密钥到本地
    localStorage.setItem('admin_secret', secret)
    return res.result.data
  }
  throw new Error(res.result.msg || '登录失败')
}

// 检查是否已登录
export const checkIsAdmin = async () => {
  const secret = localStorage.getItem('admin_secret')
  if (!secret) return false
  
  const res = await app.callFunction({
    name: 'admin-api',
    data: {
      action: 'checkIsAdmin',
      payload: { secret }
    }
  })
  
  return res.result.code === 0 && res.result.data?.isAdmin === true
}

// 调用管理端API
export const callAdmin = async (action, payload = {}) => {
  const secret = localStorage.getItem('admin_secret')
  if (!secret) {
    throw new Error('未登录')
  }
  
  const res = await app.callFunction({
    name: 'admin-api',
    data: {
      action,
      secret,
      ...payload
    }
  })
  
  if (res.result.code === 0) {
    return res.result.data
  }
  
  if (res.result.code === 403) {
    localStorage.removeItem('admin_secret')
    throw new Error(res.result.msg || '无权限')
  }
  
  throw new Error(res.result.msg || '操作失败')
}

// 登出
export const logout = async () => {
  localStorage.removeItem('admin_secret')
  await auth.signOut()
}
