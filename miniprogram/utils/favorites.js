// utils/favorites.js - 收藏管理
const STORAGE_KEY = 'favorite_cases';

function getAll() {
  try { return wx.getStorageSync(STORAGE_KEY) || []; } catch (e) { return []; }
}

function getIds() {
  return getAll().map(c => c.id);
}

function isFavorite(id) {
  return getIds().indexOf(id) !== -1;
}

function add(caseData) {
  const list = getAll();
  if (!list.find(c => c.id === caseData.id)) {
    list.unshift({
      id: caseData.id,
      title: caseData.title || caseData.coupleName,
      coupleName: caseData.coupleName,
      style: caseData.style || '',
      venue: caseData.venue || '',
      savedAt: new Date().toISOString()
    });
    wx.setStorageSync(STORAGE_KEY, list);
  }
  return list;
}

function remove(id) {
  const list = getAll().filter(c => c.id !== id);
  wx.setStorageSync(STORAGE_KEY, list);
  return list;
}

function toggle(caseData) {
  return isFavorite(caseData.id) ? remove(caseData.id) : add(caseData);
}

function count() {
  return getAll().length;
}

module.exports = { getAll, getIds, isFavorite, add, remove, toggle, count };