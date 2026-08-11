<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Neo Sabang Blueprint | The Innovators Studio</title>
    <meta name="description" content="A 50+ page working blueprint exploring how Jalan Sabang could become Sabang–Merauke, Jakarta's pedestrian-first culinary destination shaped by food, movement, business, and the people already there.">
    <meta property="og:title" content="Neo Sabang Blueprint | The Innovators Studio">
    <meta property="og:description" content="One street. All of Indonesia. One long table. A working urban blueprint by The Innovators Studio.">
    <meta property="og:image" content="<?= BASE_URL ?>/public/images/neosabang-cover.jpg">
    <link rel="icon" type="image/png" href="/public/images/tis-logo-circle.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=Sora:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
            --blueprint: #082241;
            --blueprint-rgb: 8, 34, 65;
            --blueprint-light: #163a6a;
            --blueprint-line: rgba(255,255,255,0.06);
            --gold: #c9a84c;
            --gold-light: #e8cc73;
            --gold-dim: rgba(201,168,76,0.15);
            --text: #e8e2d4;
            --text-dim: rgba(232,226,212,0.5);
        }

        html { scroll-behavior: smooth; scroll-snap-type: y mandatory; }
        body {
            background: #000;
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
        .ns-nav {
            position: fixed; top: 0; left: 0; right: 0;
            z-index: 500;
            display: flex; align-items: center; justify-content: space-between;
            padding: 20px 24px;
            background: transparent;
            transition: background 0.4s ease, padding 0.4s ease, border-color 0.4s ease;
            border-bottom: 1px solid transparent;
        }
        .ns-nav.scrolled {
            background: rgba(var(--blueprint-rgb), 0.92);
            backdrop-filter: blur(10px);
            padding: 14px 24px;
            border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .ns-nav-brand {
            font-family: 'Cinzel', serif;
            color: #fff;
            text-decoration: none;
            line-height: 1.4;
        }
        .ns-nav-brand .line1 {
            display: block;
            font-size: 13px; font-weight: 700;
            letter-spacing: 0.15em;
            text-transform: uppercase;
        }
        .ns-nav-brand .line2 {
            display: block;
            font-size: 9px; font-weight: 500;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.55);
        }
        .ns-nav-links {
            display: flex; align-items: center; gap: 28px;
        }
        .ns-nav-links a:not(.ns-nav-cta) {
            font-family: 'Inter', sans-serif;
            font-size: 13px; font-weight: 500;
            color: rgba(255,255,255,0.7);
            text-decoration: none;
            letter-spacing: 0.02em;
            transition: color 0.3s ease;
        }
        .ns-nav-links a:not(.ns-nav-cta):hover { color: #fff; }
        .ns-nav-cta {
            font-family: 'Cinzel', serif;
            font-size: 11px; font-weight: 700;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: #0a0a0a;
            background: var(--gold);
            padding: 9px 18px;
            border-radius: 3px;
            text-decoration: none;
            transition: background 0.3s ease;
        }
        .ns-nav-cta:hover { background: var(--gold-light); }
        @media (max-width: 700px) {
            .ns-nav-links a:not(.ns-nav-cta) { display: none; }
        }

        /* ===== INTRO VIDEO (hero background) ===== */
        .hero-video-bg {
            position: absolute; inset: 0;
            width: 100%; height: 100%;
            z-index: 0;
            overflow: hidden;
            background: var(--blueprint);
        }
        .hero-video-bg video {
            width: 100%; height: 100%;
            object-fit: cover;
        }
        .hero-video-tint {
            position: absolute; inset: 0;
            background: rgba(var(--blueprint-rgb), 0.88);
            z-index: 1;
        }
        .intro-mute-btn {
            position: absolute;
            bottom: 20px; right: 20px;
            display: flex; align-items: center; justify-content: center;
            width: 34px; height: 34px;
            background: rgba(255,255,255,0.12);
            border: 1px solid rgba(255,255,255,0.3);
            color: #fff;
            border-radius: 50%;
            cursor: pointer;
            backdrop-filter: blur(6px);
            transition: background 0.3s ease;
            z-index: 2;
        }
        .intro-mute-btn:hover { background: rgba(255,255,255,0.22); }
        .intro-mute-btn.hidden { display: none; }
        .intro-mute-btn svg { width: 15px; height: 15px; }
        @media (max-width: 600px) {
            .intro-mute-btn { bottom: 14px; right: 14px; width: 30px; height: 30px; }
            .intro-mute-btn svg { width: 13px; height: 13px; }
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: var(--blueprint); }
        ::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 2px; }

        /* ===== HERO / TITLE CARD ===== */
        .hero-title-card {
            min-height: 100vh;
            min-height: 100svh;
            background: var(--blueprint);
            display: flex; align-items: center; justify-content: center;
            flex-direction: column;
            position: relative;
            z-index: 10;
            padding: 100px 24px 60px;
            overflow: hidden;
            scroll-snap-align: start;
            scroll-snap-stop: always;
        }

        .hero-title-card .title-block,
        .hero-title-card .title-extras,
        .hero-title-card .hero-hook,
        .hero-title-card .hero-cta-row,
        .hero-title-card .title-scroll {
            position: relative;
            z-index: 2;
        }

        .hero-revealed .title-presents,
        .hero-revealed .title-neo,
        .hero-revealed .title-neo::after,
        .hero-revealed .title-extras,
        .hero-revealed .hero-hook,
        .hero-revealed .hero-cta-row,
        .hero-revealed .title-scroll {
            animation-play-state: running;
        }

        .title-block {
            text-align: center;
            margin-top: 32px;
        }

        .title-presents {
            font-family: 'Sora', sans-serif;
            font-size: clamp(14px, 2.5vw, 22px);
            color: #fff;
            letter-spacing: 0.02em;
            opacity: 0;
            transform: translateY(20px);
            animation: slideUp 0.8s cubic-bezier(0.22,1,0.36,1) 1.0s forwards;
            animation-play-state: paused;
        }
        .title-presents strong { font-weight: 800; }
        .title-presents span { font-weight: 400; color: rgba(255,255,255,0.65); }

        .title-neo {
            font-family: 'Cinzel', serif;
            font-size: clamp(60px, 15vw, 160px);
            font-weight: 900;
            color: #fff;
            letter-spacing: 0.05em;
            line-height: 1;
            margin-top: 12px;
            opacity: 0;
            transform: translateY(30px);
            animation: slideUp 1s cubic-bezier(0.22,1,0.36,1) 1.6s forwards;
            animation-play-state: paused;
            position: relative;
            display: inline-block;
        }
        .title-neo::after {
            content: '';
            position: absolute;
            bottom: -4px; left: 0; right: 0;
            height: 4px;
            background: var(--gold);
            transform: scaleX(0);
            transform-origin: left;
            animation: lineGrow 0.8s cubic-bezier(0.22,1,0.36,1) 2.2s forwards;
            animation-play-state: paused;
        }

        @keyframes slideUp {
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes lineGrow {
            to { transform: scaleX(1); }
        }

        /* Elements that appear after title */
        .title-extras {
            margin-top: 24px;
            text-align: center;
            opacity: 0;
            transform: translateY(20px);
            animation: slideUp 1s cubic-bezier(0.22,1,0.36,1) 2.6s forwards;
            animation-play-state: paused;
        }
        .title-badge {
            display: inline-block;
            font-family: 'Cinzel', serif;
            font-size: clamp(14px, 2.2vw, 20px); font-weight: 700;
            color: #fff;
            letter-spacing: 0.35em;
            text-transform: uppercase;
        }

        .hero-hook {
            max-width: 720px;
            margin: 0 auto;
            text-align: center;
            font-family: 'Cinzel', serif;
            font-size: clamp(19px, 2.8vw, 30px);
            font-weight: 600;
            color: #fff;
            line-height: 1.4;
            opacity: 0;
            transform: translateY(20px);
            animation: slideUp 1s cubic-bezier(0.22,1,0.36,1) 0.3s forwards;
            animation-play-state: paused;
        }

        .hero-cta-row {
            margin-top: 32px;
            display: flex; flex-direction: column; align-items: center; gap: 10px;
            opacity: 0;
            transform: translateY(20px);
            animation: slideUp 1s cubic-bezier(0.22,1,0.36,1) 3.0s forwards;
            animation-play-state: paused;
        }
        .hero-cta-btn {
            display: inline-flex; align-items: center; gap: 10px;
            padding: 15px 30px;
            background: var(--gold);
            color: #0a0a0a;
            font-family: 'Cinzel', serif;
            font-size: 13px; font-weight: 700;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            text-decoration: none;
            border-radius: 4px;
            transition: all 0.35s ease;
        }
        .hero-cta-btn:hover {
            background: var(--gold-light);
            transform: translateY(-2px);
            box-shadow: 0 8px 26px rgba(201,168,76,0.3);
        }
        .hero-price-line {
            font-size: 13px;
            color: rgba(255,255,255,0.55);
            letter-spacing: 0.03em;
        }
        .hero-price-line strong { color: var(--gold); font-weight: 700; }

        .title-scroll {
            margin-top: 40px;
            display: flex; flex-direction: column; align-items: center; gap: 8px;
            color: #fff;
            font-family: 'Cinzel', serif;
            font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase;
            font-weight: 700;
            opacity: 0;
            animation: slideUp 0.8s cubic-bezier(0.22,1,0.36,1) 3.9s forwards;
            animation-play-state: paused;
        }
        .title-scroll svg {
            animation: scrollBounce 2s ease-in-out infinite;
            color: var(--gold);
        }
        @keyframes scrollBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }

        /* ===== CONTENT AREA (dark blueprint bg) ===== */
        .content-area {
            background: var(--blueprint);
            position: relative;
        }

        .blueprint-grid {
            position: absolute; inset: 0;
            background-image:
                linear-gradient(var(--blueprint-line) 1px, transparent 1px),
                linear-gradient(90deg, var(--blueprint-line) 1px, transparent 1px);
            background-size: 60px 60px;
            pointer-events: none;
            z-index: 1;
            opacity: 0.5;
        }

        .scroll-line {
            position: fixed; top: 0; left: 0;
            height: 2px; width: 0%;
            background: linear-gradient(90deg, var(--gold), var(--gold-light));
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
            color: var(--gold);
            font-family: 'Cinzel', serif;
            font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase;
            font-weight: 700;
            opacity: 0.8;
            transition: opacity 0.3s ease;
            width: fit-content;
        }
        .scroll-next:hover { opacity: 1; }
        .scroll-next svg {
            animation: scrollBounce 2s ease-in-out infinite;
        }

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
        }
        .section-divider .line { flex: 1; max-width: 200px; height: 1px; background: linear-gradient(90deg, transparent, var(--gold-dim)); }
        .section-divider .line:last-child { background: linear-gradient(90deg, var(--gold-dim), transparent); }
        .section-divider .diamond {
            width: 8px; height: 8px;
            border: 1px solid var(--gold);
            transform: rotate(45deg);
        }

        .big-quote {
            font-family: 'Cinzel', serif;
            font-size: clamp(24px, 4vw, 44px);
            font-weight: 600;
            color: white;
            text-align: center;
            line-height: 1.4;
            letter-spacing: 0.02em;
        }
        .big-quote em {
            font-style: italic;
            color: var(--gold);
        }

        .section-label {
            font-family: 'Cinzel', serif;
            font-size: 11px; font-weight: 700;
            color: var(--gold);
            letter-spacing: 0.5em;
            text-transform: uppercase;
            margin-bottom: 16px;
        }
        .section-heading {
            font-family: 'Cinzel', serif;
            font-size: clamp(28px, 5vw, 48px);
            font-weight: 700;
            color: white;
            line-height: 1.2;
            letter-spacing: 0.03em;
        }

        /* ===== CURIOSITY HOOKS (left-aligned list) ===== */
        .hook-line {
            font-family: 'Cinzel', serif;
            font-style: italic;
            font-size: clamp(17px, 2.4vw, 24px);
            color: rgba(255,255,255,0.85);
            text-align: left;
            padding: 16px 0 16px 28px;
            position: relative;
            border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .hook-line::before {
            content: '\2014';
            position: absolute;
            left: 0; top: 16px;
            color: var(--gold);
            font-style: normal;
        }
        .hook-line:first-child { border-top: 1px solid rgba(255,255,255,0.06); }

        /* ===== BOOK PREVIEW MOCKUP ===== */
        .book-stack {
            position: relative;
            max-width: 380px;
            margin: 60px auto 0;
            padding: 30px;
        }
        .book-stack img {
            position: absolute;
            top: 30px; left: 30px;
            width: calc(100% - 60px);
            border-radius: 3px;
            box-shadow: 0 30px 70px rgba(0,0,0,0.55);
        }
        .book-stack .layer-3 { transform: rotate(-6deg) translate(-14px, 10px); opacity: 0.35; filter: brightness(0.5); }
        .book-stack .layer-2 { transform: rotate(-3deg) translate(-6px, 4px); opacity: 0.6; filter: brightness(0.7); }
        .book-stack .layer-1 { transform: rotate(0deg); position: relative; opacity: 1; }
        .book-stack-wrap { position: relative; }

        /* ===== HONESTY CARDS ===== */
        .honesty-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 1px;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.08);
        }
        .honesty-card {
            background: var(--blueprint);
            padding: 32px 28px;
        }
        .honesty-card .label {
            font-family: 'Cinzel', serif;
            font-size: 12px; font-weight: 700;
            color: var(--gold);
            letter-spacing: 0.15em;
            text-transform: uppercase;
            margin-bottom: 14px;
        }
        .honesty-card p {
            font-size: 15px;
            color: var(--text-dim);
            line-height: 1.7;
        }

        .pillar-card {
            background: rgba(255,255,255,0.02);
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 4px;
            padding: 28px 26px;
            position: relative;
            overflow: hidden;
            transition: all 0.5s ease;
        }
        .pillar-card::before {
            content: '';
            position: absolute; top: 0; left: 0; right: 0; height: 2px;
            background: linear-gradient(90deg, transparent, var(--gold), transparent);
            opacity: 0;
            transition: opacity 0.5s ease;
        }
        .pillar-card:hover::before { opacity: 1; }
        .pillar-card:hover {
            background: rgba(255,255,255,0.04);
            border-color: rgba(201,168,76,0.15);
            transform: translateY(-4px);
        }
        .pillar-num {
            font-family: 'Cinzel', serif;
            font-size: 34px; font-weight: 800;
            color: rgba(201,168,76,0.15);
            line-height: 1;
            margin-bottom: 10px;
        }
        .pillar-title {
            font-family: 'Cinzel', serif;
            font-size: 16px; font-weight: 700;
            color: white;
            letter-spacing: 0.03em;
            margin-bottom: 8px;
        }
        .pillar-desc {
            font-size: 14px;
            color: var(--text-dim);
            line-height: 1.6;
        }

        .cover-showcase {
            position: relative;
            max-width: 400px;
            margin: 0 auto;
        }
        .cover-showcase img {
            width: 100%;
            border-radius: 4px;
            box-shadow:
                0 20px 60px rgba(0,0,0,0.5),
                0 0 0 1px rgba(201,168,76,0.15),
                0 0 80px rgba(201,168,76,0.05);
            transition: transform 0.5s ease, box-shadow 0.5s ease;
        }
        .cover-showcase:hover img {
            transform: translateY(-8px) scale(1.02);
            box-shadow:
                0 30px 80px rgba(0,0,0,0.6),
                0 0 0 1px rgba(201,168,76,0.25),
                0 0 120px rgba(201,168,76,0.1);
        }
        .cover-glow {
            position: absolute;
            bottom: -30px; left: 10%; right: 10%;
            height: 60px;
            background: radial-gradient(ellipse, rgba(201,168,76,0.15), transparent 70%);
            filter: blur(20px);
            pointer-events: none;
        }

        .pricing-card {
            background: linear-gradient(155deg, var(--gold-light) 0%, var(--gold) 55%, #b3923f 100%);
            border: 1px solid rgba(255,255,255,0.35);
            border-radius: 8px;
            padding: 48px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
            max-width: 480px;
            margin: 0 auto;
            box-shadow: 0 0 40px rgba(201,168,76,0.55), 0 0 90px rgba(201,168,76,0.3), 0 20px 60px rgba(0,0,0,0.35);
            animation: goldPulse 3.5s ease-in-out infinite;
        }
        @keyframes goldPulse {
            0%, 100% { box-shadow: 0 0 40px rgba(201,168,76,0.55), 0 0 90px rgba(201,168,76,0.3), 0 20px 60px rgba(0,0,0,0.35); }
            50% { box-shadow: 0 0 55px rgba(201,168,76,0.75), 0 0 120px rgba(201,168,76,0.45), 0 20px 60px rgba(0,0,0,0.35); }
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
            font-family: 'Cinzel', serif;
            font-size: 11px; font-weight: 700;
            color: #fff;
            background: var(--blueprint);
            padding: 6px 20px;
            letter-spacing: 0.3em;
            text-transform: uppercase;
            margin-bottom: 24px;
            position: relative;
            z-index: 1;
        }
        .price-current {
            font-family: 'Cinzel', serif;
            font-size: clamp(40px, 8vw, 56px);
            font-weight: 800;
            color: var(--blueprint);
            line-height: 1;
            margin: 16px 0 4px;
            position: relative;
            z-index: 1;
        }
        .price-current span { color: var(--blueprint); }
        .price-note {
            font-size: 15px;
            color: rgba(8,34,65,0.75);
            margin-bottom: 28px;
            position: relative;
            z-index: 1;
        }
        .cta-btn {
            display: inline-flex; align-items: center; justify-content: center; gap: 10px;
            width: 100%;
            padding: 18px 32px;
            background: var(--blueprint);
            color: #fff;
            font-family: 'Cinzel', serif;
            font-size: 15px; font-weight: 700;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            text-decoration: none;
            border: none; cursor: pointer;
            transition: all 0.4s ease;
            border-radius: 4px;
            position: relative;
            z-index: 1;
        }
        .cta-btn:hover {
            background: var(--blueprint-light);
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(8,34,65,0.4);
        }
        .cta-btn:active { transform: translateY(0); }
        .price-guarantee {
            display: flex; align-items: center; justify-content: center; gap: 8px;
            margin-top: 16px;
            font-size: 13px;
            color: rgba(255,255,255,0.75);
            position: relative;
            z-index: 1;
        }

        .feature-list {
            list-style: none; padding: 0;
            text-align: left;
            margin-bottom: 28px;
        }
        .feature-list li {
            display: flex; align-items: flex-start; gap: 12px;
            padding: 9px 0;
            font-size: 15px;
            color: var(--blueprint);
            font-weight: 500;
            border-bottom: 1px solid rgba(8,34,65,0.12);
            position: relative;
            z-index: 1;
        }
        .feature-list li:last-child { border-bottom: none; }
        .feature-list .check {
            flex-shrink: 0;
            width: 20px; height: 20px;
            border-radius: 50%;
            background: var(--blueprint);
            display: flex; align-items: center; justify-content: center;
            margin-top: 1px;
        }
        .feature-list .check svg {
            width: 12px; height: 12px;
            color: #fff;
        }

        /* ===== FAQ ===== */
        .faq-item {
            border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .faq-q {
            width: 100%;
            display: flex; align-items: center; justify-content: space-between;
            gap: 16px;
            padding: 22px 4px;
            background: none; border: none;
            cursor: pointer;
            text-align: left;
            font-family: 'Cinzel', serif;
            font-size: clamp(14px, 1.8vw, 17px);
            font-weight: 600;
            color: white;
        }
        .faq-q .plus {
            flex-shrink: 0;
            width: 20px; height: 20px;
            position: relative;
            color: var(--gold);
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

        .ns-footer {
            background: var(--blueprint);
            border-top: 1px solid rgba(255,255,255,0.04);
            padding: 40px 24px;
            text-align: center;
        }
        .ns-footer a {
            color: var(--gold);
            text-decoration: none;
            font-size: 13px;
            font-weight: 500;
        }
        .ns-footer p {
            font-size: 12px;
            color: rgba(255,255,255,0.2);
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
            background: rgba(var(--blueprint-rgb), 0.97);
            backdrop-filter: blur(10px);
            border-top: 1px solid rgba(255,255,255,0.1);
            transform: translateY(100%);
            transition: transform 0.35s ease;
        }
        .sticky-cta.show { transform: translateY(0); }
        .sticky-cta-info { display: flex; flex-direction: column; line-height: 1.3; }
        .sticky-cta-info .name { font-size: 13px; color: rgba(255,255,255,0.7); font-weight: 500; }
        .sticky-cta-info .price { font-family: 'Cinzel', serif; font-size: 16px; font-weight: 800; color: var(--gold); }
        .sticky-cta-btn {
            flex-shrink: 0;
            font-family: 'Cinzel', serif;
            font-size: 13px; font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #0a0a0a;
            background: var(--gold);
            padding: 12px 24px;
            border-radius: 4px;
            text-decoration: none;
        }
        @media (max-width: 768px) {
            .sticky-cta { display: flex; }
        }

        @media (max-width: 768px) {
            .pillar-grid { grid-template-columns: 1fr !important; }
            .pricing-card { padding: 36px 24px; }
            .timeline-item { flex-direction: column; gap: 8px; }
        }
        @media (min-width: 768px) {
            .lg-grid-pricing {
                grid-template-columns: 1fr 1fr !important;
            }
        }
    </style>
</head>
<body>

<!-- ===== NAV ===== -->
<nav class="ns-nav" id="nsNav">
    <a href="#" class="ns-nav-brand"><span class="line1">Neo Sabang Blueprint</span><span class="line2">by The Innovators Studio</span></a>
    <div class="ns-nav-links">
        <a href="#concept">Concept</a>
        <a href="#inside">Inside</a>
        <a href="#preview">Preview</a>
        <a href="#faq">FAQ</a>
        <a href="#buy" class="ns-nav-cta">Get Blueprint</a>
    </div>
</nav>

<!-- ===== HERO TITLE CARD (video background) ===== -->
<div class="hero-title-card" id="hero">
    <div class="hero-video-bg">
        <video id="introVideo" autoplay playsinline>
            <source src="/public/images/neosabang-intro.mp4" type="video/mp4">
        </video>
    </div>
    <div class="hero-video-tint"></div>
    <div class="blueprint-grid"></div>

    <button id="introMuteBtn" class="intro-mute-btn hidden" type="button" aria-label="Toggle sound">
        <svg id="iconSoundOn" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>
        <svg id="iconSoundOff" style="display:none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/></svg>
    </button>

    <p class="hero-hook">What if one street could bring all of Indonesia cuisine to the same table?</p>

    <div class="title-block">
        <div class="title-presents">
            <strong>The Innovators Studio</strong> <span>presents</span>
        </div>
        <div class="title-neo">NEO SABANG</div>
    </div>

    <div class="title-extras">
        <div class="title-badge">Research Blueprint</div>
    </div>

    <div class="hero-cta-row">
        <a href="https://theinnovatorsstudio.myr.id/pl/neo-sabang" class="hero-cta-btn" target="_blank" data-cta="hero_get_blueprint">Get The Blueprint</a>
        <div class="hero-price-line"><strong>Rp30.000</strong> &middot; Instant PDF Access</div>
    </div>

    <div class="title-scroll">
        <span>Scroll to Explore</span>
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
    </div>
</div>

<!-- ===== CONTENT AREA (Blueprint dark) ===== -->
<div class="content-area">
    <div class="blueprint-grid"></div>
    <div class="scroll-line" id="scrollLine"></div>

    <?php for($i=0; $i<12; $i++): ?>
    <div class="particle" style="
        left: <?= rand(5,95) ?>%;
        top: <?= rand(10,90) ?>%;
        animation-delay: <?= $i * 0.6 ?>s;
        animation-duration: <?= rand(6,12) ?>s;
        width: <?= rand(1,3) ?>px;
        height: <?= rand(1,3) ?>px;
    "></div>
    <?php endfor; ?>

    <!-- ===== THE PROBLEM ===== -->
    <section id="concept" style="padding: 100px 24px 60px;">
        <div style="max-width: 800px; margin: 0 auto; text-align: center;">
            <div class="reveal-up section-label">It Already Has The Traffic</div>
            <p class="reveal-up d1 big-quote" style="margin-top: 24px;">
                Jalan Sabang doesn't need to be invented. <em>It needs to be transformed.</em>
            </p>
            <p class="reveal-up d2" style="color: var(--text-dim); margin-top: 24px; font-size: 16px; line-height: 1.8; max-width: 560px; margin-left: auto; margin-right: auto;">
                Around 9,000 people already walk this street every day, with zero design behind it. The food is there. The crowd is there. What's missing is the system that turns that into a destination.
            </p>
            <div class="reveal-up d3 scroll-next" style="margin-left: auto; margin-right: auto;" data-next="#hooks">
                <span>Scroll to Explore</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </div>
        </div>
    </section>

    <div class="section-divider">
        <div class="line"></div><div class="diamond"></div><div class="line"></div>
    </div>

    <!-- ===== CURIOSITY HOOKS ===== -->
    <section id="hooks" style="padding: 0 24px 80px;">
        <div style="max-width: 700px; margin: 0 auto; text-align: left;">
            <div class="reveal-up" style="margin-bottom: 40px;">
                <div class="section-label">The Questions Behind The Blueprint</div>
            </div>

            <ul style="list-style: none; padding: 0; margin: 0;">
            <?php
            $hooks = [
                'Why does Jalan Alor earn far more than Jalan Sabang, on roughly the same length of street?',
                'Why isn\'t simply closing the road the answer?',
                'What happens to the people already living there?',
                'Who actually runs the street after opening day?',
                'Can renaming a street really change what happens on it?',
            ];
            foreach($hooks as $i => $h): ?>
            <li class="reveal-up d<?= min($i+1,5) ?> hook-line"><?= $h ?></li>
            <?php endforeach; ?>
            </ul>

            <p class="reveal-up" style="color: var(--text-dim); margin-top: 36px; font-size: 15px;">
                We didn't start with a masterplan. We started with better questions.
            </p>
            <div style="margin-top: 28px;">
                <a href="#inside" class="reveal-up" style="display: inline-block; font-family: 'Cinzel', serif; font-size: 12px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); border-bottom: 1px solid var(--gold-dim); padding-bottom: 4px; text-decoration: none;">See What We Found</a>
            </div>
            <div class="reveal-up scroll-next" data-next="#preview">
                <span>Scroll to Explore</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </div>
        </div>
    </section>

    <div class="section-divider">
        <div class="line"></div><div class="diamond"></div><div class="line"></div>
    </div>

    <!-- ===== BOOK PREVIEW ===== -->
    <section id="preview" style="padding: 0 24px 80px;">
        <div style="max-width: 700px; margin: 0 auto; text-align: center;">
            <div class="reveal-up section-label">The Manuscript</div>
            <h2 class="reveal-up d1 section-heading">50+ pages of thinking you were never meant to see.</h2>
            <p class="reveal-up d2" style="color: var(--text-dim); margin-top: 20px; font-size: 15px; max-width: 480px; margin-left: auto; margin-right: auto;">
                Not just the final idea. The questions, references, assumptions, and unfinished parts behind it.
            </p>

            <div class="reveal-scale book-stack-wrap">
                <div class="book-stack">
                    <img class="layer-3" src="/public/images/neosabang-cover.jpg" alt="" aria-hidden="true">
                    <img class="layer-2" src="/public/images/neosabang-cover.jpg" alt="" aria-hidden="true">
                    <img class="layer-1" src="/public/images/neosabang-cover.jpg" alt="Neo Sabang Blueprint cover">
                </div>
            </div>

            <div style="margin-top: 36px;">
                <a href="https://theinnovatorsstudio.myr.id/pl/neo-sabang" class="hero-cta-btn" target="_blank" data-cta="preview_get_blueprint">Get The Full Blueprint</a>
                <div class="hero-price-line" style="margin-top: 12px; color: var(--text-dim);"><strong style="color: var(--gold);">Rp30.000</strong></div>
            </div>
            <div class="reveal-up scroll-next" style="margin-left: auto; margin-right: auto;" data-next="#honesty">
                <span>Scroll to Explore</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </div>
        </div>
    </section>

    <div class="section-divider">
        <div class="line"></div><div class="diamond"></div><div class="line"></div>
    </div>

    <!-- ===== NO FAKE CERTAINTY ===== -->
    <section id="honesty" style="padding: 0 24px 80px;">
        <div style="max-width: 1000px; margin: 0 auto;">
            <div class="reveal-up" style="text-align: center; margin-bottom: 48px;">
                <div class="section-label">No Fake Certainty</div>
                <h2 class="section-heading">We left the uncertainty in.</h2>
                <p style="color: var(--text-dim); margin-top: 16px; font-size: 15px;">Most proposals hide the questions. This one publishes them.</p>
            </div>

            <div class="reveal-up honesty-grid">
                <div class="honesty-card">
                    <div class="label">What We Know</div>
                    <p>Sabang's real traffic patterns, its narrow trotoar, and its foot traffic. Measured from what's already there today.</p>
                </div>
                <div class="honesty-card">
                    <div class="label">What We Believe</div>
                    <p>A pedestrian-first core, rhythm-based rest zones, and an annual culinary system can turn friction into flow.</p>
                </div>
                <div class="honesty-card">
                    <div class="label">What Still Needs Testing</div>
                    <p>The exact economics, the crossing relocation, and the compensation housing model. Flagged as hypotheses, not facts.</p>
                </div>
                <div class="honesty-card">
                    <div class="label">What We'll Measure</div>
                    <p>Dwell time, transit mode share, resident satisfaction after relocation, and noise and air quality against today's baseline.</p>
                </div>
            </div>

            <p class="reveal-up" style="text-align: center; color: var(--text-dim); margin-top: 32px; font-size: 14px;">
                It's not a weakness. It's what honest work looks like.
            </p>
            <div class="reveal-up scroll-next" style="margin-left: auto; margin-right: auto;" data-next="#inside">
                <span>Scroll to Explore</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </div>
        </div>
    </section>

    <div class="section-divider">
        <div class="line"></div><div class="diamond"></div><div class="line"></div>
    </div>

    <!-- ===== INSIDE THE BLUEPRINT (9 chapters) ===== -->
    <section id="inside" style="padding: 80px 24px;">
        <div style="max-width: 1100px; margin: 0 auto;">
            <div class="reveal-up" style="text-align: center; margin-bottom: 56px;">
                <div class="section-label">9 Chapters</div>
                <h2 class="section-heading">From one street to Sabang&ndash;Merauke.</h2>
            </div>

            <div class="pillar-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">
                <?php
                $chapters = [
                    ['num' => '01', 'title' => 'The Status Quo', 'desc' => 'Jalan Sabang today: full of life, empty of system.'],
                    ['num' => '02', 'title' => 'The Vision', 'desc' => 'One name change. Sabang becomes Sabang–Merauke.'],
                    ['num' => '03', 'title' => 'Sabang–Merauke Culinary Street', 'desc' => 'Curated by Kompetisi Jagatrasa, a national contest for a seat on the street.'],
                    ['num' => '04', 'title' => 'Car Free Road', 'desc' => 'The core goes car-free. A new route opens for what\'s displaced.'],
                    ['num' => '05', 'title' => 'Integrated Public Transportation', 'desc' => 'The last 500 meters from MRT Monas, solved.'],
                    ['num' => '06', 'title' => 'The Math', 'desc' => 'What it costs, what it returns, laid out honestly.'],
                    ['num' => '07', 'title' => 'The Challenges', 'desc' => 'Land, conflicting interests, and who runs it after opening day.'],
                    ['num' => '08', 'title' => 'The Impact', 'desc' => 'Social, economic, ecological, mobility. Measured, not assumed.'],
                    ['num' => '09', 'title' => 'Conclusion & Recommendations', 'desc' => 'A phased rollout: pilot, evaluate, expand.'],
                ];
                foreach($chapters as $i => $c): ?>
                <div class="reveal-up d<?= ($i % 5) + 1 ?> pillar-card">
                    <div class="pillar-num"><?= $c['num'] ?></div>
                    <div class="pillar-title"><?= $c['title'] ?></div>
                    <div class="pillar-desc"><?= $c['desc'] ?></div>
                </div>
                <?php endforeach; ?>
            </div>
            <div class="reveal-up scroll-next" style="margin-left: auto; margin-right: auto;" data-next="#buy">
                <span>Scroll to Explore</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </div>
        </div>
    </section>

    <div class="section-divider">
        <div class="line"></div><div class="diamond"></div><div class="line"></div>
    </div>

    <!-- ===== PRICING / CTA ===== -->
    <section id="buy" style="padding: 80px 24px 100px;">
        <div style="max-width: 1000px; margin: 0 auto;">
            <div class="reveal-up" style="text-align: center; margin-bottom: 48px;">
                <div class="section-label">Get The Blueprint</div>
                <h2 class="section-heading">Own the idea. Build the future.</h2>
            </div>

            <div style="display: grid; grid-template-columns: 1fr; gap: 48px; align-items: center;" class="lg-grid-pricing">
                <div class="reveal-scale cover-showcase">
                    <img src="/public/images/neosabang-cover.jpg" alt="Neo Sabang E-Book Cover">
                    <div class="cover-glow"></div>
                </div>

                <div class="reveal-up d2 pricing-card">
                    <div class="price-badge">Limited Offer</div>

                    <ul class="feature-list">
                        <li>
                            <div class="check"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></div>
                            9 chapters, start to finish
                        </li>
                        <li>
                            <div class="check"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></div>
                            The vision: Sabang becomes Sabang&ndash;Merauke
                        </li>
                        <li>
                            <div class="check"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></div>
                            Three transformations: culinary street, car-free core, integrated transit
                        </li>
                        <li>
                            <div class="check"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></div>
                            The Kompetisi Jagatrasa mechanism
                        </li>
                        <li>
                            <div class="check"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></div>
                            The math: real costs, real returns
                        </li>
                        <li>
                            <div class="check"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></div>
                            Governance, financing & relocation plan
                        </li>
                        <li>
                            <div class="check"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></div>
                            Open hypotheses & research questions
                        </li>
                    </ul>

                    <div class="price-current" style="margin-bottom: 28px;"><span>Rp</span> 30.000</div>

                    <a href="https://theinnovatorsstudio.myr.id/pl/neo-sabang" id="checkoutBtn" class="cta-btn" target="_blank" data-cta="pricing_get_blueprint">
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
        <div class="line"></div><div class="diamond"></div><div class="line"></div>
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
                    ['q' => 'Is Neo Sabang an official government proposal?', 'a' => 'No. Neo Sabang is an independent working blueprint created by The Innovators Studio.'],
                    ['q' => 'Is every number inside the blueprint final?', 'a' => 'No. Preliminary estimates are clearly labeled as working estimates. The manuscript also states which data and hypotheses still need verification.'],
                    ['q' => 'What format will I receive?', 'a' => 'A digital PDF, available for instant download after your purchase.'],
                    ['q' => 'Is this only for architects or urban designers?', 'a' => 'No. It\'s written for designers, builders, business thinkers, students, policymakers, culinary founders, and anyone curious about how cities work.'],
                    ['q' => 'Is this a finished masterplan?', 'a' => 'No. It\'s a studio manuscript that explores a direction, the reasoning behind it, and the questions that still need to be tested.'],
                    ['q' => 'Can I share or resell the PDF?', 'a' => 'No. The purchase is for personal use unless The Innovators Studio gives written permission.'],
                    ['q' => 'How much does it cost?', 'a' => 'Rp30.000.'],
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
        <div class="line"></div><div class="diamond"></div><div class="line"></div>
    </div>

    <!-- ===== FINAL CTA ===== -->
    <section id="final" style="padding: 0 24px 100px;">
        <div style="max-width: 700px; margin: 0 auto; text-align: center;">
            <div class="reveal-up big-quote">
                The same street.<br>
                <em>A different way to live.</em>
            </div>
            <p class="reveal-up d1" style="color: var(--text-dim); margin-top: 24px; font-size: 16px; line-height: 1.8; max-width: 520px; margin-left: auto; margin-right: auto;">
                Neo Sabang doesn't turn Jakarta into a different city. It just gives Jakarta room to become the best version of itself.
            </p>

            <div class="reveal-up d2" style="margin-top: 36px;">
                <a href="https://theinnovatorsstudio.myr.id/pl/neo-sabang" class="hero-cta-btn" target="_blank" data-cta="final_get_blueprint">Read The Blueprint</a>
                <div class="hero-price-line" style="margin-top: 14px; color: var(--text-dim);"><strong style="color: var(--gold);">Rp30.000</strong> &middot; Instant PDF Access</div>
            </div>

            <p class="reveal-up d3" style="color: rgba(255,255,255,0.3); margin-top: 32px; font-size: 12px; letter-spacing: 0.05em;">
                A working manuscript by The Innovators Studio.
            </p>
        </div>
    </section>

    <div class="ns-footer">
        <a href="/">← The Innovators Studio</a>
        <p>&copy; <?= date('Y') ?> The Innovators Studio. All rights reserved.</p>
    </div>
</div>

<!-- ===== STICKY MOBILE CTA ===== -->
<div class="sticky-cta" id="stickyCta">
    <div class="sticky-cta-info">
        <span class="name">Neo Sabang</span>
        <span class="price">Rp30.000</span>
    </div>
    <a href="https://theinnovatorsstudio.myr.id/pl/neo-sabang" class="sticky-cta-btn" target="_blank" data-cta="mobile_sticky_get_it">Get It</a>
</div>

<script>
(function() {
    var video = document.getElementById('introVideo');
    var muteBtn = document.getElementById('introMuteBtn');
    var iconOn = document.getElementById('iconSoundOn');
    var iconOff = document.getElementById('iconSoundOff');
    var hero = document.querySelector('.hero-title-card');

    function revealTitle() {
        if (hero) hero.classList.add('hero-revealed');
    }

    function updateIcon() {
        if (!iconOn || !iconOff) return;
        var isMuted = video.muted || video.volume === 0;
        iconOn.style.display = isMuted ? 'none' : 'block';
        iconOff.style.display = isMuted ? 'block' : 'none';
    }

    if (video) {
        video.addEventListener('error', revealTitle);
        setTimeout(revealTitle, 2500);

        video.volume = 0.25;
        video.muted = false;
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
            playPromise.catch(function() {
                video.muted = true;
                video.play();
                updateIcon();
            });
        }

        if (muteBtn) {
            muteBtn.classList.remove('hidden');
            updateIcon();
            muteBtn.addEventListener('click', function() {
                video.muted = !video.muted;
                if (!video.muted) video.volume = 0.25;
                updateIcon();
            });
        }
    } else {
        revealTitle();
    }
})();

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
            var t = document.querySelector(this.getAttribute('href'));
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
    var nav = document.getElementById('nsNav');
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

    var heroObs = new IntersectionObserver(function(entries) {
        pastHero = !entries[0].isIntersecting;
        updateSticky();
    }, { threshold: 0 });
    heroObs.observe(hero);

    var buyObs = new IntersectionObserver(function(entries) {
        inBuySection = entries[0].isIntersecting;
        updateSticky();
    }, { threshold: 0.15 });
    buyObs.observe(buySection);
})();
</script>
</body>
</html>
