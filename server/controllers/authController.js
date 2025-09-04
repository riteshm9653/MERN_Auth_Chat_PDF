//register andloggina dn possword resta dn creae dhte api end point
// import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";
import bcrypt from "bcryptjs";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Check if user already exists
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }
    console.log(password);
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }
    const hashsedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      name,
      email,
      password: hashsedPassword,
    });
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    //name and token send in the cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none " : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    //sending welcome email
    const mailOptions = {
      from: process.env.SERVER_EMAIL,
      to: email,
      subject: "Welcome to TCET  Authentication project",
      text: `Hello ${name},\n\n.Your account has been created with email ID ${email} .Thank you for registering with us! We're excited to have you on board.\n\nBest regards,\nYour Company`,
    };

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent successfully:", info.response);
      }
    });
    // Send response
    return res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: {
        name: user.name,
        email: user.email,
      },
    });
    // return res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({
      message: "Internal server error and error is " + error.message + " ",
      success: false,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }
    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(200).json({
      message: "Login successful",
      success: true,
      user,
    });
    return res.json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({
      message: "Internal server error and error is " + error.message + " ",
      success: false,
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res
      .status(200)
      .json({ message: "Logout successful", success: true });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({
      message: "Internal server error and error is " + error.message + " ",
      success: false,
    });
  }
};

//user email verification controller to verify the email id and password
    export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res
        .status(400)
        .json({ message: "User ID is required or wrong", success: false });
    }
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    // initial user is verified is false
    if (user.isVerified) {
      return res
        .status(400)
        .json({ message: "User/Account already verified", success: false });
    }
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = otpExpireAt;
    await user.save();
    // Send OTP via email
    const mailOptions = {
      from: process.env.SERVER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      // text: `Hello ${user.name},\n\nYour verification OTP is: ${otp}\n\nThis OTP is valid for 24 hours.\n\nBest regards,\nYour TCET Authentication Team`,
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email).replace("{{name}}",user.name),
    };
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent successfully:", info.response);
      }
    });
    return res.json({
      success: true,
      message: "Verification OTP sent to your email",
      userinfo: { name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Error in sending verification OTP:", error);
    res.status(500).json({
      message: "Internal server error and error is " + error.message + " ",
      success: false,
    });
  }
};

//verify the email using the Otp
export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;
  console.log("UserId is ", userId);
  console.log("Otp ", otp);

  try {
    if (!userId || !otp) {
      return res
        .status(400)
        .json({ message: "Missing Details", success: false });
    }
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    if (user.isVerified) {
      return res
        .status(400)
        .json({ message: "User already verified", success: false });
    }
    console.log(" user Otp is " + user.verifyOtp);
    const inputOtp = String(otp).trim();
    if (user.verifyOtp !== String(otp) || user.verifyOtp !== inputOtp) {
      return res.status(400).json({ message: "Invalid OTP", success: false });
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired", success: false });
    }
    user.isVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();
    res
      .status(200)
      .json({ message: "Email verified successfully", success: true });
  } catch (error) {
    console.error("Error in email verification:", error);
    res.status(500).json({
      message: "Internal server error and error is " + error.message + " ",
      success: false,
    });
  }
};

//check is
export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true, message: " user is already authicated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//send password reset OTP
export const sendRestOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ message: "Email is Required", Success: false });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpireAt = Date.now() + 15 * 60 * 1000; //otp valid for 15 min
    user.resetOtp = otp;
    user.resetOtpExpireAt = otpExpireAt;
    await user.save();

    const mailOption = {
      from: process.env.SERVER_EMAIL,
      to: user.email,
      subject: "password rest Otp",
      // text: `Hello ${user.name},\n\nYour password reset OTP is: ${otp}\n\nThis OTP is valid for 15 minutes.\n\nBest regards,\nYour TCET Authentication Team`,
      html:PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email).replace("{{name}}",user.name),
    };
    await transporter.sendMail(mailOption);
    return res.json({
      success: true,
      message: "Password reset OTP sent to your email ",
      userinfo: { name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Error in Sending password reset OTP", error);
    return res.status(500).sjon({
      message: "internal server error and error is " + error.message + " ",
      success: false,
    });
  }
};

//Reset the User password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      message: "Email ,Otp and New Password is Required ",
      success: false,
    });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ message: "user not found", success: false });
    }

    if (user.resetOtp === "" || user.resetOtp !== String(otp)) {
      return res.status(400).json({ message: "Invalid Otp", success: false });
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({ message: "Otp Expired", success: false });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();
    return res
      .status(200)
      .json({ message: "Password reset successful", success: true });
  } catch (error) {
    console.error("Error in Resting password", error);
    return res.status(500).json({
      message: "internal server error and error is " + error.message + " ",
      success: false,
    });
  }
};
