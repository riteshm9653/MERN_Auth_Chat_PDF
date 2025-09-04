import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children }) => {
  const { userData } = useContext(AppContext);

  if (!userData) {
    toast.error("Please login to access this page");
    // Redirect to login if userData is not available
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;