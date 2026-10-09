<?php
$cbPrice = 'Rp30.000';
$cbPriceNum = '30.000';
$cbCheckout = 'https://theinnovatorsstudio.myr.id/pl/creative-business';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Creative Businesses Blueprint | The Innovators Studio</title>
    <meta name="description" content="A cheat sheet for turning creative ideas into working business. Four case studies, fourteen cheat sheets, one way of thinking. By The Innovators Studio.">
    <meta property="og:title" content="The Creative Businesses Blueprint | The Innovators Studio">
    <meta property="og:description" content="Four ideas. Fourteen steps. One way of thinking. A cheat sheet for turning creative ideas into working business.">
    <meta property="og:image" content="<?= BASE_URL ?>/public/images/creativebusiness-cover.jpg">
    <link rel="icon" type="image/png" href="/public/images/tis-logo-circle.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
            --peach: #fbe3d2;
            --peach-rgb: 251, 227, 210;
            --peach-deep: #f6cdb1;
            --cream: #fff5ee;
            --orange: #e2582b;
            --orange-rgb: 226, 88, 43;
            --orange-light: #f07a45;
            --orange-dim: rgba(226,88,43,0.18);
            --ink: #1c1511;
            --ink-rgb: 28, 21, 17;
            --text: #2a201b;
            --text-dim: rgba(42,32,27,0.62);
            --line: rgba(28,21,17,0.1);
        }

        html { scroll-behavior: smooth; scroll-snap-type: y mandatory; }
        body {
            background: var(--peach);
            color: var(--text);
            font-family: 'Inter', system-ui, sans-serif;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
        }

        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        }

        /* ===== NAV ===== */
        .cb-nav {
            position: fixed; top: 0; left: 0; right: 0;
            z-index: 500;
            display: flex; align-items: center; justify-content: space-between;
            padding: 20px 24px;
            background: transparent;
            transition: background 0.4s ease, padding 0.4s ease, border-color 0.4s ease;
            border-bottom: 1px solid transparent;
        }
        .cb-nav.scrolled {
            background: rgba(var(--peach-rgb), 0.92);
            backdrop-filter: blur(10px);
            padding: 14px 24px;
            border-bottom: 1px solid var(--line);
        }
        .cb-nav-brand {
            color: var(--ink);
            text-decoration: none;
            line-height: 1.3;
        }
        .cb-nav-brand .line1 {
            display: block;
            font-family: 'Anton', sans-serif;
            font-size: 16px;
            letter-spacing: 0.06em;
            text-transform: uppercase;
        }
        .cb-nav-brand .line2 {
            display: block;
            font-size: 9px; font-weight: 600;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: var(--orange);
        }
        .cb-nav-links {
            display: flex; align-items: center; gap: 28px;
        }
        .cb-nav-links a:not(.cb-nav-cta) {
            font-size: 13px; font-weight: 500;
            color: var(--text-dim);
            text-decoration: none;
            letter-spacing: 0.02em;
            transition: color 0.3s ease;
        }
        .cb-nav-links a:not(.cb-nav-cta):hover { color: var(--ink); }
        .cb-nav-cta {
            font-size: 11px; font-weight: 700;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: #fff;
            background: var(--orange);
            padding: 10px 18px;
            border-radius: 999px;
            text-decoration: none;
            transition: background 0.3s ease;
        }
        .cb-nav-cta:hover { background: var(--ink); }
        @media (max-width: 700px) {
            .cb-nav-links a:not(.cb-nav-cta) { display: none; }
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: var(--peach); }
        ::-webkit-scrollbar-thumb { background: var(--orange); border-radius: 2px; }

        /* ===== GRAIN (matches the cover's paper texture) ===== */
        .grain {
            position: fixed; inset: 0;
            pointer-events: none;
            z-index: 1;
            opacity: 0.35;
            mix-blend-mode: multiply;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.85 0 0 0 0 0.55 0 0 0 0 0.4 0 0 0 0.35 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* ===== HERO / TITLE CARD ===== */
        .hero-title-card {
            min-height: 100vh;
            min-height: 100svh;
            background:
                radial-gradient(ellipse 80% 60% at 50% 0%, var(--cream) 0%, transparent 70%),
                linear-gradient(180deg, var(--peach) 0%, var(--peach-deep) 100%);
            display: flex; align-items: center; justify-content: center;
            flex-direction: column;
            position: relative;
            z-index: 10;
            padding: 100px 24px 60px;
            overflow: hidden;
            scroll-snap-align: start;
            scroll-snap-stop: always;
        }

        .hero-hook {
            max-width: 720px;
            margin: 0 auto;
            text-align: center;
            font-size: clamp(14px, 1.8vw, 18px);
            font-weight: 500;
            color: var(--orange);
            letter-spacing: 0.14em;
            text-transform: uppercase;
            line-height: 1.6;
            opacity: 0;
            transform: translateY(20px);
            animation: slideUp 1s cubic-bezier(0.22,1,0.36,1) 0.2s forwards;
        }

        .title-block {
            text-align: center;
            margin-top: 28px;
        }
        .title-presents {
            font-size: clamp(13px, 2vw, 18px);
            color: var(--ink);
            letter-spacing: 0.02em;
            opacity: 0;
            transform: translateY(20px);
            animation: slideUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.6s forwards;
        }
        .title-presents strong { font-weight: 800; }
        .title-presents span { font-weight: 400; color: var(--text-dim); }

        .title-word {
            display: block;
            font-family: 'Anton', sans-serif;
            font-size: clamp(64px, 17vw, 210px);
            color: var(--ink);
            line-height: 0.92;
            letter-spacing: -0.005em;
            text-transform: uppercase;
            opacity: 0;
            transform: translateY(30px);
            animation: slideUp 1s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .title-word.w1 { margin-top: 14px; animation-delay: 0.9s; position: relative; }
        .title-word.w2 { animation-delay: 1.2s; }
        .title-word .copy {
            position: absolute;
            font-family: 'Inter', sans-serif;
            font-size: 0.16em;
            font-weight: 700;
            color: var(--orange);
            top: 0.25em;
            margin-left: 0.15em;
        }
        .title-word.w2 { position: relative; display: inline-block; }
        .title-word.w2::after {
            content: '';
            position: absolute;
            bottom: -6px; left: 0; right: 0;
            height: 5px;
            background: var(--orange);
            transform: scaleX(0);
            transform-origin: left;
            animation: lineGrow 0.8s cubic-bezier(0.22,1,0.36,1) 1.8s forwards;
        }

        @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
        @keyframes lineGrow { to { transform: scaleX(1); } }

        .title-extras {
            margin-top: 28px;
            text-align: center;
            opacity: 0;
            transform: translateY(20px);
            animation: slideUp 1s cubic-bezier(0.22,1,0.36,1) 1.9s forwards;
        }
        .title-badge {
            display: inline-block;
            font-size: clamp(12px, 1.6vw, 15px); font-weight: 600;
            color: var(--orange);
            letter-spacing: 0.3em;
            text-transform: uppercase;
        }
        .title-sub {
            margin-top: 6px;
            font-size: 11px; font-weight: 600;
            color: var(--orange);
            letter-spacing: 0.25em;
            text-transform: uppercase;
            opacity: 0.75;
        }

        .hero-cta-row {
            margin-top: 34px;
            display: flex; flex-direction: column; align-items: center; gap: 10px;
            opacity: 0;
            transform: translateY(20px);
            animation: slideUp 1s cubic-bezier(0.22,1,0.36,1) 2.2s forwards;
        }
        .hero-cta-btn {
            display: inline-flex; align-items: center; gap: 10px;
            padding: 16px 32px;
            background: var(--orange);
            color: #fff;
            font-size: 13px; font-weight: 700;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            text-decoration: none;
            border-radius: 999px;
            transition: all 0.35s ease;
        }
        .hero-cta-btn:hover {
            background: var(--ink);
            transform: translateY(-2px);
            box-shadow: 0 10px 28px rgba(var(--orange-rgb),0.3);
        }
        .hero-price-line {
            font-size: 13px;
            color: var(--text-dim);
            letter-spacing: 0.03em;
        }
        .hero-price-line strong { color: var(--orange); font-weight: 700; }

        .title-scroll {
            margin-top: 40px;
            display: flex; flex-direction: column; align-items: center; gap: 8px;
            color: var(--ink);
            font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase;
            font-weight: 700;
            opacity: 0;
            animation: slideUp 0.8s cubic-bezier(0.22,1,0.36,1) 2.7s forwards;
        }
        .title-scroll svg {
            animation: scrollBounce 2s ease-in-out infinite;
            color: var(--orange);
        }
        @keyframes scrollBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }

        /* ===== CONTENT AREA ===== */
        .content-area {
            background: linear-gradient(180deg, var(--peach-deep) 0%, var(--peach) 18%, var(--peach) 100%);
            position: relative;
        }

        .scroll-line {
            position: fixed; top: 0; left: 0;
            height: 2px; width: 0%;
            background: linear-gradient(90deg, var(--orange), var(--orange-light));
            z-index: 9999;
        }

        section {
            position: relative; z-index: 5;
            scroll-snap-align: start; scroll-snap-stop: always;
            scroll-margin-top: 90px;
            min-height: calc(100vh - 90px);
            min-height: calc(100svh - 90px);
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .scroll-next {
            display: flex; flex-direction: column; align-items: center; gap: 8px;
            margin-top: 56px;
            cursor: pointer;
            color: var(--orange);
            font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase;
            font-weight: 700;
            opacity: 0.85;
            transition: opacity 0.3s ease;
            width: fit-content;
        }
        .scroll-next:hover { opacity: 1; }
        .scroll-next svg { animation: scrollBounce 2s ease-in-out infinite; }

        .reveal-up {
            opacity: 0; transform: translateY(60px);
            transition: all 1.2s cubic-bezier(0.22,1,0.36,1);
        }
        .reveal-up.visible { opacity: 1; transform: translateY(0); }
        .reveal-scale {
            opacity: 0; transform: scale(0.9);
            transition: all 1.2s cubic-bezier(0.22,1,0.36,1);
        }
        .reveal-scale.visible { opacity: 1; transform: scale(1); }
        .d1 { transition-delay: 0.1s; } .d2 { transition-delay: 0.2s; }
        .d3 { transition-delay: 0.3s; } .d4 { transition-delay: 0.4s; }
        .d5 { transition-delay: 0.5s; }

        .section-divider {
            display: flex; align-items: center; justify-content: center; gap: 16px;
            padding: 60px 0;
            position: relative; z-index: 5;
        }
        .section-divider .line { flex: 1; max-width: 200px; height: 1px; background: linear-gradient(90deg, transparent, var(--orange-dim)); }
        .section-divider .line:last-child { background: linear-gradient(90deg, var(--orange-dim), transparent); }
        .section-divider .mark {
            font-size: 14px; font-weight: 700;
            color: var(--orange);
            line-height: 1;
        }

        .big-quote {
            font-size: clamp(26px, 4.2vw, 46px);
            font-weight: 700;
            color: var(--ink);
            text-align: center;
            line-height: 1.25;
            letter-spacing: -0.02em;
        }
        .big-quote em {
            font-style: italic;
            color: var(--orange);
        }

        .section-label {
            font-size: 11px; font-weight: 700;
            color: var(--orange);
            letter-spacing: 0.4em;
            text-transform: uppercase;
            margin-bottom: 16px;
        }
        .section-heading {
            font-family: 'Anton', sans-serif;
            font-size: clamp(34px, 6vw, 60px);
            font-weight: 400;
            color: var(--ink);
            line-height: 1.05;
            text-transform: uppercase;
            letter-spacing: 0.005em;
        }

        /* ===== CURIOSITY HOOKS ===== */
        .hook-line {
            font-size: clamp(17px, 2.3vw, 23px);
            font-weight: 500;
            color: var(--ink);
            text-align: left;
            padding: 18px 0 18px 30px;
            position: relative;
            border-bottom: 1px solid var(--line);
            line-height: 1.45;
            letter-spacing: -0.01em;
        }
        .hook-line::before {
            content: '\2014';
            position: absolute;
            left: 0; top: 18px;
            color: var(--orange);
        }
        .hook-line:first-child { border-top: 1px solid var(--line); }

        /* ===== BOOK PREVIEW MOCKUP ===== */
        .book-stack {
            position: relative;
            max-width: 560px;
            margin: 60px auto 0;
            padding: 30px;
        }
        .book-stack img {
            position: absolute;
            top: 30px; left: 30px;
            width: calc(100% - 60px);
            border-radius: 4px;
            box-shadow: 0 30px 70px rgba(var(--ink-rgb),0.22);
        }
        .book-stack .layer-3 { transform: rotate(calc(-6deg - var(--fan, 0) * 6deg)) translate(calc(-14px - var(--fan, 0) * 30px), calc(10px + var(--fan, 0) * 6px)); opacity: 0.4; filter: saturate(0.6); }
        .book-stack .layer-2 { transform: rotate(calc(-3deg - var(--fan, 0) * 3deg)) translate(calc(-6px - var(--fan, 0) * 14px), calc(4px + var(--fan, 0) * 3px)); opacity: 0.65; filter: saturate(0.8); }
        .book-stack .layer-1 { transform: rotate(0deg); position: relative; opacity: 1; }
        .book-stack-wrap { position: relative; }

        .stat-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            max-width: 520px;
            margin: 64px auto 0;
        }
        .stat {
            text-align: center;
            padding: 14px 8px;
            border-top: 2px solid var(--orange);
        }
        .stat .n {
            font-family: 'Anton', sans-serif;
            font-size: clamp(34px, 6vw, 46px);
            color: var(--ink);
            line-height: 1;
        }
        .stat .l {
            margin-top: 6px;
            font-size: 11px; font-weight: 600;
            color: var(--text-dim);
            letter-spacing: 0.14em;
            text-transform: uppercase;
        }

        /* ===== HONESTY CARDS ===== */
        .honesty-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1px;
            background: var(--line);
            border: 1px solid var(--line);
            border-radius: 6px;
            overflow: hidden;
        }
        @media (max-width: 600px) {
            .honesty-grid { grid-template-columns: 1fr; }
        }
        .honesty-card {
            background: var(--cream);
            padding: 32px 28px;
        }
        .honesty-card .label {
            font-size: 12px; font-weight: 700;
            color: var(--orange);
            letter-spacing: 0.15em;
            text-transform: uppercase;
            margin-bottom: 14px;
        }
        .honesty-card p {
            font-size: 15px;
            color: var(--text-dim);
            line-height: 1.7;
        }

        /* ===== CASE STUDY CARDS ===== */
        .case-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
        }
        @media (max-width: 760px) {
            .case-grid { grid-template-columns: 1fr; }
        }
        .case-card {
            background: var(--cream);
            border: 1px solid var(--line);
            border-radius: 6px;
            padding: 32px 28px 28px;
            position: relative;
            overflow: hidden;
            transition: transform 0.5s ease, box-shadow 0.5s ease, border-color 0.5s ease;
        }
        .case-card:hover {
            transform: translateY(-4px);
            border-color: rgba(var(--orange-rgb),0.35);
            box-shadow: 0 18px 40px rgba(var(--orange-rgb),0.12);
        }
        .case-num {
            font-family: 'Anton', sans-serif;
            font-size: 56px;
            color: rgba(var(--orange-rgb),0.2);
            line-height: 1;
            position: absolute;
            top: 18px; right: 22px;
        }
        .case-kicker {
            font-size: 11px; font-weight: 700;
            color: var(--orange);
            letter-spacing: 0.2em;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
        .case-title {
            font-family: 'Anton', sans-serif;
            font-size: clamp(26px, 3.4vw, 34px);
            color: var(--ink);
            text-transform: uppercase;
            line-height: 1.05;
            margin-bottom: 12px;
            padding-right: 60px;
        }
        .case-desc {
            font-size: 15px;
            color: var(--text-dim);
            line-height: 1.65;
        }
        .case-hook {
            margin-top: 18px;
            padding-top: 16px;
            border-top: 1px dashed rgba(var(--orange-rgb),0.35);
            font-size: 14px;
            font-weight: 600;
            color: var(--ink);
            font-style: italic;
        }

        /* ===== CHEAT SHEETS ===== */
        .phase-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
        }
        @media (max-width: 960px) { .phase-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .phase-grid { grid-template-columns: 1fr; } }
        .phase-card {
            background: rgba(255,255,255,0.35);
            border: 1px solid var(--line);
            border-radius: 6px;
            padding: 24px 22px;
            position: relative;
            overflow: hidden;
            transition: all 0.5s ease;
        }
        .phase-card::before {
            content: '';
            position: absolute; top: 0; left: 0; right: 0; height: 3px;
            background: var(--orange);
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.5s ease;
        }
        .phase-card:hover::before { transform: scaleX(1); }
        .phase-card:hover {
            background: var(--cream);
            transform: translateY(-4px);
        }
        .phase-range {
            font-size: 11px; font-weight: 700;
            color: var(--orange);
            letter-spacing: 0.18em;
            text-transform: uppercase;
        }
        .phase-q {
            margin-top: 10px;
            font-size: 15px; font-weight: 700;
            color: var(--ink);
            line-height: 1.4;
        }
        .phase-list {
            list-style: none;
            margin-top: 16px;
            border-top: 1px solid var(--line);
        }
        .phase-list li {
            display: flex; gap: 10px;
            padding: 9px 0;
            border-bottom: 1px solid var(--line);
            font-size: 14px;
            color: var(--text);
        }
        .phase-list li span {
            flex-shrink: 0;
            font-family: 'Anton', sans-serif;
            color: rgba(var(--orange-rgb),0.6);
            width: 22px;
        }

        .decision-strip {
            margin-top: 28px;
            display: grid;
            grid-template-columns: auto repeat(4, 1fr);
            background: var(--ink);
            border-radius: 6px;
            overflow: hidden;
        }
        .decision-strip > div {
            padding: 20px 18px;
            border-left: 1px solid rgba(255,255,255,0.08);
        }
        .decision-strip > div:first-child { border-left: none; }
        .decision-strip .ds-label {
            font-size: 11px; font-weight: 700;
            color: var(--orange-light);
            letter-spacing: 0.18em;
            text-transform: uppercase;
            display: flex; align-items: center;
            max-width: 170px;
            line-height: 1.5;
        }
        .decision-strip .ds-word {
            font-family: 'Anton', sans-serif;
            font-size: 22px;
            color: #fff;
            text-transform: uppercase;
            letter-spacing: 0.02em;
        }
        .decision-strip .ds-desc {
            margin-top: 4px;
            font-size: 12px;
            color: rgba(255,255,255,0.55);
            line-height: 1.5;
        }
        @media (max-width: 760px) {
            .decision-strip { grid-template-columns: 1fr 1fr; }
            .decision-strip > div:first-child { grid-column: 1 / -1; }
            .decision-strip > div { border-left: none; border-top: 1px solid rgba(255,255,255,0.08); }
            .decision-strip > div:first-child { border-top: none; }
        }

        /* ===== PRICING ===== */
        .cover-showcase {
            position: relative;
            max-width: 520px;
            margin: 0 auto;
        }
        .cover-showcase img {
            width: 100%;
            border-radius: 4px;
            box-shadow:
                0 20px 60px rgba(var(--ink-rgb),0.2),
                0 0 0 1px rgba(var(--orange-rgb),0.15);
            transition: transform 0.5s ease, box-shadow 0.5s ease;
        }
        .cover-showcase:hover img {
            transform: translateY(-8px) scale(1.02);
            box-shadow:
                0 30px 80px rgba(var(--ink-rgb),0.28),
                0 0 0 1px rgba(var(--orange-rgb),0.25),
                0 0 120px rgba(var(--orange-rgb),0.15);
        }
        .cover-glow {
            position: absolute;
            bottom: -30px; left: 10%; right: 10%;
            height: 60px;
            background: radial-gradient(ellipse, rgba(var(--orange-rgb),0.25), transparent 70%);
            filter: blur(20px);
            pointer-events: none;
        }

        .pricing-card {
            background: linear-gradient(155deg, var(--orange-light) 0%, var(--orange) 55%, #c4461d 100%);
            border: 1px solid rgba(255,255,255,0.35);
            border-radius: 10px;
            padding: 48px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
            max-width: 480px;
            margin: 0 auto;
            box-shadow: 0 0 40px rgba(var(--orange-rgb),0.4), 0 0 90px rgba(var(--orange-rgb),0.2), 0 20px 60px rgba(var(--ink-rgb),0.2);
            animation: orangePulse 3.5s ease-in-out infinite;
        }
        @keyframes orangePulse {
            0%, 100% { box-shadow: 0 0 40px rgba(var(--orange-rgb),0.4), 0 0 90px rgba(var(--orange-rgb),0.2), 0 20px 60px rgba(var(--ink-rgb),0.2); }
            50% { box-shadow: 0 0 55px rgba(var(--orange-rgb),0.6), 0 0 120px rgba(var(--orange-rgb),0.32), 0 20px 60px rgba(var(--ink-rgb),0.2); }
        }
        .pricing-card::before {
            content: '';
            position: absolute; top: 0; left: 0; right: 0; height: 2px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
        }
        .pricing-card::after {
            content: '';
            position: absolute;
            top: -50%; right: -50%;
            width: 200%; height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 55%);
            pointer-events: none;
        }
        .price-badge {
            display: inline-block;
            font-size: 11px; font-weight: 700;
            color: #fff;
            background: var(--ink);
            padding: 6px 20px;
            border-radius: 999px;
            letter-spacing: 0.3em;
            text-transform: uppercase;
            margin-bottom: 24px;
            position: relative;
            z-index: 1;
        }
        .price-current {
            font-family: 'Anton', sans-serif;
            font-size: clamp(46px, 9vw, 64px);
            color: #fff;
            line-height: 1;
            margin: 16px 0 28px;
            position: relative;
            z-index: 1;
        }
        .price-current span { font-size: 0.55em; vertical-align: 0.6em; margin-right: 4px; }
        .cta-btn {
            display: inline-flex; align-items: center; justify-content: center; gap: 10px;
            width: 100%;
            padding: 18px 32px;
            background: var(--ink);
            color: #fff;
            font-size: 15px; font-weight: 700;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            text-decoration: none;
            border: none; cursor: pointer;
            transition: all 0.4s ease;
            border-radius: 999px;
            position: relative;
            z-index: 1;
        }
        .cta-btn:hover {
            background: #000;
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(var(--ink-rgb),0.4);
        }
        .cta-btn:active { transform: translateY(0); }
        .price-guarantee {
            display: flex; align-items: center; justify-content: center; gap: 8px;
            margin-top: 16px;
            font-size: 13px;
            color: rgba(255,255,255,0.85);
            position: relative;
            z-index: 1;
        }

        .feature-list {
            list-style: none; padding: 0;
            text-align: left;
            margin-bottom: 8px;
        }
        .feature-list li {
            display: flex; align-items: flex-start; gap: 12px;
            padding: 9px 0;
            font-size: 15px;
            color: #fff;
            font-weight: 500;
            border-bottom: 1px solid rgba(255,255,255,0.2);
            position: relative;
            z-index: 1;
        }
        .feature-list li:last-child { border-bottom: none; }
        .feature-list .check {
            flex-shrink: 0;
            width: 20px; height: 20px;
            border-radius: 50%;
            background: var(--ink);
            display: flex; align-items: center; justify-content: center;
            margin-top: 1px;
        }
        .feature-list .check svg { width: 12px; height: 12px; color: #fff; }

        /* ===== FAQ ===== */
        .faq-item { border-bottom: 1px solid var(--line); }
        .faq-q {
            width: 100%;
            display: flex; align-items: center; justify-content: space-between;
            gap: 16px;
            padding: 22px 4px;
            background: none; border: none;
            cursor: pointer;
            text-align: left;
            font-family: 'Inter', sans-serif;
            font-size: clamp(15px, 1.8vw, 17px);
            font-weight: 600;
            color: var(--ink);
        }
        .faq-q .plus {
            flex-shrink: 0;
            width: 20px; height: 20px;
            position: relative;
            color: var(--orange);
        }
        .faq-q .plus::before, .faq-q .plus::after {
            content: '';
            position: absolute; background: currentColor;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
        }
        .faq-q .plus::before { width: 14px; height: 2px; }
        .faq-q .plus::after { width: 2px; height: 14px; transition: transform 0.3s ease; }
        .faq-item.open .plus::after { transform: translate(-50%, -50%) rotate(90deg) scaleY(0); }
        .faq-a {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.4s ease;
        }
        .faq-a p {
            padding: 0 4px 22px;
            font-size: 14px;
            color: var(--text-dim);
            line-height: 1.7;
            max-width: 640px;
        }

        .cb-footer {
            position: relative; z-index: 5;
            border-top: 1px solid var(--line);
            padding: 40px 24px;
            text-align: center;
        }
        .cb-footer a {
            color: var(--orange);
            text-decoration: none;
            font-size: 13px;
            font-weight: 600;
        }
        .cb-footer p {
            font-size: 12px;
            color: var(--text-dim);
            margin-top: 8px;
        }

        /* ===== STICKY MOBILE CTA ===== */
        .sticky-cta {
            position: fixed; left: 0; right: 0; bottom: 0;
            z-index: 400;
            display: none;
            align-items: center; justify-content: space-between;
            gap: 12px;
            padding: 12px 16px;
            padding-bottom: calc(12px + env(safe-area-inset-bottom));
            background: rgba(var(--ink-rgb), 0.96);
            backdrop-filter: blur(10px);
            transform: translateY(100%);
            transition: transform 0.35s ease;
        }
        .sticky-cta.show { transform: translateY(0); }
        .sticky-cta-info { display: flex; flex-direction: column; line-height: 1.3; }
        .sticky-cta-info .name { font-size: 13px; color: rgba(255,255,255,0.7); font-weight: 500; }
        .sticky-cta-info .price { font-family: 'Anton', sans-serif; font-size: 18px; color: var(--orange-light); letter-spacing: 0.02em; }
        .sticky-cta-btn {
            flex-shrink: 0;
            font-size: 13px; font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #fff;
            background: var(--orange);
            padding: 12px 24px;
            border-radius: 999px;
            text-decoration: none;
        }
        @media (max-width: 768px) {
            .sticky-cta { display: flex; }
            .pricing-card { padding: 36px 24px; }
        }
        @media (min-width: 768px) {
            .lg-grid-pricing { grid-template-columns: 1.1fr 1fr !important; }
        }

        /* ===== DARK CONTENT AREA (hero stays peach like the cover) ===== */
        .content-area {
            --ink: #fff5ee;
            --text: #f3e6dc;
            --text-dim: rgba(243,230,220,0.62);
            --line: rgba(255,245,238,0.1);
            --orange-dim: rgba(226,88,43,0.35);
            background: #1c1511;
            border-top: 3px solid var(--orange);
        }
        .content-area::before {
            content: '';
            position: absolute; inset: 0;
            background-image:
                linear-gradient(rgba(255,245,238,0.035) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,245,238,0.035) 1px, transparent 1px);
            background-size: 60px 60px;
            pointer-events: none;
            z-index: 1;
        }
        .content-area .section-label,
        .content-area .scroll-next { color: var(--orange-light); }
        .content-area .big-quote em { color: var(--orange-light); }
        .content-area .hero-price-line strong { color: var(--orange-light); }
        .content-area .hero-cta-btn:hover { background: var(--orange-light); }
        .content-area .honesty-card,
        .content-area .case-card { background: rgba(255,245,238,0.04); }
        .content-area .case-card:hover { background: rgba(255,245,238,0.07); box-shadow: 0 18px 40px rgba(0,0,0,0.35); }
        .content-area .case-num { color: rgba(var(--orange-rgb),0.35); }
        .content-area .case-kicker,
        .content-area .honesty-card .label,
        .content-area .phase-range { color: var(--orange-light); }
        .content-area .phase-card { background: rgba(255,245,238,0.03); }
        .content-area .phase-card:hover { background: rgba(255,245,238,0.07); }
        .content-area .phase-list li span { color: rgba(var(--orange-rgb),0.85); }
        .content-area .decision-strip { background: rgba(255,245,238,0.05); border: 1px solid var(--line); }
        .content-area .stat { border-top-color: var(--orange); }
        .content-area .book-stack img,
        .content-area .cover-showcase img { box-shadow: 0 30px 70px rgba(0,0,0,0.55); }
        .content-area .price-badge,
        .content-area .cta-btn,
        .content-area .feature-list .check { background: #1c1511; }
        .content-area .cta-btn,
        .content-area .feature-list .check svg { color: #fff5ee; }
        .content-area .cta-btn:hover { background: #000; }
        .content-area .price-badge { color: #fff5ee; }
        .content-area .faq-q .plus { color: var(--orange-light); }
        .content-area .cb-footer a,
        .cb-footer a { color: var(--orange-light); }
        .cb-nav.scrolled { background: rgba(28,21,17,0.92); border-bottom-color: rgba(255,245,238,0.08); }
        .cb-nav.scrolled .cb-nav-brand { color: #fff5ee; }
        .cb-nav.scrolled .cb-nav-links a:not(.cb-nav-cta) { color: rgba(255,245,238,0.7); }
        .cb-nav.scrolled .cb-nav-links a:not(.cb-nav-cta):hover { color: #fff; }
        .cb-nav.scrolled .cb-nav-cta:hover { background: var(--orange-light); }
        ::-webkit-scrollbar-track { background: #1c1511; }

        /* ===== DARK HERO ===== */
        .hero-title-card {
            --ink: #fff5ee;
            --text: #f3e6dc;
            --text-dim: rgba(243,230,220,0.62);
            background:
                radial-gradient(ellipse 70% 55% at 50% 100%, rgba(var(--orange-rgb),0.28) 0%, transparent 70%),
                #1c1511;
        }
        .hero-title-card::before {
            content: '';
            position: absolute; inset: 0;
            background-image:
                linear-gradient(rgba(255,245,238,0.035) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,245,238,0.035) 1px, transparent 1px);
            background-size: 60px 60px;
            pointer-events: none;
        }
        .hero-title-card > * { position: relative; z-index: 2; }
        .hero-title-card .hero-hook,
        .hero-title-card .title-badge,
        .hero-title-card .title-sub,
        .hero-title-card .title-scroll svg { color: var(--orange-light); }
        .hero-title-card .hero-price-line strong { color: var(--orange-light); }
        .hero-title-card .hero-cta-btn:hover { background: var(--orange-light); }
        .cb-nav-brand { color: #fff5ee; }
        .cb-nav-links a:not(.cb-nav-cta) { color: rgba(255,245,238,0.7); }
        .cb-nav-links a:not(.cb-nav-cta):hover { color: #fff; }
        .cb-nav-cta:hover { background: var(--orange-light); }
        .grain { display: none; }

        /* ===== INTERACTIVE LAYER ===== */
        .hero-glow {
            position: absolute !important;
            top: 0; left: 0;
            width: 760px; height: 760px;
            margin: -380px 0 0 -380px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(var(--orange-rgb),0.22) 0%, rgba(var(--orange-rgb),0.08) 40%, transparent 70%);
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.8s ease;
            z-index: 1 !important;
            will-change: transform;
        }
        .hero-glow.on { opacity: 1; }

        .cursor-ring {
            position: fixed; top: 0; left: 0;
            width: 36px; height: 36px;
            margin: -18px 0 0 -18px;
            border: 1.5px solid rgba(var(--orange-rgb),0.75);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease, background 0.3s ease, border-color 0.3s ease;
            will-change: transform;
        }
        .cursor-ring.on { opacity: 1; }
        .cursor-ring.hot { background: rgba(var(--orange-rgb),0.16); border-color: var(--orange-light); }

        /* card spotlight that follows the cursor */
        .spot { position: relative; }
        .spot::after {
            content: '';
            position: absolute; inset: 0;
            border-radius: inherit;
            background: radial-gradient(360px circle at var(--sx, 50%) var(--sy, 50%), rgba(var(--orange-rgb),0.2), transparent 65%);
            opacity: 0;
            transition: opacity 0.4s ease;
            pointer-events: none;
        }
        .spot:hover::after { opacity: 1; }

        /* hook lines: arrow slides, underline sweeps */
        .hook-line::before { transition: transform 0.4s cubic-bezier(0.22,1,0.36,1); }
        .hook-line::after {
            content: '';
            position: absolute; left: 0; right: 0; bottom: -1px;
            height: 1px;
            background: var(--orange);
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.6s cubic-bezier(0.22,1,0.36,1);
        }
        @media (hover: hover) {
            .hook-line:hover::before { transform: translateX(8px); }
            .hook-line:hover::after { transform: scaleX(1); }
        }

        /* headline word mask reveal */
        .split .sw { display: inline-block; overflow: hidden; vertical-align: top; padding-bottom: 0.1em; margin-bottom: -0.1em; }
        .split .si { display: inline-block; transform: translateY(110%); transition: transform 0.9s cubic-bezier(0.22,1,0.36,1); }
        .split.in .si { transform: translateY(0); }

        /* scroll-scrubbed quote words */
        .wordfade .sw { display: inline; }
        .wordfade .si { display: inline; transition: opacity 0.2s linear; }

        @media (hover: none) { .cursor-ring { display: none; } }
        @media (prefers-reduced-motion: reduce) { .cursor-ring, .hero-glow { display: none; } }
    </style>
</head>
<body>

<div class="grain" aria-hidden="true"></div>
<div class="cursor-ring" id="cursorRing" aria-hidden="true"></div>

<!-- ===== NAV ===== -->
<nav class="cb-nav" id="cbNav">
    <a href="#" class="cb-nav-brand"><span class="line1">Creative Business</span><span class="line2">by The Innovators Studio</span></a>
    <div class="cb-nav-links">
        <a href="#concept">Concept</a>
        <a href="#ideas">Ideas</a>
        <a href="#inside">Inside</a>
        <a href="#faq">FAQ</a>
        <a href="#buy" class="cb-nav-cta">Get Blueprint</a>
    </div>
</nav>

<!-- ===== HERO TITLE CARD ===== -->
<div class="hero-title-card" id="hero">
    <div class="hero-glow" id="heroGlow" aria-hidden="true"></div>
    <p class="hero-hook">A cheat sheet for turning creative ideas<br>into working business.</p>

    <div class="title-block">
        <div class="title-presents">
            <strong>The Innovators Studio</strong> <span>presents</span>
        </div>
        <span class="title-word w1">Creative<span class="copy">&copy;</span></span>
        <span class="title-word w2">Business</span>
    </div>

    <div class="title-extras">
        <div class="title-badge">Blueprint</div>
        <div class="title-sub">#2 Edition</div>
    </div>

    <div class="hero-cta-row">
        <a href="<?= $cbCheckout ?>" class="hero-cta-btn" target="_blank" data-cta="hero_get_blueprint">Get The Blueprint</a>
        <div class="hero-price-line"><strong><?= $cbPrice ?></strong> &middot; Instant PDF Access</div>
    </div>

    <div class="title-scroll">
        <span>Scroll to Explore</span>
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
    </div>
</div>

<!-- ===== CONTENT AREA ===== -->
<div class="content-area">
    <div class="scroll-line" id="scrollLine"></div>

    <!-- ===== THE PROBLEM ===== -->
    <section id="concept" style="padding: 100px 24px 60px;">
        <div style="max-width: 800px; margin: 0 auto; text-align: center;">
            <div class="reveal-up section-label">Every Big Business Starts Small</div>
            <p class="reveal-up d1 big-quote" style="margin-top: 24px;">
                Every big business idea starts with a simple question: <em>what if?</em>
            </p>
            <p class="reveal-up d2" style="color: var(--text-dim); margin-top: 24px; font-size: 16px; line-height: 1.8; max-width: 580px; margin-left: auto; margin-right: auto;">
                Ideas are easy to get excited about. The hard part is everything after: how the product works, who pays, what it costs, and whether the numbers still hold when customers use everything they paid for. This blueprint walks that road, step by step.
            </p>
            <div class="reveal-up d3 scroll-next" style="margin-left: auto; margin-right: auto;" data-next="#hooks">
                <span>Scroll to Explore</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </div>
        </div>
    </section>

    <div class="section-divider">
        <div class="line"></div><div class="mark">&copy;</div><div class="line"></div>
    </div>

    <!-- ===== CURIOSITY HOOKS ===== -->
    <section id="hooks" style="padding: 0 24px 80px;">
        <div style="max-width: 720px; margin: 0 auto; text-align: left;">
            <div class="reveal-up" style="margin-bottom: 40px;">
                <div class="section-label">The Questions Behind The Blueprint</div>
            </div>

            <ul style="list-style: none; padding: 0; margin: 0;">
            <?php
            $hooks = [
                'What if a QR sticker on your tumbler became a monthly drink membership?',
                'What if your gym paid you back for actually showing up?',
                'What if choosing clothes started from your skin tone, not from the rack?',
                'What if gorengan could be bought as easily as a drink from a vending machine?',
                'And the hardest one: what happens when every customer uses everything they paid for?',
            ];
            foreach($hooks as $i => $h): ?>
            <li class="reveal-up d<?= min($i+1,5) ?> hook-line"><?= $h ?></li>
            <?php endforeach; ?>
            </ul>

            <p class="reveal-up" style="color: var(--text-dim); margin-top: 36px; font-size: 15px;">
                Four very different ideas. One way of thinking them through.
            </p>
            <div style="margin-top: 28px;">
                <a href="#ideas" class="reveal-up" style="display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--orange); border-bottom: 1px solid var(--orange-dim); padding-bottom: 4px; text-decoration: none;">Meet The Four Ideas</a>
            </div>
            <div class="reveal-up scroll-next" data-next="#preview">
                <span>Scroll to Explore</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </div>
        </div>
    </section>

    <div class="section-divider">
        <div class="line"></div><div class="mark">&copy;</div><div class="line"></div>
    </div>

    <!-- ===== BOOK PREVIEW ===== -->
    <section id="preview" style="padding: 0 24px 80px;">
        <div style="max-width: 760px; margin: 0 auto; text-align: center;">
            <div class="reveal-up section-label">The Blueprint</div>
            <h2 class="reveal-up d1 section-heading">From an exciting idea to numbers that make sense.</h2>
            <p class="reveal-up d2" style="color: var(--text-dim); margin-top: 20px; font-size: 15px; max-width: 500px; margin-left: auto; margin-right: auto; line-height: 1.7;">
                Not a motivational book. A working cheat sheet: product mechanics, customer journeys, vendor maps, unit economics, payback simulations, and risk tables.
            </p>

            <div class="reveal-scale book-stack-wrap">
                <div class="book-stack">
                    <img class="layer-3" src="/public/images/creativebusiness-cover.jpg" alt="" aria-hidden="true">
                    <img class="layer-2" src="/public/images/creativebusiness-cover.jpg" alt="" aria-hidden="true">
                    <img class="layer-1" src="/public/images/creativebusiness-cover.jpg" alt="The Creative Businesses Blueprint cover">
                </div>
            </div>

            <div class="reveal-up stat-row">
                <div class="stat"><div class="n" data-count="4">4</div><div class="l">Case Studies</div></div>
                <div class="stat"><div class="n" data-count="14">14</div><div class="l">Cheat Sheets</div></div>
                <div class="stat"><div class="n" data-count="87">87</div><div class="l">Pages</div></div>
            </div>

            <div style="margin-top: 36px;">
                <a href="<?= $cbCheckout ?>" class="hero-cta-btn" target="_blank" data-cta="preview_get_blueprint">Get The Full Blueprint</a>
                <div class="hero-price-line" style="margin-top: 12px;"><strong><?= $cbPrice ?></strong></div>
            </div>
            <div class="reveal-up scroll-next" style="margin-left: auto; margin-right: auto;" data-next="#ideas">
                <span>Scroll to Explore</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </div>
        </div>
    </section>

    <div class="section-divider">
        <div class="line"></div><div class="mark">&copy;</div><div class="line"></div>
    </div>

    <!-- ===== FOUR CASE STUDIES ===== -->
    <section id="ideas" style="padding: 0 24px 80px;">
        <div style="max-width: 1000px; margin: 0 auto;">
            <div class="reveal-up" style="text-align: center; margin-bottom: 48px;">
                <div class="section-label">4 Case Studies</div>
                <h2 class="section-heading">Four ideas. Dissected the same way.</h2>
            </div>

            <div class="case-grid">
                <?php
                $cases = [
                    ['num' => '01', 'kicker' => 'Membership', 'title' => 'Coffee Stamp Membership', 'desc' => 'A Rp200.000 QR sticker on your own tumbler unlocks up to 15 drinks a month (Coffee, Matcha, or Ice Tea) at a small collect point on your route to work.', 'hook' => '"Stick the stamp. Scan the tumbler. Grab your drink."'],
                    ['num' => '02', 'kicker' => 'Fitness', 'title' => 'Grit and Gain', 'desc' => 'A Rp1.500.000, 30-day gym membership where every valid visit earns Rp50.000 cashback, until the whole fee can come back.', 'hook' => '"The more consistently you show up, the more of your membership comes back."'],
                    ['num' => '03', 'kicker' => 'Apparel', 'title' => 'SHADES BY TIS', 'desc' => 'Clothing that starts from skin tone: a matching system, a numbered Tone Library, premium dyed cotton tees, and modular boxes that form a color wheel.', 'hook' => '"Find the shade that works for you."'],
                    ['num' => '04', 'kicker' => 'Food Retail', 'title' => 'GORENG!', 'desc' => 'Indonesian gorengan, remixed. Seven core snacks in OG and REMIXED styles, finished hot in a smart-locker machine built for convenience stores, offices, and campuses.', 'hook' => '"Gorengan Indonesia, diracik ulang."'],
                ];
                foreach($cases as $i => $c): ?>
                <div class="reveal-up d<?= $i + 1 ?> case-card spot">
                    <div class="case-num"><?= $c['num'] ?></div>
                    <div class="case-kicker"><?= $c['kicker'] ?></div>
                    <div class="case-title"><?= $c['title'] ?></div>
                    <div class="case-desc"><?= $c['desc'] ?></div>
                    <div class="case-hook"><?= $c['hook'] ?></div>
                </div>
                <?php endforeach; ?>
            </div>

            <div class="reveal-up scroll-next" style="margin-left: auto; margin-right: auto;" data-next="#honesty">
                <span>Scroll to Explore</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </div>
        </div>
    </section>

    <div class="section-divider">
        <div class="line"></div><div class="mark">&copy;</div><div class="line"></div>
    </div>

    <!-- ===== NO FAKE CERTAINTY ===== -->
    <section id="honesty" style="padding: 0 24px 80px;">
        <div style="max-width: 1000px; margin: 0 auto;">
            <div class="reveal-up" style="text-align: center; margin-bottom: 48px;">
                <div class="section-label">No Fake Certainty</div>
                <h2 class="section-heading">Every number is labeled an assumption.</h2>
                <p style="color: var(--text-dim); margin-top: 16px; font-size: 15px;">Most business plans sell certainty. This one shows you exactly what still needs proving.</p>
            </div>

            <div class="reveal-up honesty-grid">
                <div class="honesty-card spot">
                    <div class="label">The Habit</div>
                    <p>Each idea starts from something people already do: buying takeaway drinks, signing up for a gym, picking a shirt, grabbing gorengan after work.</p>
                </div>
                <div class="honesty-card spot">
                    <div class="label">The Bet</div>
                    <p>A simpler product, a clearer promise, and a system behind it can turn that habit into revenue that repeats.</p>
                </div>
                <div class="honesty-card spot">
                    <div class="label">What Still Needs Testing</div>
                    <p>Vendor quotes, real recipe and production costs, capacity at peak hours, and pilot data. Flagged as hypotheses, not facts.</p>
                </div>
                <div class="honesty-card spot">
                    <div class="label">What Gets Measured</div>
                    <p>Renewal per cohort, CAC, contribution per unit, break-even, cash balance, and service quality when it's busiest.</p>
                </div>
            </div>

            <div class="reveal-up scroll-next" style="margin-top: 32px; margin-left: auto; margin-right: auto;" data-next="#inside">
                <span>Scroll to Explore</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </div>
        </div>
    </section>

    <div class="section-divider">
        <div class="line"></div><div class="mark">&copy;</div><div class="line"></div>
    </div>

    <!-- ===== INSIDE: 14 CHEAT SHEETS ===== -->
    <section id="inside" style="padding: 80px 24px;">
        <div style="max-width: 1140px; margin: 0 auto;">
            <div class="reveal-up" style="text-align: center; margin-bottom: 56px;">
                <div class="section-label">14 Cheat Sheets</div>
                <h2 class="section-heading">Fourteen steps. Use them on your own idea.</h2>
                <p style="color: var(--text-dim); margin-top: 16px; font-size: 15px; max-width: 560px; margin-left: auto; margin-right: auto; line-height: 1.7;">Every case study runs through the same 14 cheat sheets, so you can compare the thinking behind each idea and reuse it for yours.</p>
            </div>

            <div class="phase-grid">
                <?php
                $phases = [
                    ['range' => 'Cheat Sheet #1–#4', 'q' => 'How does the product work, and how do you prove it?', 'items' => ['01' => 'Reward & product mechanism', '02' => 'What you are really selling', '03' => 'Customer journey', '04' => 'Validating usage']],
                    ['range' => 'Cheat Sheet #5–#8', 'q' => 'Who is involved, where does money come from, what does it cost?', 'items' => ['05' => 'Stakeholder & vendor map', '06' => 'Revenue & marketing', '07' => 'Unit economics', '08' => 'Startup capital & business models']],
                    ['range' => 'Cheat Sheet #9–#11', 'q' => 'Who is on the team, what is the target, when does capital return?', 'items' => ['09' => 'Team structure', '10' => 'Setting targets', '11' => 'ROI']],
                    ['range' => 'Cheat Sheet #12–#14', 'q' => 'What are the risks, and what keeps customers coming back?', 'items' => ['12' => 'Business risks', '13' => 'The biggest question', '14' => 'Designing incentives']],
                ];
                foreach($phases as $i => $p): ?>
                <div class="reveal-up d<?= $i + 1 ?> phase-card spot">
                    <div class="phase-range"><?= $p['range'] ?></div>
                    <div class="phase-q"><?= $p['q'] ?></div>
                    <ul class="phase-list">
                        <?php foreach($p['items'] as $n => $t): ?>
                        <li><span><?= $n ?></span><?= $t ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
                <?php endforeach; ?>
            </div>

            <div class="reveal-up decision-strip">
                <div class="ds-label">Final Decision Framework</div>
                <div><div class="ds-word">Scale</div><div class="ds-desc">Customers renew, margins hold. Grow.</div></div>
                <div><div class="ds-word">Optimize</div><div class="ds-desc">It runs, but costs squeeze the margin.</div></div>
                <div><div class="ds-word">Pivot</div><div class="ds-desc">People buy once, then don't come back.</div></div>
                <div><div class="ds-word">Restructure</div><div class="ds-desc">The model isn't healthy yet. Pause expansion.</div></div>
            </div>

            <div class="reveal-up scroll-next" style="margin-left: auto; margin-right: auto;" data-next="#buy">
                <span>Scroll to Explore</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </div>
        </div>
    </section>

    <div class="section-divider">
        <div class="line"></div><div class="mark">&copy;</div><div class="line"></div>
    </div>

    <!-- ===== PRICING / CTA ===== -->
    <section id="buy" style="padding: 80px 24px 100px;">
        <div style="max-width: 1060px; margin: 0 auto;">
            <div class="reveal-up" style="text-align: center; margin-bottom: 48px;">
                <div class="section-label">Get The Blueprint</div>
                <h2 class="section-heading">Steal the thinking. Build your own.</h2>
            </div>

            <div style="display: grid; grid-template-columns: 1fr; gap: 48px; align-items: center;" class="lg-grid-pricing">
                <div class="reveal-scale cover-showcase">
                    <img src="/public/images/creativebusiness-cover.jpg" alt="The Creative Businesses Blueprint cover">
                    <div class="cover-glow"></div>
                </div>

                <div class="reveal-up d2 pricing-card">
                    <div class="price-badge">Limited Offer</div>

                    <ul class="feature-list">
                        <?php
                        $features = [
                            '4 full case studies, start to finish',
                            '14 cheat sheets you can reuse for your own idea',
                            'Unit economics, break-even & ROI formulas',
                            'Startup capital & payback simulations per model',
                            'Stakeholder maps, team structure & targets',
                            'Risk tables & a final Scale / Pivot framework',
                        ];
                        foreach($features as $f): ?>
                        <li>
                            <div class="check"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></div>
                            <?= $f ?>
                        </li>
                        <?php endforeach; ?>
                    </ul>

                    <div class="price-current"><span>Rp</span><?= $cbPriceNum ?></div>

                    <a href="<?= $cbCheckout ?>" id="checkoutBtn" class="cta-btn" target="_blank" data-cta="pricing_get_blueprint">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
                        Get The Blueprint
                    </a>

                    <div class="price-guarantee">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                        Instant download &middot; PDF format
                    </div>
                </div>
            </div>
            <div class="reveal-up scroll-next" style="margin-left: auto; margin-right: auto;" data-next="#faq">
                <span>Scroll to Explore</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </div>
        </div>
    </section>

    <div class="section-divider">
        <div class="line"></div><div class="mark">&copy;</div><div class="line"></div>
    </div>

    <!-- ===== FAQ ===== -->
    <section id="faq" style="padding: 0 24px 100px;">
        <div style="max-width: 700px; margin: 0 auto;">
            <div class="reveal-up" style="text-align: center; margin-bottom: 40px;">
                <div class="section-label">FAQ</div>
                <h2 class="section-heading">Questions, answered honestly.</h2>
            </div>

            <div class="reveal-up" id="faqList">
                <?php
                $faqs = [
                    ['q' => 'Who is this blueprint for?', 'a' => 'Aspiring founders, creatives with a business idea, students, and anyone who wants a structured way to go from "what if?" to a plan they can test.'],
                    ['q' => 'Are these real, running businesses?', 'a' => 'No. They are four business concepts developed by The Innovators Studio as case studies. Each one is broken down with the same 14 cheat sheets so you can learn the thinking, not just the idea.'],
                    ['q' => 'Are the numbers final?', 'a' => 'No. Every figure is a planning assumption to be tested. The blueprint tells you to replace them with real vendor quotes and pilot data before making any investment decision.'],
                    ['q' => 'Can I use the cheat sheets for my own idea?', 'a' => 'Yes, that\'s the point. The same 14 steps apply to any creative business idea you want to work through.'],
                    ['q' => 'What language is it written in?', 'a' => 'Bahasa Indonesia.'],
                    ['q' => 'What format will I receive?', 'a' => 'An 87-page digital PDF, available for instant download after your purchase.'],
                    ['q' => 'Can I share or resell the PDF?', 'a' => 'No. The purchase is for personal use unless The Innovators Studio gives written permission.'],
                    ['q' => 'How much does it cost?', 'a' => $cbPrice . '.'],
                ];
                foreach($faqs as $f): ?>
                <div class="faq-item">
                    <button class="faq-q" type="button">
                        <span><?= $f['q'] ?></span>
                        <span class="plus"></span>
                    </button>
                    <div class="faq-a">
                        <p><?= $f['a'] ?></p>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
            <div class="reveal-up scroll-next" style="margin-left: auto; margin-right: auto;" data-next="#final">
                <span>Scroll to Explore</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </div>
        </div>
    </section>

    <div class="section-divider">
        <div class="line"></div><div class="mark">&copy;</div><div class="line"></div>
    </div>

    <!-- ===== FINAL CTA ===== -->
    <section id="final" style="padding: 0 24px 100px;">
        <div style="max-width: 720px; margin: 0 auto; text-align: center;">
            <div class="reveal-up big-quote">
                Start small. Prove it.<br>
                <em>Then grow.</em>
            </div>
            <p class="reveal-up d1" style="color: var(--text-dim); margin-top: 24px; font-size: 16px; line-height: 1.8; max-width: 540px; margin-left: auto; margin-right: auto;">
                Start with the number of customers you can truly serve well. From there, every customer who comes back is proof that a simple idea deserves to grow.
            </p>

            <div class="reveal-up d2" style="margin-top: 36px;">
                <a href="<?= $cbCheckout ?>" class="hero-cta-btn" target="_blank" data-cta="final_get_blueprint">Read The Blueprint</a>
                <div class="hero-price-line" style="margin-top: 14px;"><strong><?= $cbPrice ?></strong> &middot; Instant PDF Access</div>
            </div>

            <p class="reveal-up d3" style="color: var(--text-dim); opacity: 0.7; margin-top: 32px; font-size: 12px; letter-spacing: 0.05em;">
                A cheat sheet by The Innovators Studio.
            </p>
        </div>
    </section>

    <div class="cb-footer">
        <a href="/">← The Innovators Studio</a>
        <p>&copy; <?= date('Y') ?> The Innovators Studio. All rights reserved.</p>
    </div>
</div>

<!-- ===== STICKY MOBILE CTA ===== -->
<div class="sticky-cta" id="stickyCta">
    <div class="sticky-cta-info">
        <span class="name">Creative Business</span>
        <span class="price"><?= $cbPrice ?></span>
    </div>
    <a href="<?= $cbCheckout ?>" class="sticky-cta-btn" target="_blank" data-cta="mobile_sticky_get_it">Get It</a>
</div>

<script>
(function() {
    var scrollLine = document.getElementById('scrollLine');
    window.addEventListener('scroll', function() {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        if (h > 0) scrollLine.style.width = (window.scrollY / h * 100) + '%';
    });

    var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
            if (e.isIntersecting) e.target.classList.add('visible');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal-up, .reveal-scale').forEach(function(el) { obs.observe(el); });

    document.querySelectorAll('a[href^="#"]').forEach(function(a) {
        a.addEventListener('click', function(e) {
            e.preventDefault();
            var href = this.getAttribute('href');
            if (href === '#') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
            var t = document.querySelector(href);
            if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    document.querySelectorAll('.scroll-next').forEach(function(el) {
        el.addEventListener('click', function() {
            var t = document.querySelector(el.getAttribute('data-next'));
            if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
})();

(function() {
    var nav = document.getElementById('cbNav');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 80) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    });
})();

(function() {
    document.querySelectorAll('.faq-item').forEach(function(item) {
        var btn = item.querySelector('.faq-q');
        var answer = item.querySelector('.faq-a');
        btn.addEventListener('click', function() {
            var isOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item.open').forEach(function(other) {
                if (other !== item) {
                    other.classList.remove('open');
                    other.querySelector('.faq-a').style.maxHeight = null;
                }
            });
            if (isOpen) {
                item.classList.remove('open');
                answer.style.maxHeight = null;
            } else {
                item.classList.add('open');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
})();

(function() {
    var stickyCta = document.getElementById('stickyCta');
    var hero = document.getElementById('hero');
    var buySection = document.getElementById('buy');
    if (!stickyCta || !hero || !buySection) return;

    var pastHero = false;
    var inBuySection = false;

    function updateSticky() {
        if (pastHero && !inBuySection) stickyCta.classList.add('show');
        else stickyCta.classList.remove('show');
    }

    new IntersectionObserver(function(entries) {
        pastHero = !entries[0].isIntersecting;
        updateSticky();
    }, { threshold: 0 }).observe(hero);

    new IntersectionObserver(function(entries) {
        inBuySection = entries[0].isIntersecting;
        updateSticky();
    }, { threshold: 0.15 }).observe(buySection);
})();

(function() {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var vh = function() { return window.innerHeight; };
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

    /* split text (keeping inline <em>) into word spans */
    function split(el) {
        var words = [];
        (function walk(node) {
            Array.prototype.slice.call(node.childNodes).forEach(function(n) {
                if (n.nodeType === 3) {
                    var frag = document.createDocumentFragment();
                    n.textContent.split(/(\s+)/).forEach(function(part) {
                        if (!part) return;
                        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
                        var w = document.createElement('span'); w.className = 'sw';
                        var i = document.createElement('span'); i.className = 'si'; i.textContent = part;
                        w.appendChild(i); frag.appendChild(w); words.push(i);
                    });
                    node.replaceChild(frag, n);
                } else if (n.nodeType === 1 && n.tagName !== 'BR') { walk(n); }
            });
        })(el);
        return words;
    }

    if (!reduce) {
        /* headlines: masked word reveal */
        var headObs = new IntersectionObserver(function(es) {
            es.forEach(function(e) { if (e.isIntersecting) { e.target.classList.add('in'); headObs.unobserve(e.target); } });
        }, { threshold: 0.35 });
        document.querySelectorAll('.section-heading').forEach(function(h) {
            var words = split(h);
            words.forEach(function(w, i) { w.style.transitionDelay = (i * 70) + 'ms'; });
            h.classList.add('split');
            headObs.observe(h);
        });
    }

    /* scroll-scrubbed quotes */
    var quotes = [];
    if (!reduce) {
        document.querySelectorAll('.big-quote').forEach(function(q) {
            quotes.push({ el: q, words: split(q) });
            q.classList.add('wordfade');
        });
    }

    /* stat counters */
    var countObs = new IntersectionObserver(function(es) {
        es.forEach(function(e) {
            if (!e.isIntersecting) return;
            countObs.unobserve(e.target);
            var el = e.target, to = parseInt(el.getAttribute('data-count'), 10), t0 = null;
            function step(t) {
                if (t0 === null) t0 = t;
                var p = clamp((t - t0) / 1100, 0, 1), eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(to * eased);
                if (p < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach(function(el) {
        if (!reduce) { el.textContent = '0'; countObs.observe(el); }
    });

    /* scroll-driven: hero drift, book fan, quote words */
    var hero = document.getElementById('hero');
    var titleBlock = document.querySelector('.title-block');
    var stack = document.querySelector('.book-stack');
    var preview = document.getElementById('preview');
    var ticking = false;
    function onScroll() {
        var y = window.scrollY, h = vh();
        if (!reduce && titleBlock && y < h * 1.2) titleBlock.style.translate = '0 ' + (y * 0.18).toFixed(1) + 'px';
        if (!reduce && stack && preview) {
            var r = preview.getBoundingClientRect();
            var p = 1 - clamp(Math.abs((r.top + r.height / 2) - h / 2) / (h * 0.7), 0, 1);
            stack.style.setProperty('--fan', p.toFixed(3));
        }
        quotes.forEach(function(q) {
            var r = q.el.getBoundingClientRect();
            var p = clamp((h * 0.92 - r.top) / (h * 0.45), 0, 1), n = q.words.length;
            q.words.forEach(function(w, i) { w.style.opacity = (0.18 + 0.82 * clamp(p * (n + 2) - i, 0, 1)).toFixed(2); });
        });
        ticking = false;
    }
    window.addEventListener('scroll', function() {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    if (reduce || !fine) return;

    /* pointer-driven: ring, hero glow + title parallax */
    var ring = document.getElementById('cursorRing');
    var glow = document.getElementById('heroGlow');
    var w1 = document.querySelector('.title-word.w1');
    var w2 = document.querySelector('.title-word.w2');
    var mx = innerWidth / 2, my = innerHeight / 2;
    var rx = mx, ry = my, gx = 0, gy = 0, tx = 0, ty = 0, px = 0, py = 0, inHero = false;

    document.addEventListener('mousemove', function(e) {
        mx = e.clientX; my = e.clientY;
        ring.classList.add('on');
        var hr = hero.getBoundingClientRect();
        inHero = e.clientY >= hr.top && e.clientY <= hr.bottom;
        if (inHero) {
            gx = e.clientX - hr.left; gy = e.clientY - hr.top;
            tx = (e.clientX / innerWidth - 0.5) * 2;
            ty = ((e.clientY - hr.top) / hr.height - 0.5) * 2;
            glow.classList.add('on');
        } else { tx = 0; ty = 0; glow.classList.remove('on'); }
    });
    document.addEventListener('mouseleave', function() { ring.classList.remove('on'); glow.classList.remove('on'); tx = ty = 0; });
    document.addEventListener('mouseover', function(e) {
        ring.classList.toggle('hot', !!e.target.closest('a, button'));
    });

    var glowX = 0, glowY = 0;
    (function loop() {
        rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
        ring.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px)' + (ring.classList.contains('hot') ? ' scale(1.7)' : '');
        glowX += (gx - glowX) * 0.08; glowY += (gy - glowY) * 0.08;
        glow.style.transform = 'translate(' + glowX.toFixed(1) + 'px,' + glowY.toFixed(1) + 'px)';
        px += (tx - px) * 0.07; py += (ty - py) * 0.07;
        if (w1) w1.style.translate = (px * 16).toFixed(1) + 'px ' + (py * 8).toFixed(1) + 'px';
        if (w2) w2.style.translate = (-px * 11).toFixed(1) + 'px ' + (-py * 6).toFixed(1) + 'px';
        requestAnimationFrame(loop);
    })();

    /* card spotlight */
    document.querySelectorAll('.spot').forEach(function(c) {
        c.addEventListener('mousemove', function(e) {
            var r = c.getBoundingClientRect();
            c.style.setProperty('--sx', (e.clientX - r.left) + 'px');
            c.style.setProperty('--sy', (e.clientY - r.top) + 'px');
        });
    });

    /* magnetic buttons */
    document.querySelectorAll('.hero-cta-btn, .cta-btn, .cb-nav-cta').forEach(function(b) {
        b.addEventListener('mousemove', function(e) {
            var r = b.getBoundingClientRect();
            var dx = (e.clientX - (r.left + r.width / 2)) * 0.22, dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
            b.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
        });
        b.addEventListener('mouseleave', function() { b.style.transform = ''; });
    });

    /* 3D tilt on covers */
    document.querySelectorAll('.cover-showcase img, .book-stack .layer-1').forEach(function(img) {
        var host = img.closest('.cover-showcase, .book-stack');
        host.addEventListener('mousemove', function(e) {
            var r = img.getBoundingClientRect();
            var nx = clamp((e.clientX - r.left) / r.width - 0.5, -0.6, 0.6), ny = clamp((e.clientY - r.top) / r.height - 0.5, -0.6, 0.6);
            img.style.transition = 'transform 0.15s ease-out, box-shadow 0.5s ease';
            img.style.transform = 'perspective(900px) rotateY(' + (nx * 14).toFixed(2) + 'deg) rotateX(' + (-ny * 12).toFixed(2) + 'deg) scale(1.03)';
        });
        host.addEventListener('mouseleave', function() {
            img.style.transition = 'transform 0.7s cubic-bezier(0.22,1,0.36,1), box-shadow 0.5s ease';
            img.style.transform = '';
        });
    });
})();
</script>
</body>
</html>
