const bcrypt = require('bcryptjs');

async function test() {
  const hash = '$2b$10$5ke0knYm.Mh7Q5IuTRmhcuCt8dzUO7jhUdNNb26XqOVLJwNjI6Jye';
  const pass = 'admin123';
  const result = await bcrypt.compare(pass, hash);
  console.log('Result:', result);
}

test();
