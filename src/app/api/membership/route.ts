import { NextRequest, NextResponse } from 'next/server';
import { getSessionPioneer } from '@/lib/db';
import QRCode from 'qrcode';

// GET /api/membership - Get membership data + QR code
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('tis_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const pioneer = await getSessionPioneer(token);
    if (!pioneer) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    if (!pioneer.registered_at) {
      return NextResponse.json({ error: 'Not registered yet' }, { status: 403 });
    }

    // Generate membership QR code
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const membershipUrl = `${baseUrl}/verify/${pioneer.pioneer_id}`;

    let qrDataUrl: string;
    try {
      qrDataUrl = await QRCode.toDataURL(membershipUrl, {
        width: 300,
        margin: 2,
        color: { dark: '#1a1a1a', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      });
    } catch {
      return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
    }

    return NextResponse.json({
      pioneer_id: pioneer.pioneer_id,
      username: pioneer.username,
      full_name: pioneer.full_name,
      email: pioneer.email,
      phone: pioneer.phone,
      address: pioneer.address,
      birth_date: pioneer.birth_date,
      bio: pioneer.bio,
      batch_number: pioneer.batch_number,
      claim_status: pioneer.claim_status,
      claim_date: pioneer.claim_date,
      registered_at: pioneer.registered_at,
      qr_code: qrDataUrl,
      membership_url: membershipUrl,
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
