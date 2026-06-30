const app = getApp();

Component({
  data: {
    selected: 0,
    role: 'newbie',
    newbieList: [
      { pagePath: '/pages/home/home', text: 'AI设计', icon: 'home', activeIcon: 'home-fill' },
      { pagePath: '/pages/contact/contact', text: '案例', icon: 'case', activeIcon: 'case-fill' },
      { pagePath: '/pages/mine/mine', text: '我的', icon: 'user', activeIcon: 'user-fill' },
    ],
    plannerList: [
      { pagePath: '/pages/dashboard/dashboard', text: '工作台', icon: 'dashboard', activeIcon: 'dashboard-fill' },
      { pagePath: '/pages/orders/orders', text: '订单', icon: 'orders', activeIcon: 'orders-fill' },
      { pagePath: '/pages/schedule/schedule', text: '排期', icon: 'schedule', activeIcon: 'schedule-fill' },
      { pagePath: '/pages/contracts/contracts', text: '合同', icon: 'contracts', activeIcon: 'contracts-fill' },
    ],
  },

  lifetimes: {
    attached() { this.updateRole(); },
  },

  pageLifetimes: {
    show() { this.updateRole(); },
  },

  methods: {
    updateRole() {
      const role = app.getRole();
      if (role !== this.data.role) this.setData({ role, selected: 0 });
      const self = this;
      wx.nextTick(() => {
        const pages = getCurrentPages();
        if (pages.length) {
          const route = '/' + (pages[pages.length - 1].route || '');
          const list = self.data.role === 'planner' ? self.data.plannerList : self.data.newbieList;
          const idx = list.findIndex(t => route.startsWith(t.pagePath));
          if (idx >= 0) self.setData({ selected: idx });
        }
      });
    },
    onTabTap(e) {
      const idx = e.currentTarget.dataset.index;
      const list = this.data.role === 'planner' ? this.data.plannerList : this.data.newbieList;
      const item = list[idx];
      if (!item) return;
      this.setData({ selected: idx });
      wx.switchTab({ url: item.pagePath });
    },
  },
});
