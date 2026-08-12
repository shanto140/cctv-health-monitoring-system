import { createIncidentWithIssueLink } from "../services/incidentService.js";

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