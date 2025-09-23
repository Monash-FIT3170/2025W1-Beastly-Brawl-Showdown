import "./RoomMethods";
import Sqids from "sqids";
import "./RoomMethods";
import { GameServerRecord } from "./models/game_server_record";

const newServer = new GameServerRecord({
  serverName: "Alpha",
  ipAddress: "192.168.1.1",
  status: "online",
});

await newServer.save();

const CODE_MIN_LENGTH = 6; // TODO use a global / db record
const CODE_ALPHABET = "0123456789";

/** Initialize new sqids object */
export const sqids = new Sqids({
  minLength: CODE_MIN_LENGTH,
  alphabet: CODE_ALPHABET,
});

/**
 *  Get the server most suitable for the requester
 * @returns The id of the most suitable data for this user
 */
export function getBestServerNo(): number {
  // TODO - have some sort of param to infer the best server from
  return 7; // TODO - for now it always gets the server with this
}

export async function locateServerBest(): Promise<string> {
  const bestServerNo = getBestServerNo();
  const serverInfo = await GameServerRecord.findOne({
    serverNumber: bestServerNo,
  });

  if (!serverInfo) {
    console.log(serverInfo);
    throw new Error(`Server #${bestServerNo} is unavailable.`);
  }

  return serverInfo.serverUrl;
}

export async function locateServer(joinCode: string): Promise<string> {
  const [serverNo] = sqids.decode(joinCode);

  const serverInfo = await GameServerRecord.findOne({
    serverNumber: serverNo,
  });

  if (!serverInfo) {
    throw new Error(`Server #${serverNo} is unavailable.`);
  }

  return serverInfo.serverUrl;
}
