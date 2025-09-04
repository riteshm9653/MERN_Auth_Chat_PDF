// filepath: d:\Login MERN\MERN Authentication\server\controllers\pdfController.js
import axios from "axios";
import { PdfChunk, PdfMetadata } from "../models/pdf.js";
import mongoose from "mongoose";

// Chat with PDF (RAG pipeline)
export const chatWithPdf = async (req, res) => {
  const { pdfId, question } = req.body;
  console.log("chatWithPdf called with:", { pdfId, question });
  // 🔹 Input validation
  if (!pdfId || !mongoose.Types.ObjectId.isValid(pdfId) || !question) {
    return res.status(400).json({ msg: "PDF ID and question are required" });
  }

  try {
    // 🔹 Check if metadata exists
    const pdfMeta = await PdfMetadata.findById(pdfId);
    if (!pdfMeta) {
      return res.status(404).json({ msg: "PDF metadata not found" });
    }

    // 1. Generate embedding for the question
    console.log("Generating embedding for the question...");
    const embeddingResponse = await axios.post(
      `${process.env.OLLAMA_BASE_URL}/api/embeddings`,
      {
        model: process.env.EMBEDDING_MODEL || "nomic-embed-text",
        prompt: question,
      },
      {
        // timeout: 10000,
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!embeddingResponse.data.embedding) {
      throw new Error("No embedding returned from Ollama");
    }

    const queryEmbedding = embeddingResponse.data.embedding;
    console.log("✅ Embedding generated.");

    // 2. Vector search in MongoDB Atlas
    console.log("Performing vector search...");
    // console.log("Generated embedding:", embedding.length);
    const pdfObjectId = new mongoose.Types.ObjectId(pdfId);
    console.log(
      "Searching for chunks with embedding:",
      queryEmbedding.slice(0, 5),
      "...",
      "for PDF ID:",
      pdfObjectId
    );
    const relevantChunks = await PdfChunk.aggregate([
      {
        $vectorSearch: {
          index: "vector_index", // <-- Make sure this exists in Mongo Atlas
          queryVector: queryEmbedding,
          path: "embedding",
          numCandidates: 100,
          limit: 3,
          filter: { pdfId: pdfObjectId },
        },
      },
      {
        $project: {
          chunkText: 1,
          pageNum: 1,
          _id: 0,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    console.log("Vector search results:", relevantChunks);

    if (!relevantChunks || relevantChunks.length === 0) {
      return res.status(200).json({
        answer: "No relevant information found in the PDF.",
        sourceInfo: [],
      });
    }

    // 3. Build prompt for LLM
    const context = relevantChunks.map((c) => c.chunkText).join("\n---\n");
    const prompt = `Use the following context to answer the question. If the context does not contain the answer, say "I don't know".\n\nContext:\n${context}\n\nQuestion: ${question}\nAnswer:`;

    console.log("Sending prompt to LLM...");

    // 4. Query Ollama LLM
    const llmResponse = await axios.post(
      `${process.env.OLLAMA_BASE_URL}/api/generate`,
      {
        model: process.env.LLM_MODEL || "codellama:7b",
        prompt,
        stream: false,
        max_tokens: 500,
        options: { temperature: 0.1, top_k: 40, top_p: 0.9 },
      },
      {
        // timeout: 20000,
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log(llmResponse.data);

    // ✅ Handle different response formats
    const answer =
      llmResponse.data.response?.trim() ||
      llmResponse.data.output?.trim() ||
      "No answer generated.";

    // 5. Collect source info
    console.log("Collecting source information...");
    const sourceInfo = relevantChunks.map((c) => ({
      pageNum: c.pageNum,
      score: c.score,
    }));
    console.log("✅ Source info collected.");
    console.log("Final answer:", answer);
    console.log("Source info:", sourceInfo);

    return res.status(200).json({ answer, sourceInfo });
  } catch (err) {
    console.error("Error in chatWithPdf:", err.message);

    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      return res.status(500).json({
        msg: "Connection refused. Please ensure Ollama is running and OLLAMA_BASE_URL is correct.",
      });
    }

    if (axios.isAxiosError(err) && err.response) {
      console.error("Axios error:", err.response.data);
      return res.status(500).json({
        msg: "Error communicating with Ollama LLM",
        error: err.response.data,
      });
    }

    return res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
