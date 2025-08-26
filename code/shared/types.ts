import { MoveRequest } from "../simulator/core/action/move/move";
import { MonsterTemplate } from "../simulator/core/monster/monster";
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
  submitMonsterChoice: () => void;
  submitGameReadyState: () => void;
  submitMove: (actionData: MoveRequest) => void;
  submitMoveLockState: () => void;
};

export type PlayerServerToClientEvents = BasicServerToClientEvents & {
  refreshPlayerList: (list: string[]) => void;
  requestMonsterSelection: (setMonsterName: (monsterName: MonsterName) => void) => void;
  requestMoveSelection: (responseDeadline: number) => void;

  submitGameReadyState: () => void;
  gameReadytoStart: () => void;
};

export type PlayerSocketData = {};

export type HostClientToServerEvents = BasicClientToServerEvents & {
  requestNewLobby: (res: (connectionDetails: Result<{ lobbyId: LobbyId; joinCode: JoinCode }>) => void) => void;

  requestStartGame: () => void;
  requestStartRound: () => void;
};
export type HostServerToClientEvents = BasicServerToClientEvents & {
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