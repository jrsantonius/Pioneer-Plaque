'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TISLogo from '@/components/TISLogo';

interface VerifyData {
  pioneer_id: string;
  full_name: string;
  username: string | null;
  batch_number: string;
  claim_status: string;
  registered: boolean;
}

export default function VerifyPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [data, setData] = useState<VerifyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetch(`/api/pioneer/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(d => {
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-premium">
        <div className="animate-pulse text-gray-500">Verifying...</div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-premium px-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-red-700 mb-2">Invalid Member</h1>
          <p className="text-sm text-red-600">This membership QR code is not valid.</p>
        </div>
      </div>
    );
  }

  const isActive = data.registered && data.claim_status === 'CLAIMED';

  return (
    <div className="min-h-screen flex items-center justify-center bg-premium px-4">
      <div className="max-w-sm w-full">
        <div className={`${isActive ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border rounded-2xl p-8 text-center`}>
          {/* Status Icon */}
          <div className={`w-20 h-20 ${isActive ? 'bg-green-100' : 'bg-yellow-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
            {isActive ? (
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
          </div>

          {/* Status Text */}
          <h1 className={`text-xl font-bold ${isActive ? 'text-green-700' : 'text-yellow-700'} mb-1`}>
            {isActive ? 'Verified Member' : 'Inactive Member'}
          </h1>
          <p className={`text-sm ${isActive ? 'text-green-600' : 'text-yellow-600'} mb-4`}>
            {isActive ? 'This is a valid TIS Pioneer member.' : 'This member has not completed registration.'}
          </p>

          {/* Member Info */}
          <div className="bg-white/60 rounded-xl p-4 text-left space-y-2 border border-white">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Name</span>
              <span className="text-sm font-semibold text-gray-700">{data.full_name}</span>
            </div>
            {data.username && (
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Username</span>
                <span className="text-sm font-medium text-gray-600">@{data.username}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Pioneer ID</span>
              <span className="text-sm font-mono font-bold text-gray-700">{data.pioneer_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Batch</span>
              <span className="text-sm font-medium text-gray-600">{data.batch_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Status</span>
              <span className={`text-sm font-bold ${isActive ? 'text-green-600' : 'text-yellow-600'}`}>
                {isActive ? 'ACTIVE' : 'PENDING'}
              </span>
            </div>
          </div>

          {/* TIS Logo */}
          <div className="mt-5">
            <TISLogo size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
