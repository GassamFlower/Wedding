const api = require('../../services/api');
const app = getApp();
Page({
  data: {
    tab: 'all',
    keyword: '',
    clients: [],
    filtered: [],
    totalClients: '--', activeCount: '--', doneCount: '--',
    loading: true, error: false, errorMsg: '', showForm: false,
    formData: { name: '', phone: '', wechat: '', remark: '', tags: '' },
    editingId: '',
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
  onShow() {
    if (app.globalData.isLoggedIn) this.loadData();
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
    this.setData({ loading: true, error: false, errorMsg: '' });
    const { tab, keyword } = this.data;
    Promise.all([
      api.clients.summary(null),
      api.clients.list({ tab, keyword }, null),
    ]).then(([summary, listRes]) => {
      this.setData({ loading: false });
      const patch = {};
      if (summary) {
        if (summary.totalClients != null) patch.totalClients = summary.totalClients;
        if (summary.activeCount != null) patch.activeCount = summary.activeCount;
        if (summary.doneCount != null) patch.doneCount = summary.doneCount;
      }
      if (listRes && Array.isArray(listRes.list)) {
        patch.clients = listRes.list;
        patch.filtered = listRes.list;
      } else {
        patch.clients = [];
        patch.filtered = [];
      }
      this.setData(patch);
    }).catch(err => {
      console.error('客户加载失败:', err);
      this.setData({
        loading: false,
        error: true,
        errorMsg: '数据加载失败，请下拉刷新重试'
      });
    });
  },
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ tab });
    this.loadData();
  },
  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
    this.filterLocal();
  },
  filterLocal() {
    const { keyword, clients } = this.data;
    if (!keyword.trim()) {
      this.setData({ filtered: clients });
      return;
    }
    const filtered = clients.filter(c => (c.name || '').includes(keyword.trim()));
    this.setData({ filtered });
  },
  openCreate() {
    // 防止重复触发
    if (this.data.showForm) return;
    this.setData({ showForm: true, editingId: '', formData: { name: '', phone: '', wechat: '', remark: '', tags: '' } });
  },
  openEdit(e) {
    if (this.data.showForm) return;
    const item = e.currentTarget.dataset.item;
    if (!item) return;
    this.setData({
      showForm: true,
      editingId: item.id,
      formData: {
        name: item.name || '',
        phone: item.phone || '',
        wechat: item.wechat || '',
        remark: item.remark || '',
        tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
      },
    });
  },
  closeForm() { this.setData({ showForm: false, editingId: '' }); },
  onFormInput(e) {
    const f = e.currentTarget.dataset.field;
    this.setData({ ['formData.' + f]: e.detail.value });
  },
  submitForm() {
    const { formData, editingId } = this.data;
    const name = (formData && formData.name || '').trim();
    if (!name) {
      wx.showToast({ title: '请输入客户名称', icon: 'none' });
      return;
    }
    if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    // 清理空字符串，避免触发云函数必填校验
    const data = { name };
    if (formData.phone && formData.phone.trim()) data.phone = formData.phone.trim();
    if (formData.wechat && formData.wechat.trim()) data.wechat = formData.wechat.trim();
    if (formData.remark && formData.remark.trim()) data.remark = formData.remark.trim();
    if (formData.tags && formData.tags.trim()) data.tags = formData.tags.trim();

    const isEdit = !!editingId;
    const action = isEdit ? api.clients.update(editingId, data) : api.clients.create(data);
    const successMsg = isEdit ? '更新成功' : '添加成功';
    const errorMsg = isEdit ? '更新失败' : '添加失败';

    action.then(() => {
      wx.showToast({ title: successMsg, icon: 'success' });
      this.closeForm();
      this.loadData();
    }).catch((err) => {
      console.error(errorMsg + ':', err);
      wx.showToast({ title: errorMsg + ': ' + (err.message || '未知错误'), icon: 'none' });
    });
  },
  deleteClient(e) {
    const id = e.currentTarget.dataset.id;
    const name = e.currentTarget.dataset.name || '该客户';
    wx.showModal({
      title: '确认删除',
      content: `确定要删除客户"${name}"吗？删除后不可恢复。`,
      confirmColor: '#b71c1c',
      success: (res) => {
        if (res.confirm) {
          api.clients.delete(id).then(() => {
            wx.showToast({ title: '删除成功', icon: 'success' });
            this.loadData();
          }).catch((err) => {
            console.error('删除客户失败:', err);
            wx.showToast({ title: '删除失败: ' + (err.message || '未知错误'), icon: 'none' });
          });
        }
      },
    });
  },
  onPullDownRefresh() { this.loadData(); wx.stopPullDownRefresh(); },
    onShareAppMessage() { return { title: '大喜的日子·客户管理', path: '/pages/clients/clients' }; },
});
