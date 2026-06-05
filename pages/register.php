<?php
$pageTitle = 'Register - TIS Pioneer';
require __DIR__ . '/../includes/header.php';
?>

<div id="loadingView" class="min-h-screen flex items-center justify-center bg-premium">
  <div class="animate-pulse text-gray-500">Loading...</div>
</div>

<div id="mainView" class="min-h-screen bg-premium flex items-start justify-center py-8 px-4 hidden">
  <div class="w-full max-w-md">
    <!-- Header -->
    <div class="text-center mb-6">
      <div class="flex justify-center mb-3">
        <img src="<?= asset('tis-logo.png') ?>" alt="TIS" class="w-14 h-14 rounded-full object-cover shadow-md border-2 border-gray-300"
             onerror="this.onerror=null; this.src='<?= asset('tis-logo.svg') ?>';" />
      </div>
      <h1 class="text-xl font-bold text-gray-800">Complete Your Profile</h1>
      <p class="text-sm text-gray-500 mt-1">
        Pioneer ID: <span id="pioneerId" class="font-mono font-bold"></span>
      </p>
    </div>

    <!-- Form Card -->
    <div class="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
      <form id="registerForm" class="space-y-4">
        <!-- Username -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Username *
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
            <input type="text" id="username" name="username" placeholder="your_username" minlength="3" maxlength="30"
              class="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
              required />
          </div>
          <p class="text-[10px] text-gray-400 mt-1">Letters, numbers, underscore. 3-30 characters.</p>
        </div>

        <!-- Full Name -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name *</label>
          <input type="text" id="full_name" name="full_name" placeholder="Enter your full name"
            class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
            required />
        </div>

        <!-- Email -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email *</label>
          <input type="email" id="email" name="email" placeholder="your.email@example.com"
            class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
            required />
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number *</label>
          <input type="tel" id="phone" name="phone" placeholder="+62 812 3456 7890"
            class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
            required />
        </div>

        <!-- Birth Date -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Date of Birth</label>
          <input type="date" id="birth_date" name="birth_date"
            class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all" />
        </div>

        <!-- Address -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Address</label>
          <input type="text" id="address" name="address" placeholder="City, Country"
            class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all" />
        </div>

        <!-- Bio -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Bio</label>
          <textarea id="bio" name="bio" placeholder="Tell us about yourself..." rows="3"
            class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all resize-none"></textarea>
        </div>

        <!-- Error / Success Messages -->
        <div id="regErrorBox" class="hidden bg-red-50 border border-red-200 rounded-lg p-3">
          <p id="regErrorMsg" class="text-sm text-red-600 text-center"></p>
        </div>
        <div id="regSuccessBox" class="hidden bg-green-50 border border-green-200 rounded-lg p-3">
          <p id="regSuccessMsg" class="text-sm text-green-600 text-center"></p>
        </div>

        <!-- Submit -->
        <button type="submit" id="saveBtn"
          class="w-full py-3.5 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg">
          Save & Activate Membership
        </button>
      </form>
    </div>

    <!-- Footer -->
    <div class="mt-6 text-center">
      <p class="text-xs text-gray-400">&copy; 2026 The Innovators Studio. All rights reserved.</p>
    </div>
  </div>
</div>

<script>
const BASE = '<?= BASE_URL ?>';

async function init() {
  try {
    const res = await fetch(BASE + '/api/auth');
    if (!res.ok) throw new Error('Not authenticated');
    const data = await res.json();

    document.getElementById('pioneerId').textContent = data.pioneer_id;
    document.getElementById('username').value = data.username || data.pioneer_id || '';
    document.getElementById('full_name').value = data.full_name || '';
    document.getElementById('email').value = data.email || '';
    document.getElementById('phone').value = data.phone || '';
    document.getElementById('birth_date').value = data.birth_date || '';
    document.getElementById('address').value = data.address || '';
    document.getElementById('bio').value = data.bio || '';

    document.getElementById('loadingView').classList.add('hidden');
    document.getElementById('mainView').classList.remove('hidden');
  } catch (e) {
    window.location.href = BASE + '/login';
  }
}

// Username filter
document.getElementById('username').addEventListener('input', function() {
  this.value = this.value.replace(/[^a-zA-Z0-9_]/g, '');
});

document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const btn = document.getElementById('saveBtn');
  const errorBox = document.getElementById('regErrorBox');
  const successBox = document.getElementById('regSuccessBox');
  errorBox.classList.add('hidden');
  successBox.classList.add('hidden');
  btn.disabled = true;
  btn.innerHTML = '<span class="flex items-center justify-center gap-2"><svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Saving...</span>';

  try {
    const body = {
      username: document.getElementById('username').value,
      full_name: document.getElementById('full_name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      birth_date: document.getElementById('birth_date').value,
      address: document.getElementById('address').value,
      bio: document.getElementById('bio').value,
    };

    const res = await fetch(BASE + '/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) {
      document.getElementById('regErrorMsg').textContent = data.error || 'Failed to save profile';
      errorBox.classList.remove('hidden');
      btn.disabled = false;
      btn.textContent = 'Save & Activate Membership';
      return;
    }

    document.getElementById('regSuccessMsg').textContent = 'Profile saved successfully! Redirecting...';
    successBox.classList.remove('hidden');
    setTimeout(() => { window.location.href = BASE + '/membership'; }, 1500);
  } catch (err) {
    document.getElementById('regErrorMsg').textContent = 'Connection error. Please try again.';
    errorBox.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = 'Save & Activate Membership';
  }
});

init();
</script>

<?php require __DIR__ . '/../includes/footer.php'; ?>
