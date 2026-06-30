/** 同步自定义 tabBar 选中项（各 Tab 页 onShow 中调用） */
function updateTabBar(page, index) {
  if (typeof page.getTabBar !== 'function') return;
  const tabBar = page.getTabBar();
  if (tabBar) {
    tabBar.setData({ selected: index });
  }
}

module.exports = { updateTabBar };
