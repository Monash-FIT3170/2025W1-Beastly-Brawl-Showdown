import { MoveRequest } from "../beastly-brawl-showdown/imports/simulator/core/action/move/move";
import { MoveId } from "../beastly-brawl-showdown/imports/simulator/core/action/move/move_pool";
import { MonsterId } from "../beastly-brawl-showdown/imports/simulator/core/monster/monster_pool";
import { Notice } from "../beastly-brawl-showdown/imports/simulator/core/notice/notice";

export type Result<T> = { success: true; value: T } | { success: false; error: Error };
export type MonsterName = string & { __brand: "MonsterName" };

type BasicClientToServerEvents = {
  ping(): void;
};

type BasicServerToClientEvents = {
  pong: () => void;
  error: (msg: string) => void;
};

export type PlayerClientToServerEvents = BasicClientToServerEvents & {
  requestMonsterSelection: (monsterId: MonsterId) => void;
  requestRoll: () => void;
  requestSubmitMove: (data: {moveId: MoveId}) => void;
};

export type PlayerServerToClientEvents = BasicServerToClientEvents & {
  refreshPlayerList: (list: string[]) => void;
  enterWaitingRoom: () => void;
  gameReadyToStart: () => void;
  startRound: (data: {myMonsterName: string | undefined; enemyMonsterName: string | undefined; sideId: number}) => void;
  executeTurn: (data: {playerMove: MoveRequest | undefined; enemyMove: MoveRequest | undefined}) => void;
  unlockButton: () => void;
  tournamentFinished: (data: any) => void;
  newNotice: (notice: Notice) => void;
  removeNotice: (notice: Notice) => void;
  newEvent: (event: any) => void;
};

export type PlayerSocketData = {};

export type HostClientToServerEvents = BasicClientToServerEvents & {
  requestNewLobby: (res: (connectionDetails: Result<{ lobbyId: LobbyId; joinCode: JoinCode }>) => void) => void;
  requestStartGame: (roomId: number | undefined) => void;
};
export type HostServerToClientEvents = BasicServerToClientEvents & {
  newLobbyCreated: (data: {roomId: RoomId; joinCode: JoinCode}) => void;
  refreshPlayerList: (list: string[]) => void;
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