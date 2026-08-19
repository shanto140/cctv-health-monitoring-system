import db from "../config/db.js";
import crypto from "crypto";

export const fetchTechnicians = async ({ page = 1, limit = 10, search = "" }) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push("name LIKE ?");
    params.push(`%${search}%`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await db.query(
    `SELECT id, name, email, phone, is_active
     FROM technicians
     ${whereClause}
     ORDER BY name ASC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM technicians ${whereClause}`,
    params
  );

  return { data: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const fetchTechnicianBasicInfo = async (id) => {
  const [[technician]] = await db.query(
    `SELECT id, name, email, phone, is_active, created_at FROM technicians WHERE id = ?`,
    [id]
  );
  return technician || null;
};

export const fetchTechnicianStats = async (id) => {
  const [[stats]] = await db.query(
    `SELECT
       COUNT(CASE WHEN status IN ('Assigned','In Progress') THEN 1 END) AS active_tasks,
       COUNT(CASE WHEN status = 'Completed' THEN 1 END) AS completed_tasks,
       COUNT(CASE WHEN status = 'Rejected' THEN 1 END) AS rejected_tasks
     FROM incidents WHERE assigned_technician_id = ?`,
    [id]
  );
  return stats;
};

export const fetchTechnicianWorkHistory = async (id, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const [rows] = await db.query(
    `SELECT
       i.id, i.status, i.priority, i.assigned_at, i.completed_at,
       c.name AS camera_name,
       ci.issue_type
     FROM incidents i
     JOIN cameras c ON c.id = i.camera_id
     LEFT JOIN camera_issues ci ON ci.id = i.camera_issue_id
     WHERE i.assigned_technician_id = ?
     ORDER BY i.assigned_at DESC
     LIMIT ? OFFSET ?`,
    [id, limit, offset]
  );

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM incidents WHERE assigned_technician_id = ?`,
    [id]
  );

  return { data: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const fetchTechniciansWithWorkload = async () => {
  const [rows] = await db.query(`
    SELECT
      t.id,
      t.name,
      COUNT(CASE WHEN i.status IN ('Assigned','In Progress') THEN 1 END) AS active_tasks,
      COUNT(CASE WHEN i.status = 'Completed'
        AND i.completed_at >= NOW() - INTERVAL 7 DAY THEN 1 END) AS completed_last_7_days
    FROM technicians t
    LEFT JOIN incidents i ON i.assigned_technician_id = t.id
    WHERE t.is_active = TRUE
    GROUP BY t.id
    ORDER BY active_tasks ASC, completed_last_7_days ASC
  `);
  return rows;
};

export const insertTechnician = async ({ name, email, phone, address }) => {
  const tempPassword = crypto.randomBytes(4).toString("hex"); // TODO: bcrypt দিয়ে hash করো

  const [result] = await db.query(
    `INSERT INTO technicians (name, email, phone, address, password, is_active) VALUES (?, ?, ?, ?, ?, TRUE)`,
    [name, email, phone || null, address || null, tempPassword]
  );

  return { id: result.insertId, name, email, phone, address, tempPassword };
};

export const setTechnicianActiveStatus = async (id, isActive) => {
  const [result] = await db.query(
    `UPDATE technicians SET is_active = ? WHERE id = ?`,
    [isActive, id]
  );
  return result.affectedRows > 0;
};