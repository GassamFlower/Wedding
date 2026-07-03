// app.js - 双角色管理 + 登录态
App({
  onLaunch() {
    const env = wx.getAccountInfoSync
      ? (wx.getAccountInfoSync().miniProgram.envVersion || 'develop')
      : 'develop';
    const isProd = env === 'release' || env === 'trial';
    if (wx.cloud) {
      wx.cloud.init({ env: 'cloud1-d3gt5vpbuf8acec14', traceUser: true });
    }
    // 开发调试：强制默认新人端（上线前可恢复 storage 读取）
    const savedRole = (env === 'develop') ? 'newbie' : (wx.getStorageSync('role') || 'newbie');
    const isVerified = wx.getStorageSync('isPlannerVerified') || false;
    const userInfo = wx.getStorageSync('userInfo') || null;
    // isLoggedIn 初始化为 false，由 silentLogin 确认后再设置
    // 避免未授权用户因 storage 残留而被误判为已登录
    this.globalData = { env, isProd, role: savedRole, isPlannerVerified: savedRole === 'planner' ? isVerified : false, userInfo: null, fontLoaded: false, isLoggedIn: false };
    // 预加载衬线字体，提升画册级排版质感
    this.loadSerifFont();
    // 静默登录：获取 openid，不阻塞用户浏览
    this.silentLogin();
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

  // 静默登录：只获取 openid，不标记为已登录
  // 用户需要主动授权（微信授权/手机号）后才算已登录
  // 缓存清理后，即使云端有数据也需要重新授权
  silentLogin() {
    wx.login({
      success: (res) => {
        if (!res.code) return;
        wx.cloud.callFunction({
          name: 'user',
          data: { action: 'login', code: res.code },
        }).then(result => {
          if (result && result.result && result.result.code === 0) {
            const user = result.result.data;
            // 只存 openid 和基础信息，不标记为已登录
            this.globalData.openid = user.openid;
            this.globalData._silentUserInfo = user; // 授权后可直接使用
            // 仅当本地缓存中有 userInfo 时才恢复登录态
            // 缓存清理后必须重新授权，不能从云端自动恢复
            const cachedUserInfo = wx.getStorageSync('userInfo');
            if (cachedUserInfo) {
              this.globalData.userInfo = cachedUserInfo;
              this.globalData.isLoggedIn = true;
              // 执行等待中的回调（requireLogin 队列）
              const callbacks = this.globalData._loginCallbacks || [];
              this.globalData._loginCallbacks = [];
              callbacks.forEach(cb => { if (typeof cb === 'function') cb(); });
              // 通知所有已注册的登录弹窗关闭
              const showFns = this.globalData._loginModalShowFns || [];
              showFns.forEach(fn => {
                if (typeof fn === 'function') fn(false); // false 表示关闭弹窗
              });
            }
          }
        }).catch(() => {
          // 静默失败，不影响用户浏览
        });
      },
    });
  },

  globalData: {
    env: 'develop',
    isProd: false,
    role: 'newbie',
    isPlannerVerified: false,
    userInfo: null,
    fontLoaded: false,
    pendingBudget: null,
    isLoggedIn: false,
    openid: '',
    _silentUserInfo: null,
    _loginCallbacks: [],
    _loginModalShowFns: []
  },

  getRole() { return this.globalData.role; },

  isPlanner() { return this.globalData.role === 'planner' && this.globalData.isPlannerVerified; },

  isLoggedIn() { return this.globalData.isLoggedIn; },

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

  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    this.globalData.isLoggedIn = true;
    wx.setStorageSync('userInfo', userInfo);
    // 执行等待中的回调（requireLogin 队列）
    const callbacks = this.globalData._loginCallbacks || [];
    this.globalData._loginCallbacks = [];
    callbacks.forEach(cb => { if (typeof cb === 'function') cb(); });
    // 通知所有已注册的登录弹窗关闭
    const showFns = this.globalData._loginModalShowFns || [];
    showFns.forEach(fn => {
      if (typeof fn === 'function') fn(false); // false 表示关闭弹窗
    });
  },

  // 注册登录弹窗显示函数（支持多页面同时注册）
  registerLoginModal(showFn) {
    if (!this.globalData._loginModalShowFns) {
      this.globalData._loginModalShowFns = [];
    }
    // 避免重复注册
    if (!this.globalData._loginModalShowFns.includes(showFn)) {
      this.globalData._loginModalShowFns.push(showFn);
    }
  },

  // 注销登录弹窗（页面卸载时调用）
  unregisterLoginModal(showFn) {
    if (this.globalData._loginModalShowFns) {
      this.globalData._loginModalShowFns = this.globalData._loginModalShowFns.filter(fn => fn !== showFn);
    }
  },

  clearUserInfo() {
    this.globalData.userInfo = null;
    this.globalData.isLoggedIn = false;
    wx.removeStorageSync('userInfo');
  },
});
