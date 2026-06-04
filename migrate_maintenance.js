import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function migrateMaintenance() {
  try {
    console.log('Creating maintenance_schedules table...');
    await sql`
      CREATE TABLE IF NOT EXISTS maintenance_schedules (
        id SERIAL PRIMARY KEY,
        nama_alat VARCHAR(255) NOT NULL,
        kategori_alat VARCHAR(100) NOT NULL,
        lokasi_ruangan VARCHAR(255) NOT NULL,
        frekuensi_bulan INTEGER NOT NULL,
        tgl_mulai TIMESTAMP NOT NULL,
        tgl_berikutnya TIMESTAMP NOT NULL,
        teknisi_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Table maintenance_schedules created successfully.');
  } catch (error) {
    console.error('Error creating maintenance_schedules:', error);
  }
}

migrateMaintenance();
