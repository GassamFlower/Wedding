// 婚礼筹备清单 - 12阶段时间线
const STAGES = [
  {
    key: 's1', phase: '12-8个月前', icon: 'ring', title: '定日子 & 定预算',
    items: [
      '选定婚礼日期（建议避开节假日高峰）',
      '确定婚礼总预算范围',
      '初步确定婚礼规模（人数/桌数）',
      '预订婚礼场地/酒店',
      '确定婚礼策划团队',
    ],
    tips: '武汉夏季炎热，建议3-5月或9-11月为最佳婚期。周末酒店档期紧张，至少提前8个月预定。'
  },
  {
    key: 's2', phase: '8-6个月前', icon: 'art', title: '定风格 & 方案',
    items: [
      '与策划师沟通风格偏好',
      '确认婚礼主色调与主题',
      '查看参考案例，确定场景方案',
      '初步确认道具清单',
      '确定花艺方案方向',
    ],
    tips: '可以到我们小程序看看精选案例找灵感，也可以用 AI 设计对话生成方案。'
  },
  {
    key: 's3', phase: '6-4个月前', icon: 'image', title: '婚纱照 & 四大金刚',
    items: [
      '拍摄婚纱照',
      '确定司仪/化妆师/摄影/摄像',
      '确定婚礼当天流程框架',
      '与策划师确认最终场景方案',
      '锁定道具（道具清单签字确认）',
    ],
    tips: '婚纱照建议至少提前4个月拍摄，预留精修和制作周期。'
  },
  {
    key: 's4', phase: '4-3个月前', icon: 'clients', title: '宾客 & 请柬',
    items: [
      '确定宾客名单',
      '设计/定制婚礼请柬',
      '发出请柬（电子+纸质）',
      '确定伴郎伴娘人选',
      '预订外地宾客住宿酒店',
    ],
    tips: '电子请柬可以通过微信小程序制作，方便统计回复。'
  },
  {
    key: 's5', phase: '3-2个月前', icon: 'gift', title: '婚品采购',
    items: [
      '购买婚戒',
      '定制/租借婚纱礼服',
      '购买婚鞋、配饰',
      '购买喜糖、伴手礼',
      '准备接亲游戏道具',
    ],
    tips: '婚纱建议至少提前3个月定制，预留1-2次试穿修改时间。'
  },
  {
    key: 's6', phase: '2-1个月前', icon: 'chat', title: '沟通确认',
    items: [
      '与策划师确认现场搭建方案',
      '与酒店确认菜单、桌数',
      '与司仪沟通婚礼流程',
      '与化妆师试妆',
      '制作婚礼当天时间表',
    ],
    tips: '建议把当天流程打印出来，给伴郎伴娘和双方父母各一份。'
  },
  {
    key: 's7', phase: '1个月-2周前', icon: 'calendar', title: '最终确认',
    items: [
      '与所有供应商最终确认',
      '宾客最终人数统计',
      '排定座位表',
      '婚礼彩排（如有）',
      '准备婚礼当天应急包',
    ],
    tips: '应急包建议准备：针线、别针、创可贴、去渍笔、备用丝袜、充电宝。'
  },
  {
    key: 's8', phase: '1周前', icon: 'check-circle', title: '做最后的准备',
    items: [
      '与策划师确认物料已备齐',
      '美容/美甲/理发',
      '确认婚礼当天分工（伴郎伴娘任务）',
      '准备誓言/致辞稿',
      '把婚礼费用尾款准备好',
    ],
    tips: '提前一周尽量不要做大改变（染发/护肤），避免不适应。'
  },
  {
    key: 's9', phase: '倒数1-2天', icon: 'gift', title: '交付 & 布置',
    items: [
      '婚礼道具进场搭建',
      '花艺布置',
      '灯光音响调试',
      '确认所有装饰到位',
      '彩排走位',
    ],
    tips: '策划师团队会全程跟进搭建，新人可以在家好好休息。'
  },
  {
    key: 's10', phase: '大喜之日', icon: 'celebration', title: '婚礼当天',
    items: [
      '早起化妆（至少提前3小时）',
      '接亲/迎亲',
      '外景拍摄（如天气允许）',
      '仪式 & 宴会',
      '享受你的大喜日子！',
    ],
    tips: '记住：这一天最重要的是享受！其他的交给策划师团队。'
  },
  {
    key: 's11', phase: '婚礼后', icon: 'star', title: '收尾 & 回忆',
    items: [
      '归还租赁道具',
      '结算尾款',
      '整理婚礼照片/视频',
      '写评价 & 推荐给朋友',
      '收拾蜜月行李出发！',
    ],
    tips: '如果对服务满意，帮我们推荐给身边的朋友哦～转介绍有奖励。'
  },
];

Page({
  data: {
    stages: [],
    totalItems: 0,
    checkedCount: 0,
    overallPct: 0,
  },

  onLoad() {
    this.initChecklist();
  },

  initChecklist() {
    const saved = wx.getStorageSync('checklist_progress') || {};
    let totalItems = 0, checkedCount = 0;
    
    const stages = STAGES.map(stage => {
      const items = stage.items.map((text, i) => {
        const id = stage.key + '_' + i;
        const checked = !!saved[id];
        if (checked) checkedCount++;
        totalItems++;
        return { id, text, checked };
      });
      const stageChecked = items.every(i => i.checked);
      const stagePct = Math.round(items.filter(i => i.checked).length / items.length * 100);
      return { ...stage, items, stageChecked, stagePct };
    });

    this.setData({
      stages,
      totalItems,
      checkedCount,
      overallPct: totalItems > 0 ? Math.round(checkedCount / totalItems * 100) : 0,
    });
  },

  toggleItem(e) {
    const { id, stageIdx } = e.currentTarget.dataset;
    const saved = wx.getStorageSync('checklist_progress') || {};
    saved[id] = !saved[id];
    wx.setStorageSync('checklist_progress', saved);
    
    // 局部更新
    const stages = this.data.stages;
    const stage = stages[stageIdx];
    const itemIdx = stage.items.findIndex(i => i.id === id);
    if (itemIdx >= 0) {
      stage.items[itemIdx].checked = saved[id];
      stage.stageChecked = stage.items.every(i => i.checked);
      stage.stagePct = Math.round(stage.items.filter(i => i.checked).length / stage.items.length * 100);
    }
    
    let total = 0, checked = 0;
    stages.forEach(s => {
      s.items.forEach(i => { total++; if (i.checked) checked++; });
    });
    
    this.setData({
      stages,
      checkedCount: checked,
      overallPct: Math.round(checked / total * 100),
    });
  },

  resetAll() {
    wx.showModal({
      title: '重置清单',
      content: '确定要重置所有筹备进度吗？此操作不可撤销。',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('checklist_progress');
          this.initChecklist();
        }
      }
    });
  },

  goContact() {
    wx.switchTab({ url: '/pages/home/home' });
  },

  onShareAppMessage() {
    return { title: '婚礼筹备清单 · 大喜的日子', path: '/pages/checklist/checklist' };
  },
});
