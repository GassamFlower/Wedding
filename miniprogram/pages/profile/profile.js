const api = require('../../services/api');
const app = getApp();

Page({
  data: {
    nickName: '策划师', avatarUrl: '', role: 'planner', phone: '',
    stats: { totalOrders: '--', monthOrders: '--', clientsCount: '--', todayWeddings: 0 },
    quickLinks: [
      { icon: 'clipboard', label: '订单管理', page: '/pages/orders/orders' },
      { icon: 'package', label: '道具管理', page: '/pages/props/props' },
      { icon: 'hotel', label: '酒店管理', page: '/pages/hotels/hotels' },
      { icon: 'group', label: '客户管理', page: '/pages/clients/clients' },
      { icon: 'calendar', label: '日程排期', page: '/pages/schedule/schedule' },
      { icon: 'search', label: '全局搜索', page: '/pages/search/search' },
    ],
    seedReady: false,
    showLoginModal: false,
  },
  onLoad() {
    this._loginModalShowFn = (show) => { this.setData({ showLoginModal: show }); };
    app.registerLoginModal(this._loginModalShowFn);
    
    // 登录守卫：个人中心需要登录
    if (!app.globalData.isLoggedIn) {
      api.requireLogin(() => {
        this.loadProfile();
        this.loadStats();
      });
    } else {
      this.loadProfile();
      this.loadStats();
    }
  },
  onUnload() {
    if (this._loginModalShowFn) app.unregisterLoginModal(this._loginModalShowFn);
  },

  onLoginSuccess() {
    this.setData({ showLoginModal: false });
    this.loadProfile();
    this.loadStats();
  },

  onLoginClose() {
    this.setData({ showLoginModal: false });
  },
  loadProfile() {
    const savedName = wx.getStorageSync('plannerName');
    const savedPhone = wx.getStorageSync('plannerPhone');
    this.setData({
      nickName: savedName || '策划师',
      phone: savedPhone || '',
    });
    api.user.profile(null).then(data => {
      if (data) {
        const updates = {};
        if (data.nickName) { updates.nickName = data.nickName; wx.setStorageSync('plannerName', data.nickName); }
        if (data.phone) { updates.phone = data.phone; wx.setStorageSync('plannerPhone', data.phone); }
        if (data.avatarUrl) updates.avatarUrl = data.avatarUrl;
        this.setData(updates);
      }
    }).catch(() => {});
  },
  loadStats() {
    api.dashboard.summary(null).then(data => {
      if (data) {
        this.setData({
          stats: {
            totalOrders: data.activeOrders || '--',
            monthOrders: data.monthOrders || '--',
            clientsCount: data.monthOrders ? Math.ceil(Number(data.monthOrders) * 1.5) : '--',
            todayWeddings: Array.isArray(data.orders) ? data.orders.filter(o => o.date && o.date.includes(new Date().toISOString().slice(5,10))).length : 0,
          }
        });
      }
    }).catch(() => {});
  },
  goPage(e) {
    const page = e.currentTarget.dataset.page;
    if (!page) return;
    const tabBarPages = ['/pages/home/home', '/pages/contact/contact', '/pages/mine/mine', '/pages/dashboard/dashboard', '/pages/orders/orders', '/pages/schedule/schedule', '/pages/contracts/contracts'];
    if (tabBarPages.includes(page)) {
      wx.switchTab({ url: page });
    } else {
      wx.navigateTo({ url: page });
    }
  },
  switchToNewbie() {
    wx.showModal({
      title: '切换到新人模式',
      content: '确定要切换回新人模式吗？',
      success: (res) => {
        if (res.confirm) {
          app.switchToNewbie();
          wx.reLaunch({ url: '/pages/home/home' });
        }
      },
    });
  },
  goSetting() {
    wx.showToast({ title: '更多设置开发中', icon: 'none' });
  },
  onShareAppMessage() {
    return { title: '大喜的日子·策划师工作台', path: '/pages/dashboard/dashboard' };
  },
});