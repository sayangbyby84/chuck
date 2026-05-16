import { neon } from '@neondatabase/serverless';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function seed() {
  console.log('Seeding database...');
  try {
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create Admin
    await sql`
      INSERT INTO users (email, password, role, nama_lengkap)
      VALUES ('admin@sipekal.com', ${passwordHash}, 'admin', 'Administrator SIPEKAL')
      ON CONFLICT (email) DO NOTHING
    `;
    console.log('Admin created.');

    // Create User
    await sql`
      INSERT INTO users (email, password, role, nama_lengkap)
      VALUES ('user@sipekal.com', ${passwordHash}, 'user', 'Staf Unit Lab')
      ON CONFLICT (email) DO NOTHING
    `;
    console.log('User created.');

    // Create Teknisi
    await sql`
      INSERT INTO users (email, password, role, nama_lengkap)
      VALUES ('teknisi@sipekal.com', ${passwordHash}, 'teknisi', 'Teknisi Ahmad')
      ON CONFLICT (email) DO NOTHING
    `;
    console.log('Teknisi created.');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
