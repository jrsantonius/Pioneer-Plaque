import { sql } from '@vercel/postgres';
import { randomBytes } from 'crypto';

// --- Init tables ---

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS pioneers (
      id SERIAL PRIMARY KEY,
      pioneer_id TEXT UNIQUE NOT NULL,
      unique_code TEXT UNIQUE NOT NULL,
      batch_number TEXT NOT NULL DEFAULT 'BATCH-01',
      claim_status TEXT NOT NULL DEFAULT 'UNCLAIMED',
      claim_date TIMESTAMP,
      full_name TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      birth_date TEXT,
      username TEXT UNIQUE,
      bio TEXT,
      registered_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      token TEXT UNIQUE NOT NULL,
      pioneer_id TEXT NOT NULL REFERENCES pioneers(pioneer_id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMP NOT NULL
    )
  `;
}

// --- Pioneer types ---

export interface Pioneer {
  id: number;
  pioneer_id: string;
  unique_code: string;
  batch_number: string;
  claim_status: string;
  claim_date: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  birth_date: string | null;
  username: string | null;
  bio: string | null;
  registered_at: string | null;
  created_at: string;
}

// --- Pioneer queries ---

export async function getPioneerByCode(uniqueCode: string): Promise<Pioneer | undefined> {
  const { rows } = await sql`SELECT * FROM pioneers WHERE unique_code = ${uniqueCode.toUpperCase().trim()}`;
  return rows[0] as Pioneer | undefined;
}

export async function getPioneerById(pioneerId: string): Promise<Pioneer | undefined> {
  const { rows } = await sql`SELECT * FROM pioneers WHERE pioneer_id = ${pioneerId}`;
  return rows[0] as Pioneer | undefined;
}

export async function getPioneerByUsername(username: string): Promise<Pioneer | undefined> {
  const { rows } = await sql`SELECT * FROM pioneers WHERE username = ${username}`;
  return rows[0] as Pioneer | undefined;
}

export async function registerPioneer(
  pioneerId: string,
  data: { full_name: string; email: string; phone: string; address?: string; birth_date?: string; username: string; bio?: string }
) {
  await sql`
    UPDATE pioneers SET
      full_name = ${data.full_name},
      email = ${data.email},
      phone = ${data.phone},
      address = ${data.address || null},
      birth_date = ${data.birth_date || null},
      username = ${data.username},
      bio = ${data.bio || null},
      registered_at = NOW(),
      claim_status = 'CLAIMED',
      claim_date = COALESCE(claim_date, NOW())
    WHERE pioneer_id = ${pioneerId}
  `;
}

export async function updatePioneerProfile(
  pioneerId: string,
  data: { full_name: string; email: string; phone: string; address?: string; birth_date?: string; username: string; bio?: string }
) {
  await sql`
    UPDATE pioneers SET
      full_name = ${data.full_name},
      email = ${data.email},
      phone = ${data.phone},
      address = ${data.address || null},
      birth_date = ${data.birth_date || null},
      username = ${data.username},
      bio = ${data.bio || null}
    WHERE pioneer_id = ${pioneerId}
  `;
}

// --- Session queries ---

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export async function createSession(pioneerId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  await sql`INSERT INTO sessions (token, pioneer_id, expires_at) VALUES (${token}, ${pioneerId}, ${expiresAt.toISOString()})`;
  return token;
}

export async function getSessionPioneer(token: string): Promise<Pioneer | undefined> {
  const { rows } = await sql`SELECT pioneer_id FROM sessions WHERE token = ${token} AND expires_at > NOW()`;
  if (!rows[0]) return undefined;
  return getPioneerById(rows[0].pioneer_id);
}

export async function deleteSession(token: string) {
  await sql`DELETE FROM sessions WHERE token = ${token}`;
}

export async function cleanupExpiredSessions() {
  await sql`DELETE FROM sessions WHERE expires_at <= NOW()`;
}
