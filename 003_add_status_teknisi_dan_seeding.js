import { Pool } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://netlifydb_owner:npg_pew0qA8tdMNz@ep-misty-frog-aj11o5kk.c-3.us-east-2.db.netlify.com/netlifydb?sslmode=require';
const pool = new Pool({ connectionString: DATABASE_URL });

async function migrateAndSeed() {
  try {
    console.log('Altering users table to add status_teknisi...');
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS status_teknisi VARCHAR(50) DEFAULT 'aktif';
    `);

    // Ensure existing technicians have 'aktif' if they are null
    await pool.query(`
      UPDATE users SET status_teknisi = 'aktif' WHERE role = 'teknisi' AND status_teknisi IS NULL;
    `);

    console.log('Seeding new technicians...');
    const hash = await bcrypt.hash('password123', 10);

    const newTechnicians = [
      { email: 'budi@sipekal.com', nama_lengkap: 'Budi' },
      { email: 'gibran@sipekal.com', nama_lengkap: 'Gibran' },
      { email: 'encep@sipekal.com', nama_lengkap: 'Encep' },
      { email: 'ahmad@sipekal.com', nama_lengkap: 'Ahmad' }
    ];

    for (const tech of newTechnicians) {
      await pool.query(`
        INSERT INTO users (email, password, role, nama_lengkap, status_teknisi) 
        VALUES ($1, $2, 'teknisi', $3, 'aktif')
        ON CONFLICT (email) DO UPDATE SET status_teknisi = 'aktif', password = $2;
      `, [tech.email, hash, tech.nama_lengkap]);
    }
    
    console.log('Database migration and seeding completed successfully.');
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    pool.end();
  }
}

migrateAndSeed();
