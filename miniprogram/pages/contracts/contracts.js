const api = require('../../services/api');
const { updateTabBar } = require('../../utils/tabBar');
const app = getApp();

Page({
  data: {
    monthTotal: '0', pendingTotal: '0', monthCost: '0', profitTotal: '0',
    contracts: [], filtered: [], loading: true, error: false, errorMsg: '',
    keyword: '', status: 'all',
    statusTabs: [
      { key: 'all', label: '全部', icon: 'file' },
      { key: 'pending', label: '未结清', icon: 'hourglass' },
      { key: 'done', label: '已结清', icon: 'check-circle' },
    ],
    showPay: false, payData: { id: '', amount: '0', client: '' },
    showLoginModal: false,
  },

  onLoad() {
    this._loginModalShowFn = (show) => { this.setData({ showLoginModal: show }); };
    app.registerLoginModal(this._loginModalShowFn);
    
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
    updateTabBar(this, 3);
    if (app.globalData.isLoggedIn) {
      this.loadData();
    }
  },

  loadData() {
    this.setData({ loading: true, error: false, errorMsg: '' });
    api.contracts.summary(null).then(data => {
      this.setData({ loading: false });
      if (!data) {
        this.setData({ contracts: [], filtered: [] });
        this.filterList();
        return;
      }
      const patch = {};
      if (data.monthTotal != null) patch.monthTotal = data.monthTotal;
      if (data.pendingTotal != null) patch.pendingTotal = data.pendingTotal;
      if (data.monthCost != null) patch.monthCost = data.monthCost;
      if (data.profitTotal != null) patch.profitTotal = data.profitTotal;
      if (Array.isArray(data.contracts)) {
        patch.contracts = data.contracts;
        patch.profitTotal = this.calcProfit(data);
      }
      // 计算待收款提示
      const pendingVal = patch.pendingTotal || this.data.pendingTotal || '0';
      patch.showPendingHint = parseFloat(String(pendingVal).replace(/,/g,'')) > 0;
      this.setData(patch);
      this.filterList();
    }).catch(err => {
      console.error('合同加载失败:', err);
      this.setData({
        loading: false,
        error: true,
        errorMsg: '数据加载失败，请下拉刷新重试'
      });
    });
  },

  calcProfit(data) {
    const total = parseFloat(String(data.monthTotal).replace(/,/g,'')) || 0;
    const cost = parseFloat(String(data.monthCost).replace(/,/g,'')) || 0;
    return (total - cost).toLocaleString();
  },

  switchTab(e) { this.setData({ status: e.currentTarget.dataset.key }); this.filterList(); },
  onSearchInput(e) { this.setData({ keyword: e.detail.value }); this.filterList(); },

  filterList() {
    const { keyword, status, contracts } = this.data;
    let list = [...contracts];
    if (status === 'pending') list = list.filter(c => c.paymentStatus !== '已结清');
    else if (status === 'done') list = list.filter(c => c.paymentStatus === '已结清');
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      list = list.filter(c => (c.client || '').toLowerCase().includes(kw) || (c.services || '').toLowerCase().includes(kw));
    }
    this.setData({ filtered: list });
  },

  openPay(e) {
    const id = e.currentTarget.dataset.id;
    const c = this.data.contracts.find(x => x.id === id);
    if (c) this.setData({ showPay: true, payData: { id, amount: c.balanceAmount || '0', client: c.client } });
  },

  closePay() { this.setData({ showPay: false }); },
  onPayInput(e) { this.setData({ ['payData.amount']: e.detail.value }); },

  submitPay() {
    const { id, amount } = this.data.payData;
    api.contracts.pay(id, amount).then(() => {
      wx.showToast({ title: '收款成功', icon: 'success' });
      this.closePay(); this.loadData();
    }).catch((err) => {
      console.error('收款登记失败:', err);
      wx.showToast({ title: '收款失败: ' + (err.message || '未知错误'), icon: 'none' });
    });
  },

  onPullDownRefresh() { this.loadData(); wx.stopPullDownRefresh(); },
    onShareAppMessage() { return { title: '大喜的日子·合同管理', path: '/pages/contracts/contracts' }; },
});