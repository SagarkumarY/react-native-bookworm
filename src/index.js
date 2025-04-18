import express from "express";
import dotenv from 'dotenv';
import cors from 'cors'
import job from "./lib/cron.js";
import authRoutes from './routes/authRoutes.js'
import bookRoutes from './routes/bookRoutes.js'
import connectDB from "./lib/db.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3500;


job.start();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/books", bookRoutes)

app.listen(PORT,()=>{
    console.log(`server is running http://localhost:${PORT}`)
    connectDB();
})