<?php
$pageTitle = 'Membership - TIS Pioneer';
require __DIR__ . '/../includes/header.php';
?>

<div id="loadingView" class="min-h-screen flex items-center justify-center bg-premium">
  <div class="animate-pulse text-gray-500">Loading membership...</div>
</div>

<div id="mainView" class="min-h-screen bg-premium flex items-start justify-center py-6 px-4 hidden">
  <div class="w-full max-w-md">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <img src="<?= asset('tis-logo.png') ?>" alt="TIS" class="w-9 h-9 rounded-full object-cover shadow border border-gray-300"
             onerror="this.onerror=null; this.src='<?= asset('tis-logo.svg') ?>';" />
      </div>
      <div class="flex gap-2">
        <a href="<?= BASE_URL ?>/register"
          class="px-3 py-1.5 bg-white/60 hover:bg-white/80 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 transition-all">
          Edit Profile
        </a>
        <button id="logoutBtn"
          class="px-3 py-1.5 bg-white/60 hover:bg-red-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:text-red-600 transition-all">
          Logout
        </button>
      </div>
    </div>

    <!-- Membership QR Card -->
    <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
      <!-- Card Header -->
      <div class="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 text-center">
        <p class="text-[10px] tracking-[0.3em] text-gray-400 uppercase">Exclusive Member</p>
        <h1 class="text-xl font-bold text-white mt-0.5">Pioneer Membership</h1>
      </div>

      <!-- QR Code -->
      <div class="px-6 pt-6 pb-4 flex flex-col items-center">
        <div class="bg-white p-3 rounded-xl shadow-md border border-gray-100">
          <canvas id="qrCanvas" width="208" height="208"></canvas>
        </div>
        <p class="text-[10px] text-gray-400 mt-2 text-center">Scan to verify membership</p>

        <!-- Member Info -->
        <div class="mt-4 text-center">
          <h2 id="memberName" class="text-2xl font-black text-gray-800"></h2>
          <p id="memberUsername" class="text-sm text-gray-500 mt-0.5"></p>
        </div>

        <!-- Quick badges -->
        <div class="flex gap-2 mt-3">
          <span id="badgePioneerId" class="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-semibold text-gray-600 tracking-wider uppercase"></span>
          <span id="badgeBatch" class="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-semibold text-gray-600 tracking-wider uppercase"></span>
        </div>
      </div>

      <!-- Benefits Banner -->
      <div class="mx-5 mb-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/60 p-4">
        <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Member Benefits</h3>
        <div class="grid grid-cols-2 gap-2">
          <div class="flex items-center gap-1.5 text-xs text-gray-600"><span>&#127991;&#65039;</span><span>Partner Discounts</span></div>
          <div class="flex items-center gap-1.5 text-xs text-gray-600"><span>&#127915;</span><span>Exclusive Events</span></div>
          <div class="flex items-center gap-1.5 text-xs text-gray-600"><span>&#129309;</span><span>Community Access</span></div>
          <div class="flex items-center gap-1.5 text-xs text-gray-600"><span>&#127873;</span><span>Early Access</span></div>
        </div>
      </div>

      <!-- Divider -->
      <div class="mx-5 border-t border-gray-200/60"></div>

      <!-- Details -->
      <div class="px-5 py-4">
        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Personal Details</h3>
        <div id="detailsContainer" class="space-y-2.5"></div>
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-4 space-y-2">
      <a href="<?= WHATSAPP_LINK ?>" target="_blank" rel="noopener noreferrer"
        class="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl font-semibold text-sm transition-all shadow-md">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Community Group
      </a>
    </div>

    <!-- Footer -->
    <div class="mt-6 text-center">
      <p class="text-xs text-gray-400">&copy; 2026 The Innovators Studio. All rights reserved.</p>
    </div>
  </div>
</div>

<script>
const BASE = '';

function addDetail(label, value, isHighlight) {
  const container = document.getElementById('detailsContainer');
  const div = document.createElement('div');
  div.className = 'flex items-start justify-between gap-4';
  div.innerHTML = '<span class="text-xs text-gray-400 shrink-0">' + label + '</span>' +
    '<span class="text-sm text-right ' + (isHighlight ? 'font-bold text-green-600' : 'font-medium text-gray-700') + '">' + value + '</span>';
  container.appendChild(div);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return String(d.getDate()).padStart(2,'0') + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

function formatBirthDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return String(d.getDate()).padStart(2,'0') + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

async function init() {
  try {
    const res = await fetch(BASE + '/api/membership');
    if (res.status === 401) { window.location.href = BASE + '/login'; return; }
    if (res.status === 403) { window.location.href = BASE + '/register'; return; }
    if (!res.ok) throw new Error('Failed');

    const data = await res.json();

    // QR Code
    try {
      if (typeof QRCode !== 'undefined') {
        QRCode.toCanvas(document.getElementById('qrCanvas'), data.membership_url, {
          width: 208, margin: 0, color: { dark: '#1a1a1a', light: '#ffffff' }
        });
      } else {
        console.warn('QRCode library not loaded');
      }
    } catch (qrErr) {
      console.error('QR generation failed:', qrErr);
    }

    // Member info
    document.getElementById('memberName').textContent = data.full_name;
    document.getElementById('memberUsername').textContent = '@' + data.username;
    document.getElementById('badgePioneerId').textContent = data.pioneer_id;
    document.getElementById('badgeBatch').textContent = data.batch_number;

    // Details
    addDetail('Full Name', data.full_name);
    addDetail('Username', '@' + data.username);
    addDetail('Email', data.email);
    addDetail('Phone', data.phone);
    if (data.address) addDetail('Address', data.address);
    const bd = formatBirthDate(data.birth_date);
    if (bd) addDetail('Date of Birth', bd);
    if (data.bio) addDetail('Bio', data.bio);
    addDetail('Member Since', formatDate(data.registered_at));
    addDetail('Pioneer ID', data.pioneer_id);
    addDetail('Batch', data.batch_number);
    addDetail('Status', data.claim_status, true);

    document.getElementById('loadingView').classList.add('hidden');
    document.getElementById('mainView').classList.remove('hidden');
  } catch (e) {
    window.location.href = BASE + '/login';
  }
}

document.getElementById('logoutBtn').addEventListener('click', async function() {
  await fetch(BASE + '/api/auth', { method: 'DELETE' });
  window.location.href = BASE + '/login';
});

init();
</script>

<?php require __DIR__ . '/../includes/footer.php'; ?>
