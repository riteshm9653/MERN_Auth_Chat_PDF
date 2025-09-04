import jwt from "jsonwebtoken";
const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided", success: false });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    if (!decoded) {
      return res
        .status(401)
        .json({ message: " Not Authorized Login Again", success: false });
    }
    if (decoded.id) {
      if (!req.body) req.body = {};
      req.body.userId = decoded.id;
    }
    console.log("decoded.id is ", decoded.id);
    next();
  } catch (error) {
    console.error("Error in userAuth middleware:", error);
    res.status(401).json({
      message: "Unauthorized access and error is " + error.message + " ",
      success: false,
    });
  }
};
export default userAuth;
