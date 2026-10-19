/* =====================================================================
   app.js：流程、記錄、儲存。文字一律來自 content.js。
   ===================================================================== */
(function () {
  'use strict';
  var C = window.CONTENT, CFG = C.CONFIG;
  var app = document.getElementById('app');
  var params = new URLSearchParams(location.search);
  var MODE = window.EXP_MODE || params.get('mode');   // pretest.html／study1.html／study2.html 各自固定模式；index.html 仍可用 ?mode=
  var DEBUG = params.get('debug') === '1';
  var ADMIN = params.get('admin') === '1';   // 施測者管理畫面（2026-10-19）：一般網址只顯示「開始」，施測者工具與手動輸入編號在 ?admin=1
  var KEY_CUR = 'exp:current', KEY_Q = 'exp:queue';

  /* ---------------- 流程 ---------------- */
  /* 依第三章 v11：研究一步驟 1–5、研究二步驟 1–8（圖 3-2）；前測依研究二程序並加 T0、機制深度檢核與處理流暢度（第二節五） */
  var BASE = ['P1', 'P2a', 'P2b', 'P2c', 'P3a', 'P3b', 'P4a', 'P4b', 'P5', 'P6', 'P7'];
  var FLOWS = {
    pretest: BASE.concat(['T0', 'P8', 'P9', 'P10', 'CLr', 'T1', 'P13', 'T1b', 'P16', 'T2', 'P14i', 'P14', 'CLj', 'P18', 'P19']),
    s1: BASE.concat(['P8', 'CLr', 'P14i', 'P14s', 'P14', 'CLj', 'P18', 'P19']),
    s2: BASE.concat(['P8', 'CLr', 'T1', 'P13', 'T1b', 'P16', 'T2', 'P14i', 'P14s', 'P14', 'CLj', 'P18', 'P19'])
  };
  var ALL_PAGES = ['P1', 'P2a', 'P2b', 'P2c', 'P3a', 'P3b', 'P4a', 'P4b', 'P5', 'P6', 'P7', 'T0', 'P8', 'P9', 'P10', 'CLr', 'T1', 'P13', 'T1b', 'P16', 'T2', 'P14i', 'P14s', 'P14', 'CLj', 'P18'];

  /* ---------------- 小工具 ---------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  // 台灣時間（UTC+8），格式 2026-10-19 20:41:21；不受施測裝置的時區設定影響（2026-10-19 起）
  function nowISO() { return new Date(Date.now() + 8 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19); }
  function mean(a) { var v = a.filter(function (x) { return typeof x === 'number'; }); return v.length === a.length && v.length ? +(v.reduce(function (s, x) { return s + x; }, 0) / v.length).toFixed(4) : null; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function ls(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function nText() { return (CFG.N_IN_INSTRUCTIONS && CFG.N_IN_INSTRUCTIONS[MODE]) || 20; }
  function toolKey(t) { return 'tool_' + t.replace(/（.*?）/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, ''); }

  /* ---------------- 記錄 ---------------- */
  var rec = null;          // 目前受試者完整紀錄
  var cur = {};            // 目前頁的作答
  var pageT0 = 0;          // 目前頁進入時間（performance.now）
  var pendingEmail = null; // 只存在記憶體，用於斷線補檢查
  function recKey(r) { return 'exp:rec:' + r.mode + ':' + r.pid; }
  function save() { if (rec && !DEBUG) ls(recKey(rec), rec); }  // 測試模式不寫入本機紀錄

  function newRecord(pid, experimenter, cond) {
    var v = C.VERSIONS[cond];
    return {
      pid: pid, mode: MODE, experimenter: experimenter, cond: cond, depth: v.depth, concrete: v.concrete,
      debug: DEBUG, start_time: nowISO(), end_time: null, flow: FLOWS[MODE].slice(), idx: 0,
      data: {}, times: {}, enter: {}, refreshes: 0, consent: null, screened_out: 0, screen_reason: '',
      email_check: '', judge: null, done: false, terminal: null, snap: {}, orders: {}, backs: []
    };
  }

  /* ---------------- 傳送（Google 試算表）與佇列 ---------------- */
  function queue() { return ls(KEY_Q) || []; }
  function enqueue(item) { if (DEBUG) return; var q = queue(); q.push(item); ls(KEY_Q, q); flush(); }
  var flushing = false;
  function flush() {
    if (flushing || DEBUG || !CFG.DATA_ENDPOINT) return;
    var q = queue(); if (!q.length) return;
    flushing = true;
    var item = q[0];
    fetch(CFG.DATA_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ secret: CFG.SHARED_SECRET }, item)) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.ok) { var q2 = queue(); q2 = q2.filter(function (x) { return x.id !== item.id; }); ls(KEY_Q, q2); flushing = false; flush(); }
        else { flushing = false; }
      })
      .catch(function () { flushing = false; });
  }
  setInterval(flush, 15000);

  function sendPage(code, data) {
    enqueue({ id: uid(), kind: 'page', pid: rec.pid, mode: rec.mode, page: code, data: data, t_ms: rec.times[code] || null, ts: nowISO() });
  }

  /* ---------------- Email（獨立資料表） ---------------- */
  var contactReq = uid(); // 本次填寫的隨機代碼，只在記憶體，不寫入作答資料
  function contactCheck(email) {
    var body = JSON.stringify({ secret: CFG.SHARED_SECRET, email: email, mode: MODE, date: nowISO().slice(0, 10), req: contactReq });
    var ctl = new AbortController(); var tm = setTimeout(function () { ctl.abort(); }, 8000);
    return fetch(CFG.CONTACT_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body, signal: ctl.signal })
      .then(function (r) { clearTimeout(tm); return r.json(); })
      .then(function (j) { if (!j || !j.ok) throw new Error('bad'); return j.exists ? 'duplicate' : 'new'; });
  }
  setInterval(function () {
    if (!pendingEmail || !rec) return;
    contactCheck(pendingEmail).then(function (res) {
      pendingEmail = null;
      rec.email_check = res === 'duplicate' ? 'duplicate_late' : 'new_late';
      save(); sendPage('P2a_late', { email_check: rec.email_check });
    }).catch(function () {});
  }, 20000);

  /* ---------------- 版面工具 ---------------- */
  function setProgress() { /* 不顯示進度條（研究者決定；Villar, Callegaro, & Yang, 2013） */ }
  /* 各頁上方的部分標籤與標題（沿用舊網頁的分部呈現方式；介面文字） */
  var META = {
    P2a: ['第一部分 · 基本資料', '確認參加資格'], P2b: ['第一部分 · 基本資料', '你的年齡'], P2c: ['第一部分 · 基本資料', '生成式AI使用經驗'],
    P3a: ['第一部分 · 基本資料', '關於你的基本資料'], P3b: ['第一部分 · 基本資料', '投資經驗'],
    P4a: ['第一部分 · 金融常識', '幾題金融常識（1/2）'], P4b: ['第一部分 · 金融常識', '幾題金融常識（2/2）'], P5: ['第一部分 · 基本資料', '再一題'],
    P6: ['第二部分 · 情境', '一個生活情境'], P7: ['第二部分 · 情境', '作答前的預估'],
    T0: ['第二部分 · 情境', '你的理解'],
    P8: ['第三部分 · AI 分析', 'AI 助理的回覆'], P9: ['第三部分 · 閱讀後回饋', '你對這段 AI 分析的看法'], P10: ['第三部分 · 閱讀後回饋', '閱讀的感受'],
    CLr: ['第三部分 · 閱讀後回饋', '你對這段 AI 分析的看法'], T1: ['第三部分 · 閱讀後回饋', '你的理解'], P13: ['第三部分 · 閱讀後回饋', '作答前的預估'],
    T1b: ['第三部分 · 閱讀後回饋', '你的理解'], P16: ['第三部分 · 閱讀後回饋', '寫下你的想法'], T2: ['第三部分 · 閱讀後回饋', '你的理解'],
    P14i: ['第四部分 · 換你判斷', '判斷投資訊息'], P14s: ['第四部分 · 換你判斷', '判斷投資訊息'], P14: ['第四部分 · 換你判斷', '判斷投資訊息'],
    CLj: ['第五部分 · 整體感受', '剛才判斷的過程']
  };
  function addHead(code) {
    var m = META[code]; if (!m) return;
    app.insertAdjacentHTML('afterbegin', '<div class="eyebrow">' + esc(m[0]) + '</div><h2 class="ptitle">' + esc(m[1]) + '</h2>');
  }
  function canBack() {
    if (!rec || rec.idx <= 0 || rec.terminal) return false;
    var code = rec.flow[rec.idx];
    if (code === 'P14' && rec.judge && rec.judge.i > 0) return true;   // 判斷任務內可回上一則
    return (CFG.BACK_BLOCKED || []).indexOf(rec.flow[rec.idx - 1]) < 0;
  }
  function navHTML(label) {
    return '<div class="navrow">' + (canBack() ? '<button type="button" class="btn secondary back" id="back">' + esc(C.BACK) + '</button>' : '') +
      '<span class="navmsg" id="navmsg"></span><button class="btn" id="next">' + esc(label || C.NEXT) + '</button></div>';
  }
  function qBlock(id, inner, text) { return '<div class="q" data-q="' + id + '">' + (text ? '<div class="qtext">' + text + '</div>' : '') + inner + '</div>'; }
  function optList(id, opts, row) {
    return '<div class="opts' + (row ? ' row' : '') + '">' + opts.map(function (o) {
      return '<button type="button" class="opt" data-id="' + id + '" data-v="' + esc(o) + '">' + esc(o) + '</button>';
    }).join('') + '</div>';
  }
  function scale(id, values, left, right, labels) {
    return '<div class="scale">' + values.map(function (v) {
      return '<button type="button" class="opt" data-id="' + id + '" data-v="' + v + '" data-num="1">' + esc(labels ? labels[v] || v : v) + '</button>';
    }).join('') + '</div>' + (left || right ? '<div class="ends"><span>' + esc(left || '') + '</span><span>' + esc(right || '') + '</span></div>' : '');
  }
  function bindOpts(root, onChange) {
    $$('.opt[data-id]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.dataset.id;
        $$('.opt[data-id="' + id + '"]', root).forEach(function (x) { x.classList.remove('sel'); });
        b.classList.add('sel');
        cur[id] = b.dataset.num ? Number(b.dataset.v) : b.dataset.v;
        var q = b.closest('.q'); if (q) q.classList.remove('missing');
        if (onChange) onChange(id);
      });
    });
  }
  function requireIds(ids) {
    var miss = ids.filter(function (id) { return cur[id] === undefined || cur[id] === null || cur[id] === ''; });
    $$('.q').forEach(function (q) { q.classList.remove('missing'); });
    $$('tr[data-q]').forEach(function (q) { q.classList.remove('missing'); });
    miss.forEach(function (id) { var el = $('[data-q="' + id + '"]'); if (el) el.classList.add('missing'); });
    var m = $('#navmsg'); if (m) m.textContent = miss.length ? C.MISSING : '';
    if (miss.length) { var first = $('[data-q="' + miss[0] + '"]'); if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    return miss.length === 0;
  }
  function onNext(fn) { $('#next').addEventListener('click', fn); }
  function bracketHTML(s) {
    if (CFG.BRACKET_DISPLAY !== 'gray') return esc(s);
    return esc(s).replace(/［([^］]*)］/g, '<span class="bracket">［$1］</span>');
  }
  function targetMessageHTML() {
    return C.TARGET_MESSAGE.map(function (b) {
      if (b.t === 'files') return '<div class="files">' + b.items.map(function (f) {
        if (!f[2]) return '<span class="file"><span class="ico ' + (f[0] === 'img' ? 'img' : '') + '"></span>' + esc(f[1]) + '</span>';
        return '<figure class="att"><div class="thumbs">' + f[2].map(function (src) {
          return '<img src="' + esc(src) + '" alt="' + esc(f[1]) + '">';
        }).join('') + '</div><figcaption>' + esc(f[1]) + '</figcaption></figure>';
      }).join('') + '</div>';
      return '<p class="msgline">' + (b.bold ? '<b>' + esc(b.s) + '</b>' : esc(b.s)) + '</p>';
    }).join('');
  }

  /* ---------------- 回上一頁：保存與還原各頁已選的答案 ---------------- */
  var NO_SNAP = ['P2a', 'P14'];   // Email 不保存於本機；判斷任務另以 rec.judge.ans 還原
  function fieldKey(el) {
    if (el.id) return '#' + el.id;
    if (el.type === 'range' && el.dataset.id) return 'input[type=range][data-id="' + el.dataset.id + '"]';
    if (el.dataset.k !== undefined) return 'input.tool[data-k="' + el.dataset.k + '"]';
    return null;
  }
  function snapshot(code) {
    if (NO_SNAP.indexOf(code) >= 0) return;
    if (!rec.snap) rec.snap = {};
    var s = { opts: {}, fields: {} };
    $$('.opt.sel[data-id]', app).forEach(function (b) { s.opts[b.dataset.id] = b.dataset.v; });
    $$('input,textarea', app).forEach(function (el) {
      var k = fieldKey(el); if (!k) return;
      s.fields[k] = el.type === 'checkbox' ? el.checked : (el.type === 'range' && el.classList.contains('untouched')) ? null : el.value;
    });
    if (code === 'P6') s.comic = comicShown;
    rec.snap[code] = s;
  }
  function restore(code) {
    var s = rec.snap && rec.snap[code]; if (!s) return;
    Object.keys(s.fields).forEach(function (k) {
      var el = $(k, app), v = s.fields[k]; if (!el || v === null || v === '' || v === false) return;
      if (el.type === 'checkbox') { el.checked = true; el.dispatchEvent(new Event('change')); }
      else { el.value = v; el.dispatchEvent(new Event('input')); el.dispatchEvent(new Event('change')); }
    });
    $$('.opt[data-id]', app).forEach(function (b) { if (s.opts[b.dataset.id] === b.dataset.v) b.click(); });   // 依畫面順序點選，條件題會跟著出現
    var m = $('#navmsg'); if (m) m.textContent = '';
    $$('.q.missing').forEach(function (q) { q.classList.remove('missing'); });
  }
  function stableOrder(code, items) {   // 隨機題序只抽一次，回上一頁時維持同一順序
    if (!rec.orders) rec.orders = {};
    if (!rec.orders[code]) { rec.orders[code] = shuffle(items).map(function (i) { return i.id; }); save(); }
    return rec.orders[code].map(function (id) { return items.filter(function (i) { return i.id === id; })[0]; });
  }
  function goBack() {
    if (!canBack()) return;
    var code = rec.flow[rec.idx], from = code + (code === 'P14' && rec.judge ? '#' + (rec.judge.i + 1) : '');
    snapshot(code); leavePage(code);
    if (code === 'P14' && rec.judge && rec.judge.i > 0) rec.judge.i -= 1;
    else {
      rec.idx -= 1;
      if (rec.flow[rec.idx] === 'P14' && rec.judge) rec.judge.i = rec.judge.order.length - 1;   // 從判斷任務後一頁回來：回到最後一則
    }
    var to = rec.flow[rec.idx] + (rec.flow[rec.idx] === 'P14' && rec.judge ? '#' + (rec.judge.i + 1) : '');
    if (!rec.backs) rec.backs = [];
    rec.backs.push(from + '>' + to + '@' + nowISO());
    save(); render();
  }

  /* ---------------- 頁面切換 ---------------- */
  function leavePage(code) {
    var el = Math.round(performance.now() - pageT0);
    rec.times[code] = (rec.times[code] || 0) + el;
    return el;
  }
  function finishPage(code, data) {
    snapshot(code); leavePage(code);
    rec.data[code] = Object.assign(rec.data[code] || {}, data);
    sendPage(code, data);
    rec.idx += 1; save(); render();
  }
  function goTerminal(kind, reason) {
    var code = rec.flow[rec.idx];
    leavePage(code);
    rec.terminal = kind;
    if (kind === 'screen') { rec.screened_out = 1; rec.screen_reason = reason; }
    save(); finalize(); renderTerminal();
  }

  function render() {
    cur = {}; window.scrollTo(0, 0); setProgress();
    var code = rec.flow[rec.idx];
    pageT0 = performance.now();
    if (!rec.enter[code]) rec.enter[code] = nowISO();
    save();
    (PAGES[code] || function () { app.innerHTML = '<p>未知頁面 ' + code + '</p>'; })();
    if (code !== 'P14') { restore(code); addHead(code); }
    var b = $('#back'); if (b) b.onclick = goBack;
  }

  /* ---------------- 各頁 ---------------- */
  var PAGES = {};

  PAGES.P1 = function () {
    app.innerHTML = '<div class="card"><h1>' + esc(C.CONSENT.title) + '</h1>' +
      C.CONSENT.summaryHTML.replace('{TIME}', esc(C.MODES[MODE].time)).replace('{INST}', esc(CFG.INSTITUTION || ''))
        .replace('{NAME}', esc(CFG.RESEARCHER_NAME)).replace('{EMAIL}', esc(CFG.RESEARCHER_EMAIL))
        .replace('{ADVISOR}', CFG.ADVISOR ? '；指導教授：' + esc(CFG.ADVISOR) : '') +
      '<div class="q" data-q="consent"><label class="inline"><input type="checkbox" id="cb"> ' + esc(C.CONSENT.checkbox) + '</label></div>' +
      navHTML() + '</div>';
    $('#cb').addEventListener('change', function () { cur.consent = this.checked ? 1 : undefined; });
    onNext(function () {
      if (!requireIds(['consent'])) return;
      rec.consent = 1; finishPage('P1', { consent: 1, consent_time: nowISO() });
    });
  };

  PAGES.P2a = function () {
    var E = C.EMAIL;
    if (rec.data.P2a && rec.data.P2a.email_check) {   // 回上一頁回到這裡：Email 已確認，不再重新檢查
      app.innerHTML = '<div class="card"><p>' + esc(C.EMAIL_DONE) + '</p>' + navHTML() + '</div>';
      onNext(function () { leavePage('P2a'); rec.idx += 1; save(); render(); });
      return;
    }
    app.innerHTML = '<div class="card"><p>' + esc(E.intro) + '</p>' +
      qBlock('email', '<div class="inline"><span>' + esc(E.label1) + '</span><input type="email" id="em1" autocomplete="off"></div>' +
        '<div class="inline" style="margin-top:10px"><span>' + esc(E.label2) + '</span><input type="email" id="em2" autocomplete="off"></div>') +
      navHTML() + '</div>';
    onNext(function () {
      var a = $('#em1').value.trim().toLowerCase(), b = $('#em2').value.trim().toLowerCase();
      var msg = $('#navmsg'), box = $('[data-q="email"]');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a)) { box.classList.add('missing'); msg.textContent = E.errFormat; return; }
      if (a !== b) { box.classList.add('missing'); msg.textContent = E.errMismatch; return; }
      $('#next').disabled = true; msg.textContent = E.checking;
      $('#em1').value = ''; $('#em2').value = '';
      var done = function (status) {
        rec.email_check = status;
        if (status === 'duplicate') { rec.data.P2a = { email_check: status }; sendPage('P2a', rec.data.P2a); goTerminal('screen', 'prior_participation'); return; }
        finishPage('P2a', { email_check: status });
      };
      if (DEBUG) { done('debug'); return; }
      if (!CFG.CONTACT_ENDPOINT) { done('pending'); return; }
      contactCheck(a).then(done).catch(function () { pendingEmail = a; done('pending'); });
    });
  };

  PAGES.P2b = function () {
    app.innerHTML = '<div class="card">' +
      qBlock('age', '<div class="inline"><input type="number" id="age" min="' + C.AGE.min + '" max="120" step="1" placeholder="' + C.AGE.min + '"><span>' + esc(C.AGE.unit) + '</span></div>', esc(C.AGE.q)) +
      navHTML() + '</div>';
    $('#age').addEventListener('input', function () { var v = this.value; cur.age = /^\d+$/.test(v) ? Number(v) : undefined; });
    onNext(function () {
      if (!requireIds(['age'])) return;
      var d = { age: cur.age };
      if (cur.age < 18) { rec.data.P2b = d; sendPage('P2b', d); goTerminal('screen', 'age'); return; }
      finishPage('P2b', d);
    });
  };

  PAGES.P2c = function () {
    var A = C.AIUSE;
    var toolsHTML = '<div class="opts">' + A.tools.map(function (tl, k) {
      return '<label class="check"><input type="checkbox" class="tool" data-k="' + k + '"> ' + esc(tl) + '</label>';
    }).join('') + '<div class="inline other"><span>' + esc(A.otherLabel) + '</span><input type="text" id="toolOther" autocomplete="off"></div></div>';
    app.innerHTML = '<div class="card">' +
      qBlock('ai_freq', optList('ai_freq', A.freqOpts), esc(A.freqQ)) +
      '<div id="aiMore" hidden>' + qBlock('tools', toolsHTML, esc(A.toolsQ)) +
      qBlock('AC2', optList('AC2', A.freqOpts), esc(A.ac2Q)) + '</div>' +
      navHTML() + '</div>';
    bindOpts(app, function (id) { if (id === 'ai_freq') $('#aiMore').hidden = cur.ai_freq === A.never; });
    var toolsDone = function () {
      var any = $$('input.tool').some(function (c) { return c.checked; }) || $('#toolOther').value.trim() !== '';
      cur.tools = any ? 1 : undefined; if (any) $('[data-q="tools"]').classList.remove('missing');
    };
    $$('input.tool').forEach(function (c) { c.addEventListener('change', toolsDone); });
    $('#toolOther').addEventListener('input', toolsDone);
    onNext(function () {
      var users = cur.ai_freq && cur.ai_freq !== A.never;
      if (!requireIds(users ? ['ai_freq', 'tools', 'AC2'] : ['ai_freq'])) {
        if (users && !cur.tools) $('#navmsg').textContent = A.toolsErr;
        return;
      }
      var d = { ai_freq: cur.ai_freq, ai_freq_score: A.freqScore[cur.ai_freq] || 0 };
      if (users) {
        $$('input.tool').forEach(function (c) { d[toolKey(A.tools[+c.dataset.k])] = c.checked ? 1 : 0; });
        d.tool_other_text = $('#toolOther').value.trim();
        d.AC2_resp = cur.AC2; d.AC2_pass = cur.AC2 === A.ac2Correct ? 1 : 0;
      }
      if (!users) { rec.data.P2c = d; sendPage('P2c', d); goTerminal('screen', 'no_genai'); return; }
      finishPage('P2c', d);
    });
  };

  PAGES.P3a = function () {
    var qs = C.DEMO.filter(function (q) { return q.id !== 'A3'; }), IND = C.INDUSTRY;
    app.innerHTML = '<div class="card">' + qs.map(function (q) { return qBlock(q.id, optList(q.id, q.opts), esc(q.q)); }).join('') +
      '<div id="indBox" hidden>' + qBlock('industry', optList('industry', IND.opts), esc(IND.q)) + '</div>' + navHTML() + '</div>';
    bindOpts(app, function (id) {
      if (id === 'status') {
        var show = cur.status === IND.showIf; $('#indBox').hidden = !show;
        if (!show) { delete cur.industry; $$('.opt[data-id="industry"]').forEach(function (x) { x.classList.remove('sel'); }); }
      }
    });
    onNext(function () {
      var req = qs.map(function (q) { return q.id; }); if (cur.status === IND.showIf) req.push('industry');
      if (!requireIds(req)) return;
      finishPage('P3a', { QD1: cur.QD1, status: cur.status, industry: cur.status === IND.showIf ? cur.industry : '' });
    });
  };

  PAGES.P3b = function () {
    var a3 = C.DEMO.filter(function (q) { return q.id === 'A3'; })[0];
    app.innerHTML = '<div class="card">' + qBlock('A3', optList('A3', a3.opts), esc(a3.q)) +
      '<div id="b30" hidden><p class="muted">' + esc(C.B30.intro) + '</p>' + qBlock('B30', optList('B30', C.B30.opts), esc(C.B30.q)) + '</div>' + navHTML() + '</div>';
    bindOpts(app, function (id) {
      if (id === 'A3') { var show = cur.A3 === '是'; $('#b30').hidden = !show; if (!show) { delete cur.B30; $$('.opt[data-id="B30"]').forEach(function (x) { x.classList.remove('sel'); }); } }
    });
    onNext(function () {
      var req = ['A3']; if (cur.A3 === '是') req.push('B30');
      if (!requireIds(req)) return;
      var inv = null;
      if (cur.A3 === '否') inv = 0;
      else if (cur.A3 === '是') { var k = C.B30.opts.indexOf(cur.B30); inv = (k >= 0 && k <= 5) ? k + 1 : null; }
      finishPage('P3b', { A3: cur.A3, B30: cur.A3 === '是' ? cur.B30 : '', invest_exp: inv });
    });
  };

  function finlitPage(code, items, withIntro) {
    var F = C.FINLIT, html = withIntro ? '<p>' + esc(F.intro) + '</p>' : '', tfShown = false;
    items.forEach(function (it) {
      if (it.type === 'tf' && !tfShown) { html += '<p class="qtext">' + esc(F.tfStem) + '</p>'; tfShown = true; }
      if (it.type === 'choice') html += qBlock(it.id, optList(it.id, it.opts), esc(it.q));
      else if (it.type === 'tf') html += qBlock(it.id, optList(it.id, F.tfOpts, true), esc(it.q));
      else html += qBlock(it.id, '<div class="inline"><input type="number" id="n_' + it.id + '" step="any"><span>' + esc(it.unit) + '</span>' +
        '<label class="dk"><input type="checkbox" id="dk_' + it.id + '"> ' + esc(F.dk) + '</label></div>', esc(it.q));
    });
    app.innerHTML = '<div class="card">' + html + navHTML() + '</div>';
    bindOpts(app);
    items.filter(function (it) { return it.type === 'number'; }).forEach(function (it) {
      var n = $('#n_' + it.id), dk = $('#dk_' + it.id);
      n.addEventListener('input', function () { cur[it.id] = n.value === '' ? undefined : Number(n.value); });
      dk.addEventListener('change', function () {
        if (dk.checked) { n.value = ''; n.disabled = true; cur[it.id] = F.dk; } else { n.disabled = false; cur[it.id] = undefined; }
      });
    });
    onNext(function () {
      if (!requireIds(items.map(function (it) { return it.id; }))) return;
      var d = {}; items.forEach(function (it) { d[it.id] = cur[it.id]; });
      if (code === 'P4b') {   // 兩頁合計計分
        var all = Object.assign({}, rec.data.P4a || {}, d), score = 0, okv = {};
        F.items.forEach(function (it) { okv[it.id] = all[it.id] === it.correct ? 1 : 0; score += okv[it.id]; });
        d.finlit_score = score; d.finlit_score_qk6cond = score - (okv.QK6 && !okv.QK5 ? 1 : 0);
      }
      finishPage(code, d);
    });
  }
  PAGES.P4a = function () { finlitPage('P4a', C.FINLIT.items.filter(function (it) { return it.type !== 'tf'; }), true); };
  PAGES.P4b = function () { finlitPage('P4b', C.FINLIT.items.filter(function (it) { return it.type === 'tf'; }), false); };

  PAGES.P5 = function () {
    app.innerHTML = '<div class="card">' + qBlock('AC1', optList('AC1', C.AC1.opts), esc(C.AC1.q)) + navHTML() + '</div>';
    bindOpts(app);
    onNext(function () { if (!requireIds(['AC1'])) return; finishPage('P5', { AC1_resp: cur.AC1, AC1_pass: cur.AC1 === C.AC1.correct ? 1 : 0 }); });
  };

  /* 情境漫畫：沿用舊網頁 experiment1.html 的逐格呈現（一次一格、替換式；看完最後一格才能繼續） */
  var comicShown = 1;
  PAGES.P6 = function () {
    var M = C.COMIC, n = M.panels.length, s = rec.snap && rec.snap.P6;
    comicShown = s && s.comic ? s.comic : 1;
    app.innerHTML = '<div class="card"><p class="muted">' + esc(M.intro) + '</p><div class="webtoon" id="comic"></div>' +
      '<div class="cprog" id="cprog"></div>' + navHTML(M.doneBtn) + '</div>';
    var draw = function () {
      var p = M.panels[comicShown - 1];
      $('#comic').innerHTML = '<div class="cpanel"><span class="cnum">' + comicShown + ' / ' + n + '</span>' +
        (p.bubble ? '<div class="cbubble">' + esc(p.bubble) + '</div>' : '') +
        '<img src="' + esc(p.img) + '" alt="情境 ' + comicShown + '"><div class="ccap">' + esc(p.cap) + '</div></div>' +
        (comicShown < n ? '<button type="button" class="btn" id="comicNext">' + esc(M.nextBtn.replace('{i}', comicShown).replace('{n}', n)) + '</button>' : '');
      $('#cprog').textContent = comicShown >= n ? M.doneNote : '';
      $('#next').disabled = comicShown < n;
      var b = $('#comicNext'); if (b) b.onclick = function () { comicShown += 1; draw(); window.scrollTo(0, 0); };
    };
    draw();
    onNext(function () { if (comicShown < n) return; finishPage('P6', { comic_panels_seen: comicShown }); });
  };

  function predictPage(code, field) {
    var N = nText();
    app.innerHTML = '<div class="card">' + qBlock(field, '<div class="inline"><input type="number" id="pred" min="0" max="' + N + '" step="1"><span>' + esc(C.PREDICT.unit) + '</span></div>',
      esc(C.PREDICT.q.replace('{N}', N))) + navHTML() + '</div>';
    $('#pred').addEventListener('input', function () { var v = this.value; cur[field] = (/^\d+$/.test(v) && Number(v) <= N) ? Number(v) : undefined; });
    onNext(function () { if (!requireIds([field])) return; var d = {}; d[field] = cur[field]; finishPage(code, d); });
  }
  PAGES.P7 = function () { predictPage('P7', 'baseline_pred'); };
  PAGES.P13 = function () { predictPage('P13', 'expected_pred'); };

  PAGES.P8 = function () {
    var v = C.VERSIONS[rec.cond];
    var list = '<ol class="ai-list">' + v.items.map(function (it) { return '<li><b>' + esc(it.head) + '</b>：' + esc(it.body) + '</li>'; }).join('') + '</ol>';
    app.innerHTML = '<div class="card"><div class="chat">' +
      '<div class="row-user"><div class="bubble user">' + targetMessageHTML() + '</div></div>' +
      '<div class="row-ai"><div class="avatar">AI</div><div><div class="ainame">' + esc(CFG.AI_NAME) + '</div>' +
      '<div class="bubble ai"><p>' + esc(C.AI_OPEN) + '</p>' + list + '<p>' + esc(C.AI_CLOSE) + '</p></div></div></div>' +
      '</div>' + navHTML(C.READ_DONE) + '</div>';
    onNext(function () { var t = Math.round(performance.now() - pageT0); finishPage('P8', { t_explanation: (rec.times.P8 || 0) + t }); });
  };

  PAGES.P9 = function () {
    var M = C.MC, order = stableOrder('P9', M.items);
    app.innerHTML = '<div class="card"><p>' + esc(M.intro) + '</p>' +
      order.map(function (it) {
        return qBlock(it.id, '<div class="scale">' + M.opts.map(function (o) {
          return '<button type="button" class="opt" data-id="' + it.id + '" data-v="' + esc(o) + '">' + esc(o) + '</button>';
        }).join('') + '</div>', esc(it.q));
      }).join('') + navHTML() + '</div>';
    bindOpts(app);
    onNext(function () {
      if (!requireIds(M.items.map(function (i) { return i.id; }))) return;
      var d = { MC_order: order.map(function (i) { return i.id; }).join('|') };
      M.items.forEach(function (it) { d[it.id] = M.score[cur[it.id]]; d[it.id + '_resp'] = cur[it.id]; });
      d.MC_check = mean(M.items.map(function (it) { return d[it.id]; }));  // 7 題平均（第三章第二節三（六））
      finishPage('P9', d);
    });
  };

  PAGES.P10 = function () {
    var Fl = C.FLUENCY, order = stableOrder('P10', Fl.items);
    app.innerHTML = '<div class="card"><p class="qtext">' + esc(Fl.stem) + '</p>' +
      order.map(function (it) {
        return qBlock(it.id, '<div class="slider-wrap"><span class="lab">' + esc(it.left) + '</span>' +
          '<input type="range" class="untouched" min="1" max="101" step="1" value="51" data-id="' + it.id + '">' +
          '<span class="lab r">' + esc(it.right) + '</span></div>');
      }).join('') + navHTML() + '</div>';
    $$('input[type=range]').forEach(function (r) {
      var set = function () { r.classList.remove('untouched'); cur[r.dataset.id] = Number(r.value); r.closest('.q').classList.remove('missing'); };
      r.addEventListener('pointerdown', set); r.addEventListener('input', set); r.addEventListener('change', set);
    });
    onNext(function () {
      if (!requireIds(Fl.items.map(function (i) { return i.id; }))) return;
      var d = { FL_order: order.map(function (i) { return i.id; }).join('|') };
      Fl.items.forEach(function (it) { d[it.id] = cur[it.id]; });
      d.FL_mean = mean(Fl.items.map(function (it) { return d[it.id]; }));
      finishPage('P10', d);
    });
  };

  /* 認知負荷量表（Krell, 2015, 2017）：version = 'read'（閱讀解釋後，CLr）或 'judge'（判斷任務後，CLj） */
  function krellPage(code, version) {
    var K = C.KRELL, pre = code + '_', vals = [1, 2, 3, 4, 5, 6, 7];
    app.innerHTML = '<div class="card"><p>' + esc(K.intro[version]) + '</p>' +
      K.items.map(function (it) {
        var id = pre + it.n;
        return qBlock(id, '<div class="scale">' + vals.map(function (v) {
          return '<button type="button" class="opt" data-id="' + id + '" data-v="' + v + '" data-num="1">' + v + '</button>';
        }).join('') + '</div><div class="ends three"><span>' + esc(K.labels[1]) + '</span><span>' + esc(K.labels[4]) + '</span><span>' + esc(K.labels[7]) + '</span></div>', esc(it[version]));
      }).join('') + navHTML() + '</div>';
    bindOpts(app);
    onNext(function () {
      var ids = K.items.map(function (it) { return pre + it.n; });
      if (!requireIds(ids)) return;
      var d = {}, ml = [], me = [];
      K.items.forEach(function (it) {
        var raw = cur[pre + it.n], sc = it.rev ? 8 - raw : raw;
        d[pre + it.n] = raw;
        (it.sub === 'ML' ? ml : me).push(sc);
      });
      d[pre + 'ML'] = mean(ml); d[pre + 'ME'] = mean(me);   // 反向題已以 8 減原分數計分
      finishPage(code, d);
    });
  }
  PAGES.CLr = function () { krellPage('CLr', 'read'); };
  PAGES.CLj = function () { krellPage('CLj', 'judge'); };

  /* 理解自評（Rozenblit & Keil, 2002；等級說明依 Chromik et al., 2021）：T0（僅前測）、T1、T1b、T2 題目相同 */
  function selfPage(code) {
    var S = C.SELF, f = 'self_' + code;
    app.innerHTML = '<div class="card"><div class="levels">' + S.levels.map(function (l) { return '<div><b>' + esc(l[0]) + '</b>：' + esc(l[1]) + '</div>'; }).join('') + '</div>' +
      qBlock(f, scale(f, [1, 2, 3, 4, 5, 6, 7], S.left, S.right), esc(S.q)) + navHTML() + '</div>';
    bindOpts(app);
    onNext(function () { if (!requireIds([f])) return; var d = {}; d[f] = cur[f]; finishPage(code, d); });
  }
  PAGES.T0 = function () { selfPage('T0'); };
  PAGES.T1 = function () { selfPage('T1'); };
  PAGES.T1b = function () { selfPage('T1b'); };
  PAGES.T2 = function () { selfPage('T2'); };

  PAGES.P14i = function () {
    app.innerHTML = '<div class="card"><p>' + esc(C.JUDGE.intro.replace('{N}', nText())) + '</p>' + navHTML() + '</div>';
    onNext(function () { finishPage('P14i', {}); });
  };

  /* 判斷任務達成標準（單獨一頁；前測不呈現） */
  PAGES.P14s = function () {
    var k = CFG.STANDARD_K;
    var kTxt = (typeof k === 'number') ? String(k) : '＿';   // 未設定時施測者頁會警告
    app.innerHTML = '<div class="card"><p class="qtext">' + esc(C.STANDARD.replace('{N}', nText()).replace('{K}', kTxt)) + '</p>' + navHTML() + '</div>';
    onNext(function () { finishPage('P14s', { standard_k: (typeof k === 'number') ? k : '' }); });
  };

  function judgmentItems() {
    var pool = C.POOL, ids;
    if (MODE === 'pretest') ids = pool.map(function (p) { return p.id; });
    else if (CFG.FINAL_ITEMS && CFG.FINAL_ITEMS.length) ids = CFG.FINAL_ITEMS.slice();
    else ids = pool.filter(function (p) { return p.answer === 'scam'; }).slice(0, 10).map(function (p) { return p.id; })
      .concat(pool.filter(function (p) { return p.answer === 'real'; }).slice(0, 10).map(function (p) { return p.id; }));
    return CFG.JUDGMENT_ORDER === 'fixed' ? ids : shuffle(ids);
  }
  PAGES.P14 = function () {
    if (!rec.judge) { rec.judge = { order: judgmentItems(), i: 0, ans: {} }; save(); }
    var J = rec.judge, JC = C.JUDGE;
    if (J.i >= J.order.length) { finishJudgment(); return; }
    var id = J.order[J.i], item = C.POOL.filter(function (p) { return p.id === id; })[0];
    var t0 = performance.now(); cur = {};
    app.innerHTML = '<div class="card"><div class="counter">' + esc(JC.counter.replace('{i}', J.i + 1).replace('{n}', J.order.length)) + '</div>' +
      (item.html   // 2026-10-18 起：情境導言＋手機畫面（content.js 的 POOL；html 為研究者轉入的固定版面）
        ? '<div class="jv"><div class="ctx">' + esc(item.ctx) + '</div>' + item.html + '</div>'
        : '<div class="phone">' + (item.sender ? '<div class="sender">' + esc(item.sender) + '</div>' : '') + '<div class="text">' + bracketHTML(item.text) + '</div></div>') +
      qBlock('j', optList('j', [JC.yes, JC.no], true), esc(JC.q1)) +
      '<div id="probBox" hidden>' + qBlock('p', '<div class="scale probrow">' + JC.probs.map(function (p) {
        return '<button type="button" class="opt" data-id="p" data-v="' + p + '" data-num="1">' + p + '%</button>';
      }).join('') + '</div><div class="ends"><span>' + esc(JC.probLabels[50]) + '</span><span>' + esc(JC.probLabels[100]) + '</span></div>', esc(JC.q2)) + '</div>' +
      navHTML() + '</div>';
    addHead('P14');
    bindOpts(app, function (k) { if (k === 'j') $('#probBox').hidden = false; });
    var prev = J.ans[id];
    if (prev) {   // 回上一則：還原已選的答案
      $$('.opt[data-id="j"]', app).forEach(function (b) { if (b.dataset.v === (prev.j ? JC.yes : JC.no)) b.click(); });
      $$('.opt[data-id="p"]', app).forEach(function (b) { if (Number(b.dataset.v) === prev.prob) b.click(); });
    }
    var bk = $('#back'); if (bk) bk.onclick = goBack;
    onNext(function () {
      if (!requireIds(['j', 'p'])) return;
      var rt = Math.round(performance.now() - t0);
      var said = cur.j === JC.yes ? 1 : 0;
      J.ans[id] = { j: said, prob: cur.p, correct: (said === 1) === (item.answer === 'scam') ? 1 : 0, rt: rt + (prev ? prev.rt : 0), pos: J.i + 1,
        refreshed: J.refreshedAt === J.i ? 1 : 0, visits: (prev ? prev.visits || 1 : 0) + 1 };
      sendPage('P14_' + id, J.ans[id]);
      J.i += 1; save(); window.scrollTo(0, 0); PAGES.P14();
    });
  };
  function finishJudgment() {
    var J = rec.judge, d = { J_order: J.order.join('|'), n_items: J.order.length }, nc = 0, probs = [];
    J.order.forEach(function (id) { var a = J.ans[id]; nc += a.correct; probs.push(a.prob); });
    var best = 0, run = 0; probs.forEach(function (p, k) { run = (k > 0 && p === probs[k - 1]) ? run + 1 : 1; best = Math.max(best, run); });
    d.n_correct = nc; d.longstring_prob = best;
    finishPage('P14', d);
  }

  function textPage(code, q, field, minChars) {
    var S = C.SELFEXPL, n = function (v) { return v.replace(/\s/g, '').length; };
    var note = minChars ? '<div class="muted">' + esc(S.minNote.replace('{MIN}', minChars)) + '</div>' : '';
    app.innerHTML = '<div class="card">' + qBlock(field, note + '<textarea id="ta"></textarea>' +
      (minChars ? '<div class="muted" id="cnt">' + esc(S.counter.replace('{N}', 0)) + '</div>' : ''), esc(q)) + navHTML() + '</div>';
    $('#ta').addEventListener('input', function () {
      cur[field] = this.value.trim() ? this.value : undefined;
      if (minChars) $('#cnt').textContent = S.counter.replace('{N}', n(this.value));
    });
    onNext(function () {
      if (!requireIds([field])) return;   // 每一題都必須作答（研究者決定）
      if (minChars && n($('#ta').value) < minChars) {
        $('[data-q="' + field + '"]').classList.add('missing');
        $('#navmsg').textContent = S.tooShort.replace('{MIN}', minChars).replace('{N}', n($('#ta').value));
        return;
      }
      var v = $('#ta').value; var d = {}; d[field] = v; d[field.replace('_text', '_chars')] = v.replace(/\s/g, '').length;
      finishPage(code, d);
    });
  }
  PAGES.P16 = function () {
    var S = C.SELFEXPL, MIN = S.minChars || 0;
    textPage('P16', S.q, 'self_expl_text', MIN);
  };

  PAGES.P18 = function () {
    var qr = '<img class="qr" src="' + esc(CFG.ANSWER_QR_IMG) + '" alt="" onerror="this.outerHTML=\'<p class=muted>【待提供：QR code 圖檔】</p>\'">';
    var h = C.DEBRIEF_HTML.replace('{PID}', esc(rec.pid)).split('{EMAIL}').join(esc(CFG.RESEARCHER_EMAIL))
      .replace('{NAME}', esc(CFG.RESEARCHER_NAME)).replace('{URL}', esc(CFG.ANSWER_URL)).replace('{QR}', qr);
    app.innerHTML = '<div class="card">' + h + navHTML(C.DEBRIEF_BTN) + '</div>';
    onNext(function () { finishPage('P18', {}); });
  };

  PAGES.P19 = function () { finalize(); renderTerminal(); };

  /* ---------------- 結束、匯出 ---------------- */
  var POOL_IDS = C.POOL.map(function (p) { return p.id; });
  function columns() {
    var cols = ['pid', 'mode', 'experimenter', 'email_check', 'cond', 'depth', 'concrete', 'debug', 'start_time', 'end_time', 'consent',
      'screened_out', 'screen_reason', 'refreshes', 'age'];
    cols = cols.concat(['ai_freq', 'ai_freq_score']);
    C.AIUSE.tools.forEach(function (tl) { cols.push(toolKey(tl)); });
    cols = cols.concat(['tool_other_text', 'AC2_resp', 'AC2_pass', 'QD1', 'status', 'industry', 'A3', 'B30', 'invest_exp',
      'QK3', 'QK4', 'QK5', 'QK6', 'QK7_1', 'QK7_2', 'QK7_3', 'finlit_score', 'finlit_score_qk6cond', 'AC1_resp', 'AC1_pass',
      'baseline_pred', 'self_T0', 't_explanation']);
    C.MC.items.forEach(function (it) { cols.push(it.id); });
    cols = cols.concat(['MC_check', 'MC_order', 'FL1', 'FL2', 'FL3', 'FL4', 'FL5', 'FL_mean', 'FL_order']);
    C.KRELL.items.forEach(function (it) { cols.push('CLr_' + it.n); });
    cols = cols.concat(['CLr_ML', 'CLr_ME', 'self_T1', 'expected_pred', 'self_T1b', 'self_expl_text', 'self_expl_chars', 'self_T2', 'standard_k']);
    POOL_IDS.forEach(function (id) { cols.push('J_' + id, 'J_prob_' + id, 'J_correct_' + id, 'J_rt_' + id, 'J_pos_' + id); });
    cols = cols.concat(['J_order', 'n_items', 'n_correct', 'longstring_prob']);
    C.KRELL.items.forEach(function (it) { cols.push('CLj_' + it.n); });
    cols = cols.concat(['CLj_ML', 'CLj_ME', 'comic_panels_seen', 'n_back', 'back_log']);
    ALL_PAGES.forEach(function (p) { cols.push('t_' + p); });
    return cols;
  }
  function wideRow() {
    var r = { pid: rec.pid, mode: rec.mode, experimenter: rec.experimenter, email_check: rec.email_check, cond: rec.cond, depth: rec.depth,
      concrete: rec.concrete, debug: rec.debug ? 1 : 0, start_time: rec.start_time, end_time: rec.end_time, consent: rec.consent,
      screened_out: rec.screened_out, screen_reason: rec.screen_reason, refreshes: rec.refreshes,
      n_back: (rec.backs || []).length, back_log: (rec.backs || []).join('|') };
    Object.keys(rec.data).forEach(function (pg) { Object.keys(rec.data[pg]).forEach(function (k) { if (!(k in r)) r[k] = rec.data[pg][k]; }); });
    if (rec.judge) Object.keys(rec.judge.ans).forEach(function (id) {
      var a = rec.judge.ans[id]; r['J_' + id] = a.j; r['J_prob_' + id] = a.prob; r['J_correct_' + id] = a.correct; r['J_rt_' + id] = a.rt; r['J_pos_' + id] = a.pos;
    });
    ALL_PAGES.forEach(function (p) { if (rec.times[p] !== undefined) r['t_' + p] = rec.times[p]; });
    return r;
  }
  function csvCell(v) { if (v === null || v === undefined) return ''; v = String(v); return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function download(name, text, type) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: type }));
    a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function finalize() {
    if (rec.done) return;
    rec.end_time = nowISO(); rec.done = true;
    var row = wideRow(), cols = columns();
    enqueue({ id: uid(), kind: 'final', pid: rec.pid, mode: rec.mode, columns: cols, row: cols.map(function (c) { return row[c] === undefined ? '' : row[c]; }), ts: nowISO() });
    if (!DEBUG) { var used = ls('exp:done:' + MODE) || []; if (used.indexOf(rec.pid) < 0) used.push(rec.pid); ls('exp:done:' + MODE, used); }
    save(); ls(KEY_CUR, null);
    var base = rec.pid + '_' + rec.mode + '_' + rec.end_time.slice(0, 10);
    download(base + '.json', JSON.stringify(rec, null, 1), 'application/json');
    download(base + '.csv', '﻿' + cols.join(',') + '\r\n' + cols.map(function (c) { return csvCell(row[c]); }).join(',') + '\r\n', 'text/csv');
  }
  function renderTerminal() {
    $('#progress').hidden = true;
    var txt = rec.terminal === 'screen' ? C.SCREEN_END : C.END;
    app.innerHTML = '<div class="card"><h2>' + esc(txt) + '</h2></div><div class="card tools" id="status"></div>';
    var upd = function () {
      var n = queue().length;
      $('#status').innerHTML = '<b>給施測人員</b>：編號 ' + esc(rec.pid) + '；' +
        (DEBUG ? '測試模式，未送出雲端。' : !CFG.DATA_ENDPOINT ? '<span class="bad">尚未設定雲端網址，資料只存在本機備份檔。</span>' :
          n ? '<span class="bad">尚有 ' + n + ' 筆資料等待送出（請勿關閉此頁，網路恢復後會自動送出）。</span>' : '<span class="ok">雲端資料已全部送出。</span>') +
        (rec.email_check === 'pending' ? '<br><span class="bad">Email 重複參加檢查因網路中斷未完成。備用做法：請以此人紙本同意書上的姓名，比對前測與研究一的紙本同意書；若曾參加，請在施測紀錄表註記編號 ' + esc(rec.pid) + ' 為重複參加（分析時排除）。</span>' : '') +
        '<br><button class="btn secondary" id="newp" style="margin-top:10px">下一位參與者</button>';
      $('#newp').onclick = function () { location.href = location.pathname + (window.EXP_MODE ? '' : '?mode=' + MODE); };
    };
    upd(); setInterval(function () { flush(); upd(); }, 5000);
  }

  /* ---------------- P0 施測者頁 ---------------- */
  function renderP0(warn) {
    $('#progress').hidden = true;
    var done = ls('exp:done:' + MODE) || [];
    var recs = Object.keys(localStorage).filter(function (k) { return k.indexOf('exp:rec:') === 0; });
    var pend = recs.filter(function (k) { var r = ls(k); return r && /pending/.test(r.email_check); }).length;
    var tc = window.TEXT_CHECK;
    var startCard = ADMIN
      ? '<div class="card"><h2>施測者工具（' + esc(C.MODES[MODE].label) + '）</h2>' +
        (warn ? '<p class="bad">' + esc(warn) + '</p>' : '') +
        '<p class="small">此畫面只給研究人員使用，請勿讓參與者看到這個網址。參與者編號平時由系統自動發給；只有無法連線時，才在下方手動輸入編號後按「開始」。</p>' +
        '<div class="q" id="manualBox"><div class="qtext">參與者編號（手動輸入；留空則自動發號）</div><input type="text" id="pid" autocomplete="off"></div>' +
        '<div class="navrow"><span class="navmsg" id="navmsg"></span><button class="btn" id="start">開始</button></div></div>'
      : '<div class="card"><h2>' + esc(C.CONSENT.title) + '</h2>' +
        (warn ? '<p class="bad">' + esc(warn) + '</p>' : '') +
        '<p>請等候研究人員說明後，再按「開始」。</p>' +
        '<div class="navrow"><span class="navmsg" id="navmsg"></span><button class="btn" id="start">開始</button></div></div>';
    if (!ADMIN) { app.innerHTML = startCard; }
    else app.innerHTML = startCard +
      '<div class="card tools"><b>檢查項目</b><table>' +
      '<tr><td>文本檢查</td><td>' + (tc && tc.ok ? '<span class="ok">通過（六版各 400 字）</span>' : '<span class="bad">未通過：' + esc(tc ? tc.messages.join('；') : '未執行') + '</span>') + '</td></tr>' +
      '<tr><td>雲端網址</td><td>' + (CFG.DATA_ENDPOINT ? '<span class="ok">作答已設定</span>' : '<span class="bad">作答未設定</span>') + '；' +
      (CFG.CONTACT_ENDPOINT ? '<span class="ok">Email 已設定</span>' : '<span class="bad">Email 未設定</span>') + '</td></tr>' +
      '<tr><td>同意書聯絡資訊</td><td>' + (CFG.INSTITUTION && CFG.ADVISOR && !/待提供/.test(CFG.RESEARCHER_NAME + CFG.RESEARCHER_EMAIL) ? '<span class="ok">已填寫</span>' : '<span class="bad">未填寫完整（content.js 的 INSTITUTION、RESEARCHER_NAME、RESEARCHER_EMAIL、ADVISOR）</span>') + '</td></tr>' +
      '<tr><td>回上一頁</td><td>' + ((CFG.BACK_BLOCKED || []).length ? '不可回到：' + esc(CFG.BACK_BLOCKED.join('、')) : '每頁都可回上一頁') + '</td></tr>' +
      (MODE !== 'pretest' ? '<tr><td>達成標準</td><td>' + (typeof CFG.STANDARD_K === 'number' ? '<span class="ok">答對 ' + CFG.STANDARD_K + ' 則以上</span>' : '<span class="bad">未設定（content.js 的 STANDARD_K，前測後填入）</span>') + '</td></tr>' : '') +
      '<tr><td>本機已完成編號</td><td>' + (done.length ? esc(done.join('、')) : '（無）') + '</td></tr>' +
      '<tr><td>未送出筆數</td><td>' + queue().length + '</td></tr>' +
      '<tr><td>Email 檢查待確認</td><td>' + pend + ' 人</td></tr></table>' +
      '<button class="btn secondary" id="exportAll">匯出本機全部作答資料</button> ' +
      '<button class="btn secondary" id="wipe">刪除本機全部作答資料</button></div>';
    function startWith(pid, ex) {
      var table = (window.ASSIGNMENT || {})[MODE] || {}, msg = $('#navmsg');
      if (!table[pid]) { msg.textContent = ADMIN ? '編號 ' + pid + ' 不在' + C.MODES[MODE].label + '名單內（名單已發完或輸入錯誤）。' : '目前無法開始，請舉手告知研究人員。'; return false; }
      if (done.indexOf(pid) >= 0 || ls('exp:rec:' + MODE + ':' + pid)) { msg.textContent = ADMIN ? '此電腦已使用過編號 ' + pid + '，請確認。' : '目前無法開始，請舉手告知研究人員。'; return false; }
      rec = newRecord(pid, ex, table[pid]); ls(KEY_CUR, { mode: MODE, pid: pid }); save();
      enterExperiment(); return true;
    }
    // 自動發號（2026-10-19）：向作答資料 Apps Script 取得下一個編號。請求代碼存在本機，網路逾時後重按「開始」會拿回同一個編號。
    function claimPid(ex) {
      var req = ls('exp:claimReq:' + MODE) || uid(); ls('exp:claimReq:' + MODE, req);
      var ctl = new AbortController(); var tm = setTimeout(function () { ctl.abort(); }, 15000);
      return fetch(CFG.DATA_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ secret: CFG.SHARED_SECRET, kind: 'claim', mode: MODE, exp: ex, req: req }), signal: ctl.signal })
        .then(function (r) { clearTimeout(tm); return r.json(); })
        .then(function (j) { if (!j || !j.ok || !j.pid) throw new Error((j && j.error) || 'bad'); return j.pid; });
    }
    $('#start').onclick = function () {
      var ex = '', msg = $('#navmsg'), btn = $('#start');  // 只有研究者一人施測，不記施測者代號（2026-10-19）
      var manual = ADMIN ? $('#pid').value.trim().toUpperCase() : '';
      var help = ADMIN ? '若一直失敗，請在上方手動輸入編號。' : '若一直失敗，請舉手告知研究人員。';
      if (manual) { startWith(manual, ex); return; }
      if (!CFG.DATA_ENDPOINT) { msg.textContent = '尚未設定雲端網址，無法自動發號。' + help; return; }
      btn.disabled = true; msg.textContent = '正在取得參與者編號…';
      claimPid(ex).then(function (pid) {
        localStorage.removeItem('exp:claimReq:' + MODE);
        if (!startWith(pid, ex)) btn.disabled = false;
      }).catch(function () {
        btn.disabled = false;
        msg.textContent = '目前無法開始，請確認網路後再按一次「開始」。' + help;
      });
    };
    if (!ADMIN) return;
    $('#exportAll').onclick = function () {
      var all = {}; Object.keys(localStorage).filter(function (k) { return k.indexOf('exp:rec:') === 0; }).forEach(function (k) { all[k] = ls(k); });
      download('本機作答資料_' + nowISO().slice(0, 10) + '.json', JSON.stringify({ records: all, queue: queue() }, null, 1), 'application/json');
    };
    $('#wipe').onclick = function () {
      if (!confirm('確定要刪除這台電腦上的全部作答資料嗎？請先確認雲端已收到並已匯出備份。')) return;
      if (!confirm('再確認一次：刪除後無法復原。')) return;
      Object.keys(localStorage).filter(function (k) { return k.indexOf('exp:') === 0; }).forEach(function (k) { localStorage.removeItem(k); });
      renderP0('已刪除本機作答資料。');
    };
  }

  /* ---------------- 防止返回與誤關 ---------------- */
  function enterExperiment() {
    history.pushState(null, '', location.href);
    window.addEventListener('popstate', function () { history.pushState(null, '', location.href); });
    window.addEventListener('beforeunload', function (e) { if (rec && !rec.done) { e.preventDefault(); e.returnValue = ''; } });
    // 重新整理或關閉時，把目前頁已停留的時間累加保存（重新進入後繼續累計）
    window.addEventListener('pagehide', function () { if (rec && !rec.done && !rec.terminal) { leavePage(rec.flow[rec.idx]); save(); } });
    if (rec.judge && rec.flow[rec.idx] === 'P14') rec.judge.refreshedAt = rec.judge.i;
    render();
  }

  /* ---------------- 啟動 ---------------- */
  function boot() {
    if (!FLOWS[MODE]) {
      app.innerHTML = '<div class="card"><h2>請選擇實驗網頁</h2><p><a href="pretest.html">前測（依研究二程序）</a><br><a href="study1.html">研究一</a><br><a href="study2.html">研究二</a></p></div>';
      return;
    }
    if (DEBUG) {
      $('#debugBadge').hidden = false;
      var cond = (params.get('cond') || '').toUpperCase();
      if (!C.VERSIONS[cond]) cond = 'ABCDEF'[Math.floor(Math.random() * 6)];
      rec = newRecord('DEBUG-' + Date.now().toString(36), 'debug', cond);
      var start = params.get('start'); if (start && rec.flow.indexOf(start) >= 0) rec.idx = rec.flow.indexOf(start);
      enterExperiment(); return;
    }
    var c = ls(KEY_CUR);
    if (c) {
      var r = ls('exp:rec:' + c.mode + ':' + c.pid);
      if (r && !r.done) {
        if (c.mode !== MODE) { renderP0('此電腦有一位' + C.MODES[c.mode].label + '參與者（' + c.pid + '）尚未完成，請改用該模式的網址繼續。'); return; }
        rec = r; rec.refreshes += 1; save(); enterExperiment(); return;
      }
    }
    renderP0();
    flush();
  }
  boot();
})();
