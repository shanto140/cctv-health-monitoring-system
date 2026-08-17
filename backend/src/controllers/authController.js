import { verifyRefreshToken, generateAccessToken } from "../utils/token.js";
import {
  findRefreshToken,
  login as loginService,
  findAccountById,
  updateProfileImage,
  updateProfileFields,
  clearRefreshToken,
} from "../services/authService.js";

export const login = async(req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const { accessToken, refreshToken, user } = await loginService({ email, password });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json(user);
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || "Something went wrong. Please try again.";
    return res.status(status).json({ message });
  }
}

export const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      await clearRefreshToken(decoded.id, decoded.role);
    } catch (err) {
      // token already invalid/expired — nothing to clear
    }
  }

  res.clearCookie("accessToken", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" });
  res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" });

  res.status(200).json({ message: "Logged out successfully" });
};

export const me = async (req, res) => {
  try {
    const account = await findAccountById(req.user.id, req.user.role);
    if (!account || !account.is_active) {
      return res.status(401).json({ message: "Account not found or deactivated." });
    }
    return res.status(200).json({
      role: account.role,
      id: account.id,
      name: account.name,
      email: account.email,
      phone: account.phone,
      address: account.address,
      profile_image: account.profile_image,
    });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong." });
  }
};

export const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    const storedToken = await findRefreshToken(decoded.id, decoded.role);
    if (!storedToken || storedToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid or revoked refresh token" });
    }

    const newAccessToken = generateAccessToken({ id: decoded.id, role: decoded.role });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Access token refreshed" });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

export const uploadMyProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided." });
    }

    const imageUrl = req.file.path;
    const savedUrl = await updateProfileImage(req.user.id, req.user.role, imageUrl);

    return res.status(200).json({
      message: "Profile picture updated successfully.",
      profile_image: savedUrl,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to upload profile picture." });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required." });
    }

    const updated = await updateProfileFields(req.user.id, req.user.role, { name: name.trim(), phone, address });

    return res.status(200).json({
      message: "Profile updated successfully.",
      role: updated.role,
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      address: updated.address,
      profile_image: updated.profile_image,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update profile." });
  }
};