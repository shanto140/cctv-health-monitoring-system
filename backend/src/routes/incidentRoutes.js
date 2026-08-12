import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import { createIncident } from "../controllers/incidentController.js";

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("Admin"), createIncident);

// পরে যোগ হবে:
// router.get("/", ...)
// router.patch("/:id/assign", ...)
// router.patch("/:id/accept", ...)
// router.patch("/:id/reject", ...)
// router.patch("/:id/complete", ...)

export default router;