// 精选案例馆 - 瀑布流展示
const { updateTabBar } = require('../../utils/tabBar');
const api = require('../../services/api');

Page({
  data: {
    activeStyle: 'all',
    loading: true,
    styles: [
      { key: 'all', label: '全部', count: '' },
      { key: '新中式', label: '新中式', count: '' },
      { key: '韩式', label: '韩式', count: '' },
      { key: '森系', label: '森系', count: '' },
      { key: '法式', label: '法式', count: '' },
      { key: '现代简约', label: '现代', count: '' },
      { key: '户外', label: '户外', count: '' },
    ],
    allCases: [],
    filteredCases: [],
    leftCol: [],
    rightCol: [],
    showLoginModal: false,
  },

  onLoad() {
    this.loadCases();
    
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

  onShow() {
    updateTabBar(this, 1);
  },

  loadCases() {
    this.setData({ loading: true });
    api.cases.list({}).then(res => {
      const list = res && res.data ? res.data : [];
      if (list.length === 0) {
        // 使用本地 mock 数据
        this.setData({ allCases: this.getMockCases() });
      } else {
        this.setData({ allCases: list });
      }
      this.updateCounts();
      this.filterAndLayout();
      this.setData({ loading: false });
    }).catch(() => {
      this.setData({ allCases: this.getMockCases(), loading: false });
      this.updateCounts();
      this.filterAndLayout();
    });
  },

  getMockCases() {
    return [
      {
        id: 'case-001',
        coupleName: '张先生 & 李女士',
        style: '新中式',
        venue: '万达酒店',
        budgetRange: '1.2-1.5万',
        tags: ['新中式', '金色', '30桌'],
        bg: 'linear-gradient(135deg, #E8D5A8, #C19A50)',
        height: 180,
      },
      {
        id: 'case-002',
        coupleName: '王先生 & 赵女士',
        style: '韩式',
        venue: '香格里拉',
        budgetRange: '2-3万',
        tags: ['韩式', '浪漫', '白色'],
        bg: 'linear-gradient(135deg, #F8E5E0, #D4A596)',
        height: 150,
      },
      {
        id: 'case-003',
        coupleName: '刘先生 & 陈女士',
        style: '森系',
        venue: '户外花园',
        budgetRange: '1.5-2万',
        tags: ['森系', '清新', '户外'],
        bg: 'linear-gradient(135deg, #E5EDE8, #A5BDB0)',
        height: 170,
      },
      {
        id: 'case-004',
        coupleName: '陈先生 & 杨女士',
        style: '法式',
        venue: '洲际酒店',
        budgetRange: '3-5万',
        tags: ['法式', '优雅', '精致'],
        bg: 'linear-gradient(135deg, #F6F4F8, #CFC0DE)',
        height: 160,
      },
      {
        id: 'case-005',
        coupleName: '赵先生 & 周女士',
        style: '现代简约',
        venue: '万达酒店',
        budgetRange: '0.8-1.2万',
        tags: ['现代', '简约', '高级感'],
        bg: 'linear-gradient(135deg, #F3F6F8, #B8CED9)',
        height: 140,
      },
      {
        id: 'case-006',
        coupleName: '孙先生 & 吴女士',
        style: '户外',
        venue: '东湖草坪',
        budgetRange: '2-4万',
        tags: ['户外', '草坪', '自然'],
        bg: 'linear-gradient(135deg, #E5EDE8, #85A594)',
        height: 190,
      },
      {
        id: 'case-007',
        coupleName: '周先生 & 黄女士',
        style: '新中式',
        venue: '光谷凯悦',
        budgetRange: '1.8-2.5万',
        tags: ['新中式', '红色', '传统'],
        bg: 'linear-gradient(135deg, #FDF5F3, #E8C5BB)',
        height: 155,
      },
      {
        id: 'case-008',
        coupleName: '吴先生 & 郑女士',
        style: '韩式',
        venue: '马哥孛罗',
        budgetRange: '1.5-2万',
        tags: ['韩式', '粉色', '甜美'],
        bg: 'linear-gradient(135deg, #FDF5F3, #F8E5E0)',
        height: 165,
      },
    ];
  },

  updateCounts() {
    const styles = this.data.styles.map(s => {
      if (s.key === 'all') return s;
      const count = this.data.allCases.filter(c => c.style === s.key).length;
      return { ...s, count: count > 0 ? count : '' };
    });
    this.setData({ styles });
  },

  filterByStyle(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ activeStyle: key });
    this.filterAndLayout();
  },

  filterAndLayout() {
    const { activeStyle, allCases } = this.data;
    const filtered = activeStyle === 'all' 
      ? allCases 
      : allCases.filter(c => c.style === activeStyle);
    
    // 瀑布流分列
    const leftCol = [];
    const rightCol = [];
    filtered.forEach((item, idx) => {
      if (idx % 2 === 0) {
        leftCol.push(item);
      } else {
        rightCol.push(item);
      }
    });
    
    this.setData({ filteredCases: filtered, leftCol, rightCol });
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    
    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLoggedIn) {
      api.requireLogin(() => {
        // 登录成功后继续跳转
        wx.navigateTo({ url: `/pages/case-detail/case-detail?id=${id}` });
      });
      return;
    }
    
    wx.navigateTo({ url: `/pages/case-detail/case-detail?id=${id}` });
  },

  goAIDesign() {
    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLoggedIn) {
      api.requireLogin(() => {
        // 登录成功后继续跳转
        wx.switchTab({ url: '/pages/home/home' });
      });
      return;
    }
    wx.switchTab({ url: '/pages/home/home' });
  },

  onShareAppMessage() {
    return {
      title: '精选案例 · 大喜的日子',
      path: '/pages/contact/contact',
    };
  },
});
