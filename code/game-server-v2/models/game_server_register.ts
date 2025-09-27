import mongoose, { Model } from "mongoose";
import { IGameServerRegistryEntry, DOCUMENT_NAME } from "../../shared/types";

// Schema definition
const GameServerRegistrySchema = new mongoose.Schema<IGameServerRegistryEntry>({
  serverNumber: { type: Number, required: true, unique: true },
  serverUrl: { type: String, required: true, unique: true },
  lastUpdated: { type: Date, required: true },
});

// Model export
export const GameServerRegistryModel: Model<IGameServerRegistryEntry> = mongoose.models[DOCUMENT_NAME] || mongoose.model<IGameServerRegistryEntry>(DOCUMENT_NAME, GameServerRegistrySchema);
