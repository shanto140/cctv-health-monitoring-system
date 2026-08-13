import {
  createIncidentWithIssueLink,
  getIncidentsList,
  getIncidentDetail,
  assignTechnicianToIncident,
} from "../services/incidentService.js";


export const createIncident = async (req, res) => {
  try {
    const { camera_id, camera_issue_id, issue_type, priority, description, technician_id } = req.body;

    if (!camera_issue_id || !camera_id || !issue_type || !priority) {
      return res.status(400).json({ message: "camera_id, issue_type and priority are required" });
    }
    
    const incident = await createIncidentWithIssueLink({
      camera_id,
      camera_issue_id,
      issue_type,
      priority,
      description,
      technician_id: technician_id || null,
    });
    
    res.status(201).json(incident);
  } catch (err) {
    console.error(err);
    if (err.message === "ISSUE_ALREADY_LINKED") {
      return res.status(409).json({ message: "This issue already has an incident linked" });
    }
    res.status(500).json({ message: "Failed to create incident" });
  }
};                                                             


// ---------- Get Incidents (list + filter + pagination) ----------
export const getIncidents = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "", priority = "", cameraName = "" } = req.query;
    const result = await getIncidentsList({
      page: Number(page),
      limit: Number(limit),
      status,
      priority,
      cameraName,
    });
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch incidents" });
  }
};

// ---------- Get Incident By Id ----------
export const getIncidentById = async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await getIncidentDetail(id);
    res.status(200).json(incident);
  } catch (err) {
    console.error(err);
    if (err.message === "INCIDENT_NOT_FOUND") {
      return res.status(404).json({ message: "Incident not found" });
    }
    res.status(500).json({ message: "Failed to fetch incident detail" });
  }
};

// ---------- Assign Technician ----------
export const assignTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { technician_id } = req.body;

    if (!technician_id) {
      return res.status(400).json({ message: "technician_id is required" });
    }

    const incident = await assignTechnicianToIncident(id, technician_id);
    res.status(200).json(incident);
  } catch (err) {
    console.error(err);
    if (err.message === "INCIDENT_NOT_FOUND") {
      return res.status(404).json({ message: "Incident not found" });
    }
    if (err.message === "INVALID_STATUS_FOR_ASSIGN") {
      return res.status(409).json({ message: "Technician can only be assigned when incident is Open or Rejected" });
    }
    res.status(500).json({ message: "Failed to assign technician" });
  }
};