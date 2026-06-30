const { updateTabBar } = require('../../utils/tabBar');
const api = require('../../services/api');
const app = getApp();
const fav = require('../../utils/favorites');

Page({
  data: {
    nickName: '',
    avatarUrl: '',
    collectionCount: 0, favoriteList: [],
    plannerEntryShow: false,
    verifyCode: '',
    verifyError: '',
    isPlanner: false,
  },
  onLoad() {
    this.loadFavorites();
    const userInfo = app.globalData.userInfo || {};
    this.setData({
      nickName: userInfo.nickName || '新人用户',
      avatarUrl: userInfo.avatarUrl || '',
      isPlanner: app.isPlanner(),
    });
  },
  onShow() {
    updateTabBar(this, 2);
    this.setData({ isPlanner: app.isPlanner() });
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
    wx.navigateTo({ url: '/pages/countdown/countdown' });
  },
  goChecklist() {
    wx.navigateTo({ url: '/pages/checklist/checklist' });
  },
  goBudget() {
    wx.navigateTo({ url: '/pages/budget-calc/budget-calc' });
  },
  goConsultations() {
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
  onShareAppMessage() {
    return { title: '大喜的日子·婚礼场景策划', path: '/pages/home/home' };
  },
});
