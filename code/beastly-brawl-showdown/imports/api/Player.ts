import { Meteor } from "meteor/meteor";
import { Players } from "/imports/api/DataBases";

export class Player {
  private displayName: string;
  private playerId: string; //PlayerID

  constructor(displayName: string) {
    this.displayName = displayName;
    this.playerId = Player.generateRandomId();
  }

  /** Method to get the name of this player */
  getName(): string {
    return this.displayName;
  }

  /**Method to get ID of this player */
  getID(): string{
    return this.playerId;
  }

  /** Generate a unique player ID */
  static generateRandomId(length = 8): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }

  /**Save Player to a room with the information we need */
  static async saveToRoom(roomId: string, player: Player): Promise<string> {
  return new Promise((resolve, reject) => {
    Meteor.call(
      "players.save",
      roomId,
      {
        playerId: player.getID(),
        displayName: player.getName(),
      },
      (error: Meteor.Error | null, result: string) => {
        if (error) {
          console.error("Error saving player to room:", error);
          reject(error);
        } else {
          resolve(result);
        }
        }
      );
    });
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
