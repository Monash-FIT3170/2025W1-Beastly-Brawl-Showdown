import mongoose from "mongoose";

export interface IGameServerRegisterEntry extends Document {
  serverNumber: String;
  serverUrl: String;
  lastUpdated: Date;
}

const GameServerRegsiterSchema = new mongoose.Schema<IGameServerRegisterEntry>({
  serverNumber: { type: Number, required: true, unique: true },
  serverUrl: { type: String, required: true, unique: true },
  lastUpdated: { type: Date, required: true },
});

// Check if the collection already exists, then create it
export const GameServerRegisterModel =
  mongoose.models.GameServerRecordSchema ||
  mongoose.model("game_server_register", GameServerRegsiterSchema);
