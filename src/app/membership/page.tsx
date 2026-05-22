'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TISLogo from '@/components/TISLogo';

interface MembershipData {
  pioneer_id: string;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  address: string | null;
  birth_date: string | null;
  bio: string | null;
  batch_number: string;
  claim_status: string;
  claim_date: string | null;
  registered_at: string;
  qr_code: string;
  membership_url: string;
}

export default function MembershipPage() {
  const router = useRouter();
  const [data, setData] = useState<MembershipData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchMembership() {
      try {
        const res = await fetch('/api/membership');

        if (cancelled) return;

        if (res.status === 401) {
          router.push('/login');
          return;
        }
        if (res.status === 403) {
          router.push('/register');
          return;
        }
        if (!res.ok) throw new Error('Failed to load membership');

        const d = await res.json();
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          router.push('/login');
        }
      }
    }

    fetchMembership();
    return () => { cancelled = true; };
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-premium">
        <div className="animate-pulse text-gray-500">Loading membership...</div>
      </div>
    );
  }

  const memberSince = data.registered_at
    ? new Date(data.registered_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
    : '-';

  return (
    <div className="min-h-screen bg-premium flex items-start justify-center py-6 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TISLogo size="sm" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/register')}
              className="px-3 py-1.5 bg-white/60 hover:bg-white/80 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 transition-all"
            >
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-white/60 hover:bg-red-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:text-red-600 transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Membership QR Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 text-center">
            <p className="text-[10px] tracking-[0.3em] text-gray-400 uppercase">Exclusive Member</p>
            <h1 className="text-xl font-bold text-white mt-0.5">Pioneer Membership</h1>
          </div>

          {/* QR Code */}
          <div className="px-6 pt-6 pb-4 flex flex-col items-center">
            <div className="bg-white p-3 rounded-xl shadow-md border border-gray-100">
              <img
                src={data.qr_code}
                alt="Membership QR Code"
                className="w-52 h-52"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              Scan to verify membership
            </p>

            {/* Member Info */}
            <div className="mt-4 text-center">
              <h2 className="text-2xl font-black text-gray-800">{data.full_name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">@{data.username}</p>
            </div>

            {/* Quick badges */}
            <div className="flex gap-2 mt-3">
              <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-semibold text-gray-600 tracking-wider uppercase">
                {data.pioneer_id}
              </span>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-semibold text-gray-600 tracking-wider uppercase">
                {data.batch_number}
              </span>
            </div>
          </div>

          {/* Benefits Banner */}
          <div className="mx-5 mb-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/60 p-4">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Member Benefits</h3>
            <div className="grid grid-cols-2 gap-2">
              <BenefitItem icon="🏷️" label="Partner Discounts" />
              <BenefitItem icon="🎫" label="Exclusive Events" />
              <BenefitItem icon="🤝" label="Community Access" />
              <BenefitItem icon="🎁" label="Early Access" />
            </div>
          </div>

          {/* Divider */}
          <div className="mx-5 border-t border-gray-200/60" />

          {/* Details */}
          <div className="px-5 py-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Personal Details</h3>
            <div className="space-y-2.5">
              <InfoRow label="Full Name" value={data.full_name} />
              <InfoRow label="Username" value={`@${data.username}`} />
              <InfoRow label="Email" value={data.email} />
              <InfoRow label="Phone" value={data.phone} />
              {data.address && <InfoRow label="Address" value={data.address} />}
              {data.birth_date && (
                <InfoRow
                  label="Date of Birth"
                  value={new Date(data.birth_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                />
              )}
              {data.bio && <InfoRow label="Bio" value={data.bio} />}
              <InfoRow label="Member Since" value={memberSince} />
              <InfoRow label="Pioneer ID" value={data.pioneer_id} />
              <InfoRow label="Batch" value={data.batch_number} />
              <InfoRow label="Status" value={data.claim_status} isHighlight />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 space-y-2">
          <a
            href="https://chat.whatsapp.com/YOUR_GROUP_LINK"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl font-semibold text-sm transition-all shadow-md"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Community Group
          </a>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">&copy; 2026 The Innovators Studio. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

function BenefitItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-600">
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function InfoRow({ label, value, isHighlight }: { label: string; value: string; isHighlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className={`text-sm text-right ${isHighlight ? 'font-bold text-green-600' : 'font-medium text-gray-700'}`}>
        {value}
      </span>
    </div>
  );
}
