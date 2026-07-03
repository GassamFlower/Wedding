const api = require('../../services/api');
const app = getApp();

Page({
  data: {
    orderId: '',
    proposalId: '',
    order: null,
    proposal: null,       // AI 生成的方案数据
    plannerView: null,    // 策划师成本利润视图
    loading: true,
    tab: 'info',          // info | props | finance | cost | timeline
    isPlanner: false,
  },

  onLoad(options) {
    const isPlanner = app.isPlanner();
    this.setData({ isPlanner });

    // 注册登录弹窗到全局
    this._loginModalShowFn = (show) => {
      this.setData({ showLoginModal: show });
    };
    app.registerLoginModal(this._loginModalShowFn);

    const id = options && options.id;
    const proposalId = options && options.proposalId;

    if (proposalId) {
      this.setData({ proposalId });
    } else if (id) {
      this.setData({ orderId: id });
    }

    // 登录守卫：策划师端页面需要登录
    if (!app.globalData.isLoggedIn) {
      api.requireLogin(() => {
        // 登录成功后重新加载
        if (proposalId) {
          this.loadByProposal(proposalId);
        } else if (id) {
          this.loadDetail(id);
        }
      });
      // 仍然显示页面，但数据加载会被 API 层拦截
      this.setData({ loading: false });
    } else {
      if (proposalId) {
        this.loadByProposal(proposalId);
      } else if (id) {
        this.loadDetail(id);
      } else {
        this.setData({ loading: false });
      }
    }
  },

  onUnload() {
    // 页面卸载时注销登录弹窗
    if (this._loginModalShowFn) {
      app.unregisterLoginModal(this._loginModalShowFn);
    }
  },

  onLoginSuccess() {
    this.setData({ showLoginModal: false });
    const id = this.data.orderId;
    const proposalId = this.data.proposalId;
    if (proposalId) {
      this.loadByProposal(proposalId);
    } else if (id) {
      this.loadDetail(id);
    }
  },

  onLoginClose() {
    this.setData({ showLoginModal: false });
  },

  _reloadAfterLogin(options) {
    const id = options && options.id;
    const proposalId = options && options.proposalId;
    if (proposalId) {
      this.loadByProposal(proposalId);
    } else if (id) {
      this.loadDetail(id);
    }
  },

  // ====================== 通过方案 ID 加载 ======================

  loadByProposal(proposalId) {
    this.setData({ loading: true });

    // 加载方案详情
    api.proposalAi.detail({ proposalId }).then(data => {
      this.setData({ proposal: data, loading: false });

      // 策划师端额外加载成本利润视图
      if (this.data.isPlanner) {
        this.loadPlannerView(proposalId);
      }
    }).catch(() => {
      // 方案加载失败，回退到 demo 数据
      this.setData({ loading: false });
      this._setDemoData();
    });
  },

  loadPlannerView(proposalId) {
    api.proposalAi.plannerDetail({ proposalId }).then(data => {
      this.setData({ plannerView: data });
    }).catch(() => {
      // 静默失败，策划师视图不可用时不影响新人视图
    });
  },

  // ====================== 通过订单 ID 加载 ======================

  loadDetail(id) {
    this.setData({ loading: true });
    api.orders.get(id, null).then(data => {
      this.setData({ loading: false });
      if (!data) {
        this._setDemoData();
        return;
      }
      this.setData({ order: data });

      // 如果订单关联了方案，加载方案数据
      if (data.proposalId) {
        this.setData({ proposalId: data.proposalId });
        this.loadByProposal(data.proposalId);
      }
    }).catch(() => this.setData({ loading: false }));
  },

  // ====================== Demo 数据 ======================

  _setDemoData() {
    this.setData({
      order: {
        id: 'demo-order',
        client: '张先生 & 李女士',
        date: '6月15日',
        venue: '万达酒店·宴会厅',
        style: '新中式',
        budget: '12,000',
        paid: '7,200',
        balance: '4,800',
        status: '筹备中',
        progress: 65,
        description: '中式风格婚礼，红色金色主调，大厅可容纳30桌。以传统中式元素为基调，融入现代审美，打造温馨典雅的婚礼场景。',
        costItems: [
          { name: '场景布置', amount: '6,000' },
          { name: '道具租赁', amount: '2,500' },
          { name: '花艺', amount: '1,800' },
          { name: '灯光音响', amount: '1,200' },
          { name: '运输安装', amount: '500' },
        ],
        propList: [
          { name: '梅花背景架', source: '自有', status: '已出库' },
          { name: '金色竹节柱', source: '自有', status: '已出库' },
          { name: '粉锈球花', source: '外租', status: '待取货' },
        ],
        hotelInfo: { hotelId: 'h1', deposit: '3,000', depositStatus: '已缴纳', loadIn: '07:00', loadOut: '23:00' },
      },
      // Demo 策划师成本视图
      plannerView: {
        propCostDetail: [
          { name: '梅花背景架', qty: 1, unitCost: 200, total: 200 },
          { name: '金色竹节柱', qty: 8, unitCost: 50, total: 400 },
          { name: '红色地毯', qty: 1, unitCost: 150, total: 150 },
          { name: '中式屏风', qty: 2, unitCost: 180, total: 360 },
        ],
        floralCostDetail: [
          { name: '红玫瑰', qty: 200, unitCost: 3, total: 600 },
          { name: '金色绣球', qty: 30, unitCost: 15, total: 450 },
          { name: '桌花搭配', qty: 30, unitCost: 25, total: 750 },
        ],
        laborCostDetail: [
          { name: '策划师', days: 2, rate: 800, total: 1600 },
          { name: '工程主管', days: 1, rate: 600, total: 600 },
          { name: '搭建工人(4人)', days: 1.5, rate: 400, total: 2400 },
          { name: '花艺师', days: 1, rate: 600, total: 600 },
          { name: '婚礼管家', days: 1, rate: 500, total: 500 },
        ],
        transportCostDetail: [
          { name: '中面运输', trips: 2, cost: 300, total: 600 },
        ],
        hiddenCosts: {
          lighting: 220,
          consumables: 95,
          insurance: 200,
          contingency: 143,
          platform: 3,
        },
        totalCost: 9511,
        profit: 2489,
        customerPrice: 12000,
        profitRate: 20.7,
        profitMargin: 17.4,
        suggestedRange: { minimum: 11413, standard: 13500, premium: 14742 },
      },
    });
  },

  // ====================== Tab 切换 ======================

  switchTab(e) {
    this.setData({ tab: e.currentTarget.dataset.tab });
  },

  // ====================== 操作 ======================

  contactClient() {
    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLoggedIn) {
      api.requireLogin(() => {
        this._doContactClient();
      });
      return;
    }
    this._doContactClient();
  },

  _doContactClient() {
    if (this.data.order && this.data.order.clientPhone) {
      wx.makePhoneCall({ phoneNumber: this.data.order.clientPhone });
    } else {
      wx.showToast({ title: '暂无客户电话', icon: 'none' });
    }
  },

  updateProgress() {
    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLoggedIn) {
      api.requireLogin(() => {
        wx.showToast({ title: '进度更新功能开发中', icon: 'none' });
      });
      return;
    }
    wx.showToast({ title: '进度更新功能开发中', icon: 'none' });
  },

  onShareAppMessage() {
    return { title: '大喜的日子·订单详情', path: '/pages/order-detail/order-detail' };
  },
});
