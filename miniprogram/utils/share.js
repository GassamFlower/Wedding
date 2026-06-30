/**
 * share.js - ????????
 * ?? Canvas ???????????? + 5:4 ??????
 */

// ??????????2x ???? 640x960?
var POSTER_W = 640;
var POSTER_H = 960;
// ???????5:4 ???
var CARD_W = 500;
var CARD_H = 400;

/**
 * ??????????????
 * @param {string} canvasId - canvas ?? ID
 * @param {Object} data - { coupleName, style, title }
 * @param {Function} callback - (err, tempFilePath) => {}
 */
function drawPoster(canvasId, data, callback) {
  var ctx = wx.createCanvasContext(canvasId);
  var cw = POSTER_W, ch = POSTER_H;
  var cx = cw / 2;

  // 1) ??????
  var bg = ctx.createLinearGradient(0, 0, 0, ch);
  bg.addColorStop(0, "#1a1a2e");
  bg.addColorStop(0.6, "#16213e");
  bg.addColorStop(1, "#0f172a");
  ctx.setFillStyle(bg);
  ctx.fillRect(0, 0, cw, ch);

  // 2) ???????
  ctx.setFillStyle("#D4AF37");
  ctx.fillRect(60, 64, cw - 120, 2);

  // 3) ?????????????
  ctx.setFillStyle("rgba(212,175,55,0.15)");
  ctx.fillRect(40, 40, 8, 8);
  ctx.fillRect(cw - 48, 40, 8, 8);

  // 4) ??? - ???
  ctx.setFillStyle("#FFFFFF");
  ctx.setFontSize(46);
  ctx.setTextAlign("center");
  ctx.fillText("?????", cx, 200);
  ctx.fillText("???????", cx, 268);

  // 5) ????????
  ctx.setFontSize(34);
  ctx.setFillStyle("#D4AF37");
  ctx.fillText(data.coupleName || "大喜的日子", cx, 362);

  // 6) ????????
  ctx.setFontSize(20);
  ctx.setFillStyle("rgba(255,255,255,0.45)");
  ctx.fillText(data.style || "婚礼场景策划", cx, 398);

  // 7) ???????
  ctx.setFillStyle("rgba(212,175,55,0.25)");
  ctx.fillRect(220, 440, cw - 440, 1);

  // 8) ????????????
  var codeSize = 100;
  var codeX = cx - codeSize / 2;
  var codeY = 490;
  ctx.setFillStyle("rgba(255,255,255,0.08)");
  ctx.setStrokeStyle("rgba(212,175,55,0.3)");
  ctx.setLineWidth(1.5);
  // ??????
  roundRect(ctx, codeX, codeY, codeSize, codeSize, 8);
  ctx.fill();
  ctx.stroke();
  // ????
  ctx.setFontSize(11);
  ctx.setFillStyle("rgba(255,255,255,0.3)");
  ctx.setTextAlign("center");
  ctx.fillText("小程序码", cx, codeY + codeSize / 2 + 4);

  // 9) ????
  ctx.setFontSize(13);
  ctx.setFillStyle("rgba(255,255,255,0.4)");
  ctx.fillText("长按识别二维码 · 查看婚礼方案", cx, 630);

  // 10) ?????
  ctx.setFontSize(12);
  ctx.setFillStyle("rgba(255,255,255,0.2)");
  ctx.fillText("大喜的日子 · 婚礼场景策划工作室", cx, ch - 40);

  ctx.draw(false, function () {
    wx.canvasToTempFilePath({
      canvasId: canvasId,
      width: cw,
      height: ch,
      success: function (res) { callback(null, res.tempFilePath); },
      fail: function (err) { callback(err); }
    });
  });
}

/**
 * ?? 5:4 ??????????????
 */
function drawChatCard(canvasId, data, callback) {
  var ctx = wx.createCanvasContext(canvasId);
  var cw = CARD_W, ch = CARD_H, cx = cw / 2;

  // ??????
  var bg = ctx.createLinearGradient(0, 0, cw, ch);
  bg.addColorStop(0, "#D4AF37");
  bg.addColorStop(0.4, "#E8D5A0");
  bg.addColorStop(0.7, "#C9A84C");
  bg.addColorStop(1, "#B8962E");
  ctx.setFillStyle(bg);
  ctx.fillRect(0, 0, cw, ch);

  // ???
  ctx.setFillStyle("rgba(255,255,255,0.06)");
  ctx.beginPath();
  ctx.arc(80, 60, 100, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cw - 60, ch - 40, 80, 0, Math.PI * 2);
  ctx.fill();

  // ??
  ctx.setFillStyle("#FFFFFF");
  ctx.setFontSize(30);
  ctx.setTextAlign("center");
  ctx.fillText(data.coupleName || "大喜的日子", cx, 140);

  // ????
  ctx.setFontSize(18);
  ctx.setFillStyle("rgba(255,255,255,0.75)");
  ctx.fillText(data.style || "婚礼策划", cx, 185);

  // ???
  ctx.setFillStyle("rgba(255,255,255,0.25)");
  ctx.fillRect(160, 215, cw - 320, 1);

  // ????
  ctx.setFontSize(14);
  ctx.setFillStyle("rgba(255,255,255,0.55)");
  ctx.fillText("大喜的日子 · 婚礼场景策划", cx, 280);

  ctx.draw(false, function () {
    wx.canvasToTempFilePath({
      canvasId: canvasId,
      width: cw,
      height: ch,
      success: function (res) { callback(null, res.tempFilePath); },
      fail: function (err) { callback(err); }
    });
  });
}

/** ???????? */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

module.exports = { drawPoster: drawPoster, drawChatCard: drawChatCard, drawXhsReport: drawXhsReport };

/**
 * 小红书战报自动生成 — 九宫格拼接 + 文案
 * @param {string} canvasId - canvas 元素 ID
 * @param {Object} data - { venue, style, clientName, images: [url1, url2, url3], review, copyText, tags }
 * @param {Function} callback - (err, tempFilePath) => {}
 */
var XHS_W = 750, XHS_H = 1000;
function drawXhsReport(canvasId, data, callback) {
  var ctx = wx.createCanvasContext(canvasId);
  var cw = XHS_W, ch = XHS_H;

  // 背景
  ctx.setFillStyle('#F7F3EE');
  ctx.fillRect(0, 0, cw, ch);

  // 顶部品牌区
  ctx.setFillStyle('rgba(196,168,130,0.08)');
  ctx.fillRect(0, 0, cw, 100);
  ctx.setFontSize(22);
  ctx.setFillStyle('#A8886A');
  ctx.setTextAlign('left');
  ctx.fillText('大喜的日子 · 婚礼场景策划', 30, 45);
  ctx.setFontSize(13);
  ctx.setFillStyle('#B0A090');
  ctx.fillText(data.venue || '', 30, 72);
  ctx.fillText(data.style || '', 30, 92);

  // 三张实景图（等大排列）
  var padding = 24, gap = 12;
  var imgW = Math.floor((cw - padding * 2 - gap * 2) / 3), imgH = Math.floor(imgW * 1.25);
  var imgY = 120;
  var imgs = (data.images || []).slice(0, 3);
  imgs.forEach(function (url, i) {
    var x = padding + i * (imgW + gap);
    ctx.drawImage(url, x, imgY, imgW, imgH);
    // 底部色条
    ctx.setFillStyle('rgba(196,168,130,0.3)');
    ctx.fillRect(x, imgY + imgH - 3, imgW, 3);
  });

  // 客户好评
  if (data.review) {
    var reviewY = imgY + imgH + 30;
    ctx.setFillStyle('#3A3A3A');
    ctx.setFontSize(16);
    ctx.fillText('新人真实评价', padding, reviewY);
    ctx.setFontSize(13);
    ctx.setFillStyle('#8A7A6A');
    ctx.fillText('"' + data.review.substring(0, 60) + '"', padding, reviewY + 30);
  }

  // 文案区
  if (data.copyText) {
    var copyY = imgY + imgH + 120;
    ctx.setFillStyle('#3A3A3A');
    ctx.setFontSize(13);
    // 每行30字换行
    var txt = data.copyText || '';
    var lineH = 22, maxW = cw - padding * 2, line = '';
    var lines = [];
    for (var i = 0; i < txt.length; i++) {
      line += txt[i];
      ctx.setFontSize(12);
      var w = ctx.measureText(line).width;
      if (w > maxW || txt[i] === '\n') { lines.push(line); line = ''; }
    }
    if (line) lines.push(line);
    lines.forEach(function (l, i) {
      ctx.fillText(l, padding, copyY + i * lineH);
    });
  }

  // 标签
  if (data.tags) {
    var tagY = ch - 60;
    ctx.setFontSize(16);
    ctx.setFillStyle('#D97474');
    ctx.fillText(data.tags || '', padding, tagY);
  }

  // 水印
  ctx.setFontSize(11);
  ctx.setFillStyle('rgba(196,168,130,0.4)');
  ctx.setTextAlign('right');
  ctx.fillText('大喜的日子 · 婚礼场景策划', cw - 30, ch - 16);

  ctx.draw(false, function () {
    setTimeout(function () {
      wx.canvasToTempFilePath({
        canvasId: canvasId, success: function (res) { callback(null, res.tempFilePath); },
        fail: function (err) { callback(err); }
      });
    }, 500);
  });
}
