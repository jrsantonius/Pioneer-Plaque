import { NextRequest, NextResponse } from 'next/server';
import { getPioneerById } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const pioneer = await getPioneerById(code);

    if (!pioneer) {
      return NextResponse.json({ error: 'Pioneer not found' }, { status: 404 });
    }

    return NextResponse.json({
      pioneer_id: pioneer.pioneer_id,
      unique_code: pioneer.unique_code,
      batch_number: pioneer.batch_number,
      claim_status: pioneer.claim_status,
      claim_date: pioneer.claim_date,
      full_name: pioneer.full_name || 'FULL NAME',
      email: pioneer.email,
      phone: pioneer.phone,
      username: pioneer.username,
      registered: !!pioneer.registered_at,
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
