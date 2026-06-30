// components/nav-bar/nav-bar.js
// 自定义顶部导航栏：
//  - 自动适配状态栏高度 / 胶囊菜单位置（iOS 与 Android 通用）
//  - 支持返回按钮、标题、自定义底色
//  - 自动占位（placeholder），让页面内容向下偏移，避免被遮挡
//
// 使用示例：
//   <nav-bar title="道具管理" />
//   <nav-bar title="工作台" show-back="{{false}}" />
//   <nav-bar title="婚礼详情" back-url="/pages/customer_data/customer_data" back-type="switchTab" />

Component({
  options: {
    multipleSlots: true,
    addGlobalClass: true,
  },

  properties: {
    title: { type: String, value: '' },
    // 是否显示返回按钮（默认显示；tab 页应设为 false）
    showBack: { type: Boolean, value: true },
    // 背景色 / 文字色
    background: { type: String, value: '' },
    color: { type: String, value: '#1d1d1d' },
    // 兜底返回地址（当无上层页面可返回时使用）
    backUrl: { type: String, value: '' },
    // 'auto' | 'navigateBack' | 'reLaunch' | 'switchTab'
    backType: { type: String, value: 'auto' },
    // 是否透明（用于卡片型大封面页）
    transparent: { type: Boolean, value: false },
    // 毛玻璃沉浸效果（搭配 transparent 使用）
    glass: { type: Boolean, value: false },
  },

  data: {
    statusBarHeight: 20,
    navHeight: 44,
    menuRight: 87,
    menuTop: 4,
    menuHeight: 32,
    bgColor: '#faf8f5',
  },

  lifetimes: {
    attached() {
      try {
        const sys = (wx.getWindowInfo && wx.getWindowInfo()) || wx.getSystemInfoSync();
        const menu = wx.getMenuButtonBoundingClientRect && wx.getMenuButtonBoundingClientRect();
        const statusBarHeight = sys.statusBarHeight || 20;
        let navHeight = 44;
        let menuRight = 87;
        let menuTop = (statusBarHeight + (44 - 32) / 2) - statusBarHeight;
        let menuHeight = 32;
        if (menu && menu.height) {
          navHeight = (menu.top - statusBarHeight) * 2 + menu.height;
          menuRight = (sys.windowWidth || 375) - menu.right;
          menuTop = menu.top - statusBarHeight;
          menuHeight = menu.height;
        }
        this.setData({
          statusBarHeight,
          navHeight,
          menuRight,
          menuTop,
          menuHeight,
          bgColor: this.properties.background || '#faf8f5',
        });
      } catch (e) {
        // 忽略：使用默认值
      }
    },
  },

  observers: {
    'background': function (v) {
      this.setData({ bgColor: v || '#faf8f5' });
    },
  },

  methods: {
    onBack() {
      const { backUrl, backType } = this.properties;

      if (backType === 'switchTab' && backUrl) {
        wx.switchTab({ url: backUrl });
        return;
      }
      if (backType === 'reLaunch' && backUrl) {
        wx.reLaunch({ url: backUrl });
        return;
      }
      if (backType === 'navigateBack') {
        wx.navigateBack({ delta: 1, fail: () => this._fallback() });
        return;
      }

      // auto：先尝试 navigateBack，无栈则回兜底地址，最后兜底到工作台
      const pages = getCurrentPages();
      if (pages.length > 1) {
        wx.navigateBack({ delta: 1, fail: () => this._fallback() });
      } else {
        this._fallback();
      }
    },

    _fallback() {
      const { backUrl } = this.properties;
      if (backUrl) {
        // 自动判断是 tab 页还是普通页
        const TAB_PATHS = [
          '/pages/schedule_gl/schedule_gl',
          '/pages/customer_data/customer_data',
          '/pages/schedule/schedule',
          '/pages/contract/contract',
        ];
        const path = backUrl.split('?')[0];
        if (TAB_PATHS.includes(path)) {
          wx.switchTab({ url: backUrl });
        } else {
          wx.reLaunch({ url: backUrl });
        }
        return;
      }
      wx.reLaunch({ url: '/pages/schedule_gl/schedule_gl' });
    },
  },
});
