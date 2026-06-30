// pages/props/props.js
const api = require('../../services/api');

const DEMO_PROPS = [
  { id: 'd1', name: '梅花背景架', category: 'bg', total: 2, inUse: 2, available: 0, unit: '架', notes: '主舞台使用', categoryName: '背景架/桁架' },
  { id: 'd2', name: '金色竹节椅', category: 'furniture', total: 12, inUse: 12, available: 0, unit: '把', notes: '', categoryName: '桌椅/摆件' },
  { id: 'd3', name: '白色纱幔', category: 'deco', total: 30, inUse: 20, available: 10, unit: '米', notes: '', categoryName: '装饰小品' },
  { id: 'd4', name: '粉色绣球花', category: 'flower', total: 8, inUse: 6, available: 2, unit: '束', notes: '需保鲜', categoryName: '花艺道具' },
  { id: 'd5', name: 'LED射灯', category: 'light', total: 6, inUse: 4, available: 2, unit: '台', notes: '含支架', categoryName: '灯光设备' },
];

Page({
  data: {
    totalProps: '--', inUse: '--', available: '--', needBuy: '--',
    categories: [
      { key: 'bg', icon: 'box', name: '背景架/桁架', count: 12, inUse: 7 },
      { key: 'flower', icon: 'flower', name: '花艺道具', count: 18, inUse: 12 },
      { key: 'light', icon: 'light', name: '灯光设备', count: 8, inUse: 5 },
      { key: 'furniture', icon: 'box', name: '桌椅/摆件', count: 28, inUse: 10 },
      { key: 'deco', icon: 'star', name: '装饰小品', count: 15, inUse: 6 },
      { key: 'more', icon: 'add', name: '更多', count: 0, inUse: 0 },
    ],
    todos: [],
    propList: [],
    filterCategory: '',
    categoryMap: {
      bg: '背景架/桁架', flower: '花艺道具', light: '灯光设备',
      furniture: '桌椅/摆件', deco: '装饰小品',
    },
    // 弹窗状态
    showForm: false,
    formMode: 'create', // 'create' | 'edit'
    editingId: null,
    catIndex: 0,
    formData: { name: '', category: 'bg', total: '', inUse: '', unit: '件', notes: '' },
    categoryOptions: [
      { key: 'bg', name: '背景架/桁架' },
      { key: 'flower', name: '花艺道具' },
      { key: 'light', name: '灯光设备' },
      { key: 'furniture', name: '桌椅/摆件' },
      { key: 'deco', name: '装饰小品' },
    ],
    // 加载状态
    loading: true,
    error: false,
    errorMsg: '',
  },

  onLoad() { this.loadData(); },

  loadData() {
    this.setData({ loading: true, error: false });
    Promise.all([
      api.props.summary(null),
      api.props.list({}, null),
    ]).then(([summary, listRes]) => {
      this.setData({ loading: false });
      const patch = {};
      if (summary) {
        if (summary.totalProps != null) patch.totalProps = summary.totalProps;
        if (summary.inUse != null)      patch.inUse = summary.inUse;
        if (summary.available != null)  patch.available = summary.available;
        if (summary.needBuy != null)    patch.needBuy = summary.needBuy;
        if (Array.isArray(summary.categories) && summary.categories.length) patch.categories = summary.categories;
        if (Array.isArray(summary.todos)) patch.todos = summary.todos;
      }
      if (listRes && Array.isArray(listRes.list)) {
        patch.propList = listRes.list.map(p => ({
          ...p,
          categoryName: this.data.categoryMap[p.category] || p.category,
        }));
      } else if (!listRes) {
        patch.propList = DEMO_PROPS;
      }
      this.setData(patch);
    }).catch(err => {
      this.setData({ loading: false, error: true, errorMsg: '数据加载失败，请下拉刷新重试' });
    });
  },

  // ===== 表单操作 =====
  openCreate() {
    this.setData({
      showForm: true,
      formMode: 'create',
      editingId: null,
      catIndex: 0,
      formData: { name: '', category: 'bg', total: '', inUse: '', unit: '件', notes: '' },
    });
  },

  openEdit(e) {
    const id = e.currentTarget.dataset.id;
    const p = this.data.propList.find(p => p.id === id);
    if (!p) return;
    const catIndex = this.data.categoryOptions.findIndex(o => o.key === p.category);
    this.setData({
      showForm: true,
      formMode: 'edit',
      editingId: id,
      catIndex: catIndex >= 0 ? catIndex : 0,
      formData: {
        name: p.name || '',
        category: p.category || 'bg',
        total: String(p.total || 0),
        inUse: String(p.inUse || 0),
        unit: p.unit || '件',
        notes: p.notes || '',
      },
    });
  },

  closeForm() {
    this.setData({ showForm: false });
  },

  onFormInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({ [`formData.${field}`]: value });
  },

  onFormCategoryChange(e) {
    const idx = parseInt(e.detail.value) || 0;
    const cat = this.data.categoryOptions[idx];
    if (cat) this.setData({ 'formData.category': cat.key });
  },

  submitForm() {
    const { formData, formMode, editingId } = this.data;
    if (!formData.name.trim()) {
      wx.showToast({ title: '请输入道具名称', icon: 'none' });
      return;
    }
    const data = {
      name: formData.name.trim(),
      category: formData.category,
      unit: formData.unit.trim() || '件',
      total: parseInt(formData.total) || 0,
      inUse: parseInt(formData.inUse) || 0,
      notes: formData.notes.trim() || '',
    };
    if (data.inUse > data.total) {
      wx.showToast({ title: '使用数不能大于总数', icon: 'none' });
      return;
    }
    const request = formMode === 'edit' && editingId
      ? api.props.update(editingId, data)
      : api.props.create(data);
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

  // ===== 删除 =====
  confirmDelete(e) {
    const id = e.currentTarget.dataset.id;
    const name = e.currentTarget.dataset.name || '该道具';
    wx.showModal({
      title: '确认删除',
      content: `确定要删除「${name}」吗？删除后可在数据恢复前联系管理员。`,
      success: (res) => {
        if (res.confirm) {
          api.props.delete(id).then(result => {
            if (result && result.code === 0) {
              wx.showToast({ title: '已删除', icon: 'success' });
              this.loadData();
            } else {
              wx.showToast({ title: (result && result.msg) || '删除失败', icon: 'none' });
            }
          }).catch(() => {
            wx.showToast({ title: '删除失败', icon: 'none' });
          });
        }
      }
    });
  },

  // ===== 快速操作 =====
  addProp() { this.openCreate(); },

  goPropMarket() {
    wx.navigateTo({ url: '/pages/prop-market/prop-market' });
  },

  filterByCategory(e) {
    const key = e.currentTarget.dataset.key;
    if (key === 'more') return;
    if (this.data.filterCategory === key) {
      this.setData({ filterCategory: '' });
    } else {
      this.setData({ filterCategory: key });
    }
    this.loadPropList();
  },

  loadPropList() {
    const { filterCategory } = this.data;
    if (api.isCloud()) {
      const params = filterCategory ? { category: filterCategory } : {};
      api.props.list(params, null).then(res => {
        if (res && Array.isArray(res.list)) {
          this.setData({
            propList: res.list.map(p => ({
              ...p,
              categoryName: this.data.categoryMap[p.category] || p.category,
            })),
          });
        }
      }).catch(() => {});
    } else {
      let list = DEMO_PROPS;
      if (filterCategory) list = list.filter(p => p.category === filterCategory);
      this.setData({ propList: list });
    }
  },

  toggleTodo(e) {
    const id = e.currentTarget.dataset.id;
    const todos = this.data.todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
    this.setData({ todos });
    if (api.isCloud()) api.todos.toggle(id).catch(() => {});
  },

  onPullDownRefresh() { this.loadData(); wx.stopPullDownRefresh(); },
  onShareAppMessage() { return { title: '道具库·大喜的日子', path: '/pages/props/props' }; },
});
