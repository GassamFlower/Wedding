const api = require('../../services/api');
const { updateTabBar } = require('../../utils/tabBar');
const { generateCalendar } = require('../../utils/calendar');
Page({
  data: {
    year: 2026, month: 6,
    cells: [],
    weddings: [], loading: true,
    eventDays: [15, 28],
  },
  onLoad() {
    const now = new Date();
    const year = now.getFullYear(), month = now.getMonth() + 1;
    this.setData({ year, month });
    this.buildCalendar(year, month);
    this.loadData();
  },
  onShow() {
    updateTabBar(this, 2);
  },
  buildCalendar(year, month) {
    const cells = generateCalendar(year, month, this.data.eventDays);
    this.setData({ cells });
  },
  loadData() {
    this.setData({ loading: true });
    api.schedule.list({ rangeDays: 90 }, null).then(data => {
      this.setData({ loading: false });
      if (data && Array.isArray(data.weddings)) {
        this.setData({ weddings: data.weddings });
        const days = data.weddings.map(w => new Date(w.date).getDate());
        this.setData({ eventDays: days });
        this.buildCalendar(this.data.year, this.data.month);
      } else {
        this.setData({ weddings: [
          { id: 'd1', client: '张先生 & 李女士', date: '6月15日', venue: '万达酒店', statusClass: 'progress' },
          { id: 'd2', client: '王先生 & 赵女士', date: '6月28日', venue: '湖滨酒店', statusClass: 'pending' },
        ]});
      }
    }).catch(() => this.setData({ loading: false }));
  },
  goPrev() {
    let { year, month } = this.data;
    if (month === 1) { year--; month = 12; } else { month--; }
    this.setData({ year, month });
    this.buildCalendar(year, month);
  },
  goNext() {
    let { year, month } = this.data;
    if (month === 12) { year++; month = 1; } else { month++; }
    this.setData({ year, month });
    this.buildCalendar(year, month);
  },
  goToday() {
    const now = new Date();
    const year = now.getFullYear(), month = now.getMonth() + 1;
    this.setData({ year, month });
    this.buildCalendar(year, month);
  },
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/order-detail/order-detail?id=' + id });
  },
  onPullDownRefresh() { this.loadData(); wx.stopPullDownRefresh(); },
    onShareAppMessage() { return { title: '大喜的日子·排期管理', path: '/pages/schedule/schedule' }; },
});
