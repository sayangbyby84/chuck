import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function addSLAColumns() {
  try {
    console.log('Adding batas_sla and status_sla columns to tickets table...');
    await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS batas_sla TIMESTAMP;`;
    await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS status_sla VARCHAR(50) DEFAULT 'Aman';`;
    console.log('Columns added successfully.');
  } catch (error) {
    console.error('Error adding columns:', error);
  }
}

addSLAColumns();
