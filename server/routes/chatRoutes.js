// filepath: d:\Login MERN\MERN Authentication\server\routes\chatRoutes.js
import express from "express";
import { chatWithPdf } from "../controllers/chatController.js";

const router = express.Router();

// 🔹 Chat with a specific PDF
router.post("/", chatWithPdf);

export default router;
