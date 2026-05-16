import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function setup() {
  console.log('Setting up database...');
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role VARCHAR(50) NOT NULL,
        nama_lengkap VARCHAR(255) NOT NULL
      )
    `;
    console.log('Users table created.');

    await sql`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        ticket_number VARCHAR(50) NOT NULL UNIQUE,
        status VARCHAR(50) NOT NULL DEFAULT 'menunggu',
        pelapor_id INTEGER REFERENCES users(id),
        judul VARCHAR(255) NOT NULL,
        kategori VARCHAR(100) NOT NULL,
        lokasi VARCHAR(255) NOT NULL,
        prioritas VARCHAR(50) NOT NULL,
        deskripsi TEXT NOT NULL,
        foto_kerusakan TEXT,
        tgl_kejadian TIMESTAMP NOT NULL,
        teknisi_id INTEGER REFERENCES users(id),
        catatan_perbaikan TEXT,
        foto_selesai TEXT,
        tgl_selesai TIMESTAMP,
        durasi_kerja INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Tickets table created.');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setup();
