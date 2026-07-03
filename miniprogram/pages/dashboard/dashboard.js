const api = require('../../services/api');
const { updateTabBar } = require('../../utils/tabBar');
const app = getApp();
const DEMO_ORDERS = [
  { id: 'd1', client: '张先生 & 李女士', date: '6月15日', venue: '万达酒店·宴会厅', tags: ['新中式','室内'], amount: '12,000', status: '筹备中', badgeClass: 'badge-progress', statusClass: 'progress', short: '张', avatarClass: 'avatar-1' },
  { id: 'd2', client: '王先生 & 赵女士', date: '6月28日', venue: '湖滨酒店·草坪', tags: ['韩式','户外'], amount: '8,500', status: '花艺筹备', badgeClass: 'badge-pending', statusClass: 'pending', short: '王', avatarClass: 'avatar-2' },
  { id: 'd3', client: '刘先生 & 陈女士', date: '7月8日', venue: '香格里拉·宴会厅', tags: ['森系','室内'], amount: '18,000', status: '准备就绪', badgeClass: 'badge-ready', statusClass: 'ready', short: '刘', avatarClass: 'avatar-3' },
  { id: 'd4', client: '陈先生 & 周女士', date: '7月20日', venue: '田园酒店·花园', tags: ['复古','户外'], amount: '6,800', status: '筹备中', badgeClass: 'badge-progress', statusClass: 'progress', short: '陈', avatarClass: 'avatar-4' },
];
Page({
  data: {
    monthOrders: '--', activeOrders: '--', monthIncome: '--',
    orders: [], todos: [],
    pendingLeads: 0, overdueLeads: 0,
    pendingBalance: 0, pendingBalanceCount: 0,
    loading: true, error: false, errorMsg: '',
    now: '', todayCount: 0,
    showLoginModal: false
  },
  onLoad() {
    // 注册登录弹窗到全局
    this._loginModalShowFn = (show) => {
      this.setData({ showLoginModal: show });
    };
    app.registerLoginModal(this._loginModalShowFn);

    this.setData({ now: new Date().toISOString().slice(0,10) });
    
    // 登录守卫：策划师工作台需要登录
    if (!app.globalData.isLoggedIn) {
      api.requireLogin(() => {
        this.loadData();
      });
    } else {
      this.loadData();
    }
  },
  onShow() {
    updateTabBar(this, 0);
    if (app.globalData.isLoggedIn) {
      this.loadData();
    }
  },
  onLoginSuccess() {
    this.setData({ showLoginModal: false });
    this.loadData();
  },
  onLoginClose() {
    this.setData({ showLoginModal: false });
  },
  onUnload() {
    // 页面卸载时注销登录弹窗
    if (this._loginModalShowFn) {
      app.unregisterLoginModal(this._loginModalShowFn);
    }
  },
  loadData() {
    this.setData({ loading: true, error: false });
    api.dashboard.summary(null).then(data => {
      this.setData({ loading: false });
      if (!data) {
        this.setData({
          monthOrders: 4, activeOrders: 3, monthIncome: '18,600',
          orders: DEMO_ORDERS,
          todos: [
            { id: 't1', text: '确认王先生婚礼花艺方案', time: '今日', done: false, priority: '高' },
            { id: 't2', text: '联系酒店确认押金退还', time: '明日', done: false, priority: '中' },
            { id: 't3', text: '补充道具库存清单', time: '本周', done: false, priority: '中' },
          ],
          pendingLeads: 3, overdueLeads: 1,
          pendingBalance: 8400, pendingBalanceCount: 2,
          todayCount: 2
        });
        return;
      }
      this.setData({
        monthOrders: data.monthOrders != null ? data.monthOrders : this.data.monthOrders,
        activeOrders: data.activeOrders != null ? data.activeOrders : this.data.activeOrders,
        monthIncome: data.monthIncome != null ? data.monthIncome : this.data.monthIncome,
        orders: Array.isArray(data.orders) ? data.orders : this.data.orders,
        todos: Array.isArray(data.todos) ? data.todos : this.data.todos,
        pendingLeads: data.pendingLeads != null ? data.pendingLeads : 0,
        overdueLeads: data.overdueLeads != null ? data.overdueLeads : 0,
        pendingBalance: data.pendingBalance != null ? data.pendingBalance : 0,
        pendingBalanceCount: data.pendingBalanceCount != null ? data.pendingBalanceCount : 0,
      });
    }).catch(() => {
      this.setData({ loading: false, error: true, errorMsg: '数据加载失败' });
    });
  },
  onNav(e) {
    const page = e.currentTarget.dataset.page;
    wx.navigateTo({ url: page });
  },
  goOrder(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/order-detail/order-detail?id=' + id });
  },
  goLeads() { wx.navigateTo({ url: '/pages/leads-list/leads-list' }); },
  goSchedule() { wx.switchTab({ url: '/pages/schedule/schedule' }); },
  goContracts() { wx.switchTab({ url: '/pages/contracts/contracts' }); },
  toggleTodo(e) {
    const id = e.currentTarget.dataset.id;
    const todos = this.data.todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
    this.setData({ todos });
  },
  goSearch() { wx.navigateTo({ url: '/pages/search/search' }); },
  goNewOrder() { wx.navigateTo({ url: '/pages/orders/orders?action=create' }); },
  onPullDownRefresh() { this.loadData(); wx.stopPullDownRefresh(); },
  onShareAppMessage() { return { title: '大喜的日子·工作台', path: '/pages/dashboard/dashboard' }; },
});
