import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function seedTechnicians() {
  try {
    console.log('Seeding specific technicians...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const teknisiList = [
      { email: 'encep@sipekal.com', nama: 'Encep', role: 'teknisi' },
      { email: 'gibran@sipekal.com', nama: 'Gibran', role: 'teknisi' },
      { email: 'ahmad@sipekal.com', nama: 'Ahmad', role: 'teknisi' },
      { email: 'budi@sipekal.com', nama: 'Budi', role: 'teknisi' }
    ];

    for (const t of teknisiList) {
      await sql`
        INSERT INTO users (email, password, role, nama_lengkap, status_teknisi)
        VALUES (${t.email}, ${hashedPassword}, ${t.role}, ${t.nama}, 'aktif')
        ON CONFLICT (email) DO NOTHING;
      `;
      console.log(`Inserted or verified ${t.email}`);
    }

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding technicians:', error);
  }
}

seedTechnicians();
