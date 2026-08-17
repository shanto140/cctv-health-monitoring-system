import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import uploadProfileImage from "../middlewares/uploadProfileImage.js";
import { refreshAccessToken, login, logout, me, uploadMyProfileImage, updateMyProfile } from "../controllers/authController.js";
const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshAccessToken);
router.get("/me", authMiddleware, me);
router.patch("/me", authMiddleware, updateMyProfile);
router.post("/me/profile-image", authMiddleware, uploadProfileImage.single("image"), uploadMyProfileImage);

export default router;