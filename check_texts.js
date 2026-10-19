/* 字數自我檢查：去除空白後的字元數（含標點與小標，不含〔L〕編碼）。
   正確值：每版 L1–L5 = 56, 56, 56, 53, 61；開場 46、收尾 72；每版總計 400。 */
(function () {
  var C = window.CONTENT, msgs = [], ok = true;
  var EXPECT = [56, 56, 56, 53, 61];
  function n(s) { return s.replace(/\s/g, '').length; }
  if (n(C.AI_OPEN) !== 46) { ok = false; msgs.push('開場 ' + n(C.AI_OPEN) + ' 字（應為 46）'); }
  if (n(C.AI_CLOSE) !== 72) { ok = false; msgs.push('收尾 ' + n(C.AI_CLOSE) + ' 字（應為 72）'); }
  Object.keys(C.VERSIONS).forEach(function (v) {
    var tot = n(C.AI_OPEN) + n(C.AI_CLOSE);
    C.VERSIONS[v].items.forEach(function (it, k) {
      var c = n(it.head + '：' + it.body);
      tot += c;
      if (c !== EXPECT[k]) { ok = false; msgs.push('版本 ' + v + ' L' + (k + 1) + '：' + c + ' 字（應為 ' + EXPECT[k] + '）'); }
      if (/〔L\d〕/.test(it.head + it.body)) { ok = false; msgs.push('版本 ' + v + ' L' + (k + 1) + ' 含〔L〕編碼'); }
    });
    if (tot !== 400) { ok = false; msgs.push('版本 ' + v + ' 總計 ' + tot + ' 字（應為 400）'); }
  });
  window.TEXT_CHECK = { ok: ok, messages: msgs };
  if (ok) console.log('[文本檢查] 通過：六版每項字數正確，每版 400 字。');
  else console.error('[文本檢查] 未通過：\n' + msgs.join('\n'));
})();
