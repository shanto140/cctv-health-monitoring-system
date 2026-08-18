import pool from "../config/db.js";

// camera_issues (alert detected) + incidents (created/assigned/resolved) — একসাথে টাইমলাইন হিসেবে
const buildUnionQuery = () => `
  SELECT 'Alert' AS event_type,
         CONCAT(ci.issue_type, ' detected') AS message,
         c.id AS camera_id, c.name AS camera_name,
         ci.detected_at AS event_time
  FROM camera_issues ci
  JOIN cameras c ON c.id = ci.camera_id

  UNION ALL

  SELECT 'Incident Created' AS event_type,
         CONCAT('Incident opened (', COALESCE(ci.issue_type, 'Manual'), ')') AS message,
         c.id AS camera_id, c.name AS camera_name,
         i.created_at AS event_time
  FROM incidents i
  JOIN cameras c ON c.id = i.camera_id
  LEFT JOIN camera_issues ci ON i.camera_issue_id = ci.id

  UNION ALL

  SELECT 'Assigned' AS event_type,
         'Technician assigned' AS message,
         c.id AS camera_id, c.name AS camera_name,
         i.assigned_at AS event_time
  FROM incidents i
  JOIN cameras c ON c.id = i.camera_id
  WHERE i.assigned_at IS NOT NULL

  UNION ALL

  SELECT 'Resolved' AS event_type,
         'Incident resolved' AS message,
         c.id AS camera_id, c.name AS camera_name,
         i.completed_at AS event_time
  FROM incidents i
  JOIN cameras c ON c.id = i.camera_id
  WHERE i.completed_at IS NOT NULL
`;

export const getEventHistoryList = async ({ page = 1, limit = 15, cameraId = "", eventType = "" }) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (cameraId) {
    conditions.push("camera_id = ?");
    params.push(cameraId);
  }
  if (eventType) {
    conditions.push("event_type = ?");
    params.push(eventType);
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM (${buildUnionQuery()}) AS events ${whereClause}`,
    params
  );
  const total = countRows[0].total;

  const [rows] = await pool.query(
    `SELECT * FROM (${buildUnionQuery()}) AS events
     ${whereClause}
     ORDER BY event_time DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  return {
    data: rows,
    page: Number(page),
    totalPages: Math.ceil(total / limit) || 1,
  };
};