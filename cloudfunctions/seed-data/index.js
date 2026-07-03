// 云函数：seed-data - 初始化演示数据（仅开发/调试用）
// 安全策略：
//   1. 默认跳过已有数据的集合，不覆盖
//   2. 传 force: true 才强制重新初始化
//   3. clearAll 需要传 confirm: true 二次确认
//   4. 所有数据使用调用者的 openid，确保可见
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

function ok(d) { return { code: 0, data: d, _meta: { timestamp: new Date().toISOString() } }; }
function fail(m) { return { code: -1, msg: m || '操作失败', _meta: { timestamp: new Date().toISOString() } }; }

exports.main = async (event) => {
  const { action, force, confirm, openid: customOpenid } = event;
  let { OPENID } = cloud.getWXContext();
  
  // 支持从云开发控制台测试时传入自定义 openid
  if (!OPENID && customOpenid) {
    OPENID = customOpenid;
    console.log('[seed-data] using custom openid from event:', OPENID);
  }
  
  if (!OPENID) {
    return fail('无法获取用户身份。请从小程序调用，或传入 openid 参数用于测试');
  }
  
  console.log('[seed-data] caller openid:', OPENID);

  try {
    // 检查必要的集合是否存在
    const requiredCollections = ['orders', 'clients', 'props', 'hotels', 'knowledge', 'todos', 'contracts', 'leads'];
    const missingCollections = await checkCollections(requiredCollections);
    
    if (missingCollections.length > 0 && action !== 'clearAll') {
      return fail(`以下集合不存在，请先在云开发控制台创建：${missingCollections.join(', ')}。创建后重试。`);
    }

    switch (action) {
      case 'initAll':
        return await initAll(OPENID, force === true);
      case 'initCases':
        return await initCases(OPENID, force === true);
      case 'initProps':
        return await initProps(OPENID, force === true);
      case 'initHotels':
        return await initHotels(OPENID, force === true);
      case 'initClients':
        return await initClients(OPENID, force === true);
      case 'initKnowledge':
        return await initKnowledge(OPENID, force === true);
      case 'clearAll':
        if (confirm !== true) return fail('危险操作！需传 confirm: true 确认');
        return await clearAll();
      default:
        return fail('未知操作: ' + action);
    }
  } catch (err) {
    console.error('[seed-data] error:', err);
    return fail(err.message || String(err));
  }
};

// 检查集合是否存在
async function checkCollections(collectionNames) {
  const missing = [];
  for (const name of collectionNames) {
    try {
      await db.collection(name).limit(1).get();
    } catch (e) {
      if (e.errCode === -502005 || (e.message && e.message.includes('not exist'))) {
        missing.push(name);
      }
    }
  }
  return missing;
}

// 检查集合是否已有数据
async function collectionHasData(collectionName) {
  try {
    const res = await db.collection(collectionName).limit(1).get();
    return res.data && res.data.length > 0;
  } catch (e) {
    if (e.errCode === -502005 || (e.message && e.message.includes('not exist'))) {
      return false;
    }
    throw e;
  }
}

async function initAll(openid, force) {
  const results = {};
  results.clients = await initClients(openid, force);
  results.cases = await initCases(openid, force);
  results.props = await initProps(openid, force);
  results.hotels = await initHotels(openid, force);
  results.knowledge = await initKnowledge(openid, force);
  results.todos = await initTodos(openid, force);
  results.contracts = await initContracts(openid, force);
  results.leads = await initLeads(openid, force);
  return ok(results);
}

async function initCases(openid, force) {
  const hasData = await collectionHasData('orders');
  if (hasData && !force) {
    return { skipped: true, reason: 'orders 集合已有数据，跳过。传 force:true 强制覆盖' };
  }

  const now = new Date();
  const cases = [
    {
      clientName: '张先生 & 李女士',
      style: '新中式',
      venueType: '酒店宴会厅',
      venue: '武汉万达酒店',
      budget: 15000,
      paid: 7200,
      balance: 7800,
      status: '筹备中',
      weddingDate: new Date('2026-06-15'),
      isCase: true,
      isFeatured: true,
      caseImages: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
      ],
      caseDescription: '以传统中式元素为基调，融入现代审美，打造温馨典雅的婚礼场景。',
      sortOrder: 1,
      _openid: openid,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      clientName: '王先生 & 陈女士',
      style: '森系',
      venueType: '户外草坪',
      venue: '武汉湖滨酒店',
      budget: 12000,
      paid: 4000,
      balance: 8000,
      status: '花艺筹备',
      weddingDate: new Date('2026-06-28'),
      isCase: true,
      isFeatured: true,
      caseImages: [
        'https://images.unsplash.com/photo-1464366400600-71683b76299c?w=800',
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
      ],
      caseDescription: '以自然为主题，利用草坪的自然优势，搭配鲜花拱门和木质装饰。',
      sortOrder: 2,
      _openid: openid,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      clientName: '刘先生 & 杨女士',
      style: '韩式',
      venueType: '酒店宴会厅',
      venue: '武汉香格里拉酒店',
      budget: 18000,
      paid: 12000,
      balance: 6000,
      status: '准备就绪',
      weddingDate: new Date('2026-07-08'),
      isCase: true,
      isFeatured: true,
      caseImages: [
        'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
        'https://images.unsplash.com/photo-1525772764200-be829a350797?w=800',
      ],
      caseDescription: '简约而不简单的韩式风格，以白色和粉色为主调。',
      sortOrder: 3,
      _openid: openid,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      clientName: '赵先生 & 黄女士',
      style: '欧式',
      venueType: '户外花园',
      venue: '武汉光谷凯悦酒店',
      budget: 20000,
      paid: 20000,
      balance: 0,
      status: '已完成',
      weddingDate: new Date('2026-05-10'),
      isCase: true,
      isFeatured: true,
      caseImages: [
        'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=800',
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
      ],
      caseDescription: '欧式古典风格，以白色玫瑰和绿色植物为主。',
      sortOrder: 4,
      _openid: openid,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      clientName: '孙先生 & 周女士',
      style: '现代',
      venueType: '艺术空间',
      venue: '武汉艺术空间',
      budget: 16000,
      paid: 5000,
      balance: 11000,
      status: '方案确认',
      weddingDate: new Date('2026-08-02'),
      isCase: true,
      isFeatured: true,
      caseImages: [
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
        'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
      ],
      caseDescription: '现代简约风格，利用艺术空间的独特结构。',
      sortOrder: 5,
      _openid: openid,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const tasks = cases.map(c => db.collection('orders').add({ data: { ...c, isSeed: true } }));
  const results = await Promise.all(tasks);
  console.log('[seed-data] initCases:', results.length, 'records inserted');
  return { inserted: results.length };
}

async function initProps(openid, force) {
  const hasData = await collectionHasData('props');
  if (hasData && !force) {
    return { skipped: true, reason: 'props 集合已有数据，跳过。传 force:true 强制覆盖' };
  }

  const now = new Date();
  const props = [
    { name: '梅花背景架', category: 'bg', total: 5, inUse: 0, available: 5, unit: '套', notes: '', status: '闲置' },
    { name: '金色竹节柱', category: 'bg', total: 20, inUse: 5, available: 15, unit: '根', notes: '', status: '在库' },
    { name: '红色地毯', category: 'deco', total: 10, inUse: 2, available: 8, unit: '卷', notes: '', status: '在库' },
    { name: '中式屏风', category: 'deco', total: 8, inUse: 3, available: 5, unit: '扇', notes: '', status: '在库' },
    { name: '水晶吊灯', category: 'light', total: 6, inUse: 4, available: 2, unit: '组', notes: '', status: '在库' },
    { name: 'LED灯带', category: 'light', total: 50, inUse: 20, available: 30, unit: '米', notes: '', status: '在库' },
    { name: '鲜花拱门', category: 'flower', total: 3, inUse: 1, available: 2, unit: '个', notes: '', status: '在库' },
    { name: '路引花', category: 'flower', total: 20, inUse: 8, available: 12, unit: '个', notes: '', status: '在库' },
    { name: '桌花', category: 'flower', total: 30, inUse: 10, available: 20, unit: '个', notes: '', status: '在库' },
    { name: '手捧花', category: 'flower', total: 5, inUse: 2, available: 3, unit: '束', notes: '', status: '在库' },
    { name: '音响设备', category: 'light', total: 2, inUse: 1, available: 1, unit: '套', notes: '', status: '在库' },
    { name: '追光灯', category: 'light', total: 4, inUse: 2, available: 2, unit: '台', notes: '', status: '在库' },
    { name: '签到台', category: 'furniture', total: 3, inUse: 1, available: 2, unit: '套', notes: '', status: '在库' },
    { name: '红玫瑰', category: 'flower', total: 500, inUse: 200, available: 300, unit: '支', notes: '', status: '在库' },
    { name: '白玫瑰', category: 'flower', total: 300, inUse: 100, available: 200, unit: '支', notes: '', status: '在库' },
    { name: '粉色绣球', category: 'flower', total: 50, inUse: 20, available: 30, unit: '个', notes: '', status: '在库' },
    { name: '满天星', category: 'flower', total: 100, inUse: 30, available: 70, unit: '束', notes: '', status: '在库' },
  ];

  const tasks = props.map(p => db.collection('props').add({
    data: { ...p, _openid: openid, isSeed: true, isDeleted: false, createdAt: now, updatedAt: now }
  }));
  const results = await Promise.all(tasks);
  console.log('[seed-data] initProps:', results.length, 'records inserted');
  return { inserted: results.length };
}

async function initHotels(openid, force) {
  const hasData = await collectionHasData('hotels');
  if (hasData && !force) {
    return { skipped: true, reason: 'hotels 集合已有数据，跳过。传 force:true 强制覆盖' };
  }

  const now = new Date();
  const hotels = [
    { name: '武汉万达酒店', address: '武汉市江汉区解放大道688号', contactPerson: '李经理', contactPhone: '13800138001', venueType: '酒店宴会厅', capacity: 30, deposit: 3000, priceRange: '5000-20000', features: ['无柱大厅', 'LED屏幕'], description: '五星级酒店，800平米无柱大厅', _openid: openid, isDeleted: false, createdAt: now, updatedAt: now },
    { name: '武汉湖滨酒店', address: '武汉市武昌区东湖路168号', contactPerson: '王经理', contactPhone: '13800138002', venueType: '户外草坪', capacity: 20, deposit: 2000, priceRange: '4000-15000', features: ['湖景草坪', '花园仪式区'], description: '东湖畔度假酒店', _openid: openid, isDeleted: false, createdAt: now, updatedAt: now },
    { name: '武汉香格里拉酒店', address: '武汉市江汉区建设大道700号', contactPerson: '张经理', contactPhone: '13800138003', venueType: '酒店宴会厅', capacity: 25, deposit: 5000, priceRange: '8000-30000', features: ['豪华宴会厅', '专业灯光'], description: '国际五星级酒店', _openid: openid, isDeleted: false, createdAt: now, updatedAt: now },
    { name: '武汉光谷凯悦酒店', address: '武汉市洪山区珞喻路768号', contactPerson: '陈经理', contactPhone: '13800138004', venueType: '户外花园', capacity: 22, deposit: 3000, priceRange: '6000-25000', features: ['花园仪式区', '玻璃阳光房'], description: '现代化酒店', _openid: openid, isDeleted: false, createdAt: now, updatedAt: now },
  ];

  const tasks = hotels.map(h => db.collection('hotels').add({ data: { ...h, isSeed: true } }));
  const results = await Promise.all(tasks);
  console.log('[seed-data] initHotels:', results.length, 'records inserted');
  return { inserted: results.length };
}

async function initKnowledge(openid, force) {
  const hasData = await collectionHasData('knowledge');
  if (hasData && !force) {
    return { skipped: true, reason: 'knowledge 集合已有数据，跳过。传 force:true 强制覆盖' };
  }

  const now = new Date();
  const knowledge = [
    { title: '新中式婚礼风格介绍', content: '新中式婚礼是将传统中式元素与现代审美相结合的婚礼风格。', tags: ['新中式', '风格'], category: '风格介绍', _openid: openid, createdAt: now },
    { title: '森系婚礼风格介绍', content: '森系婚礼以自然为主题，通常在户外草坪或花园举行。', tags: ['森系', '户外'], category: '风格介绍', _openid: openid, createdAt: now },
    { title: '韩式婚礼风格介绍', content: '韩式婚礼以简约浪漫为特点，通常以白色和粉色为主调。', tags: ['韩式', '简约'], category: '风格介绍', _openid: openid, createdAt: now },
    { title: '婚礼预算规划指南', content: '婚礼预算通常包括：场地费用(30-40%)、策划布置(30-40%)、婚纱摄影(10-15%)、婚宴酒席(20-30%)。', tags: ['预算', '规划'], category: '筹备指南', _openid: openid, createdAt: now },
    { title: '婚礼筹备时间线', content: '12个月前确定预算和日期；10个月前选定策划师和场地；8个月前确定风格和方案。', tags: ['时间线', '筹备'], category: '筹备指南', _openid: openid, createdAt: now },
  ];

  const tasks = knowledge.map(k => db.collection('knowledge').add({ data: { ...k, isSeed: true } }));
  const results = await Promise.all(tasks);
  console.log('[seed-data] initKnowledge:', results.length, 'records inserted');
  return { inserted: results.length };
}

async function initClients(openid, force) {
  const hasData = await collectionHasData('clients');
  if (hasData && !force) {
    return { skipped: true, reason: 'clients 集合已有数据，跳过。传 force:true 强制覆盖' };
  }

  const now = new Date();
  const clients = [
    {
      name: '张先生 & 李女士',
      phone: '13812345678',
      wechat: 'zhang_li_2026',
      source: '朋友介绍',
      status: 'active',
      tags: ['新中式', '高预算'],
      remark: '偏好传统中式风格，预算充足',
      orderCount: 1,
      totalBudget: 15000,
      _openid: openid,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: '王先生 & 赵女士',
      phone: '13956781234',
      wechat: 'wang_zhao_wedding',
      source: '线上咨询',
      status: 'active',
      tags: ['森系', '户外'],
      remark: '喜欢自然风格，希望户外草坪婚礼',
      orderCount: 1,
      totalBudget: 12000,
      _openid: openid,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: '刘先生 & 陈女士',
      phone: '13690123456',
      wechat: 'liu_chen_2026',
      source: '展会获客',
      status: 'active',
      tags: ['韩式', '简约'],
      remark: '偏好简约韩式风格，白色粉色为主',
      orderCount: 1,
      totalBudget: 18000,
      _openid: openid,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: '赵先生 & 黄女士',
      phone: '13734567890',
      wechat: 'zhao_huang_wedding',
      source: '老客户转介',
      status: 'done',
      tags: ['欧式', '已完成'],
      remark: '欧式古典风格，已圆满完成',
      orderCount: 1,
      totalBudget: 20000,
      _openid: openid,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const tasks = clients.map(c => db.collection('clients').add({ data: c }));
  const results = await Promise.all(tasks);
  console.log('[seed-data] initClients:', results.length, 'records inserted');
  return { inserted: results.length };
}

async function initTodos(openid, force) {
  const hasData = await collectionHasData('todos');
  if (hasData && !force) {
    return { skipped: true, reason: 'todos 集合已有数据，跳过。传 force:true 强制覆盖' };
  }

  const now = new Date();
  const todos = [
    { text: '确认王先生婚礼花艺方案', time: '今日', done: false, priority: '高', scene: 'dashboard', _openid: openid, isDeleted: false, createdAt: now, updatedAt: now },
    { text: '联系酒店确认押金退还', time: '明日', done: false, priority: '中', scene: 'dashboard', _openid: openid, isDeleted: false, createdAt: now, updatedAt: now },
    { text: '补充道具库存清单', time: '本周', done: false, priority: '中', scene: 'dashboard', _openid: openid, isDeleted: false, createdAt: now, updatedAt: now },
    { text: '跟进刘先生合同签署', time: '今日', done: false, priority: '高', scene: 'dashboard', _openid: openid, isDeleted: false, createdAt: now, updatedAt: now },
    { text: '安排赵先生场地踩点', time: '明日', done: false, priority: '中', scene: 'dashboard', _openid: openid, isDeleted: false, createdAt: now, updatedAt: now },
  ];

  const tasks = todos.map(t => db.collection('todos').add({ data: t }));
  const results = await Promise.all(tasks);
  console.log('[seed-data] initTodos:', results.length, 'records inserted');
  return { inserted: results.length };
}

async function initContracts(openid, force) {
  const hasData = await collectionHasData('contracts');
  if (hasData && !force) {
    return { skipped: true, reason: 'contracts 集合已有数据，跳过。传 force:true 强制覆盖' };
  }

  const now = new Date();
  const contracts = [
    {
      clientName: '张先生 & 李女士',
      contractNo: 'HT-2026-001',
      totalAmount: 15000,
      paidAmount: 7200,
      balanceAmount: 7800,
      paymentStatus: '部分付款',
      signDate: new Date('2026-03-15'),
      weddingDate: new Date('2026-06-15'),
      status: '执行中',
      _openid: openid, isDeleted: false, createdAt: now, updatedAt: now,
    },
    {
      clientName: '王先生 & 陈女士',
      contractNo: 'HT-2026-002',
      totalAmount: 12000,
      paidAmount: 4000,
      balanceAmount: 8000,
      paymentStatus: '部分付款',
      signDate: new Date('2026-03-20'),
      weddingDate: new Date('2026-06-28'),
      status: '执行中',
      _openid: openid, isDeleted: false, createdAt: now, updatedAt: now,
    },
    {
      clientName: '刘先生 & 杨女士',
      contractNo: 'HT-2026-003',
      totalAmount: 18000,
      paidAmount: 18000,
      balanceAmount: 0,
      paymentStatus: '已付清',
      signDate: new Date('2026-04-01'),
      weddingDate: new Date('2026-07-08'),
      status: '已签署',
      _openid: openid, isDeleted: false, createdAt: now, updatedAt: now,
    },
    {
      clientName: '赵先生 & 黄女士',
      contractNo: 'HT-2026-004',
      totalAmount: 20000,
      paidAmount: 20000,
      balanceAmount: 0,
      paymentStatus: '已付清',
      signDate: new Date('2026-02-10'),
      weddingDate: new Date('2026-05-10'),
      status: '已完成',
      _openid: openid, isDeleted: false, createdAt: now, updatedAt: now,
    },
  ];

  const tasks = contracts.map(c => db.collection('contracts').add({ data: c }));
  const results = await Promise.all(tasks);
  console.log('[seed-data] initContracts:', results.length, 'records inserted');
  return { inserted: results.length };
}

async function initLeads(openid, force) {
  const hasData = await collectionHasData('leads');
  if (hasData && !force) {
    return { skipped: true, reason: 'leads 集合已有数据，跳过。传 force:true 强制覆盖' };
  }

  const now = new Date();
  const leads = [
    {
      name: '孙先生',
      phone: '13900001111',
      wechat: 'sun_wedding',
      source: '线上咨询',
      demand: '新中式婚礼，预算15万左右',
      status: '待跟进',
      priority: '高',
      _openid: openid, isDeleted: false, createdAt: now, updatedAt: now,
    },
    {
      name: '周女士',
      phone: '13900002222',
      wechat: 'zhou_bride',
      source: '朋友介绍',
      demand: '户外草坪婚礼，6月档期',
      status: '待跟进',
      priority: '中',
      _openid: openid, isDeleted: false, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), updatedAt: now,
    },
    {
      name: '吴先生',
      phone: '13900003333',
      wechat: 'wu_groom',
      source: '展会获客',
      demand: '韩式简约风格，8月档期',
      status: '已转化',
      priority: '高',
      convertedToOrder: true,
      _openid: openid, isDeleted: false, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), updatedAt: now,
    },
    {
      name: '郑女士',
      phone: '13900004444',
      wechat: 'zheng_wedding',
      source: '老客户转介',
      demand: '欧式复古风格，预算20万',
      status: '待跟进',
      priority: '高',
      _openid: openid, isDeleted: false, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), updatedAt: now,
    },
  ];

  const tasks = leads.map(l => db.collection('leads').add({ data: l }));
  const results = await Promise.all(tasks);
  console.log('[seed-data] initLeads:', results.length, 'records inserted');
  return { inserted: results.length };
}

async function clearAll() {
  const collections = ['orders', 'clients', 'props', 'hotels', 'knowledge', 'todos', 'contracts', 'leads'];
  const results = {};
  for (const coll of collections) {
    try {
      const res = await db.collection(coll).where({}).remove();
      results[coll] = res.stats ? res.stats.removed : 0;
    } catch (e) {
      results[coll] = 'error: ' + (e.message || e.errCode);
    }
  }
  console.log('[seed-data] clearAll results:', results);
  return results;
}
