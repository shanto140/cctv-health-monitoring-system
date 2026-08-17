import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pool, { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import cameraIssueRoutes from "./routes/cameraIssueRoutes.js";
import incidentRoutes from "./routes/incidentRoutes.js";
import technicianRoutes from "./routes/technicianRoutes.js";
import cameraRoutes from "./routes/cameraRoutes.js";

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true, 
}));
app.use(express.json());        
app.use(cookieParser());  

// snapshot/uploaded ফাইল সরাসরি serve করার জন্য
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('CCTV Health Monitoring API is running');
});


app.use("/api/auth", authRoutes);

app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/camera-issues", cameraIssueRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/cameras", cameraRoutes);

// multer (file upload) errors — e.g. size limit exceeded, wrong file type
app.use((err, req, res, next) => {
  if (err?.name === "MulterError" || err?.message === "Only image files are allowed") {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});
 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
   connectDB();
  console.log(`Server running on http://localhost:${PORT}`);
});