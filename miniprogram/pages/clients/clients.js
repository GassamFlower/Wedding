const api = require('../../services/api');
const DEMO_CLIENTS = [
  { id: 'c1', name: '张先生 & 李女士', phone: '138****1234', status: 'active', amount: '12,000', date: '6月15日', venue: '万达酒店', avatarClass: 1 },
  { id: 'c2', name: '王先生 & 赵女士', phone: '139****5678', status: 'active', amount: '8,500', date: '6月28日', venue: '湖滨酒店', avatarClass: 2 },
  { id: 'c3', name: '刘先生 & 陈女士', phone: '136****9012', status: 'pending', amount: '18,000', date: '7月8日', venue: '香格里拉', avatarClass: 3 },
  { id: 'c4', name: '陈先生 & 周女士', phone: '137****3456', status: 'done', amount: '6,800', date: '已完结', venue: '田园酒店', avatarClass: 4 },
  { id: 'c5', name: '林先生 & 黄女士', phone: '150****7890', status: 'done', amount: '15,000', date: '已完结', venue: '希尔顿', avatarClass: 1 },
];
Page({
  data: {
    tab: 'all',
    keyword: '',
    clients: [],
    totalClients: '--', activeCount: '--', doneCount: '--',
    loading: true, showForm: false,
    formData: { name: '', phone: '', wechat: '', remark: '', tags: '' },
  },
  onLoad() { this.loadData(); },
  onShow() { this.loadData(); },
  loadData() {
    this.setData({ loading: true });
    Promise.all([
      api.clients.summary(null),
      api.clients.list({}, null),
    ]).then(([summary, listRes]) => {
      this.setData({ loading: false });
      if (!summary && !listRes) {
        this.setData({ clients: DEMO_CLIENTS, totalClients: 5, activeCount: 2, doneCount: 2 });
        return;
      }
      const patch = {};
      if (summary) {
        if (summary.totalClients != null) patch.totalClients = summary.totalClients;
        if (summary.activeCount != null) patch.activeCount = summary.activeCount;
        if (summary.doneCount != null) patch.doneCount = summary.doneCount;
      }
      if (listRes && Array.isArray(listRes.list)) patch.clients = listRes.list;
      this.setData(patch);
    }).catch(() => this.setData({ loading: false, clients: DEMO_CLIENTS, totalClients: 5 }));
  },
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ tab });
    this.filterList();
  },
  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
    this.filterList();
  },
  filterList() {
    const { keyword, tab, clients } = this.data;
    let list = clients;
    if (tab === 'active') list = list.filter(c => c.status === 'active' || c.status === 'pending');
    else if (tab === 'done') list = list.filter(c => c.status === 'done');
    if (keyword.trim()) list = list.filter(c => (c.name || '').includes(keyword.trim()));
    this.setData({ filtered: list });
  },
  openCreate() {
    this.setData({ showForm: true, formData: { name: '', phone: '', wechat: '', remark: '', tags: '' } });
  },
  closeForm() { this.setData({ showForm: false }); },
  onFormInput(e) {
    const f = e.currentTarget.dataset.field;
    this.setData({ ['formData.' + f]: e.detail.value });
  },
  submitForm() {
    const { formData } = this.data;
    if (!formData.name.trim()) { wx.showToast({ title: '请输入客户名称', icon: 'none' }); return; }
    api.clients.create({ data: formData }).then(() => {
      wx.showToast({ title: '添加成功', icon: 'success' });
      this.closeForm();
      this.loadData();
    }).catch(() => wx.showToast({ title: '添加失败', icon: 'none' }));
  },
  onPullDownRefresh() { this.loadData(); wx.stopPullDownRefresh(); },
    onShareAppMessage() { return { title: '大喜的日子·客户管理', path: '/pages/clients/clients' }; },
});
