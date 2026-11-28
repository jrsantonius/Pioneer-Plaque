/* ---------- Unduh album .zip (admin, 28 Nov 2026) ----------------------------------
   /imazine/admin/unduh?no=IMZ-AAAAAA[,IMZ-BBBBBB...]
   Untuk tiap pesanan: album disusun dengan halaman album yang sama (render/buildAlbum/loadPhotos dari album-print.js),
   tiap lembar (sampul depan, 40 halaman, sampul belakang) digambar ke kanvas 300 dpi lewat SVG foreignObject,
   dijadikan PDF A4 (satu JPEG per halaman), lalu bersama file data penerima dibungkus jadi satu .zip dan diunduh.
   Semua di browser admin: hosting tidak punya mesin pembuat PDF. Safari/WebKit tidak mengizinkan kanvas berisi
   foreignObject diekspor, jadi perlu Chrome atau Edge.
------------------------------------------------------------------------------------ */
var PACK_DPI_W = 2480, PACK_JPEG_Q = 0.9, PACK_A4 = [595.276, 841.89];
var packEnc = new TextEncoder();

/* ---- CRC32 (untuk zip) ---- */
var CRC_T = (function () { var t = new Uint32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crcAdd(crc, u8) { for (var i = 0; i < u8.length; i++) crc = CRC_T[(crc ^ u8[i]) & 255] ^ (crc >>> 8); return crc; }

/* ---- penulis PDF kecil: tiap halaman satu JPEG penuh (DCTDecode) ---- */
function PdfWriter() { this.parts = []; this.size = 0; this.crc = 0xFFFFFFFF; this.offs = []; this.kids = []; this.n = 2; this.put(new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52, 10, 37, 0xE2, 0xE3, 0xCF, 0xD3, 10])); }
PdfWriter.prototype.put = function (x) { var u = typeof x === 'string' ? packEnc.encode(x) : x; this.parts.push(u); this.crc = crcAdd(this.crc, u); this.size += u.length; };
PdfWriter.prototype.obj = function (num, body) { this.offs[num] = this.size; this.put(num + ' 0 obj\n' + body); };
PdfWriter.prototype.page = function (jpg, w, h) {
  var im = ++this.n, ct = ++this.n, pg = ++this.n, W = PACK_A4[0], H = PACK_A4[1];
  this.obj(im, '<< /Type /XObject /Subtype /Image /Width ' + w + ' /Height ' + h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpg.length + ' >>\nstream\n');
  this.put(jpg); this.put('\nendstream\nendobj\n');
  var cs = 'q ' + W + ' 0 0 ' + H + ' 0 0 cm /Im0 Do Q';
  this.obj(ct, '<< /Length ' + cs.length + ' >>\nstream\n' + cs + '\nendstream\nendobj\n');
  this.obj(pg, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + W + ' ' + H + '] /Resources << /XObject << /Im0 ' + im + ' 0 R >> >> /Contents ' + ct + ' 0 R >>\nendobj\n');
  this.kids.push(pg + ' 0 R');
};
PdfWriter.prototype.finish = function (title) {
  this.obj(2, '<< /Type /Pages /Kids [' + this.kids.join(' ') + '] /Count ' + this.kids.length + ' >>\nendobj\n');
  this.obj(1, '<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  var info = ++this.n; this.obj(info, '<< /Title (' + String(title).replace(/[()\\]/g, '') + ') /Producer (Imazine) >>\nendobj\n');
  var x = this.size, s = 'xref\n0 ' + (this.n + 1) + '\n0000000000 65535 f \n';
  for (var i = 1; i <= this.n; i++) s += String(this.offs[i]).padStart(10, '0') + ' 00000 n \n';
  this.put(s + 'trailer\n<< /Size ' + (this.n + 1) + ' /Root 1 0 R /Info ' + info + ' 0 R >>\nstartxref\n' + x + '\n%%EOF\n');
  var out = { blob: new Blob(this.parts, { type: 'application/pdf' }), size: this.size, crc: (this.crc ^ 0xFFFFFFFF) >>> 0 };
  this.parts = null;   /* biarkan memori dilepas; isi PDF sudah di Blob */
  return out;
};

/* ---- zip tanpa kompresi (PDF berisi JPEG, tidak bisa dikecilkan lagi) ---- */
function ZipWriter() { this.parts = []; this.cd = []; this.off = 0; this.count = 0; }
ZipWriter.prototype.add = function (name, data, size, crc) {
  var nm = packEnc.encode(name), d = new Date(), time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  function hdr(len) { var b = new DataView(new ArrayBuffer(len)); return b; }
  var lh = hdr(30); lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
  lh.setUint16(10, time, true); lh.setUint16(12, date, true); lh.setUint32(14, crc, true); lh.setUint32(18, size, true); lh.setUint32(22, size, true); lh.setUint16(26, nm.length, true); lh.setUint16(28, 0, true);
  var ch = hdr(46); ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
  ch.setUint16(12, time, true); ch.setUint16(14, date, true); ch.setUint32(16, crc, true); ch.setUint32(20, size, true); ch.setUint32(24, size, true); ch.setUint16(28, nm.length, true); ch.setUint32(42, this.off, true);
  this.parts.push(lh.buffer, nm, data); this.cd.push(ch.buffer, nm);
  this.off += 30 + nm.length + size; this.count++;
};
ZipWriter.prototype.addText = function (name, text) { var u = packEnc.encode(text); this.add(name, u, u.length, (crcAdd(0xFFFFFFFF, u) ^ 0xFFFFFFFF) >>> 0); };
ZipWriter.prototype.blob = function () {
  var cdSize = this.cd.reduce(function (n, p) { return n + p.byteLength; }, 0), end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, this.count, true); end.setUint16(10, this.count, true); end.setUint32(12, cdSize, true); end.setUint32(16, this.off, true);
  return new Blob(this.parts.concat(this.cd, [end.buffer]), { type: 'application/zip' });
};

/* ---- satu lembar album -> JPEG 300 dpi ---- */
function packDataUrl(u) {
  return fetch(u, { credentials: 'same-origin' }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + u); return r.blob(); })
    .then(function (b) { return new Promise(function (res) { var f = new FileReader(); f.onload = function () { res(f.result); }; f.readAsDataURL(b); }); });
}
var packCss = null;
function packStyles() {
  if (packCss) return packCss;
  var css = [].map.call(document.querySelectorAll('style'), function (s) { return s.textContent; }).join('\n');
  var urls = []; css.replace(/url\(["']?(\/public\/[^"')]+)["']?\)/g, function (m, u) { if (urls.indexOf(u) < 0) urls.push(u); });
  return (packCss = Promise.all(urls.map(packDataUrl)).then(function (data) {
    urls.forEach(function (u, i) { css = css.split(u).join(data[i]); });
    return css.split(']]>').join('');
  }));
}
var packImgCache = {}, packCanvas = null;
function packImg(u) { return packImgCache[u] || (packImgCache[u] = packDataUrl(u)); }
function sheetJpeg(sheet) {
  var w = sheet.offsetWidth, hh = sheet.offsetHeight, W = PACK_DPI_W, H = Math.round(W * hh / w);
  var clone = sheet.cloneNode(true);
  clone.style.cssText = 'width:' + w + 'px;height:' + hh + 'px;max-width:none;max-height:none;box-shadow:none;margin:0';
  var src = [].slice.call(sheet.querySelectorAll('img')), dst = [].slice.call(clone.querySelectorAll('img'));
  var jobs = dst.map(function (el, i) {
    var u = src[i].currentSrc || src[i].src;
    if (!u || u.indexOf('data:') === 0) return null;
    return packImg(u).then(function (d) { el.setAttribute('src', d); el.removeAttribute('srcset'); el.removeAttribute('loading'); });
  });
  [].forEach.call(clone.querySelectorAll('image'), function (el) {
    var u = el.getAttribute('href') || el.getAttribute('xlink:href');
    if (u && u.indexOf('data:') !== 0) jobs.push(packImg(new URL(u, location.href).href).then(function (d) { el.setAttribute('href', d); el.removeAttribute('xlink:href'); }));
  });
  return Promise.all([packStyles()].concat(jobs)).then(function (r) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + w + ' ' + hh + '"><foreignObject x="0" y="0" width="' + w + '" height="' + hh + '">'
      + '<div xmlns="http://www.w3.org/1999/xhtml" style="width:' + w + 'px;height:' + hh + 'px"><style><![CDATA[' + r[0] + ']]></style>' + new XMLSerializer().serializeToString(clone) + '</div></foreignObject></svg>';
    return new Promise(function (res, rej) {
      var im = new Image();
      im.onload = function () { res(im); };
      im.onerror = function () { rej(new Error('Halaman tidak bisa digambar.')); };
      im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  }).then(function (im) {
    var c = packCanvas || (packCanvas = document.createElement('canvas'));
    c.width = W; c.height = H;
    var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.drawImage(im, 0, 0, W, H);
    return new Promise(function (res, rej) {
      try { c.toBlob(function (b) { b ? res(b) : rej(new Error('JPEG gagal dibuat.')); }, 'image/jpeg', PACK_JPEG_Q); } catch (e) { rej(e); }
    });
  }).then(function (b) { return b.arrayBuffer(); }).then(function (ab) { return { bytes: new Uint8Array(ab), w: W, h: H }; });
}

/* Hanya Chrome/Edge (Chromium). WebKit (Safari, juga semua browser di iPhone/iPad) diuji 28 Nov 2026: lolos cek kecil di bawah,
   tapi PDF-nya rusak (sampul kosong, skala halaman salah). Firefox belum diuji. Setelah itu tetap dicek: kanvas bisa diekspor. */
function packCanExport() {
  var ua = navigator.userAgent;
  if (!/Chrome\/|Edg\//.test(ua) || /CriOS|EdgiOS|FxiOS|OPiOS/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1 && !/Chrome\//.test(ua))) return Promise.resolve(false);
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"><foreignObject width="4" height="4"><div xmlns="http://www.w3.org/1999/xhtml" style="width:4px;height:4px;background:#000"></div></foreignObject></svg>';
  return new Promise(function (res) {
    var im = new Image();
    im.onload = function () { try { var c = document.createElement('canvas'); c.width = c.height = 4; c.getContext('2d').drawImage(im, 0, 0); c.toDataURL(); res(true); } catch (e) { res(false); } };
    im.onerror = function () { res(false); };
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}

function recipientText(order) {
  var r = order.recipient || {}, line = function (k, v) { return (k + '               ').slice(0, 15) + ': ' + (v || '-') + '\r\n'; };
  return line('Nomor pesanan', r.orderNo || NO) + line('Nama penerima', r.name) + line('Alamat', r.address || '(belum ada, data pengiriman Mayar belum tercatat)')
    + line('No. HP', r.phone) + line('Email', r.email);
}

function packStatus(t) { ui.prog.textContent = t; }
function packOne(no, zip, folder) {
  NO = no; BASE = '/imazine/admin/pesanan/' + no;
  packStatus(no + ': membuka data pesanan…');
  return fetch(BASE + '/data.json', { credentials: 'same-origin', cache: 'no-store' }).then(function (r) {
    if (r.status === 401) throw new Error('Sesi admin habis. Masuk lagi di /imazine/admin, lalu buka halaman ini lagi.');
    if (r.status === 404) throw new Error('pesanan tidak ditemukan');
    if (!r.ok) throw new Error('data pesanan tidak bisa dibuka (HTTP ' + r.status + ')');
    return r.json();
  }).then(function (order) {
    var album = buildAlbum(order);
    ui.cover.checked = true;
    render(order, album);
    return loadPhotos(album).then(function (lp) {
      if (lp.failed.length) throw new Error('foto nomor ' + lp.failed.join(', ') + ' gagal dimuat');
      return document.fonts ? document.fonts.ready : null;
    }).then(function () {
      var sheets = [].slice.call(ui.book.querySelectorAll('.sheet')), pdf = new PdfWriter(), i = 0;
      function next() {
        if (i >= sheets.length) return null;
        packStatus(no + ': membuat PDF, halaman ' + (i + 1) + ' dari ' + sheets.length + '…');
        sheets[i].scrollIntoView({ block: 'nearest' });
        return sheetJpeg(sheets[i]).then(function (j) { pdf.page(j.bytes, j.w, j.h); i++; return next(); });
      }
      return Promise.resolve(next()).then(function () {
        var out = pdf.finish(no + ' album'), dir = folder ? no + '/' : '';
        zip.add(dir + no + '-album.pdf', out.blob, out.size, out.crc);
        zip.addText(dir + no + '-penerima.txt', recipientText(order));
        packImgCache = {};
        return sheets.length;
      });
    });
  });
}

function packBoot() {
  var nos = ((new URLSearchParams(location.search).get('no') || '').toUpperCase().match(/IMZ-[A-Z0-9]{6}/g) || []).filter(function (v, i, a) { return a.indexOf(v) === i; });
  document.body.classList.add('mode-pack');
  document.title = 'Unduh album';
  $('#back').href = '/imazine/admin';
  $('#back').textContent = '← Kembali ke daftar pesanan';
  ui.title.textContent = nos.length > 1 ? 'Unduh ' + nos.length + ' album (.zip)' : 'Unduh album ' + (nos[0] || '') + ' (.zip)';
  ui.meta.textContent = nos.length > 1 ? nos.join(', ') : 'Isi zip: album PDF A4 (sampul depan, isi, sampul belakang; 300 dpi) dan data penerima.';
  if (!nos.length) return fail('Tidak ada nomor pesanan di alamat halaman ini.');
  packCanExport().then(function (ok) {
    if (!ok) throw new Error('Browser ini tidak bisa membuat PDF album dengan benar. Buka halaman ini di Google Chrome atau Microsoft Edge di komputer (Safari dan browser di iPhone/iPad tidak bisa).');
    var zip = new ZipWriter(), bad = [], k = 0;
    function next() {
      if (k >= nos.length) return null;
      var no = nos[k++];
      return packOne(no, zip, nos.length > 1).catch(function (e) {
        if (/Sesi admin habis/.test(e.message)) throw e;
        bad.push(no + ': ' + (e.message || e));
      }).then(next);
    }
    return Promise.resolve(next()).then(function () {
      if (bad.length) zip.addText('GAGAL.txt', 'Pesanan berikut tidak ikut di zip:\r\n' + bad.join('\r\n') + '\r\n');
      if (bad.length === nos.length) throw new Error('Tidak ada album yang berhasil dibuat. ' + bad.join(' · '));
      var name = nos.length > 1 ? 'imazine-' + new Date().toISOString().slice(0, 10) + '-' + (nos.length - bad.length) + '-album.zip' : nos[0] + '.zip';
      var url = URL.createObjectURL(zip.blob()), a = document.createElement('a');
      a.href = url; a.download = name; a.className = 'btn'; a.textContent = 'Unduh lagi';
      var tmp = document.body.appendChild(a.cloneNode(true)); tmp.click(); tmp.remove();
      packStatus('Selesai. ' + name + ' tersimpan di folder Unduhan.' + (bad.length ? ' ' + bad.length + ' pesanan gagal (lihat GAGAL.txt di zip).' : ''));
      if (bad.length) { ui.warn.hidden = false; ui.warn.textContent = bad.join(' · '); }
      $('.act').textContent = ''; $('.act').appendChild(a);
    });
  }).catch(function (e) { fail(e.message || String(e)); });
}
