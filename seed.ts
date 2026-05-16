import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './src/db/schema.js';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  // 1. Create Admin
  await db.insert(schema.users).values({
    email: 'admin@sipekal.com',
    password: hashedPassword,
    role: 'admin',
    nama_lengkap: 'Super Admin SIPEKAL',
  }).onConflictDoNothing();

  // 2. Create User (Pelapor)
  await db.insert(schema.users).values({
    email: 'user@sipekal.com',
    password: hashedPassword,
    role: 'user',
    nama_lengkap: 'Staff Pelaksana',
  }).onConflictDoNothing();

  // 3. Create Technician
  await db.insert(schema.users).values({
    email: 'teknisi@sipekal.com',
    password: hashedPassword,
    role: 'teknisi',
    nama_lengkap: 'Teknisi Utama',
  }).onConflictDoNothing();

  console.log('Seed completed successfully!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
