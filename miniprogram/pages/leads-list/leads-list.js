const api = require('../../services/api');

const STATUS_TABS = [
  { key: 'all', label: '全部' },
  { key: '待跟进', label: '待跟进' },
  { key: '已联系', label: '已联系' },
  { key: '已转化', label: '已转化' },
  { key: '已关闭', label: '已关闭' },
];

Page({
  data: {
    statusTabs: STATUS_TABS,
    activeTab: 'all',
    leads: [],
    loading: false,
    page: 1,
    total: 0,
    hasMore: true,
  },

  onLoad() {
    this.fetchLeads();
  },

  onShow() {
    this.fetchLeads();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, leads: [], hasMore: true });
    this.fetchLeads().then(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.fetchLeads(true);
    }
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeTab) return;
    this.setData({ activeTab: tab, page: 1, leads: [], hasMore: true });
    this.fetchLeads();
  },

  fetchLeads(append) {
    this.setData({ loading: true });
    const { activeTab, page } = this.data;
    const params = { page, pageSize: 20 };
    if (activeTab !== 'all') params.status = activeTab;

    return api.leads.list(params).then(res => {
      const list = (res && res.list) ? res.list : [];
      const total = (res && res.total) ? res.total : 0;
      // 格式化显示
      const leads = list.map(l => ({
        ...l,
        displayDate: this._fmtDate(l.weddingDate),
        overdue: l.status === '待跟进' && l.createdAt && (Date.now() - new Date(l.createdAt).getTime()) > 86400000,
      }));
      this.setData({
        loading: false,
        leads: append ? [...this.data.leads, ...leads] : leads,
        total,
        hasMore: (append ? this.data.leads.length + leads.length : leads.length) < total,
      });
    }).catch(() => {
      this.setData({ loading: false });
    });
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/lead-detail/lead-detail?id=' + id });
  },

  goCreate() {
    wx.navigateTo({ url: '/pages/leads-list/leads-list?action=create' });
  },

  _fmtDate(d) {
    if (!d) return '';
    const dt = new Date(d);
    return `${dt.getMonth() + 1}月${dt.getDate()}日`;
  },
});
