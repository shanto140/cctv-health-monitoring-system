import { fetchTechniciansWithWorkload } from "../services/technicianService.js";

export const getTechnicians = async (req, res) => {
  try {
    const technicians = await fetchTechniciansWithWorkload();
    res.json(technicians);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch technicians" });
  }
};