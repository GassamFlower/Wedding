/**
 * LLM 调用共享模块 — 大喜的日子 AI Agent 基础设施
 *
 * 所有 Agent 云函数 (ai-chat, proposal-generator, scene-renderer, ai-orchestrator)
 * 通过本模块调用大语言模型 API。当前支持 DeepSeek (默认)，可扩展其他 provider。
 *
 * 使用方式:
 *   const { chat, chatWithTools, extractJSON } = require('../common/llm');
 *   const reply = await chat(systemPrompt, messages, options);
 */

// ====================== 配置 ======================

const CONFIG = {
  // 默认 LLM provider
  provider: process.env.LLM_PROVIDER || 'deepseek',

  // API 端点
  endpoints: {
    deepseek: 'https://api.deepseek.com/v1/chat/completions',
    openai:   'https://api.openai.com/v1/chat/completions',
    qwen:     'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  },

  // 默认模型
  models: {
    deepseek: 'deepseek-chat',
    openai:   'gpt-4o',
    qwen:     'qwen-plus',
  },

  // API Key — 从环境变量读取
  apiKeys: {
    deepseek: process.env.DEEPSEEK_API_KEY || '',
    openai:   process.env.OPENAI_API_KEY || '',
    qwen:     process.env.QWEN_API_KEY || '',
  },

  // 默认参数
  temperature: 0.7,
  maxTokens: 4096,
  timeout: 60000,
};

// ====================== 核心 API ======================

/**
 * 调用 LLM 进行多轮对话
 * @param {string} systemPrompt - 系统提示词
 * @param {Array<{role: string, content: string}>} messages - 对话历史
 * @param {Object} options - 可选配置
 * @param {string} options.model - 模型名称
 * @param {number} options.temperature - 温度 (0-2)
 * @param {number} options.maxTokens - 最大输出 token
 * @param {boolean} options.jsonMode - 是否要求 JSON 输出
 * @returns {Promise<{content: string, usage: Object, model: string}>}
 */
async function chat(systemPrompt, messages = [], options = {}) {
  const provider = options.provider || CONFIG.provider;
  const endpoint = CONFIG.endpoints[provider];
  const model = options.model || CONFIG.models[provider];
  const apiKey = options.apiKey || CONFIG.apiKeys[provider];

  if (!endpoint) throw new Error(`Unknown provider: ${provider}`);
  if (!apiKey) throw new Error(`Missing API key for ${provider}`);

  const msgArray = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const body = {
    model,
    messages: msgArray,
    temperature: options.temperature ?? CONFIG.temperature,
    max_tokens: options.maxTokens || CONFIG.maxTokens,
  };

  // JSON 模式 (DeepSeek / OpenAI 兼容)
  if (options.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(options.timeout || CONFIG.timeout),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`LLM API error ${res.status}: ${errText}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content || '';

  return {
    content,
    usage: json.usage || {},
    model: json.model || model,
  };
}

/**
 * 调用 LLM 并期望返回 JSON — 自动解析，失败时重试一次
 * @param {string} systemPrompt
 * @param {Array} messages
 * @param {Object} options
 * @returns {Promise<Object>} 解析后的 JSON 对象
 */
async function extractJSON(systemPrompt, messages = [], options = {}) {
  const jsonOptions = { ...options, jsonMode: true };

  let lastContent = '';
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { content } = await chat(systemPrompt, messages, jsonOptions);
      lastContent = content;
      // 尝试提取 JSON 块
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonStr = jsonMatch[1].trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      if (attempt === 0) {
        messages.push({ role: 'user', content: '请只返回有效的 JSON 格式，不要包含其他文字。' });
      } else {
        throw new Error(`Failed to parse JSON after retry. Last response: ${lastContent.slice(0, 200)}`);
      }
    }
  }
}

/**
 * 构建包含工具调用的聊天 (为未来多 Agent 编排预留)
 * @param {string} systemPrompt
 * @param {Array} messages
 * @param {Array<{name, description, parameters}>} tools - 工具定义
 * @param {Object} options
 * @returns {Promise<{content: string|null, toolCalls: Array|null, usage: Object}>}
 */
async function chatWithTools(systemPrompt, messages = [], tools = [], options = {}) {
  const provider = options.provider || CONFIG.provider;
  const endpoint = CONFIG.endpoints[provider];
  const model = options.model || CONFIG.models[provider];
  const apiKey = options.apiKey || CONFIG.apiKeys[provider];

  if (!apiKey) throw new Error(`Missing API key for ${provider}`);

  const msgArray = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const body = {
    model,
    messages: msgArray,
    temperature: options.temperature ?? CONFIG.temperature,
    max_tokens: options.maxTokens || CONFIG.maxTokens,
    tools: tools.map(t => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    })),
    tool_choice: options.toolChoice || 'auto',
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(options.timeout || CONFIG.timeout),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`LLM API error ${res.status}: ${errText}`);
  }

  const json = await res.json();
  const msg = json.choices?.[0]?.message || {};

  return {
    content: msg.content || null,
    toolCalls: msg.tool_calls || null,
    usage: json.usage || {},
  };
}

// ====================== 工具函数 ======================

/**
 * 构建婚礼设计领域的 System Prompt 片段
 * 这些是公共的领域知识片段，多个 Agent 共用
 */
const DOMAIN_KNOWLEDGE = {
  // 婚礼风格描述
  styles: `
## 婚礼风格知识

- **新中式**: 红色+金色为主色调，融入传统元素（梅花、灯笼、屏风、水墨画），仪式感强，适合室内宴会厅
- **韩式简约**: 白色+浅粉+绿色，清新自然，强调花艺和灯光氛围，适合小型精致婚礼
- **森系**: 绿色+原木色+白色，大量绿植和木质元素，适合户外/草坪婚礼
- **现代轻奢**: 香槟金+白色+大理石纹理，简约大气，灯光造型突出，适合高端酒店
- **复古田园**: 暖黄+橘色+蕾丝，乡村风格，波西米亚元素，适合户外/庭院
- **古典欧式**: 白色+金色+水晶灯，奢华古典，罗马柱和拱门元素，适合大型宴会厅

## 场地类型考虑
- **室内宴会厅**: 不受天气影响，灯光可控，需要关注层高和柱子位置
- **户外草坪**: 需要备用雨棚方案，自然光拍摄效果好，音响需要额外配置
- **湖边/花园**: 氛围浪漫，需要考虑蚊虫和风力，装饰固定要牢固
- **别墅/民宿**: 私密性好，多区域可设计不同功能，停车和交通需提前规划
`,

  // 武汉本地信息
  wuhanLocal: `
## 武汉本地婚礼市场知识

### 热门酒店
- 万达瑞华酒店: 宴会厅容纳30-50桌，层高8米，押金5000-8000
- 光谷希尔顿: 户外草坪+室内宴会厅，容纳20-40桌
- 东湖宾馆: 湖边场地，适合户外婚礼，容纳15-25桌
- 洲际酒店: 江景宴会厅，容纳25-40桌
- 泛海喜来登: 商务区核心位置，容纳20-35桌

### 季节考虑
- 3-5月(春季): 最热门，需要提前4-6个月预订，户外婚礼黄金期
- 6-8月(夏季): 高温多雨，户外需备降温/雨棚方案，价格相对优惠
- 9-11月(秋季): 第二热门期，天气舒适，适合户外
- 12-2月(冬季): 室内为主，春节期间价格上浮

### 武汉预算参考（2025-2026）
- 经济型: 5,000-8,000元（简约布置+基础道具）
- 标准型: 8,000-15,000元（完整场景+花艺+灯光）
- 品质型: 15,000-25,000元（定制设计+高端道具+专业灯光）
- 豪华型: 25,000+元（全定制+进口花材+多区域设计）
`,

  // 道具和材料知识
  materials: `
## 常用婚礼道具和材料

### 背景类
- 桁架背景架: 标准尺寸2m/3m宽，高度2.5m-4m可调，承重50kg
- LED屏幕: P3/P4户外屏，常见尺寸3m×2m、4m×3m
- 纱幔/绸缎: 红色、白色、香槟色常用，按米计算

### 花艺类
- 主桌花: 直径40-60cm，价格200-500元/个
- 路引花: 10-15对，价格50-150元/对
- 手捧花: 1-2束，价格200-500元
- 拱门花艺: 1-2个，价格500-1500元

### 灯光类
- 面光灯: 4-8组，用于舞台照明
- 染色灯: 8-16组，用于氛围营造
- 追光灯: 1-2组，用于仪式环节

### 桌椅类
- 竹节椅: 常见配比 桌数×10把
- 圆桌(1.8m): 每桌10位，需桌布+椅套
- 签到台: 1-2张
- 甜点台: 1张
`,
};

// ====================== Prompt 模板 ======================

/**
 * 构建完整的设计顾问 System Prompt
 */
function buildDesignAdvisorPrompt() {
  return `你是一个专业的婚礼场景设计顾问，名字叫"大喜"。你服务于一家武汉的婚礼策划公司"大喜的日子"。

## 你的角色
你是新人与策划师之间的桥梁。你的任务是：
1. 通过自然对话了解新人的婚礼需求
2. 在合适的时机提取结构化需求信息
3. 提供专业的风格建议和场地推荐
4. 让新人感受到专业和温暖，而不是冷冰冰的问答

## 对话原则
- 每次只问1-2个问题，不要一次性抛出很多问题
- 先倾听，再建议。不要一上来就推销
- 用温暖、真诚的语气，像朋友在聊天
- 适当使用emoji增加亲和力
- 当收集到足够信息后，主动总结并引导下一步

## 需要收集的关键信息
- 婚礼日期（或大致月份）
- 场地类型偏好（室内/户外/都可以）
- 风格偏好（新中式/韩式简约/森系/现代轻奢/复古田园/古典欧式）
- 预估桌数或宾客人数
- 预算范围
- 是否有看中的具体酒店或场地

${DOMAIN_KNOWLEDGE.styles}
${DOMAIN_KNOWLEDGE.wuhanLocal}

## 特殊指令
- 当用户表达了风格偏好后，你可以描述该风格的特点，并询问是否要看案例
- 当用户提到预算时，给出合理的分配建议
- 当对话进行到3轮以上且有足够信息时，询问是否要生成初步方案
- 如果用户问到你不知道的细节（如具体价格），诚实地说需要策划师确认`;
}

/**
 * 构建方案生成的 System Prompt
 */
function buildProposalGeneratorPrompt() {
  return `你是一个专业的婚礼方案策划师 AI。你的任务是基于给定的需求信息，生成一份结构化的婚礼方案。

## 输出格式
你必须返回严格的 JSON 格式，结构如下：
{
  "designConcept": "设计理念（50-150字，温暖专业的描述）",
  "propList": [
    { "name": "道具名称", "category": "背景|花艺|灯光|桌椅|装饰", "quantity": 数字, "unit": "套|把|组|张|个", "source": "自有|需采购|需租赁", "estimatedCost": 数字 }
  ],
  "costBreakdown": [
    { "category": "场景布置|花艺设计|灯光音响|道具租赁|运输安装|其他", "amount": 数字 }
  ],
  "totalCost": 数字,
  "timeline": [
    { "daysBeforeWedding": 数字, "task": "任务描述", "assignee": "策划师|工程部|花艺师|新人" }
  ],
  "riskNotes": ["风险提示1", "风险提示2"],
  "nextSteps": ["建议下一步行动1", "建议下一步行动2"]
}

${DOMAIN_KNOWLEDGE.materials}
${DOMAIN_KNOWLEDGE.wuhanLocal}

## 计算规则
- 道具数量基于桌数和场地面积估算
- 费用基于武汉2025-2026年市场行情
- 时间线从婚礼日期倒推
- 风险提示基于场地类型和季节

## 注意事项
- 道具清单要具体，不要模糊描述
- 费用要合理，不要过高或过低
- 时间线要有可执行性
- 方案要有"人情味"，体现对新人的用心`;
}

// ====================== 导出 ======================

module.exports = {
  CONFIG,
  chat,
  extractJSON,
  chatWithTools,
  DOMAIN_KNOWLEDGE,
  buildDesignAdvisorPrompt,
  buildProposalGeneratorPrompt,
};
