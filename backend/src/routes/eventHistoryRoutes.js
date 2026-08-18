import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import { getEventHistory } from "../controllers/eventHistoryController.js";

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware("Admin"), getEventHistory);

export default router;