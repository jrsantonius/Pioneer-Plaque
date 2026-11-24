/* ---------- language (DNA TIS, 20 Nov 2026): English is the core copy, Indonesian is the second language ----------
   Every string in the source is English. I18N_ID (i18n-id.js) maps each English string to its Indonesian version.
   - t(s, params): text JS builds with numbers or names, e.g. t('Step {n} of 4', { n: 2 }).
   - Everything else (markup, attributes, whole strings JS writes into the page) is translated in place by a walker and a
     MutationObserver, so a plain English string in the code needs no wrapper. Album pages (.pg) hold the buyer's own
     content and are never touched. The choice is kept in localStorage; ?lang=id or ?lang=en in the URL sets it. */
var LANG = (function () {
  try {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'id' || q === 'en') { localStorage.setItem('imz-lang', q); return q; }
    if (/^\/imazine\/admin\//.test(location.pathname)) return 'id';   /* mode admin (edit pesanan): tim memakai bahasa Indonesia */
    return localStorage.getItem('imz-lang') === 'id' ? 'id' : 'en';
  } catch (e) { return 'en'; }
})();
function _t(s, p) { return t(s, p); }   /* same as t(), for code where a local variable is named t */
function t(s, p) {
  var r = LANG === 'id' && I18N_ID[s] != null ? I18N_ID[s] : s;
  return p ? r.replace(/\{(\w+)\}/g, function (m, k) { return p[k] != null ? p[k] : m; }) : r;
}
var I18N_ATTRS = ['aria-label', 'placeholder', 'alt', 'title'], I18N_SKIP = '.pg, svg, script, style, textarea, [data-noi18n]';
var i18nText = new WeakMap(), i18nAttr = new WeakMap(), i18nObs = null;
function i18nKey(s) { return s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim(); }
function i18nTr(orig) {
  var k = i18nKey(orig);
  if (LANG !== 'id' || !k || I18N_ID[k] == null) return orig;
  var tr = I18N_ID[k], lead = orig.match(/^\s*/)[0], trail = orig.match(/\s*$/)[0];
  if (orig.indexOf(' ') > -1) tr = noWidow(tr);   /* keep the no-widow space the page asked for */
  return lead + tr + trail;
}
/* A record per node remembers the English original. Text the page writes later (or a language switch) starts a new round;
   a write that only moves spaces around (fixWidows) keeps the record. */
function i18nNode(n) {
  var cur = n.nodeValue, rec = i18nText.get(n);
  if (rec && i18nKey(cur) === i18nKey(rec.out)) { if (rec.lang === LANG) return; }
  else rec = { orig: cur };
  rec.out = i18nTr(rec.orig); rec.lang = LANG; i18nText.set(n, rec);
  if (i18nKey(cur) !== i18nKey(rec.out)) n.nodeValue = rec.out;
}
function i18nAttrs(el) {
  var m = i18nAttr.get(el);
  for (var i = 0; i < I18N_ATTRS.length; i++) {
    var a = I18N_ATTRS[i], cur = el.getAttribute(a);
    if (cur == null) continue;
    m = m || {};
    var rec = m[a];
    if (rec && cur === rec.out) { if (rec.lang === LANG) continue; }
    else rec = { orig: cur };
    rec.out = i18nTr(rec.orig); rec.lang = LANG; m[a] = rec;
    if (cur !== rec.out) el.setAttribute(a, rec.out);
  }
  if (m) i18nAttr.set(el, m);
}
function i18nTree(root) {
  if (root.nodeType === 3) { if (root.parentElement && !root.parentElement.closest(I18N_SKIP)) i18nNode(root); return; }
  if (root.nodeType !== 1 || root.closest(I18N_SKIP)) return;
  i18nAttrs(root);
  var w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: function (n) { return n.nodeType === 1 && n.matches(I18N_SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
  });
  while (w.nextNode()) { var n = w.currentNode; if (n.nodeType === 1) i18nAttrs(n); else i18nNode(n); }
}
function i18nWatch(on) {
  if (!on) { if (i18nObs) { i18nObs.disconnect(); i18nObs = null; } return; }
  if (i18nObs || !window.MutationObserver) return;
  i18nObs = new MutationObserver(function (list) {
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      if (m.type === 'childList') for (var j = 0; j < m.addedNodes.length; j++) i18nTree(m.addedNodes[j]);
      else if (m.type === 'characterData') i18nTree(m.target);
      else if (!m.target.closest(I18N_SKIP)) i18nAttrs(m.target);
    }
  });
  i18nObs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: I18N_ATTRS });
}
var I18N_TITLE = document.title;
function i18nApply() {
  document.documentElement.lang = LANG;
  document.title = t(I18N_TITLE);
  if (LANG === 'id') i18nWatch(true);
  i18nTree(document.body);
  if (LANG !== 'id') i18nWatch(false);
  Array.prototype.forEach.call(document.querySelectorAll('[data-lang-sw]'), function (b) {
    var to = LANG === 'id' ? 'en' : 'id';
    b.dataset.to = to; b.textContent = to.toUpperCase(); b.lang = to;
    b.setAttribute('aria-label', to === 'id' ? 'Ganti ke Bahasa Indonesia' : 'Switch to English');
  });
}
function setLang(l) {
  if (l === LANG) return;
  LANG = l;
  try { localStorage.setItem('imz-lang', l); } catch (e) { /* tanpa penyimpanan: pilihan berlaku sampai halaman ditutup */ }
  i18nApply();
  if (typeof onLang === 'function') onLang();
}
document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-lang-sw]'); if (b) setLang(b.dataset.to); });

i18nApply();
