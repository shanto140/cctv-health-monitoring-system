import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import {
  getTechnicians,
  getTechnicianDetail,
  getTechnicianWorkHistory,
  getAssignableTechnicians,
  registerTechnician,
  toggleTechnicianStatus,
} from "../controllers/technicianController.js";

const router = express.Router();

router.get("/options/assignable", authMiddleware, roleMiddleware("Admin"), getAssignableTechnicians);
router.get("/", authMiddleware, roleMiddleware("Admin"), getTechnicians);
router.get("/:id", authMiddleware, roleMiddleware("Admin"), getTechnicianDetail);
router.get("/:id/incidents", authMiddleware, roleMiddleware("Admin"), getTechnicianWorkHistory);
router.post("/", authMiddleware, roleMiddleware("Admin"), registerTechnician);
router.patch("/:id/status", authMiddleware, roleMiddleware("Admin"), toggleTechnicianStatus);

export default router;