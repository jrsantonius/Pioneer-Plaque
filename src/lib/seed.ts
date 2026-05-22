import { sql } from '@vercel/postgres';
import { initDb } from './db';

function generateUniqueCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function seed() {
  console.log('Initializing tables...');
  await initDb();

  // Check existing
  const { rows } = await sql`SELECT COUNT(*) as count FROM pioneers`;
  const count = parseInt(rows[0].count);

  if (count > 0) {
    console.log(`Database already has ${count} pioneers. Clearing...`);
    await sql`DELETE FROM sessions`;
    await sql`DELETE FROM pioneers`;
  }

  console.log('Seeding 500 pioneers (TIS-0001 to TIS-0500)...');

  const usedCodes = new Set<string>();

  for (let i = 1; i <= 500; i++) {
    const pioneerId = `TIS-${String(i).padStart(4, '0')}`;
    let code: string;
    do {
      code = generateUniqueCode();
    } while (usedCodes.has(code));
    usedCodes.add(code);

    await sql`INSERT INTO pioneers (pioneer_id, unique_code, batch_number) VALUES (${pioneerId}, ${code}, 'BATCH-01')`;

    if (i % 50 === 0) {
      console.log(`  Seeded ${i}/500...`);
    }
  }

  console.log('\nDone! 500 pioneers seeded.\n');

  // Show sample
  const { rows: samples } = await sql`SELECT pioneer_id, unique_code, batch_number FROM pioneers ORDER BY id LIMIT 10`;
  console.log('Sample pioneers (first 10):');
  console.log('Pioneer ID   | Unique Code | Batch');
  console.log('-------------|-------------|----------');
  for (const s of samples) {
    console.log(`${s.pioneer_id}      | ${s.unique_code}    | ${s.batch_number}`);
  }
}

seed().catch(console.error);
