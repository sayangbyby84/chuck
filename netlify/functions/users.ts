import { Handler } from '@netlify/functions';
import { getDatabase } from '@netlify/database';
import * as jwt from 'jsonwebtoken';
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
    const db = await getDatabase();
    const technicians = await db.sql`SELECT id, email, nama_lengkap FROM users WHERE role = 'teknisi'`;
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
