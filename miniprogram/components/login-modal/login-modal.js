// components/login-modal/login-modal.js
const api = require('../../services/api');

Component({
  options: {
    styleIsolation: 'apply-shared',
  },

  properties: {
    visible: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    avatarUrl: '',
    nickName: '',
    canWechatAuth: false,
    agreed: false,
  },

  methods: {
    onOverlayTap() {
      this.triggerEvent('close');
    },

    stopPropagation() {
      // 阻止事件冒泡到遮罩层
    },

    onSkip() {
      this.triggerEvent('close');
    },

    // 选择头像
    onChooseAvatar(e) {
      if (e.detail.avatarUrl) {
        this.setData({ avatarUrl: e.detail.avatarUrl });
        this.checkCanAuth();
      }
    },

    // 输入昵称
    onNicknameInput(e) {
      if (e.detail.value) {
        this.setData({ nickName: e.detail.value });
        this.checkCanAuth();
      }
    },

    // 昵称输入框失焦
    onNicknameBlur(e) {
      if (e.detail.value) {
        this.setData({ nickName: e.detail.value });
        this.checkCanAuth();
      }
    },

    // 检查是否可以微信授权
    checkCanAuth() {
      const { avatarUrl, nickName } = this.data;
      this.setData({ canWechatAuth: !!(avatarUrl && nickName) });
    },

    // 微信授权登录：使用 chooseAvatar + nickname 方案
    onWechatAuth() {
      if (!this.data.agreed) {
        wx.showToast({ title: '请先同意用户协议', icon: 'none' });
        return;
      }
      const { avatarUrl, nickName } = this.data;
      if (!avatarUrl || !nickName) {
        wx.showToast({ title: '请先获取头像和昵称', icon: 'none' });
        return;
      }

      api.user.update({ nickName, avatarUrl }).then(res => {
        if (res && res.code === 0) {
          const app = getApp();
          const userInfo = app.globalData._silentUserInfo || {};
          app.setUserInfo({ ...userInfo, nickName, avatarUrl });
          wx.showToast({ title: '登录成功', icon: 'success' });
          this.triggerEvent('success', { method: 'wechat' });
        }
      }).catch(() => {
        wx.showToast({ title: '登录失败，请重试', icon: 'none' });
      });
    },

    // 手机号授权登录
    onPhoneAuth(e) {
      if (!this.data.agreed) {
        wx.showToast({ title: '请先同意用户协议', icon: 'none' });
        return;
      }
      if (e.detail.code) {
        wx.cloud.callFunction({
          name: 'user',
          data: { action: 'updatePhone', code: e.detail.code },
        }).then(res => {
          if (res && res.result && res.result.code === 0) {
            const app = getApp();
            const userInfo = app.globalData._silentUserInfo || {};
            const updated = { ...userInfo, phone: res.result.data.phone, phoneVerified: true };
            app.setUserInfo(updated);
            wx.showToast({ title: '登录成功', icon: 'success' });
            this.triggerEvent('success', { method: 'phone' });
          }
        }).catch(() => {
          wx.showToast({ title: '获取手机号失败', icon: 'none' });
        });
      } else {
        wx.showToast({ title: '授权已取消', icon: 'none' });
      }
    },

    // 切换协议勾选
    toggleAgreement() {
      this.setData({ agreed: !this.data.agreed });
    },

    // 显示用户协议
    onShowAgreement() {
      wx.showModal({
        title: '用户协议',
        content: '欢迎使用大喜的日子小程序。使用本服务即表示您同意我们的服务条款。我们致力于为您提供优质的婚礼策划服务。',
        showCancel: false,
        confirmText: '知道了',
      });
    },

    // 显示隐私政策
    onShowPrivacy() {
      wx.showModal({
        title: '隐私政策',
        content: '我们重视您的隐私保护。收集的头像、昵称、手机号等信息仅用于提供婚礼策划服务，不会用于其他用途或泄露给第三方。',
        showCancel: false,
        confirmText: '知道了',
      });
    },
  },
});
