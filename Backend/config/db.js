import pg from "pg";
import dotenv from "dotenv";
import { param } from "express-validator";

dotenv.config();
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: true }
      : false,
});
//to check the connection
pool.connect().then(() => {
  console.log("Database connected");
});

export const query=(text,params)=>pool.query(text,params);

export default pool;