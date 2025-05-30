import mongoose from "mongoose";
import { log_notice } from "../../shared/utils";

const MONGO_URI = "mongodb://localhost:27017/test";

const connectDb = () => {
  try {
    mongoose.connect(MONGO_URI);
    log_notice("Connected to MongoDB.");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDb;
