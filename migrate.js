import { Pool } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = 'postgresql://netlifydb_owner:npg_79yEVJbSaTgo@ep-calm-credit-ajct88wc.c-3.us-east-2.db.netlify.com/netlifydb?sslmode=require';
const pool = new Pool({ connectionString: DATABASE_URL });

async function runMigrations() {
  try {
    console.log('Dropping tables...');
    await pool.query('DROP TABLE IF EXISTS tickets, users CASCADE');
    console.log('Running 001_create_tables...');
    const createTablesSql = fs.readFileSync(path.join(process.cwd(), 'netlify/database/migrations/001_create_tables/migration.sql'), 'utf8');
    await pool.query(createTablesSql);
    console.log('Tables created successfully.');

    console.log('Running 002_seed_initial_data...');
    const seedDataSql = fs.readFileSync(path.join(process.cwd(), 'netlify/database/migrations/002_seed_initial_data/migration.sql'), 'utf8');
    await pool.query(seedDataSql);
    console.log('Data seeded successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigrations();
