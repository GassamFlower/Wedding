// pages/index/index.js - 启动页/角色引导重定向
Page({
  onLoad() {
    const app = getApp();
    const role = app.getRole();
    const isVerified = app.globalData && app.globalData.isPlannerVerified;
    setTimeout(() => {
      if (role === 'planner' && isVerified) {
        wx.switchTab({ url: '/pages/dashboard/dashboard' });
      } else {
        wx.switchTab({ url: '/pages/home/home' });
      }
    }, 100);
  },
  onShareAppMessage() { return { title: '大喜的日子', path: '/pages/index/index' }; },
});
