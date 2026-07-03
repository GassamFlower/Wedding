// 大喜日子官网 - 云数据层
// 数据来源：小程序云函数 + 云数据库
// 通过 admin-api HTTP 接口调用

(function() {
  'use strict';

  const API_BASE = 'https://cloud1-d3gt5vpbuf8acec14.service.tcloudbase.com/admin-api';

  // 统一接口调用
  function callCloud(action, payload) {
    return fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ action: action }, payload || {}))
    }).then(function(r) { return r.json(); });
  }

  // 加载精选案例
  window.loadCasesFromCloud = function(callback) {
    callCloud('cases:featured', { pageSize: 10 })
      .then(function(res) {
        if (res && res.code === 0 && res.data && res.data.featured && res.data.featured.length > 0) {
          var cases = res.data.featured.map(function(c) {
            return {
              _id: c.id || c._id,
              title: c.title || (c.coupleName ? c.coupleName + '婚礼' : '精选案例'),
              coupleName: c.coupleName || '',
              style: c.style || '',
              venue: c.venue || '',
              budgetRange: c.budgetRange || '面议',
              tags: c.tags || [],
              isFeatured: !!c.isFeatured,
              designNotes: c.designNotes || c.description || '',
              img: c.coverImage || (c.images && c.images[0]) || '',
              images: c.images || [],
              clientReview: c.clientReview || '',
              clientRating: c.clientRating || 0
            };
          });
          if (callback) callback(cases);
          console.log('[云数据] 案例已从云数据库加载，共 ' + cases.length + ' 个');
        } else {
          console.log('[云数据] 云数据库无精选案例，使用本地演示数据');
          if (callback) callback(null);
        }
      })
      .catch(function(err) {
        console.warn('[云数据] 云函数调用失败:', err);
        if (callback) callback(null);
      });
  };

  // 提交线索（咨询表单）
  window.submitLead = function(data) {
    return callCloud('leads:create', {
      data: {
        name: data.name,
        phone: data.phone,
        weddingDate: data.weddingDate || '',
        budget: data.budget || '',
        requirement: data.requirement || '',
        source: 'website'
      }
    });
  };

  // 智能助手问答（优先走知识库，失败可降级）
  window.askAssistant = function(query) {
    return callCloud('knowledge:search', { query: query })
      .then(function(res) {
        if (res && res.code === 0 && res.data && res.data.success && res.data.answer) {
          return { ok: true, answer: res.data.answer, source: res.data.sources && res.data.sources[0] };
        }
        return { ok: false };
      })
      .catch(function(err) {
        console.warn('[云数据] 知识库调用失败:', err);
        return { ok: false };
      });
  };

  console.log('[云数据] 云数据层已加载');
})();
