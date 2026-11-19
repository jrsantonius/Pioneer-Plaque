/* Edits scenes in covers/art.js safely and writes the file back in its tidy form.
   Usage: node tools/art-edit.js edits.json   where edits = [[cover, field, find, replace] …] or [cover, field, null, wholeNewValue]; with no file it only rewrites. */
const path = require('path'), ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'out') + path.sep, BASE = process.env.BASE_URL || 'http://localhost:8765';
require('fs').mkdirSync(OUT, { recursive: true });
const fs = require('fs'), P = path.join(ROOT, 'covers', 'art.js'), src = fs.readFileSync(P, 'utf8');
const ART = require(P), head = src.slice(0, src.indexOf('var ART = {')), q = s => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
(process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) : []).forEach(e => {
  const [name, field, find, to] = e, it = ART[name]; if (!it) throw new Error('no cover ' + name);
  if (find == null) { if (to == null) delete it[field]; else it[field] = to; return; }
  const cur = String(it[field] || ''), n = cur.split(find).length - 1;
  if (n !== 1) throw new Error(name + '.' + field + ': "' + find.slice(0, 50) + '" found ' + n + ' times');
  it[field] = cur.replace(find, to);
});
const lines = Object.keys(ART).map(k => {
  const it = ART[k], parts = ['p: ' + it.p];
  ['g', 'sky'].forEach(f => { if (it[f]) parts.push(f + ': ' + q(it[f])); });
  ['gy'].forEach(f => { if (it[f] != null) parts.push(f + ': ' + it[f]); });
  ['cam', 'fit', 'sun'].forEach(f => { if (it[f]) parts.push(f + ': [' + it[f].join(', ') + ']'); });
  ['fov', 'zoom', 'mid', 'dx', 'dy', 'sh'].forEach(f => { if (it[f] != null) parts.push(f + ': ' + it[f]); });
  const rows = []; let cur = '';
  it.m.split(';').filter(Boolean).forEach(sg => { if (cur.length + sg.length > 170 && cur) { rows.push(cur); cur = ''; } cur += sg + ';'; });
  if (cur) rows.push(cur.replace(/;$/, ''));
  let out = '  ' + q(k) + ': { ' + parts.join(', ') + ',\n    m: ' + rows.map(q).join(' +\n      ');
  if (it.under) out += ',\n    under: ' + q(it.under);
  if (it.over) out += ',\n    over: ' + q(it.over);
  return out + ' }';
});
fs.writeFileSync(P, head + 'var ART = {\n' + lines.join(',\n') + "\n};\nif (typeof module !== 'undefined') module.exports = ART;\n");
console.log('wrote', Object.keys(ART).length, 'covers');
