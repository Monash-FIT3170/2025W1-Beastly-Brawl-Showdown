import { Mongo } from "meteor/mongo";
import { sqids } from "./main";

export const GameServerRecords = new Mongo.Collection("game_server_registers");

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
  const serverInfo = await GameServerRecords.findOneAsync({
    serverNumber: bestServerNo,
  });

  if (!serverInfo) {
    console.log(serverInfo)
    throw new Error(`Server #${bestServerNo} is unavailable.`);
  }

  return serverInfo.serverUrl;
}

export async function locateServer(joinCode: string): Promise<string> {
  const [serverNo] = sqids.decode(joinCode);

  const serverInfo = await GameServerRecords.findOneAsync({
    serverNumber: serverNo,
  });

  if (!serverInfo) {
    throw new Error(`Server #${serverNo} is unavailable.`);
  }

  return serverInfo.serverUrl;
}
