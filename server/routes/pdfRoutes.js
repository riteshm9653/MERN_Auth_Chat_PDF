// filepath: d:\Login MERN\MERN Authentication\server\routes\pdfRoutes.js
import express from "express";
import {
  upload,
  uploadPdf,
  getPdfs,
  deletePdfById,
} from "../controllers/pdfController.js";

const router = express.Router();

// 🔹 Upload a PDF
router.post("/upload", upload.single("pdf"), uploadPdf);

// 🔹 Get list of uploaded PDFs
router.get("/", getPdfs);
router.delete("/:id", deletePdfById);

export default router;
