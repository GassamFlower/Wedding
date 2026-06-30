export function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date.getTime())) return String(d)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export function formatDateTime(d) {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date.getTime())) return String(d)
  return date.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function formatMoney(n) {
  if (n === null || n === undefined || n === '') return '¥0'
  const num = Number(n)
  if (isNaN(num)) return String(n)
  return '¥' + num.toLocaleString('en-US', { maximumFractionDigits: 2 })
}
