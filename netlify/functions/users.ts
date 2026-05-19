import { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import * as jwt from 'jsonwebtoken';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://netlifydb_owner:npg_pew0qA8tdMNz@ep-misty-frog-aj11o5kk.c-3.us-east-2.db.netlify.com/netlifydb?sslmode=require';
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
  if (!user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    if (event.httpMethod === 'POST' || event.httpMethod === 'PATCH') {
      const body = JSON.parse(event.body || '{}');
      if (body.action === 'update_status' && user.role === 'teknisi') {
        const { status_teknisi } = body;
        if (!['aktif', 'sedang bekerja', 'non-aktif'].includes(status_teknisi)) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid status' }) };
        }
        await sql`UPDATE users SET status_teknisi = ${status_teknisi} WHERE id = ${user.id}`;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
      }
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden' }) };
    }

    if (user.role === 'teknisi') {
      const self = await sql`SELECT id, email, nama_lengkap, status_teknisi FROM users WHERE id = ${user.id}`;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(self)
      };
    }

    if (user.role !== 'admin') {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden' }) };
    }

    const technicians = await sql`SELECT id, email, nama_lengkap, status_teknisi FROM users WHERE role = 'teknisi'`;
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
