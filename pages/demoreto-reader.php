<?php
/**
 * Demoreto - protected online book reader
 * Reader:  /baca/demoreto/{DEMORETO_TOKEN}
 * Images:  /baca/demoreto/page/{n}?e={expiry}&s={hmac}  (needs reader cookie)
 */

require_once dirname(__DIR__) . '/storage/demoreto-secret.php';

const DMR_PAGES = 17;
const DMR_TTL = 4 * 60 * 60; // signed URLs & cookie valid 4 jam
const DMR_COOKIE = 'dmr_reader';
const DMR_PATH = '/baca/demoreto';

function dmrSign(string $data): string {
    return hash_hmac('sha256', $data, DEMORETO_SECRET);
}

function dmrNotFound(): void {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    header('X-Robots-Tag: noindex, nofollow');
    echo 'Halaman tidak ditemukan.';
    exit;
}

function dmrCookieValid(): bool {
    $raw = $_COOKIE[DMR_COOKIE] ?? '';
    if (!preg_match('/^(\d{10})\.([a-f0-9]{64})$/', $raw, $m)) return false;
    return (int) $m[1] > time() && hash_equals(dmrSign('cookie|' . $m[1]), $m[2]);
}

function serveDemoretoPage(int $n): void {
    $exp = (int) ($_GET['e'] ?? 0);
    $sig = (string) ($_GET['s'] ?? '');
    if ($n < 1 || $n > DMR_PAGES || $exp < time()
        || !hash_equals(dmrSign("page|$n|$exp"), $sig)
        || !dmrCookieValid()) {
        dmrNotFound();
    }
    // Block hotlinking from other sites
    $ref = $_SERVER['HTTP_REFERER'] ?? '';
    $refHost = parse_url($ref, PHP_URL_HOST) . (parse_url($ref, PHP_URL_PORT) ? ':' . parse_url($ref, PHP_URL_PORT) : '');
    if ($ref !== '' && $refHost !== ($_SERVER['HTTP_HOST'] ?? '')) {
        dmrNotFound();
    }
    $file = dirname(__DIR__) . "/storage/demoreto/$n.webp";
    if (!is_file($file)) dmrNotFound();

    header('Content-Type: image/webp');
    header('Content-Length: ' . filesize($file));
    header('Cache-Control: private, max-age=3600');
    header('X-Robots-Tag: noindex, nofollow, noimageindex');
    header('X-Content-Type-Options: nosniff');
    header('Content-Disposition: inline; filename="demoreto.webp"');
    readfile($file);
    exit;
}

function serveDemoretoPdf(): void {
    $exp = (int) ($_GET['e'] ?? 0);
    $sig = (string) ($_GET['s'] ?? '');
    if ($exp < time() || !hash_equals(dmrSign("pdf|$exp"), $sig) || !dmrCookieValid()) {
        dmrNotFound();
    }
    $file = dirname(__DIR__) . '/storage/demoreto/demoreto.pdf';
    if (!is_file($file)) dmrNotFound();

    header('Content-Type: application/pdf');
    header('Content-Length: ' . filesize($file));
    header('Content-Disposition: attachment; filename="Demoreto - The Innovators Studio.pdf"');
    header('Cache-Control: private, no-store');
    header('X-Robots-Tag: noindex, nofollow');
    header('X-Content-Type-Options: nosniff');
    readfile($file);
    exit;
}

if (!empty($readerDownload)) {
    serveDemoretoPdf();
}

if (isset($m[1]) && !isset($readerToken)) {
    serveDemoretoPage((int) $m[1]);
}

if (!isset($readerToken) || !hash_equals(DEMORETO_TOKEN, $readerToken)) {
    dmrNotFound();
}

// Valid link: issue reader cookie + signed page URLs
$exp = time() + DMR_TTL;
setcookie(DMR_COOKIE, $exp . '.' . dmrSign('cookie|' . $exp), [
    'expires' => $exp,
    'path' => DMR_PATH,
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'httponly' => true,
    'samesite' => 'Strict',
]);
$pages = [];
for ($i = 1; $i <= DMR_PAGES; $i++) {
    $pages[] = DMR_PATH . "/page/$i?e=$exp&s=" . dmrSign("page|$i|$exp");
}
$pdfUrl = DMR_PATH . "/unduh?e=$exp&s=" . dmrSign("pdf|$exp");

$chapters = [
    [1, 'Sampul'],
    [4, 'Daftar Isi'],
    [5, '01 · Pembuka'],
    [6, '02 · Demokrasi dan Celah Kompetensi'],
    [7, '03 · Demoreto'],
    [8, '04 · Prinsip Dasar'],
    [9, '05 · Siapa Saja yang Terlibat'],
    [10, '06 · Alur Kerja Demoreto'],
    [12, '07 · Insentif Demokrasi dan Anggaran'],
    [14, '08 · Tantangan yang Perlu Dijawab'],
    [15, '09 · Belajar dari Praktik Lain'],
    [16, '10 · Penutup'],
];

header('X-Robots-Tag: noindex, nofollow, noarchive');
header('Referrer-Policy: same-origin');
header('X-Frame-Options: DENY');
header('Cache-Control: no-store');
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="robots" content="noindex, nofollow, noarchive">
    <meta name="theme-color" content="#16110f">
    <title>Demoreto — Gagasan Suara Rakyat | The Innovators Studio</title>
    <link rel="icon" type="image/png" href="/public/images/tis-logo-circle.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=Source+Serif+4:ital,wght@0,400;1,400&display=swap" rel="stylesheet">
    <link rel="preload" as="image" href="<?= e($pages[0]) ?>">
    <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
            --ink: #16110f;
            --ink-2: #221a17;
            --paper: #f4f1ec;
            --red: #d9452b;
            --red-soft: rgba(217,69,43,0.16);
            --dim: rgba(244,241,236,0.6);
            --line: rgba(244,241,236,0.12);
        }
        html, body { height: 100%; }
        body {
            background: var(--ink);
            color: var(--paper);
            font-family: 'Inter', system-ui, sans-serif;
            -webkit-font-smoothing: antialiased;
            overflow: hidden;
            -webkit-user-select: none; user-select: none;
            -webkit-touch-callout: none;
        }
        img { -webkit-user-drag: none; user-drag: none; pointer-events: none; }
        button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; }
        @media print { body { display: none !important; } }

        /* ===== INTRO ===== */
        .intro {
            position: fixed; inset: 0; z-index: 50;
            display: grid; grid-template-columns: 1.05fr 1fr; align-items: center;
            gap: clamp(24px, 5vw, 80px);
            padding: clamp(24px, 6vw, 96px);
            background:
                radial-gradient(1200px 600px at 75% 40%, rgba(217,69,43,0.22), transparent 60%),
                var(--ink);
            transition: opacity .7s ease, visibility .7s;
        }
        .intro.gone { opacity: 0; visibility: hidden; }
        .intro-copy { max-width: 560px; }
        .eyebrow {
            font-size: 12px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
            color: var(--red); display: flex; align-items: center; gap: 10px;
        }
        .eyebrow::before { content: ''; width: 28px; height: 2px; background: var(--red); }
        .intro h1 {
            font-weight: 800; letter-spacing: -0.04em; line-height: .88;
            font-size: clamp(64px, 11vw, 168px);
            margin: 22px 0 18px;
        }
        .intro h1 span { display: block; color: var(--red); }
        .intro-lede {
            font-family: 'Source Serif 4', Georgia, serif;
            font-size: clamp(18px, 1.7vw, 23px); line-height: 1.45; color: var(--dim);
            max-width: 470px;
        }
        .intro-meta { display: flex; flex-wrap: wrap; gap: 8px; margin: 26px 0 34px; }
        .chip {
            font-size: 12px; font-weight: 500; padding: 7px 12px; border-radius: 99px;
            border: 1px solid var(--line); color: var(--dim);
        }
        .cta {
            display: inline-flex; align-items: center; gap: 12px;
            background: var(--red); color: #fff; font-weight: 600; font-size: 16px;
            padding: 17px 28px; border-radius: 99px;
            box-shadow: 0 12px 40px rgba(217,69,43,0.35);
            transition: transform .25s ease, box-shadow .25s ease;
        }
        .cta:hover { transform: translateY(-2px); box-shadow: 0 18px 50px rgba(217,69,43,0.45); }
        .cta svg { transition: transform .25s ease; }
        .cta:hover svg { transform: translateX(4px); }
        .cta-row { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
        .cta-ghost {
            display: inline-flex; align-items: center; gap: 10px;
            color: var(--paper); text-decoration: none; font-weight: 600; font-size: 15px;
            padding: 16px 24px; border-radius: 99px; border: 1px solid var(--line);
            transition: background .25s ease, border-color .25s ease;
        }
        .cta-ghost:hover { background: var(--line); border-color: rgba(244,241,236,0.25); }
        .drawer-dl {
            margin: 4px 22px 28px; justify-content: center;
            background: var(--red-soft); border-color: transparent; color: var(--paper);
        }
        .drawer-dl small { color: var(--dim); font-weight: 400; }
        .resume { display: block; margin-top: 16px; font-size: 13px; color: var(--dim); text-decoration: underline; text-underline-offset: 3px; }
        .resume[hidden] { display: none; }

        .book-wrap { perspective: 1800px; display: flex; justify-content: center; }
        .book {
            position: relative; width: min(100%, 420px); aspect-ratio: 827 / 1170;
            transform: rotateY(-22deg) rotateX(6deg);
            transform-style: preserve-3d;
            animation: float 7s ease-in-out infinite;
            transition: transform .6s cubic-bezier(.2,.7,.2,1);
        }
        .book:hover { transform: rotateY(-8deg) rotateX(2deg); }
        .book img { width: 100%; height: 100%; object-fit: cover; border-radius: 3px 8px 8px 3px; display: block;
            box-shadow: 30px 40px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04); }
        .book::before { /* spine */
            content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 22px;
            transform: translateX(-22px) rotateY(-90deg); transform-origin: right;
            background: linear-gradient(90deg, #8f2a19, var(--red));
        }
        .book::after { /* page block */
            content: ''; position: absolute; right: -10px; top: 6px; bottom: 6px; width: 10px;
            background: repeating-linear-gradient(90deg, #e9e4dc 0 1px, #cfc8bd 1px 2px);
            border-radius: 0 3px 3px 0; transform: translateZ(-6px);
        }
        @keyframes float { 50% { translate: 0 -12px; } }

        /* ===== READER ===== */
        .reader { position: fixed; inset: 0; display: flex; flex-direction: column; }
        .topbar {
            display: flex; align-items: center; justify-content: space-between; gap: 12px;
            padding: max(14px, env(safe-area-inset-top)) 18px 14px;
            border-bottom: 1px solid var(--line);
        }
        .brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .brand b { font-weight: 800; letter-spacing: -0.02em; }
        .brand small { color: var(--dim); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--red); flex: none; }
        .tools { display: flex; gap: 4px; }
        .icon-btn {
            width: 40px; height: 40px; border-radius: 10px; display: grid; place-items: center;
            color: var(--dim); transition: background .2s, color .2s;
        }
        .icon-btn:hover { background: var(--line); color: var(--paper); }

        .stage {
            position: relative; flex: 1; min-height: 0;
            display: flex; align-items: center; justify-content: center; gap: 0;
            padding: 20px; perspective: 2400px; overflow: hidden;
            touch-action: pan-y pinch-zoom;
        }
        .spread { position: relative; height: 100%; display: flex; justify-content: center; align-items: center; }
        .sheet {
            position: relative; height: 100%; max-width: 100%;
            aspect-ratio: 827 / 1170; background: var(--paper);
            box-shadow: 0 30px 70px rgba(0,0,0,0.5);
            overflow: hidden;
        }
        .sheet img { width: 100%; height: 100%; display: block; object-fit: contain; opacity: 0; transition: opacity .35s ease; }
        .sheet img.loaded { opacity: 1; }
        .sheet.left { border-radius: 4px 0 0 4px; }
        .sheet.right { border-radius: 0 4px 4px 0; }
        .sheet.solo { border-radius: 4px; }
        .sheet.left::after, .sheet.right::after { /* gutter shading */
            content: ''; position: absolute; top: 0; bottom: 0; width: 40px; pointer-events: none;
        }
        .sheet.left::after { right: 0; background: linear-gradient(90deg, transparent, rgba(0,0,0,0.12)); }
        .sheet.right::after { left: 0; background: linear-gradient(-90deg, transparent, rgba(0,0,0,0.12)); }
        .sheet .wm { /* faint watermark, survives screenshots */
            position: absolute; inset: 0; pointer-events: none;
            display: flex; align-items: flex-end; justify-content: center; padding-bottom: 1.2%;
            font-size: clamp(7px, .9vh, 10px); letter-spacing: .12em; text-transform: uppercase;
            color: rgba(22,17,15,0.28);
        }
        .spread.turn-next { animation: turnNext .55s cubic-bezier(.3,.7,.2,1); }
        .spread.turn-prev { animation: turnPrev .55s cubic-bezier(.3,.7,.2,1); }
        @keyframes turnNext { 0% { transform: rotateY(18deg) translateX(6%); opacity: 0; } 100% { transform: none; opacity: 1; } }
        @keyframes turnPrev { 0% { transform: rotateY(-18deg) translateX(-6%); opacity: 0; } 100% { transform: none; opacity: 1; } }

        .nav-zone {
            position: absolute; top: 0; bottom: 0; width: 22%; z-index: 3;
            display: flex; align-items: center; cursor: pointer;
        }
        .nav-zone.prev { left: 0; justify-content: flex-start; padding-left: 18px; }
        .nav-zone.next { right: 0; justify-content: flex-end; padding-right: 18px; }
        .nav-zone span {
            width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center;
            background: rgba(22,17,15,0.7); border: 1px solid var(--line); backdrop-filter: blur(8px);
            opacity: 0; transform: scale(.9); transition: opacity .25s, transform .25s;
        }
        .nav-zone:hover span { opacity: 1; transform: none; }
        .nav-zone.disabled { pointer-events: none; }

        .bottombar {
            display: flex; align-items: center; gap: 16px;
            padding: 14px 18px max(14px, env(safe-area-inset-bottom));
            border-top: 1px solid var(--line);
        }
        .counter { font-variant-numeric: tabular-nums; font-size: 13px; color: var(--dim); white-space: nowrap; min-width: 64px; }
        .counter b { color: var(--paper); font-weight: 600; }
        .chapter-now { font-size: 13px; color: var(--dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 260px; }
        .progress { flex: 1; position: relative; height: 28px; display: flex; align-items: center; cursor: pointer; }
        .progress-track { width: 100%; height: 3px; background: var(--line); border-radius: 3px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--red); width: 0; transition: width .45s ease; }
        .progress-ticks { position: absolute; inset: 0; pointer-events: none; }
        .progress-ticks i { position: absolute; top: 50%; width: 2px; height: 9px; margin-top: -4.5px; background: rgba(244,241,236,0.25); }

        /* TOC drawer */
        .scrim { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 20; opacity: 0; visibility: hidden; transition: opacity .3s, visibility .3s; }
        .drawer {
            position: fixed; top: 0; right: 0; bottom: 0; z-index: 21;
            width: min(380px, 88vw); background: var(--ink-2); border-left: 1px solid var(--line);
            transform: translateX(100%); transition: transform .4s cubic-bezier(.2,.7,.2,1);
            display: flex; flex-direction: column;
        }
        body.toc-open .scrim { opacity: 1; visibility: visible; }
        body.toc-open .drawer { transform: none; }
        .drawer-head { display: flex; justify-content: space-between; align-items: center; padding: 22px 22px 10px; }
        .drawer-head h2 { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
        .toc { list-style: none; overflow-y: auto; padding: 8px 12px 24px; }
        .toc button {
            width: 100%; display: flex; justify-content: space-between; gap: 12px; text-align: left;
            padding: 14px 12px; border-radius: 10px; font-size: 15px; color: var(--dim);
            border-bottom: 1px solid var(--line); transition: background .2s, color .2s;
        }
        .toc button:hover { background: var(--line); color: var(--paper); }
        .toc button.active { color: var(--paper); background: var(--red-soft); }
        .toc button small { font-variant-numeric: tabular-nums; color: var(--red); }
        .thumbs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 0 22px 28px; }
        .thumbs button { aspect-ratio: 827/1170; background: var(--paper); border-radius: 3px; overflow: hidden; outline: 2px solid transparent; outline-offset: 2px; transition: outline-color .2s; }
        .thumbs button.active { outline-color: var(--red); }
        .thumbs img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .label { font-size: 11px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: var(--dim); padding: 18px 22px 12px; }

        .hint {
            position: fixed; left: 50%; bottom: 92px; transform: translateX(-50%);
            background: rgba(34,26,23,0.92); border: 1px solid var(--line); backdrop-filter: blur(8px);
            padding: 10px 16px; border-radius: 99px; font-size: 13px; color: var(--dim);
            opacity: 0; transition: opacity .4s; pointer-events: none; white-space: nowrap; z-index: 5;
        }
        .hint.show { opacity: 1; }

        @media (max-width: 860px) {
            .intro { grid-template-columns: 1fr; align-content: center; text-align: left; overflow-y: auto; }
            .book-wrap { order: -1; }
            .book { width: min(52vw, 230px); }
            .intro h1 { margin: 14px 0 12px; }
            .intro-meta { margin: 18px 0 24px; }
            .stage { padding: 10px; }
            .nav-zone span { display: none; }
            .chapter-now { display: none; }
            .brand small { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after { animation: none !important; transition-duration: .01ms !important; }
        }
    </style>
</head>
<body oncontextmenu="return false">

<section class="intro" id="intro">
    <div class="intro-copy">
        <div class="eyebrow">Gagasan Suara Rakyat</div>
        <h1>Demo<span>reto.</span></h1>
        <p class="intro-lede">Gabungan demokrasi dan meritokrasi. Sebuah gagasan untuk merevolusi fungsi representasi suara rakyat Indonesia.</p>
        <div class="intro-meta">
            <span class="chip">10 bab</span>
            <span class="chip">17 halaman</span>
            <span class="chip">± 12 menit baca</span>
            <span class="chip">The Innovators Studio</span>
        </div>
        <div class="cta-row">
            <button class="cta" id="start">
                Mulai membaca
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
            <a class="cta-ghost" href="<?= e($pdfUrl) ?>" download>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>
                Unduh PDF
            </a>
        </div>
        <button class="resume" id="resume" hidden></button>
    </div>
    <div class="book-wrap">
        <div class="book"><img src="<?= e($pages[0]) ?>" alt="Sampul buku Demoreto" draggable="false"></div>
    </div>
</section>

<main class="reader" id="reader" aria-hidden="true">
    <header class="topbar">
        <div class="brand"><span class="dot"></span><b>Demoreto</b><small>Gagasan Suara Rakyat · The Innovators Studio</small></div>
        <div class="tools">
            <a class="icon-btn" href="<?= e($pdfUrl) ?>" download title="Unduh PDF" aria-label="Unduh PDF">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>
            </a>
            <button class="icon-btn" id="fs" title="Layar penuh" aria-label="Layar penuh">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>
            </button>
            <button class="icon-btn" id="tocBtn" title="Daftar isi" aria-label="Daftar isi">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>
            </button>
        </div>
    </header>

    <div class="stage" id="stage">
        <div class="nav-zone prev" id="prev"><span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></span></div>
        <div class="spread" id="spread"></div>
        <div class="nav-zone next" id="next"><span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></span></div>
    </div>

    <footer class="bottombar">
        <div class="counter" id="counter"></div>
        <div class="progress" id="progress">
            <div class="progress-track"><div class="progress-fill" id="fill"></div></div>
            <div class="progress-ticks" id="ticks"></div>
        </div>
        <div class="chapter-now" id="chapterNow"></div>
    </footer>
</main>

<div class="scrim" id="scrim"></div>
<aside class="drawer" aria-label="Daftar isi">
    <div class="drawer-head">
        <h2>Daftar isi</h2>
        <button class="icon-btn" id="tocClose" aria-label="Tutup">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
    </div>
    <div style="overflow-y:auto">
        <ul class="toc" id="toc"></ul>
        <div class="label">Semua halaman</div>
        <div class="thumbs" id="thumbs"></div>
        <a class="cta-ghost drawer-dl" href="<?= e($pdfUrl) ?>" download>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>
            Unduh PDF <small>· 19,8 MB</small>
        </a>
    </div>
</aside>

<div class="hint" id="hint"></div>

<script>
(() => {
    const PAGES = <?= json_encode($pages, JSON_UNESCAPED_SLASHES) ?>;
    const CHAPTERS = <?= json_encode($chapters, JSON_UNESCAPED_UNICODE) ?>;
    const TOTAL = PAGES.length;
    const KEY = 'demoreto-page';
    const $ = id => document.getElementById(id);
    const spread = $('spread');
    const cache = {};
    let page = 1, wide = false, busy = false;

    const store = {
        get() { try { return parseInt(localStorage.getItem(KEY), 10) || 0; } catch (e) { return 0; } },
        set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
    };

    function preload(n) {
        if (n < 1 || n > TOTAL || cache[n]) return;
        cache[n] = new Image();
        cache[n].src = PAGES[n - 1];
    }

    // Two-page spreads on wide screens: [1] [2,3] [4,5] ... (cover alone)
    function pagesFor(p) {
        if (!wide || p === 1) return [p];
        const left = p % 2 === 0 ? p : p - 1;
        return left + 1 <= TOTAL ? [left, left + 1] : [left];
    }
    function step(dir) {
        const cur = pagesFor(page);
        return dir > 0 ? cur[cur.length - 1] + 1 : (wide && cur[0] > 2 ? cur[0] - 2 : cur[0] - 1);
    }

    function sheet(n, cls) {
        const d = document.createElement('div');
        d.className = 'sheet ' + cls;
        const img = document.createElement('img');
        img.alt = 'Halaman ' + n;
        img.draggable = false;
        img.onload = () => img.classList.add('loaded');
        img.src = PAGES[n - 1];
        if (img.complete) img.classList.add('loaded');
        const wm = document.createElement('div');
        wm.className = 'wm';
        wm.textContent = 'Demoreto · The Innovators Studio · ' + location.host;
        d.append(img, wm);
        return d;
    }

    function chapterOf(p) {
        let c = CHAPTERS[0];
        for (const ch of CHAPTERS) if (ch[0] <= p) c = ch;
        return c;
    }

    function render(anim) {
        const list = pagesFor(page);
        spread.replaceChildren(...list.map((n, i) =>
            sheet(n, list.length === 1 ? 'solo' : (i === 0 ? 'left' : 'right'))));
        if (list.length === 2) fitSpread();
        spread.classList.remove('turn-next', 'turn-prev');
        if (anim) { void spread.offsetWidth; spread.classList.add(anim); }

        const last = list[list.length - 1];
        $('counter').innerHTML = '<b>' + list.join('–') + '</b> / ' + TOTAL;
        $('fill').style.width = (last / TOTAL * 100) + '%';
        $('chapterNow').textContent = chapterOf(list[0])[1];
        $('prev').classList.toggle('disabled', list[0] <= 1);
        $('next').classList.toggle('disabled', last >= TOTAL);
        document.querySelectorAll('.toc button').forEach(b =>
            b.classList.toggle('active', b.dataset.p == chapterOf(list[0])[0]));
        document.querySelectorAll('.thumbs button').forEach(b =>
            b.classList.toggle('active', list.includes(+b.dataset.p)));

        for (let i = 1; i <= 3; i++) { preload(last + i); preload(list[0] - i); }
        store.set(page);
    }

    // Keep spread inside the stage when two A4 pages are wider than the screen
    function fitSpread() {
        const st = $('stage'), pad = 40;
        const h = st.clientHeight - pad, maxW = st.clientWidth - pad;
        const ratio = 827 / 1170;
        const sheetH = Math.min(h, maxW / (2 * ratio));
        spread.style.height = sheetH + 'px';
    }

    function go(p, anim) {
        p = Math.max(1, Math.min(TOTAL, p));
        if (pagesFor(p)[0] === pagesFor(page)[0] && spread.children.length) return;
        if (busy) return;
        busy = true; setTimeout(() => busy = false, 280);
        page = p;
        render(anim || null);
    }
    const next = () => { const n = step(1); if (n <= TOTAL) go(n, 'turn-next'); };
    const prev = () => { const n = step(-1); if (n >= 1) go(n, 'turn-prev'); };

    function layout() {
        const w = innerWidth > 1100 && innerWidth / innerHeight > 1.25;
        spread.style.height = '';
        if (w !== wide || !spread.children.length) { wide = w; render(); }
        else if (pagesFor(page).length === 2) fitSpread();
    }

    // Build TOC, thumbnails, ticks
    CHAPTERS.forEach(([p, title]) => {
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.dataset.p = p;
        b.innerHTML = '<span></span><small>' + String(p).padStart(3, '0') + '</small>';
        b.firstChild.textContent = title;
        b.onclick = () => { closeToc(); go(p, p > page ? 'turn-next' : 'turn-prev'); };
        li.append(b); $('toc').append(li);
        if (p > 1) {
            const t = document.createElement('i');
            t.style.left = ((p - 1) / TOTAL * 100) + '%';
            $('ticks').append(t);
        }
    });
    let thumbsBuilt = false;
    function buildThumbs() {
        if (thumbsBuilt) return; thumbsBuilt = true;
        PAGES.forEach((src, i) => {
            const b = document.createElement('button');
            b.dataset.p = i + 1;
            b.setAttribute('aria-label', 'Halaman ' + (i + 1));
            const img = document.createElement('img');
            img.loading = 'lazy'; img.src = src; img.alt = ''; img.draggable = false;
            b.append(img);
            b.onclick = () => { closeToc(); go(i + 1, i + 1 > page ? 'turn-next' : 'turn-prev'); };
            $('thumbs').append(b);
        });
        render();
    }
    const openToc = () => { buildThumbs(); document.body.classList.add('toc-open'); };
    const closeToc = () => document.body.classList.remove('toc-open');

    // Controls
    $('next').onclick = next;
    $('prev').onclick = prev;
    $('tocBtn').onclick = openToc;
    $('tocClose').onclick = closeToc;
    $('scrim').onclick = closeToc;
    $('progress').onclick = e => {
        const r = e.currentTarget.getBoundingClientRect();
        const p = Math.ceil((e.clientX - r.left) / r.width * TOTAL);
        go(p, p > page ? 'turn-next' : 'turn-prev');
    };
    $('fs').onclick = () => {
        const d = document;
        if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
        else { const el = d.documentElement; (el.requestFullscreen || el.webkitRequestFullscreen || (() => {})).call(el); }
    };
    if (!document.documentElement.requestFullscreen && !document.documentElement.webkitRequestFullscreen) $('fs').style.display = 'none';

    document.addEventListener('keydown', e => {
        const k = e.key.toLowerCase();
        if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'u'].includes(k)) { e.preventDefault(); return; }
        if (!$('intro').classList.contains('gone')) { if (k === 'enter') start(); return; }
        if (k === 'arrowright' || k === ' ' || k === 'pagedown') { e.preventDefault(); next(); }
        if (k === 'arrowleft' || k === 'pageup') { e.preventDefault(); prev(); }
        if (k === 'escape') closeToc();
        if (k === 'home') go(1, 'turn-prev');
        if (k === 'end') go(TOTAL, 'turn-next');
    });
    document.addEventListener('dragstart', e => e.preventDefault());

    // Swipe
    let sx = 0, sy = 0, st = 0;
    const stage = $('stage');
    stage.addEventListener('touchstart', e => {
        if (e.touches.length !== 1) { sx = null; return; }
        sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now();
    }, { passive: true });
    stage.addEventListener('touchend', e => {
        if (sx === null || (window.visualViewport && visualViewport.scale > 1.05)) return;
        const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4 && Date.now() - st < 700) dx < 0 ? next() : prev();
    }, { passive: true });

    let hintTimer;
    function hint(text) {
        const h = $('hint'); h.textContent = text; h.classList.add('show');
        clearTimeout(hintTimer); hintTimer = setTimeout(() => h.classList.remove('show'), 2800);
    }

    // Intro
    function start(from) {
        $('intro').classList.add('gone');
        $('reader').removeAttribute('aria-hidden');
        page = from || 1;
        layout();
        hint(matchMedia('(pointer: coarse)').matches ? 'Geser kiri/kanan untuk membalik halaman' : 'Pakai tombol ← → atau klik tepi halaman');
    }
    $('start').onclick = () => start(1);
    const saved = store.get();
    if (saved > 1 && saved <= TOTAL) {
        $('resume').hidden = false;
        $('resume').textContent = 'Lanjutkan dari halaman ' + saved;
        $('resume').onclick = () => start(saved);
    }
    preload(1); preload(2); preload(3);
    addEventListener('resize', () => { if ($('intro').classList.contains('gone')) layout(); });
})();
</script>
</body>
</html>
