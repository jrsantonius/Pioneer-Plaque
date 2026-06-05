<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($pageTitle ?? 'TIS - The Innovators Studio') ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
    <style>
        :root { --foreground: #171717; --background: #f5f5f5; }
        body { color: var(--foreground); background: var(--background); font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }
        .bg-premium { background: linear-gradient(135deg, #e8e8e8 0%, #f5f5f5 25%, #d4d4d4 50%, #f0f0f0 75%, #e0e0e0 100%); }
        .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3); }
        .tab-active { border-bottom: 3px solid #333; color: #111; font-weight: 600; }
        .tab-inactive { border-bottom: 3px solid transparent; color: #888; }
        .transition-smooth { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes shine { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
    </style>
</head>
<body class="min-h-screen bg-premium">
