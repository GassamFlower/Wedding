// 云函数共享工具（源版本：dashboard/utils.js）
// 同步策略：由于微信云函数之间不能共享代码，本文件是 "源"，
//    其余云函数目录下的 utils.js 必须与本文件保持一致。
//    部署前可手动 / 用脚本复制到 cloudfunctions/*/utils.js。

// ====================== 响应格式 ======================

function ok(data) { return { code: 0, data: (data === undefined ? null : data), _meta: { timestamp: new Date().toISOString() } }; }
function fail(msg, code) { return { code: code || -1, msg: msg || '操作失败', _meta: { timestamp: new Date().toISOString() } }; }


async function safe(promise, fallback) {
  try { return await promise; } catch (e) { return fallback; }
}

// ====================== 输入校验 ======================

const PAGE_SIZE_DEFAULT = 20;
const PAGE_SIZE_MAX = 100;

function normalizePage(input) {
  const page = Math.max(1, parseInt(input && input.page, 10) || 1);
  let pageSize = parseInt(input && input.pageSize, 10) || PAGE_SIZE_DEFAULT;
  if (pageSize < 1) pageSize = PAGE_SIZE_DEFAULT;
  if (pageSize > PAGE_SIZE_MAX) pageSize = PAGE_SIZE_MAX;
  return { page, pageSize, skip: (page - 1) * pageSize };
}

function safeStr(v, maxLen) {
  if (v === undefined || v === null) return '';
  const s = String(v).trim();
  return maxLen ? s.slice(0, maxLen) : s;
}

function requireFields(data, fields) {
  if (!data || typeof data !== 'object') return `参数缺失: ${fields.join(', ')}`;
  for (const f of fields) {
    if (data[f] === undefined || data[f] === null || data[f] === '') {
      return `缺少必填字段: ${f}`;
    }
  }
  return null;
}

async function assertOwnership(db, collection, id, openid) {
  if (!id) return { ok: false, msg: '缺少 id' };
  try {
    const r = await db.collection(collection).doc(id).get();
    if (!r.data) return { ok: false, msg: '记录不存在' };
    if (r.data._openid && r.data._openid !== openid) return { ok: false, msg: '无权访问', code: 403 };
    return { ok: true, doc: r.data };
  } catch (e) {
    return { ok: false, msg: '记录不存在' };
  }
}

/** 校验正数（含 0），返回 0 或正值，无效返回 null */
function validateAmount(v) {
  if (v === undefined || v === null) return null;
  const n = Number(v);
  return (!Number.isFinite(n) || n < 0) ? null : n;
}

/** 校验字符串是否在枚举列表内 */
function validateEnum(v, enums) {
  if (!v) return null;
  return enums.includes(v) ? v : null;
}

/** 校验并解析日期，可选范围 [minYear, maxYear] */
function validateDate(v, minYear, maxYear) {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  if (isNaN(d.getTime())) return null;
  if (minYear !== undefined && d.getFullYear() < minYear) return null;
  if (maxYear !== undefined && d.getFullYear() > maxYear) return null;
  return d;
}

/** 校验中国大陆手机号 */
function validatePhone(v) {
  if (!v) return null;
  return /^1[3-9]\d{9}$/.test(String(v).trim()) ? String(v).trim() : null;
}

/**
 * 软删除常量
 * 使用方式：查询时用 { isDeleted: notDeleted() } 兼容无 isDeleted 字段的老数据
 * 注意：notDeleted 是一个函数，需要传入 _.command（即 db.command）
 */
const NOT_DELETED = false;
const DELETED = true;
function notDeleted(_) {
  return _.neq(true);
}

module.exports = {
  ok, fail, safe,
  PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX,
  normalizePage, safeStr, requireFields, assertOwnership,
  validateAmount, validateEnum, validateDate, validatePhone,
  NOT_DELETED, DELETED, notDeleted,
  formatMoney, formatMonthDay, formatYMD, parseDate,
  badgeOf, statusClassOf, takeShort, avatarClassOf,
  ping,
};

// ====================== 格式化 ======================

function formatMoney(n) {
  if (n === null || n === undefined || n === '') return '0';
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function formatMonthDay(dateLike) {
  if (!dateLike) return '';
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (isNaN(d.getTime())) return String(dateLike);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function formatYMD(dateLike) {
  if (!dateLike) return '';
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (isNaN(d.getTime())) return String(dateLike);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function parseDate(v) {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

// ====================== 显示辅助 ======================

function badgeOf(status) {
  if (!status) return 'badge-progress';
  const s = String(status);
  if (s.includes('完成') || s.includes('结算') || s.includes('结清')) return 'badge-done';
  if (s.includes('就绪')) return 'badge-ready';
  if (s.includes('待') || s.includes('确认')) return 'badge-pending';
  return 'badge-progress';
}

function statusClassOf(status) {
  if (!status) return 'progress';
  const s = String(status);
  if (s.includes('完成') || s.includes('结算') || s.includes('结清')) return 'done';
  if (s.includes('就绪')) return 'ready';
  if (s.includes('待') || s.includes('确认')) return 'pending';
  return 'progress';
}

function takeShort(name) {
  if (!name) return '?';
  return String(name).trim().charAt(0) || '?';
}

function avatarClassOf(seed) {
  const s = String(seed || '');
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0;
  return (Math.abs(hash) % 4) + 1;
}

function ping(name) {
  return ok({
    name: name || 'unknown',
    ok: true,
    serverTime: new Date().toISOString(),
  });
}

