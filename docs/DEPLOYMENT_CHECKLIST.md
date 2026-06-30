# 大喜的日子 · 云函数部署清单

> 版本：v1.0 | 2026-06-23
> 用途：首次部署或重新部署时的检查清单

---

## 一、前置准备

### 1.1 环境变量配置

在微信云开发控制台 → 云函数 → 设置 → 环境变量，配置以下变量：

| 云函数 | 环境变量名 | 值 | 说明 |
|--------|-----------|-----|------|
| `ai-chat` | `DEEPSEEK_API_KEY` | `sk-xxx` | DeepSeek API Key |
| `proposal-generator` | `DEEPSEEK_API_KEY` | `sk-xxx` | DeepSeek API Key |
| `ai-chat` | `LLM_PROVIDER` | `deepseek` | 可选：deepseek/openai/qwen |
| `proposal-generator` | `LLM_PROVIDER` | `deepseek` | 可选：deepseek/openai/qwen |

**获取 DeepSeek API Key**：https://platform.deepseek.com/api_keys

### 1.2 数据库集合创建

在微信云开发控制台 → 数据库，创建以下集合（如不存在）：

| 集合名 | 用途 | 权限 |
|--------|------|------|
| `design_sessions` | AI 对话会话 | 所有用户可读，仅创建者可写 |
| `proposals` | AI 生成方案 | 所有用户可读，仅创建者可写 |
| `ai_usage` | AI 使用量记录 | 仅管理端可写 |
| `orders` | 婚礼订单 | 所有用户可读，仅创建者可写 |
| `clients` | 客户信息 | 仅管理端可读写 |
| `props` | 道具库 | 所有用户可读，仅管理端可写 |
| `hotels` | 合作酒店 | 所有用户可读，仅管理端可写 |
| `contracts` | 合同 | 仅管理端可读写 |
| `todos` | 待办事项 | 仅创建者可读写 |
| `leads` | 咨询线索 | 仅管理端可读写 |
| `cases` | 案例展示 | 所有用户可读 |
| `knowledge` | 知识库 | 所有用户可读，仅管理端可写 |
| `users` | 用户信息 | 仅创建者可读写 |

---

## 二、云函数部署顺序

### 2.1 共享模块（先部署）

这些不是独立云函数，是被其他云函数引用的共享代码：

- [ ] `cloudfunctions/common/llm.js` — LLM 调用层
- [ ] `cloudfunctions/common/cost-engine.js` — 成本引擎
- [ ] `cloudfunctions/common/membership.js` — 会员体系

**注意**：微信云函数不能跨目录引用代码，所以 `ai-chat` 和 `proposal-generator` 已经各自复制了这些文件。只需确保它们的内容是最新的。

### 2.2 业务 CRUD 云函数（14 个）

按以下顺序部署（无依赖关系，可并行）：

- [ ] `cloudfunctions/dashboard/` — 工作台聚合
- [ ] `cloudfunctions/orders/` — 订单管理
- [ ] `cloudfunctions/clients/` — 客户管理
- [ ] `cloudfunctions/props/` — 道具管理
- [ ] `cloudfunctions/hotels/` — 酒店管理
- [ ] `cloudfunctions/contracts/` — 合同管理
- [ ] `cloudfunctions/todos/` — 待办事项
- [ ] `cloudfunctions/schedule/` — 排期查询
- [ ] `cloudfunctions/budget/` — 预算聚合
- [ ] `cloudfunctions/leads/` — 线索管理
- [ ] `cloudfunctions/cases/` — 案例展示
- [ ] `cloudfunctions/knowledge/` — 知识库检索
- [ ] `cloudfunctions/search/` — 全局搜索
- [ ] `cloudfunctions/user/` — 用户管理

### 2.3 AI Agent 云函数（最后部署）

- [ ] `cloudfunctions/ai-chat/` — 设计顾问 Agent
  - 依赖：`llm.js`（已内置）
  - 环境变量：`DEEPSEEK_API_KEY`
- [ ] `cloudfunctions/proposal-generator/` — 方案生成 Agent
  - 依赖：`llm.js` + `cost-engine.js`（已内置）
  - 环境变量：`DEEPSEEK_API_KEY`
- [ ] `cloudfunctions/seed-data/` — 演示数据初始化
  - 依赖：无
  - 环境变量：无

---

## 三、部署命令

### 3.1 微信开发者工具部署

1. 打开微信开发者工具
2. 右键点击云函数目录 → 选择「上传并部署：云端安装依赖」
3. 按上述顺序逐个部署

### 3.2 命令行部署（可选）

```bash
# 安装云开发 CLI
npm install -g @cloudbase/cli

# 登录
tcb login

# 部署单个云函数
tcb fn deploy ai-chat
tcb fn deploy proposal-generator
tcb fn deploy seed-data
# ... 其他云函数
```

---

## 四、初始化数据

部署完成后，调用 `seed-data` 云函数初始化演示数据：

```javascript
// 在微信开发者工具中测试调用
wx.cloud.callFunction({
  name: 'seed-data',
  data: { action: 'initAll' }
}).then(res => {
  console.log('初始化成功:', res.result);
});
```

**可用操作**：
- `initAll` — 初始化所有数据（案例 + 道具 + 酒店 + 知识库）
- `initCases` — 仅初始化案例（5 个精选案例）
- `initProps` — 仅初始化道具（30 种常用道具）
- `initHotels` — 仅初始化酒店（5 家合作酒店）
- `initKnowledge` — 仅初始化知识库（8 篇婚礼知识）
- `clearAll` — 清除所有演示数据

---

## 五、端到端测试清单

### 5.1 AI 对话流程测试

- [ ] 打开小程序 → 进入首页
- [ ] 发送消息："我想办一场新中式婚礼"
- [ ] 验证 AI 回复正常（非降级回复）
- [ ] 继续对话，提供预算、人数、场地信息
- [ ] 验证需求确认卡片出现
- [ ] 点击"生成我的婚礼方案"
- [ ] 验证方案卡片生成成功
- [ ] 点击方案卡片，进入订单详情
- [ ] 验证方案详情、道具清单、费用明细正常展示

### 5.2 策划师端测试

- [ ] 在"我的"页面输入邀请码 `Daxi2026` 进入策划师端
- [ ] 验证工作台数据展示正常
- [ ] 进入订单详情，验证"成本"Tab 可见
- [ ] 验证成本利润看板数据正确

### 5.3 业务管理测试

- [ ] 案例列表加载正常
- [ ] 道具管理增删改查正常
- [ ] 酒店管理增删改查正常
- [ ] 订单状态更新正常
- [ ] 合同收款记录正常

---

## 六、常见问题

### Q1: AI 对话返回"不好意思，我正在整理思路..."

**原因**：DeepSeek API Key 未配置或已过期

**解决**：检查云函数环境变量 `DEEPSEEK_API_KEY` 是否正确配置

### Q2: 方案生成失败

**原因**：`proposal-generator` 云函数中的 `cost-engine.js` 或 `llm.js` 版本过旧

**解决**：确认 `cloudfunctions/proposal-generator/` 目录下的 `llm.js` 和 `cost-engine.js` 与 `common/` 目录一致

### Q3: 云函数调用超时

**原因**：AI 云函数调用 LLM API 需要较长时间

**解决**：在云函数配置中将超时时间设置为 60 秒

### Q4: 数据库权限错误

**原因**：集合权限配置不正确

**解决**：检查数据库集合权限，确保 `design_sessions` 和 `proposals` 设置为"所有用户可读，仅创建者可写"

---

## 七、部署后验证

部署完成后，在微信开发者工具中运行以下测试：

```javascript
// 测试 AI 对话
wx.cloud.callFunction({
  name: 'ai-chat',
  data: {
    action: 'chat',
    sessionId: 'test-' + Date.now(),
    message: '你好，我想了解新中式婚礼',
    role: 'newbie'
  }
}).then(res => console.log('AI对话测试:', res.result));

// 测试案例列表
wx.cloud.callFunction({
  name: 'cases',
  data: { action: 'list', page: 1, pageSize: 5 }
}).then(res => console.log('案例列表测试:', res.result));

// 测试道具列表
wx.cloud.callFunction({
  name: 'props',
  data: { action: 'list', page: 1, pageSize: 5 }
}).then(res => console.log('道具列表测试:', res.result));
```

---

> **文档版本记录**
> v1.0 (2026-06-23) — 初始版本
