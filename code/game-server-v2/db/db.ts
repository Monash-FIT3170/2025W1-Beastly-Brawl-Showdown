import mongoose from "mongoose";
import { log_notice } from "../utils";

export const MONGO_URI = "mongodb://mongo:27017/game_server_register";
// const MONGO_URI = "mongodb://localhost:27017/test?tls=true&tlsCertificateKeyFile=../certs/client.pem&tlsCAFile=../certs/ca.crt";

export default async function connectDb() {
  try {
    await mongoose.connect(MONGO_URI);
    log_notice("Connected to MongoDB.");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
