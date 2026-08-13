import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import {
  createIncident,
  getIncidents,
  getIncidentById,
  assignTechnician,
} from "../controllers/incidentController.js";

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("Admin"), createIncident);
router.get("/", authMiddleware, roleMiddleware("Admin"), getIncidents);
router.get("/:id", authMiddleware, roleMiddleware("Admin"), getIncidentById);
router.patch("/:id/assign", authMiddleware, roleMiddleware("Admin"), assignTechnician);



export default router;