  import mysql from 'mysql2/promise';
  import dotenv from 'dotenv';
  dotenv.config();
  import fs from "fs";

  const pool = mysql.createPool({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    ssl: {
          ca: fs.readFileSync(process.env.DB_SSL_CA)
      },

    
    connectionLimit: 10,
    queueLimit: 0,
  });

  export const connectDB = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("✅ MySQL Connected");
        connection.release();
    } catch (error) {
        console.error("❌ Database connection failed");
        console.error(error);
        process.exit(1);
    }
};

  export default pool;