// 云函数：articles - 文章管理
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

function ok(d) { return { code: 0, data: d }; }
function fail(m) { return { code: -1, msg: m || '操作失败' }; }

exports.main = async (event) => {
  const { action } = event;
  try {
    switch (action) {
      case 'list': return await listArticles(event);
      case 'get': return await getArticle(event);
      case 'save': return await saveArticle(event);
      case 'remove': return await removeArticle(event);
      default: return fail('未知操作: ' + action);
    }
  } catch (err) {
    return fail(err.message || String(err));
  }
};

async function listArticles(event) {
  const { page = 1, pageSize = 20 } = event;
  const skip = (page - 1) * pageSize;
  const [listRes, totalRes] = await Promise.all([
    db.collection('articles').orderBy('createdAt', 'desc').skip(skip).limit(pageSize).get(),
    db.collection('articles').count()
  ]);
  return ok({ list: listRes.data, total: totalRes.total });
}

async function getArticle(event) {
  const { id } = event;
  if (!id) return fail('缺少文章ID');
  const res = await db.collection('articles').doc(id).get();
  return ok(res.data);
}

async function saveArticle(event) {
  const { data } = event;
  if (!data) return fail('缺少数据');
  if (!data.title) return fail('缺少标题');

  if (data._id) {
    // 更新
    const { _id, ...updateData } = data;
    updateData.updatedAt = db.serverDate();
    await db.collection('articles').doc(_id).update({ data: updateData });
    return ok({ _id });
  } else {
    // 创建
    data.createdAt = db.serverDate();
    data.updatedAt = db.serverDate();
    const res = await db.collection('articles').add({ data });
    return ok({ _id: res._id });
  }
}

async function removeArticle(event) {
  const { id } = event;
  if (!id) return fail('缺少文章ID');
  await db.collection('articles').doc(id).remove();
  return ok({ _id: id });
}
