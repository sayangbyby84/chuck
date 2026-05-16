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
    console.error('[DASHBOARD] Token verification failed:', e.message);
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
    if (user.role === 'admin') {
      const total = await sql`SELECT COUNT(*) FROM tickets`;
      const completed = await sql`SELECT COUNT(*) FROM tickets WHERE status IN ('selesai_teknisi', 'tertutup')`;
      const process = await sql`SELECT COUNT(*) FROM tickets WHERE status IN ('ditugaskan', 'diproses')`;
      const pending = await sql`SELECT COUNT(*) FROM tickets WHERE status = 'menunggu'`;
      
      const categories = await sql`SELECT kategori, COUNT(*) as count FROM tickets GROUP BY kategori`;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          stats: {
            total: parseInt(total[0].count),
            completed: parseInt(completed[0].count),
            process: parseInt(process[0].count),
            pending: parseInt(pending[0].count)
          },
          categories
        })
      };
    } else if (user.role === 'teknisi') {
      const total = await sql`SELECT COUNT(*) FROM tickets WHERE teknisi_id = ${user.id}`;
      const completed = await sql`SELECT COUNT(*) FROM tickets WHERE teknisi_id = ${user.id} AND status IN ('selesai_teknisi', 'tertutup')`;
      const process = await sql`SELECT COUNT(*) FROM tickets WHERE teknisi_id = ${user.id} AND status = 'diproses'`;
      const newTasks = await sql`SELECT COUNT(*) FROM tickets WHERE teknisi_id = ${user.id} AND status = 'ditugaskan'`;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          stats: {
            total: parseInt(total[0].count),
            completed: parseInt(completed[0].count),
            process: parseInt(process[0].count),
            new: parseInt(newTasks[0].count)
          }
        })
      };
    } else {
      const total = await sql`SELECT COUNT(*) FROM tickets WHERE pelapor_id = ${user.id}`;
      const completed = await sql`SELECT COUNT(*) FROM tickets WHERE pelapor_id = ${user.id} AND status = 'tertutup'`;
      const process = await sql`SELECT COUNT(*) FROM tickets WHERE pelapor_id = ${user.id} AND status IN ('ditugaskan', 'diproses', 'selesai_teknisi')`;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          stats: {
            total: parseInt(total[0].count),
            completed: parseInt(completed[0].count),
            process: parseInt(process[0].count)
          }
        })
      };
    }
  } catch (error) {
    console.error('[DASHBOARD] Error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
