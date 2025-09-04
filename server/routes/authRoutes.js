import express from "express";
import {
  register,
  login,
  logout,
  sendVerifyOtp,
  verifyEmail,
  isAuthenticated,
  sendRestOtp,
  resetPassword,
} from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";
const authrouter = express.Router();

authrouter.post("/register", register);
authrouter.post("/login", login);
authrouter.post("/logout", logout);
authrouter.post("/send-verify-otp", userAuth, sendVerifyOtp);
authrouter.post("/verify-account", userAuth, verifyEmail);
authrouter.get("/is-auth", userAuth, isAuthenticated);
authrouter.post("/send-rest-otp", sendRestOtp);
authrouter.post("/rest-password", resetPassword);

export { authrouter };
