// pages/hotels/hotels.js
const api = require('../../services/api');
const app = getApp();

Page({
  data: {
    totalHotels: '--', inUse: '--', activeDeposits: '--', depositTotal: '--',
    depositPoolTotal: '20000', depositPoolUsed: '12000', depositPoolRemain: '8000',
    hotels: [],
    todos: [],
    // 弹窗
    showForm: false,
    formMode: 'create',
    editingId: null,
    formData: { name: '', hall: '', address: '', contact: '', contactPhone: '', capacity: '', depositStandard: '', loadInTime: '', loadOutTime: '', equipment: '', parking: '', notes: '' },
    // 加载
    loading: true,
    error: false,
    errorMsg: '',
    showLoginModal: false,
  },

  onLoad() {
    this._loginModalShowFn = (show) => { this.setData({ showLoginModal: show }); };
    app.registerLoginModal(this._loginModalShowFn);
    
    // 登录守卫
    if (!app.globalData.isLoggedIn) {
      api.requireLogin(() => { this.loadData(); });
    } else {
      this.loadData();
    }
  },
  onUnload() {
    if (this._loginModalShowFn) app.unregisterLoginModal(this._loginModalShowFn);
  },

  onLoginSuccess() {
    this.setData({ showLoginModal: false });
    this.loadData();
  },

  onLoginClose() {
    this.setData({ showLoginModal: false });
  },

  loadData() {
    this.setData({ loading: true, error: false });
    api.hotels.summary(null).then(data => {
      this.setData({ loading: false });
      if (!data) return;
      const patch = {};
      if (data.totalHotels != null)      patch.totalHotels = data.totalHotels;
      if (data.inUse != null)            patch.inUse = data.inUse;
      if (data.activeDeposits != null)   patch.activeDeposits = data.activeDeposits;
      if (data.depositTotal != null)     patch.depositTotal = data.depositTotal;
      if (data.depositPoolTotal != null) patch.depositPoolTotal = data.depositPoolTotal;
      if (data.depositPoolUsed != null)  patch.depositPoolUsed = data.depositPoolUsed;
      if (data.depositPoolRemain != null) patch.depositPoolRemain = data.depositPoolRemain;
      if (Array.isArray(data.hotels)) patch.hotels = data.hotels;
      if (Array.isArray(data.todos))   patch.todos = data.todos;
      this.setData(patch);
    }).catch(() => {
      this.setData({ loading: false, error: true, errorMsg: '数据加载失败，请下拉刷新重试' });
    });
  },

  // ===== 表单 =====
  openCreate() {
    // 防止重复触发
    if (this.data.showForm) return;
    this.setData({
      showForm: true, formMode: 'create', editingId: null,
      formData: { name: '', hall: '', address: '', contact: '', contactPhone: '', capacity: '', depositStandard: '', loadInTime: '08:00', loadOutTime: '22:00', equipment: '', parking: '', notes: '' },
    });
  },

  closeForm() { this.setData({ showForm: false }); },

  onFormInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`formData.${field}`]: e.detail.value });
  },

  submitForm() {
    const { formData, formMode, editingId } = this.data;
    if (!formData.name.trim()) {
      wx.showToast({ title: '请输入酒店名称', icon: 'none' });
      return;
    }
    if (formData.contactPhone && !/^1[3-9]\d{9}$/.test(formData.contactPhone)) {
      wx.showToast({ title: '请输入正确的联系电话', icon: 'none' });
      return;
    }
    if (formData.capacity && (isNaN(formData.capacity) || parseInt(formData.capacity) <= 0)) {
      wx.showToast({ title: '请输入正确的容纳桌数', icon: 'none' });
      return;
    }
    if (formData.depositStandard && (isNaN(formData.depositStandard) || parseFloat(formData.depositStandard) < 0)) {
      wx.showToast({ title: '请输入正确的押金标准', icon: 'none' });
      return;
    }
    const data = { ...formData };
    // 清理空字符串
    Object.keys(data).forEach(k => { if (data[k] === '') data[k] = undefined; });
    data.name = formData.name.trim();

    const request = formMode === 'edit' && editingId
      ? api.hotels.update(editingId, data)
      : api.hotels.create(data);

    request.then(res => {
      if (res && res.code === 0) {
        wx.showToast({ title: formMode === 'edit' ? '修改成功' : '添加成功', icon: 'success' });
        this.closeForm();
        this.loadData();
      } else {
        wx.showToast({ title: (res && res.msg) || '操作失败', icon: 'none' });
      }
    }).catch(() => {
      wx.showToast({ title: '操作失败，请重试', icon: 'none' });
    });
  },

  confirmDelete(e) {
    const id = e.currentTarget.dataset.id;
    const name = e.currentTarget.dataset.name || '该酒店';
    wx.showModal({
      title: '确认删除',
      content: `确定要删除「${name}」吗？`,
      success: (res) => {
        if (res.confirm) {
          api.hotels.delete(id).then(result => {
            if (result && result.code === 0) {
              wx.showToast({ title: '已删除', icon: 'success' });
              this.loadData();
            } else {
              wx.showToast({ title: (result && result.msg) || '删除失败', icon: 'none' });
            }
          }).catch(() => { wx.showToast({ title: '删除失败', icon: 'none' }); });
        }
      }
    });
  },

  // ===== 原有功能 =====
  addHotel() { this.openCreate(); },

  showDetail(e) {
    const id = e.currentTarget.dataset.id;
    const hotel = this.data.hotels.find(h => h.id === id);
    if (hotel) {
      wx.showModal({
        title: hotel.name,
        content: `联系人：${hotel.contact || '无'}\n电话：${hotel.contactPhone || '无'}\n地址：${hotel.address || '无'}\n容量：${hotel.capacity || '无'}\n押金：¥${hotel.deposit || '0'}\n入场：${hotel.loadIn || '无'}\n状态：${hotel.statusText || '无'}`,
        showCancel: false,
      });
    }
  },

  toggleTodo(e) {
    const id = e.currentTarget.dataset.id;
    const todos = this.data.todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
    this.setData({ todos });
    if (api.isCloud()) api.todos.toggle(id).catch(() => {});
  },

  onPullDownRefresh() { this.loadData(); wx.stopPullDownRefresh(); },
  onShareAppMessage() { return { title: '合作酒店·大喜的日子', path: '/pages/hotels/hotels' }; },
});
