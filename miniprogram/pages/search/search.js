// pages/search/search.js
// 全局搜索：跨模块搜索订单/道具/酒店/合同/待办
const api = require('../../services/api');
const app = getApp();

Page({
  data: {
    keyword: '',
    results: [],
    loading: false,
    showClear: false,
    hasSearched: false,
    showLoginModal: false,
    // 类型元数据（用于前端展示）
    typeMeta: {
      order:    { icon: 'icon-ring',     label: '婚礼订单', color: '#c9a96e' },
      prop:     { icon: 'icon-box',      label: '道具',     color: '#5b8def' },
      hotel:    { icon: 'icon-location', label: '酒店',     color: '#e8856b' },
      contract: { icon: 'icon-contract', label: '合同',     color: '#6bc4a0' },
      todo:     { icon: 'icon-check',    label: '待办',     color: '#b8956a' },
    },
  },

  onLoad() {
    // 登录守卫
    if (!app.globalData.isLoggedIn) {
      api.requireLogin(() => {
        // 登录成功后如果有关键词则自动搜索
        if (this.data.keyword) this.onSearch();
      });
    }
    this._loginModalShowFn = (show) => { this.setData({ showLoginModal: show }); };
    app.registerLoginModal(this._loginModalShowFn);
  },
  onUnload() {
    if (this._loginModalShowFn) app.unregisterLoginModal(this._loginModalShowFn);
  },

  onLoginSuccess() {
    this.setData({ showLoginModal: false });
    if (this.data.keyword) this.onSearch();
  },

  onLoginClose() {
    this.setData({ showLoginModal: false });
  },

  onInput(e) {
    const keyword = e.detail.value;
    this.setData({
      keyword,
      showClear: keyword.length > 0,
    });
  },

  onClear() {
    this.setData({ keyword: '', showClear: false, results: [], hasSearched: false });
  },

  onSearch() {
    const kw = (this.data.keyword || '').trim();
    if (!kw) return;

    this.setData({ loading: true, hasSearched: true });
    api.search.query(kw).then(data => {
      this.setData({ loading: false });
      if (data && Array.isArray(data.results)) {
        this.setData({ results: this.groupResults(data.results) });
      } else {
        this.setData({ results: [] });
      }
    }).catch(() => {
      this.setData({ loading: false, results: [] });
      wx.showToast({ title: '搜索失败', icon: 'none' });
    });
  },

  // 将结果按 type 分组，同类型排在一起
  groupResults(list) {
    const meta = this.data.typeMeta;
    const groups = {};
    list.forEach(item => {
      const type = item.type || 'other';
      if (!groups[type]) groups[type] = { type, items: [], meta: meta[type] || {} };
      groups[type].items.push(item);
    });
    // 排序：order > contract > hotel > prop > todo > other
    const order = ['order', 'contract', 'hotel', 'prop', 'todo'];
    return order.filter(t => groups[t]).map(t => groups[t]);
  },

  onResultTap(e) {
    const route = e.currentTarget.dataset.route;
    if (route) {
      wx.navigateTo({ url: route });
    }
  },

  // 键盘搜索
  onConfirm() {
    this.onSearch();
  },
    onShareAppMessage() { return { title: '搜索·大喜的日子', path: '/pages/search/search' }; },
});
