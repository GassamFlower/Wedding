// pages/budget-calc/budget-calc.js - 预算计算器
const api = require('../../services/api');

const DEFAULT_CATEGORIES = [
  { key:'venue', label:'场地布置', icon:'home', value:5000, min:1000, max:20000, step:500, color:'#c9a96e' },
  { key:'floral', label:'花艺', icon:'plant', value:3000, min:500, max:10000, step:500, color:'#d4a0a0' },
  { key:'lighting', label:'灯光音响', icon:'lightbulb', value:2000, min:500, max:8000, step:500, color:'#8aab8a' },
  { key:'transport', label:'运输安装', icon:'box', value:1000, min:0, max:5000, step:500, color:'#b8956a' },
  { key:'other', label:'其他', icon:'star', value:1000, min:0, max:5000, step:500, color:'rgba(0,0,0,0.35)' },
];

const BUDGET_REFERENCE = [
  { label:'经济档 (5k-8k)', min:5000, max:8000, color:'rgba(201,169,110,0.15)' },
  { label:'舒适档 (8k-15k)', min:8000, max:15000, color:'rgba(201,169,110,0.25)' },
  { label:'品质档 (15k-25k)', min:15000, max:25000, color:'rgba(201,169,110,0.35)' },
  { label:'奢华档 (25k+)', min:25000, max:50000, color:'rgba(201,169,110,0.5)' },
];

Page({
  data: {
    categories: DEFAULT_CATEGORIES.map(c => ({ ...c })),
    total: 12000,
    budgetRange: '8k-15k',
    budgetLevel: '舒适档',
    budgetLevelColor: 'rgba(201,169,110,0.25)',
    referenceBars: BUDGET_REFERENCE,
    showLoginModal: false,
  },

  onLoad() {
    this._calcTotal();

    // 注册登录弹窗到全局
    const app = getApp();
    this._loginModalShowFn = (show) => {
      this.setData({ showLoginModal: show });
    };
    app.registerLoginModal(this._loginModalShowFn);
  },

  onUnload() {
    // 页面卸载时注销登录弹窗
    if (this._loginModalShowFn) {
      const app = getApp();
      app.unregisterLoginModal(this._loginModalShowFn);
    }
  },

  onLoginSuccess() {
    this.setData({ showLoginModal: false });
  },

  onLoginClose() {
    this.setData({ showLoginModal: false });
  },

  onSliderChange(e) {
    const key = e.currentTarget.dataset.key;
    const value = Number(e.detail.value);
    const categories = this.data.categories.map(c => {
      if (c.key === key) return { ...c, value };
      return c;
    });
    this.setData({ categories });
    this._calcTotal();
  },

  onInputChange(e) {
    const key = e.currentTarget.dataset.key;
    const raw = e.detail.value.replace(/,/g, '');
    const value = Math.max(0, Number(raw) || 0);
    const categories = this.data.categories.map(c => {
      if (c.key === key) return { ...c, value: Math.min(c.max, Math.max(c.min, value)) };
      return c;
    });
    this.setData({ categories });
    this._calcTotal();
  },

  _calcTotal() {
    const total = this.data.categories.reduce((s, c) => s + c.value, 0);
    let budgetLevel = '经济档 (5k以下)';
    let budgetLevelColor = 'rgba(201,169,110,0.15)';
    let budgetRange = '5k以下';
    if (total >= 5000 && total < 8000) { budgetLevel = '经济档 (5k-8k)'; budgetRange = '5k-8k'; }
    else if (total >= 8000 && total < 15000) { budgetLevel = '舒适档 (8k-15k)'; budgetRange = '8k-15k'; budgetLevelColor = 'rgba(201,169,110,0.25)'; }
    else if (total >= 15000 && total < 25000) { budgetLevel = '品质档 (15k-25k)'; budgetRange = '15k-25k'; budgetLevelColor = 'rgba(201,169,110,0.35)'; }
    else if (total >= 25000) { budgetLevel = '奢华档 (25k+)'; budgetRange = '25k+'; budgetLevelColor = 'rgba(201,169,110,0.5)'; }
    // 预计算每项占比
    const percentages = this.data.categories.map(c => ({
      key: c.key,
      pct: total > 0 ? (c.value / total * 100).toFixed(1) : '0',
      style: 'width:' + (total > 0 ? (c.value / total * 100) : 0) + '%',
    }));
    this.setData({ total, budgetLevel, budgetRange, budgetLevelColor, percentages });
  },

  resetBudget() {
    const categories = DEFAULT_CATEGORIES.map(c => ({ ...c }));
    this.setData({ categories });
    this._calcTotal();
  },

  goContact() {
    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLoggedIn) {
      api.requireLogin(() => {
        // 登录成功后继续跳转
        app.globalData.pendingBudget = { total: this.data.total, categories: this.data.categories };
        wx.switchTab({ url: '/pages/home/home' });
      });
      return;
    }
    app.globalData.pendingBudget = { total: this.data.total, categories: this.data.categories };
    wx.switchTab({ url: '/pages/home/home' });
  },

  onShareAppMessage() {
    return { title: '婚礼预算规划 · 大喜的日子', path: '/pages/budget-calc/budget-calc' };
  },
});