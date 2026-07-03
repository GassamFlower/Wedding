/**
 * 共享模块入口 — common
 *
 * 本目录包含多个云函数共享的基础设施模块：
 * - llm.js: LLM API 调用封装
 * - cost-engine.js: 成本利润计算引擎
 * - membership.js: AI 会员体系与配额管理
 *
 * 其他云函数通过相对路径引用：
 *   const { chat } = require('../common/llm');
 *   const { calculateFullCost } = require('../common/cost-engine');
 *   const { checkQuota } = require('../common/membership');
 *
 * 注意：本目录不作为独立云函数部署，仅作为共享模块被其他云函数引用。
 */

// 导出所有共享模块，方便统一引用
const llm = require('./llm');
const costEngine = require('./cost-engine');
const membership = require('./membership');

module.exports = {
  llm,
  costEngine,
  membership,
};
