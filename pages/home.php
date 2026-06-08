<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Innovators Studio - Designers. Makers. Storytellers.</title>
    <meta name="description" content="We turn ideas into impact. The Innovators Studio is a creative studio obsessed with turning crazy ideas into things people actually want.">
    <meta property="og:title" content="The Innovators Studio">
    <meta property="og:description" content="Designers. Makers. Storytellers. Obsessed with turning crazy ideas into things people actually want.">
    <meta property="og:image" content="<?= BASE_URL ?>/public/images/hero-team.png">
    <meta property="og:url" content="<?= BASE_URL ?>">
    <link rel="icon" type="image/jpeg" href="/public/images/tis-logo-circle.jpeg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=General+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
    tailwind.config = {
        theme: {
            extend: {
                fontFamily: {
                    'sans': ['"General Sans"', 'system-ui', 'sans-serif'],
                    'display': ['Sora', 'system-ui', 'sans-serif'],
                }
            }
        }
    }
    </script>
    <style>
        html { scroll-behavior: smooth; }
        body { font-family: 'General Sans', system-ui, sans-serif; letter-spacing: -0.01em; }
        h1, h2, h3, .font-display { font-family: 'Sora', system-ui, sans-serif; letter-spacing: -0.03em; }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d4d4d4; border-radius: 2px; }

        /* ===== ANIMATIONS ===== */
        .reveal { opacity: 0; transform: translateY(50px); transition: all 1s cubic-bezier(0.22, 1, 0.36, 1); }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-left { opacity: 0; transform: translateX(-60px); transition: all 1s cubic-bezier(0.22, 1, 0.36, 1); }
        .reveal-left.visible { opacity: 1; transform: translateX(0); }
        .reveal-right { opacity: 0; transform: translateX(60px); transition: all 1s cubic-bezier(0.22, 1, 0.36, 1); }
        .reveal-right.visible { opacity: 1; transform: translateX(0); }
        .reveal-scale { opacity: 0; transform: scale(0.85); transition: all 1s cubic-bezier(0.22, 1, 0.36, 1); }
        .reveal-scale.visible { opacity: 1; transform: scale(1); }
        .d1 { transition-delay: 0.1s; } .d2 { transition-delay: 0.2s; }
        .d3 { transition-delay: 0.3s; } .d4 { transition-delay: 0.4s; }
        .d5 { transition-delay: 0.5s; } .d6 { transition-delay: 0.6s; }

        /* ===== HERO ===== */
        .hero-bg {
            background: #fafafa;
            position: relative;
            overflow: hidden;
        }
        #hero-canvas {
            position: absolute;
            top: 0; left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }

        /* ===== NAVBAR ===== */
        .nav-glass {
            backdrop-filter: blur(24px) saturate(180%);
            -webkit-backdrop-filter: blur(24px) saturate(180%);
            background: rgba(255,255,255,0.8);
            border-bottom: 1px solid rgba(0,0,0,0.04);
        }
        .nav-glass.scrolled { box-shadow: 0 4px 30px rgba(0,0,0,0.04); }

        /* ===== CARDS ===== */
        .glass-card {
            background: rgba(255,255,255,0.6);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.8);
            box-shadow: 0 4px 24px rgba(0,0,0,0.03);
            transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .glass-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 20px 50px rgba(0,0,0,0.06);
            border-color: rgba(124,58,237,0.15);
        }

        /* Process connector */
        .process-connector {
            position: relative;
        }
        .process-connector::after {
            content: '';
            position: absolute;
            top: 50%;
            right: -16px;
            width: 32px;
            height: 2px;
            background: linear-gradient(90deg, #d4d4d4, transparent);
        }
        .process-connector:last-child::after { display: none; }

        /* ===== GRADIENT TEXT ===== */
        .gradient-text {
            background: linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #7c3aed 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        /* ===== MARQUEE ===== */
        .marquee-track {
            display: flex;
            animation: marquee 30s linear infinite;
            width: max-content;
        }
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }

        /* ===== STATS COUNTER ===== */
        .stat-glow {
            position: relative;
        }
        .stat-glow::before {
            content: '';
            position: absolute;
            inset: -2px;
            border-radius: inherit;
            background: linear-gradient(135deg, rgba(124,58,237,0.08), transparent, rgba(124,58,237,0.08));
            z-index: -1;
        }

        /* ===== PARTNER CARD ===== */
        .partner-card {
            position: relative;
            overflow: hidden;
        }
        .partner-card::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.7) 100%);
            z-index: 1;
            opacity: 0;
            transition: opacity 0.4s ease;
        }
        .partner-card:hover::before { opacity: 1; }
        .partner-card .partner-info {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            padding: 24px;
            z-index: 2;
            transform: translateY(20px);
            opacity: 0;
            transition: all 0.4s ease;
        }
        .partner-card:hover .partner-info {
            transform: translateY(0);
            opacity: 1;
        }

        /* ===== CTA ===== */
        .cta-section {
            background: #0a0a0a;
            position: relative;
            overflow: hidden;
        }
        .cta-section::before {
            content: '';
            position: absolute;
            top: -30%;
            left: -10%;
            width: 50%;
            height: 160%;
            background: radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 65%);
            pointer-events: none;
        }
        .cta-section::after {
            content: '';
            position: absolute;
            bottom: -30%;
            right: -10%;
            width: 50%;
            height: 160%;
            background: radial-gradient(ellipse, rgba(168,85,247,0.07) 0%, transparent 65%);
            pointer-events: none;
        }

        /* ===== MOBILE MENU ===== */
        .mobile-menu { transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
        .mobile-menu.open { transform: translateX(0); }

        /* ===== PILL BADGE ===== */
        .pill {
            background: linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(168,85,247,0.04) 100%);
            border: 1px solid rgba(124,58,237,0.12);
        }

    </style>
</head>
<body class="bg-white text-neutral-800 antialiased overflow-x-hidden">

<!-- ============ NAVBAR ============ -->
<nav id="navbar" class="fixed top-0 left-0 right-0 z-50 nav-glass transition-all duration-500">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 lg:h-20">
            <a href="#" class="flex items-center gap-3 group">
                <img src="/public/images/tis-logo-circle.jpeg" alt="TIS" class="w-10 h-10 rounded-full object-cover ring-2 ring-neutral-100 group-hover:ring-purple-200 transition-all">
                <div class="hidden sm:block">
                    <span class="text-[13px] font-bold text-neutral-900 tracking-[0.15em] block leading-none">THE INNOVATORS</span>
                    <span class="text-[10px] font-medium text-neutral-600 tracking-[0.3em] block mt-0.5">STUDIO</span>
                </div>
            </a>
            <div class="hidden md:flex items-center gap-1">
                <a href="#about" class="px-4 py-2 text-[13px] text-neutral-500 hover:text-neutral-900 transition-colors font-medium rounded-full hover:bg-neutral-50">About</a>
                <a href="#process" class="px-4 py-2 text-[13px] text-neutral-500 hover:text-neutral-900 transition-colors font-medium rounded-full hover:bg-neutral-50">Process</a>
                <a href="#services" class="px-4 py-2 text-[13px] text-neutral-500 hover:text-neutral-900 transition-colors font-medium rounded-full hover:bg-neutral-50">Services</a>
                <a href="#work" class="px-4 py-2 text-[13px] text-neutral-500 hover:text-neutral-900 transition-colors font-medium rounded-full hover:bg-neutral-50">Work</a>
                <div class="w-px h-5 bg-neutral-200 mx-2"></div>
                <a href="#contact" class="ml-1 px-6 py-2.5 bg-neutral-900 text-white text-[13px] font-semibold rounded-full hover:bg-neutral-800 transition-all hover:shadow-lg hover:shadow-neutral-900/10 active:scale-95">Let's Talk</a>
            </div>
            <button class="md:hidden p-2" onclick="toggleMenu()">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
        </div>
    </div>
</nav>

<!-- Mobile Menu -->
<div id="mobileMenu" class="mobile-menu fixed inset-y-0 right-0 w-80 bg-white z-[60] shadow-2xl flex flex-col">
    <div class="p-6 flex justify-between items-center border-b border-neutral-100">
        <span class="text-sm font-bold tracking-widest text-neutral-900">MENU</span>
        <button onclick="toggleMenu()" class="p-2 hover:bg-neutral-50 rounded-full"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/></svg></button>
    </div>
    <div class="flex-1 p-6 flex flex-col gap-1">
        <a href="#about" onclick="toggleMenu()" class="px-4 py-3 text-lg font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-colors">About</a>
        <a href="#process" onclick="toggleMenu()" class="px-4 py-3 text-lg font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-colors">Process</a>
        <a href="#services" onclick="toggleMenu()" class="px-4 py-3 text-lg font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-colors">Services</a>
        <a href="#work" onclick="toggleMenu()" class="px-4 py-3 text-lg font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-colors">Work</a>
    </div>
    <div class="p-6 border-t border-neutral-100">
        <a href="#contact" onclick="toggleMenu()" class="block px-6 py-3.5 bg-neutral-900 text-white text-center font-semibold rounded-full">Let's Talk</a>
    </div>
</div>
<div id="menuOverlay" class="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] hidden" onclick="toggleMenu()"></div>

<!-- ============ HERO ============ -->
<section class="hero-bg min-h-screen flex items-center pt-20 relative">
    <canvas id="hero-canvas"></canvas>

    <div class="max-w-7xl mx-auto px-6 lg:px-8 w-full relative z-10 py-16 lg:py-0">
        <div class="max-w-3xl">
            <div class="space-y-8">
                <div class="reveal">
                    <span class="pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-purple-700 tracking-wide">
                        <span class="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>
                        CREATIVE STUDIO &mdash; JAKARTA, INDONESIA
                    </span>
                </div>

                <h1 class="reveal d1 font-display text-[clamp(2.5rem,6vw,5rem)] font-bold text-neutral-900 leading-[1.05] tracking-tight">
                    We turn<br>
                    <span class="gradient-text">crazy ideas</span> into<br>
                    things people want.
                </h1>

                <p class="reveal d2 text-lg sm:text-xl text-neutral-600 leading-relaxed max-w-lg font-light">
                    Designers. Makers. Storytellers. We don't just create content &mdash; we build products, ideas, and conversations that last.
                </p>

                <div class="reveal d3 flex flex-wrap gap-4 pt-2">
                    <a href="#contact" class="group px-8 py-4 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 transition-all hover:shadow-xl hover:shadow-neutral-900/15 active:scale-95 flex items-center gap-2">
                        Start a Project
                        <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                    </a>
                    <a href="#process" class="px-8 py-4 text-neutral-600 font-semibold rounded-full border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all active:scale-95">
                        See How We Work
                    </a>
                </div>
            </div>

        </div>

        <!-- Brand Marquee -->
        <div class="mt-20 lg:mt-28 reveal d4 border-t border-neutral-100 pt-10">
            <p class="text-[10px] font-semibold text-neutral-300 tracking-[0.3em] uppercase text-center mb-6">Trusted Collaborations</p>
            <div class="overflow-hidden">
                <div class="marquee-track">
                    <?php for($i=0; $i<2; $i++): ?>
                    <div class="flex items-center gap-16 px-8">
                        <span class="text-xl font-bold text-neutral-200 whitespace-nowrap tracking-wide">NUXCLE</span>
                        <span class="text-neutral-200">&bull;</span>
                        <span class="text-xl font-bold text-neutral-200 whitespace-nowrap tracking-wide">KEMENDIKTISAINTEK</span>
                        <span class="text-neutral-200">&bull;</span>
                        <span class="text-xl font-bold text-neutral-200 whitespace-nowrap tracking-wide">ODOO</span>
                        <span class="text-neutral-200">&bull;</span>
                        <span class="text-xl font-bold text-neutral-200 whitespace-nowrap tracking-wide">3D ZAIKU</span>
                        <span class="text-neutral-200">&bull;</span>
                    </div>
                    <?php endfor; ?>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- ============ ABOUT ============ -->
<section id="about" class="py-28 lg:py-36 bg-white relative">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div class="reveal-left relative">
                <div class="rounded-[2rem] overflow-hidden">
                    <img src="/public/images/about-workspace.png" alt="TIS Workspace" class="w-full h-auto">
                </div>
                <!-- Accent shape -->
                <div class="absolute -z-10 -bottom-6 -right-6 w-full h-full rounded-[2rem] bg-gradient-to-br from-purple-50 to-neutral-50"></div>
            </div>
            <div class="space-y-8">
                <div class="reveal">
                    <span class="pill inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold text-purple-700 tracking-wide">OUR STORY</span>
                </div>
                <h2 class="reveal d1 font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.1]">
                    Indonesia has enough creators.
                    <span class="text-neutral-300">Not enough builders.</span>
                </h2>
                <p class="reveal d2 text-lg sm:text-xl text-neutral-600 leading-relaxed font-light">
                    So we built. We're a creative studio that doesn't just make content &mdash; we build products, ideas, and conversations that last. Content is the byproduct of real work.
                </p>
            </div>
        </div>
    </div>
</section>

<!-- ============ PROCESS ============ -->
<section id="process" class="py-28 lg:py-36 bg-neutral-50/50 relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="max-w-xl mb-16">
            <span class="reveal pill inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold text-purple-700 tracking-wide mb-6">HOW WE WORK</span>
            <h2 class="reveal d1 font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.1]">
                Six steps from <span class="gradient-text">problem</span> to <span class="gradient-text">impact.</span>
            </h2>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
            <?php
            $steps = [
                ['num' => '01', 'title' => 'Research', 'desc' => 'Observe real problems & find insights', 'icon' => 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'],
                ['num' => '02', 'title' => 'Ideate', 'desc' => 'Brainstorm bold & crazy solutions', 'icon' => 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'],
                ['num' => '03', 'title' => 'Prototype', 'desc' => 'Build it, test it, make it real', 'icon' => 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'],
                ['num' => '04', 'title' => 'Story', 'desc' => 'Document the journey & tell it', 'icon' => 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'],
                ['num' => '05', 'title' => 'Publish', 'desc' => 'Share with the right audience', 'icon' => 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'],
                ['num' => '06', 'title' => 'Impact', 'desc' => 'Refine, produce & collaborate', 'icon' => 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'],
            ];
            foreach($steps as $i => $step): ?>
            <div class="reveal d<?= $i+1 ?> glass-card rounded-2xl p-7 lg:p-8 text-center group">
                <div class="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-neutral-50 to-white border border-neutral-100 flex items-center justify-center group-hover:from-purple-50 group-hover:border-purple-100 transition-all">
                    <svg class="w-6 h-6 text-neutral-600 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="<?= $step['icon'] ?>"/></svg>
                </div>
                <div class="text-xs font-bold text-purple-400 tracking-widest mb-1.5"><?= $step['num'] ?></div>
                <h3 class="text-base font-bold text-neutral-900 mb-1.5"><?= $step['title'] ?></h3>
                <p class="text-sm text-neutral-600 leading-relaxed"><?= $step['desc'] ?></p>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- ============ SERVICES ============ -->
<section id="services" class="py-28 lg:py-36 bg-white">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="grid lg:grid-cols-12 gap-16 items-start">
            <div class="lg:col-span-4 lg:sticky lg:top-28">
                <span class="reveal pill inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold text-purple-700 tracking-wide mb-6">WHAT WE DO</span>
                <h2 class="reveal d1 font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.1] mb-6">
                    From research to <span class="gradient-text">real impact.</span>
                </h2>
                <p class="reveal d2 text-lg text-neutral-600 leading-relaxed font-light">
                    We build products, create content, and tell stories that connect. Everything starts with a real problem.
                </p>
            </div>
            <div class="lg:col-span-8 grid sm:grid-cols-2 gap-5">
                <?php
                $services = [
                    ['title' => 'Research & Insight', 'desc' => 'We explore real problems, observe behaviors, and find insights that matter.', 'items' => ['Market Research', 'Behavior Analysis', 'Trend Mapping'], 'gradient' => 'from-purple-500/5 to-transparent'],
                    ['title' => 'Concept Development', 'desc' => 'We turn insights into bold ideas and concepts worth building.', 'items' => ['Brainstorming', 'Concept Design', 'Idea Validation'], 'gradient' => 'from-blue-500/5 to-transparent'],
                    ['title' => 'Product & Prototype', 'desc' => 'We build, test, and iterate until the product is real.', 'items' => ['Product Design', 'Physical / Digital Prototyping', 'Testing & Iteration'], 'gradient' => 'from-amber-500/5 to-transparent'],
                    ['title' => 'Content & Story', 'desc' => 'We produce content and stories that make people care.', 'items' => ['Video Production', 'Photography', 'Storytelling'], 'gradient' => 'from-rose-500/5 to-transparent'],
                    ['title' => 'Distribution', 'desc' => 'We share with the right audience and build conversations.', 'items' => ['Social Strategy', 'Community Building', 'Campaign Activation'], 'gradient' => 'from-emerald-500/5 to-transparent'],
                    ['title' => 'Partnership', 'desc' => 'We collaborate with brands and organizations to create real impact together.', 'items' => ['Brand Collab', 'Product Partnership', 'Co-Creation'], 'gradient' => 'from-purple-500/10 to-purple-500/3', 'highlight' => true],
                ];
                foreach($services as $i => $svc): ?>
                <div class="reveal d<?= ($i % 3) + 1 ?> rounded-2xl p-8 lg:p-9 border <?= !empty($svc['highlight']) ? 'bg-neutral-900 border-neutral-800' : 'bg-gradient-to-br ' . $svc['gradient'] . ' border-neutral-100 hover:border-purple-100' ?> transition-all group">
                    <h3 class="text-lg font-bold <?= !empty($svc['highlight']) ? 'text-white' : 'text-neutral-900' ?> mb-3"><?= $svc['title'] ?></h3>
                    <p class="text-sm <?= !empty($svc['highlight']) ? 'text-neutral-400' : 'text-neutral-600' ?> leading-relaxed mb-5"><?= $svc['desc'] ?></p>
                    <div class="space-y-2">
                        <?php foreach($svc['items'] as $item): ?>
                        <div class="flex items-center gap-2.5 text-sm <?= !empty($svc['highlight']) ? 'text-neutral-500' : 'text-neutral-600' ?>">
                            <div class="w-1.5 h-1.5 rounded-full <?= !empty($svc['highlight']) ? 'bg-purple-400' : 'bg-purple-400' ?>"></div>
                            <?= $item ?>
                        </div>
                        <?php endforeach; ?>
                    </div>
                    <?php if(!empty($svc['highlight'])): ?>
                    <a href="#contact" class="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                        Let's collaborate <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                    </a>
                    <?php endif; ?>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</section>

<!-- ============ WORK / PARTNERS ============ -->
<section id="work" class="py-28 lg:py-36 bg-neutral-50/50">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-16">
            <span class="reveal pill inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold text-purple-700 tracking-wide mb-6">SELECTED WORK</span>
            <h2 class="reveal d1 font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.1]">
                Ideas we brought to life.
            </h2>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <?php
            $partners = [
                ['name' => 'Nuxcle', 'type' => 'EV Product Innovation', 'img' => 'collab-kemendikti.png', 'link' => 'https://www.instagram.com/p/DXEcOR3pzk0/'],
                ['name' => 'Kemendiktisaintek', 'type' => 'Social Campaign', 'img' => 'collab-nuxcle.png', 'link' => 'https://www.instagram.com/p/DRM7Z3bEnBU/'],
                ['name' => 'Odoo', 'type' => 'CRM Automation', 'img' => 'collab-odoo.png', 'link' => 'https://www.instagram.com/p/DVa3dikEgy9/'],
                ['name' => '3D Zaiku', 'type' => 'Creative Technology', 'img' => 'collab-3dzaiku.png', 'link' => 'https://www.instagram.com/p/DQ4UxI8klcU/'],
            ];
            foreach($partners as $i => $p): ?>
            <a href="<?= $p['link'] ?>" target="_blank" class="reveal d<?= $i+1 ?> partner-card rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer group block">
                <img src="/public/images/<?= $p['img'] ?>" alt="<?= $p['name'] ?>" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                <div class="partner-info">
                    <h3 class="text-white font-bold text-lg"><?= $p['name'] ?></h3>
                    <p class="text-white/60 text-sm mt-0.5"><?= $p['type'] ?></p>
                </div>
            </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- ============ CTA ============ -->
<section id="contact" class="cta-section py-24 lg:py-36 relative">
    <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div class="space-y-8">
                <h2 class="reveal font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1]">
                    Let's build something
                    <span class="gradient-text">meaningful.</span>
                </h2>
                <p class="reveal d1 text-lg text-neutral-400 leading-relaxed max-w-md font-light">
                    We partner with brands and organizations to create ideas, stories, and experiences that connect and make an impact.
                </p>

                <div class="reveal d2 space-y-5 pt-4">
                    <a href="mailto:partnership@theinnovatorsstudio.id" class="flex items-center gap-4 group">
                        <div class="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-purple-600/20 group-hover:border-purple-500/30 transition-all">
                            <svg class="w-5 h-5 text-neutral-400 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        </div>
                        <div>
                            <div class="text-[10px] text-neutral-500 font-medium tracking-wider uppercase">Email</div>
                            <div class="text-sm font-semibold text-neutral-300 group-hover:text-white transition-colors">partnership@theinnovatorsstudio.id</div>
                        </div>
                    </a>
                    <a href="https://instagram.com/theinnovatorsstudio" target="_blank" class="flex items-center gap-4 group">
                        <div class="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-purple-600/20 group-hover:border-purple-500/30 transition-all">
                            <svg class="w-5 h-5 text-neutral-400 group-hover:text-purple-400 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                        </div>
                        <div>
                            <div class="text-[10px] text-neutral-500 font-medium tracking-wider uppercase">Instagram</div>
                            <div class="text-sm font-semibold text-neutral-300 group-hover:text-white transition-colors">@theinnovatorsstudio</div>
                        </div>
                    </a>
                    <a href="https://tiktok.com/@theinnovatorsstudio" target="_blank" class="flex items-center gap-4 group">
                        <div class="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-purple-600/20 group-hover:border-purple-500/30 transition-all">
                            <svg class="w-5 h-5 text-neutral-400 group-hover:text-purple-400 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.75a8.18 8.18 0 004.76 1.52V6.84a4.84 4.84 0 01-1-.15z"/></svg>
                        </div>
                        <div>
                            <div class="text-[10px] text-neutral-500 font-medium tracking-wider uppercase">TikTok</div>
                            <div class="text-sm font-semibold text-neutral-300 group-hover:text-white transition-colors">@theinnovatorsstudio</div>
                        </div>
                    </a>
                </div>

            </div>
            <!-- Right side: CTA Buttons -->
            <div class="reveal d3 flex flex-col gap-5">
                <a href="mailto:partnership@theinnovatorsstudio.id" class="group flex items-center justify-center gap-3 px-8 py-5 bg-white text-neutral-900 font-bold text-lg rounded-2xl hover:bg-neutral-100 transition-all active:scale-[0.98] shadow-lg shadow-white/10">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    Send Email
                </a>
                <a href="https://wa.me/6285156087265" target="_blank" class="group flex items-center justify-center gap-3 px-8 py-5 bg-[#25D366] text-white font-bold text-lg rounded-2xl hover:bg-[#20bd5a] transition-all active:scale-[0.98] shadow-lg shadow-[#25D366]/20">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Chat WhatsApp
                </a>
                <p class="text-sm text-neutral-500 text-center pt-2">Pick your preferred way to reach us.</p>
            </div>
        </div>
    </div>
</section>

<!-- ============ FOOTER ============ -->
<footer class="bg-[#050505] pt-16 pb-8">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <!-- Top -->
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-12 border-b border-neutral-800/50">
            <div class="flex items-center gap-4">
                <img src="/public/images/tis-logo-circle.jpeg" alt="TIS" class="w-12 h-12 rounded-full ring-2 ring-neutral-800">
                <div>
                    <div class="text-sm font-bold text-white tracking-wider">THE INNOVATORS STUDIO</div>
                    <div class="text-xs text-neutral-500 mt-0.5">Ideas. Stories. Impact.</div>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <a href="https://instagram.com/theinnovatorsstudio" target="_blank" class="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-purple-600/20 hover:border-purple-500/30 transition-all">
                    <svg class="w-4 h-4 text-neutral-500 hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://tiktok.com/@theinnovatorsstudio" target="_blank" class="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-purple-600/20 hover:border-purple-500/30 transition-all">
                    <svg class="w-4 h-4 text-neutral-500 hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.75a8.18 8.18 0 004.76 1.52V6.84a4.84 4.84 0 01-1-.15z"/></svg>
                </a>
            </div>
        </div>
        <!-- Bottom -->
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8">
            <p class="text-[11px] text-neutral-700">&copy; <?= date('Y') ?> The Innovators Studio. All rights reserved.</p>
            <a href="/login" class="text-[11px] text-neutral-500 hover:text-purple-400 transition-colors font-medium">Pioneer Members &rarr;</a>
        </div>
    </div>
</footer>

<!-- ============ SCRIPTS ============ -->
<script>
// Intersection Observer
const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => obs.observe(el));

// Navbar scroll
window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
});

// Mobile menu
function toggleMenu() {
    document.getElementById('mobileMenu').classList.toggle('open');
    document.getElementById('menuOverlay').classList.toggle('hidden');
    document.body.style.overflow = document.getElementById('mobileMenu').classList.contains('open') ? 'hidden' : '';
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
        e.preventDefault();
        const t = document.querySelector(this.getAttribute('href'));
        if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    });
});

// Hero canvas - interactive floating dots with mouse
(function() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];
    let mouse = { x: -9999, y: -9999 };
    const PARTICLE_COUNT = 50;
    const MAX_DIST = 160;
    const MOUSE_RADIUS = 200;
    const purple = { r: 124, g: 58, b: 237 };

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        w = canvas.width = rect.width;
        h = canvas.height = rect.height;
    }

    function createParticles() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                baseR: Math.random() * 2 + 1,
                r: 0,
                baseOpacity: Math.random() * 0.15 + 0.04,
                opacity: 0,
            });
        }
    }

    // Track mouse relative to canvas
    canvas.parentElement.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    canvas.parentElement.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    function draw() {
        ctx.clearRect(0, 0, w, h);

        for (const p of particles) {
            // Distance from mouse
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const mouseDist = Math.sqrt(dx * dx + dy * dy);
            const mouseInfluence = Math.max(0, 1 - mouseDist / MOUSE_RADIUS);

            // Particles grow & brighten near mouse
            p.r = p.baseR + mouseInfluence * 4;
            p.opacity = p.baseOpacity + mouseInfluence * 0.35;

            // Gentle push away from mouse
            if (mouseDist < MOUSE_RADIUS && mouseDist > 0) {
                const force = mouseInfluence * 0.5;
                p.vx += (dx / mouseDist) * force;
                p.vy += (dy / mouseDist) * force;
            }

            // Dampen velocity
            p.vx *= 0.98;
            p.vy *= 0.98;

            // Keep base movement
            if (Math.abs(p.vx) < 0.1) p.vx += (Math.random() - 0.5) * 0.1;
            if (Math.abs(p.vy) < 0.1) p.vy += (Math.random() - 0.5) * 0.1;
        }

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MAX_DIST) {
                    // Lines brighter near mouse
                    const midX = (particles[i].x + particles[j].x) / 2;
                    const midY = (particles[i].y + particles[j].y) / 2;
                    const mDist = Math.sqrt((midX - mouse.x) ** 2 + (midY - mouse.y) ** 2);
                    const mBoost = Math.max(0, 1 - mDist / MOUSE_RADIUS);
                    const alpha = (1 - dist / MAX_DIST) * (0.04 + mBoost * 0.15);

                    ctx.strokeStyle = `rgba(${purple.r},${purple.g},${purple.b},${alpha})`;
                    ctx.lineWidth = 0.5 + mBoost * 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw particles
        for (const p of particles) {
            // Glow effect near mouse
            if (p.opacity > 0.15) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${purple.r},${purple.g},${purple.b},${p.opacity * 0.15})`;
                ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${purple.r},${purple.g},${purple.b},${p.opacity})`;
            ctx.fill();

            p.x += p.vx;
            p.y += p.vy;
            if (p.x < -20) p.x = w + 20;
            if (p.x > w + 20) p.x = -20;
            if (p.y < -20) p.y = h + 20;
            if (p.y > h + 20) p.y = -20;
        }

        requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();
    window.addEventListener('resize', () => { resize(); createParticles(); });
})();
</script>
</body>
</html>
