<?php
$pageTitle = 'Pioneer - TIS';
require __DIR__ . '/../includes/header.php';
?>

<div id="loadingView" class="min-h-screen flex items-center justify-center bg-premium">
  <div class="animate-pulse text-gray-500 text-lg">Loading...</div>
</div>

<div id="errorView" class="min-h-screen flex items-center justify-center bg-premium hidden">
  <div class="text-center">
    <h1 class="text-2xl font-bold text-gray-700 mb-2">Not Found</h1>
    <p class="text-gray-500">Pioneer plaque not found.</p>
  </div>
</div>

<div id="mainView" class="min-h-screen bg-premium flex items-start justify-center py-6 px-4 hidden">
  <div class="w-full max-w-md">
    <!-- Tabs -->
    <div class="flex mb-0 bg-white/50 rounded-t-2xl overflow-hidden">
      <button id="tabCert" onclick="switchTab('certificate')"
        class="flex-1 py-3.5 text-sm font-medium transition-all tab-active bg-white/70">
        Certificate
      </button>
      <button id="tabAccess" onclick="switchTab('access')"
        class="flex-1 py-3.5 text-sm font-medium transition-all tab-inactive hover:bg-white/30">
        Pioneer Access
      </button>
    </div>

    <!-- Certificate Tab -->
    <div id="certificateTab" class="bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 rounded-b-2xl shadow-2xl overflow-hidden">
      <!-- Top section -->
      <div class="relative px-6 pt-8 pb-6">
        <div class="absolute top-4 left-4 w-16 h-16 bg-gray-300/30 rounded-full"></div>
        <div class="absolute top-12 right-6 w-10 h-10 bg-gray-300/20 rounded-full"></div>
        <div class="absolute bottom-2 left-8 w-8 h-8 bg-gray-300/25 rounded-full"></div>

        <div class="relative flex flex-col items-center">
          <!-- Original Badge -->
          <div class="relative">
            <div class="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-400">
              <div class="text-center">
                <p class="text-[6px] tracking-[0.15em] text-gray-300 uppercase">Original</p>
                <p class="text-[8px] font-bold text-white tracking-wider">PRODUCT</p>
              </div>
            </div>
            <div class="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center border border-gray-400">
              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <div class="mt-5">
            <p class="text-center text-xs tracking-[0.3em] text-gray-500 uppercase">Pioneer Identity</p>
            <h1 id="certName" class="text-center text-3xl font-black text-gray-800 mt-1 tracking-wide"></h1>
          </div>
          <div class="mt-4 bg-white/60 rounded-xl px-6 py-2.5 border border-gray-300/50">
            <p class="text-[10px] tracking-[0.25em] text-gray-400 uppercase text-center">Pioneer ID</p>
            <p id="certPioneerId" class="text-xl font-bold text-gray-800 text-center"></p>
          </div>
        </div>
      </div>

      <!-- Details rows -->
      <div id="certDetails" class="mx-5 mb-5 bg-white/50 rounded-xl border border-gray-200/80 overflow-hidden"></div>

      <!-- Certificate of Authenticity -->
      <div class="mx-5 mb-6 bg-white/60 rounded-xl border border-gray-200/80 p-5">
        <h2 class="text-center text-lg tracking-[0.15em] text-gray-700 font-semibold mb-4">CERTIFICATE OF AUTHENTICITY</h2>

        <div class="flex justify-center mb-3">
          <img src="<?= asset('tis-logo.png') ?>" alt="TIS" class="w-14 h-14 rounded-full object-cover shadow-md border-2 border-gray-300"
               onerror="this.onerror=null; this.src='<?= asset('tis-logo.svg') ?>';" />
        </div>

        <p class="text-center text-sm text-gray-600 leading-relaxed mt-3 mb-4">
          This certificate confirms that this pioneer plaque is an official product issued by The Innovators Studio.
        </p>

        <div class="flex gap-3 mb-4">
          <div class="flex-1 bg-gray-100/80 rounded-lg px-3 py-2 text-center border border-gray-200/60">
            <p class="text-[9px] tracking-[0.2em] text-gray-400 uppercase">Pioneer ID</p>
            <p id="certPioneerId2" class="text-base font-bold text-gray-800"></p>
          </div>
          <div class="flex-1 bg-gray-100/80 rounded-lg px-3 py-2 text-center border border-gray-200/60">
            <p class="text-[9px] tracking-[0.2em] text-gray-400 uppercase">Batch Number</p>
            <p id="certBatch2" class="text-base font-bold text-gray-800"></p>
          </div>
        </div>

        <div class="flex justify-between items-end px-2">
          <div class="text-center">
            <p class="text-[9px] tracking-[0.15em] text-gray-400 uppercase">Issued / Verified Date</p>
            <p id="certIssuedDate" class="text-sm font-semibold text-gray-700"></p>
          </div>
          <div class="text-center">
            <p class="text-[9px] tracking-[0.15em] text-gray-400 uppercase">Signature</p>
            <div class="mt-0.5">
              <img src="<?= asset('tis-logo.png') ?>" alt="TIS" class="w-9 h-9 rounded-full object-cover border border-gray-300"
                   onerror="this.onerror=null; this.src='<?= asset('tis-logo.svg') ?>';" />
            </div>
          </div>
        </div>

        <div class="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
          <div class="w-5 h-5 bg-gray-800 rounded flex items-center justify-center">
            <span class="text-white text-[8px] font-bold">S</span>
          </div>
          <span>Secured by <span class="font-bold">Shieldtag</span><sup>&reg;</sup></span>
        </div>
      </div>
    </div>

    <!-- Access Tab -->
    <div id="accessTab" class="bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 rounded-b-2xl shadow-2xl overflow-hidden hidden">
      <div class="px-6 py-8">
        <div class="flex justify-center mb-6">
          <img src="<?= asset('tis-logo.png') ?>" alt="TIS" class="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-gray-300"
               onerror="this.onerror=null; this.src='<?= asset('tis-logo.svg') ?>';" />
        </div>

        <div class="text-center mb-8">
          <h2 class="text-lg font-semibold text-gray-700 mb-1">Welcome, Pioneer!</h2>
          <p class="text-sm text-gray-500">Your exclusive access credentials</p>
        </div>

        <!-- Unique Code Card -->
        <div class="bg-white/70 rounded-xl border border-gray-200 p-5 mb-6">
          <p class="text-[10px] tracking-[0.25em] text-gray-400 uppercase text-center mb-2">Your Unique Code</p>
          <div class="flex items-center justify-center gap-3">
            <p id="uniqueCode" class="text-3xl font-black text-gray-800 tracking-wider font-mono"></p>
            <button id="copyBtn" onclick="copyCode()" class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors" title="Copy code">
              <svg id="copyIcon" class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <svg id="copiedIcon" class="w-5 h-5 text-green-600 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
          <p class="text-xs text-gray-400 text-center mt-2">Use this code to login to the TIS website</p>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <a href="<?= WHATSAPP_LINK ?>" target="_blank" rel="noopener noreferrer"
            class="flex items-center justify-center gap-3 w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Join Community Group
          </a>
          <a href="<?= BASE_URL ?>/login"
            class="flex items-center justify-center gap-3 w-full py-3.5 px-4 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
            Go to TIS Website
          </a>
        </div>

        <div class="mt-6 p-3 bg-gray-800/5 rounded-lg border border-gray-200/50">
          <p class="text-xs text-gray-500 text-center leading-relaxed">
            Login to the TIS website using your unique code to activate your membership and access exclusive benefits.
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
const BASE = '';
const PIONEER_CODE = '<?= e($pioneerCode) ?>';
let pioneerData = null;

function switchTab(tab) {
  const certTab = document.getElementById('certificateTab');
  const accessTab = document.getElementById('accessTab');
  const tabCert = document.getElementById('tabCert');
  const tabAccess = document.getElementById('tabAccess');

  if (tab === 'certificate') {
    certTab.classList.remove('hidden');
    accessTab.classList.add('hidden');
    tabCert.className = 'flex-1 py-3.5 text-sm font-medium transition-all tab-active bg-white/70';
    tabAccess.className = 'flex-1 py-3.5 text-sm font-medium transition-all tab-inactive hover:bg-white/30';
  } else {
    certTab.classList.add('hidden');
    accessTab.classList.remove('hidden');
    tabAccess.className = 'flex-1 py-3.5 text-sm font-medium transition-all tab-active bg-white/70';
    tabCert.className = 'flex-1 py-3.5 text-sm font-medium transition-all tab-inactive hover:bg-white/30';
  }
}

function addCertDetail(label, value, isStatus, isLast) {
  const container = document.getElementById('certDetails');
  const div = document.createElement('div');
  div.className = 'flex items-start justify-between px-4 py-3' + (!isLast ? ' border-b border-gray-200/60' : '');

  let valueHtml;
  if (isStatus) {
    valueHtml = '<span class="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700">' + value;
    if (value === 'CLAIMED') {
      valueHtml += ' <span class="w-4 h-4 bg-gray-700 rounded-full flex items-center justify-center"><svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg></span>';
    }
    valueHtml += '</span>';
  } else {
    valueHtml = '<span class="text-sm font-semibold text-gray-700 whitespace-pre-line">' + value + '</span>';
  }

  div.innerHTML = '<span class="text-xs tracking-wider text-gray-500 uppercase font-medium">' + label + '</span><div class="text-right">' + valueHtml + '</div>';
  container.appendChild(div);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return String(d.getDate()).padStart(2,'0') + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

function copyCode() {
  if (!pioneerData) return;
  navigator.clipboard.writeText(pioneerData.unique_code);
  document.getElementById('copyIcon').classList.add('hidden');
  document.getElementById('copiedIcon').classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('copyIcon').classList.remove('hidden');
    document.getElementById('copiedIcon').classList.add('hidden');
  }, 2000);
}

async function init() {
  try {
    const res = await fetch(BASE + '/api/pioneer/' + PIONEER_CODE);
    if (!res.ok) throw new Error('Not found');
    pioneerData = await res.json();

    const p = pioneerData;
    const contactEmail = p.email || 'FULLNAME@gmail.com';
    const contactPhone = p.phone || '+62 123 456 789';
    const claimDate = formatDate(p.claim_date);

    // Certificate tab
    document.getElementById('certName').textContent = p.full_name;
    document.getElementById('certPioneerId').textContent = p.pioneer_id;
    document.getElementById('certPioneerId2').textContent = p.pioneer_id;
    document.getElementById('certBatch2').textContent = p.batch_number;
    document.getElementById('certIssuedDate').textContent = p.claim_date ? formatDate(p.claim_date) : '07 MAY 2026';

    addCertDetail('BATCH NUMBER', p.batch_number, false, false);
    addCertDetail('CLAIM STATUS', p.claim_status, true, false);
    addCertDetail('CLAIM DATE', claimDate, false, false);
    addCertDetail('CONTACT INFORMATION', contactEmail + '\n' + contactPhone, false, true);

    // Access tab
    document.getElementById('uniqueCode').textContent = p.unique_code;

    document.getElementById('loadingView').classList.add('hidden');
    document.getElementById('mainView').classList.remove('hidden');
  } catch (e) {
    document.getElementById('loadingView').classList.add('hidden');
    document.getElementById('errorView').classList.remove('hidden');
  }
}

init();
</script>

<?php require __DIR__ . '/../includes/footer.php'; ?>
