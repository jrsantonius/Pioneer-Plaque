<?php
$pageTitle = 'Login - TIS Pioneer';
require __DIR__ . '/../includes/header.php';
?>

<div class="min-h-screen bg-premium flex items-center justify-center px-4">
  <div class="w-full max-w-md">
    <!-- Logo & Header -->
    <div class="text-center mb-8">
      <div class="flex justify-center mb-4">
        <img src="<?= asset('tis-logo.png') ?>" alt="TIS" class="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-gray-300"
             onerror="this.onerror=null; this.src='<?= asset('tis-logo.svg') ?>';" />
      </div>
      <p class="text-gray-500 text-sm mt-2">Pioneer Membership Portal</p>
    </div>

    <!-- Login Card -->
    <div class="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
      <h2 class="text-xl font-bold text-gray-800 text-center mb-1">Welcome, Pioneer</h2>
      <p class="text-sm text-gray-500 text-center mb-6">
        Enter your unique code to access your membership
      </p>

      <form id="loginForm" class="space-y-4">
        <div>
          <label for="code" class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Unique Code
          </label>
          <input
            id="code"
            type="text"
            placeholder="Enter your unique code"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-gray-800 placeholder:text-gray-300 placeholder:text-sm placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
            required
            autofocus
          />
        </div>

        <div id="errorBox" class="hidden bg-red-50 border border-red-200 rounded-lg p-3">
          <p id="errorMsg" class="text-sm text-red-600 text-center"></p>
        </div>

        <button
          type="submit"
          id="loginBtn"
          class="w-full py-3.5 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:shadow-none"
        >
          Login
        </button>
      </form>

      <div class="mt-6 pt-4 border-t border-gray-200/60">
        <p class="text-xs text-gray-400 text-center leading-relaxed">
          Your unique code can be found on your Pioneer Plaque.
          <br />
          Scan the QR code on your plaque to get started.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-6 text-center">
      <p class="text-xs text-gray-400">
        &copy; 2026 The Innovators Studio. All rights reserved.
      </p>
    </div>
  </div>
</div>

<script>
const codeInput = document.getElementById('code');
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const errorBox = document.getElementById('errorBox');
const errorMsg = document.getElementById('errorMsg');

codeInput.addEventListener('input', function() {
  this.value = this.value.toUpperCase();
});

loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const code = codeInput.value.trim();
  if (!code) return;

  errorBox.classList.add('hidden');
  loginBtn.disabled = true;
  loginBtn.innerHTML = '<span class="flex items-center justify-center gap-2"><svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Verifying...</span>';

  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unique_code: code }),
    });
    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.error || 'Login failed';
      errorBox.classList.remove('hidden');
      loginBtn.disabled = false;
      loginBtn.textContent = 'Login';
      return;
    }

    if (data.registered) {
      window.location.href = '/membership';
    } else {
      window.location.href = '/register';
    }
  } catch (err) {
    errorMsg.textContent = 'Connection error. Please try again.';
    errorBox.classList.remove('hidden');
    loginBtn.disabled = false;
    loginBtn.textContent = 'Login';
  }
});
</script>

<?php require __DIR__ . '/../includes/footer.php'; ?>
