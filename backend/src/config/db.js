import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) throw new Error("MONGO_URI not set");

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("DB connection failed", error.message);
    process.exit(1);
  }
};

export default connectDB;
