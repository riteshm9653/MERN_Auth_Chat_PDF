import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ message: "user Not fonund", success: false });
    }
    res.json({
      success: true,
      userData: {
        name: user.name,
        isVerified: user.isVerified,
        email: user.email,
      },
    });
  } catch (error) {
    res.json({ message: error.message, success: false });
  }
};
