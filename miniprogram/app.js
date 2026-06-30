// app.js - 双角色管理
App({
  onLaunch() {
    const env = wx.getAccountInfoSync
      ? (wx.getAccountInfoSync().miniProgram.envVersion || 'develop')
      : 'develop';
    const isProd = env === 'release' || env === 'trial';
    if (wx.cloud) {
      wx.cloud.init({ env: 'cloud1-d3gt5vpbuf8acec14', traceUser: true });
    }
    const savedRole = wx.getStorageSync('role') || 'newbie';
    const isVerified = wx.getStorageSync('isPlannerVerified') || false;
    this.globalData = { env, isProd, role: savedRole, isPlannerVerified: savedRole === 'planner' ? isVerified : false, userInfo: null, fontLoaded: false };
    // 预加载衬线字体，提升画册级排版质感
    this.loadSerifFont();
  },

  // 衬线字体加载（优雅降级到系统衬线字体）
  loadSerifFont() {
    wx.loadFontFace({
      family: 'Noto Serif CJK SC',
      source: 'url("https://fonts.cdnfonts.com/css/noto-serif-sc")',
      desc: { style: 'normal', weight: '400' },
      success: () => { this.globalData.fontLoaded = true; },
      fail: () => { /* 系统衬线字体已作为 fallback */ }
    });
  },

  globalData: { role: 'newbie', isPlannerVerified: false, userInfo: null, fontLoaded: false, pendingBudget: null },

  getRole() { return this.globalData.role; },

  isPlanner() { return this.globalData.role === 'planner' && this.globalData.isPlannerVerified; },

  switchToPlanner() {
    this.globalData.role = 'planner';
    this.globalData.isPlannerVerified = true;
    wx.setStorageSync('role', 'planner');
    wx.setStorageSync('isPlannerVerified', true);
  },

  switchToNewbie() {
    this.globalData.role = 'newbie';
    this.globalData.isPlannerVerified = false;
    wx.setStorageSync('role', 'newbie');
    wx.setStorageSync('isPlannerVerified', false);
  },

  verifyPlannerCode(code) {
    const validCode = wx.getStorageSync('plannerCode') || 'Daxi2026';
    return code === validCode;
  },

  setUserInfo(userInfo) { this.globalData.userInfo = userInfo; },
});
