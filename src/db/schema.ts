import { pgTable, serial, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  role: varchar('role', { length: 50 }).notNull(), // admin, user, teknisi
  nama_lengkap: varchar('nama_lengkap', { length: 255 }).notNull(),
});

export const tickets = pgTable('tickets', {
  id: serial('id').primaryKey(),
  ticket_number: varchar('ticket_number', { length: 50 }).notNull().unique(),
  status: varchar('status', { length: 50 }).notNull().default('menunggu'), // menunggu, ditugaskan, diproses, selesai_teknisi, tertutup
  pelapor_id: integer('pelapor_id').references(() => users.id),
  judul: varchar('judul', { length: 255 }).notNull(),
  kategori: varchar('kategori', { length: 100 }).notNull(),
  lokasi: varchar('lokasi', { length: 255 }).notNull(),
  prioritas: varchar('prioritas', { length: 50 }).notNull(), // Rendah, Sedang, Tinggi, Darurat
  deskripsi: text('deskripsi').notNull(),
  foto_kerusakan: text('foto_kerusakan'),
  tgl_kejadian: timestamp('tgl_kejadian').notNull(),
  teknisi_id: integer('teknisi_id').references(() => users.id),
  catatan_perbaikan: text('catatan_perbaikan'),
  foto_selesai: text('foto_selesai'),
  tgl_selesai: timestamp('tgl_selesai'),
  durasi_kerja: integer('durasi_kerja'), // in minutes
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
