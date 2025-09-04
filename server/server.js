import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import pdfRouter from "./routes/pdfRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import { authrouter } from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Connect DB
connectDB();

// Allowed origins
const allowedOrigins = ["http://localhost:5173"];

app.use(express.json());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());

// API Endpoints
app.get("/", (req, res) => {
  res.send("🚀 Ritesh Maurya — Welcome to the server!");
});

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authrouter);
app.use("/api/user", userRouter);
app.use("/api/pdf", pdfRouter);
app.use("/api/chat", chatRouter);

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
