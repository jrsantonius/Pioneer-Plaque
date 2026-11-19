/* Where does a point of a scene land on the cover? node tools/where.js "<cover>" "x,y,z" ["x,y,z" …]  → art-box coordinates (0-100, name starts near 104) */
const path = require('path'), ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'out') + path.sep, BASE = process.env.BASE_URL || 'http://localhost:8765';
require('fs').mkdirSync(OUT, { recursive: true });
const fs = require('fs'), vm = require('vm'), C = path.join(ROOT, 'covers') + path.sep, ctx = { console, module: {} };
vm.createContext(ctx); vm.runInContext(['stamp.js', 'scene.js', 'art.js'].map(f => fs.readFileSync(C + f, 'utf8')).join('\n'), ctx);
const it = ctx.ART[process.argv[2]], r = ctx.renderScene(it, ctx.PAL[it.p], ctx.SHADE[it.p]);
console.log('floor line y', r.gy.toFixed(1), 'frame', r.frame.map(v => v.toFixed(0)).join(' '));
process.argv.slice(3).forEach(a => { const p = r.at(a.split(',').map(Number)); console.log(a, '→', p ? p[0].toFixed(1) + ', ' + p[1].toFixed(1) : 'behind the camera'); });
