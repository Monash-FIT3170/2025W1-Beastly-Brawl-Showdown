import Monsters from '../monsters/Monsters';
import { Server as SocketIOServer } from 'socket.io';

/**
 * Represents a defend action taken by a monster.
 * When executed, it activates the monster's defense.
 */
export default class DefendAction {
  private monster: Monsters;

  constructor(monster: Monsters) {
    this.monster = monster;
  }

  // TODO: make sure this socket connection uses the same connection as the player class
  execute(io: SocketIOServer, roomId: string): void {
    this.monster.activateDefense();

    io.to(roomId).emit("battle-log", {
      type: "defend",
      monster: this.monster.name,
      message: `${this.monster.name} is defending! AC is now ${this.monster.AC}.`,
    });
  }
}
