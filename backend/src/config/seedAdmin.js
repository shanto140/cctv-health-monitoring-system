import "dotenv/config";
import bcrypt from "bcryptjs";
import pool from "./db.js";

async function createAdmin() {
  const [name, email, password] = process.argv.slice(2);

  if (!name || !email || !password) {
    console.log(
      "Usage: node src/config/seedAdmin.js <name> <email> <password>"
    );
    process.exit(1);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    console.error("Invalid email address.");
    process.exit(1);
  }


  if (password.length < 6) {
    console.error("Password must be at least 6 characters long.");
    process.exit(1);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO admins (name, email, password, is_active)
       VALUES (?, ?, ?, TRUE)`,
      [name, email, hashedPassword],
    );

    console.log(`Admin account created for ${email}`);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      console.error(`An account with email ${email} already exists.`);
    } else {
      console.error("Failed to create admin:", err.message);
    }
  } finally {
    await pool.end();
  }
}

createAdmin();