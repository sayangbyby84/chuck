-- Seed initial users for SIPEKAL
INSERT INTO users (email, password, role, nama_lengkap) VALUES 
('admin@sipekal.com', '$2b$10$DtzfuFf/DQiYwQYK2T67pOlEUVLCo5KQ4XrmP4eRAKvDDHC.c7aYq', 'admin', 'Super Admin SIPEKAL'),
('user@sipekal.com', '$2b$10$DtzfuFf/DQiYwQYK2T67pOlEUVLCo5KQ4XrmP4eRAKvDDHC.c7aYq', 'user', 'Staff Pelaksana'),
('teknisi@sipekal.com', '$2b$10$DtzfuFf/DQiYwQYK2T67pOlEUVLCo5KQ4XrmP4eRAKvDDHC.c7aYq', 'teknisi', 'Teknisi Utama');
