import { NextRequest, NextResponse } from 'next/server';
import { getSessionPioneer, registerPioneer, updatePioneerProfile, getPioneerByUsername } from '@/lib/db';

// POST /api/register - Register or update profile
export async function POST(request: NextRequest) {
  const token = request.cookies.get('tis_session')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const pioneer = await getSessionPioneer(token);
  if (!pioneer) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { full_name, email, phone, address, birth_date, username, bio } = data;

    // Validation
    if (!full_name || !email || !phone || !username) {
      return NextResponse.json({ error: 'Full name, email, phone, and username are required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 8) {
      return NextResponse.json({ error: 'Phone number must have at least 8 digits' }, { status: 400 });
    }

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json({ error: 'Username must be 3-30 characters' }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: 'Username can only contain letters, numbers, and underscores' }, { status: 400 });
    }

    const existingUser = await getPioneerByUsername(username);
    if (existingUser && existingUser.pioneer_id !== pioneer.pioneer_id) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
    }

    const profileData = { full_name, email, phone, address, birth_date, username, bio };

    if (pioneer.registered_at) {
      await updatePioneerProfile(pioneer.pioneer_id, profileData);
    } else {
      await registerPioneer(pioneer.pioneer_id, profileData);
    }

    return NextResponse.json({ success: true, message: 'Profile saved successfully' });
  } catch {
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
  }
}
