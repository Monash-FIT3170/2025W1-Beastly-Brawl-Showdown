import Monsters from '../monsters/Monsters';
import { Server as SocketIOServer } from 'socket.io';

/**
 * Represents an ability action where a monster uses a special ability against a defender.
 */
export default class AbilityAction {
    private attacker: Monsters;
    private defender: Monsters;

    constructor(attacker: Monsters, defender: Monsters) {
        this.attacker = attacker;
        this.defender = defender;
    }

    /**
     * Executes the ability and emits a socket event to a specific room.
     * @param io - Socket.io server instance.
     * @param roomId - The battle room to emit to.
     */
    // TODO: make sure this socket connection uses the same connection as the player class
    execute(io: SocketIOServer, roomId: string): void {
        this.attacker.useAbility(this.defender);

        io.to(roomId).emit('battle-log', {
            type: 'ability',
            attacker: this.attacker.name,
            defender: this.defender.name,
            message: `${this.attacker.name} uses their special ability on ${this.defender.name}!`,
        });
    }
}
