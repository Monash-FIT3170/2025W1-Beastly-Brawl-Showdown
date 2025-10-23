import { Namespace } from "socket.io"
export type Result<T> = { success: true; value: T } | { success: false; error: Error };
export type MonsterName = string & { __brand: "MonsterName" };

export type PlayerNamespace = Namespace<PlayerClientToServerEvents, PlayerServerToClientEvents>;
export type HostNamespace = Namespace<HostClientToServerEvents, HostServerToClientEvents>;

export type BasicClientToServerEvents = {
  ping(): void;
  echo(msg: any): void;
};

export type BasicServerToClientEvents = {
  pong: () => void;
  echo: (msg: any) => void;
  error: (msg: string) => void;
};

export type PlayerClientToServerEvents = BasicClientToServerEvents & {
  submitMonster: (data: any) => void;
  submitMove: (data: any) => void;
  requestRoll: (data: any) => void;
  requestReroll: (data: any) => void;
  playerSurrender: () => void;
  turnUpdated: (data: any) => void;
  playerAnimationsDone: (data: any) => void;
};

export type PlayerServerToClientEvents = BasicServerToClientEvents & {
  newNotice: (data: any) => void;
  newEvent: (data: any) => void;
  removeNotice: (data: any) => void;
  requestMonsterSelection: (data: any) => void;
  enemyMoveSubmitted: () => void;
  unlockButton: () => void;
  startRound: (data: any) => void;
  sendToWaiting: () => void;
  tournamentFinished: (data: any) => void;
  playerKicked: () => void;
  kickPlayer: () => void;
  turnUpdated: (data: any) => void;
};

export type PlayerSocketData = {};

export type HostClientToServerEvents = BasicClientToServerEvents & {
  requestRoom: (data: any) => void;
  requestStartGame: (data: any) => void;
  kickPlayer: (data: {roomId: number, playerName: string}) => void;
};

export type HostServerToClientEvents = BasicServerToClientEvents & {
  refreshPlayerList: (list: string[]) => void;
  requestRoomResponse: (data: any) => void;
};

export type PlayerChannelAuth = {
  joinCode: JoinCode;
  displayName: string;
};

export type LobbyId = number & { __brand: "LobbyId" };
export type JoinCode = string & { __brand: "JoinCode" };
export type ServerId = number & { __brand: "ServerId" };
export type AccountId = string;
export type RoomId = number & { __brand: "RoomId" };

// export type AccountId = string;
// export type MatchId = number;

// export enum RoomPhase {
//   /** Waiting for players to join (pre-start) */
//   AwaitJoin,
//   /** Wait for all players to choose a monster and/or other tasks before a game should start. */
//   PreGame,
//   /** A round is live. */
//   PlayingRound,
//   /** Waiting for host to start next round. */
//   RoundSummary,
// }

//#region DB
export const DOCUMENT_NAME = "game_server_registries";
export interface IGameServerRegistryEntry {
  serverNumber: number;
  serverUrl: string;
  lastUpdated: Date;
}
//#endregion
