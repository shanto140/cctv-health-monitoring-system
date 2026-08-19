import {
  fetchTechnicians,
  fetchTechnicianBasicInfo,
  fetchTechnicianStats,
  fetchTechnicianWorkHistory,
  fetchTechniciansWithWorkload,
  insertTechnician,
  setTechnicianActiveStatus,
} from "../services/technicianService.js";

export const getTechnicians = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const result = await fetchTechnicians({ page, limit, search });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch technicians" });
  }
};

export const getTechnicianDetail = async (req, res) => {
  try {
    const technician = await fetchTechnicianBasicInfo(req.params.id);
    if (!technician) return res.status(404).json({ message: "Technician not found" });

    const stats = await fetchTechnicianStats(req.params.id);
    res.json({ ...technician, ...stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch technician detail" });
  }
};

export const getTechnicianWorkHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await fetchTechnicianWorkHistory(req.params.id, page, limit);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch work history" });
  }
};

export const getAssignableTechnicians = async (req, res) => {
  try {
    const technicians = await fetchTechniciansWithWorkload();
    res.json(technicians);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch technician options" });
  }
};

export const registerTechnician = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "name and email are required" });
    }
    const technician = await insertTechnician({ name, email, phone, address });
    res.status(201).json(technician);
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already registered" });
    }
    res.status(500).json({ message: "Failed to register technician" });
  }
};

export const toggleTechnicianStatus = async (req, res) => {
  try {
    const { is_active } = req.body;
    const success = await setTechnicianActiveStatus(req.params.id, is_active);
    if (!success) return res.status(404).json({ message: "Technician not found" });
    res.json({ message: is_active ? "Technician activated" : "Technician deactivated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update technician status" });
  }
};