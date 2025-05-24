import { Player } from "./Player";

export class Room {
  /** Preferences and Settings */
  preferences: Record<string, any> = {};

  /** List of players */
  players: Player[] = []; // Temporary: No limit to number of players

  /** Game state / History */
  gameState: Record<string, any> = {};

  private roomCode: string;

  constructor(roomCode: string) {
    this.roomCode = roomCode;
  }

  /** Method to add player to the list of players */
  addPlayer(player: Player): void {
    this.players.push(player);
  }

  /** Method to get the id of this room */
  getRoomCode(): string {
    return this.roomCode;
  }
}