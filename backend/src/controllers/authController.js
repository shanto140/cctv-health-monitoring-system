import * as authService from "../services/authService.js";

 const login = async(req, res) =>{

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const { accessToken, refreshToken, role, user } = await authService.login({ email, password });

   
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

    return res.status(200).json({ role, user });
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || "Something went wrong. Please try again.";
    return res.status(status).json({ message });
  }
}

export{
  login
};