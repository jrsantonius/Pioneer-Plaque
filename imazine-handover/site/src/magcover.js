/* ---------- Cover Majalah ---------------------------------------------------------------------
   Foto pembeli jadi sampul gaya majalah, dirender di browser dengan canvas (tanpa server, tanpa API berbayar).
   - magScale / magEnhance : naik ke Full HD (sisi panjang 1920px): langkah 1,5x + penajaman ringan.
     Ini penskalaan kualitas tinggi, BUKAN AI: foto kecil jadi lebih tajam dan cukup besar, tapi tidak bertambah detail.
   - magRender             : menggambar sampul dari satu gaya (noir, biru, krem, lukis) di grid 1000 x 1415 satuan.
   - 'lukis' memakai filter Kuwahara (efek cat minyak) buatan sendiri, bukan AI generatif.
   Data gaya (MAG_STYLES, MAG_ORDER) ada di app-core.js supaya halaman album cetak admin ikut mengenalinya.
------------------------------------------------------------------------------------------------ */
var MAG_W = 1920, MAG_RATIO = 283 / 200, MAG_UP_MAX = 4, MAG_KEEP_MAX = 3000;
var MAG_FIELDS = {
  noir:  [['issue', 'Issue number', 24], ['dateLine', 'Month and year', 24], ['issueNo', 'Edition', 16]],
  biru:  [['dateLine', 'Month and year', 24], ['headA', 'Left title', 28], ['subA', 'Left caption', 70], ['headB', 'Right title', 28], ['subB', 'Right caption', 70]],
  krem:  [['tag1', 'Column 1', 30], ['tag2', 'Column 2', 44], ['tag3', 'Column 3', 44]],
  lukis: [['headline', 'Title', 36], ['edition', 'Bottom line', 28]],
  segar: [['tagA', 'Top label 1', 16], ['tagB', 'Top label 2', 16], ['tagC', 'Top label 3', 16], ['dateLine', 'Month and year', 24],
          ['a1', 'Left title (small)', 24], ['a2', 'Left title (large)', 14], ['aSub', 'Left caption', 60],
          ['b1', 'Second title (small)', 24], ['b2', 'Second title (large)', 14], ['bSub', 'Second caption', 60],
          ['badge', 'Circle: title', 22], ['badgeSub', 'Circle: caption', 44]]
};
var MAG_COPY_SEGAR = {
  travel: { tagA: 'ADVENTURE', tagB: 'WANDER', tagC: 'MEMORIES', a1: 'WHERE THE ROAD', a2: 'LEADS', aSub: 'Places that change how we see', b1: 'THE NEXT', b2: 'ADVENTURE', bSub: 'Mapping the trips still to come', badge: 'TRAVEL DIARY', badgeSub: 'Stories from the road, together' },
  event:  { tagA: 'CELEBRATE', tagB: 'FAMILY', tagC: 'JOY', a1: 'THE DAY WE', a2: 'CELEBRATED', aSub: 'Every smile that filled the room', b1: 'THE MOMENTS', b2: 'THAT STAY', bSub: 'Little things we never want to forget', badge: 'SPECIAL EDITION', badgeSub: 'A day worth remembering' },
  sol:    { tagA: 'FAMILY', tagB: 'HOME', tagC: 'MOMENTS', a1: 'ORDINARY DAYS', a2: 'MATTER', aSub: 'Why the small things are the big things', b1: 'THE NEXT', b2: 'CHAPTER', bSub: 'Building our story together', badge: 'EXCLUSIVE STORY', badgeSub: 'Timeless moments of everyday life' },
  family: { tagA: 'FAMILY', tagB: 'HOME', tagC: 'LOVE', a1: 'ALL OF US,', a2: 'TOGETHER', aSub: 'The people who make a house a home', b1: 'GROWING', b2: 'UP', bSub: 'Little ones, big moments', badge: 'FAMILY ISSUE', badgeSub: 'Stories from our home' }
};
var MAG_COPY = {
  travel: { headA: "WHERE WE'VE BEEN", subA: 'The places, people, and roads that brought us here', headB: 'THE LITTLE THINGS', subB: 'Small moments we collected along the way',
            tag1: 'A TRAVEL EDITION', tag2: 'On Places, Roads, and Wandering', tag3: 'The Journeys That Make Us', headline: 'OUR JOURNEY, IN COLOR' },
  event:  { headA: 'OUR BIG DAY', subA: 'The people and moments that made it unforgettable', headB: 'THE DETAILS', subB: 'Every little thing we want to remember',
            tag1: 'A CELEBRATION EDITION', tag2: 'On Joy, Family, and Milestones', tag3: 'The Day We Never Want to Forget', headline: 'OUR DAY, IN COLOR' },
  sol:    { headA: 'OUR STORY SO FAR', subA: 'The people, places, and moments that brought us here', headB: 'THE LITTLE THINGS', subB: 'Ordinary moments we keep together',
            tag1: 'A PERSONAL EDITION', tag2: 'On Memory, Home, and Family', tag3: 'The People Who Make Life Richer', headline: 'OUR STORY, IN COLOR' },
  family: { headA: 'ALL OF US', subA: 'The people who make our house a home', headB: 'GROWING UP', subB: 'Little ones, big moments, and everyday love',
            tag1: 'A FAMILY EDITION', tag2: 'On Home and Kids', tag3: 'The People We Love', headline: 'OUR FAMILY, IN COLOR' }
};
var MAG_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function magDefault(style, catId, k) {
  var d = new Date(), month = MAG_MONTHS[d.getMonth()], year = d.getFullYear();
  if (k === 'dateLine') return style === 'noir' ? (month + ' ' + year).toUpperCase() : month + ', ' + year;
  if (k === 'issue') return 'VOL. 03 NO. 02';
  if (k === 'issueNo') return 'ISSUE 03';
  if (k === 'edition') return year + ' EDITION';
  if (style === 'segar') return (MAG_COPY_SEGAR[catId] || MAG_COPY_SEGAR.sol)[k] || '';
  return (MAG_COPY[catId] || MAG_COPY.sol)[k] || '';
}
function magText(style, catId, k) {
  var e = S.mag.ed[style];
  return e && e[k] != null ? e[k] : magDefault(style, catId, k);
}

/* ---------- canvas helpers ---------- */
function magCanvas(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
function magClamp8(v) { return v < 0 ? 0 : v > 255 ? 255 : v; }

/* Penajaman ringan (kernel 3x3), hanya dipakai setelah foto dinaikkan. */
function magSharpen(c, a) {
  var cx = c.getContext('2d'), w = c.width, h = c.height, id = cx.getImageData(0, 0, w, h), s = id.data, o = new Uint8ClampedArray(s), c0 = 1 + 4 * a, y, x, i, k;
  for (y = 1; y < h - 1; y++) for (x = 1; x < w - 1; x++) {
    i = (y * w + x) * 4;
    for (k = 0; k < 3; k++) o[i + k] = magClamp8(c0 * s[i + k] - a * (s[i - 4 + k] + s[i + 4 + k] + s[i - w * 4 + k] + s[i + w * 4 + k]));
  }
  id.data.set(o); cx.putImageData(id, 0, 0);
}
/* Skala ke sisi panjang 'target': naik bertahap 1,5x (lebih halus dari satu lompatan), turun bertahap 2x. */
function magScale(src, target) {
  var sw = src.naturalWidth || src.width, sh = src.naturalHeight || src.height, long = Math.max(sw, sh);
  target = Math.round(Math.min(target, long * MAG_UP_MAX));
  var cur = src, cw = sw, ch = sh, up = target > long;
  while (Math.max(cw, ch) !== target) {
    var m = Math.max(cw, ch), nm = up ? Math.min(target, Math.round(m * 1.5)) : Math.max(target, Math.round(m / 2)), k = nm / m;
    var c = magCanvas(cw * k, ch * k), x = c.getContext('2d');
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    if (cur === src) { x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); }
    x.drawImage(cur, 0, 0, c.width, c.height);
    cur = c; cw = c.width; ch = c.height;
    if (Math.max(cw, ch) !== nm) { /* pembulatan sisi pendek tidak boleh membuat loop tak berujung */ break; }
  }
  if (cur === src) { var c2 = magCanvas(sw, sh), x2 = c2.getContext('2d'); x2.fillStyle = '#fff'; x2.fillRect(0, 0, sw, sh); x2.drawImage(src, 0, 0); cur = c2; }
  if (up) magSharpen(cur, 0.32);
  return cur;
}
/* Foto sampul: minimal Full HD, dan foto yang sudah besar dipertahankan (sampai 3000px). */
function magEnhance(img) {
  var long = Math.max(img.naturalWidth, img.naturalHeight);
  return magScale(img, long < MAG_W ? MAG_W : Math.min(long, MAG_KEEP_MAX));
}
async function magLoadFile(file) {
  if (isHeic(await file.slice(0, 16).arrayBuffer(), file)) file = await heicToJpeg(file);   /* the cover's original photo goes to the server too: JPEG */
  var url = URL.createObjectURL(file), img;
  try { img = await loadImg(url); } finally { URL.revokeObjectURL(url); }
  var ow = img.naturalWidth, oh = img.naturalHeight, c = magEnhance(img);
  return { canvas: c, w: c.width, h: c.height, ow: ow, oh: oh, name: file.name || 'foto', file: file, paint: null };
}

/* Foto ke kotak dw x dh: isi penuh, titik fokus fx/fy, zoom z >= 1. */
function magFit(ctx, src, dw, dh, fx, fy, z) {
  var sw = src.width, sh = src.height, ar = dw / dh, cw, ch;
  if (sw / sh > ar) { ch = sh / z; cw = ch * ar; } else { cw = sw / z; ch = cw / ar; }
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src, (sw - cw) * fx, (sh - ch) * fy, cw, ch, 0, 0, dw, dh);
}
function magGray(cv, con) {
  var cx = cv.getContext('2d'), id = cx.getImageData(0, 0, cv.width, cv.height), d = id.data;
  for (var i = 0; i < d.length; i += 4) { var l = magClamp8((0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2] - 128) * con + 132); d[i] = d[i + 1] = d[i + 2] = l; }
  cx.putImageData(id, 0, 0);
}
/* Pudarkan tepi atas foto ke latar: alpha 0 di y0 sampai 1 di y1 (piksel). */
function magFade(cv, y0, y1) {
  var cx = cv.getContext('2d'), g = cx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)');
  cx.globalCompositeOperation = 'destination-in'; cx.fillStyle = g; cx.fillRect(0, 0, cv.width, cv.height); cx.globalCompositeOperation = 'source-over';
}

/* Efek cat minyak: filter Kuwahara dengan summed-area table, jadi cepat. Dikerjakan di 1000px lalu dibesarkan. */
function magPaint(src) {
  var k = Math.min(1, 1000 / Math.max(src.width, src.height)), w = Math.round(src.width * k), h = Math.round(src.height * k);
  var c = magCanvas(w, h), cx = c.getContext('2d'); cx.imageSmoothingQuality = 'high'; cx.drawImage(src, 0, 0, w, h);
  var id = cx.getImageData(0, 0, w, h), d = id.data, W1 = w + 1, n1 = W1 * (h + 1);
  var sr = new Int32Array(n1), sg = new Int32Array(n1), sb = new Int32Array(n1), sl = new Int32Array(n1), sq = new Float64Array(n1);
  var x, y, i, rr, rg, rb, rl, rq, ix;
  for (y = 0; y < h; y++) {
    rr = rg = rb = rl = rq = 0;
    for (x = 0; x < w; x++) {
      i = (y * w + x) * 4; var r = d[i], g = d[i + 1], b = d[i + 2], L = (r * 77 + g * 151 + b * 28) >> 8;
      rr += r; rg += g; rb += b; rl += L; rq += L * L; ix = (y + 1) * W1 + x + 1;
      sr[ix] = sr[ix - W1] + rr; sg[ix] = sg[ix - W1] + rg; sb[ix] = sb[ix - W1] + rb; sl[ix] = sl[ix - W1] + rl; sq[ix] = sq[ix - W1] + rq;
    }
  }
  function box(a, x0, y0, x1, y1) { return a[(y1 + 1) * W1 + x1 + 1] - a[y0 * W1 + x1 + 1] - a[(y1 + 1) * W1 + x0] + a[y0 * W1 + x0]; }
  var R = 5, out = new Uint8ClampedArray(d.length), SAT = 1.3, CON = 1.07;
  for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
    var best = Infinity, bx0 = 0, by0 = 0, bx1 = 0, by1 = 0, bn = 1;
    for (var q = 0; q < 4; q++) {
      var x0 = q & 1 ? x : x - R, x1 = q & 1 ? x + R : x, y0 = q & 2 ? y : y - R, y1 = q & 2 ? y + R : y;
      if (x0 < 0) x0 = 0; if (y0 < 0) y0 = 0; if (x1 >= w) x1 = w - 1; if (y1 >= h) y1 = h - 1;
      var n = (x1 - x0 + 1) * (y1 - y0 + 1), m = box(sl, x0, y0, x1, y1) / n, v = box(sq, x0, y0, x1, y1) / n - m * m;
      if (v < best) { best = v; bx0 = x0; by0 = y0; bx1 = x1; by1 = y1; bn = n; }
    }
    i = (y * w + x) * 4;
    var mr = box(sr, bx0, by0, bx1, by1) / bn, mg = box(sg, bx0, by0, bx1, by1) / bn, mb = box(sb, bx0, by0, bx1, by1) / bn, gy = 0.3 * mr + 0.59 * mg + 0.11 * mb;
    out[i] = magClamp8((gy + (mr - gy) * SAT - 128) * CON + 128); out[i + 1] = magClamp8((gy + (mg - gy) * SAT - 128) * CON + 128); out[i + 2] = magClamp8((gy + (mb - gy) * SAT - 128) * CON + 128); out[i + 3] = 255;
  }
  id.data.set(out); cx.putImageData(id, 0, 0);
  return c;
}

/* Pisahkan subjek dari latar (untuk "teks di belakang subjek"). MediaPipe Selfie Segmenter (Apache-2.0) dimuat dari CDN saat
   pertama dipakai dan berjalan di browser pembeli: foto tidak dikirim ke mana pun. Masker kasarnya dirapikan dengan guided filter
   yang mengikuti tepi foto. Hasil: kanvas dengan alpha = subjek, atau null bila model tidak bisa dimuat (offline, browser lama). */
/* Sumber model: dulu dari server sendiri (/public/imazine/vendor, lihat README di sana), CDN hanya cadangan. Ada jaringan Wi-Fi yang
   memblokir atau melambatkan cdn.jsdelivr.net dan storage.googleapis.com, dan dulu import() yang menggantung membuat tulisan
   "Memisahkan subjek dari latar…" tidak pernah selesai (review 18 Nov 2026). Tiap sumber kini dibatasi waktunya. */
var MAG_SEG_SRC = [
  { tv: '/public/imazine/vendor/mediapipe', model: '/public/imazine/vendor/mediapipe/selfie_segmenter.tflite' },
  { tv: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14', model: 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite' }
];
var MAG_SEG_WAIT = 150000, magSegP = null;   /* internet lambat: file model ~2-3 MB terkompresi */
function magWithin(p, ms) { return Promise.race([p, new Promise(function (res, rej) { setTimeout(function () { rej(new Error('waktu habis')); }, ms); })]); }
function magSegmenter() {
  if (magSegP) return magSegP;
  function at(i) {
    var src = MAG_SEG_SRC[i];
    return magWithin(import(src.tv + '/vision_bundle.mjs').then(function (tv) {
      return tv.FilesetResolver.forVisionTasks(src.tv + '/wasm').then(function (fs) {
        return tv.ImageSegmenter.createFromOptions(fs, { baseOptions: { modelAssetPath: src.model }, runningMode: 'IMAGE', outputConfidenceMasks: true, outputCategoryMask: false });
      });
    }), MAG_SEG_WAIT).catch(function (e) {
      if (window.console) console.warn('Cover Majalah: model dari ' + src.tv + ' gagal dimuat', e);
      if (i + 1 < MAG_SEG_SRC.length) return at(i + 1);
      throw e;
    });
  }
  return (magSegP = at(0).catch(function (e) { magSegP = null; throw e; }));
}
function magBox(src, w, h, r) {   /* rata-rata kotak (2r+1), terpisah horizontal dan vertikal */
  var tmp = new Float32Array(w * h), out = new Float32Array(w * h), x, y, sum, q, n = 2 * r + 1;
  for (y = 0; y < h; y++) {
    sum = 0; for (q = -r; q <= r; q++) sum += src[y * w + Math.max(0, Math.min(w - 1, q))];
    for (x = 0; x < w; x++) { tmp[y * w + x] = sum / n; sum += src[y * w + Math.min(w - 1, x + r + 1)] - src[y * w + Math.max(0, x - r)]; }
  }
  for (x = 0; x < w; x++) {
    sum = 0; for (q = -r; q <= r; q++) sum += tmp[Math.max(0, Math.min(h - 1, q)) * w + x];
    for (y = 0; y < h; y++) { out[y * w + x] = sum / n; sum += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x]; }
  }
  return out;
}
/* Rapikan masker kasar sebelum guided filter (review 18 Nov 2026: potongan di foto berlatar ramai belum rapi).
   1) ambil bagian yang pasti subjek (conf >= 0.5), 2) buang bercak kecil yang terpisah dari subjek utama (benda atau derau
   di latar yang ikut terdeteksi), 3) tutup lubang kecil di dalam subjek. Hasil: Uint8Array 1 = subjek. */
function magCleanMask(conf, w, h) {
  var N = w * h, on = new Uint8Array(N), lab = new Int32Array(N), stack = new Int32Array(N), vis = new Int32Array(N), i, sizes = [0], best = 0;
  for (i = 0; i < N; i++) on[i] = conf[i] >= 0.5 ? 1 : 0;
  function flood(seed, want, id) {   /* isi 4-arah, kembalikan luas dan apakah menyentuh tepi */
    var top = 0, n = 0, edge = false; stack[top++] = seed; lab[seed] = id;
    while (top) {
      var q = stack[--top], x = q % w, y = (q - x) / w; vis[n++] = q;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) edge = true;
      if (x > 0 && on[q - 1] === want && !lab[q - 1]) { lab[q - 1] = id; stack[top++] = q - 1; }
      if (x < w - 1 && on[q + 1] === want && !lab[q + 1]) { lab[q + 1] = id; stack[top++] = q + 1; }
      if (y > 0 && on[q - w] === want && !lab[q - w]) { lab[q - w] = id; stack[top++] = q - w; }
      if (y < h - 1 && on[q + w] === want && !lab[q + w]) { lab[q + w] = id; stack[top++] = q + w; }
    }
    return { n: n, edge: edge };
  }
  for (i = 0; i < N; i++) if (on[i] && !lab[i]) { var r = flood(i, 1, sizes.length); sizes.push(r.n); if (r.n > best) best = r.n; }
  if (!best) return null;
  /* simpan subjek utama dan orang lain yang cukup besar (foto berdua/bertiga), buang sisanya */
  var keepMin = Math.max(best * 0.12, N * 0.004);
  for (i = 0; i < N; i++) if (on[i] && sizes[lab[i]] < keepMin) on[i] = 0;
  /* lubang kecil di dalam subjek (tidak menyentuh tepi foto) ditutup; celah besar (mis. antara lengan dan badan) dibiarkan */
  lab.fill(0); var holeMax = N * 0.003, id = 1;
  for (i = 0; i < N; i++) if (!on[i] && !lab[i]) {
    var r2 = flood(i, 0, ++id);
    if (!r2.edge && r2.n < holeMax) for (var j = 0; j < r2.n; j++) on[vis[j]] = 1;
  }
  return on;
}
async function magSegment(src) {
  var seg;
  try { seg = await magSegmenter(); } catch (e) { if (window.console) console.warn('Cover Majalah: model segmentasi tidak bisa dimuat', e); return null; }
  var k = Math.min(1, 960 / Math.max(src.width, src.height)), w = Math.round(src.width * k), h = Math.round(src.height * k), N = w * h, i;
  var c = magCanvas(w, h), cx = c.getContext('2d'); cx.imageSmoothingQuality = 'high'; cx.drawImage(src, 0, 0, w, h);
  var res = seg.segment(c), m = res.confidenceMasks[0], conf = new Float32Array(m.getAsFloat32Array()), d = cx.getImageData(0, 0, w, h).data;
  if (m.close) m.close();
  var keep = magCleanMask(conf, w, h);
  if (!keep) return null;
  var I = new Float32Array(N), P = new Float32Array(N), II = new Float32Array(N), IP = new Float32Array(N), fg = 0;
  /* masker awal: keyakinan model, tapi hanya di sekitar subjek yang dipertahankan */
  var near = magBox(Float32Array.from(keep), w, h, Math.max(3, Math.round(Math.max(w, h) / 160)));
  for (i = 0; i < N; i++) {
    I[i] = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255;
    P[i] = keep[i] ? Math.max(conf[i], 0.75) : near[i] > 0 ? conf[i] * 0.6 : 0;
    II[i] = I[i] * I[i]; IP[i] = I[i] * P[i]; fg += keep[i];
  }
  if (fg / N < 0.04 || fg / N > 0.97) return null;   /* tidak ada orang, atau semuanya subjek: tidak ada gunanya */
  /* guided filter: tepi masker mengikuti tepi foto. eps lebih besar dari sebelumnya supaya tekstur latar yang ramai tidak ikut. */
  var r = Math.max(6, Math.round(Math.max(w, h) / 80)), eps = 0.006;
  var mI = magBox(I, w, h, r), mP = magBox(P, w, h, r), mII = magBox(II, w, h, r), mIP = magBox(IP, w, h, r);
  var A = new Float32Array(N), B = new Float32Array(N);
  for (i = 0; i < N; i++) { var vr = mII[i] - mI[i] * mI[i], cv = mIP[i] - mI[i] * mP[i]; A[i] = cv / (vr + eps); B[i] = mP[i] - A[i] * mI[i]; }
  var mA = magBox(A, w, h, r), mB = magBox(B, w, h, r);
  /* alpha hanya boleh ada di dekat subjek: guided filter tidak boleh menciptakan bercak baru jauh dari orangnya */
  var zone = magBox(Float32Array.from(keep), w, h, Math.max(4, Math.round(Math.max(w, h) / 70)));
  var al = new Float32Array(N);
  for (i = 0; i < N; i++) { var q = mA[i] * I[i] + mB[i], t = (q - 0.4) / 0.28; al[i] = zone[i] > 0.02 ? (t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t)) : 0; }
  al = magBox(al, w, h, 1);   /* haluskan tepi yang bergerigi */
  var mc = magCanvas(w, h), mx = mc.getContext('2d'), id = mx.createImageData(w, h), o = id.data;
  for (i = 0; i < N; i++) o[i * 4 + 3] = Math.round(255 * al[i]);
  mx.putImageData(id, 0, 0);
  return mc;
}

/* Posisi otomatis sampul (review 18 Nov 2026): dari masker subjek, pilih zoom dan titik fokus supaya subjek langsung pas
   di bingkai sampul (kepala sedikit di bawah tepi atas, di tengah), tanpa pembeli perlu menggeser atau memperbesar.
   pw/ph = ukuran foto. Hasil { fx, fy, z } atau null bila subjek tidak jelas. */
function magAutoFit(cut, pw, ph) {
  var w = cut.width, h = cut.height, d = cut.getContext('2d').getImageData(0, 0, w, h).data, rows = new Uint32Array(h), cols = new Uint32Array(w), n = 0, x, y;
  for (y = 0; y < h; y++) for (x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] >= 128) { rows[y]++; cols[x]++; n++; }
  if (n < w * h * 0.02) return null;
  var minR = Math.max(2, w * 0.01), minC = Math.max(2, h * 0.01), y0 = 0, y1 = h - 1, x0 = 0, x1 = w - 1, sx = 0;
  while (y0 < h && rows[y0] < minR) y0++;
  while (y1 > y0 && rows[y1] < minR) y1--;
  while (x0 < w && cols[x0] < minC) x0++;
  while (x1 > x0 && cols[x1] < minC) x1--;
  for (x = 0; x < w; x++) sx += x * cols[x];
  var top = y0 / h, bh = (y1 + 1 - y0) / h, bw = (x1 + 1 - x0) / w, cx = sx / n / w;
  var ia = pw / ph, ar = 1000 / 1415;   /* foto memenuhi seluruh sampul (lebar penuh, dari tepi atas) */
  var wf1 = ia > ar ? ar / ia : 1, hf1 = ia > ar ? 1 : ia / ar;
  var z = clamp(hf1 * 0.88 / Math.max(bh, 0.05), 1, 2.2);
  z = Math.max(1, Math.min(z, wf1 / Math.min(1, bw * 1.08)));
  var hf = hf1 / z, wf = wf1 / z;
  var fy = hf < 0.999 ? clamp((top - 0.13 * hf) / (1 - hf), 0, 1) : 0.5;   /* kepala sekitar 13% dari atas: di bawah label, menyentuh judul */
  var fx = wf < 0.999 ? clamp((cx - wf / 2) / (1 - wf), 0, 1) : 0.5;
  return { fx: +fx.toFixed(3), fy: +fy.toFixed(3), z: +z.toFixed(2) };
}

/* Butiran kertas / kanvas: satu ubin derau, dipakai berulang. */
var magTile = null;
function magGrain(x, W, H, alpha, mode) {
  if (!magTile) {
    magTile = magCanvas(160, 160); var tx = magTile.getContext('2d'), id = tx.createImageData(160, 160), d = id.data;
    for (var i = 0; i < d.length; i += 4) { var v = 110 + Math.random() * 60; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    tx.putImageData(id, 0, 0);
  }
  x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = alpha; x.globalCompositeOperation = mode || 'overlay';
  x.fillStyle = x.createPattern(magTile, 'repeat'); x.fillRect(0, 0, W, H); x.restore();
}

/* Foto contoh per tema sebelum pembeli mengunggah (foto orang buatan AI, lihat catatan di halaman): foto + masker subjek
   yang sudah dihitung sebelumnya, jadi efek judul di belakang orang langsung tampil tanpa memuat model segmentasi.
   Dimuat sekali per tema; selama belum siap (atau gagal dimuat), sampul memakai siluet di bawah. */
var MAG_SAMPLE_DIR = '/public/imazine/img/';
var MAG_SAMPLE_FIT = { travel: { fx: 0.5, fy: 1, z: 1.05 }, event: { fx: 0.539, fy: 1, z: 1.07 }, sol: { fx: 0.6, fy: 1, z: 1.2 }, family: { fx: 0.5, fy: 1, z: 1.05 } };   /* 28 Nov 2026: travel = teman, event = sendiri, sol = pasangan, family = keluarga */
var magSamples = {};
function magSample(catId) {
  if (!MAG_SAMPLE_FIT[catId]) return null;
  var s = magSamples[catId];
  if (s) return s.canvas ? s : null;
  s = magSamples[catId] = {};
  s.p = Promise.all([loadImg(MAG_SAMPLE_DIR + 'sample-' + catId + '.webp'), loadImg(MAG_SAMPLE_DIR + 'sample-' + catId + '-cut.webp')]).then(function (r) {
    var pc = magCanvas(r[0].naturalWidth, r[0].naturalHeight); pc.getContext('2d').drawImage(r[0], 0, 0);
    var mc = magCanvas(r[1].naturalWidth, r[1].naturalHeight), mx = mc.getContext('2d'); mx.drawImage(r[1], 0, 0);
    var id = mx.getImageData(0, 0, mc.width, mc.height), d = id.data;
    for (var i = 0; i < d.length; i += 4) { d[i + 3] = d[i]; d[i] = d[i + 1] = d[i + 2] = 0; }   /* terang = subjek */
    mx.putImageData(id, 0, 0);
    s.canvas = pc; s.cut = mc; s.w = pc.width; s.h = pc.height; s.paint = null; s.fit = MAG_SAMPLE_FIT[catId];
  }).catch(function () { });
  return null;
}
/* Render menunggu foto contoh tema itu siap, supaya rak tidak sempat menampilkan siluet lalu berganti. */
function magSampleReady(catId) {
  if (S.mag.photo || !MAG_SAMPLE_FIT[catId]) return Promise.resolve();
  magSample(catId);
  return magSamples[catId].p || Promise.resolve();
}
/* Cadangan terakhir: dua siluet di latar polos. */
var magPh = null, magPhObj = null;
function magPlaceholder() {
  if (magPh) return magPh;
  var c = magCanvas(1000, 1250), x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 1250);
  g.addColorStop(0, '#d9d5ce'); g.addColorStop(1, '#bdb8b0'); x.fillStyle = g; x.fillRect(0, 0, 1000, 1250);
  function person(cx, top, s, col) {
    x.fillStyle = col; x.beginPath(); x.ellipse(cx, top + 110 * s, 78 * s, 98 * s, 0, 0, 7); x.fill();
    x.beginPath(); x.moveTo(cx - 230 * s, 1250); x.quadraticCurveTo(cx - 215 * s, top + 330 * s, cx, top + 300 * s);
    x.quadraticCurveTo(cx + 215 * s, top + 330 * s, cx + 230 * s, 1250); x.closePath(); x.fill();
  }
  person(380, 300, 1.15, 'rgba(120,114,106,.92)'); person(610, 250, 1.2, 'rgba(92,87,81,.95)');
  return (magPh = c);
}

/* ---------- fonts ---------- */
var magFontsP = null;
function magFonts() {
  if (magFontsP) return magFontsP;
  if (!document.fonts || !document.fonts.load) return (magFontsP = Promise.resolve());
  return (magFontsP = Promise.all(['italic 400 100px "Instrument Serif"', '400 100px "Instrument Serif"', '800 100px "Manrope"', '700 100px "Manrope"', '600 100px "Manrope"', '500 20px "DM Mono"', '400 100px "Caveat Brush"']
    .map(function (f) { return document.fonts.load(f, 'imazine Aa').catch(function () { }); })).then(function () { }));
}
var MAG_CRAYON = '"Caveat Brush", "Bradley Hand", "Segoe Print", "Marker Felt", cursive';
var MAG_SERIF = '"Instrument Serif", "Instrument Serif Fallback", Georgia, serif';
var MAG_SANS = '"Manrope", "Manrope Fallback", Arial, sans-serif';

/* ---------- the cover ---------- */
function magRender(style, catId, W) {
  return Promise.all([magFonts(), magSampleReady(catId)]).then(function () { return magDraw(style, catId, W); });
}
function magDraw(style, catId, W) {
  var H = Math.round(W * MAG_RATIO), u = W / 1000, HU = H / u, c = magCanvas(W, H), x = c.getContext('2d'), st = S.mag, ph = st.photo;
  var smp = !ph && magSample(catId);
  if (smp) { ph = smp; st = Object.assign({}, S.mag, smp.fit); }   /* belum ada foto pembeli: foto contoh tema ini */
  var src = ph ? ph.canvas : magPlaceholder(), T = function (k) { return magText(style, catId, k); };
  x.scale(u, u);
  /* Kotak tiap teks dan foto, dalam satuan grid 1000 (edit langsung di sampul, 24 Nov 2026): editor memasang area ketuk di atasnya.
     Teks kosong tetap dapat kotak supaya pembeli bisa mengisinya lagi. */
  var hits = [];
  c.hits = hits; c.photoBox = { x: 0, y: 0, w: 1000, h: HU }; c.HU = HU;
  /* Kelompok teks bisa digeser bebas (24 Nov 2026, "kayak di Canva"): S.mag.moves[gaya][kelompok] = [dx, dy] dalam satuan grid.
     at(g, fn) menggambar fn bergeser sejauh itu; kotak ketuk (hit) dan contoh warna foto (inkAt) ikut bergeser. */
  var MV = (S.mag.moves && S.mag.moves[style]) || {}, O = { x: 0, y: 0, g: null };
  function at(g, fn) {
    var m = MV[g], o = O; O = { x: m ? +m[0] || 0 : 0, y: m ? +m[1] || 0 : 0, g: g };
    x.save(); if (O.x || O.y) x.translate(O.x, O.y);
    try { return fn(); } finally { x.restore(); O = o; }
  }
  function hit(k, X, Y, w, h2) { hits.push({ k: k, g: O.g, x: X + O.x, y: Y + O.y, w: Math.max(w, 40), h: Math.max(h2, 24) }); }
  function tw(t) { return x.measureText(String(t)).width; }
  /* Teks satu baris tanpa batas huruf: font dikecilkan sampai muat di lebar maxW (paling kecil min px). */
  function fit(t, pre, size, post, maxW, min) {
    for (var s2 = size; ; s2 -= 1) { x.font = pre + s2 + post; if (s2 <= min || x.measureText(String(t)).width <= maxW) return s2; }
  }
  function layer(wU, hU) { return magCanvas(wU * u, hU * u); }
  function put(l, X, Y, wU, hU) { x.drawImage(l, X, Y, wU, hU); }
  function photoLayer(wU, hU, fn, painted) {
    var l = layer(wU, hU), lx = l.getContext('2d'), s = src;
    if (painted && ph) { if (!ph.paint) ph.paint = magPaint(ph.canvas); s = ph.paint; }
    magFit(lx, s, l.width, l.height, st.fx, st.fy, st.z);
    if (fn) fn(l);
    return l;
  }
  function wrap(text, maxW) {
    var words = String(text).split(/\s+/).filter(Boolean), lines = [], cur = '';
    words.forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (x.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur);
    return lines;
  }
  function inkAt(X, Y, w, h, dark, light) {
    X += O.x; Y += O.y;
    var d = x.getImageData(Math.max(0, Math.round(X * u)), Math.max(0, Math.round(Y * u)), Math.max(1, Math.round(w * u)), Math.max(1, Math.round(h * u))).data, s = 0, n = 0;
    for (var i = 0; i < d.length; i += 16) { s += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; n++; }
    return n && s / n < 135 ? (light || '#ffffff') : (dark || '#111111');
  }
  function spaced(text, X, Y, gap, align) {
    var w = 0, i; for (i = 0; i < text.length; i++) w += x.measureText(text[i]).width + gap; w -= gap;
    var px = align === 'center' ? X - w / 2 : align === 'right' ? X - w : X;
    x.textAlign = 'left';
    for (i = 0; i < text.length; i++) { x.fillText(text[i], px, Y); px += x.measureText(text[i]).width + gap; }
  }
  /* "ima" miring berkaki + "zine" tebal, dipas ke lebar 'width' dengan garis dasar 'by' */
  function masthead(X, by, width, col, tm) {
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    x.font = 'italic 400 100px ' + MAG_SERIF; var wa = x.measureText('ima').width * 1.2;
    x.font = '800 100px ' + MAG_SANS; var wb = x.measureText('zine').width, fs = 100 * width / (wa + wb);
    x.fillStyle = col;
    x.font = 'italic 400 ' + (fs * 1.2) + 'px ' + MAG_SERIF; x.fillText('ima', X, by);
    var xa = X + x.measureText('ima').width;
    x.font = '800 ' + fs + 'px ' + MAG_SANS; x.fillText('zine', xa, by);
    if (tm) { x.font = '700 ' + (fs * 0.17) + 'px ' + MAG_SANS; x.fillText('TM', X + width - fs * 0.2, by - fs * 0.72); }
    return fs;
  }

  /* Teks di belakang subjek: kalau ada masker subjek (P.cut), judul digambar di antara latar dan subjek.
     Latar selalu foto asli (opsi "ganti latar dengan warna sampul" dihapus per review 18 Nov 2026). */
  var P = ph || (magPhObj || (magPhObj = { canvas: magPlaceholder(), paint: null, cut: null }));
  var front = !!P.cut && st.front;
  function copy(l) { var n = magCanvas(l.width, l.height); n.getContext('2d').drawImage(l, 0, 0); return n; }
  function maskIt(l, hh) {
    var mk = layer(1000, hh); magFit(mk.getContext('2d'), P.cut, mk.width, mk.height, st.fx, st.fy, st.z);
    var lx = l.getContext('2d'); lx.globalCompositeOperation = 'destination-in'; lx.drawImage(mk, 0, 0); lx.globalCompositeOperation = 'source-over';
    return l;
  }
  /* Foto memenuhi seluruh sampul dari tepi atas (revisi 19 Nov 2026: tidak ada lagi pita warna/pudar di atas yang memotong
     foto saat digeser ke atas atau diperbesar). Judul ditulis langsung di atas foto; warnanya mengikuti terang-gelap foto.
     y0 = tepi atas foto (selalu 0 sekarang), prep = olahan warna, title = gambar judul */
  function inkOn(X, Y, w, h) { return inkAt(X, Y, w, h, '#111111', '#ffffff'); }
  function soft(col, fn) {   /* bayangan lembut supaya teks tetap terbaca di atas foto yang ramai */
    x.save(); x.shadowColor = col === '#ffffff' ? 'rgba(0,0,0,.45)' : 'rgba(255,255,255,.55)'; x.shadowBlur = 16; fn(); x.restore();
  }
  function stage(y0, o) {
    var hh = HU - y0, base = layer(1000, hh), s2 = P.canvas;
    if (o.painted) { if (!P.paint) P.paint = magPaint(P.canvas); s2 = P.paint; }
    magFit(base.getContext('2d'), s2, base.width, base.height, st.fx, st.fy, st.z);
    if (o.prep) o.prep(base);
    var sub = front ? maskIt(copy(base), hh) : null;
    var shown = copy(base); if (o.fade) magFade(shown, 0, o.fade * u);
    put(shown, 0, y0, 1000, hh);
    o.title();
    if (sub) put(sub, 0, y0, 1000, hh);
  }

  if (style === 'noir') {
    x.fillStyle = '#ebebe7'; x.fillRect(0, 0, 1000, HU);
    stage(0, { prep: function (l) { magGray(l, 1.12); }, title: function () { at('mast', function () {
      x.save(); x.translate(540, 345); x.rotate(-0.05); x.textAlign = 'center'; x.font = '100px ' + MAG_CRAYON;
      var cw = x.measureText('imazine').width, cs = 100 * 800 / cw; x.font = cs + 'px ' + MAG_CRAYON;
      hit('mast', 140, 345 - cs * 0.72, 800, cs * 0.95);
      x.fillStyle = 'rgba(143,43,111,.5)'; x.fillText('imazine', 2.5, 2); x.fillText('imazine', -1.5, 1);
      x.fillStyle = 'rgba(143,43,111,.95)'; x.fillText('imazine', 0, 0);
      x.lineWidth = 2.4; x.strokeStyle = 'rgba(143,43,111,.45)'; x.strokeText('imazine', 0, 0);
      x.restore();
    }); } });
    magGrain(x, W, H, 0.12, 'multiply');
    at('side', function () {
    var sideInk = inkOn(14, 90, 60, 440);
    x.save(); x.translate(60, 96); x.rotate(Math.PI / 2); x.fillStyle = sideInk; x.textAlign = 'left'; x.font = '500 15px "DM Mono", monospace';
    ['IMAZINE', T('issue'), T('dateLine')].forEach(function (t, i) { x.fillText(t, 0, -i * 21); });
    hit('issue', 77, 90, 19, tw(T('issue')) + 12); hit('dateLine', 98, 90, 19, tw(T('dateLine')) + 12);
    x.restore();
    });
    at('foot', function () {
    x.fillStyle = 'rgba(235,235,231,.86)'; x.fillRect(34, HU - 196, 250, 150);   /* alas terang di bawah logo kecil, supaya terbaca di atas foto gelap */
    masthead(52, HU - 128, 190, '#111111', false);
    x.fillStyle = '#111'; x.fillRect(52, HU - 108, 30, 2);
    x.textAlign = 'left';
    [T('issueNo'), T('issue'), T('dateLine')].forEach(function (t, i) { fit(t, '500 ', 14, 'px "DM Mono", monospace', 226, 7); x.fillText(t, 52, HU - 84 + i * 19); });
    ['issueNo', 'issue', 'dateLine'].forEach(function (k, i) { hit(k, 46, HU - 99 + i * 19, Math.max(tw(T(k)), 80) + 12, 19); });
    hit('logo', 34, HU - 196, 250, 92);
    });
  }

  else if (style === 'biru') {
    x.fillStyle = '#5c7aa6'; x.fillRect(0, 0, 1000, HU);
    stage(0, { title: function () {
      at('mast', function () { var mc = inkOn(42, 110, 916, 160); soft(mc, function () { masthead(42, 262, 916, mc, true); }); hit('mast', 42, 120, 916, 160); });
      at('date', function () { var dc = inkOn(50, 296, 400, 34); soft(dc, function () { x.fillStyle = dc; fit(T('dateLine'), '700 ', 26, 'px ' + MAG_SANS, 900, 12); x.textAlign = 'left'; x.fillText(T('dateLine'), 50, 322); hit('dateLine', 44, 294, Math.max(tw(T('dateLine')), 140) + 12, 36); }); });
    } });
    magGrain(x, W, H, 0.1, 'overlay');
    var coverLine = function (X, Y, w, head, sub, right, kh, ks) {
      x.save(); x.textAlign = right ? 'right' : 'left'; var yy = Y, col = '#ffffff', L = right ? X - w - 6 : X - 6;
      function line(t, base, size) {   /* warna per baris, mengikuti foto tepat di bawah baris itu */
        var tw = x.measureText(t).width; col = inkAt(right ? X - tw : X, base - size * 0.8, tw, size * 0.95, '#10151c', '#ffffff');
        x.fillStyle = col; x.shadowColor = col === '#ffffff' ? 'rgba(20,30,50,.6)' : 'rgba(255,255,255,.85)'; x.shadowBlur = 12;
        x.fillText(t, X, base);
      }
      x.font = '800 54px ' + MAG_SANS;
      wrap(String(head).toUpperCase(), w).forEach(function (t) { line(t, yy + 44, 54); yy += 52; });
      hit(kh, L, Y - 2, w + 12, Math.max(yy - Y, 52) + 4); var ys = Math.max(yy, Y + 52);
      x.font = '600 27px ' + MAG_SANS; wrap(sub, w).forEach(function (t) { line(t, yy + 36, 27); yy += 33; });
      hit(ks, L, ys + 4, w + 12, Math.max(yy - ys, 33) + 6);
      x.fillStyle = col; x.fillRect(right ? X - 70 : X, yy + 30, 70, 4); x.restore();
    };
    at('lineA', function () { if (T('headA') || T('subA')) coverLine(48, 430, 235, T('headA'), T('subA'), false, 'headA', 'subA'); else { hit('headA', 42, 428, 247, 56); hit('subA', 42, 488, 247, 40); } });
    at('lineB', function () { if (T('headB') || T('subB')) coverLine(952, 740, 235, T('headB'), T('subB'), true, 'headB', 'subB'); else { hit('headB', 711, 738, 247, 56); hit('subB', 711, 798, 247, 40); } });
  }

  else if (style === 'krem') {
    x.fillStyle = '#ece7dc'; x.fillRect(0, 0, 1000, HU);
    at('mast', function () { masthead(70, 300, 860, '#111111', true); hit('mast', 70, 178, 860, 140); });
    x.fillStyle = '#141414';
    at('col1', function () { x.textAlign = 'left'; x.font = '700 17px ' + MAG_SANS; var n1 = wrap(T('tag1'), 175); n1.forEach(function (t, i) { spaced(t, 70, 388 + i * 24, 2.4); }); hit('tag1', 62, 368, 224, Math.max(n1.length, 1) * 24 + 10); });
    x.textAlign = 'left'; x.font = '400 26px ' + MAG_SERIF;
    at('col2', function () { var n2 = wrap(T('tag2'), 270); n2.forEach(function (t, i) { x.fillText(t, 330, 390 + i * 29); }); hit('tag2', 322, 366, 316, Math.max(n2.length, 1) * 29 + 10); });
    at('col3', function () { var n3 = wrap(T('tag3'), 250); n3.forEach(function (t, i) { x.fillText(t, 690, 390 + i * 29); }); hit('tag3', 682, 366, 290, Math.max(n3.length, 1) * 29 + 10); });
    x.fillRect(298, 372, 1.5, 60); x.fillRect(658, 372, 1.5, 60);
    var fh = HU - 470 - 38, pk = photoLayer(940, fh, null); c.photoBox = { x: 30, y: 470, w: 940, h: fh };
    put(pk, 30, 470, 940, fh);
    magGrain(x, W, H, 0.09, 'multiply');
  }

  else if (style === 'segar') {
    var gg = x.createLinearGradient(0, 0, 0, HU); gg.addColorStop(0, '#b9ee5c'); gg.addColorStop(1, '#8cd13a'); x.fillStyle = gg; x.fillRect(0, 0, 1000, HU);
    stage(0, { title: function () {
      at('tags', function () {
      var tc = inkOn(80, 90, 860, 32), tg = tc === '#ffffff' ? '#ffffff' : '#0d3b1a';
      soft(tc, function () {
        x.fillStyle = tg; x.textAlign = 'left';
        [[T('tagA'), 118, 'tagA'], [T('tagB'), 430, 'tagB'], [T('tagC'), 742, 'tagC']].forEach(function (g) { fit(g[0], '700 ', 21, 'px ' + MAG_SANS, g[2] === 'tagC' ? 220 : 270, 9); x.fillRect(g[1] - 30, 98, 14, 14); x.fillText(g[0], g[1], 114); hit(g[2], g[1] - 36, 88, Math.max(tw(g[0]), 90) + 46, 34); });
      });
      });
      at('mast', function () { var mc = inkOn(30, 200, 940, 180); soft(mc, function () { masthead(30, 372, 940, mc, false); }); hit('mast', 30, 230, 940, 160); });
      at('date', function () { var dc = inkOn(62, 400, 400, 36); soft(dc, function () { x.fillStyle = dc; fit(T('dateLine'), '700 ', 28, 'px ' + MAG_SANS, 880, 12); x.textAlign = 'left'; x.fillText(T('dateLine'), 62, 428); hit('dateLine', 56, 398, Math.max(tw(T('dateLine')), 140) + 12, 38); }); });
    } });
    magGrain(x, W, H, 0.07, 'overlay');
    /* Latar sampul kini selalu foto asli, jadi warna teks mengikuti terang-gelapnya foto di bawahnya supaya tetap terbaca. */
    function block(Y, small, big, sub, ks) {
      /* warna dipilih per baris: satu blok bisa jatuh sebagian di latar terang dan sebagian di baju gelap */
      function line(t, X, base, size, accent) {
        var w = x.measureText(t).width, dark = inkAt(X, base - size * 0.8, w, size * 0.95, 'd', 'l') === 'l';
        x.fillStyle = accent ? (dark ? '#c6f36a' : '#0a6a2a') : (dark ? '#ffffff' : '#0d3b1a');
        x.shadowColor = dark ? 'rgba(0,0,0,.75)' : 'rgba(255,255,255,.9)'; x.shadowBlur = dark ? 14 : 12;
        x.fillText(t, X, base); return dark;
      }
      x.save(); x.textAlign = 'left'; var yy = Y, lastDark = false;
      x.font = '800 36px ' + MAG_SANS; wrap(String(small).toUpperCase(), 270).forEach(function (t) { line(t, 70, yy + 32, 36); yy += 38; });
      yy = Math.max(yy, Y + 38); hit(ks[0], 62, Y, 300, yy - Y + 2);
      var bigS = fit(String(big).toUpperCase(), '800 ', 62, 'px ' + MAG_SANS, 860, 24); line(String(big).toUpperCase(), 70, yy + 52, bigS, true); hit(ks[1], 62, yy + 4, Math.max(tw(String(big).toUpperCase()), 200) + 16, 60); yy += 62;
      var y3 = yy; x.font = '600 25px ' + MAG_SANS; wrap(sub, 280).forEach(function (t) { lastDark = line(t, 70, yy + 32, 25); yy += 30; });
      hit(ks[2], 62, y3 + 6, 300, Math.max(yy - y3, 30) + 4);
      x.fillStyle = lastDark ? '#ffffff' : '#0d3b1a'; x.fillRect(70, yy + 36, 110, 3); x.restore();
      return yy + 40;
    }
    var endA = at('blockA', function () { return block(520, T('a1'), T('a2'), T('aSub'), ['a1', 'a2', 'aSub']); }) + (MV.blockA ? +MV.blockA[1] || 0 : 0);
    /* teks kiri yang panjang mendorong blok kedua ke bawah, selama blok kedua belum digeser sendiri */
    at('blockB', function () { block(MV.blockB ? 830 : Math.max(830, endA + 30), T('b1'), T('b2'), T('bSub'), ['b1', 'b2', 'bSub']); });
    /* lingkaran + barcode */
    at('badge', function () {
    x.save(); x.shadowColor = 'rgba(0,0,0,.18)'; x.shadowBlur = 16; x.fillStyle = '#ffffff'; x.beginPath(); x.arc(852, 1086, 96, 0, 7); x.fill(); x.restore();
    /* isi lingkaran mengecil sendiri supaya teks panjang tetap di dalam lingkaran: judul maks 2 baris, keterangan maks 3 baris */
    x.fillStyle = '#0d3b1a'; x.textAlign = 'center';
    var bS = 25, bl; for (; ; bS--) { x.font = '800 ' + bS + 'px ' + MAG_SANS; bl = wrap(String(T('badge')).toUpperCase(), 150); if (bl.length <= 2 || bS <= 11) break; }
    var bLh = bS * 1.12, by0 = 1070 - (bl.length - 1) * bLh / 2; bl.forEach(function (t, i) { x.fillText(t, 852, by0 + i * bLh - 10); });
    hit('badge', 764, by0 - 10 - bS * 0.9, 176, Math.max(bl.length, 1) * bLh + 6);
    var sS = 14, bs; for (; ; sS--) { x.font = '600 ' + sS + 'px ' + MAG_SANS; bs = wrap(T('badgeSub'), 140); if (bs.length * sS * 1.2 <= 54 || sS <= 7) break; }
    x.fillStyle = '#41584a'; bs.forEach(function (t, i) { x.fillText(t, 852, 1108 + i * sS * 1.2); });
    hit('badgeSub', 772, 1094, 160, Math.max(bs.length, 1) * sS * 1.2 + 8);
    });
    x.fillStyle = '#ffffff'; x.fillRect(690, HU - 190, 262, 142);
    x.fillStyle = '#111'; var bx = 706, sd = 7; while (bx < 936) { sd = (sd * 9301 + 49297) % 233280; var bw = 2 + (sd % 4) * 1.4; x.fillRect(bx, HU - 178, bw, 92); bx += bw + 2 + (sd % 3) * 1.2; }
    x.font = '500 15px "DM Mono", monospace'; x.textAlign = 'center'; x.fillText('1 18091 95600 583', 821, HU - 62);
  }

  else {   /* lukis */
    x.fillStyle = '#128037'; x.fillRect(0, 0, 1000, HU);
    stage(0, { painted: true, title: function () { at('mast', function () { var mc = inkOn(30, 110, 940, 170); soft(mc, function () { masthead(30, 272, 940, mc, true); }); hit('mast', 30, 120, 940, 170); }); } });
    var rg = x.createLinearGradient(0, HU - 560, 0, HU); rg.addColorStop(0, 'rgba(120,0,20,0)'); rg.addColorStop(0.55, 'rgba(120,0,20,.62)'); rg.addColorStop(1, 'rgba(105,0,16,.92)');
    x.fillStyle = rg; x.fillRect(0, HU - 560, 1000, 560);
    magGrain(x, W, H, 0.22, 'overlay');
    var head = String(T('headline')).toUpperCase(), fs2 = 150, lines;
    for (; fs2 >= 54; fs2 -= 6) { x.font = 'italic 400 ' + fs2 + 'px ' + MAG_SERIF; lines = wrap(head, 860); if (lines.length <= 2) break; }
    x.fillStyle = '#ffffff'; x.textAlign = 'center';
    var last = HU - 110;
    at('headline', function () {
    lines.slice().reverse().forEach(function (t, i) { x.fillText(t, 500, last - i * fs2 * 0.92); });
    var nl = Math.max(lines.length, 1); hit('headline', 60, last - (nl - 1) * fs2 * 0.92 - fs2 * 0.78, 880, (nl - 1) * fs2 * 0.92 + fs2 * 0.95);
    });
    at('edition', function () { var ed = String(T('edition')).toUpperCase(), es = 26; for (; es > 10; es--) { x.font = '400 ' + es + 'px ' + MAG_SERIF; if (tw(ed) + ed.length * es * 0.27 <= 900) break; } x.fillStyle = 'rgba(255,255,255,.9)'; spaced(ed, 500, HU - 52, es * 0.27, 'center'); hit('edition', 220, HU - 82, 560, 42); });
  }
  return c;
}

/* ---------- antrean render dan cache: satu render dalam satu waktu; hasil lama dibuang saat foto atau teks berubah ---------- */
var magQ = Promise.resolve(), magGen = [], magUrls = {};
function magBlob(style, catId, W, q) {
  return magRender(style, catId, W).then(function (cv) { return new Promise(function (res) { cv.toBlob(res, 'image/jpeg', q || 0.92); }); });
}
function magUrl(style, catId, W) {
  var key = style + '|' + catId + '|' + S.mag.rev + '|' + W;
  if (magUrls[key]) return magUrls[key];
  var rev = S.mag.rev;
  var p = magQ = magQ.then(function () {
    if (rev !== S.mag.rev) return null;   /* sudah usang */
    return magBlob(style, catId, W, 0.9).then(function (b) { var u = URL.createObjectURL(b); magGen.push(u); return u; });
  }).catch(function () { return null; });
  magUrls[key] = p;
  return p;
}
/* <img> untuk satu sampul majalah. src terisi begitu render selesai; magRefresh() mengisinya ulang setelah foto atau teks berubah. */
function magArt(cat, cv, label, W) {
  var el = new Image(); el.width = 360; el.height = 509; el.draggable = false; el.alt = label || '';
  el.dataset.mag = cv.mag; el.dataset.cat = cat.id; el.dataset.w = W || 320;   /* sampul kecil di rak cukup 320 px: render jauh lebih ringan */
  el.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  if (!label) el.setAttribute('aria-hidden', 'true');
  magFill(el);
  return el;
}
function magFill(el) {
  var rev = S.mag.rev;
  magUrl(el.dataset.mag, el.dataset.cat, +el.dataset.w).then(function (u) { if (u && rev === S.mag.rev && el.isConnected !== false) el.src = u; });
}
var magTimer = 0;
function magChanged() {
  S.mag.rev++; magUrls = {};
  clearTimeout(magTimer);
  magTimer = setTimeout(function () {
    var old = magGen; magGen = [];
    $$('img[data-mag]').forEach(magFill);
    setTimeout(function () { old.forEach(function (u) { URL.revokeObjectURL(u); }); }, 4000);
  }, 320);   /* tunggu ketikan berhenti sebelum menggambar ulang semua sampul */
}
