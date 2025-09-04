// filepath: d:\Login MERN\MERN Authentication\server\models\pdf.js
import mongoose from "mongoose";

const pdfChunkSchema = new mongoose.Schema({
  pdfId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "PdfMetadata",
  },
  chunkText: {
    type: String,
    required: true,
  },
  embedding: {
    type: [Number],
    required: true,
  },
  pageNum: {
    type: Number,
    required: true,
  },
});

// pdfChunkSchema.index({ pdfId: 1 });

export const PdfChunk = mongoose.model("PdfChunk", pdfChunkSchema);

const PdfMetadataSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  fileName: { type: String, required: true, unique: true },
  uploadDate: { type: Date, default: Date.now }, // ✅ fixed
  processed: { type: Boolean, default: false },
});

export const PdfMetadata = mongoose.model("PdfMetadata", PdfMetadataSchema);
