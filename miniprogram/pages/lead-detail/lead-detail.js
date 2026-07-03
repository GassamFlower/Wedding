const api = require('../../services/api');
const app = getApp();

Page({
  data: {
    lead: null,
    loading: true,
    noteText: '',
    statusOptions: ['待跟进', '已联系', '已转化', '已关闭'],
    statusIndex: 0,
    showLoginModal: false,
    _leadId: '',
  },

  onLoad(options) {
    this._loginModalShowFn = (show) => { this.setData({ showLoginModal: show }); };
    app.registerLoginModal(this._loginModalShowFn);

    if (options.id) {
      this.setData({ _leadId: options.id });
      if (!app.globalData.isLoggedIn) {
        api.requireLogin(() => { this.loadLead(options.id); });
      } else {
        this.loadLead(options.id);
      }
    }
  },
  onUnload() {
    if (this._loginModalShowFn) app.unregisterLoginModal(this._loginModalShowFn);
  },
  onLoginSuccess() {
    this.setData({ showLoginModal: false });
    if (this.data._leadId) this.loadLead(this.data._leadId);
  },
  onLoginClose() {
    this.setData({ showLoginModal: false });
  },

  loadLead(id) {
    this.setData({ loading: true });
    api.leads.get({ id }).then(data => {
      if (data) {
        const statusIndex = this.data.statusOptions.indexOf(data.status || '待跟进');
        this.setData({
          lead: data,
          loading: false,
          statusIndex: statusIndex >= 0 ? statusIndex : 0,
        });
      } else {
        this.setData({ loading: false });
        wx.showToast({ title: '线索不存在', icon: 'none' });
      }
    }).catch(() => {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  onStatusChange(e) {
    const idx = Number(e.detail.value);
    const newStatus = this.data.statusOptions[idx];
    this.setData({ statusIndex: idx });
    api.leads.update({
      id: this.data.lead._id,
      data: { status: newStatus },
    }).then(() => {
      const lead = { ...this.data.lead, status: newStatus };
      this.setData({ lead });
      wx.showToast({ title: '状态已更新', icon: 'success' });
    }).catch(() => {
      wx.showToast({ title: '更新失败', icon: 'none' });
    });
  },

  makePhoneCall() {
    if (this.data.lead && this.data.lead.phone) {
      wx.makePhoneCall({ phoneNumber: this.data.lead.phone });
    }
  },

  onNoteInput(e) {
    this.setData({ noteText: e.detail.value });
  },

  addNote() {
    const text = this.data.noteText.trim();
    if (!text) {
      wx.showToast({ title: '请输入跟进备注', icon: 'none' });
      return;
    }
    api.leads.addNote({ id: this.data.lead._id, text }).then(() => {
      const note = { text, createdAt: new Date().toISOString() };
      const followUpNotes = [...(this.data.lead.followUpNotes || []), note];
      const lead = { ...this.data.lead, followUpNotes, lastFollowUpAt: note.createdAt };
      this.setData({ lead, noteText: '' });
      wx.showToast({ title: '备注已添加', icon: 'success' });
    }).catch(() => {
      wx.showToast({ title: '添加失败', icon: 'none' });
    });
  },

  convertToOrder() {
    const lead = this.data.lead;
    wx.showModal({
      title: '一键转订单',
      content: `将「${lead.name}」转为婚礼订单？客户信息和婚期预算将自动填入。`,
      success: (res) => {
        if (res.confirm) {
          api.leads.convertToOrder({ id: lead._id }).then(data => {
            if (data && data.orderId) {
              wx.showToast({ title: '已转为订单', icon: 'success' });
              setTimeout(() => {
                wx.navigateTo({ url: '/pages/order-detail/order-detail?id=' + data.orderId });
              }, 1000);
            }
          }).catch(() => {
            wx.showToast({ title: '转换失败', icon: 'none' });
          });
        }
      },
    });
  },

  _fmtDate(d) {
    if (!d) return '';
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
  },
});
