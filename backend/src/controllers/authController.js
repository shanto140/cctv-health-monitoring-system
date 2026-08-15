import { verifyRefreshToken, generateAccessToken } from "../utils/token.js";
import { findRefreshToken , login as loginService,findAccountById} from "../services/authService.js";


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

export const logout = async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  // also worth: delete the stored refreshToken row in DB, since refresh checks against DB
  res.status(200).json({ message: "Logged out" });
};

export const me = async (req, res) => {
  // authMiddleware already verified the accessToken and set req.user = { id, role }
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
      maxAge: 150 * 60 * 1000,
    });

    res.json({ message: "Access token refreshed" });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};
