import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { GameServerRegistryModel } from "./models/game_server_register";

const MONGO_URI = process.env["MONGO_URI"] ?? `mongodb://localhost:27017/RoomLocation`;

async function connectToDatabase(): Promise<typeof mongoose> {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB at ${MONGO_URI}`);
    return mongoose;
  } catch (err) {
    console.error(`MongoDB connection error: ${err}`);
    process.exit(1);
  }
}

async function main() {
  console.log("--< START >--");
  //# DB
  console.log("Connecting to DDB...");
  const db = await connectToDatabase();
  db.connection.on("disconnect", () => {
    console.error("ERROR: Mongo disconnected...");
    process.exit(1);
  });
  console.log("Connected to mongo.");
  try {
    const _docSizeAtStartup = await GameServerRegistryModel.countDocuments();
    console.log("Current collection size:", _docSizeAtStartup);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
  //# HTTP server
  const app = express();
  app.use(express.json());
  app.use(
    cors({
      origin: "*",
    })
  );
  app.get("/", (req, res) => {
    res.sendStatus(403);
    return;
  });

  app.get("/status", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
    return;
  });

  app.get("/game-server-url", async (req: Request, res: Response) => {
    try {
      // const { roomCode: queriedRoomCode } = req.query;
      const bestServerNo: number = 7;

      // TODO validation and sanitation

      const record = await GameServerRegistryModel.findOne({ serverNumber: bestServerNo });
      if (!record) {
        res.status(400).json({ error: "Room not found." });
        return;
      }

      res.json({ url: record.serverUrl });
      return;
    } catch (err) {
      console.error("ERR: " + err);
      res.status(500).json({ error: "Request failed." });
      return;
    }
  });

  //# Listen
  const port: number = parseInt(process.env['PORT'] || '8000', 10);
  app.listen(port);
  console.log(`Listening @ port ${port}`);

  //# Ready
  console.log("--< READY >--");
}

main();
