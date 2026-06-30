// 道具市场参考页 - 多平台价格对比
const api = require('../../services/api');

Page({
  data: {
    loading: true,
    keyword: '',
    activeCategory: 'all',
    categories: [
      { key: 'all', label: '全部' },
      { key: 'flower', label: '花艺' },
      { key: 'light', label: '灯光' },
      { key: 'furniture', label: '家具' },
      { key: 'decor', label: '装饰' },
    ],
    allItems: [],
    filteredItems: [],
  },

  onLoad() {
    this.loadData();
  },

  loadData() {
    this.setData({ loading: true });
    api.propMarket.list({}).then(res => {
      const list = res && res.data ? res.data : [];
      if (list.length === 0) {
        this.setData({ allItems: this.getMockData() });
      } else {
        this.setData({ allItems: list });
      }
      this.filterItems();
      this.setData({ loading: false });
    }).catch(() => {
      this.setData({ allItems: this.getMockData(), loading: false });
      this.filterItems();
    });
  },

  getMockData() {
    return [
      {
        id: 'pm-001',
        name: '玫瑰拱门',
        spec: '3m 高 · 鲜花装饰',
        category: 'flower',
        icon: 'flower',
        tag: '最低',
        tagType: 'lowest',
        prices: [
          { platform: '淘宝', price: '¥180/天', isLowest: true },
          { platform: '本地', price: '¥200/天', isLowest: false },
        ],
      },
      {
        id: 'pm-002',
        name: 'LED 串灯',
        spec: '10m 暖白光',
        category: 'light',
        icon: 'sparkles',
        tag: '推荐',
        tagType: 'recommend',
        prices: [
          { platform: '京东', price: '¥45/条', isLowest: false },
          { platform: '淘宝', price: '¥38/条', isLowest: false },
          { platform: '闲鱼', price: '¥25/条', isLowest: true },
        ],
      },
      {
        id: 'pm-003',
        name: '透明椅',
        spec: '亚克力 · 金色腿',
        category: 'furniture',
        icon: 'box',
        tag: '充足',
        tagType: 'ample',
        prices: [
          { platform: '淘宝', price: '¥15/把/天', isLowest: true },
          { platform: '本地', price: '¥18/把/天', isLowest: false },
        ],
      },
      {
        id: 'pm-004',
        name: '罗马柱',
        spec: '1.2m · 白色泡沫',
        category: 'decor',
        icon: 'box',
        tag: '最低',
        tagType: 'lowest',
        prices: [
          { platform: '淘宝', price: '¥50/天', isLowest: true },
          { platform: '京东', price: '¥65/天', isLowest: false },
        ],
      },
      {
        id: 'pm-005',
        name: '鲜花花艺套装',
        spec: '主桌+签到台 · 含安装',
        category: 'flower',
        icon: 'flower',
        tag: '推荐',
        tagType: 'recommend',
        prices: [
          { platform: '本地', price: '¥800/套', isLowest: false },
          { platform: '淘宝', price: '¥680/套', isLowest: true },
        ],
      },
      {
        id: 'pm-006',
        name: '舞台灯光',
        spec: 'PAR 灯 ×4 + 追光灯',
        category: 'light',
        icon: 'sparkles',
        tag: '充足',
        tagType: 'ample',
        prices: [
          { platform: '本地', price: '¥500/天', isLowest: false },
          { platform: '京东', price: '¥420/天', isLowest: true },
        ],
      },
      {
        id: 'pm-007',
        name: '圆桌',
        spec: '1.8m · 可坐 10 人',
        category: 'furniture',
        icon: 'box',
        tag: '最低',
        tagType: 'lowest',
        prices: [
          { platform: '本地', price: '¥30/天', isLowest: false },
          { platform: '淘宝', price: '¥25/天', isLowest: true },
        ],
      },
      {
        id: 'pm-008',
        name: '纱幔',
        spec: '8m · 白色雪纺',
        category: 'decor',
        icon: 'box',
        tag: '推荐',
        tagType: 'recommend',
        prices: [
          { platform: '淘宝', price: '¥120/套', isLowest: false },
          { platform: '闲鱼', price: '¥80/套', isLowest: true },
        ],
      },
    ];
  },

  onSearch(e) {
    this.setData({ keyword: e.detail.value });
    this.filterItems();
  },

  filterByCategory(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ activeCategory: key });
    this.filterItems();
  },

  filterItems() {
    const { activeCategory, keyword, allItems } = this.data;
    let filtered = allItems;

    // 分类过滤
    if (activeCategory !== 'all') {
      filtered = filtered.filter(item => item.category === activeCategory);
    }

    // 关键词搜索
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(kw) ||
        item.spec.toLowerCase().includes(kw)
      );
    }

    this.setData({ filteredItems: filtered });
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    // 预留：跳转道具市场详情页（显示更多平台和历史价格趋势）
    wx.showToast({ title: '详情功能开发中', icon: 'none', duration: 1500 });
  },

  onShareAppMessage() {
    return {
      title: '道具市场参考 · 大喜的日子',
      path: '/pages/prop-market/prop-market',
    };
  },
});
