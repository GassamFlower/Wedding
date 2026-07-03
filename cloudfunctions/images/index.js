// 云函数：images - 图库管理
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

function ok(d) { return { code: 0, data: d }; }
function fail(m) { return { code: -1, msg: m || '操作失败' }; }

exports.main = async (event) => {
  const { action } = event;
  try {
    switch (action) {
      case 'list': return await listImages(event);
      case 'save': return await saveImage(event);
      case 'remove': return await removeImage(event);
      default: return fail('未知操作: ' + action);
    }
  } catch (err) {
    return fail(err.message || String(err));
  }
};

async function listImages(event) {
  const { page = 1, pageSize = 50 } = event;
  const skip = (page - 1) * pageSize;
  const [listRes, totalRes] = await Promise.all([
    db.collection('images').orderBy('createdAt', 'desc').skip(skip).limit(pageSize).get(),
    db.collection('images').count()
  ]);
  return ok({ list: listRes.data, total: totalRes.total });
}

async function saveImage(event) {
  const { data } = event;
  if (!data || !data.url) return fail('缺少图片数据');
  const res = await db.collection('images').add({
    data: {
      url: data.url,
      name: data.name || '',
      size: data.size || 0,
      type: data.type || '',
      createdAt: db.serverDate(),
    }
  });
  return ok({ _id: res._id });
}

async function removeImage(event) {
  const { id } = event;
  if (!id) return fail('缺少图片ID');
  await db.collection('images').doc(id).remove();
  return ok({ _id: id });
}
