import { Server as SocketIOServer } from 'socket.io';
import Monsters from '../monsters/Monsters';

export default class AttackAction {
  private attacker: Monsters;
  private defender: Monsters;

  constructor(attacker: Monsters, defender: Monsters) {
    this.attacker = attacker;
    this.defender = defender;
  }

  // TODO: make sure this socket connection uses the same connection as the player class
  async execute(io: SocketIOServer, roomId: string): Promise<void> {
    const roll = await this.attacker.attack();
    this.defender.defend(roll);

    // Emit the attack log to the battle room
    io.to(roomId).emit("battle-log", {
      type: "attack",
      attacker: this.attacker.name,
      defender: this.defender.name,
      roll,
      defenderHP: this.defender.health,
    });

    // Emit an HP update specifically to the room (not global)
    io.to(roomId).emit("update-hp", {
      playerId: this.defender.name, // ideally use a real unique ID
      newHp: this.defender.health,
    });
  }
}
