<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Neo Sabang — Reimagining Indonesia's Culinary Street</title>
    <meta name="description" content="Neo Sabang: We're turning one street into Indonesia's culinary destination. The blueprint is here.">
    <meta property="og:title" content="Neo Sabang — Blueprint E-Book">
    <meta property="og:description" content="One Street. Thousands of Stories. One crazy idea worth building.">
    <meta property="og:image" content="<?= BASE_URL ?>/public/images/neosabang-cover.jpg">
    <link rel="icon" type="image/jpeg" href="/public/images/tis-logo-circle.jpeg">
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

        html { scroll-behavior: smooth; }
        body {
            background: #000;
            color: var(--text);
            font-family: 'Inter', system-ui, sans-serif;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
        }

        /* ===== INTRO VIDEO (hero background) ===== */
        .hero-video-bg {
            position: absolute; inset: 0;
            width: 100%; height: 100%;
            z-index: 0;
            overflow: hidden;
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
            background: var(--blueprint);
            display: flex; align-items: center; justify-content: center;
            flex-direction: column;
            position: relative;
            z-index: 10;
            padding: 60px 24px;
            overflow: hidden;
        }

        .hero-title-card .title-block,
        .hero-title-card .title-extras,
        .hero-title-card .title-scroll {
            position: relative;
            z-index: 2;
        }

        .hero-revealed .title-presents,
        .hero-revealed .title-neo,
        .hero-revealed .title-neo::after,
        .hero-revealed .title-extras,
        .hero-revealed .title-scroll {
            animation-play-state: running;
        }

        .title-block {
            text-align: center;
        }

        .title-presents {
            font-family: 'Sora', sans-serif;
            font-size: clamp(14px, 2.5vw, 22px);
            color: #fff;
            letter-spacing: 0.02em;
            opacity: 0;
            transform: translateY(20px);
            animation: slideUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.3s forwards;
            animation-play-state: paused;
        }
        .title-presents strong { font-weight: 800; }
        .title-presents span { font-weight: 400; color: rgba(255,255,255,0.65); }

        .title-neo {
            font-family: 'Cinzel', serif;
            font-size: clamp(70px, 18vw, 190px);
            font-weight: 900;
            color: #fff;
            letter-spacing: 0.05em;
            line-height: 1;
            margin-top: 12px;
            opacity: 0;
            transform: translateY(30px);
            animation: slideUp 1s cubic-bezier(0.22,1,0.36,1) 0.9s forwards;
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
            animation: lineGrow 0.8s cubic-bezier(0.22,1,0.36,1) 1.5s forwards;
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
            margin-top: 28px;
            text-align: center;
            opacity: 0;
            transform: translateY(20px);
            animation: slideUp 1s cubic-bezier(0.22,1,0.36,1) 2.4s forwards;
            animation-play-state: paused;
        }
        .title-badge {
            display: inline-block;
            font-family: 'Cinzel', serif;
            font-size: clamp(18px, 3vw, 28px); font-weight: 700;
            color: #fff;
            letter-spacing: 0.35em;
            text-transform: uppercase;
        }
        .title-subtitle {
            font-family: 'Cinzel', serif;
            font-size: clamp(14px, 2vw, 19px);
            color: rgba(255,255,255,0.75);
            font-weight: 600;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            margin-top: 22px;
        }
        .title-tagline {
            font-family: 'Inter', sans-serif;
            font-size: clamp(17px, 2.4vw, 22px);
            color: rgba(255,255,255,0.6);
            line-height: 1.8;
            margin-top: 24px;
            max-width: 640px;
            margin-left: auto; margin-right: auto;
            font-weight: 400;
        }

        .title-scroll {
            margin-top: 48px;
            display: flex; flex-direction: column; align-items: center; gap: 8px;
            color: #fff;
            font-family: 'Cinzel', serif;
            font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase;
            font-weight: 700;
            opacity: 0;
            animation: slideUp 0.8s cubic-bezier(0.22,1,0.36,1) 3.2s forwards;
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

        section { position: relative; z-index: 5; }

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

        .pillar-card {
            background: rgba(255,255,255,0.02);
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 4px;
            padding: 32px;
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
            font-size: 48px; font-weight: 800;
            color: rgba(201,168,76,0.1);
            line-height: 1;
            margin-bottom: 12px;
        }
        .pillar-title {
            font-family: 'Cinzel', serif;
            font-size: 20px; font-weight: 700;
            color: white;
            letter-spacing: 0.05em;
            margin-bottom: 12px;
        }
        .pillar-desc {
            font-size: 16px;
            color: var(--text-dim);
            line-height: 1.6;
        }

        .timeline-item {
            display: flex; gap: 24px;
            padding: 24px 0;
            border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .timeline-content p {
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
            background: linear-gradient(135deg, rgba(201,168,76,0.05) 0%, rgba(255,255,255,0.02) 100%);
            border: 1px solid rgba(201,168,76,0.2);
            border-radius: 8px;
            padding: 48px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
            max-width: 480px;
            margin: 0 auto;
        }
        .pricing-card::before {
            content: '';
            position: absolute; top: 0; left: 0; right: 0; height: 2px;
            background: linear-gradient(90deg, transparent, var(--gold), transparent);
        }
        .pricing-card::after {
            content: '';
            position: absolute;
            top: -50%; right: -50%;
            width: 200%; height: 200%;
            background: radial-gradient(circle, rgba(201,168,76,0.03) 0%, transparent 50%);
            pointer-events: none;
        }
        .price-badge {
            display: inline-block;
            font-family: 'Cinzel', serif;
            font-size: 11px; font-weight: 700;
            color: #0a0a0a;
            background: var(--gold);
            padding: 6px 20px;
            letter-spacing: 0.3em;
            text-transform: uppercase;
            margin-bottom: 24px;
        }
        .price-original {
            font-size: 20px;
            color: var(--text-dim);
            text-decoration: line-through;
            font-weight: 400;
        }
        .price-current {
            font-family: 'Cinzel', serif;
            font-size: clamp(40px, 8vw, 56px);
            font-weight: 800;
            color: white;
            line-height: 1;
            margin: 16px 0 4px;
        }
        .price-current span { color: var(--gold); }
        .price-note {
            font-size: 15px;
            color: var(--text-dim);
            margin-bottom: 28px;
        }
        .cta-btn {
            display: inline-flex; align-items: center; justify-content: center; gap: 10px;
            width: 100%;
            padding: 18px 32px;
            background: var(--gold);
            color: #0a0a0a;
            font-family: 'Cinzel', serif;
            font-size: 15px; font-weight: 700;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            text-decoration: none;
            border: none; cursor: pointer;
            transition: all 0.4s ease;
            border-radius: 4px;
        }
        .cta-btn:hover {
            background: var(--gold-light);
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(201,168,76,0.3);
        }
        .cta-btn:active { transform: translateY(0); }
        .price-guarantee {
            display: flex; align-items: center; justify-content: center; gap: 8px;
            margin-top: 16px;
            font-size: 13px;
            color: var(--text-dim);
        }

        .feature-list {
            list-style: none; padding: 0;
            text-align: left;
            margin-bottom: 28px;
        }
        .feature-list li {
            display: flex; align-items: flex-start; gap: 12px;
            padding: 10px 0;
            font-size: 16px;
            color: var(--text);
            border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .feature-list li:last-child { border-bottom: none; }
        .feature-list .check {
            flex-shrink: 0;
            width: 20px; height: 20px;
            border-radius: 50%;
            background: rgba(201,168,76,0.15);
            display: flex; align-items: center; justify-content: center;
            margin-top: 1px;
        }
        .feature-list .check svg {
            width: 12px; height: 12px;
            color: var(--gold);
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

        .compass {
            width: 60px; height: 60px;
            border: 1px solid rgba(201,168,76,0.2);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            animation: compassSpin 30s linear infinite;
            margin: 0 auto;
        }
        @keyframes compassSpin { to { transform: rotate(360deg); } }
        .compass svg { width: 28px; height: 28px; color: var(--gold); animation: compassSpin 30s linear infinite reverse; }

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

<!-- ===== HERO TITLE CARD (video background) ===== -->
<div class="hero-title-card">
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

    <div class="title-block">
        <div class="title-presents">
            <strong>The Innovators Studio</strong> <span>presents</span>
        </div>
        <div class="title-neo">NEO SABANG</div>
    </div>

    <div class="title-extras">
        <div class="title-badge">Blueprint</div>
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

    <!-- ===== INTRO / SUBTITLE ===== -->
    <section style="padding: 100px 24px 60px;">
        <div style="max-width: 800px; margin: 0 auto; text-align: center;">
            <div class="reveal-up section-label">Reimagining Indonesia's Culinary Street</div>
            <p class="reveal-up d1 big-quote" style="margin-top: 24px; font-size: clamp(22px, 3.5vw, 38px);">
                One street. All of Indonesia. <em>One long table.</em>
            </p>
        </div>
    </section>

    <div class="section-divider">
        <div class="line"></div><div class="diamond"></div><div class="line"></div>
    </div>

    <!-- ===== THE TEAM ===== -->
    <section style="padding: 0 24px 80px;">
        <div style="max-width: 800px; margin: 0 auto;">
            <div class="reveal-up big-quote">
                "<em>IT. Business. Design.</em><br>
                <em>Accounting. Brand CEOs. Politics.</em><br>
                <em>One team, one blueprint.</em>"
            </div>
            <p class="reveal-up d1 section-heading" style="text-align: center; margin-top: 32px; font-size: clamp(20px, 3vw, 32px); max-width: 700px; margin-left: auto; margin-right: auto;">
                Prepare Rp30.000. This wasn't built by one person guessing.
            </p>
        </div>
    </section>

    <div class="section-divider">
        <div class="line"></div><div class="diamond"></div><div class="line"></div>
    </div>

    <!-- ===== WHAT'S INSIDE ===== -->
    <section style="padding: 80px 24px;">
        <div style="max-width: 1100px; margin: 0 auto;">
            <div class="reveal-up" style="text-align: center; margin-bottom: 56px;">
                <div class="section-label">What's Inside</div>
                <h2 class="section-heading">Not just ideas. A real blueprint.</h2>
            </div>

            <div class="pillar-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
                <?php
                $chapters = [
                    ['num' => 'I', 'title' => 'The Problem', 'desc' => 'Three layers keep Sabang from working: space, operations, experience.'],
                    ['num' => 'II', 'title' => 'The Long Indonesian Table', 'desc' => 'One street. All of Indonesia. Sit down anywhere.'],
                    ['num' => 'III', 'title' => 'Rhythm & Pause', 'desc' => 'Every step, every pause, designed on purpose.'],
                    ['num' => 'IV', 'title' => 'Jagat Rasa', 'desc' => 'An annual culinary competition that keeps it alive, year after year.'],
                    ['num' => 'V', 'title' => 'The Business Case', 'desc' => 'The math behind Neo Sabang, done honestly.'],
                ];
                foreach($chapters as $i => $c): ?>
                <div class="reveal-up d<?= $i+1 ?> pillar-card">
                    <div class="pillar-num"><?= $c['num'] ?></div>
                    <div class="pillar-title"><?= $c['title'] ?></div>
                    <div class="pillar-desc"><?= $c['desc'] ?></div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <div class="section-divider">
        <div class="line"></div><div class="diamond"></div><div class="line"></div>
    </div>

    <!-- ===== WHY YOU SHOULD BUY ===== -->
    <section style="padding: 80px 24px;">
        <div style="max-width: 750px; margin: 0 auto; text-align: center;">
            <div class="reveal-up">
                <div class="section-label">Why This Blueprint</div>
                <h2 class="section-heading" style="margin-bottom: 56px;">Why you should buy it.</h2>
            </div>

            <?php
            $reasons = [
                'Not a finished pitch deck. The real thinking, hypotheses and all.',
                'Real research, real numbers. Not just theory.',
                'First 81 buyers only. Then it\'s gone.',
            ];
            foreach($reasons as $i => $r): ?>
            <div class="reveal-up d<?= $i+1 ?> big-quote" style="font-size: clamp(20px, 3vw, 30px); margin-bottom: 28px;">
                <?= $r ?>
            </div>
            <?php endforeach; ?>
        </div>
    </section>

    <div class="section-divider">
        <div class="line"></div><div class="diamond"></div><div class="line"></div>
    </div>

    <!-- ===== CONVICTION ===== -->
    <section style="padding: 80px 24px;">
        <div style="max-width: 700px; margin: 0 auto; text-align: center;">
            <div class="reveal-up">
                <div class="compass">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z"/></svg>
                </div>
            </div>

            <div class="reveal-up d1" style="margin-top: 40px;">
                <div class="big-quote" style="font-size: clamp(20px, 3.5vw, 36px);">
                    You're not buying an e-book.<br>
                    You're buying <em>the thinking</em><br>
                    that turns one street into<br>
                    <em>a world-class destination.</em>
                </div>
            </div>

            <p class="reveal-up d2" style="color: var(--text-dim); margin-top: 32px; font-size: 17px; line-height: 1.7;">
                Built from real research. Ready to execute.
            </p>

            <div class="reveal-up d3" style="margin-top: 40px; display: flex; justify-content: center; gap: 40px; flex-wrap: wrap;">
                <div style="text-align: center;">
                    <div style="font-family: 'Cinzel', serif; font-size: 36px; font-weight: 800; color: var(--gold);">45+</div>
                    <div style="font-size: 12px; color: var(--text-dim); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px;">Pages</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-family: 'Cinzel', serif; font-size: 36px; font-weight: 800; color: var(--gold);">13</div>
                    <div style="font-size: 12px; color: var(--text-dim); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px;">Chapters</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-family: 'Cinzel', serif; font-size: 36px; font-weight: 800; color: var(--gold);">1</div>
                    <div style="font-size: 12px; color: var(--text-dim); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px;">Big Idea</div>
                </div>
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
                            The full vision: concept, framework & story
                        </li>
                        <li>
                            <div class="check"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></div>
                            A presentation-ready visual masterplan
                        </li>
                        <li>
                            <div class="check"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></div>
                            The business case, numbers and all
                        </li>
                        <li>
                            <div class="check"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></div>
                            Honest hypotheses & open data, laid bare
                        </li>
                        <li>
                            <div class="check"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></div>
                            45+ pages of real research and design
                        </li>
                    </ul>

                    <div class="price-current"><span>Rp</span> 30.000</div>
                    <div class="price-note">Early bird price, limited to first 81 buyers</div>

                    <a href="https://theinnovatorsstudio.myr.id/pl/neo-sabang" id="checkoutBtn" class="cta-btn" target="_blank">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
                        Get The Blueprint
                    </a>

                    <div class="price-guarantee">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                        Instant download · PDF format
                    </div>
                </div>
            </div>
        </div>
    </section>

    <div class="ns-footer">
        <a href="/">← The Innovators Studio</a>
        <p>&copy; <?= date('Y') ?> The Innovators Studio. All rights reserved.</p>
    </div>
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
            if (t) window.scrollTo({ top: t.offsetTop - 40, behavior: 'smooth' });
        });
    });
})();
</script>
</body>
</html>
