import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const HomePage = () => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPdfs();
  }, []);

  // Fetch PDFs from the backend
  const fetchPdfs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/pdf`
      );
      setPdfs(response.data);
    } catch (err) {
      console.error("Error while fetching PDFs:", err);
      setError(
        err.response?.data?.msg ||
          "Error while fetching PDFs. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete a PDF by ID
  const handleDeletePdf = async (pdfId) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this PDF?"
      );
      if (!confirmDelete) return;

      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/pdf/${pdfId}`
      );

      // Remove the deleted PDF from the state
      setPdfs((prevPdfs) => prevPdfs.filter((pdf) => pdf._id !== pdfId));
      toast.success("PDF deleted successfully!");
    } catch (err) {
      console.error("Error while deleting PDF:", err);
      toast.error(
        err.response?.data?.msg ||
          "Error while deleting the PDF. Please try again later."
      );
    }
  };

  // Navigate to the chat page for a specific PDF
  const handleChatClick = (pdfId) => {
    navigate(`/chat/${pdfId}`);
  };

  return (
    <div className="flex items-center justify-center flex-col min-h-screen bg-gray-100">
      {/* Container */}
      <div className="bg-white border border-gray-300 rounded-lg w-full max-w-2xl shadow-md">
        {/* Header */}
        <div className="p-4 bg-gray-200 rounded-t-lg text-center">
          <h2 className="text-xl font-semibold">Your Uploaded PDFs</h2>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Loading State */}
          {loading && (
            <p className="text-center text-gray-600 py-4">Loading PDFs...</p>
          )}

          {/* Error State */}
          {error && <p className="text-center text-red-500 py-4">{error}</p>}

          {/* No PDFs Found */}
          {!loading && !error && pdfs.length === 0 && (
            <p className="text-center text-gray-600 py-4">
              No PDFs found. Please upload some PDFs. Go to the{" "}
              <Link to="/upload" className="text-blue-500 underline">
                Upload Page
              </Link>{" "}
              to get started.
            </p>
          )}

          {/* PDFs List */}
          {!loading && !error && pdfs.length > 0 && (
            <ul className="space-y-4">
              {pdfs.map((pdf) => (
                <li
                  key={pdf._id}
                  className="border border-gray-300 rounded-lg p-4 flex items-center justify-between bg-white"
                >
                  {/* PDF Name and Status */}
                  <span className="font-medium text-gray-800">
                    {pdf.originalName} (
                    <span
                      className={`font-semibold ${
                        pdf.processed ? "text-green-500" : "text-yellow-600"
                      }`}
                    >
                      {pdf.processed ? "Processed" : "Processing"}
                    </span>
                    )
                  </span>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {pdf.processed && (
                      <button
                        onClick={() => handleChatClick(pdf._id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                      >
                        Chat
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePdf(pdf._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
