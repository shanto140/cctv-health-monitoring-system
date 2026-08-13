import pool from "../config/db.js";

export const fetchCameras = async ({ page = 1, limit = 10, search = "", status = "" }) => {
  const offset = (page - 1) * limit;
  const conditions = ["is_active = TRUE"];
  const params = [];

  if (search) {
    conditions.push("(name LIKE ? OR location LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  if (status) {
    conditions.push("current_status = ?");
    params.push(status);
  }

  const whereClause = conditions.join(" AND ");

  const [rows] = await pool.query(
    `SELECT id, name, location, current_status, status_updated_at
     FROM cameras
     WHERE ${whereClause}
     ORDER BY name ASC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM cameras WHERE ${whereClause}`,
    params
  );

  return { data: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const fetchCameraById = async (id) => {
  const [[camera]] = await pool.query(
    `SELECT id, name, location, ip_address, stream_url, current_status, status_updated_at, created_at
     FROM cameras WHERE id = ? AND is_active = TRUE`,
    [id]
  );
  return camera || null;
};

export const fetchCameraIssueHistory = async (cameraId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT id, issue_type, status, detected_at, resolved_at
     FROM camera_issues
     WHERE camera_id = ?
     ORDER BY detected_at DESC
     LIMIT ? OFFSET ?`,
    [cameraId, limit, offset]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM camera_issues WHERE camera_id = ?`,
    [cameraId]
  );

  return { data: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};


export const insertCamera = async ({ name, location, ip_address, stream_url }) => {
  const [result] = await pool.query(
    `INSERT INTO cameras (name, location, ip_address, stream_url, current_status)
     VALUES (?, ?, ?, ?, 'Offline')`,
    [name, location, ip_address || null, stream_url]
  );
  return { id: result.insertId, name, location, ip_address, stream_url, current_status: "Offline" };
};

export const updateCameraById = async (id, { name, location, ip_address, stream_url }) => {
  const [result] = await pool.query(
    `UPDATE cameras SET name = ?, location = ?, ip_address = ?, stream_url = ?
     WHERE id = ? AND is_active = TRUE`,
    [name, location, ip_address || null, stream_url, id]
  );
  if (result.affectedRows === 0) return null;
  return { id, name, location, ip_address, stream_url };
};

export const softDeleteCamera = async (id) => {
  const [result] = await pool.query(
    `UPDATE cameras SET is_active = FALSE WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};