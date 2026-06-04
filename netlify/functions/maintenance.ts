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
    return null;
  }
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const user = getUserIdFromToken(event.headers.authorization);
  const { httpMethod } = event;

  try {
    // PUBLIC / BACKGROUND ENDPOINT: Check and generate tickets
    if (httpMethod === 'POST' && event.path.endsWith('/check')) {
      // Find all due maintenance schedules
      const dueSchedules = await sql`
        SELECT * FROM maintenance_schedules 
        WHERE tgl_berikutnya <= NOW()
      `;

      let generatedCount = 0;
      for (const schedule of dueSchedules) {
        const ticketNumber = `PM-${Date.now()}-${schedule.id}`;
        const batasSla = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const judul = `Pemeliharaan Berkala - ${schedule.nama_alat}`;
        const deskripsi = `Lakukan preventive maintenance untuk ${schedule.nama_alat} di ${schedule.lokasi_ruangan}. Checklist SOP wajib diselesaikan.`;

        // 1. Insert new ticket
        await sql`
          INSERT INTO tickets (ticket_number, status, pelapor_id, judul, kategori, lokasi, prioritas, deskripsi, tgl_kejadian, teknisi_id, batas_sla)
          VALUES (${ticketNumber}, 'ditugaskan', NULL, ${judul}, 'Preventive Maintenance', ${schedule.lokasi_ruangan}, 'Sedang', ${deskripsi}, NOW(), ${schedule.teknisi_id}, ${batasSla})
        `;

        // 2. Update schedule's tgl_berikutnya
        const nextDate = new Date(Date.now());
        nextDate.setMonth(nextDate.getMonth() + schedule.frekuensi_bulan);
        await sql`
          UPDATE maintenance_schedules 
          SET tgl_berikutnya = ${nextDate.toISOString()}, updated_at = NOW()
          WHERE id = ${schedule.id}
        `;

        generatedCount++;
      }

      return { statusCode: 200, headers, body: JSON.stringify({ message: `Generated ${generatedCount} PM tickets.` }) };
    }

    // Require Auth for CRUD
    if (!user) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    if (httpMethod === 'GET') {
      let query;
      if (user.role === 'teknisi') {
        query = await sql`
          SELECT ms.*, u.nama_lengkap as teknisi_nama 
          FROM maintenance_schedules ms
          LEFT JOIN users u ON ms.teknisi_id = u.id
          WHERE ms.teknisi_id = ${user.id}
          ORDER BY ms.tgl_berikutnya ASC
        `;
      } else {
        query = await sql`
          SELECT ms.*, u.nama_lengkap as teknisi_nama 
          FROM maintenance_schedules ms
          LEFT JOIN users u ON ms.teknisi_id = u.id
          ORDER BY ms.tgl_berikutnya ASC
        `;
      }
      return { statusCode: 200, headers, body: JSON.stringify(query) };
    }

    if (httpMethod === 'POST') {
      if (user.role !== 'admin') return { statusCode: 403, headers, body: 'Forbidden' };
      const body = JSON.parse(event.body || '{}');

      const tglMulai = new Date(body.tgl_mulai);
      const tglBerikutnya = new Date(tglMulai);
      tglBerikutnya.setMonth(tglBerikutnya.getMonth() + parseInt(body.frekuensi_bulan));

      const result = await sql`
        INSERT INTO maintenance_schedules (nama_alat, kategori_alat, lokasi_ruangan, frekuensi_bulan, tgl_mulai, tgl_berikutnya, teknisi_id)
        VALUES (${body.nama_alat}, ${body.kategori_alat}, ${body.lokasi_ruangan}, ${body.frekuensi_bulan}, ${tglMulai.toISOString()}, ${tglBerikutnya.toISOString()}, ${body.teknisi_id})
        RETURNING *
      `;
      return { statusCode: 201, headers, body: JSON.stringify(result[0]) };
    }

    if (httpMethod === 'DELETE') {
      if (user.role !== 'admin') return { statusCode: 403, headers, body: 'Forbidden' };
      const body = JSON.parse(event.body || '{}');
      await sql`DELETE FROM maintenance_schedules WHERE id = ${body.id}`;
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  } catch (error) {
    console.error('[MAINTENANCE] Error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
