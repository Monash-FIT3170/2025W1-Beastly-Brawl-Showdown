import Monsters from '../monsters/Monsters';

/**
 * Represents an attack action between two monsters.
 * The attacker attempts to strike the defender with a total attack value.
 */
export default class AttackAction {
    private attacker: Monsters;
    private defender: Monsters;

    constructor(attacker: Monsters, defender: Monsters) {
        this.attacker = attacker;
        this.defender = defender;
    }

    execute(): void {
        const totalAttack = this.attacker.attack();
        this.defender.defend(totalAttack);
    }
}
