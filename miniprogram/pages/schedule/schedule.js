const api = require('../../services/api');
const { updateTabBar } = require('../../utils/tabBar');
const { generateCalendar } = require('../../utils/calendar');
const app = getApp();
Page({
  data: {
    year: 2026, month: 6,
    cells: [],
    weddings: [], loading: true, error: false, errorMsg: '',
    eventDays: [],
    showLoginModal: false,
  },
  onLoad() {
    this._loginModalShowFn = (show) => { this.setData({ showLoginModal: show }); };
    app.registerLoginModal(this._loginModalShowFn);

    const now = new Date();
    const year = now.getFullYear(), month = now.getMonth() + 1;
    this.setData({ year, month });
    this.buildCalendar(year, month);
    
    // 登录守卫
    if (!app.globalData.isLoggedIn) {
      api.requireLogin(() => { this.loadData(); });
    } else {
      this.loadData();
    }
  },
  onUnload() {
    if (this._loginModalShowFn) app.unregisterLoginModal(this._loginModalShowFn);
  },

  onLoginSuccess() {
    this.setData({ showLoginModal: false });
    this.loadData();
  },

  onLoginClose() {
    this.setData({ showLoginModal: false });
  },
  onShow() {
    updateTabBar(this, 2);
  },
  buildCalendar(year, month) {
    const cells = generateCalendar(year, month, this.data.eventDays);
    this.setData({ cells });
  },
  loadData() {
    this.setData({ loading: true, error: false, errorMsg: '' });
    api.schedule.list({ rangeDays: 90 }, null).then(data => {
      this.setData({ loading: false });
      if (data && Array.isArray(data.weddings)) {
        this.setData({ weddings: data.weddings });
        const days = data.weddings.map(w => new Date(w.date).getDate());
        this.setData({ eventDays: days });
        this.buildCalendar(this.data.year, this.data.month);
      } else {
        this.setData({ weddings: [], eventDays: [] });
        this.buildCalendar(this.data.year, this.data.month);
      }
    }).catch(err => {
      console.error('排期加载失败:', err);
      this.setData({
        loading: false,
        error: true,
        errorMsg: '数据加载失败，请下拉刷新重试'
      });
    });
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
