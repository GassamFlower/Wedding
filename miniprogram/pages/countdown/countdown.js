const db = wx.cloud.database();

Page({
  data: {
    orderId: '',         // 从 query 传入
    weddingDate: '',     // ISO 日期字符串
    daysLeft: 0,
    percent: 0,
    coupleName: '',
    venue: '',
    style: '',
    stages: [],          // 进度阶段
    materials: [],       // 锁定物料
    friends: [],         // 亲友团
    friendCount: 0,
    loading: true,
    watcher: null,       // watch 实例
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ orderId: options.id });
      this.loadOrder();
    } else if (options.share) {
      // 从亲友邀请卡片进入，读取 globalData 中的订单号
      const pendingId = getApp().globalData.pendingOrderId;
      if (pendingId) { this.setData({ orderId: pendingId }); this.loadOrder(); }
    }
  },

  onUnload() {
    if (this.data.watcher) {
      this.data.watcher.close();
      this.setData({ watcher: null });
    }
  },

  loadOrder() {
    this.setData({ loading: true });
    const { orderId } = this.data;

    db.collection('orders').doc(orderId).get().then(res => {
      if (!res.data) { wx.showToast({ title: '订单不存在', icon: 'none' }); return; }
      const o = res.data;
      const weddingDate = o.weddingDate;
      const now = new Date();
      const target = new Date(weddingDate);
      const daysLeft = Math.max(0, Math.ceil((target - now) / 86400000));
      const totalStages = 6;
      const doneStages = this._calcDoneStages(o.status, o.progressNotes);
      const percent = Math.round((doneStages / totalStages) * 100);
      const stages = this._buildStages(o.status, o.progressNotes);

      this.setData({
        weddingDate, daysLeft, percent,
        coupleName: o.clientName || '',
        venue: o.venue || '',
        style: o.style || '',
        stages,
        materials: o.materials || [],
        friends: o.friendTasks || [],
        friendCount: (o.friendTasks || []).length,
        loading: false,
      });

      // 开启实时监听 (watch)
      this._startWatch();
    }).catch(() => {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  _startWatch() {
    const watcher = db.collection('orders').doc(this.data.orderId).watch({
      onChange: (snapshot) => {
        const o = snapshot.docs[0];
        if (!o) return;
        const doneStages = this._calcDoneStages(o.status, o.progressNotes);
        const percent = Math.round((doneStages / 6) * 100);
        const stages = this._buildStages(o.status, o.progressNotes);
        const changed = stages.some((s, i) => s.done !== this.data.stages[i].done);
        this.setData({ stages, percent, materials: o.materials || [] });
      },
      onError: () => {},
    });
    this.setData({ watcher });
  },

  _calcDoneStages(status, notes) {
    const noteCount = Array.isArray(notes) ? notes.length : 0;
    if (status && status.includes('完成')) return 6;
    if (status && status.includes('就绪')) return 5;
    if (status && status.includes('花艺')) return noteCount >= 3 ? 4 : 3;
    if (status && status.includes('筹备')) return noteCount >= 1 ? 2 : 1;
    return noteCount >= 1 ? 2 : 1;
  },

  _buildStages(status, notes) {
    const all = [
      { label: '方案确认', date: '' },
      { label: '合同签署', date: '' },
      { label: '道具出库', date: '' },
      { label: '场地确认', date: '' },
      { label: '花艺搭建', date: '' },
      { label: '准备就绪', date: '' },
    ];
    const noteMap = {};
    (notes || []).forEach(n => { noteMap[n.stage] = n; });
    const doneCount = this._calcDoneStages(status, notes);
    return all.map((s, i) => ({
      ...s,
      done: i < doneCount,
      date: noteMap[s.label] ? noteMap[s.label].createdAt : (i < doneCount ? '' : ''),
      note: noteMap[s.label] ? noteMap[s.label] : null,
    }));
  },

  goGuestTasks() {
    wx.navigateTo({ url: '/pages/guest-task/guest-task?orderId=' + this.data.orderId });
  },

  inviteFriend() {
    // 邀请亲友 — 调用分享功能
  },

  _fmtDate(d) {
    if (!d) return '';
    const dt = new Date(d);
    return `${dt.getMonth() + 1}月${dt.getDate()}日`;
  },
});
