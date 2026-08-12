import db from "../config/db.js";

export const createIncidentWithIssueLink = async ({ camera_id, camera_issue_id, issue_type, priority, description, technician_id }) => {
  if (!camera_issue_id) {
    throw new Error("CAMERA_ISSUE_ID_REQUIRED");
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [[issue]] = await conn.query(
      `SELECT status FROM camera_issues WHERE id = ? FOR UPDATE`,
      [camera_issue_id]
    );
    if (!issue) throw new Error("ISSUE_NOT_FOUND");
    if (issue.status === "linked") throw new Error("ISSUE_ALREADY_LINKED");

    const status = technician_id ? "Assigned" : "Open";

    const [result] = await conn.query(
      `INSERT INTO incidents
        (camera_id, camera_issue_id, status, priority, description, assigned_technician_id, assigned_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [camera_id, camera_issue_id, status, priority, description || null, technician_id, technician_id ? new Date() : null]
    );

    const [linkResult] = await conn.query(
      `UPDATE camera_issues SET status = 'linked' WHERE id = ? AND status = 'active'`,
      [camera_issue_id]
    );

    if (linkResult.affectedRows === 0) {
      throw new Error("ISSUE_LINK_FAILED");
    }

    await conn.commit();
    return { id: result.insertId, camera_id, camera_issue_id, status, priority, description, technician_id };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};