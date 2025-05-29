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

    execute(io: SocketIOServer, roomId: string): void {
        this.monster.activateDefense();

        io.to(roomId).emit('battle-log', {
            type: 'defend',
            monster: this.monster.name,
            message: `${this.monster.name} is defending! AC is now ${this.monster.AC}.`,
        });
    }
}
