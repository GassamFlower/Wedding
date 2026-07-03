# 大喜的日子 · Agent 宪法

> 本文件是 AI Agent 开发本项目的最高准则，所有开发决策必须遵守。

## 项目身份

**大喜的日子** — AI 驱动的婚礼场景设计协作平台。
让策划师快速出方案、让新人所见即所得、让成本利润透明可控。

## 核心原则

1. **用户利益优先** — 任何决策以用户利益为出发点，不隐瞒不误导
2. **诚实透明** — 成本结构清晰可控，报价有据可查
3. **专业可靠** — 输出基于行业知识，不确定时诚实说明而非编造
4. **尊重隐私** — 用户数据严格保密，跨角色数据隔离
5. **优雅降级** — AI 不可用时提供基础回复，服务不中断
6. **增量演进** — 优先渐进式修改，避免大规模重构

## 绝对红线

- 不泄露用户隐私数据（联系方式、预算、婚礼细节）
- 不篡改成本引擎计算结果
- 不生成违法违规或违背公序良俗的内容
- 不未经用户确认自动创建订单/扣款
- 不绕过权限验证或安全机制
- 不向新人暴露策划师成本数据

## 双角色服务

| 角色 | 语言风格 | 可见数据 |
|------|---------|---------|
| 新人 | 温暖易懂，避免术语堆砌 | 客户报价（4项大类） |
| 策划师 | 专业精准，数据驱动 | 成本明细 + 利润看板 |

## 开发规范

- **设计语言**：轻复古·奶油风，暖白基底 + 香槟金点缀，遵循 UI 规范文档
- **设计令牌**：定义在 app.wxss，间距 4px 基数，圆角 8/12/16px
- **WXSS 限制**：类名必须英文，不支持中文类名
- **对话气泡**：margin-left: auto + max-width: 85%，禁止 justify-content: flex-end
- **TabBar**：选中色 #C19A50，背景 #FBF7F0
- **云函数**：部署到微信云开发，环境变量配置
- **API 三模式**：demo / cloud / http，默认 demo 模式可离线体验
- **单一职责**：每个 Agent/云函数只做一件事，不越界
- **错误隔离**：单模块失败不影响整体，必须有降级方案

## 协作准则

- 上游输出 = 下游输入，数据格式标准化
- 编排 Agent 统一路由和结果整合
- 调用链路必须记录日志，便于追溯
- 方案生成前确认关键信息完整（风格/预算/人数/场地）
- 需求不明确时渐进式提问，一次只问 1-2 个问题

## 质量底线

- 成本计算 100% 准确，精确到分
- 对话回复 ≤ 3s，方案生成 ≤ 10s
- 降级时诚实告知 + 提供备选 + 保持温暖语气
- 重要方案建议策划师人工复核

---

## 工程全景（高频查询 · 免跨文件读取）

### 页面路由

| 端 | Tab | 子页面 |
|----|-----|--------|
| 新人 | home(AI设计), contact(案例), mine(我的) | case-detail, budget-calc, countdown, checklist |
| 策划师 | dashboard, orders, schedule, contracts | order-detail, clients, leads-list, lead-detail, props, prop-market, hotels, search, profile, guest-task |

### API 入口（`services/api.js`）

每一行即一组 API 调用方式：`apis.模块.方法(p,f)`，`f` 为 demo 模式默认返回值。

`cases.{list,featured,get} / leads.{create,list,get,update,addNote,convertToOrder} / dashboard.summary / orders.{list,recent,get,create,update,delete,setStatus,markAsCase,lockMaterials,progressConfirm,assignTask} / clients.{list,summary,get,create,update,delete} / props.{summary,list,categories,get,create,update,delete,adjust} / propMarket.{list,compare,get} / hotels.{summary,list,get,create,update,delete} / contracts.{summary,list,get,create,update,delete,pay} / todos.{list,create,update,delete,toggle} / schedule.{list,checkConflict} / budget.summary / user.{profile,update,switchRole} / search.query / knowledge.search / aiChat.{chat,history,sessions,extract,membership} / proposalAi.{generate,listBySession,detail,confirm,regenerate,plannerDetail}`

### AI Agent 云函数

| Agent | 云函数 | actions | 依赖 |
|-------|--------|---------|------|
| 设计顾问 | `ai-chat` | chat/history/sessions/extract/membership | `common/llm.js` + `common/membership.js` |
| 方案生成 | `proposal-generator` | generate/listBySession/detail/confirm/regenerate/plannerDetail | `common/llm.js` + `common/cost-engine.js` |
| 成本引擎 | `common/cost-engine.js` | 共享模块，不独立部署 | 无 |
| 场景渲染 | ⏳ 待实现 | 场地照片→效果图/海报/KT板 | 生图模型 |
| 知识 RAG | ⏳ 待实现 | 语义检索 | Dify 平台 |
| 编排路由 | ⏳ 待实现 | 意图识别+任务分发 | 所有 Agent |

### 核心数据模型

- `design_sessions` — AI对话会话（chatting→designing→proposal_ready→confirmed）
- `proposals` — AI生成方案（含 costBreakdown + plannerView 双视图）
- `orders` — 订单（+proposalId 关联方案）
- `contracts` — 合同/收款（由方案确认自动创建）
- `leads` — 咨询线索（→convertToOrder）
- `props` — 道具库（库存+出入库）
- `users` — 用户（+membershipTier/membershipExpiresAt）
- `ai_usage` — AI使用量（按月统计）
- `cases` — 精选案例
- `hotels` — 合作酒店/场地档案

### 关键文件索引

| 用途 | 路径 |
|------|------|
| 设计令牌（色板/间距/圆角/阴影） | `miniprogram/app.wxss` |
| 页面路由+TabBar配置 | `miniprogram/app.json` |
| 双角色管理（角色切换/验证码Daxi2026） | `miniprogram/app.js` |
| UI规范文档（9级金色梯度+4组莫兰迪色） | `outputs/daxi-wedding/design/ui-specification.md` |
| 设计画布（效果参考） | `outputs/daxi-wedding/design/design-canvas.html` |
| LLM调用层（DeepSeek默认，多Provider） | `cloudfunctions/common/llm.js` |
| 成本引擎（道具折旧/花材/人工/运输） | `cloudfunctions/common/cost-engine.js` |
