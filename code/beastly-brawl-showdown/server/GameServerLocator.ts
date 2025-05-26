import { DDP } from "meteor/ddp";
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

// export async function requestRoomCreation(): Promise<{
//   serverUrl: string;
//   roomId: number;
//   joinCode: string;
// }> {
//   /// Get the server info of the best server
//   const bestServerNo = getBestServerNo();
//   const bestServerInfo = await GameServerRecords.findOneAsync({
//     serverNo: bestServerNo,
//   });

//   if (!bestServerInfo) {
//     throw new Error(`Server #${bestServerNo} is unavailable.`);
//   }

//   console.log(`Attempting to connect to server @ ${bestServerInfo.serverUrl}`);
//   const serverConnection = DDP.connect(bestServerInfo.serverUrl);

//   /// RPC @ ServerNo - request new room
//   return new Promise((resolve, reject) => {
//     serverConnection.call(
//       "requestNewRoom",
//       (error: Error, result: { roomId: number; joinCode: string }) => {
//         if (error) {
//           console.error("RPC Error:", error);
//           reject(error);
//         } else {
//           console.log("Result of new room request:", result);
//           resolve({
//             serverUrl: bestServerInfo.serverUrl,
//             roomId: result.roomId,
//             joinCode: result.joinCode,
//           });
//         }
//       }
//     );
//   });
// }

export async function locateServerBest(): Promise<string> {
  const bestServerNo = getBestServerNo();
  const serverInfo = await GameServerRecords.findOneAsync({
    serverNumber: bestServerNo,
  });

  if (!serverInfo) {
    throw new Error(`Server #${bestServerNo} is unavailable.`);
  }

  return serverInfo.serverUrl;
}

export async function locateServer(joinCode: string): Promise<string> {
  const [serverNo, roomId] = sqids.decode(joinCode);

  const serverInfo = await GameServerRecords.findOneAsync({
    serverNumber: serverNo,
  });

  if (!serverInfo) {
    throw new Error(`Server #${serverNo} is unavailable.`);
  }

  return serverInfo.serverUrl;
}
