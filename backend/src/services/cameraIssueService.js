import pool from "../config/db.js";

export const fetchCameraIssues = async (status, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT ci.id, ci.issue_type, ci.status, ci.detected_at, c.id AS camera_id, c.name AS camera_name
     FROM camera_issues ci
     JOIN cameras c ON c.id = ci.camera_id
     WHERE ci.status = ?
     ORDER BY ci.detected_at DESC
     LIMIT ? OFFSET ?`,
    [status, limit, offset]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM camera_issues WHERE status = ?`,
    [status]
  );

  return { data: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};