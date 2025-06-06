// config/db.ts
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI!);
    console.log("MongoDB connected");
    return db;
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
};