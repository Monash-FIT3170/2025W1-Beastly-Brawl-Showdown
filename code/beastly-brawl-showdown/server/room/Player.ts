import { Players } from "/imports/api/DataBases";

export class Player {
  private displayName: string;
  private playerId: string; //PlayerID

  constructor(displayName: string, playerId?: string) {
    this.displayName = displayName;
    this.playerId = playerId ?? Player.generateRandomId();
  }

  /** Method to get the name of this player */
  getName(): string {
    return this.displayName;
  }

  /**Method to get ID of this player */
  getID(): string{
    return this.playerId;
  }

  /** Method to display player name when player object is printed */
  toString(): string {
    return this.displayName;
  }

  /** Generate a unique player ID */
  static generateRandomId(length = 8): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }

  /**Save Player to a room with the information we need */
  async saveToRoom(roomId: string): Promise<string>{
    const existing = await Players.findOneAsync({ roomId, playerId: this.playerId});
    if (existing) return this.playerId;

    await Players.insertAsync({
      roomId,
      playerId: this.playerId,
      displayName: this.displayName,
      monster: null,
      confirmed: false,
    });

    return this.playerId
  }

  /**Confirm a Monster has been selected and save it to the unique player, then set confirmed to be true */
  static async confirmMonster(roomId: string, playerId: string, monster: string){
    await Players.updateAsync(
      { roomId, playerId},
      {
        $set: {monster, confirmed: true},
      }
    );
  }

  /**Check to see if all players within a room have selected a Monster and confirmed is also selected */
  static async allConfirmed (roomId: string): Promise<boolean>{
    const players = await Players.find({ roomId}).fetchAsync();
    return players.length > 0 && players.every(p => p.monster && p.confirmed);
  }
}
