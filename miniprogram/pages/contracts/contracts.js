const api = require('../../services/api');
const { updateTabBar } = require('../../utils/tabBar');

Page({
  data: {
    monthTotal: '0', pendingTotal: '0', monthCost: '0', profitTotal: '0',
    contracts: [], filtered: [], loading: true,
    keyword: '', status: 'all',
    statusTabs: [
      { key: 'all', label: '全部', icon: 'file' },
      { key: 'pending', label: '未结清', icon: 'hourglass' },
      { key: 'done', label: '已结清', icon: 'check-circle' },
    ],
    showPay: false, payData: { id: '', amount: '0', client: '' },
  },

  onLoad() { this.loadData(); },
  onShow() {
    updateTabBar(this, 3);
    this.loadData();
  },

  loadData() {
    this.setData({ loading: true });
    api.contracts.summary(null).then(data => {
      this.setData({ loading: false });
      if (!data) {
        this.setData({
          monthTotal: '45,300', pendingTotal: "13,100", monthCost: '28,000',
          profitTotal: '17,300',
          contracts: [
            { id: 'c1', client: '张先生 & 李女士', orderDate: '6月15日', services: '场景布置+道具', totalAmount: '12,000', paidAmount: '7,200', balanceAmount: '4,800', paymentStatus: '部分付款', paidRatio: 60 },
            { id: 'c2', client: '王先生 & 赵女士', orderDate: '6月28日', services: '场景布置+花艺', totalAmount: '8,500', paidAmount: '4,000', balanceAmount: '4,500', paymentStatus: '部分付款', paidRatio: 47 },
            { id: 'c3', client: '刘先生 & 陈女士', orderDate: '7月8日', services: '全包套餐（场景+花艺+灯光+管家）', totalAmount: '18,000', paidAmount: '12,000', balanceAmount: '6,000', paymentStatus: '部分付款', paidRatio: 67 },
            { id: 'c4', client: '陈先生 & 周女士', orderDate: '已完结', services: '场景布置', totalAmount: '6,800', paidAmount: '6,800', balanceAmount: '0', paymentStatus: '已结清', paidRatio: 100 },
          ],
        });
        this.filterList();
        return;
      }
      const patch = {};
      if (data.monthTotal != null) patch.monthTotal = data.monthTotal;
      if (data.pendingTotal != null) patch.pendingTotal = data.pendingTotal;
      if (data.monthCost != null) patch.monthCost = data.monthCost;
      if (data.profitTotal != null) patch.profitTotal = data.profitTotal;
      if (Array.isArray(data.contracts)) { patch.contracts = data.contracts; patch.profitTotal = this.calcProfit(data); }
          // 计算待收款提示
    const pendingVal = this.data.pendingTotal || '0';
    patch.showPendingHint = parseFloat(String(pendingVal).replace(/,/g,'')) > 0;
    this.setData(patch);
      this.filterList();
    }).catch(() => { this.setData({ loading: false }); });
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
    }).catch(() => {
      wx.showToast({ title: '收款登记成功（演示模式）', icon: 'success' });
      this.closePay();
    });
  },

  onPullDownRefresh() { this.loadData(); wx.stopPullDownRefresh(); },
    onShareAppMessage() { return { title: '大喜的日子·合同管理', path: '/pages/contracts/contracts' }; },
});