import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pool, { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";


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




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
   connectDB();
  console.log(`Server running on http://localhost:${PORT}`);
});