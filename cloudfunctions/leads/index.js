// 云函数：leads - 咨询线索管理
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

function ok(d) { return { code: 0, data: d, _meta: { timestamp: new Date().toISOString() } }; }
function fail(m) { return { code: -1, msg: m || '操作失败', _meta: { timestamp: new Date().toISOString() } }; }

exports.main = async (event) => {
  const { action } = event;
  const { OPENID } = cloud.getWXContext();
  try {
    switch (action) {
      case 'create': return await createLead(event, OPENID);
      case 'list': return await listLeads(event, OPENID);
      case 'detail': return await detailLead(event, OPENID);
      case 'update': return await updateLead(event, OPENID);
      case 'addNote': return await addFollowUpNote(event, OPENID);
      case 'convertToOrder': return await convertToOrder(event, OPENID);
      default: return fail('未知操作: ' + action);
    }
  } catch (err) {
    return fail(err.message || String(err));
  }
};

async function createLead(event, openid) {
  const { data } = event;
  if (!data || !data.name || !data.phone) return fail('请填写姓名和电话');
  const res = await db.collection('leads').add({
    data: {
      _openid: openid,
      name: String(data.name).trim(),
      phone: String(data.phone).trim(),
      weddingDate: data.weddingDate || '',
      budget: data.budget || '',
      requirement: data.requirement || '',
      stylePreference: data.stylePreference || '',
      source: data.source || '小程序',
      status: '待跟进',
      followUpNotes: [],
      lastFollowUpAt: null,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    },
  });
  return ok({ id: res._id });
}

async function detailLead(event, openid) {
  const { id } = event;
  if (!id) return fail('缺少ID');
  const res = await db.collection('leads').doc(id).get();
  if (!res.data) return fail('线索不存在');
  return ok(res.data);
}

async function listLeads(event, openid) {
  const { status, page = 1, pageSize = 20 } = event;
  const query = { _openid: openid };
  if (status) query.status = status;
  const [listRes, totalRes] = await Promise.all([
    db.collection('leads').where(query).orderBy('createdAt', 'desc').skip((page - 1) * pageSize).limit(pageSize).get(),
    db.collection('leads').where(query).count(),
  ]);
  return ok({ list: listRes.data, total: totalRes.total });
}

async function updateLead(event, openid) {
  const { id, data } = event;
  if (!id) return fail('缺少ID');
  const res = await db.collection('leads').doc(id).update({
    data: { ...data, updatedAt: db.serverDate() },
  });
  return ok({ updated: res.stats.updated });
}

async function addFollowUpNote(event, openid) {
  const { id, note } = event;
  if (!id) return fail('缺少ID');
  if (!note || !note.text) return fail('缺少备注内容');
  const now = db.serverDate();
  const res = await db.collection('leads').doc(id).update({
    data: {
      followUpNotes: _.push({ text: note.text, createdAt: now }),
      lastFollowUpAt: now,
      updatedAt: now,
    },
  });
  return ok({ updated: res.stats.updated });
}

async function convertToOrder(event, openid) {
  const { id } = event;
  if (!id) return fail('缺少线索ID');

  // 查询线索
  const leadRes = await db.collection('leads').doc(id).get();
  if (!leadRes.data) return fail('线索不存在');
  const lead = leadRes.data;

  // 在 orders 集合中创建订单
  const orderRes = await db.collection('orders').add({
    data: {
      _openid: openid,
      clientName: lead.name || '',
      weddingDate: lead.weddingDate || '',
      style: lead.stylePreference || '',
      venue: '',
      venueType: '',
      planner: '',
      budget: Number(lead.budget) || 0,
      paid: 0,
      balance: 0,
      status: '筹备中',
      progress: 0,
      description: '',
      costItems: [],
      propList: [],
      hotelInfo: {},
      isDeleted: false,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    },
  });

  // 更新线索状态
  await db.collection('leads').doc(id).update({
    data: {
      status: '已转化',
      orderId: orderRes._id,
      updatedAt: db.serverDate(),
    },
  });

  return ok({ orderId: orderRes._id });
}
