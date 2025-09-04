import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/mern-auth`);
    console.log("MongoDB connected successfully");
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connection established successfully");
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // Exit the process with failure
  }
};
export default connectDB;
