require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./db');

const seed = async () => {
  const name = 'Super Admin';
  const email = 'admin@cctv.com';
  const plainPassword = 'admin123'; 
  const hashed = await bcrypt.hash(plainPassword, 10);

  try {
    await db.query(
      `INSERT INTO admins (name, email, password, is_active) VALUES (?, ?, ?, TRUE)`,
      [name, email, hashed]
    );
    console.log(`Admin created -> email: ${email}, password: ${plainPassword}`);
  } catch (err) {
    console.error('Seed failed (হয়তো আগে থেকেই আছে):', err.message);
  }
  process.exit();
};

seed();
