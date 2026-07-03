const db = wx.cloud.database();
const api = require('../../services/api');

Page({
  data: {
    orderId: '',
    tasks: [],
    loading: true,
    showLoginModal: false,
  },

  onLoad(options) {
    if (options.orderId) {
      this.setData({ orderId: options.orderId });
      this.loadTasks();
    }

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

  loadTasks() {
    this.setData({ loading: true });
    db.collection('orders').doc(this.data.orderId).get().then(res => {
      if (!res.data) { wx.showToast({ title: '订单不存在', icon: 'none' }); return; }
      this.setData({
        tasks: res.data.friendTasks || [],
        loading: false,
      });
    }).catch(() => {
      this.setData({ loading: false });
    });
  },

  toggleTask(e) {
    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLoggedIn) {
      api.requireLogin(() => {
        this._doToggleTask(e);
      });
      return;
    }
    this._doToggleTask(e);
  },

  _doToggleTask(e) {
    const idx = Number(e.currentTarget.dataset.index);
    const tasks = [...this.data.tasks];
    tasks[idx].status = tasks[idx].status === '已完成' ? '待确认' : '已完成';
    this.setData({ tasks });
    // 更新云数据库
    db.collection('orders').doc(this.data.orderId).update({
      data: { friendTasks: tasks },
    }).catch(() => {});
  },
});
