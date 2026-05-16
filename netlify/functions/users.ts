import { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import * as jwt from 'jsonwebtoken';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_JLClkY1g8umb@ep-patient-grass-ajpo9ogw-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);
const JWT_SECRET = process.env.JWT_SECRET || 'sipekal_secret_key_2024_fresh';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

const getUserIdFromToken = (token?: string) => {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET) as any;
    return decoded;
  } catch (e) {
    console.error('[USERS] Token verification failed:', e.message);
    return null;
  }
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const user = getUserIdFromToken(event.headers.authorization);
  if (!user || user.role !== 'admin') {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const technicians = await sql`SELECT id, email, nama_lengkap FROM users WHERE role = 'teknisi'`;
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(technicians)
    };
  } catch (error) {
    console.error('[USERS] Error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
