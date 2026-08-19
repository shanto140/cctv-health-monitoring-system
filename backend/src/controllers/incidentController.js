import {
  createIncidentWithIssueLink,
  getIncidentsList,
  getIncidentDetail,
  assignTechnicianToIncident,
  acceptIncidentById,
  rejectIncidentById,
  completeIncidentById,
  getTechnicianIncidentsList,
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

export const acceptIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await acceptIncidentById(id, req.user.id);
    res.status(200).json(incident);
  } catch (err) {
    console.error(err);
    if (err.message === "INCIDENT_NOT_FOUND") {
      return res.status(404).json({ message: "Incident not found" });
    }
    if (err.message === "NOT_ASSIGNED_TO_YOU") {
      return res.status(403).json({ message: "This incident is not assigned to you" });
    }
    if (err.message === "INVALID_STATUS_FOR_ACCEPT") {
      return res.status(409).json({ message: "Only an Assigned incident can be accepted" });
    }
    res.status(500).json({ message: "Failed to accept incident" });
  }
};


export const rejectIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
 
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "A reason is required to reject an incident" });
    }
 
    const incident = await rejectIncidentById(id, req.user.id, reason);
    res.status(200).json(incident);
  } catch (err) {
    console.error(err);
    if (err.message === "INCIDENT_NOT_FOUND") {
      return res.status(404).json({ message: "Incident not found" });
    }
    if (err.message === "NOT_ASSIGNED_TO_YOU") {
      return res.status(403).json({ message: "This incident is not assigned to you" });
    }
    if (err.message === "INVALID_STATUS_FOR_REJECT") {
      return res.status(409).json({ message: "Only an Assigned or In Progress incident can be rejected" });
    }
    res.status(500).json({ message: "Failed to reject incident" });
  }
};
 

export const completeIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
 
    const incident = await completeIncidentById(id, req.user.id, comment);
    res.status(200).json(incident);
  } catch (err) {
    console.error(err);
    if (err.message === "INCIDENT_NOT_FOUND") {
      return res.status(404).json({ message: "Incident not found" });
    }
    if (err.message === "NOT_ASSIGNED_TO_YOU") {
      return res.status(403).json({ message: "This incident is not assigned to you" });
    }
    if (err.message === "INVALID_STATUS_FOR_COMPLETE") {
      return res.status(409).json({ message: "Only an In Progress incident can be marked complete" });
    }
    res.status(500).json({ message: "Failed to complete incident" });
  }
};


export const getMyIncidents = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "" } = req.query;
    const result = await getTechnicianIncidentsList({
      technicianId: req.user.id,
      page: Number(page),
      limit: Number(limit),
      status,
    });
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch your incidents" });
  }
};
 