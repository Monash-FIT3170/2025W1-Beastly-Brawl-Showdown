import { MoveRequest } from "../beastly-brawl-showdown/imports/simulator/core/action/move/move"
import { Player } from "../game-server-v2/player";
import { MonsterId } from "../simulator/core/monster/monster_pool";
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
  submitMonsterChoice: (data: { data: MonsterId }) => void;
  submitGameReadyState: () => void;
  submitMove: (actionData: MoveRequest) => void;
  submitMoveLockState: () => void;
  requestRoll: () => void;
};

export type PlayerServerToClientEvents = BasicServerToClientEvents & {
  refreshPlayerList: (list: string[]) => void;
  requestMonsterSelection: (setMonsterName: (monsterName: MonsterName) => void) => void;
  requestMoveSelection: (responseDeadline: number) => void;
  submitGameReadyState: () => void;
  gameReadytoStart: () => void;
  executeTurn: (data: any) => void;
  unlockButton: () => void;
  gameStarted: () => void;
  matchStarted: (data: any) => void;
  startRound: (data: any) => void;
  startWaiting: () => void;
  endWaiting: () => void;
  endTournament: (data: any) => void;
  newNotice: (data: any) => void;
  newEvent: (data: any) => void;
};

export interface PlayerSocketData {
  player: Player;
}


export type HostClientToServerEvents = BasicClientToServerEvents & {
  requestNewLobby: (res: (connectionDetails: Result<{ lobbyId: LobbyId; joinCode: JoinCode }>) => void) => void;
  requestRoom: () => void;
  requestStartGame: () => void;
  requestStartRound: () => void;
  message: (message: string) => void;
  startGame: (data: any) => void;
};
export type HostServerToClientEvents = BasicServerToClientEvents & {
  refreshPlayerList: (list: string[]) => void;
  echo: (message: string) => void;
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