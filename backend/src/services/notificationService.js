import pool from "../config/db.js";

// নতুন notification তৈরি (অন্য service থেকে কল হবে, যেমন: assign, reject, complete)
export const createNotification = async ({ receiver_id, receiver_role, message }) => {
  const [result] = await pool.query(
    `INSERT INTO notifications (receiver_id, receiver_role, message) VALUES (?, ?, ?)`,
    [receiver_id, receiver_role, message]
  );
  return { id: result.insertId, receiver_id, receiver_role, message, is_read: false };
};

// লগইন করা ইউজারের নিজের notification লিস্ট (পেজিনেটেড, সবচেয়ে নতুনটা আগে)
export const getMyNotificationsList = async (userId, role, { page = 1, limit = 10 } = {}) => {
  const offset = (page - 1) * limit;

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM notifications WHERE receiver_id = ? AND receiver_role = ?`,
    [userId, role]
  );
  const total = countRows[0].total;

  const [rows] = await pool.query(
    `SELECT id, message, is_read, created_at
     FROM notifications
     WHERE receiver_id = ? AND receiver_role = ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, role, Number(limit), Number(offset)]
  );

  return {
    data: rows,
    page: Number(page),
    totalPages: Math.ceil(total / limit) || 1,
  };
};

export const getUnreadCountForUser = async (userId, role) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS unread FROM notifications WHERE receiver_id = ? AND receiver_role = ? AND is_read = FALSE`,
    [userId, role]
  );
  return rows[0].unread;
};

export const markNotificationRead = async (id, userId, role) => {
  await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE id = ? AND receiver_id = ? AND receiver_role = ?`,
    [id, userId, role]
  );
};

export const markAllNotificationsRead = async (userId, role) => {
  await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE receiver_id = ? AND receiver_role = ? AND is_read = FALSE`,
    [userId, role]
  );
};