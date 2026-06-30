# 大喜的日子 · UI 设计规格文档

> **项目代号**：DaxiWedding  
> **版本**：v1.1 | 2026-06-24  
> **设计语言**：轻复古·奶油风 暖白基底 + 香槟金点缀  
> **文档定位**：UI/UX 设计规范 · 面向设计与开发团队

---

## 一、设计理念

### 1.1 审美方向

**核心概念**：「轻复古·奶油风」—— 暖白基底搭配香槟金点缀，营造治愈、浪漫的浏览体验。通过圆润的大圆角、柔和的毛玻璃效果和极简的卡片设计，传递温柔与精致。

**设计关键词**：
- **温柔**：暖白基底，避免强烈对比
- **精致**：香槟金点缀，提升品质感
- **治愈**：圆润大圆角 (16px) + 暖色分割线
- **呼吸感**：大量留白，舒适的视觉节奏
- **质感**：毛玻璃效果，提升层次感

**风格定位**：轻复古·奶油风，暖白基底 + 香槟金点缀。

### 1.2 核心差异化

| 维度 | 传统婚礼平台 | 大喜的日子 |
|------|------------|-----------|
| **色彩** | 高饱和红/粉，视觉疲劳 | 暖白基底 + 香槟金点缀，高级感 |
| **质感** | 扁平/渐变，缺乏层次 | 毛玻璃 + 极淡阴影，有温度 |
| **排版** | 信息密集，压迫感 | 大量留白，呼吸感强 |
| **交互** | 生硬切换 | 卡片点击缩放 0.98，柔和呼吸反馈 |

### 1.3 设计原则

1. **Less is More**：减少视觉噪音，突出核心内容
2. **Emotional Design**：通过色彩和质感传递浪漫情感
3. **Consistency**：跨端统一的设计语言，建立品牌认知
4. **Accessibility**：保证可读性和易用性，兼顾美观与功能
5. **Performance**：性能优先，大图仅占位示意，实际小程序需 WebP 压缩

---

## 二、色彩系统

### 2.1 核心色板（轻复古·奶油风）

```css
/* ═══ 核心色板 — 暖白基底 + 香槟金点缀 ═══ */

/* 主背景 */
--bg-primary:    #FFF9F2;   /* 暖白基底，页面主背景 */

/* 卡片背景 */
--bg-card:       #FFFFFF;   /* 纯白卡片 */

/* 品牌金（主色） */
--gold:          #D4AF37;   /* 香槟金，品牌主色 */

/* 辅助金（浅） */
--gold-light:    #F5E6C8;   /* 浅金，标签底色、边框、装饰 */

/* 主文字 */
--text-primary:  #2C2C2C;   /* 深灰主文字 */

/* 次要文字 */
--text-secondary:#8C8C8C;   /* 中灰辅助文字 */

/* 毛玻璃底色 */
--glass-bg:      rgba(255, 255, 255, 0.72);  /* 半透明白底 */
```

### 2.2 色彩衍生

```css
/* ═══ 渐变 ═══ */
--gradient-gold: linear-gradient(135deg, #D4AF37 0%, #E8C86A 100%);
--gradient-warm: linear-gradient(180deg, #FFF9F2 0%, #FFFFFF 100%);

/* ═══ 边框 ═══ */
--border-light:  1px solid #F5E6C8;  /* 轻边框 */
--divider:       #F5E6C8;            /* 暖色分割线 */

/* ═══ 状态色（保持低饱和） ═══ */
--success:       #67C23A;
--warning:       #E6A23C;
--error:         #F56C6C;
--info:          #909399;

/* ═══ 遮罩 ═══ */
--bg-overlay:    rgba(44, 44, 44, 0.5);
```

### 2.3 色彩使用比例

| 色彩类型 | 占比 | 用途 |
|---------|------|------|
| **暖白基底** | 60% | 页面背景、留白 |
| **纯白卡片** | 20% | 卡片、内容容器 |
| **香槟金** | 12% | 按钮、图标、强调元素 |
| **浅金** | 6% | 标签底色、边框、装饰 |
| **文字色** | 2% | 文字内容 |

---

## 三、字体规范

### 3.1 字体家族

```css
/* 中文主字体 */
--font-family: 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif;

/* 英文/数字展示字体 */
--font-display: 'Playfair Display', 'Georgia', serif;
```

### 3.2 字号层级（基于提示词）

```css
/* H1 大标题 */
--font-size-h1: 24px;     /* 行高 32px (48rpx) */

/* H2 中标题 */
--font-size-h2: 18px;     /* 行高 26px (36rpx) */

/* H3 小标题 */
--font-size-h3: 16px;     /* 行高 22px (28rpx) */

/* 正文 */
--font-size-body: 14px;   /* 行高 20px (26rpx) */

/* 辅助文字 */
--font-size-caption: 12px; /* 行高 18px (22rpx) */
```

### 3.3 字重规范

```css
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### 3.4 字体应用

| 场景 | 字号 | 字重 | 颜色 |
|------|------|------|------|
| **页面主标题** | 24px | Bold | #2C2C2C |
| **区块标题** | 18px | Semibold | #2C2C2C |
| **卡片标题** | 16px | Medium | #2C2C2C |
| **正文** | 14px | Regular | #2C2C2C |
| **辅助文字** | 12px | Regular | #8C8C8C |
| **按钮文字** | 14px | Medium | #FFFFFF |
| **标签** | 12px | Medium | #D4AF37 |

---

## 四、间距与栅格系统

### 4.1 间距系统（基于提示词）

```css
/* 间距层级 */
--spacing-sm: 8px;    /* 紧凑元素间距 */
--spacing-md: 12px;   /* 标准元素间距 */
--spacing-lg: 16px;   /* 区块内间距 */
```

### 4.2 圆角系统（基于提示词）

```css
/* 圆角层级 */
--radius-sm: 6px;     /* 小按钮、标签 */
--radius-md: 10px;    /* 按钮、输入框 */
--radius-lg: 16px;    /* 卡片、大容器 */
```

### 4.3 阴影系统

```css
/* 卡片阴影（极淡） */
--shadow-card: 0 2px 8px rgba(0, 0, 0, 0.04);

/* 按钮阴影 */
--shadow-btn: 0 2px 4px rgba(212, 175, 55, 0.2);

/* 悬浮阴影 */
--shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.08);
```

### 4.4 边框系统

```css
/* 轻边框 */
--border-light: 1px solid #F5E6C8;

/* 暖色分割线 */
--divider: #F5E6C8;
```

---

## 五、核心组件规范

### 5.1 主按钮

```css
.btn-primary {
  background: linear-gradient(135deg, #D4AF37 0%, #E8C86A 100%);
  border-radius: 10px;
  padding: 12px 24px;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(212, 175, 55, 0.2);
  transition: all 0.2s ease;
}

.btn-primary:active {
  transform: scale(0.98);
}
```

### 5.2 卡片

```css
.card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #F5E6C8;
}

.card:active {
  transform: scale(0.98);
}
```

### 5.3 毛玻璃效果

```css
/* 仅用于顶部导航 & 底部栏 */
.glass {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
```

**毛玻璃策略**：仅用于顶部导航 & 底部栏，提升质感且不卡顿。

### 5.4 标签 (Tag)

```css
.tag {
  background: #F5E6C8;
  color: #D4AF37;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}
```

### 5.5 输入框

```css
.input {
  background: #FFFFFF;
  border: 1px solid #F5E6C8;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  color: #2C2C2C;
  transition: border-color 0.2s ease;
}

.input:focus {
  border-color: #D4AF37;
}
```

---

## 六、交互规范

### 6.1 动效原则

**卡片点击缩放 0.98，柔和呼吸反馈，摒弃机械水波纹。**

```css
/* 点击反馈 */
.tap-feedback:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

/* 柔和过渡 */
.transition-smooth {
  transition: all 0.2s ease;
}
```

### 6.2 交互反馈

| 元素 | 反馈效果 | 时长 |
|------|----------|------|
| **按钮** | scale(0.98) | 100ms |
| **卡片** | scale(0.98) | 100ms |
| **输入框聚焦** | border-color 变化 | 200ms |
| **页面切换** | 淡入淡出 | 300ms |

### 6.3 性能优先原则

- **大图仅占位示意**，实际小程序需 WebP 压缩
- **毛玻璃仅用于导航栏和底部栏**，避免性能问题
- **避免复杂动画**，保持流畅体验

---

## 七、前端技术架构

### 7.1 整体架构

采用 **Monorepo** 架构，三端（小程序、Web、管理后台）共享类型定义与业务逻辑，统一技术栈降低维护成本。

```
daxi-wedding/
├── packages/
│   ├── shared/              # 共享类型、工具函数、常量
│   ├── miniprogram/         # Taro (React) 小程序
│   ├── web/                 # Next.js 14 官网
│   └── admin/               # Vite + Ant Design Pro 管理后台
├── turbo.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

### 7.2 技术选型

| 层级 | 技术选型 | 作用 |
|------|---------|------|
| **代码管理** | pnpm + Turborepo | Monorepo 管理，高效共享逻辑 |
| **小程序端** | Taro (React) + NutUI / Taroify | 双角色切换，兼顾性能与流畅 |
| **Web 官网** | Next.js 14 + Tailwind CSS | SEO 优化 + 营销落地页，支持 AI 交互演示 |
| **管理后台** | Vite + Ant Design Pro | 快速搭建复杂表格、表单、仪表盘 |
| **状态管理** | Zustand（跨端轻量） | 管理登录态、角色权限、AI 对话上下文 |
| **API 请求** | TanStack Query (React-Query) | 统一管理异步状态、缓存、轮询（图片生成用） |
| **类型安全** | TypeScript 严格模式 | 确保三端数据模型一致 |

### 7.3 小程序端架构（Taro + React）

```
packages/miniprogram/
├── src/
│   ├── app.config.ts          # 全局配置
│   ├── app.tsx                # 入口
│   ├── pages/
│   │   ├── home/              # AI 设计对话首页
│   │   ├── cases/             # 精选案例馆
│   │   ├── profile/           # 我的（新人端）
│   │   ├── planner-home/      # 策划师工作台
│   │   ├── planner-orders/    # 策划师订单
│   │   └── planner-profile/   # 策划师我的
│   ├── components/            # 公共组件
│   ├── stores/                # Zustand 状态
│   │   ├── auth.ts            # 登录态 + 角色权限
│   │   ├── chat.ts            # AI 对话上下文
│   │   └── planner.ts         # 策划师状态
│   ├── services/              # API 请求层（TanStack Query）
│   ├── hooks/                 # 自定义 Hooks
│   ├── types/                 # 从 shared 导入 + 本地扩展
│   └── styles/                # 全局样式 + Design Tokens
├── project.config.json
└── package.json
```

**关键决策**：
- **双角色切换**：新人端 / 策划师端通过 Tab 切换，共享同一小程序实例
- **NutUI / Taroify**：优先 NutUI（京东出品，Taro 官方推荐），Taroify 作为补充
- **Zustand**：轻量（< 1KB），跨端兼容好，适合管理对话上下文等频繁更新场景

### 7.4 Web 官网架构（Next.js 14）

```
packages/web/
├── src/
│   ├── app/                   # App Router
│   │   ├── page.tsx           # 首页
│   │   ├── cases/             # 案例作品
│   │   ├── process/           # 服务流程
│   │   ├── about/             # 关于我们
│   │   └── api/               # API Routes（AI 交互演示）
│   ├── components/            # React Server/Client Components
│   ├── styles/                # Tailwind CSS 配置
│   └── lib/                   # 工具函数
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

**关键决策**：
- **Next.js 14 App Router**：SSR/SSG 混合渲染，SEO 友好
- **Tailwind CSS**：原子化 CSS，与设计 Tokens 对齐
- **AI 交互演示**：通过 API Routes 提供轻量对话体验（无需登录即可试用）

### 7.5 管理后台架构（Vite + Ant Design Pro）

```
packages/admin/
├── src/
│   ├── pages/
│   │   ├── dashboard/         # 仪表盘
│   │   ├── cases/             # 案例管理
│   │   ├── articles/          # 文章管理
│   │   ├── images/            # 图库管理
│   │   ├── orders/            # 订单管理
│   │   ├── clients/           # 客户管理
│   │   ├── hotels/            # 酒店管理
│   │   ├── props/             # 道具管理
│   │   └── contracts/         # 合同管理
│   ├── components/            # 公共组件
│   ├── services/              # API 请求（TanStack Query）
│   ├── stores/                # Zustand 状态
│   └── layouts/               # 布局组件
├── vite.config.ts
└── package.json
```

### 7.6 共享层设计

```typescript
// packages/shared/src/types/index.ts
/** 统一数据模型 — 三端共享 */

// 用户 & 角色
export type Role = 'newcomer' | 'planner' | 'admin'
export interface User {
  id: string
  phone: string
  nickname: string
  avatar?: string
  role: Role
}

// 案例
export interface Case {
  id: string
  coupleName: string
  style: CaseStyle
  venue: string
  budgetRange: string
  tags: string[]
  coverUrl: string
  images: string[]
  status: 'draft' | 'published' | 'archived'
  createdAt: string
}

export type CaseStyle = '新中式' | '韩式' | '森系' | '法式' | '现代' | '户外'

// AI 对话
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  images?: string[]
}

// 订单
export interface Order {
  id: string
  clientName: string
  clientPhone: string
  weddingDate: string
  venue: string
  budget: number
  status: OrderStatus
  plannerId?: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
```

### 7.7 模块边界规范

为确保代码可维护性和团队协作效率，按业务功能划分清晰的模块边界，遵循**单一职责原则**。

#### 7.7.1 模块划分总览

| 模块 | 目录名 | 核心职责 | 包含功能 | 依赖模块 |
|------|--------|---------|---------|---------|
| **认证模块** | `auth/` | 登录、注册、角色切换 | 验证码登录、OAuth、角色权限管理 | 用户模块 |
| **用户模块** | `user/` | 用户信息、个人资料 | 个人信息、头像、偏好设置 | 无 |
| **AI对话模块** | `chat/` | AI对话、上下文管理 | 多轮对话、对话历史、AI生图 | 案例模块（展示推荐） |
| **案例模块** | `case/` | 案例展示、详情 | 案例列表、案例详情、筛选、收藏 | 无 |
| **订单模块** | `order/` | 订单管理 | 订单列表、订单详情、状态流转 | 用户模块、财务模块 |
| **内容模块** | `content/` | 文章、攻略、知识库 | 文章列表、文章详情、分类 | 无 |
| **资源模块** | `resource/` | 酒店、道具、供应商 | 酒店列表、道具列表、供应商管理 | 无 |
| **财务模块** | `finance/` | 预算、成本、利润 | 预算计算器、成本分析、利润引擎 | 订单模块 |
| **设置模块** | `settings/` | 系统设置、通知 | 通知设置、隐私设置、主题切换 | 用户模块 |
| **仪表盘模块** | `dashboard/` | 数据统计、概览 | 数据看板、快捷操作、待办事项 | 订单模块、财务模块 |

#### 7.7.2 模块目录结构规范

每个模块遵循统一的目录结构，确保**职责内聚**：

```
packages/miniprogram/src/modules/
├── auth/                          # 认证模块
│   ├── components/                # 模块专属组件
│   │   ├── LoginForm.tsx          # 登录表单
│   │   ├── VerifyCode.tsx         # 验证码输入
│   │   └── RoleSwitcher.tsx       # 角色切换器
│   ├── hooks/                     # 模块专属 Hooks
│   │   ├── useAuth.ts             # 认证状态
│   │   └── useLogin.ts            # 登录逻辑
│   ├── services/                  # 模块 API 请求
│   │   └── authApi.ts             # 认证相关 API
│   ├── stores/                    # 模块状态
│   │   └── authStore.ts           # Zustand 状态
│   ├── types/                     # 模块类型定义
│   │   └── auth.ts
│   ├── pages/                     # 模块页面
│   │   ├── login/                 # 登录页
│   │   └── register/              # 注册页
│   └── index.ts                   # 模块导出入口
│
├── chat/                          # AI对话模块
│   ├── components/
│   │   ├── ChatBubble.tsx         # 对话气泡
│   │   ├── ChatInput.tsx          # 输入框
│   │   ├── MessageList.tsx        # 消息列表
│   │   └── ImagePreview.tsx       # 图片预览（AI生图）
│   ├── hooks/
│   │   ├── useChat.ts             # 对话逻辑
│   │   └── useChatHistory.ts      # 历史记录
│   ├── services/
│   │   └── chatApi.ts
│   ├── stores/
│   │   └── chatStore.ts           # 对话上下文状态
│   ├── types/
│   │   └── chat.ts
│   ├── pages/
│   │   └── home/                  # AI对话首页
│   └── index.ts
│
├── case/                          # 案例模块
│   ├── components/
│   │   ├── CaseCard.tsx           # 案例卡片
│   │   ├── CaseGrid.tsx           # 案例网格
│   │   ├── CaseFilter.tsx         # 筛选器
│   │   └── CaseGallery.tsx        # 图片画廊
│   ├── hooks/
│   │   ├── useCases.ts
│   │   └── useCaseDetail.ts
│   ├── services/
│   │   └── caseApi.ts
│   ├── types/
│   │   └── case.ts
│   ├── pages/
│   │   ├── cases/                 # 案例列表页
│   │   └── case-detail/           # 案例详情页
│   └── index.ts
│
├── order/                         # 订单模块
│   ├── components/
│   │   ├── OrderCard.tsx          # 订单卡片
│   │   ├── OrderTimeline.tsx      # 订单时间线
│   │   └── OrderStatus.tsx        # 订单状态
│   ├── hooks/
│   │   ├── useOrders.ts
│   │   └── useOrderDetail.ts
│   ├── services/
│   │   └── orderApi.ts
│   ├── types/
│   │   └── order.ts
│   ├── pages/
│   │   ├── orders/                # 订单列表页
│   │   └── order-detail/          # 订单详情页
│   └── index.ts
│
└── ... (其他模块同理)
```

#### 7.7.3 模块依赖规则

**原则**：模块间通过**接口（Interface）**通信，禁止直接依赖实现细节。

```typescript
// ✅ 正确：通过接口通信
// packages/shared/types/order.ts
export interface OrderService {
  getOrder(id: string): Promise<Order>;
  createOrder(data: CreateOrderDTO): Promise<Order>;
}

// packages/miniprogram/src/modules/order/services/orderApi.ts
import { OrderService } from '@daxi-wedding/shared';

export const orderService: OrderService = {
  async getOrder(id) {
    return await api.get(`/orders/${id}`);
  },
  async createOrder(data) {
    return await api.post('/orders', data);
  },
};

// ❌ 错误：直接依赖其他模块的实现
import { chatStore } from '../chat/stores/chatStore'; // 禁止！
```

**依赖方向**：

```
┌─────────────────────────────────────────┐
│         页面层 (pages/)                  │
│  可依赖任意模块，负责组合和路由            │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         业务模块层 (modules/)            │
│  模块间通过接口通信，禁止循环依赖          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         共享层 (packages/shared)         │
│  类型定义、工具函数、常量                 │
└─────────────────────────────────────────┘
```

#### 7.7.4 组件复用规则

**原则**：优先复用，禁止重复造轮子。

| 组件类型 | 存放位置 | 复用规则 |
|---------|---------|---------|
| **UI 基础组件** | `packages/shared/components/` | 三端共享，纯样式，无业务逻辑 |
| **业务组件** | `modules/[module]/components/` | 模块专属，不跨模块复用 |
| **跨端业务组件** | `packages/shared/components/business/` | 需抽象为纯逻辑，无端特有标签 |

**示例**：

```typescript
// ✅ 正确：复用共享组件
import { Button, Card } from '@daxi-wedding/shared/components';

// ✅ 正确：使用模块专属组件
import { CaseCard } from '../components/CaseCard';

// ❌ 错误：在模块内重新实现已有组件
const MyButton = () => <button>...</button>; // 禁止！
```

#### 7.7.5 状态管理规范

**原则**：状态就近管理，避免全局状态污染。

| 状态类型 | 管理方式 | 示例 |
|---------|---------|------|
| **UI 状态** | 组件内 `useState` | 弹窗开关、表单输入 |
| **模块状态** | 模块 `stores/` (Zustand) | 对话上下文、订单列表 |
| **全局状态** | `packages/shared/stores/` | 用户信息、角色权限 |

```typescript
// ✅ 正确：模块状态放在模块内
// packages/miniprogram/src/modules/chat/stores/chatStore.ts
import { create } from 'zustand';

interface ChatState {
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, msg],
  })),
}));

// ❌ 错误：所有状态都放在全局
// packages/shared/stores/globalStore.ts
interface GlobalState {
  chatMessages: ChatMessage[];  // 禁止！
  orderList: Order[];           // 禁止！
}
```

#### 7.7.6 API 请求规范

**原则**：使用 TanStack Query 统一管理，禁止在组件内直接调用 `wx.request` 或 `fetch`。

```typescript
// ✅ 正确：使用 TanStack Query
// packages/miniprogram/src/modules/case/services/caseApi.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { caseApi } from './api';

export const useCases = (filters?: CaseFilter) => {
  return useQuery({
    queryKey: ['cases', filters],
    queryFn: () => caseApi.getCases(filters),
  });
};

export const useCreateCase = () => {
  return useMutation({
    mutationFn: (data: CreateCaseDTO) => caseApi.createCase(data),
    onSuccess: () => {
      // 刷新列表
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
};

// ❌ 错误：在组件内直接调用
const MyComponent = () => {
  useEffect(() => {
    wx.request({  // 禁止！
      url: '/api/cases',
      success: (res) => setCases(res.data),
    });
  }, []);
};
```

#### 7.7.7 模块通信模式

**场景**：模块间需要通信时，使用**事件总线**或**共享状态**。

```typescript
// 方式 1：事件总线（适合松耦合）
// packages/shared/utils/eventBus.ts
import { EventEmitter } from 'events';

export const eventBus = new EventEmitter();

// 发送事件
eventBus.emit('order:created', order);

// 监听事件
eventBus.on('order:created', (order) => {
  // 处理订单创建
});

// 方式 2：共享状态（适合强关联）
// packages/shared/stores/userStore.ts
export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// 任何模块都可以读取用户信息
const MyComponent = () => {
  const user = useUserStore((state) => state.user);
};
```

#### 7.7.8 模块边界检查清单

开发新模块时，确保遵循以下规则：

- [ ] **单一职责**：模块只负责一个业务领域
- [ ] **目录结构**：遵循统一的 `components/hooks/services/stores/types/pages` 结构
- [ ] **依赖方向**：只能依赖共享层，不能循环依赖其他模块
- [ ] **组件复用**：优先使用 `packages/shared/components` 中的组件
- [ ] **状态管理**：模块状态放在模块内，全局状态放在共享层
- [ ] **API 请求**：统一使用 TanStack Query，禁止直接调用原生 API
- [ ] **类型定义**：模块类型放在 `modules/[module]/types/`，共享类型放在 `packages/shared/types/`
- [ ] **导出入口**：每个模块必须有 `index.ts` 作为统一导出入口

---

### 7.8 跨端设计统一规范

为确保小程序（Taro）、Web 官网（Next.js）、管理后台（Ant Design Pro）三端视觉一致性，定义以下统一设计变量和组件规范。

#### 7.8.1 统一设计变量（Design Tokens）

这是所有端视觉一致的基石。将设计变量转化为跨端 CSS 变量，三端同时引用。

| 变量分类 | 变量名 | 值（Web/PX） | 值（小程序/rpx） | 用途 |
|---------|--------|-------------|----------------|------|
| **品牌色** | `--color-primary` | `#D4AF37` | `#D4AF37` | 主按钮、焦点、价格 |
| **品牌渐变** | `--color-primary-gradient` | `linear-gradient(135deg, #D4AF37, #E8C86A)` | 同左 | 主按钮背景、重要徽章 |
| **背景色** | `--color-bg` | `#FFF9F2` | `#FFF9F2` | 页面基底（奶油白） |
| **卡片背景** | `--color-card` | `#FFFFFF` | `#FFFFFF` | 卡片、弹窗、输入框 |
| **主文字** | `--color-text-primary` | `#2C2C2C` | `#2C2C2C` | 标题、正文 |
| **次要文字** | `--color-text-secondary` | `#8C8C8C` | `#8C8C8C` | 辅助说明、日期 |
| **边框/分割线** | `--color-border` | `#F5E6C8` | `#F5E6C8` | 淡金分割线、描边 |
| **圆角-按钮（胶囊）** | `--radius-btn` | `9999px` | `9999rpx` | 按钮（全圆角胶囊型） |
| **圆角-卡片** | `--radius-card` | `24px` | `48rpx` | 卡片、大容器 |
| **圆角-输入框** | `--radius-input` | `10px` | `20rpx` | 输入框、表单 |
| **圆角-标签** | `--radius-tag` | `12px` | `24rpx` | 标签、小徽章 |
| **圆角-大** | `--radius-lg` | `16px` | `32rpx` | 大弹窗、底部操作栏 |
| **阴影-卡片** | `--shadow-card` | `0 2px 8px rgba(0,0,0,0.04)` | `0 4rpx 16rpx rgba(0,0,0,0.04)` | 卡片、下拉菜单 |
| **间距-标准** | `--spacing-md` | `12px` | `24rpx` | 组件内边距、元素间距 |
| **按钮高度-标准** | `--btn-height` | `48px` | `96rpx` | 主按钮、CTA |
| **按钮高度-小** | `--btn-height-sm` | `32px` | `64rpx` | 次要按钮 |
| **输入框高度** | `--input-height` | `48px` | `96rpx` | 输入框 |
| **卡片内边距** | `--card-padding` | `24px` | `48rpx` | 卡片内边距 |
| **正文字号** | `--font-size-body` | `14px` | `28rpx` | 正文内容 |

**CSS 变量定义示例**：

```css
/* packages/shared/styles/tokens.css */
:root {
  /* 品牌色 */
  --color-primary: #D4AF37;
  --color-primary-gradient: linear-gradient(135deg, #D4AF37, #F3E5AB);
  
  /* 背景色 */
  --color-bg: #FFF9F2;
  --color-card: #FFFFFF;
  
  /* 文字色 */
  --color-text-primary: #2C2C2C;
  --color-text-secondary: #8C8C8C;
  --color-text-hint: #BFBFBF;
  
  /* 边框 */
  --color-border: #F5E6C8;
  
  /* 圆角 */
  --radius-md: 10px;
  --radius-lg: 16px;
  
  /* 阴影 */
  --shadow-card: 0 2px 12px rgba(0, 0, 0, 0.06);
  
  /* 间距 */
  --spacing-md: 12px;
}

/* 小程序端（rpx 单位） */
/* packages/miniprogram/src/styles/tokens.wxss */
page {
  --color-primary: #D4AF37;
  --color-primary-gradient: linear-gradient(135deg, #D4AF37, #E8C86A);
  --color-bg: #FFF9F2;
  --color-card: #FFFFFF;
  --color-text-primary: #2C2C2C;
  --color-text-secondary: #8C8C8C;
  --color-text-hint: #BFBFBF;
  --color-border: #F5E6C8;
  --radius-btn: 9999rpx;
  --radius-card: 48rpx;
  --radius-input: 20rpx;
  --radius-tag: 24rpx;
  --radius-lg: 32rpx;
  --shadow-card: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  --spacing-md: 24rpx;
  --btn-height: 96rpx;
  --btn-height-sm: 64rpx;
  --input-height: 96rpx;
  --card-padding: 48rpx;
  --font-size-body: 28rpx;
}
```

#### 7.7.2 界面元素统一规范（跨端对照表）

针对四个核心元素（按钮、输入框、弹窗、表格/列表），定义"原子级"规范，确保在手机和电脑上识别度一致。

| 界面元素 | 小程序 (Taro) | Web 官网 (Next.js) | 管理后台 (Ant Design Pro) | 统一规范细节 |
|---------|--------------|-------------------|-------------------------|------------|
| **按钮** | 圆角 `--radius-btn`（胶囊型 9999rpx），主按钮渐变金，点击缩放 0.98 | 同左，增加 hover 轻微上浮阴影 | 覆盖 AntD 默认变量：`border-radius` 改为 24px（胶囊型），主按钮 `primary-color` 改为 `#D4AF37` | 高度统一：大号 48px/96rpx，中号 36px/72rpx，小号 32px/64rpx。禁用态统一为 `#F5E6C8` 背景 |
| **输入框** | 描边风格，圆角 `--radius-input`（20rpx），聚焦边框变金 | 同左，带极淡内阴影 | 覆盖 `@input-border-color` 为 `#F5E6C8`，`@input-height-base` 为 48px | 占位符颜色统一为 `--color-text-hint` (#BFBFBF)，高度 48px/96rpx |
| **弹窗 (Modal)** | 底部弹出（ActionSheet）或居中卡片，圆角 `--radius-card`（48rpx） | 居中卡片，带 `--shadow-card`，圆角 `--radius-card`（24px） | 覆盖 `@modal-header-border-color` 为透明，`border-radius` 为 24px | 禁止使用 AntD 默认的 4px 小圆角，必须改为 24px 大圆角；头部无底色，仅保留标题 |
| **表格/列表** | 极简无边框卡片列表，行与行间用淡金分割线 | 同左，强调图文混排 | 保留 AntD 表格功能（筛选、排序），但样式覆盖：去掉单元格垂直内边框，仅保留底部 `--color-border` 横线；表头背景改为 `#FFF9F2` | 单元格高度 48px，文字使用 `--color-text-secondary`，操作按钮使用文字链接（金色） |
| **卡片** | 白底 + `--shadow-card` + `--radius-card`（48rpx），内边距 `--card-padding`（48rpx） | 同左，hover 时阴影加深一级 | 覆盖 AntD Card 的 `border-radius` 为 24px，去掉默认 1px 实线边框，改用 `--shadow-card` | 卡片标题字号统一为 `--font-size-h3` (16px/32rpx)，行高 1.5 |
| **标签** | 圆角 `--radius-tag`（24rpx），背景 `--color-border`，文字 `--color-primary` | 同左 | 覆盖 Tag 组件圆角为 12px | 高度 24px/48rpx，内边距 6rpx 20rpx |

**Ant Design Pro 主题配置示例**：

```typescript
// packages/admin/src/themeConfig.ts
import type { ThemeConfig } from 'antd';

export const themeConfig: ThemeConfig = {
  token: {
    // 品牌色
    colorPrimary: '#D4AF37',
    colorLink: '#D4AF37',
    
    // 背景色
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#FFF9F2',
    
    // 文字色
    colorText: '#2C2C2C',
    colorTextSecondary: '#8C8C8C',
    
    // 边框
    colorBorder: '#F5E6C8',
    colorBorderSecondary: '#F5E6C8',
    
    // 圆角
    borderRadius: 10,
    borderRadiusLG: 16,
    
    // 阴影
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
    
    // 输入框
    controlHeight: 36,
  },
  components: {
    Button: {
      controlHeight: 36,
      controlHeightLG: 44,
    },
    Input: {
      controlHeight: 36,
      colorBorder: '#F5E6C8',
      activeBorderColor: '#D4AF37',
    },
    Modal: {
      borderRadiusLG: 16,
      headerBg: 'transparent',
    },
    Card: {
      borderRadiusLG: 10,
      boxShadowTertiary: '0 2px 12px rgba(0, 0, 0, 0.06)',
    },
    Table: {
      headerBg: '#FFF9F2',
      borderColor: '#F5E6C8',
      cellPaddingBlock: 12,
      cellPaddingInline: 16,
    },
  },
};
```

#### 7.7.3 复用组件分层策略

为最大化复用，按以下三层结构组织组件：

**Layer 1：UI 基础组件（纯样式，无业务逻辑）**

- 使用 React + CSS Modules 或 Styled-Components，只依赖上述 CSS 变量
- 封装 `<Button />`, `<Input />`, `<Card />`, `<Modal />` 的底层样式
- 注意：小程序端用 `View`/`Text` 封装，Web 端用 `div`/`span` 封装，保证 API 一致

```typescript
// packages/shared/components/Button.tsx
import React from 'react';
import './Button.css';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

```css
/* packages/shared/components/Button.css */
.btn {
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-primary {
  background: var(--color-primary-gradient);
  color: #FFFFFF;
  border: none;
  box-shadow: var(--shadow-card);
}

.btn-primary:active {
  transform: scale(0.95);
}

.btn-md {
  height: 36px;
  padding: 0 20px;
  font-size: 14px;
}

.btn-lg {
  height: 44px;
  padding: 0 28px;
  font-size: 16px;
}

.btn:disabled {
  background: #F5E6C8;
  cursor: not-allowed;
  opacity: 0.6;
}
```

**Layer 2：框架桥接层（适配层）**

- **管理后台**：编写 `themeConfig.ts`，利用 Ant Design 的 `ConfigProvider` 全局覆盖变量（如 `borderRadius`、`primaryColor`、`fontSize`），让 Ant Design 组件"穿上"我们的设计变量，而无需重写整个表格
- **小程序**：Taro 直接引用 Layer 1 组件，配合 `postcss-pxtransform` 处理单位转换
- **Web 官网**：Next.js 直接使用 Layer 1 组件，配合 Tailwind CSS 补充样式

```typescript
// packages/admin/src/App.tsx
import { ConfigProvider } from 'antd';
import { themeConfig } from './themeConfig';

function App() {
  return (
    <ConfigProvider theme={themeConfig}>
      {/* 所有 AntD 组件自动应用主题 */}
      <YourApp />
    </ConfigProvider>
  );
}
```

**Layer 3：业务组件（跨端复用）**

- 例如 `<CostProfitPanel />`（成本利润引擎）、`<AIChatInput />`（AI 对话输入框）
- 这些组件不包含任何端特有的标签（如 `window` 或 `wx.`），只接收 props 传出数据
- 在小程序里用 Taro 渲染，在官网/后台用 React 渲染，实现逻辑复用

```typescript
// packages/shared/components/CostProfitPanel.tsx
import React from 'react';
import { Card } from './Card';
import { formatCurrency } from '../utils/format';

interface CostProfitPanelProps {
  totalCost: number;
  profit: number;
  profitRate: number;
  suggestedRange: {
    minimum: number;
    standard: number;
    premium: number;
  };
}

export const CostProfitPanel: React.FC<CostProfitPanelProps> = ({
  totalCost,
  profit,
  profitRate,
  suggestedRange,
}) => {
  return (
    <Card>
      <div className="cost-profit-panel">
        <div className="row">
          <span className="label">总成本</span>
          <span className="value">{formatCurrency(totalCost)}</span>
        </div>
        <div className="row">
          <span className="label">利润</span>
          <span className="value profit">{formatCurrency(profit)}</span>
        </div>
        <div className="row">
          <span className="label">利润率</span>
          <span className="value">{(profitRate * 100).toFixed(1)}%</span>
        </div>
        <div className="divider" />
        <div className="row">
          <span className="label">建议报价</span>
          <span className="value">
            {formatCurrency(suggestedRange.minimum)} - {formatCurrency(suggestedRange.premium)}
          </span>
        </div>
      </div>
    </Card>
  );
};
```

**组件复用架构图**：

```
┌─────────────────────────────────────────────────────────┐
│                  Layer 3: 业务组件                        │
│  <CostProfitPanel />  <AIChatInput />  <CaseCard />     │
│  （纯逻辑 + props，无端特有标签）                          │
├─────────────────────────────────────────────────────────┤
│                  Layer 2: 框架桥接层                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Taro 适配     │  │ Next.js 适配  │  │ AntD 主题     │  │
│  │ (rpx 转换)    │  │ (Tailwind)   │  │ (ConfigProvider)│ │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
├─────────────────────────────────────────────────────────┤
│                  Layer 1: UI 基础组件                     │
│  <Button />  <Input />  <Card />  <Modal />  <Tag />    │
│  （纯样式，依赖 CSS 变量，API 一致）                       │
├─────────────────────────────────────────────────────────┤
│                  Design Tokens                           │
│  --color-primary  --radius-md  --shadow-card  ...       │
│  （跨端 CSS 变量，三端共享）                               │
└─────────────────────────────────────────────────────────┘
```

---

## 八、小程序端设计规范

### 8.1 新人端页面结构

#### Tab 1：AI 设计对话首页

**页面用途**：核心功能入口，通过多轮对话收集需求并生成方案

**布局结构**：

```
┌─────────────────────────────────────┐
│  顶部导航栏（透明/渐变）              │
│  [Logo] 大喜的日子      [消息图标]   │
├─────────────────────────────────────┤
│                                     │
│  对话区域（占主要空间）               │
│  ┌───────────────────────────────┐  │
│  │ AI: 您好！我是大喜的日子的      │  │
│  │    婚礼设计助手 🌸             │  │
│  │    请问您的婚礼计划在什么季节？ │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │          用户: 春天 3 月        │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ AI: 春天很浪漫呢！为您推荐     │  │
│  │    以下案例参考 👇             │  │
│  │                               │  │
│  │  ┌─────┐ ┌─────┐ ┌─────┐     │  │
│  │  │案例1│ │案例2│ │案例3│     │  │
│  │  └─────┘ └─────┘ └─────┘     │  │
│  └───────────────────────────────┘  │
│                                     │
├─────────────────────────────────────┤
│  ✨ 找灵感（横条入口）               │
├─────────────────────────────────────┤
│  输入框区域                          │
│  [输入您的需求...]      [发送]      │
└─────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格（Web/PX） | 规格（小程序/rpx） | 说明 |
|------|----------------|-------------------|------|
| **顶部导航** | 高度 44px，透明渐变背景 | 高度 88rpx，透明渐变背景 | Logo 使用暖金色，右侧图标 48rpx |
| **对话气泡** | 最大宽度 80%，圆角 16px | 最大宽度 80%，圆角 32rpx | AI 气泡：gold-100 背景<br>用户气泡：gold-400 背景 + 白色文字 |
| **案例推荐卡片** | 宽度 120px，高度 160px，圆角 24px | 宽度 240rpx，高度 320rpx，圆角 48rpx | 图片占 70%，底部显示标题和风格标签 |
| **找灵感横条** | 高度 48px，gold-50 背景 | 高度 96rpx，gold-50 背景 | 左侧✨图标，右侧箭头，点击跳转案例库 |
| **输入框** | 高度 48px，圆角 20px | 高度 96rpx，圆角 40rpx | 边框 gold-300，聚焦时 gold-500 |
| **发送按钮** | 直径 40px 圆形，gold-400 背景 | 直径 80rpx 圆形，gold-400 背景 | 白色箭头图标，禁用态 gold-200 |

**交互效果**：

- **消息进入**：从底部滑入，动画时长 300ms，缓动函数 `ease-out`
- **案例卡片**：横向滑动，带惯性，卡片间距 12px
- **输入框聚焦**：边框颜色渐变，动画 200ms
- **发送按钮**：点击时缩放至 0.95，反馈动画 100ms

---

#### Tab 2：精选案例馆

**页面用途**：瀑布流展示精选婚礼案例，提供灵感与风格参考；支持按风格筛选（新中式/韩式/森系/法式/现代/户外），底部提供 AI 设计同款方案入口，引导新人从案例灵感进入 AI 方案生成流程

**布局结构**：

```
┌─────────────────────────────────────┐
│  顶部导航栏                          │
│  [返回] 精选案例                     │
├─────────────────────────────────────┤
│                                     │
│  顶部视觉区（Hero）                  │
│  ┌───────────────────────────────┐  │
│  │  灵感画廊                      │  │
│  │  每一场婚礼，都是独一无二的故事  │  │
│  │  [200+ 精选案例] [8 风格类型]   │  │
│  └───────────────────────────────┘  │
│                                     │
│  风格筛选标签（横向滚动）            │
│  [全部] [新中式] [韩式] [森系] ...   │
│                                     │
│  瀑布流案例列表（双列）              │
│  ┌─────┐ ┌─────┐                  │
│  │案例1│ │案例2│                  │
│  │     │ │     │                  │
│  └─────┘ └─────┘                  │
│  ┌─────┐ ┌─────┐                  │
│  │案例3│ │案例4│                  │
│  │     │ │     │                  │
│  └─────┘ └─────┘                  │
│                                     │
│  底部 CTA                          │
│  ┌───────────────────────────────┐  │
│  │  找到喜欢的风格？               │  │
│  │  [AI 设计同款方案]             │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **Hero 区域** | 高度 160px，gold-100 渐变背景 | 标题 28px serif，副标题 13px gold-600；右上角径向光晕装饰 |
| **统计胶囊** | 高度 48px，白色半透明背景（0.6）+ blur(8px) | 数字 20px Playfair，标签 11px gold-500；中间 1px gold-200 分隔线 |
| **风格标签** | 高度 36px，pill 圆角，横向滚动 | 选中态 gold-400 渐变背景 + 白字 + shadow-gold；默认 gold-50 背景 + gold-600 字 |
| **案例封面** | 渐变背景（莫兰迪色系/gold 系），高度 140-190px 随机 | 居中装饰图标 opacity 0.5；左上角风格徽章（白底 0.85 + blur） |
| **风格徽章** | padding 4px 10px，圆角 full | 11px gold-700 字，rgba(255,255,255,0.85) + blur(4px) 背景 |
| **案例标题** | 14px 加粗，text-primary | 单行省略，line-height 1.3 |
| **案例元信息** | 12px gold-500 | 场地 · ¥预算区间，单行省略 |
| **案例标签** | 10px gold-600，gold-50 背景 | padding 2px 8px，圆角 sm，flex-wrap |
| **底部 CTA** | 高度 80px，gold-100 渐变背景 | 标题 15px gold-700；按钮 gold-400 渐变 + 白字 + sparkles 图标 |

**交互效果**：

- **风格筛选**：点击标签高亮选中态（gold-400 渐变 + 白字），即时过滤案例列表并重新分列，动画 200ms；标签支持横向滚动
- **案例卡片点击**：`catchtap` 触发，跳转至案例详情页 `/pages/case-detail/case-detail?id={id}`；按下时 `scale(0.98)` 反馈
- **底部 CTA**：点击 `switchTab` 跳转至 AI 设计对话首页（`/pages/home/home`），按钮按下 `scale(0.97)`
- **骨架屏加载**：`loading=true` 时显示双列骨架卡片（封面 + 文本行 shimmer 动画 1.5s 循环），数据就绪后淡出
- **空状态**：筛选无结果时显示"暂无该风格案例 / 换个风格试试吧"，居中排版
- **风格计数**：每次加载后自动统计各风格案例数量，显示在标签右侧（count > 0 时显示）
- **页面分享**：`onShareAppMessage` 返回"精选案例 · 大喜的日子"，路径 `/pages/contact/contact`

**数据结构**：

```js
// 案例对象
{
  id: 'case-001',
  coupleName: '张先生 & 李女士',   // 标题
  style: '新中式',                 // 风格（用于筛选）
  venue: '万达酒店',               // 场地
  budgetRange: '1.2-1.5万',        // 预算区间
  tags: ['新中式', '金色', '30桌'], // 标签
  bg: 'linear-gradient(...)',      // 封面渐变背景
  height: 180,                     // 封面高度（140-190px 随机）
}
```

**状态说明**：

| 状态 | 触发条件 | 表现 |
|------|----------|------|
| 加载中 | `loading=true` | 双列骨架屏 shimmer 动画 |
| 已加载 | `loading=false && filteredCases.length>0` | 瀑布流案例列表 |
| 空状态 | `loading=false && filteredCases.length===0` | 居中空状态提示 |

---

#### Tab 3：我的

**页面用途**：个人中心，管理收藏、咨询记录、工具箱

**布局结构**：

```
┌─────────────────────────────────────┐
│  顶部用户信息区                      │
│  ┌───────────────────────────────┐  │
│  │  [头像]  小林                  │  │
│  │          婚礼倒计时：87 天      │  │
│  └───────────────────────────────┘  │
├─────────────────────────────────────┤
│                                     │
│  婚礼工具箱                          │
│  ┌─────┐ ┌─────┐ ┌─────┐          │
│  │ 📋  │ │ 💰  │ │ ⏰  │          │
│  │筹备 │ │预算 │ │倒计 │          │
│  │清单 │ │计算 │ │ 时  │          │
│  └─────┘ └─────┘ └─────┘          │
│                                     │
│  我的内容                            │
│  ┌───────────────────────────────┐  │
│  │ ❤️ 我的收藏          >        │  │
│  ├───────────────────────────────┤  │
│  │ 💬 咨询记录          >        │  │
│  ├───────────────────────────────┤  │
│  │ 👨‍💼 策划师工作台     >        │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **用户信息区** | 高度 120px，渐变背景 gold-300 → gold-500 | 头像 72px 圆形，白色文字 |
| **工具箱图标** | 直径 56px 圆形，gold-100 背景 | 图标 28px gold-600，下方文字 12px |
| **列表项** | 高度 56px，白色背景 | 左侧图标 + 文字，右侧箭头 gold-400 |

**交互效果**：

- **列表项点击**：背景色变为 gold-50，反馈动画 100ms
- **工具箱图标**：点击时轻微上浮（translateY: -2px），阴影加深

---

### 8.2 策划师端页面结构

#### Tab 1：工作台 Dashboard

**页面用途**：策划师核心工作台，展示关键数据和待办事项

**布局结构**：

```
┌─────────────────────────────────────┐
│  顶部导航栏                          │
│  工作台               [搜索] [通知] │
├─────────────────────────────────────┤
│                                     │
│  本月数据概览                        │
│  ┌─────────┐ ┌─────────┐          │
│  │ 接单数   │ │ 进行中   │          │
│  │   12    │ │    8    │          │
│  └─────────┘ └─────────┘          │
│  ┌─────────┐ ┌─────────┐          │
│  │ 本月收入  │ │ 待跟进   │          │
│  │ ¥45,600 │ │   15    │          │
│  └─────────┘ └─────────┘          │
│                                     │
│  待跟进线索                          │
│  ┌───────────────────────────────┐  │
│  │ 小林 & 小张  春季花园婚礼      │  │
│  │ 预算：8-10 万   2 小时前       │  │
│  ├───────────────────────────────┤  │
│  │ 小李 & 小王  中式传统婚礼      │  │
│  │ 预算：5-7 万    昨天           │  │
│  └───────────────────────────────┘  │
│  [查看全部]                          │
│                                     │
│  近期婚礼                            │
│  ┌───────────────────────────────┐  │
│  │ 06-28  小林婚礼   待确认方案   │  │
│  │ 07-05  小李婚礼   已签约      │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **数据卡片** | 宽度 163px，高度 100px，圆角 12px | 白色背景，阴影 shadow-md，数字 28px Playfair Display gold-600 |
| **线索卡片** | 高度 80px，gold-50 背景 | 左侧客户名 16px gold-900，右侧时间 12px gold-500 |
| **婚礼列表项** | 高度 64px，白色背景 | 左侧日期 14px gold-600，右侧状态标签 |

**交互效果**：

- **数据卡片**：点击跳转对应详情，点击时缩放 0.98
- **线索卡片**：左滑显示"联系""标记"按钮
- **婚礼列表**：点击跳转订单详情

---

#### Tab 2：订单看板

**页面用途**：项目管理，按状态分组查看订单

**布局结构**：

```
┌─────────────────────────────────────┐
│  顶部导航栏                          │
│  订单                  [+ 新建订单] │
├─────────────────────────────────────┤
│                                     │
│  状态筛选 Tab                        │
│  [进行中] [待确认] [已完成]         │
│                                     │
│  订单列表                            │
│  ┌───────────────────────────────┐  │
│  │ 小林 & 小张                    │  │
│  │ 春季花园婚礼 · 8-10 万         │  │
│  │ 进度：方案确认中    06-28      │  │
│  │ ━━━━━━━━━━░░░░ 60%           │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 小李 & 小王                    │  │
│  │ 中式传统婚礼 · 5-7 万          │  │
│  │ 进度：待签约        07-05      │  │
│  │ ━━━━━━░░░░░░░░ 40%           │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **状态 Tab** | 高度 44px，下划线指示器 | 选中态 gold-500，未选中 gold-400 |
| **订单卡片** | 高度 120px，白色背景，圆角 12px | 进度条高度 6px，gold-300 背景 + gold-500 填充 |
| **新建按钮** | 高度 36px，gold-400 背景 | 白色文字，圆角 18px |

**交互效果**：

- **Tab 切换**：下划线滑动动画，250ms
- **订单卡片**：点击进入详情，点击时背景变 gold-50
- **进度条**：加载时从左到右填充动画，500ms

---

#### Tab 3：排期日历

**页面用途**：日历视图查看婚礼排期，检测冲突

**布局结构**：

```
┌─────────────────────────────────────┐
│  顶部导航栏                          │
│  [<] 2026 年 6 月 [>]    [今日]    │
├─────────────────────────────────────┤
│                                     │
│  日历视图                            │
│  ┌───┬───┬───┬───┬───┬───┬───┐    │
│  │日 │一 │二 │三 │四 │五 │六 │    │
│  ├───┼───┼───┼───┼───┼───┼───┤    │
│  │   │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │    │
│  │   │   │   │   │ ● │   │   │    │
│  ├───┼───┼───┼───┼───┼───┼───┤    │
│  │ 7 │ 8 │ 9 │10 │11 │12 │13 │    │
│  │   │   │   │   │   │   │ ● │    │
│  ├───┼───┼───┼───┼───┼───┼───┤    │
│  │14 │15 │16 │17 │18 │19 │20 │    │
│  │   │   │   │   │   │   │   │    │
│  ├───┼───┼───┼───┼───┼───┼───┤    │
│  │21 │22 │23 │24 │25 │26 │27 │    │
│  │   │   │ ● │   │   │   │   │    │
│  ├───┼───┼───┼───┼───┼───┼───┤    │
│  │28 │29 │30 │   │   │   │   │    │
│  │ ● │   │   │   │   │   │   │    │
│  └───┴───┴───┴───┴───┴───┴───┘    │
│                                     │
│  ● 有婚礼安排    ● 今天            │
│                                     │
│  当日详情                            │
│  ┌───────────────────────────────┐  │
│  │ 06-28  小林婚礼                │  │
│  │ 春季花园婚礼 · 武汉东湖花园    │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **日历单元格** | 40x40px 正方形 | 日期文字 14px gold-900，有婚礼时底部显示 gold-400 圆点 |
| **今日标记** | gold-400 圆形背景 + 白色文字 | 突出显示当天 |
| **冲突标记** | 红色圆点（error 色） | 当检测到档期冲突时显示 |
| **当日详情卡片** | 高度 80px，gold-100 背景 | 左侧时间 14px gold-600，右侧信息 |

**交互效果**：

- **日期点击**：选中态 gold-200 背景，下方显示当日详情
- **月份切换**：日历整体滑动动画，300ms
- **冲突检测**：弹出 Toast 警告，红色边框高亮冲突日期

---

#### Tab 4：合同管理

**页面用途**：合同列表和收款管理

**布局结构**：

```
┌─────────────────────────────────────┐
│  顶部导航栏                          │
│  合同                  [+ 新建合同] │
├─────────────────────────────────────┤
│                                     │
│  收款统计                            │
│  ┌───────────────────────────────┐  │
│  │ 本月应收    本月已收    待收款  │  │
│  │ ¥68,000   ¥45,600   ¥22,400  │  │
│  └───────────────────────────────┘  │
│                                     │
│  合同列表                            │
│  ┌───────────────────────────────┐  │
│  │ 小林 & 小张  春季花园婚礼      │  │
│  │ 合同金额：¥88,000             │  │
│  │ 已收：¥44,000  待收：¥44,000  │  │
│  │ 状态：进行中      06-28       │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **统计卡片** | 高度 80px，gold-100 背景 | 三列等分，数字 20px gold-600 |
| **合同卡片** | 高度 120px，白色背景 | 金额 16px gold-900，状态标签 morandi-green-400 |

---

### 8.3 策划师端子页面

#### AI 方案生成页

**页面用途**：AI 生成方案 + 成本利润看板

**布局结构**：

```
┌─────────────────────────────────────┐
│  顶部导航栏                          │
│  [返回] AI 方案生成                  │
├─────────────────────────────────────┤
│                                     │
│  客户需求摘要                        │
│  ┌───────────────────────────────┐  │
│  │ 风格：春季花园  预算：8-10 万   │  │
│  │ 人数：200 人    场地：东湖花园  │  │
│  └───────────────────────────────┘  │
│                                     │
│  AI 生成方案                         │
│  ┌───────────────────────────────┐  │
│  │ 设计理念                        │  │
│  │ 以"春日花园"为主题，运用大量    │  │
│  │ 鲜花和绿植，营造浪漫自然的...   │  │
│  ├───────────────────────────────┤  │
│  │ 道具清单                        │  │
│  │ ┌──────┬────┬────┬────┐       │  │
│  │ │ 道具  │数量│单价│小计│       │  │
│  │ ├──────┼────┼────┼────┤       │  │
│  │ │ 拱门  │ 1  │800 │800 │       │  │
│  │ │ 桌花  │ 20 │ 60 │1200│       │  │
│  │ └──────┴────┴────┴────┘       │  │
│  └───────────────────────────────┘  │
│                                     │
│  成本利润看板                        │
│  ┌───────────────────────────────┐  │
│  │ 总成本    建议报价    预计利润  │  │
│  │ ¥52,000  ¥88,000   ¥36,000   │  │
│  │ 利润率：40.9%                 │  │
│  └───────────────────────────────┘  │
│                                     │
│  [确认方案并转订单]                  │
└─────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **需求摘要** | 高度 80px，gold-100 背景 | 标签式展示，每个标签 gold-200 背景 |
| **方案卡片** | 白色背景，圆角 12px | 道具清单表格，表头 gold-100 背景 |
| **利润看板** | 高度 100px，渐变背景 gold-300 → gold-500 | 白色文字，数字突出显示 |
| **确认按钮** | 高度 48px，gold-400 背景 | 白色文字，全宽 |

**交互效果**：

- **方案生成**：加载动画（水彩晕染效果），1-2 秒
- **利润看板**：数字滚动动画，500ms
- **确认按钮**：点击后弹出确认弹窗

---

#### 道具管理页

**页面用途**：道具库存管理、出入库记录

**布局结构**：

```
┌─────────────────────────────────────┐
│  顶部导航栏                          │
│  道具管理              [+ 入库]     │
├─────────────────────────────────────┤
│                                     │
│  库存概览                            │
│  ┌─────────┐ ┌─────────┐          │
│  │ 总道具数  │ │ 低库存   │          │
│  │   156   │ │    12   │          │
│  └─────────┘ └─────────┘          │
│                                     │
│  分类筛选                            │
│  [全部] [花艺] [布置] [灯光] [其他] │
│                                     │
│  道具列表                            │
│  ┌───────────────────────────────┐  │
│  │ [图片] 铁艺拱门                │  │
│  │        库存：5 个  单价：¥800  │  │
│  │        状态：正常              │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ [图片] 桌花                    │  │
│  │        库存：3 个 ⚠️  单价：¥60│  │
│  │        状态：低库存            │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **库存卡片** | 宽度 163px，高度 80px | 数字 24px gold-600，低库存用 error 色 |
| **分类 Tab** | 高度 40px，胶囊样式 | 选中态 gold-400 背景 + 白色文字 |
| **道具卡片** | 高度 100px，白色背景 | 左侧图片 64x64px，右侧信息 |
| **低库存警告** | ⚠️ 图标 + warning 色文字 | 突出显示需要采购的道具 |

**交互效果**：

- **分类切换**：列表淡入淡出，200ms
- **道具卡片**：点击进入详情，左滑显示"出库""编辑"按钮
- **低库存**：卡片边框 warning 色高亮

---

### 8.4 新人端子页面

#### 案例详情页

**页面用途**：展示案例详情，包含图片、风格标签、描述、参考报价

**布局结构**：

```
┌─────────────────────────────────────┐
│  顶部导航栏                          │
│  [返回] 案例详情          [收藏]    │
├─────────────────────────────────────┤
│                                     │
│  案例主图（渐变背景 + 图标）          │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │          案例封面图          │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│  案例信息                            │
│  春日花园 · 户外草坪婚礼             │
│  [自然浪漫] [户外草坪] [8-10万]     │
│                                     │
│  以春日花园为主题，运用大量鲜花       │
│  与绿植打造浪漫自然的户外婚礼场景...  │
│                                     │
│  参考报价                            │
│  ┌───────────────────────────────┐  │
│  │ 场地布置        ¥35,000       │  │
│  │ 花艺设计        ¥28,000       │  │
│  │ 灯光音响        ¥15,000       │  │
│  │ 人员服务        ¥12,000       │  │
│  │ ─────────────────────────     │  │
│  │ 合计参考        ¥90,000       │  │
│  └───────────────────────────────┘  │
│                                     │
│  [收藏案例]  [AI 生成方案]          │
└─────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **案例主图** | 高度 180px，渐变背景 | 使用 Morandi 色系渐变，中央显示 SVG 图标 |
| **案例标题** | 18px Bold gold-800 | 位于主图下方，padding 16px |
| **风格标签** | 高度 22px，圆角胶囊 | 使用 tag 组件，根据风格选择对应色系 |
| **案例描述** | 13px Regular gold-600，行高 1.7 | 段落文字，margin-top 12px |
| **报价卡片** | 白色背景，圆角 12px，shadow-sm | 每项价格右对齐，合计行加粗分隔 |
| **操作按钮** | 高度 32px，两个等宽按钮 | 收藏：次要按钮；AI生成：主要按钮 |

**交互效果**：

- **收藏按钮**：点击后图标变为实心，Toast 提示"已收藏"
- **AI 生成方案**：跳转至 AI 对话页，自动带入案例风格参数
- **报价卡片**：数字使用 Playfair Display 字体，右对齐

---

#### 预算计算器页

**页面用途**：按桌数/风格/场地自动估算婚礼预算范围

**布局结构**：

```
─────────────────────────────────────┐
│  顶部导航栏                          │
│  [返回] 预算计算器                   │
├─────────────────────────────────────┤
│                                     │
│  预估总预算（渐变背景卡片）           │
│  ┌───────────────────────────────┐  │
│  │  预估总预算                    │  │
│  │  ¥85,000                      │  │
│  │  参考范围：¥75,000 - ¥95,000  │  │
│  └───────────────────────────────┘  │
│                                     │
│  输入参数                            │
│  宾客桌数    [20          ]         │
│  婚礼风格    [自然浪漫      ]       │
│  场地类型    [户外草坪      ]       │
│                                     │
│  预算分配                            │
│  ┌───────────────────────────────┐  │
│  │ ● 场地布置      ¥35,000       │  │
│  │ ● 花艺设计      ¥22,000       │  │
│  │ ● 灯光音响      ¥15,000       │  │
│  │ ● 人员服务      ¥13,000       │  │
│  │ ━━━━━━━━━━━━━━━━━━━━━       │  │
│  │ [粉色][绿色][金色][蓝色]       │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **预算结果卡片** | 渐变背景 gold-200 → gold-400，白色文字 | 数字 32px Playfair Display Bold，margin 0 16px |
| **输入字段** | 高度 40px，边框 gold-200 | 标签 12px gold-600，输入值 13px |
| **分配条目** | 每项 padding 8px 0，底部边框 gold-100 | 左侧色点 8px 圆形，右侧金额 13px Bold |
| **分配进度条** | 高度 6px，圆角 3px | 多色分段，各段宽度对应占比 |

**交互效果**：

- **输入变化**：实时重新计算预算，数字滚动动画 300ms
- **进度条**：各段宽度随预算分配动态变化，动画 500ms
- **结果卡片**：预算范围文字透明度 0.8，提供心理预期

---

#### 筹备清单页

**页面用途**：婚礼筹备待办事项，按时间线排列，支持勾选完成

**布局结构**：

```
┌─────────────────────────────────────┐
│  顶部导航栏                          │
│  [返回] 筹备清单                     │
├─────────────────────────────────────┤
│                                     │
│  进度卡片                            │
│  ┌───────────────────────────────┐  │
│  │  65%   已完成 13 / 20 项       │  │
│  │  ━━━━━━━━━━━━━░░░░░░         │  │
│  └───────────────────────────────┘  │
│                                     │
│  婚前 3 个月                         │
│   确定婚礼日期                      │
│  ☑ 选定婚礼场地                      │
│  ☑ 确定婚礼风格                      │
│   选定婚纱礼服                      │
│                                     │
│  婚前 1 个月                         │
│  ☑ 发送请柬                          │
│  ☑ 确认宾客名单                      │
│  ☐ 试妆定妆                          │
│  ☐ 确认花艺方案                      │
│                                     │
│  婚前 1 周                           │
│  ☐ 最终确认流程                      │
│  ☐ 彩排婚礼仪式                      │
│                                     │
└─────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **进度卡片** | 白色背景，圆角 12px，shadow-sm | 左侧数字 28px Playfair Display gold-600，右侧进度条 |
| **分组标题** | 12px Semibold gold-500 | 左侧 6px 圆点 gold-400，margin-bottom 8px |
| **清单项** | 高度 40px，白色背景，圆角 8px | 勾选框 20px 圆形，文字 13px |
| **已完成项** | 勾选框 gold-400 填充 + 白色✓ | 文字 gold-400 + 删除线 |
| **未完成项** | 勾选框 gold-300 边框 | 文字 gold-800 |

**交互效果**：

- **勾选操作**：点击切换完成状态，勾选框填充动画 200ms
- **进度更新**：百分比和进度条实时变化，动画 300ms
- **分组折叠**：点击分组标题可折叠/展开，箭头旋转 180°

---

#### 婚礼倒计时页

**页面用途**：距婚期天数倒计时 + 关键节点里程碑

**布局结构**：

```
┌─────────────────────────────────────┐
│  顶部导航栏                          │
│  [返回] 婚礼倒计时                   │
├─────────────────────────────────────┤
│                                     │
│  倒计时主视觉                        │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │           87                   │  │
│  │           天                   │  │
│  │   2026 年 9 月 18 日 · 星期五  │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│  关键节点                            │
│  ┌───────────────────────────────┐  │
│  │ ✅ 确定婚期   2026-03-15       │  │
│  │    已完成                      │  │
│  ├───────────────────────────────┤  │
│  │ ✅ 选定场地   2026-04-02       │  │
│  │    已完成                      │  │
│  ├───────────────────────────────┤  │
│  │ 🔄 确认方案   2026-07-01       │  │
│  │    进行中                      │  │
│  ├───────────────────────────────┤  │
│  │ ⏳ 婚礼当天   2026-09-18       │  │
│  │    待完成                      │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **倒计时数字** | 72px Playfair Display Bold gold-600 | 居中显示，line-height 1 |
| **倒计时单位** | 14px Regular gold-400 | 位于数字下方，margin-top 4px |
| **婚期日期** | 13px Regular gold-500 | margin-top 8px |
| **里程碑项** | 白色背景，圆角 12px，shadow-sm | 左侧图标 36px 圆形，右侧信息 |
| **已完成节点** | 图标背景 morandi-green-100，文字 morandi-green-500 | 状态文字 morandi-green-500 |
| **进行中节点** | 图标背景 gold-100，文字 gold-500 | 状态文字 gold-500 |
| **待完成节点** | 图标背景 gold-50，文字 gold-300 | 状态文字 gold-300 |

**交互效果**：

- **数字动画**：天数变化时数字滚动效果，500ms
- **里程碑点击**：展开显示该节点的详细任务清单
- **背景**：渐变背景 morandi-pink-50 → gold-50，营造温馨氛围

---

### 8.5 策划师端子页面（续）

#### 酒店管理页

**页面用途**：合作酒店/场地档案管理，支持搜索和评分展示

**布局结构**：

```
┌─────────────────────────────────────┐
│  顶部导航栏                          │
│  酒店场地              [+ 添加]     │
─────────────────────────────────────┤
│                                     │
│  搜索框                              │
│  [🔍 搜索酒店名称、区域...]         │
│                                     │
│  酒店列表                            │
│  ┌───────────────────────────────┐  │
│  │ [图] 武汉光谷凯悦酒店          │  │
│  │     📍 洪山区 · 光谷广场       │  │
│  │     ★★★★★ 4.8                │  │
│  │     宴会厅 ¥3,888/桌起         │  │
│  ├───────────────────────────────┤  │
│  │ [图] 武汉东湖宾馆              │  │
│  │     📍 武昌区 · 东湖风景区     │  │
│  │     ★★★★★ 4.9                │  │
│  │     户外草坪 ¥5,000/场起       │  │
│  ───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **搜索框** | 高度 36px，圆角 18px | 背景 gold-50，边框 gold-200，左侧搜索图标 |
| **酒店卡片** | 白色背景，圆角 12px，shadow-sm | 左侧图片 72x72px，右侧信息 |
| **酒店名称** | 14px Semibold gold-800 | 位于图片右侧顶部 |
| **位置信息** | 11px Regular gold-400 | 左侧定位图标 12px，margin-top 2px |
| **评分** | 11px gold-400 星星 + 数字 gold-600 | margin-top 4px |
| **价格** | 12px Semibold gold-600 | margin-top 4px |

**交互效果**：

- **搜索**：输入时实时过滤列表，动画 200ms
- **卡片点击**：跳转酒店详情页，点击时背景变 gold-50
- **添加按钮**：弹出新建酒店表单弹窗

---

#### 客户管理页

**页面用途**：客户信息管理，支持状态筛选和转化追踪

**布局结构**：

```
┌─────────────────────────────────────┐
│  顶部导航栏                          │
│  客户              [搜索] [+ 添加]  │
├─────────────────────────────────────┤
│                                     │
│  状态筛选                            │
│  [全部(36)] [意向(12)] [已签约(18)] │
│  [已完成(6)]                         │
│                                     │
│  客户列表                            │
│  ┌───────────────────────────────┐  │
│  │ [头像] 小林 & 小张    [已签约] │  │
│  │        春季花园 · 预算 8-10 万 │  │
│  ├───────────────────────────────┤  │
│  │ [头像] 小李 & 小王    [意向]   │  │
│  │        中式传统 · 预算 5-7 万  │  │
│  ───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **筛选 Tab** | 高度 32px，圆角胶囊 | 选中态 gold-400 背景 + 白色文字，未选中 gold-100 + gold-600 |
| **客户卡片** | 白色背景，圆角 12px，shadow-sm | 左侧头像 40px 圆形，右侧信息，右侧状态标签 |
| **客户头像** | 40px 圆形，渐变色背景 | 根据客户类型使用不同 Morandi 色系 |
| **客户名称** | 14px Semibold gold-800 | 位于头像右侧顶部 |
| **客户描述** | 11px Regular gold-400 | margin-top 2px，显示风格和预算 |
| **状态标签** | 高度 22px，圆角胶囊 | 已签约：green 系；意向：gold 系；已完成：blue 系 |

**交互效果**：

- **筛选切换**：列表实时更新，动画 200ms
- **卡片点击**：跳转客户详情页
- **左滑操作**：显示"联系""编辑""删除"按钮

---

#### 线索列表页

**页面用途**：咨询线索管理，支持状态筛选和跟进记录

**布局结构**：

```
┌─────────────────────────────────────┐
│  顶部导航栏                          │
│  线索                  [筛选]       │
├─────────────────────────────────────┤
│                                     │
│  状态 Tab                            │
│  [待跟进(5)] [跟进中] [已转化] [流失]│
│                                     │
│  线索详情卡片                        │
│  ┌───────────────────────────────┐  │
│  │ 小林 & 小张                    │  │
│  │ 春季花园婚礼 · 小程序咨询      │  │
│  │ 预算 8-10 万 · 婚期 2026-09    │  │
│  └───────────────────────────────┘  │
│                                     │
│  跟进记录                            │
│  ● AI 方案已生成，等待客户确认      │
│    今天 14:30                        │
│  ● 电话沟通需求，客户偏好自然风格   │
│    昨天 10:15                        │
│  ● 客户通过小程序发起咨询           │
│    2 天前                            │
│                                     │
└─────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **状态 Tab** | 高度 32px，圆角胶囊 | 待跟进 Tab 右上角红色徽章显示数量 |
| **线索卡片** | 白色背景，圆角 12px，shadow-sm | 名称 15px Semibold，风格 12px，信息行 11px |
| **跟进时间线** | 左侧圆点 20px，连接线 2px gold-100 | 圆点 gold-200，最新记录 gold-400 |
| **跟进内容** | 12px Regular gold-700 | 时间 10px gold-300，margin-top 2px |

**交互效果**：

- **Tab 切换**：列表过滤动画 200ms
- **线索卡片**：点击展开跟进记录
- **新增跟进**：弹出输入框，提交后时间线顶部插入新记录

---

#### 全局搜索页

**页面用途**：跨模块搜索，支持订单/客户/道具/酒店统一检索

**布局结构**：

```
┌─────────────────────────────────────┐
│  顶部导航栏                          │
│  [返回] 搜索                         │
├─────────────────────────────────────┤
│                                     │
│  搜索框                              │
│  [🔍 搜索订单、客户、道具、酒店...] │
│                                     │
│  热门搜索                            │
│  [春季婚礼] [户外草坪] [玫瑰拱门]   │
│  [小林] [凯悦酒店]                   │
│                                     │
│  搜索结果（6 条结果）                 │
│  ┌───────────────────────────────┐  │
│  │ [图标] 小林 & 小张 · 订单      │  │
│  │        春季花园婚礼 · 进行中   │  │
│  ├───────────────────────────────┤  │
│  │ [图标] 小林 · 客户档案         │  │
│  │        已签约 · 2026-06-15     │  │
│  └───────────────────────────────  │
│                                     │
└─────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **搜索框** | 高度 40px，圆角 20px | 背景 gold-50，边框 gold-200，左侧搜索图标 |
| **热门标签** | 高度 28px，圆角 14px | 背景 gold-100，文字 12px gold-600 |
| **结果项** | 白色背景，圆角 8px，shadow-sm | 左侧图标 32px 方形，右侧标题 13px + 副标题 11px |
| **结果图标** | 32x32px 圆角 8px | 根据类型使用不同 Morandi 色系背景 |

**交互效果**：

- **搜索输入**：实时显示搜索结果，延迟 300ms
- **热门标签**：点击自动填入搜索框
- **结果点击**：跳转对应模块详情页

---

#### 个人中心页（策划师）

**页面用途**：策划师个人信息、会员管理、快捷入口

**布局结构**：

```
┌─────────────────────────────────────┐
│  状态栏（白色文字）                   │
├─────────────────────────────────────┤
│                                     │
│  个人信息区（渐变背景）               │
│  ┌───────────────────────────────┐  │
│  │         [头像]                 │  │
│  │         王策划                 │  │
│  │   资深婚礼策划师 · 武汉        │  │
│  └───────────────────────────────┘  │
│                                     │
│  会员卡片                            │
│  ┌───────────────────────────────┐  │
│  │ [钻石] Pro 会员    [升级]     │  │
│  │      每月 50 次 AI 方案        │  │
│  │      已用 23 次                │  │
│  └───────────────────────────────┘  │
│                                     │
│  数据统计                            │
│  [200+ 案例] [4.9 好评] [5 年经验]  │
│                                     │
│  功能菜单                            │
│  ┌───────────────────────────────  │
│  │ 📋 我的订单          >        │  │
│  │ 👥 客户管理          >        │  │
│  │ 📦 道具管理          >        │  │
│  │ 💡 会员权益          >        │  │
│  │ ️ 个人设置          >        │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **个人信息区** | 渐变背景 gold-300 → gold-500 | 头像 72px 圆形，白色文字，padding 24px 16px 20px |
| **会员卡片** | 渐变背景 gold-100 → gold-200 | 左侧钻石图标 40px gold-400 圆形，右侧升级按钮 |
| **数据统计** | 三列等分，白色背景，圆角 8px | 数字 18px Playfair Display gold-600，标签 10px gold-400 |
| **菜单项** | 高度 52px，白色背景 | 左侧图标 18px + 文字 14px，右侧箭头 gold-300 |

**交互效果**：

- **会员卡片**：点击跳转会员详情页
- **菜单项**：点击时背景变 gold-50，反馈动画 100ms
- **升级按钮**：点击弹出会员升级弹窗

---

#### 亲友团任务页

**页面用途**：婚礼当天亲友分工任务分配与管理

**布局结构**：

```
┌─────────────────────────────────────┐
│  顶部导航栏                          │
│  [返回] 亲友团任务       [+ 添加]   │
├─────────────────────────────────────
│                                     │
│  任务概览（渐变背景）                 │
│  ┌───────────────────────────────┐  │
│  │  小林 & 小张 · 婚礼当天        │  │
│  │  2026 年 9 月 18 日            │  │
│  │  共 8 项任务 · 6 位亲友        │  │
│  └───────────────────────────────┘  │
│                                     │
│  任务列表                            │
│  ┌───────────────────────────────┐  │
│  │ 08:00  接亲准备                │  │
│  │        确认婚车路线、准备红包  │  │
│  │        [张] 张伴郎 · 已确认    │  │
│  ├───────────────────────────────┤  │
│  │ 09:30  迎宾接待                │  │
│  │        在签到处引导宾客签到    │  │
│  │        [李] 李伴娘 · 已确认    │  │
│  ───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **任务概览** | 渐变背景 morandi-pink-50 → gold-50 | 标题 16px Bold gold-800，副标题 12px gold-500 |
| **任务项** | 白色背景，圆角 12px，shadow-sm | 左侧时间 11px gold-400（固定宽度 48px），右侧信息 |
| **任务标题** | 13px Semibold gold-800 | 位于时间右侧顶部 |
| **任务描述** | 11px Regular gold-500 | margin-top 2px |
| **负责人** | 头像 20px 圆形 gold-200 + 姓名 11px gold-500 | 已确认：gold-600；待确认：gold-400 |

**交互效果**：

- **任务项点击**：展开显示详细任务说明和备注
- **添加任务**：弹出新建任务表单，选择时间和负责人
- **确认状态**：点击切换"已确认/待确认"，状态文字颜色变化

---

#### 道具市场参考页

**页面用途**：多平台道具租赁价格查询、对比与智能推荐

**布局结构**：

```
┌─────────────────────────────────────┐
│  顶部导航栏                          │
│  [返回] 道具市场参考       [🔍]     │
├─────────────────────────────────────┤
│                                     │
│  多平台价格对比（渐变背景）           │
│  淘宝 · 京东 · 闲鱼 · 本地租赁商     │
│                                     │
│  搜索框                              │
│  [🔍 搜索道具名称...]               │
│                                     │
│  分类切换（横向滚动）                 │
│  [全部] [花艺] [灯光] [家具] [装饰] │
│                                     │
│  道具价格列表                        │
│  ┌───────────────────────────────┐  │
│  │ [图标] 玫瑰拱门        [最低] │  │
│  │        3m 高 · 鲜花装饰        │  │
│  │        淘宝 ¥180/天            │  │
│  │        本地 ¥200/天            │  │
│  ├───────────────────────────────┤  │
│  │ [图标] LED 串灯        [推荐] │  │
│  │        10m 暖白光              │  │
│  │        京东 ¥45/条             │  │
│  │        淘宝 ¥38/条             │  │
│  │        闲鱼 ¥25/条             │  │
│  └───────────────────────────────┘  │
│                                     │
│  💡 数据每周更新，点击查看详情        │
│                                     │
└─────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **页面头部** | 渐变背景 gold-50 → morandi-blue-50 | 标题 16px Bold gold-800，副标题 12px gold-500 |
| **搜索框** | 高度 40px，圆角 20px | 背景 gold-50，边框 gold-200，聚焦时 gold-400 |
| **分类标签** | 高度 28px，圆角 14px | 默认 gold-50 背景，选中态 gold-400 + 白色文字 |
| **道具卡片** | 白色背景，圆角 12px，shadow-sm | 左侧图标 48px 方形 gold-100 渐变背景 |
| **价格行** | 12px Regular gold-500 + 价格 12px Semibold gold-700 | 平台名称左对齐，价格右对齐 |
| **标签** | 高度 20px，圆角 10px | "最低" gold-100/gold-600、"推荐" morandi-green-100/green-500 |
| **提示条** | 渐变背景 gold-50 → morandi-blue-50，圆角 8px | 12px gold-600，左侧灯泡图标 16px |

**交互效果**：

- **分类切换**：横向滚动，选中态平滑过渡，列表淡入 200ms
- **搜索输入**：实时过滤结果，延迟 300ms
- **价格卡片**：点击查看详情，显示更多平台和历史价格趋势
- **标签颜色**：最低价格 gold 色，推荐方案 green 色，库存充足 blue 色

**智能推荐逻辑**：

- **租赁推荐**：使用频次低（<5 次）→ 显示"推荐租赁"标签
- **采购推荐**：使用频次高（≥5 次）→ 显示"建议采购"标签
- **多平台比价**：同一道具各平台价格对比，自动标记最低价

---

#### 启动页（开屏页）

**页面用途**：App 启动时品牌展示，同时判断用户角色（新人/策划师）

**布局结构**：

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│                                     │
│            [品牌 Logo]              │
│           (水彩光环动效)             │
│                                     │
│          大喜的日子                  │
│        让每一场婚礼都被看见          │
│                                     │
│                                     │
│                                     │
│                                     │
│         ━━━━━━━━━━━  (加载进度条)    │
│                                     │
│                                     │
│      AI 驱动的婚礼场景设计平台       │
│                                     │
└─────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **背景** | 渐变 gold-50 → morandi-pink-50 → gold-100 | 135deg 对角渐变，水彩光斑装饰 |
| **品牌 Logo** | 80px × 80px，gold-400 色 | 外围水彩光环脉动动画 3s |
| **品牌名称** | 28px Bold gold-800，letter-spacing 0.1em | 中文宋体风格 |
| **副标语** | 14px Regular gold-500 | margin-top 8px |
| **加载条** | 200px × 3px，gold-100 底色 | gold-300 → gold-500 渐变，2s 循环动画 |
| **底部说明** | 12px Regular gold-400 | 固定底部，距底 48px |

**交互效果**：

- **加载动画**：进度条从左到右再缩回，2s 循环
- **水彩光斑**：两个大尺寸径向渐变圆，分别 12s 和 15s 浮动动画
- **角色判断**：加载完成后根据登录状态自动跳转（新人端/策划师端/登录页）
- **过渡效果**：页面淡入 300ms，品牌 Logo 缩放进入

---

#### 订单详情页

**页面用途**：展示订单完整信息，包含方案、道具清单、费用明细、进度管理

**布局结构**：

```
┌─────────────────────────────────────┐
│  顶部导航栏                          │
│  [返回] 订单详情           [编辑]   │
├─────────────────────────────────────┤
│                                     │
│  订单头部（渐变背景）                 │
│  小林 & 小张                         │
│  春季花园婚礼                        │
│  [进行中]                            │
│                                     │
│  方案信息                            │
│  ┌───────────────────────────────┐  │
│  │ 风格    自然浪漫              │  │
│  │ 预算    8-10 万               │  │
│  │ 桌数    20 桌                 │  │
│  │ 场地    武汉东湖宾馆           │  │
│  └───────────────────────────────┘  │
│                                     │
│  道具清单                            │
│  ┌───────────────────────────────┐  │
│  │ [花] 玫瑰拱门    ×1    ¥200  │  │
│  │ [灯] LED 串灯    ×10   ¥300  │  │
│  │ [椅] 透明椅      ×100  ¥1500 │  │
│  └───────────────────────────────┘  │
│                                     │
│  费用明细                            │
│  ┌───────────────────────────────┐  │
│  │ 场地布置          ¥35,000     │  │
│  │ 花艺设计          ¥28,000     │  │
│  │ 灯光音响          ¥15,000     │  │
│  │ 人员服务          ¥12,000     │  │
│  │ ─────────────────────────     │  │
│  │ 合计              ¥90,000     │  │
│  └───────────────────────────────┘  │
│                                     │
│  [查看方案]  [更新进度]              │
│                                     │
└─────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **订单头部** | 渐变背景 white → gold-50，padding 20px | 新人姓名 18px Bold gold-800，婚礼风格 13px gold-500 |
| **状态标签** | 高度 24px，圆角 12px | 进行中 morandi-green-100/green-500 |
| **信息区块** | padding 16px，底部 1px gold-100 分隔 | 区块标题 14px Semibold gold-800 |
| **信息行** | label 13px gold-500 + value 13px gold-800 | 左右对齐，padding 10px 0 |
| **道具项** | 左侧图标 36px 方形 gold-100 圆角 | 名称 13px gold-800，数量 12px gold-400，价格 13px gold-700 |
| **费用合计行** | 顶部 1px gold-200 分隔线 | 合计金额 16px Bold gold-600 |
| **操作按钮** | 底部固定，两个按钮并排 | 次要按钮 gold-100/gold-600，主要按钮 gold-400/white |

**交互效果**：

- **信息行点击**：场地信息可点击跳转地图，日期可点击跳转排期
- **道具项点击**：展开显示道具详情和关联 AI 方案
- **更新进度**：弹出进度更新面板，选择当前阶段
- **费用明细**：点击可展开显示每项费用的子项明细

---

#### 线索详情页

**页面用途**：展示线索详细信息、需求偏好、跟进记录，支持转为客户

**布局结构**：

```
┌─────────────────────────────────────┐
│  顶部导航栏                          │
│  [返回] 线索详情          [转客户]  │
├─────────────────────────────────────┤
│                                     │
│  线索头部（渐变背景）                 │
│  ┌───────────────────────────────┐  │
│  │ [头像]  小林 & 小张            │  │
│  │         通过小程序咨询         │  │
│  └───────────────────────────────┘  │
│                                     │
│  需求信息                            │
│  ┌───────────────────────────────┐  │
│  │ 风格偏好    自然浪漫           │  │
│  │ 预算范围    8-10 万            │  │
│  │ 预计桌数    20 桌              │  │
│  │ 婚期        2026-09            │  │
│  │ 场地偏好    户外草坪           │  │
│  └───────────────────────────────┘  │
│                                     │
│  跟进记录                            │
│  ┌───────────────────────────────┐  │
│  │ ● AI 方案已生成，等待确认      │  │
│  │   今天 14:30                  │  │
│  │ ○ 电话沟通，偏好自然风格       │  │
│  │   昨天 10:15                  │  │
│  │ ○ 客户发起咨询                │  │
│  │   2 天前                      │  │
│  └───────────────────────────────┘  │
│                                     │
│  [添加跟进]  [转为客户]              │
│                                     │
└─────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **线索头部** | 渐变背景 gold-50 → morandi-pink-50 | 头像 48px 圆形 gold-200 背景，姓名 16px Bold gold-800 |
| **来源说明** | 12px Regular gold-500 | margin-top 4px |
| **需求信息** | 白色背景，圆角 12px | label 13px gold-500，value 13px gold-800 |
| **时间线** | 左侧 2px gold-100 连接线 | 圆点 8px gold-400（最新）/ gold-200（历史） |
| **时间线内容** | 文字 13px gold-800，时间 11px gold-400 | padding-left 16px |
| **操作按钮** | 底部固定，两个按钮并排 | 次要按钮 gold-100，主要按钮 gold-400 |

**交互效果**：

- **转为客户**：点击弹出确认弹窗，填写客户等级和初始预算
- **添加跟进**：弹出跟进记录表单，支持文字/图片/语音
- **时间线展开**：点击展开完整跟进记录详情
- **头像点击**：查看线索头像大图和联系方式

---

## 九、Web 官网设计规范

### 9.1 品牌首页

**页面用途**：品牌展示 + 获客转化入口

**布局结构**：

```
┌─────────────────────────────────────────────────────┐
│  顶部导航栏（固定）                                    │
│  [Logo] 大喜的日子    [首页][案例][服务][关于]  [咨询] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Hero 区（全屏高度）                                  │
│  ┌───────────────────────────────────────────────┐  │
│  │                                               │  │
│  │         每一场婚礼都值得被认真对待              │  │
│  │         Every Wedding Deserves Attention      │  │
│  │                                               │  │
│  │         [立即咨询]    [查看案例]                │  │
│  │                                               │  │
│  │         500+ 对新人服务 · 30+ 合作酒店          │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  （背景：水彩晕染效果 + 婚礼场景图）                   │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  品牌介绍区（4 张卡片）                               │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                  │
│  │深耕 │ │AI   │ │全案 │ │透明 │                  │
│  │本地 │ │赋能 │ │托管 │ │报价 │                  │
│  └─────┘ └─────┘ └─────┘ └─────┘                  │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  案例作品展示（网格布局）                              │
│  ┌─────┐ ┌─────┐ ┌─────┐                          │
│  │案例1│ │案例2│ │案例3│                          │
│  └─────┘ └─────┘ └─────┘                          │
│  ┌─────┐ ┌─────┐ ┌─────┐                          │
│  │案例4│ │案例5│ │案例6│                          │
│  └─────┘ └─────┘ └─────┘                          │
│                                                     │
│  [查看更多案例]                                      │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  服务流程（4 步）                                     │
│  [1] → [2] → [3] → [4]                             │
│  AI 沟通   看场地   方案确认   现场搭建              │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  咨询表单区                                          │
│  ┌───────────────────────────────────────────────┐  │
│  │  姓名：[________]  手机：[________]            │  │
│  │  婚期：[________]  预算：[________]            │  │
│  │  需求：[____________________________]          │  │
│  │                          [提交咨询]            │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  页脚                                                │
│  [品牌信息]  [联系方式]  [服务项目]  [社交媒体]       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **导航栏** | 高度 80px，白色背景，阴影 shadow-sm | Logo 左侧，菜单居中，咨询按钮右侧 gold-400 |
| **Hero 区** | 高度 100vh，渐变叠加背景图 | 主标题 48px Playfair Display gold-900，副标题 20px gold-700 |
| **品牌卡片** | 宽度 280px，高度 200px，白色背景 | 图标 48px gold-500，标题 20px gold-800 |
| **案例网格** | 3 列布局，卡片宽度 360px，高度 280px | 图片占 80%，底部标题 + 风格标签 |
| **服务流程** | 4 步横向排列，步骤间距 80px | 圆形图标 80px gold-400，连接线 gold-300 |
| **咨询表单** | 宽度 600px 居中，白色背景 | 输入框高度 48px，提交按钮 gold-400 |

**交互效果**：

- **导航栏**：滚动时背景变为半透明 + 模糊效果
- **Hero 区**：背景图缓慢缩放动画（10 秒循环）
- **品牌卡片**：悬停时上浮 8px，阴影加深
- **案例卡片**：悬停时图片放大 1.05 倍，显示查看详情按钮
- **服务流程**：滚动进入视口时，依次淡入（stagger 100ms）
- **表单输入框**：聚焦时边框 gold-500，标签上浮动画
- **提交按钮**：悬停时背景 gold-500，点击时缩放 0.98

---

### 9.2 案例详情页

**布局结构**：

```
┌─────────────────────────────────────────────────────┐
│  顶部导航栏                                          │
└─────────────────────────────────────────────────────┤
│                                                     │
│  案例大图（全宽）                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │                                               │  │
│  │              [案例主图]                        │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  案例信息                                            │
│  ┌───────────────────────────────────────────────┐  │
│  │  春季花园婚礼                                  │  │
│  │  风格：自然浪漫  预算：8-10 万  人数：200       │  │
│  │                                               │  │
│  │  案例描述：                                    │  │
│  │  以"春日花园"为主题，运用大量鲜花和绿植...      │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  案例图集（网格）                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐                          │
│  │图1  │ │图2  │ │图3  │                          │
│  └─────┘ └─────┘ └─────┘                          │
│                                                     │
│  [咨询类似方案]                                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **案例大图** | 高度 600px，全宽 | 图片居中，底部渐变遮罩 |
| **案例信息** | 宽度 800px 居中，内边距 48px | 标题 36px Playfair Display gold-900 |
| **图集网格** | 3 列布局，卡片间距 24px | 图片高度 300px，圆角 12px |

**交互效果**：

- **大图**：滚动时视差效果（parallax）
- **图集**：点击图片弹出 Lightbox，支持左右切换
- **咨询按钮**：点击弹出咨询表单弹窗

---

### 9.3 智能助手浮窗

**布局结构**：

```
右下角固定浮窗：

┌─────┐
│ 💬  │  ← 关闭状态：直径 60px 圆形，gold-400 背景
└─────┘

点击展开：

┌─────────────────────┐
│  AI 设计助手     [×] │  ← 高度 500px，宽度 380px
├─────────────────────┤
│                     │
│  对话区域            │
│  ┌───────────────┐  │
│  │ AI: 您好！...  │  │
│  └───────────────┘  │
│                     │
├─────────────────────┤
│  [输入...]   [发送] │
└─────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **浮窗按钮** | 直径 60px，gold-400 背景，白色图标 | 阴影 shadow-lg，悬停时上浮 4px |
| **对话面板** | 宽度 380px，高度 500px，白色背景 | 阴影 shadow-xl，圆角 16px |

**交互效果**：

- **浮窗按钮**：悬停时缩放 1.1，阴影加深
- **展开动画**：从右下角展开，300ms ease-out
- **消息进入**：从底部滑入，200ms

---

## 十、管理后台设计规范

### 10.1 仪表盘

**布局结构**：

```
┌──────────┬────────────────────────────────────────┐
│          │  顶部栏                                 │
│  侧边栏  │  [面包屑]          [通知] [用户头像]   │
│          ├────────────────────────────────────────┤
│  仪表盘  │                                        │
│  案例管理│  数据概览                               │
│  订单管理│  ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│  客户管理│  │总订│ │本月│ │咨询│ │待办│         │
│  酒店管理│  │单  │ │新增│ │线索│ │事项│         │
│  道具管理│  │156 │ │ 23 │ │ 45 │ │ 12 │         │
│  合同管理│  └────┘ └────┘ └────┘ └────┘         │
│          │                                        │
│          │  快捷入口                               │
│          │  [新建案例] [新建订单] [查看咨询]       │
│          │                                        │
│          │  近期订单列表                           │
│          │  ┌──────────────────────────────────┐  │
│          │  │ 订单号 | 客户 | 金额 | 状态 | 操作│  │
│          │  ├──────────────────────────────────┤  │
│          │  │ 001   | 小林 | 8.8万 | 进行中 | 查看│
│          │  └──────────────────────────────────┘  │
│          │                                        │
└──────────┴────────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **侧边栏** | 宽度 240px，gold-800 背景 | 菜单项高度 48px，选中态 gold-600 背景 |
| **顶部栏** | 高度 64px，白色背景，阴影 shadow-sm | 用户头像 40px 圆形 |
| **数据卡片** | 宽度 240px，高度 120px，白色背景 | 数字 32px Playfair Display gold-600 |
| **表格** | 行高 56px，表头 gold-100 背景 | 悬停行 gold-50 背景 |

**交互效果**：

- **侧边栏菜单**：选中时左侧 4px gold-400 边框
- **数据卡片**：悬停时上浮 4px，阴影加深
- **表格行**：悬停时背景色变化，200ms

---

### 10.2 案例管理页

**布局结构**：

```
┌──────────┬────────────────────────────────────────┐
│          │  顶部栏                                 │
│  侧边栏  ├────────────────────────────────────────┤
│          │                                        │
│          │  操作栏                                 │
│          │  [搜索...] [筛选]      [+ 新建案例]    │
│          │                                        │
│          │  案例列表（表格）                        │
│          │  ┌──────────────────────────────────┐  │
│          │  │ 封面 | 标题 | 风格 | 状态 | 操作│  │
│          │  ├──────────────────────────────────┤  │
│          │  │[图]|春季花园|自然|已发布|编辑 删除│  │
│          │  │[图]|中式传统|中式|已发布|编辑 删除│  │
│          │  └──────────────────────────────────┘  │
│          │                                        │
│          │  分页器                                 │
│          │  [<] 1 2 3 ... 10 [>]                 │
│          │                                        │
└──────────┴────────────────────────────────────────┘
```

**设计细节**：

| 元素 | 规格 | 说明 |
|------|------|------|
| **搜索框** | 宽度 300px，高度 40px | 边框 gold-300，聚焦时 gold-500 |
| **新建按钮** | 高度 40px，gold-400 背景 | 白色文字，圆角 6px |
| **表格封面** | 60x60px 正方形，圆角 6px | 图片居中显示 |
| **操作按钮** | 文字按钮，gold-500 颜色 | 悬停时 gold-700，删除按钮 error 色 |

**交互效果**：

- **筛选器**：点击展开下拉面板，300ms
- **表格排序**：点击表头排序，箭头旋转动画
- **删除确认**：弹出确认弹窗，红色警告

---

## 十一、组件库规范

### 11.1 按钮组件

| 类型 | 样式 | 用途 |
|------|------|------|
| **主按钮** | gold-400 背景 + 白色文字 | 主要操作（提交、确认） |
| **次要按钮** | gold-100 背景 + gold-600 文字 | 次要操作（取消、返回） |
| **文字按钮** | 透明背景 + gold-500 文字 | 链接式操作（查看更多） |
| **危险按钮** | error 背景 + 白色文字 | 危险操作（删除） |
| **禁用按钮** | gold-200 背景 + gold-400 文字 | 不可用状态 |

**尺寸规范**：

| 尺寸 | 高度 | 内边距 | 字号 | 用途 |
|------|------|--------|------|------|
| **大** | 48px | 0 32px | 16px | 主要操作（提交） |
| **中** | 40px | 0 24px | 14px | 标准操作 |
| **小** | 32px | 0 16px | 12px | 次要操作 |

**交互状态**：

- **默认**：正常显示
- **悬停**：背景色加深 10%
- **点击**：缩放 0.98，背景色加深 20%
- **禁用**：透明度 0.5，cursor: not-allowed
- **加载**：显示 loading 图标，文字变为"处理中..."

---

### 11.2 输入框组件

| 类型 | 样式 | 用途 |
|------|------|------|
| **单行输入** | 高度 48px，边框 gold-300 | 姓名、手机等 |
| **多行文本** | 最小高度 120px，可拉伸 | 需求描述 |
| **搜索框** | 高度 40px，左侧搜索图标 | 搜索功能 |
| **下拉选择** | 高度 48px，右侧箭头 | 选择器 |

**交互状态**：

- **默认**：边框 gold-300
- **聚焦**：边框 gold-500，阴影 shadow-gold
- **错误**：边框 error 色，下方显示错误提示
- **禁用**：背景 gold-50，cursor: not-allowed

---

### 11.3 卡片组件

| 类型 | 样式 | 用途 |
|------|------|------|
| **数据卡片** | 白色背景，阴影 shadow-md | 数据展示 |
| **内容卡片** | 白色背景，圆角 12px | 内容展示 |
| **交互卡片** | 白色背景，悬停时上浮 | 可点击卡片 |

**尺寸规范**：

| 尺寸 | 内边距 | 圆角 | 用途 |
|------|--------|------|------|
| **小** | 12px | 8px | 标签、徽章 |
| **中** | 16px | 12px | 标准卡片 |
| **大** | 24px | 16px | 大卡片、弹窗 |

---

### 11.4 标签组件

| 类型 | 样式 | 用途 |
|------|------|------|
| **风格标签** | morandi-pink-200 背景 + pink-500 文字 | 风格分类 |
| **状态标签** | morandi-green-200 背景 + green-500 文字 | 状态标识 |
| **普通标签** | gold-100 背景 + gold-600 文字 | 通用标签 |

**尺寸规范**：

- 高度：24px
- 内边距：0 12px
- 圆角：12px（胶囊）
- 字号：12px

---

### 11.5 弹窗组件

| 类型 | 样式 | 用途 |
|------|------|------|
| **确认弹窗** | 宽度 400px，白色背景 | 确认操作 |
| **表单弹窗** | 宽度 600px，白色背景 | 表单填写 |
| **提示弹窗** | 宽度 300px，白色背景 | 提示信息 |

**交互效果**：

- **打开**：从中心放大（scale 0.9 → 1），200ms
- **关闭**：缩小 + 淡出，150ms
- **遮罩**：黑色 50% 透明度，点击可关闭

---

## 十二、动效规范

### 12.1 动画时长

| 类型 | 时长 | 用途 |
|------|------|------|
| **微交互** | 100-200ms | 按钮点击、状态切换 |
| **页面过渡** | 250-300ms | 页面切换、弹窗打开 |
| **复杂动画** | 400-500ms | 列表加载、数据滚动 |

### 12.2 缓动函数

```css
/* 标准缓动 */
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);

/* 进入缓动 */
--ease-in: cubic-bezier(0.4, 0, 1, 1);

/* 退出缓动 */
--ease-out: cubic-bezier(0, 0, 0.2, 1);

/* 弹性缓动 */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 12.3 特殊动效

#### 水彩晕染效果（AI 方案生成加载）

```css
@keyframes watercolor-spread {
  0% {
    transform: scale(0);
    opacity: 0;
    filter: blur(20px);
  }
  50% {
    opacity: 0.8;
    filter: blur(10px);
  }
  100% {
    transform: scale(1);
    opacity: 1;
    filter: blur(0);
  }
}
```

#### 数字滚动效果（利润看板）

```css
@keyframes number-roll {
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
```

#### 卡片进入动画（列表加载）

```css
@keyframes card-enter {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
```

---

## 十三、响应式设计

### 13.1 小程序端

- **设计稿宽度**：375px（iPhone 6/7/8）
- **适配策略**：使用 rpx 单位，750rpx = 屏幕宽度
- **关键断点**：无需断点，流式布局

### 13.2 Web 官网

| 断点 | 屏幕宽度 | 布局调整 |
|------|---------|---------|
| **Mobile** | < 640px | 单列布局，导航折叠 |
| **Tablet** | 640-1024px | 2 列布局 |
| **Desktop** | > 1024px | 3 列布局，完整导航 |

### 13.3 管理后台

- **最小宽度**：1280px
- **布局策略**：固定侧边栏 + 流式内容区
- **无需响应式**：仅支持桌面端

---

## 十四、可访问性规范

### 14.1 色彩对比度

- **正文文字**：对比度 ≥ 4.5:1
- **大标题**：对比度 ≥ 3:1
- **交互元素**：对比度 ≥ 3:1

### 14.2 触摸目标

- **最小尺寸**：44x44px（小程序）
- **推荐尺寸**：48x48px

### 14.3 焦点状态

- **键盘焦点**：显示 2px gold-500 外边框
- **焦点顺序**：符合视觉逻辑

---

## 十五、设计交付清单

### 15.1 设计文件

| 文件 | 内容 | 格式 |
|------|------|------|
| **ui-specification.md** | 本文档，完整设计规范 | Markdown |
| **color-system.css** | 色彩系统 CSS 变量 | CSS |
| **typography.css** | 字体规范 CSS | CSS |
| **components.css** | 组件样式库 | CSS |
| **animations.css** | 动效库 | CSS |

### 15.2 页面清单

| 端 | 页面数 | 说明 |
|----|-------|------|
| **小程序新人端** | 8 个 | 启动页、AI 设计对话首页、精选案例馆、我的、案例详情、预算计算器、筹备清单、婚礼倒计时 |
| **小程序策划师端** | 14 个 | 工作台 Dashboard、订单看板、排期日历、合同管理、酒店管理、道具管理、客户管理、线索列表、全局搜索、个人中心、亲友团任务、订单详情、线索详情、道具市场参考 |
| **Web 官网** | 5 个 | 首页、案例列表、案例详情、服务流程、关于我们 |
| **管理后台** | 10 个 | 仪表盘、案例管理、文章管理、图片管理、订单管理、客户管理、酒店管理、道具管理、合同管理、系统设置 |

**总计**：37 个页面

### 15.3 下一步建议

1. **设计评审**：与产品团队确认设计方案
2. **原型制作**：基于本文档制作高保真原型（Figma/Sketch）
3. **开发实现**：前端团队根据规范开发组件库
4. **用户测试**：邀请目标用户测试交互流程
5. **迭代优化**：根据反馈持续优化设计

---

## 附录：设计资源

### A. 灵感参考

- **莫兰迪色系**：低饱和度、高级感
- **水彩艺术**：柔和过渡、自然流动
- **婚礼摄影**：浪漫、温馨、精致
- **奢侈品设计**：留白、排版、质感

### B. 设计工具

- **Figma**：UI 设计、原型制作
- **Adobe Illustrator**：图标、插画
- **After Effects**：动效演示
- **Zeplin**：设计交付、标注

### C. 字体下载

- [Noto Sans SC](https://fonts.google.com/noto/specimen/Noto+Sans+SC)
- [Playfair Display](https://fonts.google.com/specimen/Playfair+Display)
- [Lato](https://fonts.google.com/specimen/Lato)

---

**文档版本**：v1.0  
**最后更新**：2026-06-23  
**维护者**：UI 设计团队  
**联系方式**：design@daxiwedding.com
