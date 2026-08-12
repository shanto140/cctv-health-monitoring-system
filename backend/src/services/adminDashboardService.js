import db from "../config/db.js";

export const fetchDashboardStats = async () => {
  const [rows] = await db.query(`
    SELECT
      (SELECT COUNT(*) FROM cameras WHERE is_active = TRUE) AS totalCameras,
      (SELECT COUNT(*) FROM cameras WHERE is_active = TRUE AND current_status = 'Online') AS onlineCameras,
      (SELECT COUNT(*) FROM cameras WHERE is_active = TRUE AND current_status IN ('Offline','Degraded')) AS issuedCameras,
      (SELECT COUNT(*) FROM technicians WHERE is_active = TRUE) AS activeTechnicians,
      (SELECT COUNT(*) FROM incidents WHERE status = 'Open') AS incidentsOpen,
      (SELECT COUNT(*) FROM incidents WHERE status = 'Assigned') AS incidentsAssigned,
      (SELECT COUNT(*) FROM incidents WHERE status = 'In Progress') AS incidentsInProgress,
      (SELECT COUNT(*) FROM incidents WHERE status = 'Completed') AS incidentsCompleted
  `);
  return rows[0];
};