import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import { getTechnicianDashboardStats } from "../controllers/technicianDashboardController.js";

const router = express.Router();

router.get("/stats", authMiddleware, roleMiddleware("Technician"), getTechnicianDashboardStats);

export default router;