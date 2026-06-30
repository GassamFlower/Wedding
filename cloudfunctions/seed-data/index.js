// 云函数：seed-data - 初始化演示数据
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

function ok(d) { return { code: 0, data: d, _meta: { timestamp: new Date().toISOString() } }; }
function fail(m) { return { code: -1, msg: m || '操作失败', _meta: { timestamp: new Date().toISOString() } }; }

exports.main = async (event) => {
  const { action } = event;
  
  try {
    switch (action) {
      case 'initAll':
        return await initAll();
      case 'initCases':
        return await initCases();
      case 'initProps':
        return await initProps();
      case 'initHotels':
        return await initHotels();
      case 'initKnowledge':
        return await initKnowledge();
      case 'clearAll':
        return await clearAll();
      default:
        return fail('未知操作: ' + action);
    }
  } catch (err) {
    return fail(err.message || String(err));
  }
};

// 初始化所有数据
async function initAll() {
  const cases = await initCases();
  const props = await initProps();
  const hotels = await initHotels();
  const knowledge = await initKnowledge();
  
  return ok({
    cases: cases.data,
    props: props.data,
    hotels: hotels.data,
    knowledge: knowledge.data,
  });
}

// 初始化案例数据
async function initCases() {
  const cases = [
    {
      caseTitle: '新中式雅韵·万达酒店婚礼',
      clientName: '张先生 & 李女士',
      style: '新中式',
      venueType: '酒店宴会厅',
      venue: '武汉万达酒店',
      budget: 15000,
      isCase: true,
      isFeatured: true,
      caseImages: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
      ],
      caseDescription: '以传统中式元素为基调，融入现代审美，打造温馨典雅的婚礼场景。红色与金色的主调象征着喜庆与繁荣，梅花与竹节的搭配展现了东方美学的精髓。',
      caseDesignNotes: '设计理念：传承与创新并存，用现代手法诠释传统美学',
      clientReview: '非常满意！策划师很专业，现场效果比预期还要好！',
      clientRating: 5,
      sortOrder: 1,
      createdAt: db.serverDate(),
    },
    {
      caseTitle: '森系秘境·湖滨草坪婚礼',
      clientName: '王先生 & 陈女士',
      style: '森系',
      venueType: '户外草坪',
      venue: '武汉湖滨酒店',
      budget: 12000,
      isCase: true,
      isFeatured: true,
      caseImages: [
        'https://images.unsplash.com/photo-1464366400600-71683b76299c?w=800',
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
      ],
      caseDescription: '以自然为主题，利用草坪的自然优势，搭配鲜花拱门和木质装饰，营造浪漫温馨的户外婚礼氛围。',
      caseDesignNotes: '设计理念：回归自然，让爱情在绿意盎然中绽放',
      clientReview: '梦想中的草坪婚礼实现了！感谢团队！',
      clientRating: 5,
      sortOrder: 2,
      createdAt: db.serverDate(),
    },
    {
      caseTitle: '韩式简约·香格里拉婚礼',
      clientName: '刘先生 & 杨女士',
      style: '韩式',
      venueType: '酒店宴会厅',
      venue: '武汉香格里拉酒店',
      budget: 18000,
      isCase: true,
      isFeatured: true,
      caseImages: [
        'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
        'https://images.unsplash.com/photo-1525772764200-be829a350797?w=800',
      ],
      caseDescription: '简约而不简单的韩式风格，以白色和粉色为主调，搭配精致花艺和灯光效果，打造浪漫唯美的婚礼场景。',
      caseDesignNotes: '设计理念：简约美学，让爱情成为最耀眼的风景',
      clientReview: '太美了！朋友们都说好看！',
      clientRating: 5,
      sortOrder: 3,
      createdAt: db.serverDate(),
    },
    {
      caseTitle: '欧式浪漫·花园婚礼',
      clientName: '赵先生 & 黄女士',
      style: '欧式',
      venueType: '户外花园',
      venue: '武汉光谷凯悦酒店',
      budget: 20000,
      isCase: true,
      isFeatured: true,
      caseImages: [
        'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=800',
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
      ],
      caseDescription: '欧式古典风格，以白色玫瑰和绿色植物为主，搭配水晶灯和欧式拱门，营造浪漫优雅的氛围。',
      caseDesignNotes: '设计理念：古典与现代的完美结合',
      clientReview: '非常专业，现场效果超出预期！',
      clientRating: 5,
      sortOrder: 4,
      createdAt: db.serverDate(),
    },
    {
      caseTitle: '现代简约·艺术空间婚礼',
      clientName: '孙先生 & 周女士',
      style: '现代',
      venueType: '艺术空间',
      venue: '武汉艺术空间',
      budget: 16000,
      isCase: true,
      isFeatured: true,
      caseImages: [
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
        'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
      ],
      caseDescription: '现代简约风格，利用艺术空间的独特结构，搭配几何装饰和灯光效果，打造时尚前卫的婚礼场景。',
      caseDesignNotes: '设计理念：用现代语言讲述爱情故事',
      clientReview: '很有创意，朋友们都很喜欢！',
      clientRating: 5,
      sortOrder: 5,
      createdAt: db.serverDate(),
    },
  ];

  // 批量插入
  const tasks = cases.map(c => db.collection('orders').add({ data: c }));
  const results = await Promise.all(tasks);
  
  return ok({ inserted: results.length, ids: results.map(r => r._id) });
}

// 初始化道具数据
async function initProps() {
  const props = [
    { name: '梅花背景架', category: '背景', quantity: 5, unit: '套', unitCost: 200, source: '自有', status: '在库' },
    { name: '金色竹节柱', category: '立柱', quantity: 20, unit: '根', unitCost: 50, source: '自有', status: '在库' },
    { name: '红色地毯', category: '地毯', quantity: 10, unit: '卷', unitCost: 150, source: '自有', status: '在库' },
    { name: '中式屏风', category: '装饰', quantity: 8, unit: '扇', unitCost: 180, source: '自有', status: '在库' },
    { name: '水晶吊灯', category: '灯光', quantity: 6, unit: '组', unitCost: 300, source: '自有', status: '在库' },
    { name: 'LED灯带', category: '灯光', quantity: 50, unit: '米', unitCost: 20, source: '自有', status: '在库' },
    { name: '鲜花拱门', category: '花艺', quantity: 3, unit: '个', unitCost: 500, source: '外租', status: '在库' },
    { name: '路引花', category: '花艺', quantity: 20, unit: '个', unitCost: 80, source: '外租', status: '在库' },
    { name: '桌花', category: '花艺', quantity: 30, unit: '个', unitCost: 120, source: '外租', status: '在库' },
    { name: '手捧花', category: '花艺', quantity: 5, unit: '束', unitCost: 300, source: '外租', status: '在库' },
    { name: '胸花', category: '花艺', quantity: 50, unit: '个', unitCost: 30, source: '外租', status: '在库' },
    { name: '音响设备', category: '灯光', quantity: 2, unit: '套', unitCost: 800, source: '外租', status: '在库' },
    { name: '追光灯', category: '灯光', quantity: 4, unit: '台', unitCost: 200, source: '自有', status: '在库' },
    { name: '投影仪', category: '灯光', quantity: 2, unit: '台', unitCost: 500, source: '外租', status: '在库' },
    { name: '签到台', category: '家具', quantity: 3, unit: '套', unitCost: 300, source: '自有', status: '在库' },
    { name: '迎宾牌', category: '装饰', quantity: 5, unit: '个', unitCost: 150, source: '自有', status: '在库' },
    { name: '座位卡', category: '装饰', quantity: 100, unit: '个', unitCost: 10, source: '自有', status: '在库' },
    { name: '菜单卡', category: '装饰', quantity: 100, unit: '个', unitCost: 8, source: '自有', status: '在库' },
    { name: '烛台', category: '装饰', quantity: 20, unit: '个', unitCost: 50, source: '自有', status: '在库' },
    { name: '蜡烛', category: '装饰', quantity: 100, unit: '个', unitCost: 5, source: '自有', status: '在库' },
    { name: '酒杯', category: '餐具', quantity: 50, unit: '个', unitCost: 20, source: '自有', status: '在库' },
    { name: '香槟塔', category: '餐具', quantity: 3, unit: '套', unitCost: 200, source: '自有', status: '在库' },
    { name: '蛋糕架', category: '餐具', quantity: 5, unit: '个', unitCost: 100, source: '自有', status: '在库' },
    { name: '红玫瑰', category: '花材', quantity: 500, unit: '支', unitCost: 3, source: '采购', status: '在库' },
    { name: '白玫瑰', category: '花材', quantity: 300, unit: '支', unitCost: 3, source: '采购', status: '在库' },
    { name: '粉色绣球', category: '花材', quantity: 50, unit: '个', unitCost: 15, source: '采购', status: '在库' },
    { name: '金色绣球', category: '花材', quantity: 50, unit: '个', unitCost: 15, source: '采购', status: '在库' },
    { name: '满天星', category: '花材', quantity: 100, unit: '束', unitCost: 10, source: '采购', status: '在库' },
    { name: '尤加利叶', category: '花材', quantity: 50, unit: '束', unitCost: 12, source: '采购', status: '在库' },
    { name: '龟背叶', category: '花材', quantity: 30, unit: '束', unitCost: 15, source: '采购', status: '在库' },
  ];

  const tasks = props.map(p => db.collection('props').add({ 
    data: { ...p, createdAt: db.serverDate() } 
  }));
  const results = await Promise.all(tasks);
  
  return ok({ inserted: results.length });
}

// 初始化酒店数据
async function initHotels() {
  const hotels = [
    {
      name: '武汉万达酒店',
      address: '武汉市江汉区解放大道688号',
      contactPerson: '李经理',
      contactPhone: '13800138001',
      venueType: '酒店宴会厅',
      capacity: 30,
      deposit: 3000,
      priceRange: '5000-20000',
      features: ['无柱大厅', 'LED屏幕', '音响设备齐全'],
      description: '五星级酒店，拥有800平米无柱大厅，可容纳30桌',
      createdAt: db.serverDate(),
    },
    {
      name: '武汉湖滨酒店',
      address: '武汉市武昌区东湖路168号',
      contactPerson: '王经理',
      contactPhone: '13800138002',
      venueType: '户外草坪',
      capacity: 20,
      deposit: 2000,
      priceRange: '4000-15000',
      features: ['湖景草坪', '花园仪式区', '室内备选方案'],
      description: '东湖畔度假酒店，拥有800平米草坪，适合户外婚礼',
      createdAt: db.serverDate(),
    },
    {
      name: '武汉香格里拉酒店',
      address: '武汉市江汉区建设大道700号',
      contactPerson: '张经理',
      contactPhone: '13800138003',
      venueType: '酒店宴会厅',
      capacity: 25,
      deposit: 5000,
      priceRange: '8000-30000',
      features: ['豪华宴会厅', '专业灯光', '五星级服务'],
      description: '国际五星级酒店，拥有多个豪华宴会厅',
      createdAt: db.serverDate(),
    },
    {
      name: '武汉光谷凯悦酒店',
      address: '武汉市洪山区珞喻路768号',
      contactPerson: '陈经理',
      contactPhone: '13800138004',
      venueType: '户外花园',
      capacity: 22,
      deposit: 3000,
      priceRange: '6000-25000',
      features: ['花园仪式区', '玻璃阳光房', '现代设施'],
      description: '现代化酒店，拥有美丽的花园和阳光房',
      createdAt: db.serverDate(),
    },
    {
      name: '武汉艺术空间',
      address: '武汉市武昌区中北路100号',
      contactPerson: '刘经理',
      contactPhone: '13800138005',
      venueType: '艺术空间',
      capacity: 15,
      deposit: 2000,
      priceRange: '5000-18000',
      features: ['工业风', '挑高空间', '艺术氛围'],
      description: '独特的艺术空间，适合追求个性的新人',
      createdAt: db.serverDate(),
    },
  ];

  const tasks = hotels.map(h => db.collection('hotels').add({ data: h }));
  const results = await Promise.all(tasks);
  
  return ok({ inserted: results.length });
}

// 初始化知识库数据
async function initKnowledge() {
  const knowledge = [
    {
      title: '新中式婚礼风格介绍',
      content: '新中式婚礼是将传统中式元素与现代审美相结合的婚礼风格。主要特点包括：红色与金色的主调、梅花竹节等传统元素、中式屏风与拱门、红色地毯等。适合喜欢传统文化又追求现代感的新人。',
      tags: ['新中式', '风格', '传统'],
      category: '风格介绍',
      createdAt: db.serverDate(),
    },
    {
      title: '森系婚礼风格介绍',
      content: '森系婚礼以自然为主题，通常在户外草坪或花园举行。主要特点包括：鲜花拱门、木质装饰、绿色植物、自然光线等。适合热爱自然、追求浪漫氛围的新人。',
      tags: ['森系', '户外', '自然'],
      category: '风格介绍',
      createdAt: db.serverDate(),
    },
    {
      title: '韩式婚礼风格介绍',
      content: '韩式婚礼以简约浪漫为特点，通常以白色和粉色为主调。主要特点包括：精致花艺、柔和灯光、简约装饰、唯美氛围等。适合喜欢简约浪漫风格的新人。',
      tags: ['韩式', '简约', '浪漫'],
      category: '风格介绍',
      createdAt: db.serverDate(),
    },
    {
      title: '婚礼预算规划指南',
      content: '婚礼预算通常包括：场地费用(30-40%)、策划布置(30-40%)、婚纱摄影(10-15%)、婚宴酒席(20-30%)、其他杂费(5-10%)。建议提前6-12个月开始规划，预留10-15%的应急资金。',
      tags: ['预算', '规划', '费用'],
      category: '筹备指南',
      createdAt: db.serverDate(),
    },
    {
      title: '婚礼筹备时间线',
      content: '婚礼筹备建议时间线：12个月前确定预算和日期；10个月前选定策划师和场地；8个月前确定风格和方案；6个月前发送请柬；3个月前确认细节；1个月前最终确认；婚礼前一周彩排。',
      tags: ['时间线', '筹备', '流程'],
      category: '筹备指南',
      createdAt: db.serverDate(),
    },
    {
      title: '户外婚礼注意事项',
      content: '户外婚礼需要注意：1.天气预案（准备室内备选方案）；2.防蚊虫措施；3.防晒或保暖；4.场地电力供应；5.交通便利性；6.音响设备要求。建议选择春秋季节，避开雨季和极端天气。',
      tags: ['户外', '注意事项', '天气'],
      category: '注意事项',
      createdAt: db.serverDate(),
    },
    {
      title: '武汉热门婚礼场地推荐',
      content: '武汉热门婚礼场地：1.万达酒店（江汉区，无柱大厅）；2.湖滨酒店（武昌区，湖景草坪）；3.香格里拉酒店（江汉区，豪华宴会厅）；4.光谷凯悦酒店（洪山区，花园场地）；5.艺术空间（武昌区，工业风格）。',
      tags: ['武汉', '场地', '推荐'],
      category: '场地推荐',
      createdAt: db.serverDate(),
    },
    {
      title: '婚礼花艺选择指南',
      content: '婚礼常用花材：玫瑰（经典浪漫）、绣球（饱满温馨）、满天星（浪漫梦幻）、尤加利叶（自然清新）、百合（纯洁高雅）。建议根据婚礼风格和季节选择，春季可选郁金香，夏季可选绣球，秋季可选大丽花，冬季可选梅花。',
      tags: ['花艺', '花材', '选择'],
      category: '筹备指南',
      createdAt: db.serverDate(),
    },
  ];

  const tasks = knowledge.map(k => db.collection('knowledge').add({ data: k }));
  const results = await Promise.all(tasks);
  
  return ok({ inserted: results.length });
}

// 清除所有演示数据
async function clearAll() {
  const collections = ['orders', 'props', 'hotels', 'knowledge'];
  const results = {};
  
  for (const coll of collections) {
    const res = await db.collection(coll).where({}).remove();
    results[coll] = res.stats.removed;
  }
  
  return ok(results);
}
