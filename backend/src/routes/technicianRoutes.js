// backend/src/routes/technicianRoutes.js
import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import { getTechnicians } from "../controllers/technicianController.js";

const router = express.Router();
router.get("/", authMiddleware, roleMiddleware("Admin"), getTechnicians);

export default router;