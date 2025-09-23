import mongoose, { Schema, Document } from "mongoose";

// Interface
export interface IGameServerRecord extends Document {
  serverName: string;
  serverUrl: string;
  serverNumber: string;
  status: string;
}

// Schema
const GameServerRecordSchema = new Schema<IGameServerRecord>(
  {
    serverName: { type: String, required: true },
    serverUrl: { type: String, required: true },
    serverNumber: { type: String, required: true },
    status: { type: String, required: true },
  },
  { timestamps: true, collection: "game_server_registers" }
);

export const GameServerRecord = mongoose.model<IGameServerRecord>("GameServerRecord", GameServerRecordSchema);
