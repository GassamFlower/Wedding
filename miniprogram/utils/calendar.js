/**
 * 日历生成工具
 * 生成指定年月的日历网格数据
 */

function generateCalendar(year, month, eventDays = []) {
  // month: 1-12
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  // 星期几 (0=日, 1=一, ...) - 我们需要周一开始
  let startWeekday = firstDay.getDay() - 1;
  if (startWeekday < 0) startWeekday = 6; // 周日转换成6

  const cells = [];
  // 填充前部空白
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ day: 0, isEmpty: true });
  }
  // 填充日期
  for (let d = 1; d <= daysInMonth; d++) {
    const hasEvent = eventDays.includes(d);
    cells.push({
      day: d,
      isEmpty: false,
      hasEvent,
      isToday: isToday(year, month, d),
    });
  }

  return cells;
}

function isToday(year, month, day) {
  const today = new Date();
  return today.getFullYear() === year
    && today.getMonth() === month - 1
    && today.getDate() === day;
}

module.exports = { generateCalendar };
