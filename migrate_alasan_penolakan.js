import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function addColumn() {
  try {
    console.log('Adding alasan_penolakan column to tickets table...');
    await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS alasan_penolakan TEXT;`;
    console.log('Column added successfully.');
  } catch (error) {
    console.error('Error adding column:', error);
  }
}

addColumn();
