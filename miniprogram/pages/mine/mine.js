const { updateTabBar } = require('../../utils/tabBar');
const api = require('../../services/api');
const app = getApp();
const fav = require('../../utils/favorites');

Page({
  data: {
    nickName: '',
    avatarUrl: '',
    phone: '',
    isLoggedIn: false,
    collectionCount: 0, favoriteList: [],
    plannerEntryShow: false,
    verifyCode: '',
    verifyError: '',
    isPlanner: false,
    showLoginModal: false,
  },
  onLoad() {
    this.loadFavorites();
    this.updateUserInfo();
    // 注册登录弹窗到全局
    this._loginModalShowFn = (show) => {
      this.setData({ showLoginModal: show });
    };
    app.registerLoginModal(this._loginModalShowFn);
  },
  onShow() {
    updateTabBar(this, 2);
    this.setData({ isPlanner: app.isPlanner() });
    this.updateUserInfo();
    // 重新注册，确保弹窗能正确触发
    if (this._loginModalShowFn) {
      app.registerLoginModal(this._loginModalShowFn);
    }
  },
  onUnload() {
    // 页面卸载时注销登录弹窗
    if (this._loginModalShowFn) {
      app.unregisterLoginModal(this._loginModalShowFn);
    }
  },
  updateUserInfo() {
    const userInfo = app.globalData.userInfo || {};
    this.setData({
      nickName: userInfo.nickName || '新人用户',
      avatarUrl: userInfo.avatarUrl || '',
      phone: userInfo.phone || '',
      isLoggedIn: app.globalData.isLoggedIn || false,
    });
  },
  onLoginTap() {
    this.setData({ showLoginModal: true });
  },
  onLoginModalClose() {
    this.setData({ showLoginModal: false });
  },
  onLoginSuccess(e) {
    this.setData({ showLoginModal: false });
    this.updateUserInfo();
  },
  togglePlannerEntry() {
    this.setData({ plannerEntryShow: !this.data.plannerEntryShow, verifyCode: '', verifyError: '' });
  },
  onVerifyInput(e) {
    this.setData({ verifyCode: e.detail.value, verifyError: '' });
  },
  doVerify() {
    const code = this.data.verifyCode.trim();
    if (!code) { this.setData({ verifyError: '请输入邀请码' }); return; }

    // 检查登录状态
    if (!app.globalData.isLoggedIn) {
      api.requireLogin(() => {
        this._doVerify(code);
      });
      return;
    }

    this._doVerify(code);
  },

  _doVerify(code) {
    const app = getApp();
    if (app.verifyPlannerCode(code)) {
      app.switchToPlanner();
      wx.reLaunch({ url: '/pages/dashboard/dashboard' });
    } else {
      this.setData({ verifyError: '邀请码错误，请联系管理员获取' });
    }
  },
  switchToNewbie() {
    wx.showModal({
      title: '切换到新人模式',
      content: '确定要切换回新人模式吗？',
      success: (res) => { if (res.confirm) { app.switchToNewbie(); wx.reLaunch({ url: '/pages/home/home' }); } },
    });
  },
  loadFavorites() {
    const list = fav.getAll();
    this.setData({ favoriteList: list, collectionCount: list.length });
  },
  goFavorites() {
    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLoggedIn) {
      api.requireLogin(() => {
        this._doGoFavorites();
      });
      return;
    }
    this._doGoFavorites();
  },

  _doGoFavorites() {
    const list = this.data.favoriteList;
    if (list.length === 0) {
      wx.showToast({ title: '暂无收藏案例', icon: 'none' });
      return;
    }
    wx.showActionSheet({
      itemList: list.map(c => c.coupleName + ' · ' + c.style),
      success: (res) => {
        wx.navigateTo({ url: '/pages/case-detail/case-detail?id=' + list[res.tapIndex].id });
      }
    });
  },
  goCountdown() {
    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLoggedIn) {
      api.requireLogin(() => {
        wx.navigateTo({ url: '/pages/countdown/countdown' });
      });
      return;
    }
    wx.navigateTo({ url: '/pages/countdown/countdown' });
  },
  goChecklist() {
    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLoggedIn) {
      api.requireLogin(() => {
        wx.navigateTo({ url: '/pages/checklist/checklist' });
      });
      return;
    }
    wx.navigateTo({ url: '/pages/checklist/checklist' });
  },
  goBudget() {
    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLoggedIn) {
      api.requireLogin(() => {
        wx.navigateTo({ url: '/pages/budget-calc/budget-calc' });
      });
      return;
    }
    wx.navigateTo({ url: '/pages/budget-calc/budget-calc' });
  },
  goConsultations() {
    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLoggedIn) {
      api.requireLogin(() => {
        this._doGoConsultations();
      });
      return;
    }
    this._doGoConsultations();
  },

  _doGoConsultations() {
    const recent = wx.getStorageSync('recentConsultations');
    if (recent && recent.length > 0) {
      wx.showToast({ title: '您有 ' + recent.length + ' 条咨询记录', icon: 'none' });
    } else {
      wx.showToast({ title: '暂无咨询记录，去首页咨询吧', icon: 'none' });
    }
  },
  goSetting() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },
  goPlannerDashboard() {
    wx.switchTab({ url: '/pages/dashboard/dashboard' });
  },
  onShareAppMessage() {
    return { title: '大喜的日子·婚礼场景策划', path: '/pages/home/home' };
  },
});
