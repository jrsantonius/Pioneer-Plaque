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
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
            --blueprint: #0d2847;
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
            background: var(--blueprint);
            color: var(--text);
            font-family: 'Inter', system-ui, sans-serif;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
        }

        /* ===== CUSTOM SCROLLBAR ===== */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: var(--blueprint); }
        ::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 2px; }

        /* ===== LOADING / INTRO CINEMATIC ===== */
        .cinematic-intro {
            position: fixed; inset: 0;
            background: #000;
            z-index: 10000;
            display: flex; align-items: center; justify-content: center;
            flex-direction: column;
            transition: opacity 1.2s ease, visibility 1.2s ease;
        }
        .cinematic-intro.done { opacity: 0; visibility: hidden; pointer-events: none; }
        .intro-text {
            font-family: 'Cinzel', serif;
            font-size: clamp(12px, 2vw, 16px);
            color: var(--gold);
            letter-spacing: 0.5em;
            text-transform: uppercase;
            opacity: 0;
            animation: introFade 2s ease 0.5s forwards;
        }
        .intro-title {
            font-family: 'Cinzel', serif;
            font-size: clamp(32px, 8vw, 72px);
            font-weight: 800;
            color: white;
            letter-spacing: 0.15em;
            margin-top: 12px;
            opacity: 0;
            animation: introFade 2s ease 1s forwards;
        }
        .intro-line {
            width: 80px; height: 1px;
            background: var(--gold);
            margin-top: 20px;
            opacity: 0;
            animation: introFade 1.5s ease 1.8s forwards, introExpand 1.5s ease 1.8s forwards;
        }
        @keyframes introFade { to { opacity: 1; } }
        @keyframes introExpand { to { width: 160px; } }

        /* ===== BLUEPRINT GRID ===== */
        .blueprint-grid {
            position: fixed; inset: 0;
            background-image:
                linear-gradient(var(--blueprint-line) 1px, transparent 1px),
                linear-gradient(90deg, var(--blueprint-line) 1px, transparent 1px);
            background-size: 60px 60px;
            pointer-events: none;
            z-index: 1;
            opacity: 0.5;
        }

        /* ===== AMBIENT PARTICLES ===== */
        .particle {
            position: fixed;
            width: 2px; height: 2px;
            background: var(--gold);
            border-radius: 50%;
            pointer-events: none;
            z-index: 2;
            opacity: 0;
            animation: particleFloat 8s ease-in-out infinite;
        }
        @keyframes particleFloat {
            0%, 100% { opacity: 0; transform: translateY(0) scale(1); }
            10% { opacity: 0.6; }
            90% { opacity: 0.6; }
            50% { transform: translateY(-100px) scale(1.5); }
        }

        /* ===== SCROLL PROGRESS ===== */
        .scroll-line {
            position: fixed; top: 0; left: 0;
            height: 2px; width: 0%;
            background: linear-gradient(90deg, var(--gold), var(--gold-light));
            z-index: 9999;
        }

        /* ===== SECTION STYLES ===== */
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

        /* ===== HERO ===== */
        .hero {
            min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
            position: relative;
            overflow: hidden;
        }
        .hero-cover {
            position: absolute; inset: 0;
            z-index: 0;
        }
        .hero-cover img {
            width: 100%; height: 100%;
            object-fit: cover;
            opacity: 0.25;
            filter: blur(2px);
            transform: scale(1.1);
            animation: heroZoom 20s ease-in-out infinite alternate;
        }
        @keyframes heroZoom {
            0% { transform: scale(1.1); }
            100% { transform: scale(1.2); }
        }
        .hero-cover::after {
            content: '';
            position: absolute; inset: 0;
            background: linear-gradient(180deg,
                rgba(13,40,71,0.6) 0%,
                rgba(13,40,71,0.3) 40%,
                rgba(13,40,71,0.8) 80%,
                var(--blueprint) 100%
            );
        }
        .hero-content {
            position: relative; z-index: 2;
            text-align: center;
            padding: 0 24px;
            max-width: 800px;
        }
        .hero-badge {
            display: inline-flex; align-items: center; gap: 8px;
            font-family: 'Cinzel', serif;
            font-size: 11px; font-weight: 600;
            color: var(--gold);
            letter-spacing: 0.4em;
            text-transform: uppercase;
            border: 1px solid var(--gold-dim);
            padding: 8px 20px;
            margin-bottom: 32px;
        }
        .hero-badge::before, .hero-badge::after {
            content: ''; width: 20px; height: 1px; background: var(--gold);
        }
        .hero h1 {
            font-family: 'Cinzel', serif;
            font-size: clamp(48px, 10vw, 100px);
            font-weight: 800;
            color: white;
            line-height: 1;
            letter-spacing: 0.08em;
            text-shadow: 0 4px 60px rgba(0,0,0,0.5);
        }
        .hero-subtitle {
            font-family: 'Cinzel', serif;
            font-size: clamp(13px, 2vw, 18px);
            color: var(--text-dim);
            letter-spacing: 0.3em;
            text-transform: uppercase;
            margin-top: 16px;
        }
        .hero-tagline {
            font-size: 16px;
            color: var(--text-dim);
            line-height: 1.8;
            margin-top: 32px;
            max-width: 550px;
            margin-left: auto; margin-right: auto;
            font-weight: 300;
        }
        .hero-scroll {
            margin-top: 48px;
            display: flex; flex-direction: column; align-items: center; gap: 8px;
            color: var(--gold);
            font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase;
            font-weight: 600;
            animation: heroScrollPulse 2s ease-in-out infinite;
        }
        .hero-scroll svg { animation: heroScrollBounce 2s ease-in-out infinite; }
        @keyframes heroScrollPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes heroScrollBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }

        /* ===== DIVIDER ===== */
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

        /* ===== QUOTE SECTION ===== */
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

        /* ===== HEADING STYLE ===== */
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

        /* ===== PILLAR CARDS ===== */
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
            font-size: 14px;
            color: var(--text-dim);
            line-height: 1.7;
        }

        /* ===== EXPERIENCE TIMELINE ===== */
        .timeline-item {
            display: flex; gap: 24px;
            padding: 24px 0;
            border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .timeline-time {
            font-family: 'Cinzel', serif;
            font-size: 14px; font-weight: 700;
            color: var(--gold);
            letter-spacing: 0.1em;
            min-width: 100px;
            padding-top: 2px;
        }
        .timeline-content h4 {
            font-size: 16px; font-weight: 600;
            color: white;
            margin-bottom: 6px;
        }
        .timeline-content p {
            font-size: 14px;
            color: var(--text-dim);
            line-height: 1.6;
        }

        /* ===== COVER SHOWCASE ===== */
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

        /* ===== PRICING ===== */
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
            margin: 8px 0 4px;
        }
        .price-current span { color: var(--gold); }
        .price-note {
            font-size: 13px;
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
            font-size: 12px;
            color: var(--text-dim);
        }

        /* ===== FEATURES LIST ===== */
        .feature-list {
            list-style: none; padding: 0;
            text-align: left;
            margin-bottom: 28px;
        }
        .feature-list li {
            display: flex; align-items: flex-start; gap: 12px;
            padding: 10px 0;
            font-size: 14px;
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

        /* ===== FOOTER ===== */
        .ns-footer {
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

        /* ===== COMPASS ANIMATION ===== */
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

        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
            .pillar-grid { grid-template-columns: 1fr !important; }
            .pricing-card { padding: 36px 24px; }
            .timeline-item { flex-direction: column; gap: 8px; }
            .timeline-time { min-width: auto; }
        }
    </style>
</head>
<body>

<!-- ===== CINEMATIC INTRO ===== -->
<div id="cinematic" class="cinematic-intro">
    <div class="intro-text">The Innovators Studio Presents</div>
    <div class="intro-title">NEO SABANG</div>
    <div class="intro-line"></div>
</div>

<!-- ===== BLUEPRINT GRID ===== -->
<div class="blueprint-grid"></div>

<!-- ===== SCROLL PROGRESS ===== -->
<div class="scroll-line" id="scrollLine"></div>

<!-- ===== AMBIENT PARTICLES ===== -->
<?php for($i=0; $i<15; $i++): ?>
<div class="particle" style="
    left: <?= rand(5,95) ?>%;
    top: <?= rand(10,90) ?>%;
    animation-delay: <?= $i * 0.5 ?>s;
    animation-duration: <?= rand(6,12) ?>s;
    width: <?= rand(1,3) ?>px;
    height: <?= rand(1,3) ?>px;
"></div>
<?php endfor; ?>

<!-- ===== HERO ===== -->
<section class="hero">
    <div class="hero-cover">
        <img src="/public/images/neosabang-cover.jpg" alt="Neo Sabang Blueprint">
    </div>
    <div class="hero-content">
        <div class="reveal-up">
            <div class="hero-badge">E-Book Blueprint</div>
        </div>
        <h1 class="reveal-up d1">NEO<br>SABANG</h1>
        <div class="reveal-up d2 hero-subtitle">Reimagining Indonesia's Culinary Street</div>
        <p class="reveal-up d3 hero-tagline">
            We had a crazy idea: turn one street in Jakarta into a world-class culinary destination.
            Then we built the blueprint. Now it's yours.
        </p>
        <div class="reveal-up d4 hero-scroll">
            <span>Scroll to Explore</span>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
        </div>
    </div>
</section>

<!-- ===== DIVIDER ===== -->
<div class="section-divider">
    <div class="line"></div><div class="diamond"></div><div class="line"></div>
</div>

<!-- ===== THE BIG IDEA ===== -->
<section style="padding: 40px 24px 80px;">
    <div style="max-width: 800px; margin: 0 auto;">
        <div class="reveal-up big-quote">
            "<em>One Street.</em><br>
            <em>Thousands of Stories.</em><br>
            <em>One crazy idea.</em>"
        </div>
        <p class="reveal-up d1" style="text-align: center; color: var(--text-dim); margin-top: 32px; line-height: 1.8; font-size: 15px; max-width: 600px; margin-left: auto; margin-right: auto;">
            Indonesia doesn't need another food court. It needs a culinary destination that actually matters.
            This blueprint is how we build it.
        </p>
    </div>
</section>

<!-- ===== DIVIDER ===== -->
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
                ['num' => 'I', 'title' => 'The Big Idea', 'desc' => 'Why this isn\'t just another revitalisasi. It\'s a movement — built from culture, food, and real stories.'],
                ['num' => 'II', 'title' => 'The Framework', 'desc' => 'Five pillars that connect culinary, experience, community, innovation, and sustainability into one ecosystem.'],
                ['num' => 'III', 'title' => 'The Masterplan', 'desc' => 'Zonasi, desain ruang publik, visual blueprint — ready to present to anyone who needs convincing.'],
                ['num' => 'IV', 'title' => 'The Business Model', 'desc' => 'Numbers that make sense. Revenue strategy, economic impact, and why this is an investment — not an expense.'],
                ['num' => 'V', 'title' => 'The Roadmap', 'desc' => 'From pilot to full scale. Step by step. Actionable, measurable, and built to actually ship.'],
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

<!-- ===== DIVIDER ===== -->
<div class="section-divider">
    <div class="line"></div><div class="diamond"></div><div class="line"></div>
</div>

<!-- ===== WHO IS THIS FOR ===== -->
<section style="padding: 80px 24px;">
    <div style="max-width: 700px; margin: 0 auto; text-align: center;">
        <div class="reveal-up">
            <div class="section-label">Built For Builders</div>
            <h2 class="section-heading" style="margin-bottom: 40px;">This is for you if you...</h2>
        </div>

        <?php
        $personas = [
            ['icon' => '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>', 'text' => 'Want to see how a culinary destination gets designed from scratch'],
            ['icon' => '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>', 'text' => 'Are building a proposal for urban revitalization or a food district'],
            ['icon' => '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>', 'text' => 'Obsessed with the intersection of food, culture, and urban design'],
            ['icon' => '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>', 'text' => 'Are in F&B and want to see the bigger picture of where the industry is going'],
        ];
        foreach($personas as $i => $p): ?>
        <div class="reveal-up d<?= $i+1 ?> timeline-item" style="text-align: left;">
            <div style="flex-shrink: 0; color: var(--gold); margin-top: 2px;"><?= $p['icon'] ?></div>
            <div class="timeline-content">
                <p style="color: var(--text); font-size: 15px; font-weight: 400;"><?= $p['text'] ?></p>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</section>

<!-- ===== DIVIDER ===== -->
<div class="section-divider">
    <div class="line"></div><div class="diamond"></div><div class="line"></div>
</div>

<!-- ===== SOCIAL PROOF / URGENCY ===== -->
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

        <p class="reveal-up d2" style="color: var(--text-dim); margin-top: 32px; font-size: 14px; line-height: 1.8;">
            Built from real research, international benchmarks, and hands-on experience
            designing creative projects in Indonesia. Not theory — this is a blueprint built to ship.
        </p>

        <div class="reveal-up d3" style="margin-top: 40px; display: flex; justify-content: center; gap: 40px; flex-wrap: wrap;">
            <div style="text-align: center;">
                <div style="font-family: 'Cinzel', serif; font-size: 36px; font-weight: 800; color: var(--gold);">50+</div>
                <div style="font-size: 12px; color: var(--text-dim); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px;">Pages</div>
            </div>
            <div style="text-align: center;">
                <div style="font-family: 'Cinzel', serif; font-size: 36px; font-weight: 800; color: var(--gold);">5</div>
                <div style="font-size: 12px; color: var(--text-dim); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px;">Strategic Pillars</div>
            </div>
            <div style="text-align: center;">
                <div style="font-family: 'Cinzel', serif; font-size: 36px; font-weight: 800; color: var(--gold);">1</div>
                <div style="font-size: 12px; color: var(--text-dim); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px;">Big Idea</div>
            </div>
        </div>
    </div>
</section>

<!-- ===== DIVIDER ===== -->
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
            <!-- Cover -->
            <div class="reveal-scale cover-showcase">
                <img src="/public/images/neosabang-cover.jpg" alt="Neo Sabang E-Book Cover">
                <div class="cover-glow"></div>
            </div>

            <!-- Pricing Card -->
            <div class="reveal-up d2 pricing-card">
                <div class="price-badge">Limited Offer</div>

                <ul class="feature-list">
                    <li>
                        <div class="check"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></div>
                        Full vision, concept & strategic framework
                    </li>
                    <li>
                        <div class="check"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></div>
                        Presentation-ready visual masterplan
                    </li>
                    <li>
                        <div class="check"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></div>
                        Business model & economic impact analysis
                    </li>
                    <li>
                        <div class="check"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></div>
                        Step-by-step execution roadmap
                    </li>
                    <li>
                        <div class="check"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></div>
                        50+ pages of high-quality research & design
                    </li>
                </ul>

                <div class="price-original">Rp 100.000</div>
                <div class="price-current"><span>Rp</span> 30.000</div>
                <div class="price-note">Early bird price — limited to first 100 buyers</div>

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

<!-- ===== FOOTER ===== -->
<div class="ns-footer">
    <a href="/">← The Innovators Studio</a>
    <p>&copy; <?= date('Y') ?> The Innovators Studio. All rights reserved.</p>
</div>

<!-- ===== RESPONSIVE GRID ===== -->
<style>
@media (min-width: 768px) {
    .lg-grid-pricing {
        grid-template-columns: 1fr 1fr !important;
    }
}
</style>

<!-- ===== SCRIPTS ===== -->
<script>
(function() {
    // Cinematic intro
    const cinematic = document.getElementById('cinematic');
    setTimeout(() => { cinematic.classList.add('done'); }, 3500);

    // Scroll progress
    const scrollLine = document.getElementById('scrollLine');
    window.addEventListener('scroll', () => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        scrollLine.style.width = (window.scrollY / h * 100) + '%';
    });

    // Intersection Observer
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal-up, .reveal-scale').forEach(el => obs.observe(el));

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) {
            e.preventDefault();
            const t = document.querySelector(this.getAttribute('href'));
            if (t) window.scrollTo({ top: t.offsetTop - 40, behavior: 'smooth' });
        });
    });
})();
</script>
</body>
</html>
