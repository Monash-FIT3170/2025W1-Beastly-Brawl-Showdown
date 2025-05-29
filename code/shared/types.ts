// TODO export to all folders / make global across services

export type ServerId = number;
export type RoomId = number;
export type JoinCode = string;
export type AccountId = string;
export type Action = string;
export type MatchId = number;

export enum RoomPhase {
  /** Waiting for players to join (pre-start) */
  AwaitJoin,
  /** Wait for all players to choose a monster and/or other tasks before a game should start. */
  PreGame,
  /** A round is live. */
  PlayingRound,
  /** Waiting for host to start next round. */
  RoundSummary,
}

export type HostChannelAuth = {
  // hostName: string;
};

export type PlayerChannelAuth = {
  joinCode: string;
  displayName: string;
};

