# Vibe Coding 开发说明 · 大喜的日子 AI 重构

> 版本：v3.0
> 日期：2026-06-21
> 定位：AI 驱动的婚礼场景设计协作平台
> 核心理念：多智能体协作 · 成本透明盈利模型 · 策划师效率杠杆

---

## 目录

1. [架构总览：从 CRUD 管理到 AI 设计协作](#一架构总览)
2. [多智能体系统设计](#二多智能体系统设计)
3. [成本利润引擎](#三成本利润引擎)
4. [数据模型变更](#四数据模型变更)
5. [新增云函数](#五新增云函数)
6. [前端改造](#六前端改造)
7. [待补充功能清单](#七待补充功能清单)

---

## 一、架构总览

### 产品定位重塑

| 维度 | v2 (旧) | v3 (新) |
|------|---------|---------|
| 核心价值 | 帮策划师管理订单数据 | **帮策划师快速出方案出效果图** |
| 新人端 | 看案例、填表单 | **和AI对话描述梦想婚礼 → 看到方案** |
| 策划师端 | CRUD 大表单 | **AI生成方案 + 成本利润一目了然** |
| AI角色 | 关键词匹配检索 | **6个协作Agent** |
| 差异化 | 无 | **婚礼行业AI设计助手** |

### 核心工作流

```
新人打开小程序 → AI 设计对话
  → AI 渐进式收集需求（风格/预算/人数/场地）
  → 需求收集足够 → 一键生成方案
  → 成本引擎自动核算（道具折旧 x 件数 + 人工 x 人天 + 运输 + 花材 + 平台token + 损耗）
  → 客户看到：场景道具 ¥X / 花艺设计 ¥Y / 灯光音响 ¥Z / 人工服务 ¥W / 运输 ¥V / 综合服务费 ¥P
  → 策划师看到：每项成本底价 + 利润 ¥P = ¥报价 - ¥成本
  → 新人确认 → 自动创建订单+合同
```

---

## 二、多智能体系统设计

### Agent 分工

```
┌─────────────────────────────────────┐
│          编排Agent (ai-orchestrator) │  ← 待实现
│          理解意图、路由、组合结果      │
└─────────────────────────────────────┘
         │            │            │
    ┌────▼───┐  ┌─────▼────┐ ┌───▼──────┐
    │设计顾问 │  │ 方案Agent │ │ 渲染Agent │  ← 待实现
    │(ai-chat)│  │(proposal- │ │(scene-    │
    │         │  │ generator)│ │ renderer) │
    │✅ 已实现│  │✅ 已实现   │ │⏳ 待实现   │
    └────────┘  └──────────┘ └──────────┘
         │            │
    ┌────▼───┐  ┌─────▼────┐
    │知识RAG  │  │ 成本引擎  │
    │Agent    │  │(cost-    │
    │⏳ 待实现 │  │ engine)  │
    └────────┘  │✅ 已实现   │
                └──────────┘
```

### 已实现 Agent

| Agent | 云函数 | 状态 | 能力 |
|-------|--------|------|------|
| 设计顾问 | `ai-chat` | ✅ | 多轮对话、渐进式需求提取、LLM不可用时规则引擎降级 |
| 方案生成 | `proposal-generator` | ✅ | LLM生成道具清单+设计理念 → 成本引擎核算 → 输出客户报价+策划师利润 |
| 成本引擎 | `common/cost-engine.js` | ✅ | 自动计算每项成本底价、人工配置、运输方案、平台消耗、综合报价 |

### 待实现 Agent

| Agent | 功能 | 优先级 |
|-------|------|--------|
| 编排Agent (`ai-orchestrator`) | 统一入口，自动路由到设计顾问/方案/渲染 | P1 |
| 场景渲染 Agent (`scene-renderer`) | 场地上传 → AI效果图生成 → 新人标注反馈 | P1 |
| 知识RAG Agent | knowledge集合向量化 → 语义检索武汉婚礼知识 | P2 |

---

## 三、成本利润引擎

### 文件：`cloudfunctions/common/cost-engine.js`

### 成本核算模型

```
客户报价 = 硬成本 + 人工成本 + 运营分摊 + 利润(默认35%)

硬成本:
  ├── 道具折旧（自有道具按 lifetime 分摊到每次使用）
  ├── 道具租赁（外部租赁按市场价）
  ├── 花材（主桌花/餐桌花/路引花/手捧花...）
  ├── 消耗品补充（硬成本 × 2%：胶带/扎带/清洁等）
  ├── 保险（¥200/次）
  └── 意外损耗准备金（硬成本 × 3%）

人工成本:
  ├── 策划师: ¥800/人天 × 2天 × 1人 = ¥1,600
  ├── 工程主管: ¥600/人天 × 1天 × 1人 = ¥600
  ├── 婚礼管家: ¥500/人天 × 1天 × 1人 = ¥500
  ├── 搭建工人: ¥400/人天 × 1.5天 × (2+桌数/5)人
  └── 花艺师: ¥600/人天 × 1天 × 1人 = ¥600

运营分摊:
  ├── 运输：根据道具总量估算车型(小面¥150/中面¥300/大车¥600) × 2趟
  └── 平台：LLM token ¥0.5 + 图片生成 ¥2 + 云函数 ¥0.5 ≈ ¥3/次方案

利润:
  └── 默认按总成本 × 35%
```

### 策划师视图 vs 客户视图

**客户看到的**（透明报价）:
| 项目 | 金额 |
|------|------|
| 场景道具 | ¥1,470 |
| 花艺设计 | ¥1,990 |
| 灯光音响 | ¥220 |
| 人工服务 | ¥5,300 |
| 运输物流 | ¥600 |
| 综合服务费 | ¥3,347 |
| **合计** | **¥12,927** |

**策划师看到的**（只有自己知道）:
| 项目 | 成本 | 说明 |
|------|------|------|
| 道具折旧 | ¥1,470 | 自有道具按次数分摊 |
| 花材 | ¥1,990 | 花农直接采购价 |
| 消耗品 | ¥95 | 胶带扎带清洁等 |
| 保险 | ¥200 | 活动责任险 |
| 意外损耗 | ¥143 | 3% 风险准备金 |
| 策划师 | ¥1,600 | 2天人工 |
| 工程主管 | ¥600 | 1天人工 |
| 婚礼管家 | ¥500 | 1天人工 |
| 搭建工人(4人) | ¥2,400 | 1.5天 |
| 花艺师 | ¥600 | 1天人工 |
| 运输 | ¥600 | 中面 × 2趟 |
| 平台Token | ¥3 | AI+云服务 |
| **总成本** | **¥10,201** | |
| **客户报价** | **¥12,927** | |
| **毛利润** | **¥2,726** | 利润率 26.6%/毛利率 21.1% |

---

## 四、数据模型变更

### 新增集合

| 集合 | 用途 | 关键字段 |
|------|------|---------|
| `design_sessions` | AI对话会话 | extracted需求/messages对话历史/status状态 |
| `proposals` | AI生成的方案 | propList/costBreakdown/plannerView成本/summary利润 |

### 已有集合变更

| 集合 | 变更 |
|------|------|
| `orders` | +proposalId 关联方案 |
| `contracts` | 由方案确认自动创建，不再手动填写 |

---

## 五、新增云函数

| 云函数 | 目录 | 主要 actions |
|--------|------|-------------|
| `ai-chat` | `cloudfunctions/ai-chat/` | chat / history / sessions / extract |
| `proposal-generator` | `cloudfunctions/proposal-generator/` | generate / regenerate / detail / plannerDetail / confirm |

### 共享模块

| 模块 | 路径 | 用途 |
|------|------|------|
| LLM 调用 | `common/llm.js` | DeepSeek/OpenAI/通义千问统一调用 |
| 成本引擎 | `common/cost-engine.js` | 自动成本核算+报价生成+利润分析 |
| 工具函数 | `utils.js` | ok/fail/safe/validate 等（各云函数内复制） |

---

## 六、前端改造

### 页面变更

| 页面 | 状态 | 说明 |
|------|------|------|
| `pages/home/home` | ✅ 已改造 | AI 设计对话首页，替代旧案例瀑布流 |
| `pages/contact/contact` | ✅ 已改造 | 精选案例馆：瀑布流展示 + 风格筛选 + AI设计入口 |
| `pages/case-edit/` | ❌ 从 app.json 移除 | 功能被 AI 对话覆盖 |
| `pages/case-manage/` | ❌ 从 app.json 移除 | 功能被 AI 对话覆盖 |
| `pages/style-quiz/` | ❌ 从 app.json 移除 | 功能被 AI 对话覆盖 |
| 其余页面 | 保留 | dashboard/orders/contracts/hotels/props/clients/schedule/search |

### API 层新增

文件：`miniprogram/services/api.js`

```js
// AI 设计对话
api.aiChat.chat({ sessionId, message, role })
api.aiChat.history({ sessionId })
api.aiChat.sessions({ page, pageSize })
api.aiChat.extract({ sessionId })

// AI 方案生成
api.proposalAi.generate({ sessionId, venueId, options })
api.proposalAi.regenerate({ proposalId, feedback })
api.proposalAi.detail({ proposalId })
api.proposalAi.plannerDetail({ proposalId })
api.proposalAi.confirm({ proposalId })
```

---

## 七、待补充功能清单

### 🔴 P0 — 当前必须完成

1. **DeepSeek API Key 配置** — 环境变量 `DEEPSEEK_API_KEY` 需在云函数设置
   - 文件：`cloudfunctions/ai-chat/` 和 `cloudfunctions/proposal-generator/`
   - 获取：https://platform.deepseek.com/api_keys

2. **LLM 引用路径修复** — proposal-generator 需引用 `../common/llm`（当前引用 `./cost-engine` 是正确的）
   - ⚠️ ai-chat 引用 `../common/llm` 的方式在微信云函数环境下可能不工作（云函数间不能共享代码）
   - 解决方案：将 `common/llm.js` 复制到 `ai-chat/llm.js`，修改引用路径

3. **小程序前端 API 端到端测试** — 确认 `api.aiChat.chat()` 能正确调用 `ai-chat` 云函数

### 🟡 P1 — 核心能力补充

4. **场景渲染 Agent** (`cloudfunctions/scene-renderer/`)
   - 输入：场地照片 + 尺寸 + 风格
   - 调用图片生成 API（通义万相 / Stable Diffusion）
   - 输出：多角度效果图

5. **编排 Agent** (`cloudfunctions/ai-orchestrator/`)
   - 统一 AI 入口，自动路由到设计顾问/方案/渲染
   - 多Agent协作流程编排

6. **策划师小程序端显示成本利润**
   - 在 `pages/order-detail/` 增加策划师专属"成本详情"Tab
   - 调用 `api.proposalAi.plannerDetail()`

7. **场地档案升级** (`pages/hotels/` → `pages/venue-profile/`)
   - 增加场地照片、尺寸、柱子位置、电力接口等字段
   - 用于效果图生成时的输入

### 🟢 P2 — 体验优化

8. **知识库 RAG 向量化** — knowledge集合 → embedding → 语义检索
9. **图片标注组件** — 新人在效果图上标注修改意见
10. **方案分享卡片生成** — Canvas 绘制分享图
11. **LLM API 环境变量统一管理** — 所有 Agent 云函数的环境变量配置文档

---

## 八、部署前检查清单

- [ ] 在微信云开发控制台创建云函数 `ai-chat` 和 `proposal-generator`
- [ ] 配置环境变量 `DEEPSEEK_API_KEY`
- [ ] 将 `common/llm.js` 内容复制到 `ai-chat/llm.js`（云函数不能跨目录引用）
- [ ] 将 `common/cost-engine.js` 内容确认已复制到 `proposal-generator/cost-engine.js`
- [ ] 创建数据库集合 `design_sessions` 和 `proposals`
- [ ] 上传部署云函数
- [ ] 微信开发者工具编译测试
- [ ] 走通完整流程：AI对话 → 生成方案 → 确认 → 创建订单

---

> **文档版本记录**
> v3.0 (2026-06-21) — AI 重构初版：多智能体架构 + 成本利润引擎 + 设计对话首页
> v2.3 (2026-06-17) — 垂直化改造：获客→转化→交付闭环
