//#region Logging
/// See: https://stackoverflow.com/questions/4842424/list-of-ansi-color-escape-sequences
export function log_notice(val: any) {
  console.log("\x1b[38;5;0m[Notice]\x1b[0m", val);
}

export function log_warning(val: any) {
  console.log("\x1b[38;5;3m[Warning]\x1b[0m", val);
}

export function log_attention(val: any) {
  console.log("\x1b[4;38;5;9m[Attention]\x1b[0m", val);
}

export function log_event(val: any) {
  console.log("\x1b[38;5;6m[Event]\x1b[0m", val);
}
//#endregion

//#region DB
import mongoose from "mongoose";
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
//#endregion
