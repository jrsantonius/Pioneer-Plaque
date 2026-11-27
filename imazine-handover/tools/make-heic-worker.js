// Membuat public/imazine/vendor/heic/heic-worker.js dari heic-to.js (27 Nov 2026).
// heic-to sudah membuka HEIC di Web Worker, tapi mengirim balik ImageData penuh (12 MP = ~48 MB) ke halaman, lalu
// halaman memperkecil dan menyimpan JPEG di jalur utama: layar macet ~150 ms per foto di Chrome. Worker ini memakai
// kode worker yang sama dari heic-to, lalu memperkecil dan menyimpan JPEG di dalam worker (OffscreenCanvas), sehingga
// yang dikirim ke halaman hanya tiga file JPEG kecil: ukuran cetak (sisi terpanjang 4032), editor (1600), dan thumbnail (320).
// Pakai: node tools/make-heic-worker.js   (jalankan ulang bila heic-to.js diganti versinya)
const fs = require('fs'), path = require('path');
const dir = path.resolve(__dirname, '../../public/imazine/vendor/heic');
const src = fs.readFileSync(path.join(dir, 'heic-to.js'), 'utf8');
const m = src.match(/const workerFileContent = ('(?:[^'\\]|\\.)*');/);
if (!m) throw new Error('workerFileContent tidak ditemukan di heic-to.js');
const libWorker = (0, eval)(m[1]);
const head = `/* Imazine HEIC worker, dibuat oleh imazine-handover/tools/make-heic-worker.js dari heic-to 1.6.7 (lisensi: LICENSE.txt).
   Pesan masuk: { id, buffer, imz: { full, q, preview, pq, thumb, tq } }. Pesan keluar: { id, full, preview, thumb, w, h } (Blob JPEG). */
(function () {
  var post = self.postMessage.bind(self), jobs = {};
  self.addEventListener('message', function (e) { var d = e.data; if (d && d.id && d.imz) jobs[d.id] = d.imz; });
  function enc(src, w, h, max, q) {
    var k = Math.min(1, max / Math.max(w, h)), c = new OffscreenCanvas(Math.max(1, Math.round(w * k)), Math.max(1, Math.round(h * k)));
    var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
    x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, c.width, c.height);
    return c.convertToBlob({ type: 'image/jpeg', quality: q }).then(function (b) { return { blob: b, w: c.width, h: c.height, c: c }; });
  }
  function work(img, job) {
    var w = img.width, h = img.height, src = new OffscreenCanvas(w, h);
    src.getContext('2d').putImageData(img, 0, 0);
    return enc(src, w, h, job.full, job.q).then(function (full) {
      return enc(src, w, h, job.preview, job.pq).then(function (pv) {
        src.width = src.height = 1; full.c.width = full.c.height = 1;
        return enc(pv.c, pv.w, pv.h, job.thumb, job.tq).then(function (th) {
          pv.c.width = pv.c.height = 1; th.c.width = th.c.height = 1;
          return { full: full.blob, preview: pv.blob, thumb: th.blob, w: pv.w, h: pv.h };
        });
      });
    });
  }
  self.postMessage = function (msg, tr) {
    var job = msg && msg.id ? jobs[msg.id] : null;
    if (!job) return post(msg, tr);
    delete jobs[msg.id];
    if (msg.error || !msg.imageData) return post({ id: msg.id, error: String(msg.error || 'no image') });
    work(msg.imageData, job).then(function (r) { r.id = msg.id; post(r); }, function (err) { post({ id: msg.id, error: String(err && err.message || err) }); });
  };
})();
`;
fs.writeFileSync(path.join(dir, 'heic-worker.js'), head + libWorker);
console.log('heic-worker.js', (head.length + libWorker.length) + ' bytes');
