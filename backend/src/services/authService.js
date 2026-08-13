import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";


export const findAccountByEmail = async(email) => {

  const [admins] = await pool.query(
    "SELECT id, name, email, password, is_active FROM admins WHERE email = ?",
    [email]
  );
  if (admins.length > 0) {  
    console.log("admin");
    return { ...admins[0], role: "Admin" };
  }
   
  const [technicians] = await pool.query(
    "SELECT id, name, email, password, is_active FROM technicians WHERE email = ?",
    [email]
  );
  if (technicians.length > 0) {
    console.log("admin");
    return { ...technicians[0], role: "Technician" };
  }

  return null;
}

const saveRefreshToken =async(id, role, refreshToken) => {
  const table = role === "Admin" ? "admins" : "technicians";
  await pool.query(`UPDATE ${table} SET refresh_token = ? WHERE id = ?`, [refreshToken, id]);
}

export const login = async({ email, password }) => {
  const account = await findAccountByEmail(email);

  if (!account) {
    throw { status: 401, message: "Invalid email or password." };
  }
  
  if (!account.is_active) {
    throw { status: 403, message: "This account has been deactivated. Contact an admin." };
  }

  const passwordMatches = await bcrypt.compare(password, account.password);
  if (!passwordMatches) {
    throw { status: 401, message: "Invalid email or password." };
  }
   
  const payload = { id: account.id, role: account.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await saveRefreshToken(account.id, account.role, refreshToken);

  return {
    accessToken,
    refreshToken,
    user: {
      role: account.role,
      id: account.id,
      name: account.name,
      email: account.email,
    },
  };
}

export const findRefreshToken = async (id, role) => {
  const table = role === "Admin" ? "admins" : "technicians";
  const [[row]] = await db.query(
    `SELECT refresh_token FROM ${table} WHERE id = ?`,
    [id]
  );
  return row?.refresh_token || null;
};

