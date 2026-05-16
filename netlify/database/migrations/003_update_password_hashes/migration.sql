-- Update password hashes for all seeded users to correct bcrypt values
UPDATE users SET password = '$2b$10$DtzfuFf/DQiYwQYK2T67pOlEUVLCo5KQ4XrmP4eRAKvDDHC.c7aYq'
WHERE email IN ('admin@sipekal.com', 'user@sipekal.com', 'teknisi@sipekal.com');
