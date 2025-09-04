import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PdfUploadPage = () => {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      setError("❌ Only PDF files are allowed.");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setMessage("");
    setError("");
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("❌ Please select a PDF file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", selectedFile);

    try {
      setUploading(true);
      setMessage("");
      setError("");
      console.log("Uploading file:", selectedFile.name);
      console.log("FormData contents:", formData.get("pdf"));
      console.log(
        "Backend URL:",
        `${import.meta.env.VITE_BACKEND_URL}/api/pdf/upload`
      );

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/pdf/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(`✅ PDF "${selectedFile.name}" uploaded successfully!`);
      console.log("Upload response:", response.data);
      setSelectedFile(null);
      navigate(`/chat/${response.data.pdfId}`);
    } catch (err) {
      console.error(
        "Upload error:",
        err.response ? err.response.data : err.message
      );
      setError(
        "❌ Failed to upload PDF. " +
          (err.response
            ? err.response.data.msg
            : " Please ensure the backend is running.")
      );
      setMessage("");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center justify-center flex-col min-h-screen bg-gray-100">
      {/* Upload Card */}
      <div className="p-6 bg-white shadow-lg rounded-lg w-full max-w-md">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-4 text-center">Upload your PDF</h1>

        {/* File Input */}
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={uploading}
          className="mb-4 block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer focus:outline-none"
        />

        {/* Upload Button */}
        <button
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
        >
          {uploading ? (
            <p>
              <span className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin">
                Uploading...
              </span>
            </p>
          ) : (
            "Upload PDF"
          )}
        </button>

        {/* Messages */}
        {message && (
          <p className="mt-4 text-green-600 border border-green-400 rounded p-2 text-center">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-4 text-red-600 border border-red-400 rounded p-2 text-center">
            {error}
          </p>
        )}

        {/* Selected File Info */}
        {selectedFile && !uploading && (
          <p className="mt-2 text-gray-600 text-center">
            Selected: <span className="font-medium">{selectedFile.name}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default PdfUploadPage;
