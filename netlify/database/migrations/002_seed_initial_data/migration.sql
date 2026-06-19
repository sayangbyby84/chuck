-- Seed initial users for SIPEKAL
INSERT INTO users (email, password, role, nama_lengkap) VALUES 
('admin@sipekal.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LkdEWOMnSWO', 'admin', 'Super Admin SIPEKAL'),
('user@sipekal.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LkdEWOMnSWO', 'user', 'Staff Pelaksana'),
('teknisi@sipekal.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LkdEWOMnSWO', 'teknisi', 'Teknisi Utama');
