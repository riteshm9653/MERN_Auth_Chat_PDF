// filepath: server/controllers/pdfController.js
import multer from "multer";
import path from "path";
import fs from "fs";
import pdfParse from "pdf-parse";
import { PdfChunk, PdfMetadata } from "../models/pdf.js";
import axios from "axios";

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(path.resolve(), "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Upload & Process PDF
const uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const fileName = req.file.filename;
    console.log(`📄 Received file: ${originalName} (${fileName})`);
    // Save metadata in DB
    const newPdfMetadata = new PdfMetadata({
      originalName,
      fileName,
      processed: false,
      uploadDate: new Date(),
    });
    const savedPdfMetadata = await newPdfMetadata.save();
    const pdfId = savedPdfMetadata._id;

    console.log(`✅ PDF metadata saved with ID: ${pdfId}`);

    // Parse PDF
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const fullText = pdfData.text || "";

    console.log(`✅ PDF parsed: ${fullText.length} characters`);

    // Chunking
    const chunkSize = parseInt(process.env.CHUNK_SIZE || "1000");
    const chunkOverlap = parseInt(process.env.OVERLAP_SIZE || "200");
    const chunks = [];
    let currentPosition = 0;
    let iteration = 0;

    while (currentPosition < fullText.length) {
      let endPosition = Math.min(currentPosition + chunkSize, fullText.length);
      let currentChunkText = fullText
        .slice(currentPosition, endPosition)
        .trim();

      if (currentChunkText.length > 0) {
        const embeddingResponse = await axios.post(
          `${process.env.OLLAMA_BASE_URL}/api/embeddings`,
          {
            model: process.env.EMBEDDING_MODEL || "nomic-embed-text",
            prompt: currentChunkText,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        const embedding = embeddingResponse.data.embedding || [];
        if (!embedding || embedding.length === 0) {
          console.warn(`⚠️ No embedding returned for chunk ${iteration}`);
        } else {
          chunks.push({
            pdfId,
            embedding,
            pageNum: 1,
            chunkIndex: iteration,
            chunkText: currentChunkText,
          });
        }
      }

      iteration++;
      currentPosition += chunkSize - chunkOverlap;
    }

    console.log(`✅ Total chunks created: ${chunks.length}`);
    console.log(
      `First chunk preview: ${chunks[0]?.chunkText.slice(0, 100)}...`
    );

    if (chunks.length > 0) {
      await PdfChunk.insertMany(chunks);
      console.log("✅ Chunks saved to DB");
    }

    // Mark as processed
    savedPdfMetadata.processed = true;
    await savedPdfMetadata.save();

    // Delete uploaded file (optional)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      msg: "PDF processed and chunks saved",
      pdfId,
      chunkCount: chunks.length,
    });
  } catch (err) {
    console.error("❌ Error in uploadPdf:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Get all PDFs
const getPdfs = async (req, res) => {
  try {
    const pdfs = await PdfMetadata.find().sort({ uploadDate: -1 });
    res.json(pdfs);
  } catch (err) {
    console.error("❌ Error fetching PDFs:", err.message);
    res.status(500).send("Server Error");
  }
};

export { upload, uploadPdf, getPdfs };

export const deletePdfById = async (req, res) => {
  const { id } = req.params;

  try {
    // Validate the ID
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: "Invalid PDF ID" });
    }

    // Find the PDF metadata
    const pdfMetadata = await PdfMetadata.findById(id);
    if (!pdfMetadata) {
      return res.status(404).json({ msg: "PDF not found" });
    }

    // Delete associated chunks
    await PdfChunk.deleteMany({ pdfId: id });

    // Delete the file from the uploads directory
    const filePath = path.join(path.resolve(), "uploads", pdfMetadata.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete the metadata
    await PdfMetadata.findByIdAndDelete(id);

    res.json({ msg: "PDF deleted successfully" });
  } catch (err) {
    console.error("Error in deletePdfById:", err.message);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
