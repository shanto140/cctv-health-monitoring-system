import pool from "../config/db.js";
import { createNotification } from "./notificationService.js";

// সব Admin-কে notify করার হেল্পার (multiple admin থাকতে পারে)
const notifyAllAdmins = async (message) => {
  const [admins] = await pool.query(`SELECT id FROM admins`);
  await Promise.all(
    admins.map((a) => createNotification({ receiver_id: a.id, receiver_role: "Admin", message }))
  );
};

export const createIncidentWithIssueLink = async ({ camera_id, camera_issue_id, issue_type, priority, description, technician_id }) => {
  if (!camera_issue_id) {
    throw new Error("CAMERA_ISSUE_ID_REQUIRED");
  }

  const conn = await pool.getConnection();
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

export const getIncidentsList = async ({ page = 1, limit = 10, status = "", priority = "", cameraName = "" }) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push("i.status = ?");
    params.push(status);
  }
  if (priority) {
    conditions.push("i.priority = ?");
    params.push(priority);
  }
  if (cameraName) {
    conditions.push("c.name LIKE ?");
    params.push(`%${cameraName}%`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total 
     FROM incidents i 
     JOIN cameras c ON i.camera_id = c.id 
     ${whereClause}`,
    params
  );
  const total = countRows[0].total;

  const [rows] = await pool.query(
    `SELECT i.id, i.status, i.priority, i.created_at, 
            c.name AS camera_name, ci.issue_type
     FROM incidents i
     JOIN cameras c ON i.camera_id = c.id
     LEFT JOIN camera_issues ci ON i.camera_issue_id = ci.id
     ${whereClause}
     ORDER BY i.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  return {
    data: rows,
    page: Number(page),
    totalPages: Math.ceil(total / limit) || 1,
  };
};

// ---------- Get Single Incident Detail ----------
export const getIncidentDetail = async (id) => {
  const [rows] = await pool.query(
    `SELECT 
        i.id, i.status, i.priority, i.description, i.remarks,
        i.created_at, i.assigned_at, i.completed_at,
        c.id AS camera_id, c.name AS camera_name, c.location AS camera_location, c.ip_address AS camera_ip,
        ci.issue_type,
        t.id AS technician_id, t.name AS technician_name, t.phone AS technician_phone, t.email AS technician_email
     FROM incidents i
     JOIN cameras c ON i.camera_id = c.id
     LEFT JOIN camera_issues ci ON i.camera_issue_id = ci.id
     LEFT JOIN technicians t ON i.assigned_technician_id = t.id
     WHERE i.id = ?`,
    [id]
  );

  if (rows.length === 0) {
    throw new Error("INCIDENT_NOT_FOUND");
  }
  return rows[0];
};
// ---------- Assign / Reassign Technician ----------
export const assignTechnicianToIncident = async (incidentId, technicianId) => {
  const [existing] = await pool.query(
    `SELECT status FROM incidents WHERE id = ?`,
    [incidentId]
  );

  if (existing.length === 0) {
    throw new Error("INCIDENT_NOT_FOUND");
  }

  const currentStatus = existing[0].status;
  if (currentStatus !== "Open" && currentStatus !== "Rejected") {
    throw new Error("INVALID_STATUS_FOR_ASSIGN");
  }

  await pool.query(
    `UPDATE incidents 
     SET assigned_technician_id = ?, status = 'Assigned', remarks = NULL, assigned_at = NOW()
     WHERE id = ?`,
    [technicianId, incidentId]
  );
  
  const [updated] = await pool.query(`SELECT * FROM incidents WHERE id = ?`, [incidentId]);
 
// টেকনিশিয়ানকে notify করা (US-07: system notifies the Technician)
  const [cameraRows] = await pool.query(
    `SELECT c.name AS camera_name FROM incidents i JOIN cameras c ON i.camera_id = c.id WHERE i.id = ?`,
    [incidentId]
  );
  const cameraName = cameraRows[0]?.camera_name || "a camera";
  await createNotification({
    receiver_id: technicianId,
    receiver_role: "Technician",
    message: `You have been assigned a new incident on ${cameraName}.`,
  });
  return updated[0];
};


// ---------- Technician: Accept Incident ----------
export const acceptIncidentById = async (incidentId, technicianId) => {
  const [existing] = await pool.query(
    `SELECT status, assigned_technician_id FROM incidents WHERE id = ?`,
    [incidentId]
  );
  if (existing.length === 0) throw new Error("INCIDENT_NOT_FOUND");
 
  const incident = existing[0];
  if (incident.assigned_technician_id !== technicianId) {
    throw new Error("NOT_ASSIGNED_TO_YOU");
  }
  if (incident.status !== "Assigned") {
    throw new Error("INVALID_STATUS_FOR_ACCEPT");
  }
 
  await pool.query(`UPDATE incidents SET status = 'In Progress' WHERE id = ?`, [incidentId]);
 
  const [updated] = await pool.query(`SELECT * FROM incidents WHERE id = ?`, [incidentId]);
  return updated[0];
};
 
// ---------- Technician: Reject Incident (reason required) ----------
export const rejectIncidentById = async (incidentId, technicianId, reason) => {
  if (!reason || !reason.trim()) {
    throw new Error("REASON_REQUIRED");
  }
 
  const [existing] = await pool.query(
    `SELECT status, assigned_technician_id FROM incidents WHERE id = ?`,
    [incidentId]
  );
  if (existing.length === 0) throw new Error("INCIDENT_NOT_FOUND");
 
  const incident = existing[0];
  if (incident.assigned_technician_id !== technicianId) {
    throw new Error("NOT_ASSIGNED_TO_YOU");
  }
  if (!["Assigned", "In Progress"].includes(incident.status)) {
    throw new Error("INVALID_STATUS_FOR_REJECT");
  }
 
  // reject করলে incident আবার unassigned হয়ে যায়, admin আবার assign করতে পারবে
  await pool.query(
    `UPDATE incidents
     SET status = 'Rejected', remarks = ?, assigned_technician_id = NULL, assigned_at = NULL
     WHERE id = ?`,
    [reason.trim(), incidentId]
  );
 
  const [updated] = await pool.query(`SELECT * FROM incidents WHERE id = ?`, [incidentId]);
  
    const [cameraRows] = await pool.query(
    `SELECT c.name AS camera_name FROM incidents i JOIN cameras c ON i.camera_id = c.id WHERE i.id = ?`,
    [incidentId]
  );
  const cameraName = cameraRows[0]?.camera_name || "a camera";
  await notifyAllAdmins(`Incident on ${cameraName} was rejected by the technician: ${reason.trim()}`);

  return updated[0];
};
 
// ---------- Technician: Complete Incident (comment optional) ----------
export const completeIncidentById = async (incidentId, technicianId, comment) => {
  const [existing] = await pool.query(
    `SELECT status, assigned_technician_id FROM incidents WHERE id = ?`,
    [incidentId]
  );
  if (existing.length === 0) throw new Error("INCIDENT_NOT_FOUND");
 
  const incident = existing[0];
  if (incident.assigned_technician_id !== technicianId) {
    throw new Error("NOT_ASSIGNED_TO_YOU");
  }
  if (incident.status !== "In Progress") {
    throw new Error("INVALID_STATUS_FOR_COMPLETE");
  }
 
  await pool.query(
    `UPDATE incidents
     SET status = 'Completed', remarks = ?, completed_at = NOW()
     WHERE id = ?`,
    [comment ? comment.trim() : null, incidentId]
  );
 
  const [updated] = await pool.query(`SELECT * FROM incidents WHERE id = ?`, [incidentId]);
  
  const [cameraRows] = await pool.query(
    `SELECT c.name AS camera_name FROM incidents i JOIN cameras c ON i.camera_id = c.id WHERE i.id = ?`,
    [incidentId]
  );
  const cameraName = cameraRows[0]?.camera_name || "a camera";
  await notifyAllAdmins(`Incident on ${cameraName} has been marked Completed by the technician.`);
 
  return updated[0];
};


// ---------- Technician: My Incidents (assigned to me) ----------
export const getTechnicianIncidentsList = async ({ technicianId, page = 1, limit = 10, status = "" }) => {
  const offset = (page - 1) * limit;
  const conditions = ["i.assigned_technician_id = ?"];
  const params = [technicianId];
 
  if (status) {
    conditions.push("i.status = ?");
    params.push(status);
  }
 
  const whereClause = `WHERE ${conditions.join(" AND ")}`;
 
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM incidents i ${whereClause}`,
    params
  );
  const total = countRows[0].total;
 
  const [rows] = await pool.query(
    `SELECT i.id, i.status, i.priority, i.description, i.remarks,
            i.created_at, i.assigned_at, i.completed_at,
            c.id AS camera_id, c.name AS camera_name, c.location AS camera_location,
            ci.issue_type
     FROM incidents i
     JOIN cameras c ON i.camera_id = c.id
     LEFT JOIN camera_issues ci ON i.camera_issue_id = ci.id
     ${whereClause}
     ORDER BY
       CASE i.status WHEN 'Assigned' THEN 0 WHEN 'In Progress' THEN 1 ELSE 2 END,
       i.assigned_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
 
  return {
    data: rows,
    page: Number(page),
    totalPages: Math.ceil(total / limit) || 1,
  };
};