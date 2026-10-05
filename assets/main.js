(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var START = new Date(document.body.getAttribute('data-start')).getTime();
  var pad = function (n) { return n < 10 ? '0' + n : '' + n; };

  /* шапка, мини-таймер, нижняя панель на телефоне, параллакс при прокрутке */
  var hdr = $('.hdr'), hero = $('.hero'), mcta = $('.mcta');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var hh = hero ? hero.offsetHeight : 420;
    if (hdr) {
      hdr.classList.toggle('solid', y > 24);
      hdr.classList.toggle('cd-on', y > hh * 0.7);
    }
    if (mcta) mcta.classList.toggle('on', y > hh * 0.6);
    if (hero && !reduce) hero.style.setProperty('--sy', Math.min(1, Math.max(0, y / hh)).toFixed(3));
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* меню */
  var burger = $('.burger'), nav = $('#nav');
  if (burger && nav) {
    var set = function (open) { burger.setAttribute('aria-expanded', open); nav.classList.toggle('open', open); };
    burger.addEventListener('click', function () { set(burger.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  }

  /* обратный отсчёт */
  var units = $$('[data-u]'), mini = $$('[data-mini]'), mctaT = $('[data-mcta]');
  function tick() {
    var d = START - Date.now();
    if (d < 0) d = 0;
    var dd = Math.floor(d / 864e5), hh = Math.floor(d / 36e5) % 24, mm = Math.floor(d / 6e4) % 60, ss = Math.floor(d / 1e3) % 60;
    var v = { d: dd, h: pad(hh), m: pad(mm), s: pad(ss) };
    units.forEach(function (el) { el.textContent = v[el.getAttribute('data-u')]; });
    var short = dd + ' д ' + pad(hh) + ':' + pad(mm) + ':' + pad(ss);
    mini.forEach(function (el) { el.textContent = short; });
    if (mctaT) mctaT.textContent = 'До гонга ' + short;
  }
  tick(); setInterval(tick, 1000);

  /* появление при прокрутке: прячем только то, что ниже первого экрана */
  if ('IntersectionObserver' in window) {
    root.classList.add('js');
    var vh = window.innerHeight;
    var items = $$('.rv').filter(function (el) { return el.getBoundingClientRect().top > vh * 0.98; });
    var cmps = $$('.cmp');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.remove('rv-pre');
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { el.classList.add('rv-pre'); io.observe(el); });
    cmps.forEach(function (el) { if (el.getBoundingClientRect().top < vh) el.classList.add('in'); else io.observe(el); });
  } else {
    $$('.cmp').forEach(function (el) { el.classList.add('in'); });
  }

  /* счётчики */
  $$('[data-n]').forEach(function (el) {
    var n = parseFloat(el.getAttribute('data-n'));
    if (reduce || !('IntersectionObserver' in window)) return;
    var done = false;
    new IntersectionObserver(function (es, o) {
      if (done || !es[0].isIntersecting) return;
      done = true; o.disconnect();
      var t0 = performance.now(), dur = 1100;
      (function step(t) {
        var p = Math.min(1, (t - t0) / dur), k = 1 - Math.pow(1 - p, 3);
        el.firstChild.nodeValue = String(Math.round(n * k));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }, { threshold: 0.6 }).observe(el);
  });

  /* параллакс героя от курсора (только мышь) */
  if (hero && !reduce && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    var raf = 0, px = 0, py = 0;
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width * 2 - 1;
      py = (e.clientY - r.top) / r.height * 2 - 1;
      if (!raf) raf = requestAnimationFrame(function () { raf = 0; hero.style.setProperty('--px', px.toFixed(3)); hero.style.setProperty('--py', py.toFixed(3)); });
    });
    hero.addEventListener('pointerleave', function () { hero.style.setProperty('--px', 0); hero.style.setProperty('--py', 0); });
  }

  /* подсветка карточек за курсором */
  $$('.fc').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* фильтр бойцов по дисциплине */
  var filters = $$('[data-filter]');
  if (filters.length) {
    var cards = $$('[data-d]'), groups = $$('[data-group]'), counter = $('[data-count]');
    var word = function (n) { var m = n % 10, c = n % 100; return n + (m === 1 && c !== 11 ? ' боец' : (m >= 2 && m <= 4 && (c < 12 || c > 14) ? ' бойца' : ' бойцов')); };
    var apply = function (d) {
      var shown = 0;
      cards.forEach(function (c) { var ok = d === 'all' || c.getAttribute('data-d') === d; c.hidden = !ok; if (ok) shown++; });
      groups.forEach(function (g) { g.hidden = !g.querySelector('[data-d]:not([hidden])'); });
      filters.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-filter') === d); });
      if (counter) counter.textContent = word(shown);
    };
    filters.forEach(function (b) { b.addEventListener('click', function () { apply(b.getAttribute('data-filter')); }); });
  }

  /* лента новостей */
  var rail = $('.rail');
  $$('[data-rail]').forEach(function (b) {
    b.addEventListener('click', function () {
      rail.scrollBy({ left: parseInt(b.getAttribute('data-rail'), 10) * Math.min(rail.clientWidth * 0.8, 640), behavior: reduce ? 'auto' : 'smooth' });
    });
  });
})();
