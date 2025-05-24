import Monsters from '../monsters/Monsters';

/**
 * Represents an attack action between two monsters.
 * The attacker attempts to strike the defender with a total attack value.
 */
export default class AttackAction {
    label = "Attack";

    private attacker: Monsters;
    private defender: Monsters;

    constructor(attacker: Monsters, defender: Monsters) {
        this.attacker = attacker;
        this.defender = defender;
    }

    async execute(): Promise<void> {
        const totalAttack = this.attacker.attack();
        this.defender.defend(await totalAttack);
    }
}
