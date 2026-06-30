const api = require('../../services/api');
const { updateTabBar } = require('../../utils/tabBar');
const DEMO_ORDERS = [
  { id: 'd1', client: '张先生 & 李女士', date: '6月15日', venue: '万达酒店·宴会厅', style: '新中式', budget: '12,000', paid: '7,200', balance: '4,800', status: '筹备中', statusClass: 'progress', short: '张', avatarClass: 1, phone: '138****1234', deposit: '3000', depositStatus: '已缴纳' },
  { id: 'd2', client: '王先生 & 赵女士', date: '6月28日', venue: '湖滨酒店·草坪', style: '韩式', budget: '8,500', paid: '4,000', balance: '4,500', status: '花艺筹备', statusClass: 'pending', short: '王', avatarClass: 2, phone: '139****5678', deposit: '2000', depositStatus: '待缴纳' },
  { id: 'd3', client: '刘先生 & 陈女士', date: '7月8日', venue: '香格里拉·宴会厅', style: '森系', budget: '18,000', paid: '12,000', balance: '6,000', status: '准备就绪', statusClass: 'ready', short: '刘', avatarClass: 3, phone: '136****9012', deposit: '5000', depositStatus: '已缴纳' },
  { id: 'd4', client: '陈先生 & 周女士', date: '7月20日', venue: '田园酒店·花园', style: '复古', budget: '6,800', paid: '3,000', balance: '3,800', status: '筹备中', statusClass: 'progress', short: '陈', avatarClass: 4, phone: '137****3456', deposit: '1500', depositStatus: '已缴纳' },
  { id: 'd5', client: '林先生 & 黄女士', date: '5月10日', venue: '希尔顿·宴会厅', style: '现代', budget: '15,000', paid: '15,000', balance: '0', status: '已完成', statusClass: 'done', short: '林', avatarClass: 1, phone: '150****7890', deposit: '4000', depositStatus: '已退还' },
  { id: 'd6', client: '朱先生 & 杨女士', date: '8月2日', venue: '万达酒店·草坪', style: '新中式', budget: '10,000', paid: '5,000', balance: '5,000', status: '方案确认', statusClass: 'pending', short: '朱', avatarClass: 2, phone: '151****2345', deposit: '3000', depositStatus: '待缴纳' },
];

Page({
  data: {
    keyword: '', status: 'all', sortBy: 'date',
    orders: [], filtered: [], loading: true,
    statusConfig: [
      { key: 'all', label: '全部', icon: 'clipboard', count: 0 },
      { key: 'progress', label: '进行中', icon: 'refresh', count: 0, color: '#b8956a' },
      { key: 'pending', label: '待确认', icon: 'hourglass', count: 0, color: '#c67a00' },
      { key: 'ready', label: '已就绪', icon: 'check-circle', count: 0, color: '#1976d2' },
      { key: 'done', label: '已完成', icon: 'celebration', count: 0, color: '#2e7d32' },
    ],
    showForm: false, formData: {},
    sortOptions: [{ key: 'date', label: '按日期' }, { key: 'budget', label: '按预算' }, { key: 'status', label: '按状态' }],
    showSortPicker: false,
    totalOrders: 0, totalRevenue: 0, pendingRevenue: 0,
  },

  onLoad() {
    const { action } = wx.getEnterOptionsSync().query || {};
    if (action === 'create') this.openCreate();
    this.loadData();
  },
  onShow() {
    updateTabBar(this, 1);
  },

  loadData() {
    this.setData({ loading: true });
    api.orders.list({}, null).then(data => {
      this.setData({ loading: false });
      const orders = (data && Array.isArray(data.list)) ? data.list : DEMO_ORDERS;
      this.processOrders(orders);
    }).catch(() => {
      this.setData({ loading: false });
      this.processOrders(DEMO_ORDERS);
    });
  },

  processOrders(orders) {
    // 计算统计
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((s, o) => s + (parseFloat(String(o.budget).replace(/,/g,'')) || 0), 0);
    const pendingRevenue = orders.reduce((s, o) => s + (parseFloat(String(o.balance).replace(/,/g,'')) || 0), 0);
    
    // 更新每个状态计数
    // 格式化数字用于 WXML 展示（toLocaleString 在 WXML 中不可用）
    const revenueStr = totalRevenue.toLocaleString();
    const pendingStr = pendingRevenue.toLocaleString();
    const showAllCases = orders.length;
    
    const statusConfig = this.data.statusConfig.map(c => ({
      ...c,
      count: c.key === 'all' ? orders.length : orders.filter(o => o.statusClass === c.key).length,
    }));

    this.setData({ orders, totalOrders, totalRevenue, pendingRevenue, statusConfig });
    this.filterOrders();
  },

  filterOrders() {
    const { keyword, status, sortBy, orders } = this.data;
    let list = [...orders];
    if (status !== 'all') list = list.filter(o => o.statusClass === status);
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      list = list.filter(o => (o.client || '').toLowerCase().includes(kw) || (o.venue || '').toLowerCase().includes(kw) || (o.phone || '').includes(kw));
    }
    // 排序
    if (sortBy === 'budget') list.sort((a, b) => (parseFloat(String(b.budget).replace(/,/g,'')) || 0) - (parseFloat(String(a.budget).replace(/,/g,'')) || 0));
    else if (sortBy === 'status') list.sort((a, b) => this._statusWeight(a) - this._statusWeight(b));
    else list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    
    this.setData({ filtered: list });
  },

  _statusWeight(o) {
    const w = { progress: 1, pending: 2, ready: 3, done: 4 };
    return w[o.statusClass] || 0;
  },

  onSearchInput(e) { this.setData({ keyword: e.detail.value }); this.filterOrders(); },
  onSearchConfirm() { this.filterOrders(); },

  switchTab(e) {
    this.setData({ status: e.currentTarget.dataset.key, keyword: '' });
    this.filterOrders();
  },

  toggleSort() { this.setData({ showSortPicker: !this.data.showSortPicker }); },
  selectSort(e) { this.setData({ sortBy: e.currentTarget.dataset.key, showSortPicker: false }); this.filterOrders(); },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/order-detail/order-detail?id=' + id });
  },

  openCreate() { this.setData({ showForm: true, formData: { clientName: '', weddingDate: '', venue: '', style: '', budget: '', phone: '' } }); },
  closeForm() { this.setData({ showForm: false }); },
  onFormInput(e) { const f = e.currentTarget.dataset.field; this.setData({ ['formData.' + f]: e.detail.value }); },

  submitForm() {
    const { formData } = this.data;
    if (!formData.clientName.trim()) { wx.showToast({ title: '请输入新人姓名', icon: 'none' }); return; }
    api.orders.create({ data: formData }).then(() => {
      wx.showToast({ title: '创建成功', icon: 'success' });
      this.closeForm(); this.loadData();
    }).catch(() => {
      wx.showToast({ title: '创建成功（演示模式）', icon: 'success' });
      this.closeForm();
    });
  },

  callClient(e) {
    const phone = e.currentTarget.dataset.phone;
    if (phone) wx.makePhoneCall({ phoneNumber: phone });
  },

  goSearch() { wx.navigateTo({ url: '/pages/search/search' }); },
  onPullDownRefresh() { this.loadData(); wx.stopPullDownRefresh(); },
    onShareAppMessage() { return { title: '大喜的日子·订单管理', path: '/pages/orders/orders' }; },
});