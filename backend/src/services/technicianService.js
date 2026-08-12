import db from "../config/db.js";

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