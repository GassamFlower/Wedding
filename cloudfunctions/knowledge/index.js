const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { action, query } = event;
  const OPENID = cloud.getWXContext().OPENID;

  switch (action) {
    case 'search': return await search(query);
    default: return { success: false, message: '未知操作' };
  }
};

/**
 * 搜索知识库：关键词匹配
 * @param {string} query - 用户输入的问题
 * @returns {{ answer, sources, score }}
 */
async function search(query) {
  if (!query || !query.trim()) {
    return { success: true, answer: '', sources: [], score: 0 };
  }

  const keywords = extractKeywords(query);

  try {
    // Step 1: 精确匹配 — 问题文本包含任一关键词
    let exactRes = await db.collection('knowledge')
      .where(_.or(keywords.map(k => ({ question: db.RegExp({ regexp: k, options: 'i' }) }))))
      .orderBy('priority', 'desc')
      .limit(3)
      .get();

    if (exactRes.data && exactRes.data.length > 0) {
      const best = exactRes.data[0];
      return {
        success: true,
        answer: best.answer,
        sources: [best.category || '知识库'],
        score: 0.9,
      };
    }

    // Step 2: 模糊匹配 — 标签匹配
    let tagRes = await db.collection('knowledge')
      .where({ tags: _.in(keywords) })
      .orderBy('priority', 'desc')
      .limit(3)
      .get();

    if (tagRes.data && tagRes.data.length > 0) {
      const best = tagRes.data[0];
      return {
        success: true,
        answer: best.answer,
        sources: [best.category || '知识库'],
        score: 0.6,
      };
    }

    // Step 3: 无匹配 — 返回空，前端用 fallback
    return { success: true, answer: '', sources: [], score: 0 };

  } catch (err) {
    console.error('Knowledge search error:', err);
    return { success: false, message: '搜索失败' };
  }
}

/**
 * 从用户查询中提取关键词
 * 移除常见停用词，返回有意义的词
 */
function extractKeywords(text) {
  const stopWords = ['的', '吗', '呢', '吧', '啊', '么', '怎么', '什么', '哪些', '多少', '如何', '帮', '我', '想', '要', '可以', '能不能', '有没有', '是否', '需要', '应该', '一个', '一下'];
  let cleaned = text;
  stopWords.forEach(w => { cleaned = cleaned.replace(new RegExp(w, 'g'), ' '); });
  const words = cleaned.split(/[\s,，。？?！!]+/).filter(w => w.length >= 2);
  return [...new Set(words)].slice(0, 5);
}
