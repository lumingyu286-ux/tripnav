/* 出行导航 --------------------------------------------------- */
(function () {
  'use strict';

  /* 第一件事：标记脚本已启动，把 HTML 里的 .boot 兜底块藏掉。
     app.js 被拦截时这行不会执行，兜底块就留在页面上，
     访客至少看到一句解释而不是一片空白。

     paintError() 注入的提示框用 .notice 而不是 .boot ——
     同名会被 .js-ok .boot{display:none} 一起藏掉，等于白写。 */
  document.documentElement.className += ' js-ok';

  var FAV_KEY   = 'tn-favs';
  var THEME_KEY = 'tn-theme';
  var ADULT_KEY = 'tn-adult-ok';

  var $ = function (id) { return document.getElementById(id); };

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); }
    catch (e) { return String(url).replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, ''); }
  }

  /* --- 主题 ----------------------------------------------
     当前主题记在模块变量里，localStorage 只当尽力而为的持久化。
     每次回头读存储的话，隐私模式下写入失败、系统主题一翻转
     就把用户的手动选择改回去了。 */

  var themeNow = 'dark';
  var userPicked = false;

  function systemTheme() {
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)
      ? 'light' : 'dark';
  }

  function applyTheme(t) {
    themeNow = (t === 'light') ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', themeNow);
    var btn = $('theme');
    /* 可见文字是「切换主题」，aria-label 必须包含它，
       否则语音控制念可见文字匹配不到这个按钮（WCAG 2.5.3）。 */
    if (btn) btn.setAttribute('aria-label', '切换主题，当前' + (themeNow === 'light' ? '浅色' : '深色'));
  }

  function initTheme() {
    var saved = load(THEME_KEY);
    userPicked = (saved === 'light' || saved === 'dark');
    applyTheme(userPicked ? saved : systemTheme());

    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: light)');
      var follow = function () { if (!userPicked) applyTheme(systemTheme()); };
      if (mq.addEventListener) mq.addEventListener('change', follow);
      else if (mq.addListener) mq.addListener(follow);
    }

    var btn = $('theme');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = themeNow === 'light' ? 'dark' : 'light';
      userPicked = true;
      store(THEME_KEY, next);
      applyTheme(next);
    });
  }

  /* --- 收藏 ---------------------------------------------- */

  var favs = [];

  function loadFavs() {
    try {
      var raw = JSON.parse(load(FAV_KEY) || '[]');
      favs = Object.prototype.toString.call(raw) === '[object Array]' ? raw : [];
    } catch (e) { favs = []; }
  }

  function isFav(url) {
    for (var i = 0; i < favs.length; i++) { if (favs[i] === url) return true; }
    return false;
  }

  function toggleFav(url) {
    var out = [], found = false;
    for (var i = 0; i < favs.length; i++) {
      if (favs[i] === url) { found = true; } else { out.push(favs[i]); }
    }
    if (!found) out.push(url);
    favs = out;
    store(FAV_KEY, JSON.stringify(favs));
  }

  /* --- 条目 ---------------------------------------------- */

  function makeItem(rec) {
    var wrap = document.createElement('div');
    wrap.className = 'item';

    var a = document.createElement('a');
    a.className = 'item-link';
    a.dataset.url = rec.url;
    a.dataset.name = rec.name;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    if (rec.adult) {
      /* 成人条目不给真 href：中键点击、右键「在新标签页打开」
         都不触发 click 事件，有真地址就能绕过年龄确认。
         地址放 data-url，由 click 处理器确认后再 open。 */
      a.dataset.adult = '1';
      a.href = '#';
      a.removeAttribute('target');
    } else {
      a.href = rec.url;
    }

    var n = document.createElement('span');
    n.className = 'item-name';
    n.textContent = rec.name;

    if (rec.adult) {
      var b = document.createElement('span');
      b.className = 'item-badge';
      b.textContent = '18+';
      n.appendChild(b);
    }
    a.appendChild(n);

    if (rec.note) {
      var p = document.createElement('span');
      p.className = 'item-note';
      p.textContent = rec.note;
      a.appendChild(p);
    }

    var h = document.createElement('span');
    h.className = 'item-host';
    h.textContent = hostOf(rec.url);
    a.appendChild(h);

    wrap.appendChild(a);

    var star = document.createElement('button');
    star.type = 'button';
    star.className = 'star';
    star.dataset.url = rec.url;
    star.dataset.name = rec.name;
    paintStar(star, isFav(rec.url));
    wrap.appendChild(star);

    return wrap;
  }

  function paintStar(btn, on) {
    btn.textContent = on ? '★' : '☆';
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', (on ? '取消收藏 ' : '收藏 ') + (btn.dataset.name || ''));
  }

  /* --- 渲染 ----------------------------------------------
     折叠用原生 <details>：展开收起、Enter/空格、读屏器语义
     全由浏览器负责，不用自己造一套 ARIA 开关。 */

  function paintAll() {
    $('brand-name').textContent = SITE.name || '出行导航';
    $('brand-tag').textContent = SITE.tagline || '';
    document.title = (SITE.name || '出行导航') + ' - 机票、火车、住宿与签证网址分类';
    $('foot-note').textContent = SITE.deployedOn
      ? '本页部署在 ' + SITE.deployedOn + '，收藏只存在你这台设备上。'
      : '收藏只存在你这台设备上，换浏览器就没了。';

    var host = $('groups');

    GROUPS.forEach(function (g, gi) {
      var title = g[0], glyph = g[1], rows = g[2] || [];

      var sect = document.createElement('details');
      sect.className = 'sect';
      sect.dataset.group = title;
      /* 第一个分类默认展开 —— 也就是成人内容，打开即在最显眼处 */
      if (gi === 0) sect.open = true;

      var sum = document.createElement('summary');
      sum.className = 'sum';

      var sg = document.createElement('span');
      sg.className = 'sum-glyph';
      sg.textContent = glyph || '';
      sg.setAttribute('aria-hidden', 'true');

      var st = document.createElement('span');
      st.textContent = title;

      var sc = document.createElement('span');
      sc.className = 'sum-count';
      sc.textContent = rows.length + ' 个';

      var ss = document.createElement('span');
      ss.className = 'sum-sign';
      ss.setAttribute('aria-hidden', 'true');

      sum.appendChild(sg);
      sum.appendChild(st);
      sum.appendChild(sc);
      sum.appendChild(ss);
      sect.appendChild(sum);

      var rowsBox = document.createElement('div');
      rowsBox.className = 'rows';

      rows.forEach(function (row) {
        var rec = {
          name: row[0], url: row[1], note: row[2] || '',
          adult: row[3] === 'adult', group: title
        };
        rowsBox.appendChild(makeItem(rec));
      });

      sect.appendChild(rowsBox);
      host.appendChild(sect);
    });
  }

  /* 收藏按钮用事件委托：条目会被重绘，逐个绑定会丢 */
  function wireStars() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.star') : null;
      if (!btn) return;
      var url = btn.dataset.url;
      toggleFav(url);
      var all = document.querySelectorAll('.star[data-url="' + cssEscape(url) + '"]');
      for (var i = 0; i < all.length; i++) paintStar(all[i], isFav(url));
    });
  }

  function cssEscape(s) { return String(s).replace(/["\\]/g, '\\$&'); }

  /* --- 成人条目确认 --------------------------------------
     只拦这一条，其余链接照常直达。整站弹门会把 12306、Booking
     也锁在 18+ 警告后面，既荒唐也劝退正常访客。          */

  var pending = null;
  var adultOk = false;
  var opener = null;

  function askOpen() { return !$('ask').hidden; }

  function openAsk(from) {
    opener = from || null;
    $('ask').hidden = false;
    /* 背景设 inert：否则 Tab 能走到遮罩后面的链接，
       aria-modal 只影响读屏器，管不住键盘焦点。
       inert 不是所有引擎都有（Safari < 15.5、Firefox < 112），
       所以下面还有一道焦点环绕兜底，两者都要。 */
    var shell = $('shell');
    if ('inert' in shell) shell.inert = true;
    /* 遮罩自己能滚，但背后的页面不该跟着滚 */
    document.body.style.overflow = 'hidden';
    $('ask-ok').focus();
  }

  function closeAsk() {
    $('ask').hidden = true;
    var shell = $('shell');
    if ('inert' in shell) shell.inert = false;
    document.body.style.overflow = '';
    pending = null;
    /* 焦点还给触发的链接，否则键盘用户被丢回 <body>。
       先解除 inert 再聚焦，而且目标必须是当前可见的。 */
    if (opener && document.contains(opener) && opener.offsetParent !== null) {
      try { opener.focus(); } catch (e) {}
    }
    opener = null;
  }

  function wireAdult() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('.item-link') : null;
      if (!a || a.dataset.adult !== '1') return;

      e.preventDefault();
      var url = a.dataset.url;
      if (!url) return;

      if (adultOk || load(ADULT_KEY) === '1') {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }

      pending = url;
      $('ask-name').textContent = a.dataset.name || '该站点';
      openAsk(a);
    });

    $('ask-ok').addEventListener('click', function () {
      adultOk = true;
      store(ADULT_KEY, '1');
      var url = pending;
      closeAsk();
      /* 在按钮的点击处理里 open，属于用户手势，不会被拦成弹窗 */
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    });

    $('ask-no').addEventListener('click', closeAsk);

    document.addEventListener('keydown', function (e) {
      if (!askOpen()) return;

      if (e.key === 'Escape') { closeAsk(); return; }

      /* 焦点环绕：没有 inert 的引擎上，Tab 会直接走到遮罩
         后面的搜索框和链接去，年龄确认就被绕过了。
         在两个按钮之间手动兜一圈。 */
      if (e.key !== 'Tab') return;
      var first = $('ask-ok'), last = $('ask-no');
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      } else if (document.activeElement !== first && document.activeElement !== last) {
        e.preventDefault(); first.focus();
      }
    });
  }

  /* --- 查找 ----------------------------------------------
     命中的分区自动展开，没命中的整块藏掉。清空时恢复成
     「只有第一个展开」的初始状态。 */

  var ENGINES = {
    baidu:  'https://www.baidu.com/s?wd=',
    bing:   'https://www.bing.com/search?q=',
    google: 'https://www.google.com/search?q='
  };

  var ready = false;      // paintAll 真的跑完了才置 true
  var searching = false;  // 上一次 filter 是不是处于查找状态

  function filter(q) {
    /* 只看 GROUPS 不够：SITE 未定义、或 paintAll 中途抛错时
       GROUPS 可能是好的，filter 照样会往 paintError 的提示框
       下面再贴一句「没有匹配…的站点」，自相矛盾。
       以渲染是否成功为准。 */
    if (!ready) return;

    var key = q.trim().toLowerCase();
    var sects = document.querySelectorAll('#groups .sect');
    var total = 0;

    for (var i = 0; i < sects.length; i++) {
      var items = sects[i].querySelectorAll('.item');
      var shown = 0;

      for (var j = 0; j < items.length; j++) {
        var link = items[j].querySelector('.item-link');
        var hay = (link.textContent + ' ' + sects[i].dataset.group + ' ' +
                   (link.dataset.url || '')).toLowerCase();
        var hit = !key || hay.indexOf(key) !== -1;
        items[j].hidden = !hit;
        if (hit) shown++;
      }

      /* 没有关键词时一律显示：否则条目为空的分类（比如占位的
         ['备用','◇',[]]）会在第一次查找之后永久消失，刷新才回来。 */
      sects[i].hidden = !!key && shown === 0;

      var c = sects[i].querySelector('.sum-count');
      if (c) c.textContent = shown + ' 个';

      /* 有关键词时命中的全展开；只有从「查找中」回到空才重置展开态。
         无条件重置的话，切换搜索引擎下拉（会调 filter('')）
         就把用户手动展开的分区收起来了。 */
      if (key) sects[i].open = shown > 0;
      else if (searching) sects[i].open = (i === 0);

      total += shown;
    }

    searching = !!key;

    var empty = $('empty');
    if (key && total === 0) {
      empty.textContent = '没有匹配「' + q.trim() + '」的站点。换个词，或者用上面的下拉切到百度、Bing、Google 直接搜。';
      empty.hidden = false;
    } else {
      empty.hidden = true;
    }
  }

  function wireFind() {
    var input = $('find');

    input.addEventListener('input', function () {
      if ($('engine').value === 'local') filter(input.value);
    });

    $('engine').addEventListener('change', function () {
      filter($('engine').value === 'local' ? input.value : '');
    });

    $('find-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var q = input.value.trim();
      var eng = $('engine').value;
      if (eng === 'local') { filter(q); return; }
      if (!q) { input.focus(); return; }
      window.open(ENGINES[eng] + encodeURIComponent(q), '_blank', 'noopener,noreferrer');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      /* 确认框开着时别抢焦点：焦点会跳到遮罩后面看不见的输入框 */
      if (askOpen()) return;
      var t = e.target;
      var tag = t && t.tagName ? t.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || (t && t.isContentEditable)) return;
      e.preventDefault();
      input.focus();
      input.select();
    });
  }

  /* --- 出问题时的兜底 ------------------------------------ */

  function paintError(kind) {
    var host = $('groups');
    host.textContent = '';

    var box = document.createElement('div');
    box.className = 'notice';
    var h = document.createElement('h2');
    h.textContent = kind === 'data' ? '网址数据没能加载' : '网址数据格式有问题';
    var p = document.createElement('p');
    p.textContent = kind === 'data'
      ? '刷新一下通常就好。如果反复失败，说明 sites.js 被拦截了。'
      : '检查 sites.js 里每个分类是不是 [分类名, 角标, [条目...]] 这三项。';
    box.appendChild(h);
    box.appendChild(p);
    host.appendChild(box);
  }

  /* --- 启动 ---------------------------------------------- */

  try { initTheme(); } catch (e) {}
  try { loadFavs(); } catch (e) {}

  var problem = '';
  try {
    if (typeof SITE === 'undefined' || typeof GROUPS === 'undefined') problem = 'data';
    else { paintAll(); ready = true; }
  } catch (e) {
    problem = 'render';
  }
  if (problem) { try { paintError(problem); } catch (e) {} }

  /* 事件绑定各自独立 try，且绝不走 paintError —— 那会清空
     已经渲染好的内容，再甩出一句「检查 sites.js 格式」，
     而 sites.js 其实毫无问题。 */
  try { wireStars(); } catch (e) {}
  try { wireAdult(); } catch (e) {}
  try { wireFind(); }  catch (e) {}

  $('shell').hidden = false;
})();
