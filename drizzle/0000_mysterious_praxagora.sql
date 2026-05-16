CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_number" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'menunggu' NOT NULL,
	"pelapor_id" integer,
	"judul" varchar(255) NOT NULL,
	"kategori" varchar(100) NOT NULL,
	"lokasi" varchar(255) NOT NULL,
	"prioritas" varchar(50) NOT NULL,
	"deskripsi" text NOT NULL,
	"foto_kerusakan" text,
	"tgl_kejadian" timestamp NOT NULL,
	"teknisi_id" integer,
	"catatan_perbaikan" text,
	"foto_selesai" text,
	"tgl_selesai" timestamp,
	"durasi_kerja" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tickets_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"role" varchar(50) NOT NULL,
	"nama_lengkap" varchar(255) NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_pelapor_id_users_id_fk" FOREIGN KEY ("pelapor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_teknisi_id_users_id_fk" FOREIGN KEY ("teknisi_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;