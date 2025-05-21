import { Mongo } from "meteor/mongo";
import { DDP } from "meteor/ddp-client";
import Sqids from "sqids";

export const GameServerRecords = new Mongo.Collection("game_server_records");

/**
 *  Get the server most suitable for the requester
 * @returns The id of the most suitable data for this user
 */
export function getBestServer(): number {
  // TODO - have some sort of param to infer the best server from
  return 0; // TODO - for now it always gets the serrver with id 0
}

export async function assignNewRoom() {
  /// Get the server info of the best server
  const bestServerNo = getBestServer();
  const bestServerInfo = await GameServerRecords.findOneAsync({
    serverNo: bestServerNo,
  });

  if (!bestServerInfo) {
    throw Error(`Could not generate a new server @ server #${bestServerNo}.`);
  }

  const serverConnection = DDP.connect(bestServerInfo.serverURL);
  /// RPC @ ServerNo - request new room
  serverConnection.call("requestNewRoom", (error, result) => {
    if (error) {
      console.error("RPC Error:", error);
    } else {
      console.log("Response from remote Meteor service:", result);
    }
  });
}
