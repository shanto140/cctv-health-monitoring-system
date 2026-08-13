import { verifyRefreshToken, generateAccessToken } from "../utils/token.js";
import { findRefreshToken , login as loginService} from "../services/authService.js";

 export const login = async(req, res) =>{ 

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const { accessToken, refreshToken,  user } = await loginService({ email, password });

   
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
