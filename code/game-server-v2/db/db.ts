import mongoose from "mongoose";
import { log_notice } from "../utils";

const MONGO_URI = "mongodb://localhost:27017/test";

export default async function connectDb() {
  try {
    mongoose.connect(MONGO_URI);
    log_notice("Connected to MongoDB.");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
