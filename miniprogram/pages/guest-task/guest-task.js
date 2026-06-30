const db = wx.cloud.database();

Page({
  data: {
    orderId: '',
    tasks: [],
    loading: true,
  },

  onLoad(options) {
    if (options.orderId) {
      this.setData({ orderId: options.orderId });
      this.loadTasks();
    }
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
