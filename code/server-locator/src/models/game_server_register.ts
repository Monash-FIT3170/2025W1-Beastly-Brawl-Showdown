import mongoose, { Model } from "mongoose";

const DOCUMENT_NAME = "game_server_registers";

export interface IGameServerRegistryEntry extends Document {
  serverNumber: Number;
  serverUrl: String;
  lastUpdated: Date;
}

const GameServerRegistrySchema = new mongoose.Schema<IGameServerRegistryEntry>({
  serverNumber: { type: Number, required: true, unique: true },
  serverUrl: { type: String, required: true, unique: true },
  lastUpdated: { type: Date, required: true },
});

// Check if the collection already exists, then create it
export const GameServerRegistryModel: Model<IGameServerRegistryEntry> = mongoose.models[DOCUMENT_NAME] || mongoose.model(DOCUMENT_NAME, GameServerRegistrySchema);
