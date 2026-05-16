import bcrypt from 'bcryptjs';

const hash = '$2b$10$5ke0knYm.Mh7Q5IuTRmhcuCt8dzUO7jhUdNNb26XqOVLJwNjI6Jye';
const password = 'admin123';

const match = await bcrypt.compare(password, hash);
console.log('Match:', match);
