// 大喜的日子 · AI 设计对话首页
// 替代旧版案例瀑布流 + 联系我们 + 风格测试
// 新人打开小程序第一个看到的：和 AI 对话描述梦想婚礼

const { updateTabBar } = require('../../utils/tabBar');
const api = require('../../services/api');

// 欢迎消息
const WELCOME_MSG = {
  role: 'agent',
  content: '您好！我是大喜的日子的婚礼设计助手\n\n请问您的婚礼计划在什么季节？大概多少预算呢？',
  type: 'text',
  time: '',
};

// 快速引导提问 — 简洁版
const SUGGESTIONS = [
  { text: '新中式婚礼风格介绍', iconClass: 'icon-lantern-gold' },
  { text: '帮我做预算规划', iconClass: 'icon-money-gold' },
  { text: '户外婚礼需要注意什么', iconClass: 'icon-leaf-gold' },
  { text: '武汉有哪些好场地推荐', iconClass: 'icon-location-gold' },
];

// 精选案例数据（用于内联展示）
const FEATURED_CASES = [
  { id: 'c1', title: '春日花园', tag: '自然浪漫', iconClass: 'icon-flower-pink', bg: 'linear-gradient(135deg, var(--gold-100), var(--gold-200))' },
  { id: 'c2', title: '森系秘境', tag: '清新自然', iconClass: 'icon-leaf-green', bg: 'linear-gradient(135deg, var(--gold-200), var(--gold-300))' },
  { id: 'c3', title: '中式雅韵', tag: '传统典雅', iconClass: 'icon-lantern-gold', bg: 'linear-gradient(135deg, var(--gold-100), var(--gold-300))' },
];

Page({
  data: {
    messages: [],
    inputText: '',
    sending: false,
    scrollToView: '',
    sessionId: '',           // 当前设计会话ID
    extracted: null,         // AI 提取的结构化需求
    canGenerateProposal: false,
    showFallbackActions: false,
    suggestions: SUGGESTIONS,
    // 精选案例 — 在对话中作为参考卡片展示
    referenceCases: [],
    showCaseRef: false,
  },

  onLoad() {
    const app = getApp();
    // 如果有待处理的数据（来自其他页面传来的预算/风格偏好）
    const pendingBudget = app.globalData?.pendingBudget;
    const stylePref = app.globalData?.stylePref;

    // 初始化欢迎消息
    const welcome = { ...WELCOME_MSG, time: this._now() };
    const messages = [welcome];

    // 如果有来自预算计算器或风格测试的数据，自动发起首轮对话
    if (pendingBudget || stylePref) {
      let initText = '';
      if (stylePref) initText += `我做了风格测试，最喜欢${stylePref}风格。`;
      if (pendingBudget) initText += `我的预算大概是${pendingBudget}元。`;
      initText += '能帮我设计一下吗？';

      messages.push({ role: 'user', content: initText, type: 'text', time: this._now() });

      // 清理全局变量
      app.globalData.pendingBudget = null;
      app.globalData.stylePref = null;

      // 自动触发对话
      this.setData({ messages });
      this._startAIChat(initText, messages);
    }

    this.setData({ messages });
  },

  onShow() {
    updateTabBar(this, 0);
  },

  // ====================== 发送消息 ======================

  sendMessage() {
    const text = this.data.inputText.trim();
    if (!text || this.data.sending) return;

    const userMsg = { role: 'user', content: text, type: 'text', time: this._now() };
    const messages = [...this.data.messages, userMsg];
    this.setData({
      messages,
      inputText: '',
      sending: true,
      showFallbackActions: false,
      scrollToView: 'msg-' + (messages.length - 1),
    });

    this._startAIChat(text, messages);
  },

  _startAIChat(text, messages) {
    const { sessionId, extracted } = this.data;

    api.aiChat.chat({
      sessionId: sessionId || undefined,
      message: text,
      role: 'newbie',
    }).then(res => {
      const data = res.data || res;

      // 添加 AI 回复
      const agentMsg = {
        role: 'agent',
        content: data.reply?.content || '',
        type: data.reply?.type || 'text',
        time: this._now(),
      };
      const updated = [...this.data.messages, agentMsg];

      const newExtracted = data.extracted || extracted;
      const newStatus = data.status || 'chatting';

      this.setData({
        messages: updated,
        sending: false,
        sessionId: data.sessionId || this.data.sessionId,
        extracted: newExtracted,
        canGenerateProposal: data.canGenerateProposal || false,
        showFallbackActions: newStatus === 'designing' && !data.canGenerateProposal,
        scrollToView: 'msg-' + (updated.length - 1),
      });

      // AI 回复中提到案例/推荐时，自动插入案例卡片
      const replyContent = data.reply?.content || '';
      if (replyContent.includes('案例') || replyContent.includes('推荐')) {
        this._showCaseCards();
      }

      // 显示需求确认卡片
      if (data.canGenerateProposal && newExtracted) {
        this._showRequirementCard(newExtracted);
      }
    }).catch(err => {
      console.error('AI chat error:', err);
      // 优雅降级
      const fallbackMsg = {
        role: 'agent',
        content: '不好意思，我正在整理思路...能再说说你们对婚礼风格的偏好吗？比如喜欢中式、韩式、森系还是现代风？',
        type: 'text',
        time: this._now(),
      };
      const updated = [...this.data.messages, fallbackMsg];
      this.setData({
        messages: updated,
        sending: false,
        showFallbackActions: true,
        scrollToView: 'msg-' + (updated.length - 1),
      });
    });
  },

  // ====================== 生成方案 ======================

  generateProposal() {
    if (!this.data.sessionId || this.data.sending) return;

    this.setData({ sending: true });

    api.proposalAi.generate({
      sessionId: this.data.sessionId,
    }).then(res => {
      const data = res.data || res;
      // 添加方案消息卡片
      const proposalMsg = {
        role: 'agent',
        content: {
          proposalId: data.proposalId,
          designConcept: data.designConcept,
          totalCost: data.totalCost,
          propCount: (data.propList || []).length,
          timelineCount: (data.timeline || []).length,
        },
        type: 'proposal',
        time: this._now(),
      };
      const updated = [...this.data.messages, proposalMsg];
      this.setData({
        messages: updated,
        sending: false,
        canGenerateProposal: false,
        scrollToView: 'msg-' + (updated.length - 1),
      });
    }).catch(err => {
      console.error('Proposal generation error:', err);
      this.setData({ sending: false });
      wx.showToast({ title: '方案生成失败，请重试', icon: 'none' });
    });
  },

  // ====================== 方案卡片点击 ======================

  viewProposal(e) {
    const proposalId = e.currentTarget.dataset.id;
    if (!proposalId) return;
    wx.navigateTo({ url: '/pages/order-detail/order-detail?proposalId=' + proposalId });
  },

  // ====================== 快捷操作 ======================

  tapSuggestion(e) {
    const text = e.currentTarget.dataset.text;
    this.setData({ inputText: text });
    this.sendMessage();
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  // ====================== 参考案例（内联展示） ======================

  _showCaseCards() {
    const caseMsg = {
      type: 'case_cards',
      cases: FEATURED_CASES,
      time: this._now(),
    };
    const updated = [...this.data.messages, caseMsg];
    this.setData({
      messages: updated,
      scrollToView: 'msg-' + (updated.length - 1),
    });
  },

  showInspiration() {
    this._showCaseCards();
  },

  // ====================== 人工兜底 ======================

  contactHuman() {
    wx.showActionSheet({
      itemList: ['拨打电话', '添加微信', '查看案例', '到店咨询'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.makePhoneCall({ phoneNumber: '13800138000' });
        } else if (res.tapIndex === 1) {
          wx.setClipboardData({
            data: 'DaxiWedding',
            success: () => wx.showToast({ title: '微信号已复制', icon: 'success' }),
          });
        } else if (res.tapIndex === 2) {
          // 查看精选案例
          this._showReferenceCases();
        } else {
          wx.openLocation({
            latitude: 30.5728, longitude: 114.3087,
            name: '大喜的日子·婚礼场景策划',
            address: '武汉市洪山区光谷大道',
          });
        }
      },
    });
  },

  // ====================== 需求确认卡片 ======================

  _showRequirementCard(extracted) {
    if (!extracted || !extracted.style) return;

    const reqMsg = {
      role: 'system',
      content: {
        style: extracted.style,
        budget: extracted.budget,
        guestCount: extracted.guestCount,
        venueType: extracted.venueType,
        preferredColors: extracted.preferredColors,
      },
      type: 'requirement_card',
      time: this._now(),
    };

    // 避免重复添加
    const lastMsg = this.data.messages[this.data.messages.length - 1];
    if (lastMsg && lastMsg.type === 'requirement_card') return;

    const updated = [...this.data.messages, reqMsg];
    this.setData({
      messages: updated,
      scrollToView: 'msg-' + (updated.length - 1),
    });
  },

  // ====================== 参考案例 ======================

  _showReferenceCases() {
    api.cases.list({ featured: true }, null).then(data => {
      if (data && data.list) {
        this.setData({ referenceCases: data.list.slice(0, 3), showCaseRef: true });
      }
    }).catch(() => {
      // demo fallback
      this.setData({
        referenceCases: [
          { id: 'c1', title: '中式雅韵·万达酒店婚礼', style: '新中式', venue: '万达酒店', budgetRange: '10,000-15,000' },
          { id: 'c2', title: '森系秘境·湖滨草坪婚礼', style: '森系', venue: '湖滨酒店', budgetRange: '8,000-12,000' },
          { id: 'c3', title: '韩式简约·香格里拉', style: '韩式', venue: '香格里拉', budgetRange: '15,000-20,000' },
        ],
        showCaseRef: true,
      });
    });
  },

  goCaseDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (id) wx.navigateTo({ url: '/pages/case-detail/case-detail?id=' + id });
  },

  hideCaseRef() {
    this.setData({ showCaseRef: false });
  },

  // ====================== 工具入口 ======================

  goBudgetCalc() {
    wx.navigateTo({ url: '/pages/budget-calc/budget-calc' });
  },

  goChecklist() {
    wx.navigateTo({ url: '/pages/checklist/checklist' });
  },

  // ====================== 历史会话 ======================

  loadHistory() {
    if (this.data.sending) return;
    api.aiChat.sessions({ page: 1, pageSize: 5 }).then(res => {
      const sessions = (res && res.sessions) || [];
      if (sessions.length === 0) {
        wx.showToast({ title: '暂无历史对话', icon: 'none' });
        return;
      }
      const itemList = sessions.map(s => s.title || '未命名会话');
      wx.showActionSheet({
        itemList: itemList.slice(0, 6),
        success: (actionRes) => {
          const session = sessions[actionRes.tapIndex];
          if (session && session.id) {
            this._restoreSession(session.id);
          }
        },
      });
    }).catch(() => {
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  _restoreSession(sessionId) {
    api.aiChat.history({ sessionId }).then(res => {
      const data = res.data || res;
      const messages = (data.messages || []).map(m => ({
        ...m,
        time: m.timestamp ? this._formatTime(new Date(m.timestamp)) : '',
      }));
      this.setData({
        sessionId,
        messages,
        extracted: data.extracted,
        scrollToView: 'msg-' + (messages.length - 1),
      });
    }).catch(() => {
      wx.showToast({ title: '恢复对话失败', icon: 'none' });
    });
  },

  // ====================== 辅助 ======================

  _now() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  },

  _formatTime(d) {
    if (!d || isNaN(d.getTime())) return '';
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  },

  onShareAppMessage() {
    return {
      title: '大喜的日子·AI婚礼设计',
      path: '/pages/home/home',
    };
  },
});
