import Monsters from '../monsters/Monsters';

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
     * Static method to perform the ability action outside of instance context.
     * Calls useAbility on the attacker, passing the defender.
     */
    static perform(attacker: Monsters, defender: Monsters): void {
        attacker.useAbility(defender);
    }

    execute(): void {
        this.attacker.useAbility(this.defender);
    }
}
