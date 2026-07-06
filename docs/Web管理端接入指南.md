# Web 管理端接入微信云开发指南

> 版本：v1.0 | 2026-07-06
> 适用场景：微信小程序 + Web 管理后台共享同一云开发环境
> 核心模式：Web 端通过 `@cloudbase/js-sdk` 的 `callFunction` 调用云函数，云函数使用 `wx-server-sdk` 操作数据库

---

## 一、架构总览

```
┌─────────────────────────────────────────────────────────┐
│              微信云开发环境 (env-xxxxxx)                  │
│              同一个环境 ID，共享所有资源                    │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │                    云数据库                         │   │
│  │         案例数据、配置、用户信息                      │   │
│  │         增 / 删 / 改 / 查 — 两端实时同步             │   │
│  └──────────────────────────────────────────────────   │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ 云函数    │  │ 云存储    │  │ HTTP API │             │
│  │ 业务逻辑  │  │ 图片/文件 │  │ (可选)   │             │
│  └─────┬────┘  └──────────┘  └──────────┘             │
│        │                                              │
│  ┌─────▼─────────────────────────────────────┐        │
│  │         wx-server-sdk (自动注入凭据)        │        │
│  └────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
         ▲                              ▲
         │ callFunction()               │ wx.cloud.callFunction()
         │                              │
┌────────────────┐          ┌─────────┴──────────┐
│   Web 管理后台   │          │    微信小程序        │
│ @cloudbase/js-sdk│          │  wx.cloud SDK       │
│ 匿名登录          │          │  天然带微信登录态     │
─────────────────┘          └────────────────────┘
```

---

## 二、核心原理

### 为什么选择 callFunction 模式？

| 方案 | 优点 | 缺点 |
|------|------|------|
| **callFunction（推荐）** | 云函数自动注入凭据，无需额外密钥；与小程序共用同一套云函数代码 | 需要在云开发控制台开启匿名登录 |
| HTTP 触发器 + @cloudbase/node-sdk | 不依赖匿名登录 | 需要配置腾讯云 SecretId/SecretKey，安全性风险更高 |
| HTTP 触发器 + wx-server-sdk | — | **不可行**：HTTP 触发模式下 wx-server-sdk 没有凭据，会报 `MISSING_CREDENTIALS` |

### 关键概念

1. **wx-server-sdk**：只能在云函数运行时使用，自动注入凭据，**不能**用于 HTTP 触发模式
2. **@cloudbase/js-sdk**：Web 端 SDK，支持匿名登录 + callFunction 调用云函数
3. **匿名登录**：Web 端无需微信授权即可获取一个 Web OpenID，用于调用云函数

---

## 三、实施步骤

### 第一步：云开发控制台配置

#### 1.1 开启匿名登录

路径：**云开发控制台 → 登录授权 → 匿名登录 → 开启**

这一步让 Web 端可以匿名获取一个 Web OpenID。

#### 1.2 修改云函数权限

路径：**云开发控制台 → 云函数 → admin-api → 权限管理**

将 admin-api 的调用权限改为 **"所有用户可调用"**（默认只有小程序端可调用）。

> ⚠️ 如果找不到权限管理入口，也可以不修改权限，因为 `@cloudbase/js-sdk` 的 callFunction 走的是 CloudBase 网关，不受小程序端权限限制。

### 第二步：安装前端依赖

```bash
cd admin
npm install @cloudbase/js-sdk
```

### 第三步：前端 API 层（cloud.js）

```javascript
// admin/src/api/cloud.js
import cloudbase from '@cloudbase/js-sdk'

// 云环境 ID（与小程序 wx.cloud.init 使用同一个）
const ENV_ID = 'cloud1-xxxxxxxxxxxxxx'

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
```

### 第四步：云函数（admin-api/index.js）

```javascript
// 云函数：admin-api
// 使用 wx-server-sdk 操作数据库（云函数运行时自动注入凭据）

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'DaxiAdmin2026';

function ok(data) { return { code: 0, data }; }
function err(code, msg) { return { code, msg }; }

exports.main = async (event) => {
  const { action, payload = {}, secret = '' } = event;

  // 认证相关
  if (action === 'adminLogin') {
    if (String(payload?.secret || '').trim() !== ADMIN_SECRET) {
      return err(403, '密钥错误');
    }
    return ok({ isAdmin: true, msg: '登录成功' });
  }

  if (action === 'checkIsAdmin') {
    return secret === ADMIN_SECRET ? ok({ isAdmin: true }) : err(403, '无权限');
  }

  // 公开接口（无需认证）
  const PUBLIC_ACTIONS = ['dashboard', 'cases:list', 'articles:list', 'leads:create'];
  if (PUBLIC_ACTIONS.includes(action)) {
    return await handleAction(action, payload);
  }

  // 需要认证的操作
  if (secret !== ADMIN_SECRET) {
    return err(403, '无权限');
  }

  return await handleAction(action, payload);
};

// 业务操作路由
async function handleAction(action, payload) {
  const parts = action.split(':');
  const module = parts[0];
  const op = parts[1] || 'list';
  // ... 根据 module 和 op 操作数据库
}
```

### 第五步：环境变量配置

在云开发控制台 → 云函数 → admin-api → 环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `ADMIN_SECRET` | `DaxiAdmin2026` | 管理后台登录密码（可自定义） |

**只需这 1 个环境变量**，不需要腾讯云密钥。

### 第六步：部署

1. 微信开发者工具 → 右键 `cloudfunctions/admin-api`
2. 选择"上传并部署：云端安装依赖"
3. 等待部署完成

---

## 四、避坑指南

### 坑 1：MISSING_CREDENTIALS

**现象**：Web 端调用云函数返回 `{ "code": "MISSING_CREDENTIALS" }`

**原因**：使用了 HTTP 触发模式 + wx-server-sdk，HTTP 触发不会注入凭据

**解决**：改用 `@cloudbase/js-sdk` 的 `callFunction` 模式

### 坑 2：EXCEED_AUTHORITY

**现象**：Web 端匿名登录成功，但调用云函数返回 `{ "code": "EXCEED_AUTHORITY" }`

**原因**：云函数权限设置不允许 Web SDK 调用

**解决**：云开发控制台 → 云函数 → 权限管理 → 改为"所有用户可调用"

### 坑 3：@cloudbase/node-sdk 需要腾讯云密钥

**现象**：想用 `@cloudbase/node-sdk` 在云函数中直接操作数据库，但需要 SecretId/SecretKey

**原因**：`@cloudbase/node-sdk` 是服务端 SDK，需要显式配置腾讯云密钥

**解决**：改用 `wx-server-sdk`，云函数运行时自动注入凭据，无需密钥

### 坑 4：callFunction 返回数据结构

**现象**：`res.result` 的结构与预期不符

**说明**：`@cloudbase/js-sdk` 的 callFunction 返回 `{ result: { code: 0, data: ... } }`，直接取 `res.result` 即可

---

## 五、完整文件清单

### 前端文件

| 文件 | 用途 |
|------|------|
| `admin/src/api/cloud.js` | API 调用层（callFunction 封装） |
| `admin/src/views/Login.vue` | 登录页面 |
| `admin/src/stores/auth.js` | 认证状态管理 |
| `admin/src/router/index.js` | 路由守卫 |

### 云函数文件

| 文件 | 用途 |
|------|------|
| `cloudfunctions/admin-api/index.js` | 管理后台 API 入口 |
| `cloudfunctions/admin-api/package.json` | 依赖声明（wx-server-sdk） |

---

## 六、扩展：小程序端与 Web 端数据隔离

如果需要区分小程序用户和 Web 管理员创建的数据，可以在数据中添加 `source` 字段：

```javascript
// 云函数中
const { OPENID } = cloud.getWXContext();
await db.collection('orders').add({
  data: {
    ...doc,
    _openid: OPENID,
    source: 'admin',  // 标记来源
    createdAt: new Date(),
  }
});
```

小程序端查询时：
```javascript
// 只看小程序用户创建的数据
db.collection('orders').where({
  _openid: openid,
  source: _.neq('admin')
}).get();
```

Web 管理端查询时：
```javascript
// 看所有数据
db.collection('orders').where({
  isDeleted: _.neq(true)
}).get();
```

---

## 七、安全检查清单

- [ ] 云开发控制台已开启匿名登录
- [ ] admin-api 云函数权限已设置为"所有用户可调用"
- [ ] 环境变量 `ADMIN_SECRET` 已配置（不要使用默认值 `DaxiAdmin2026`）
- [ ] 生产环境建议更换更强的管理密钥
- [ ] 敏感操作（删除、批量修改）建议增加二次确认
- [ ] 定期检查云函数调用日志，发现异常调用及时处理

---

> **文档版本记录**
> v1.0 (2026-07-06) — 初始版本：wx-server-sdk + callFunction 模式
