import Monsters from '../monsters/Monsters';

/**
 * Represents a defend action taken by a monster.
 * When executed, it activates the monster's defense.
 */
export default class DefendAction {
    private monster: Monsters;

    constructor(monster: Monsters) {
        this.monster = monster;
    }

    execute(): void {
        this.monster.activateDefense();
    }
}
