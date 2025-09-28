import { MoveRequest } from "../beastly-brawl-showdown/imports/simulator/core/action/move/move"
export type Result<T> = { success: true; value: T } | { success: false; error: Error };
export type MonsterName = string & { __brand: "MonsterName" };

type BasicClientToServerEvents = {
  ping(): void;
};

type BasicServerToClientEvents = {
  pong: () => void;
  error: (msg: string) => void;
  gameReadyToStart: () => void;
};

export type PlayerClientToServerEvents = BasicClientToServerEvents & {
  requestMonsterSelection: (data: any) => void;
  submitMonsterChoice: () => void;
  submitGameReadyState: () => void;
  requestRoll: () => void;
  requestSubmitMove: (data: any) => void;
  submitMoveLockState: () => void;
};

export type PlayerServerToClientEvents = BasicServerToClientEvents & {
  refreshPlayerList: (list: string[]) => void;
  enterWaitingRoom: () => void;
  requestMoveSelection: (responseDeadline: number) => void;
  gameReadytoStart: () => void;
  startRound: (data: any) => void;
  executeTurn: (data: any) => void;
  unlockButton: () => void;
  tournamentFinished: (data: any) => void;
  newNotice: (data: any) => void;
  removeNotice: (data: any) => void;
  newEvent: (data: any) => void;
};

export type PlayerSocketData = {};

export type HostClientToServerEvents = BasicClientToServerEvents & {
  requestNewLobby: (res: (connectionDetails: Result<{ lobbyId: LobbyId; joinCode: JoinCode }>) => void) => void;
  requestStartGame: (data: any) => void;
  requestStartRound: (data: any) => void;
};
export type HostServerToClientEvents = BasicServerToClientEvents & {
  newLobbyCreated: (data: any) => void;
  refreshPlayerList: (list: string[]) => void;
  gameReadyToStart: (data: any) => void;
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