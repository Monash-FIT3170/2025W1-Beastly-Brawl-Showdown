import { Namespace } from "socket.io"
import { MonsterId } from "../simulator/core/monster/monster_pool"
import { EntryID } from "../simulator/core/utils";
import { TargetingMethod } from "../simulator/core/action/targeting";
import { Notice } from "../simulator/core/notice/notice";
import { OrderedEvent } from "../simulator/core/event/event_history";
export type Result<T> = { success: true; value: T } | { success: false; error: Error };
export type MonsterName = string & { __brand: "MonsterName" };

export type PlayerNamespace = Namespace<PlayerClientToServerEvents, PlayerServerToClientEvents>;
export type HostNamespace = Namespace<HostClientToServerEvents, HostServerToClientEvents>;

export type BasicClientToServerEvents = {
  ping: () => void;
  echo: (msg: string) => void;
};

export type BasicServerToClientEvents = {
  pong: () => void;
  echo: (msg: string) => void;
  error: (msg: string) => void;
};

export type PlayerClientToServerEvents = BasicClientToServerEvents & {
  submitMonster: (data: { monsterTemplate: MonsterId; selections: number }) => void;
  submitMove: (data: {moveId: EntryID; targetingMethod: TargetingMethod}) => void;
  requestRoll: () => void;
};

export type PlayerServerToClientEvents = BasicServerToClientEvents & {
  newNotice: (notice: Notice) => void;
  newEvent: (event: OrderedEvent) => void;
  removeNotice: (notice: Notice) => void;
  requestMonsterSelection: (data: {monsterPool: string[]}) => void;
  enemyMoveSubmitted: () => void;
  unlockButton: () => void;
  startRound: (data: {player1Monster: string | undefined; player2Monster: string | undefined; sideID: number}) => void;
  sendToWaiting: () => void;
  tournamentFinished: (winner: string) => void;
};

export type PlayerSocketData = {};

export type HostClientToServerEvents = BasicClientToServerEvents & {
  requestRoom: (roomType: "standard" | "random") => void;
  requestStartGame: (roomId: number | undefined) => void;
};

export type HostServerToClientEvents = BasicServerToClientEvents & {
  refreshPlayerList: (playerNameList: string[]) => void;
  requestRoomResponse: (data: {roomId: number | undefined; joinCode: string}) => void;
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
