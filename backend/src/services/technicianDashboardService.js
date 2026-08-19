import db from "../config/db.js";

export const fetchTechnicianDashboardStats = async (technicianId) => {
  const [[stats]] = await db.query(
    `SELECT
       COUNT(CASE WHEN status = 'Assigned' THEN 1 END) AS assignedPending,
       COUNT(CASE WHEN status = 'In Progress' THEN 1 END) AS inProgress,
       COUNT(CASE WHEN status = 'Completed' AND completed_at >= NOW() - INTERVAL 7 DAY THEN 1 END) AS completedThisWeek,
       COUNT(CASE WHEN status = 'Completed' THEN 1 END) AS totalCompleted
     FROM incidents
     WHERE assigned_technician_id = ?`,
    [technicianId]
  );
  return stats;
};
