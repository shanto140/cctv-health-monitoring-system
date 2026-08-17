import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

export const findAccountByEmail = async(email) => {
  const [admins] = await pool.query(
    "SELECT id, name, email, phone, address, password, profile_image, is_active FROM admins WHERE email = ?",
    [email]
  );
  if (admins.length > 0) {
    return { ...admins[0], role: "Admin" };
  }

  const [technicians] = await pool.query(
    "SELECT id, name, email, phone, address, password, profile_image, is_active FROM technicians WHERE email = ?",
    [email]
  );
  if (technicians.length > 0) {
    return { ...technicians[0], role: "Technician" };
  }

  return null;
}

export const findAccountById = async (id, role) => {
  const table = role === "Admin" ? "admins" : "technicians";
  const [rows] = await pool.query(
    `SELECT id, name, email, phone, address, profile_image, is_active FROM ${table} WHERE id = ?`,
    [id]
  );
  if (rows.length === 0) return null;
  return { ...rows[0], role };
};

const saveRefreshToken = async(id, role, refreshToken) => {
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
      phone: account.phone,
      address: account.address,
      profile_image: account.profile_image,
    },
  };
}

export const findRefreshToken = async (id, role) => {
  const table = role === "Admin" ? "admins" : "technicians";
  const [[row]] = await pool.query(
    `SELECT refresh_token FROM ${table} WHERE id = ?`,
    [id]
  );
  return row?.refresh_token || null;
};

export const clearRefreshToken = async (id, role) => {
  const table = role === "Admin" ? "admins" : "technicians";
  await pool.query(`UPDATE ${table} SET refresh_token = NULL WHERE id = ?`, [id]);
};

export const updateProfileImage = async (id, role, imageUrl) => {
  const table = role === "Admin" ? "admins" : "technicians";
  await pool.query(`UPDATE ${table} SET profile_image = ? WHERE id = ?`, [imageUrl, id]);
  return imageUrl;
};

export const updateProfileFields = async (id, role, { name, phone, address }) => {
  const table = role === "Admin" ? "admins" : "technicians";
  await pool.query(
    `UPDATE ${table} SET name = ?, phone = ?, address = ? WHERE id = ?`,
    [name, phone || null, address || null, id]
  );
  const [rows] = await pool.query(
    `SELECT id, name, email, phone, address, profile_image, is_active FROM ${table} WHERE id = ?`,
    [id]
  );
  return { ...rows[0], role };
};