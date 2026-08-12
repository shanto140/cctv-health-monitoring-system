import { fetchDashboardStats } from "../services/adminDashboardService.js";

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await fetchDashboardStats();
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};