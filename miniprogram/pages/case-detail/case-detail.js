const share = require('../../utils/share');
const api = require('../../services/api');
const fav = require('../../utils/favorites');

Page({
  data: { caseData: null, loading: true, isFav: false, favCount: 0, shareCardImage: '', showLoginModal: false },

  onLoad(options) {
    const id = options && options.id;
    
    // 注册登录弹窗到全局
    const app = getApp();
    this._loginModalShowFn = (show) => {
      this.setData({ showLoginModal: show });
    };
    app.registerLoginModal(this._loginModalShowFn);
    
    this.setData({ favCount: fav.count() });
    
    // 登录守卫：查看案例详情需要登录
    if (!app.globalData.isLoggedIn) {
      api.requireLogin(() => {
        // 登录成功后加载数据
        if (id) {
          this.loadCaseDetail(id);
        }
      });
      return;
    }
    
    if (id) {
      this.loadCaseDetail(id);
    } else {
      this.setData({ loading: false });
    }
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

  loadCaseDetail(id) {
    this.setData({ loading: true });
    api.cases.get({ id }, null).then(data => {
      this.setData({ loading: false });
      if (!data) {
        this.setData({
          isFav: fav.isFavorite(id),
          caseData: {
            id,
            title: '中式雅韵 · 万达酒店婚礼',
            coupleName: '张先生 & 李女士',
            images: [],
            style: '新中式',
            venue: '万达酒店·宴会厅',
            venueShort: '万达酒店',
            budgetRange: '10,000-15,000',
            tags: ['新中式', '金色', '30桌'],
            description: '以中国红和金色为主调，融入梅花、折扇等传统元素，打造大气典雅的婚礼现场。大厅可容纳30桌，主舞台采用3层背景架设计，配合暖色灯光营造出浓郁的中式氛围。',
            designNotes: '新娘喜欢中式风格，但希望不要过于传统。我们选择了红金配色，用梅花枝和折扇装饰，既有中国风又显得时尚。',
            // ★ 垂直化：幕后过程叙事
            venueInsight: {
              title: '万达酒店场地洞察',
              highlights: '该宴会厅层高5.8米，柱子间距8米，可搭建3层背景架。灯光色温偏暖(3000K-3500K)，适合金色和红色系布置。入口较窄(2.4米)，大型道具需分体搬运。电源点位分布在舞台两侧各3个。',
              tips: '这个酒店我们做过3场婚礼，摸索出的最佳布局方案：主舞台靠东墙，利用自然光透过东侧玻璃门增强仪式感。',
            },
            processStory: [
              { label:'初次沟通', content:'新人通过小红书了解到我们，预约到店沟通。新娘对新中式风格有明确偏好，但担心过于传统。我们展示了3套不同"传统度"的案例供参考。' },
              { label:'方案设计', content:'根据万达酒店的实际空间，我们建议采用"轻中式"路线——保留中式元素骨架（梅花、折扇、红金配色），但简化繁复装饰，注入现代感。' },
              { label:'道具匹配', content:'从道具库匹配合适物料：3层背景架(现有)、梅花枝装饰花艺、折扇造型背景板、暖金色灯光。其中折扇背景板根据酒店层高定制尺寸。' },
              { label:'现场搭建', content:'搭建团队提前1天进场，耗时6小时完成主舞台搭建+花艺布置。针对酒店入口窄的问题，背景架分4组模块搬运后现场组装。' },
            ],
            challengeAndSolve: {
              challenge: '酒店宴会厅入口只有2.4米宽，我们的标准3层背景架（2.8米宽）无法整件进入。',
              solve: '将背景架重新设计为4组模块化组件，每组宽度不超过2.2米，到现场后用卡扣快速拼接。这个方案后续在另外2家窄入口酒店也得到了复用。',
            },
            materialHighlights: [
              { name:'3层背景架', color:'#E8D5B7', notes:'模块化设计，适配窄入口' },
              { name:'梅花枝花艺', color:'#C9A9A9', notes:'绢花，可重复使用' },
              { name:'折扇背景板', color:'#CA8A04', notes:'定制尺寸，酒店专用' },
              { name:'暖金灯光组', color:'#FDE68A', notes:'8组PAR灯+4组追光' },
            ],
            clientReview: '婚礼当天效果超出了我们的预期！策划师团队非常细心，从方案到执行都让我们很放心。尤其是现场搭建那天，我们完全不用操心。',
            clientRating: '5',
          },
        });
        this.preGenShareCard();
        return;
      }
      this.setData({ caseData: data, isFav: fav.isFavorite(data.id) });
      this.preGenShareCard();
    }).catch(() => this.setData({ loading: false }));
  },

  toggleFav() {
    if (!this.data.caseData) return;

    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLoggedIn) {
      api.requireLogin(() => {
        // 登录成功后继续收藏操作
        this._doToggleFav();
      });
      return;
    }

    this._doToggleFav();
  },

  _doToggleFav() {
    var newList = fav.toggle(this.data.caseData);
    this.setData({ isFav: !this.data.isFav, favCount: newList.length });
    wx.showToast({ title: this.data.isFav ? '已收藏' : '已取消收藏', icon: 'none' });
  },

  goContact() {
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

  // 预生成 5:4 分享卡片
  preGenShareCard() {
    var c = this.data.caseData;
    if (!c) return;
    var that = this;
    share.drawChatCard('shareCanvas', {
      coupleName: c.coupleName || '',
      style: c.style || '',
    }, function(err, path) {
      if (!err && path) that.setData({ shareCardImage: path });
    });
  },

  // 生成海报并保存到相册
  generatePoster() {
    var c = this.data.caseData;
    if (!c) {
      wx.showToast({ title: '数据加载中，请稍后', icon: 'none' });
      return;
    }
    var that = this;
    wx.showLoading({ title: '生成海报中...' });
    share.drawPoster('shareCanvas', {
      coupleName: c.coupleName || '',
      style: c.style || '',
      title: c.title || '',
    }, function(err, tempPath) {
      wx.hideLoading();
      if (err) {
        wx.showToast({ title: '生成失败，请重试', icon: 'none' });
        return;
      }
      wx.saveImageToPhotosAlbum({
        filePath: tempPath,
        success: function() {
          wx.showToast({ title: '海报已保存到相册', icon: 'success' });
        },
        fail: function() {
          wx.showModal({
            title: '保存失败',
            content: '需要相册权限才能保存海报',
            success: function(res) {
              if (res.confirm) wx.openSetting();
            }
          });
        }
      });
    });
  },

  onShareAppMessage() {
    var c = this.data.caseData;
    var img = this.data.shareCardImage || '';
    return {
      title: c ? (c.coupleName || '') + ' · 大喜的日子' : '婚礼案例',
      path: '/pages/case-detail/case-detail?id=' + (c ? c.id : ''),
      imageUrl: img,
    };
  },
});
