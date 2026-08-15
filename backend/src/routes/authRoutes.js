import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { refreshAccessToken , login,logout,me } from "../controllers/authController.js";
const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshAccessToken);
router.get("/me", authMiddleware, me);

export default router;