// 云函数：cases - 案例展示
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

function ok(d) { return { code: 0, data: d, _meta: { timestamp: new Date().toISOString() } }; }
function fail(m) { return { code: -1, msg: m || '操作失败', _meta: { timestamp: new Date().toISOString() } }; }
function safe(p, f) { try { return p; } catch(e) { return f; } }

exports.main = async (event) => {
  const { action } = event;
  try {
    switch (action) {
      case 'list': return await listCases(event);
      case 'featured': return await getFeatured(event);
      case 'get': case 'detail': return await getDetail(event);
      default: return fail('未知操作: ' + action);
    }
  } catch (err) {
    return fail(err.message || String(err));
  }
};

async function listCases(event) {
  const { featured, page = 1, pageSize = 20 } = event;
  const query = { isCase: true, isDeleted: _.neq(true) };
  if (featured) query.isFeatured = true;

  const [listRes, totalRes] = await Promise.all([
    safe(db.collection('orders').where(query).orderBy('sortOrder', 'asc').orderBy('createdAt', 'desc').skip((page - 1) * pageSize).limit(pageSize).get(), { data: [] }),
    safe(db.collection('orders').where(query).count(), { total: 0 }),
  ]);

  const list = listRes.data.map(o => ({
    id: o._id,
    title: o.caseTitle || o.clientName + '婚礼',
    coupleName: o.clientName || '',
    coverImage: (o.caseImages && o.caseImages[0]) || '',
    images: o.caseImages || [],
    style: o.style || '',
    venue: o.venue || '',
    budgetRange: formatBudget(o.budget),
    tags: [o.style, o.venueType].filter(Boolean),
    isFeatured: !!o.isFeatured,
    description: o.caseDescription || '',
    designNotes: o.caseDesignNotes || '',
    clientReview: o.clientReview || '',
    clientRating: o.clientRating || 0,
  }));

  return ok({ list, total: totalRes.total || 0, page: parseInt(page), pageSize });
}

async function getFeatured(event) {
  const res = await listCases({ featured: true, pageSize: 10 });
  return ok({ featured: res.data.list });
}

async function getDetail(event) {
  const { id } = event;
  if (!id) return fail('缺少案例ID');
  const res = await safe(db.collection('orders').doc(id).get(), null);
  if (!res || !res.data) return fail('案例不存在');
  const o = res.data;
  return ok({
    id: o._id,
    title: o.caseTitle || o.clientName + '婚礼',
    coupleName: o.clientName || '',
    images: o.caseImages || [],
    style: o.style || '',
    venue: o.venue || '',
    budgetRange: formatBudget(o.budget),
    tags: [o.style, o.venueType].filter(Boolean),
    description: o.caseDescription || '',
    designNotes: o.caseDesignNotes || '',
    clientReview: o.clientReview || '',
    clientRating: o.clientRating || 0,
  });
}

function formatBudget(n) {
  if (!n) return '面议';
  const v = Number(n);
  if (v < 10000) return v/1000 + 'k';
  return (v/1000).toFixed(0) + 'k-' + ((v+5000)/1000).toFixed(0) + 'k';
}
