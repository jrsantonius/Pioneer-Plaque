'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TISLogo from '@/components/TISLogo';
import OriginalBadge from '@/components/OriginalBadge';

interface PioneerData {
  pioneer_id: string;
  unique_code: string;
  batch_number: string;
  claim_status: string;
  claim_date: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  username: string | null;
  registered: boolean;
}

export default function PioneerPage() {
  const params = useParams();
  const code = params?.code as string | undefined;
  const [pioneer, setPioneer] = useState<PioneerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'certificate' | 'access'>('certificate');

  useEffect(() => {
    if (!code) {
      setError('Pioneer ID not found');
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetch(`/api/pioneer/${code}`)
      .then(res => {
        if (!res.ok) throw new Error('Pioneer not found');
        return res.json();
      })
      .then(data => {
        if (!cancelled) {
          setPioneer(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Pioneer ID not found');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-premium">
        <div className="animate-pulse text-gray-500 text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !pioneer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-premium">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-2">Not Found</h1>
          <p className="text-gray-500">{error || 'Pioneer plaque not found.'}</p>
        </div>
      </div>
    );
  }

  const claimDate = pioneer.claim_date
    ? new Date(pioneer.claim_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
    : '-';

  const contactEmail = pioneer.email || 'FULLNAME@gmail.com';
  const contactPhone = pioneer.phone || '+62 123 456 789';

  return (
    <div className="min-h-screen bg-premium flex items-start justify-center py-6 px-4">
      <div className="w-full max-w-md">
        {/* Tabs */}
        <div className="flex mb-0 bg-white/50 rounded-t-2xl overflow-hidden">
          <button
            onClick={() => setActiveTab('certificate')}
            className={`flex-1 py-3.5 text-sm font-medium transition-all-smooth ${
              activeTab === 'certificate' ? 'tab-active bg-white/70' : 'tab-inactive hover:bg-white/30'
            }`}
          >
            Certificate
          </button>
          <button
            onClick={() => setActiveTab('access')}
            className={`flex-1 py-3.5 text-sm font-medium transition-all-smooth ${
              activeTab === 'access' ? 'tab-active bg-white/70' : 'tab-inactive hover:bg-white/30'
            }`}
          >
            Pioneer Access
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'certificate' ? (
          <CertificateTab pioneer={pioneer} claimDate={claimDate} contactEmail={contactEmail} contactPhone={contactPhone} />
        ) : (
          <AccessTab pioneer={pioneer} />
        )}
      </div>
    </div>
  );
}

function CertificateTab({
  pioneer, claimDate, contactEmail, contactPhone,
}: {
  pioneer: PioneerData; claimDate: string; contactEmail: string; contactPhone: string;
}) {
  return (
    <div className="bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 rounded-b-2xl shadow-2xl overflow-hidden">
      {/* Top section - Pioneer Identity */}
      <div className="relative px-6 pt-8 pb-6">
        {/* Decorative circles */}
        <div className="absolute top-4 left-4 w-16 h-16 bg-gray-300/30 rounded-full" />
        <div className="absolute top-12 right-6 w-10 h-10 bg-gray-300/20 rounded-full" />
        <div className="absolute bottom-2 left-8 w-8 h-8 bg-gray-300/25 rounded-full" />

        <div className="relative flex flex-col items-center">
          <OriginalBadge />
          <div className="mt-5">
            <p className="text-center text-xs tracking-[0.3em] text-gray-500 uppercase">Pioneer Identity</p>
            <h1 className="text-center text-3xl font-black text-gray-800 mt-1 tracking-wide">
              {pioneer.full_name}
            </h1>
          </div>
          <div className="mt-4 bg-white/60 rounded-xl px-6 py-2.5 border border-gray-300/50">
            <p className="text-[10px] tracking-[0.25em] text-gray-400 uppercase text-center">Pioneer ID</p>
            <p className="text-xl font-bold text-gray-800 text-center">{pioneer.pioneer_id}</p>
          </div>
        </div>
      </div>

      {/* Details rows */}
      <div className="mx-5 mb-5 bg-white/50 rounded-xl border border-gray-200/80 overflow-hidden">
        <DetailRow label="BATCH NUMBER" value={pioneer.batch_number} />
        <DetailRow label="CLAIM STATUS" value={pioneer.claim_status} isStatus />
        <DetailRow label="CLAIM DATE" value={claimDate} />
        <DetailRow
          label="CONTACT INFORMATION"
          value={`${contactEmail}\n${contactPhone}`}
          isLast
        />
      </div>

      {/* Certificate of Authenticity */}
      <div className="mx-5 mb-6 bg-white/60 rounded-xl border border-gray-200/80 p-5">
        <h2 className="text-center text-lg tracking-[0.15em] text-gray-700 font-semibold mb-4">
          CERTIFICATE OF AUTHENTICITY
        </h2>

        <div className="flex justify-center mb-3">
          <TISLogo size="md" />
        </div>

        <p className="text-center text-sm text-gray-600 leading-relaxed mt-3 mb-4">
          This certificate confirms that this pioneer plaque is an official product issued by The Innovators Studio.
        </p>

        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-gray-100/80 rounded-lg px-3 py-2 text-center border border-gray-200/60">
            <p className="text-[9px] tracking-[0.2em] text-gray-400 uppercase">Pioneer ID</p>
            <p className="text-base font-bold text-gray-800">{pioneer.pioneer_id}</p>
          </div>
          <div className="flex-1 bg-gray-100/80 rounded-lg px-3 py-2 text-center border border-gray-200/60">
            <p className="text-[9px] tracking-[0.2em] text-gray-400 uppercase">Batch Number</p>
            <p className="text-base font-bold text-gray-800">{pioneer.batch_number}</p>
          </div>
        </div>

        <div className="flex justify-between items-end px-2">
          <div className="text-center">
            <p className="text-[9px] tracking-[0.15em] text-gray-400 uppercase">Issued / Verified Date</p>
            <p className="text-sm font-semibold text-gray-700">
              {pioneer.claim_date
                ? new Date(pioneer.claim_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
                : '07 MAY 2026'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[9px] tracking-[0.15em] text-gray-400 uppercase">Signature</p>
            <div className="mt-0.5">
              <TISLogo size="sm" />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
          <div className="w-5 h-5 bg-gray-800 rounded flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">S</span>
          </div>
          <span>
            Secured by <span className="font-bold">Shieldtag</span><sup>&reg;</sup>
          </span>
        </div>
      </div>
    </div>
  );
}

function AccessTab({ pioneer }: { pioneer: PioneerData }) {
  const [copied, setCopied] = useState(false);

  const uniqueCode = pioneer.unique_code;

  const copyCode = () => {
    navigator.clipboard.writeText(uniqueCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 rounded-b-2xl shadow-2xl overflow-hidden">
      <div className="px-6 py-8">
        {/* TIS Logo */}
        <div className="flex justify-center mb-6">
          <TISLogo size="lg" />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-1">Welcome, Pioneer!</h2>
          <p className="text-sm text-gray-500">Your exclusive access credentials</p>
        </div>

        {/* Unique Code Card */}
        <div className="bg-white/70 rounded-xl border border-gray-200 p-5 mb-6">
          <p className="text-[10px] tracking-[0.25em] text-gray-400 uppercase text-center mb-2">
            Your Unique Code
          </p>
          <div className="flex items-center justify-center gap-3">
            <p className="text-3xl font-black text-gray-800 tracking-wider font-mono">
              {uniqueCode}
            </p>
            <button
              onClick={copyCode}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Copy code"
            >
              {copied ? (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            Use this code to login to the TIS website
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* WhatsApp Community Button */}
          <a
            href="https://chat.whatsapp.com/YOUR_GROUP_LINK"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl font-semibold text-sm transition-all-smooth shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Join Community Group
          </a>

          {/* TIS Website Button */}
          <a
            href="/login"
            className="flex items-center justify-center gap-3 w-full py-3.5 px-4 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-semibold text-sm transition-all-smooth shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            Go to TIS Website
          </a>
        </div>

        {/* Info Note */}
        <div className="mt-6 p-3 bg-gray-800/5 rounded-lg border border-gray-200/50">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Login to the TIS website using your unique code to activate your membership and access exclusive benefits.
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label, value, isStatus, isLast,
}: {
  label: string; value: string; isStatus?: boolean; isLast?: boolean;
}) {
  return (
    <div className={`flex items-start justify-between px-4 py-3 ${!isLast ? 'border-b border-gray-200/60' : ''}`}>
      <span className="text-xs tracking-wider text-gray-500 uppercase font-medium">{label}</span>
      <div className="text-right">
        {isStatus ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            {value}
            {value === 'CLAIMED' && (
              <span className="w-4 h-4 bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </span>
        ) : (
          <span className="text-sm font-semibold text-gray-700 whitespace-pre-line">{value}</span>
        )}
      </div>
    </div>
  );
}
