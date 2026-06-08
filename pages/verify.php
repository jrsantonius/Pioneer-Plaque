<?php
$pageTitle = 'Verify Member - TIS Pioneer';
require __DIR__ . '/../includes/header.php';
?>

<div id="loadingView" class="min-h-screen flex items-center justify-center bg-premium">
  <div class="animate-pulse text-gray-500">Verifying...</div>
</div>

<!-- Not Found View -->
<div id="notFoundView" class="min-h-screen flex items-center justify-center bg-premium px-4 hidden">
  <div class="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-sm w-full text-center">
    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
    <h1 class="text-xl font-bold text-red-700 mb-2">Invalid Member</h1>
    <p class="text-sm text-red-600">This membership QR code is not valid.</p>
  </div>
</div>

<!-- Verified View -->
<div id="verifiedView" class="min-h-screen flex items-center justify-center bg-premium px-4 hidden">
  <div class="max-w-sm w-full">
    <div id="statusCard" class="border rounded-2xl p-8 text-center">
      <!-- Status Icon -->
      <div id="statusIconWrap" class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"></div>

      <!-- Status Text -->
      <h1 id="statusTitle" class="text-xl font-bold mb-1"></h1>
      <p id="statusSubtitle" class="text-sm mb-4"></p>

      <!-- Member Info -->
      <div class="bg-white/60 rounded-xl p-4 text-left space-y-2 border border-white">
        <div class="flex justify-between">
          <span class="text-xs text-gray-400">Name</span>
          <span id="vName" class="text-sm font-semibold text-gray-700"></span>
        </div>
        <div id="vUsernameRow" class="flex justify-between hidden">
          <span class="text-xs text-gray-400">Username</span>
          <span id="vUsername" class="text-sm font-medium text-gray-600"></span>
        </div>
        <div class="flex justify-between">
          <span class="text-xs text-gray-400">Pioneer ID</span>
          <span id="vPioneerId" class="text-sm font-mono font-bold text-gray-700"></span>
        </div>
        <div class="flex justify-between">
          <span class="text-xs text-gray-400">Batch</span>
          <span id="vBatch" class="text-sm font-medium text-gray-600"></span>
        </div>
        <div class="flex justify-between">
          <span class="text-xs text-gray-400">Status</span>
          <span id="vStatus" class="text-sm font-bold"></span>
        </div>
      </div>

      <!-- TIS Logo -->
      <div class="mt-5">
        <img src="<?= asset('tis-logo.png') ?>" alt="TIS" class="w-9 h-9 rounded-full object-cover mx-auto border border-gray-300"
             onerror="this.onerror=null; this.src='<?= asset('tis-logo.svg') ?>';" />
      </div>
    </div>
  </div>
</div>

<script>
const BASE = '';
const VERIFY_ID = '<?= e($verifyId) ?>';

async function init() {
  try {
    const res = await fetch(BASE + '/api/pioneer/' + VERIFY_ID);
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();

    const isActive = data.registered && data.claim_status === 'CLAIMED';
    const card = document.getElementById('statusCard');
    const iconWrap = document.getElementById('statusIconWrap');

    if (isActive) {
      card.className = 'bg-green-50 border-green-200 border rounded-2xl p-8 text-center';
      iconWrap.className = 'w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4';
      iconWrap.innerHTML = '<svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>';
      document.getElementById('statusTitle').className = 'text-xl font-bold text-green-700 mb-1';
      document.getElementById('statusTitle').textContent = 'Verified Member';
      document.getElementById('statusSubtitle').className = 'text-sm text-green-600 mb-4';
      document.getElementById('statusSubtitle').textContent = 'This is a valid TIS Pioneer member.';
      document.getElementById('vStatus').className = 'text-sm font-bold text-green-600';
      document.getElementById('vStatus').textContent = 'ACTIVE';
    } else {
      card.className = 'bg-yellow-50 border-yellow-200 border rounded-2xl p-8 text-center';
      iconWrap.className = 'w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4';
      iconWrap.innerHTML = '<svg class="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>';
      document.getElementById('statusTitle').className = 'text-xl font-bold text-yellow-700 mb-1';
      document.getElementById('statusTitle').textContent = 'Inactive Member';
      document.getElementById('statusSubtitle').className = 'text-sm text-yellow-600 mb-4';
      document.getElementById('statusSubtitle').textContent = 'This member has not completed registration.';
      document.getElementById('vStatus').className = 'text-sm font-bold text-yellow-600';
      document.getElementById('vStatus').textContent = 'PENDING';
    }

    document.getElementById('vName').textContent = data.full_name;
    document.getElementById('vPioneerId').textContent = data.pioneer_id;
    document.getElementById('vBatch').textContent = data.batch_number;

    if (data.username) {
      document.getElementById('vUsernameRow').classList.remove('hidden');
      document.getElementById('vUsername').textContent = '@' + data.username;
    }

    document.getElementById('loadingView').classList.add('hidden');
    document.getElementById('verifiedView').classList.remove('hidden');
  } catch (e) {
    document.getElementById('loadingView').classList.add('hidden');
    document.getElementById('notFoundView').classList.remove('hidden');
  }
}

init();
</script>

<?php require __DIR__ . '/../includes/footer.php'; ?>
