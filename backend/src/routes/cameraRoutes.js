import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import { getCameras, getCameraDetail, getCameraIssueHistory, getCameraSnapshot, createCamera, updateCamera, deleteCamera } from "../controllers/cameraController.js";

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware("Admin", "Technician"), getCameras);
router.get("/:id", authMiddleware, roleMiddleware("Admin", "Technician"), getCameraDetail);
router.get("/:id/issues", authMiddleware, roleMiddleware("Admin"), getCameraIssueHistory);
router.get("/:id/snapshot", authMiddleware, roleMiddleware("Admin", "Technician"), getCameraSnapshot);
router.post("/", authMiddleware, roleMiddleware("Admin"), createCamera);
router.put("/:id", authMiddleware, roleMiddleware("Admin"), updateCamera);
router.delete("/:id", authMiddleware, roleMiddleware("Admin"), deleteCamera);

// পরে যোগ হবে:
// router.post("/", authMiddleware, roleMiddleware("Admin"), createCamera);
// router.put("/:id", authMiddleware, roleMiddleware("Admin"), updateCamera);
// router.delete("/:id", authMiddleware, roleMiddleware("Admin"), deleteCamera);
// router.get("/:id/snapshot", authMiddleware, getSnapshot);  ← health-check cron বানানোর পর

export default router;