import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';


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

// ── Routes এখানে যোগ হবে (যখন যেই module বানাবা) ──
// import cameraRoutes from './routes/cameraRoutes.js';
// app.use('/cameras', cameraRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});