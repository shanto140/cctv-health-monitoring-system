import { fetchTechnicianDashboardStats} from "../services/technicianDashboardService.js";

export const getTechnicianDashboardStats = async (req, res) => {
  try {
    const technicianId = req.user.id; // token থেকে আসছে (authMiddleware বসায়)
    const stats = await fetchTechnicianDashboardStats(technicianId);
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};
