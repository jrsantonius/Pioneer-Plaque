import { NextRequest, NextResponse } from 'next/server';
import { getPioneerByCode, createSession, getSessionPioneer, deleteSession, cleanupExpiredSessions } from '@/lib/db';

// POST /api/auth - Login with unique code
export async function POST(request: NextRequest) {
  try {
    const { unique_code } = await request.json();

    if (!unique_code || typeof unique_code !== 'string') {
      return NextResponse.json({ error: 'Unique code is required' }, { status: 400 });
    }

    await cleanupExpiredSessions();

    const pioneer = await getPioneerByCode(unique_code.toUpperCase().trim());
    if (!pioneer) {
      return NextResponse.json({ error: 'Invalid unique code. Please check and try again.' }, { status: 401 });
    }

    const token = await createSession(pioneer.pioneer_id);

    const response = NextResponse.json({
      success: true,
      pioneer_id: pioneer.pioneer_id,
      registered: !!pioneer.registered_at,
    });

    response.cookies.set('tis_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// GET /api/auth - Check session
export async function GET(request: NextRequest) {
  const token = request.cookies.get('tis_session')?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const pioneer = await getSessionPioneer(token);
  if (!pioneer) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    pioneer_id: pioneer.pioneer_id,
    registered: !!pioneer.registered_at,
    full_name: pioneer.full_name,
    username: pioneer.username,
    email: pioneer.email,
    phone: pioneer.phone,
    address: pioneer.address,
    birth_date: pioneer.birth_date,
    bio: pioneer.bio,
    batch_number: pioneer.batch_number,
    claim_status: pioneer.claim_status,
    claim_date: pioneer.claim_date,
  });
}

// DELETE /api/auth - Logout
export async function DELETE(request: NextRequest) {
  const token = request.cookies.get('tis_session')?.value;
  if (token) {
    await deleteSession(token);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete('tis_session');
  return response;
}
