import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import {
  createIncident,
  getIncidents,
  getIncidentById,
  assignTechnician,
  acceptIncident,
  rejectIncident,
  completeIncident,
  getMyIncidents,
} from "../controllers/incidentController.js";

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("Admin"), createIncident);
router.get("/", authMiddleware, roleMiddleware("Admin"), getIncidents);
router.get("/my", authMiddleware, roleMiddleware("Technician"), getMyIncidents);
router.get("/:id", authMiddleware, roleMiddleware("Admin"), getIncidentById);
router.patch("/:id/assign", authMiddleware, roleMiddleware("Admin"), assignTechnician);

router.patch("/:id/accept", authMiddleware, roleMiddleware("Technician"), acceptIncident);
router.patch("/:id/reject", authMiddleware, roleMiddleware("Technician"), rejectIncident);
router.patch("/:id/complete", authMiddleware, roleMiddleware("Technician"), completeIncident);

export default router;