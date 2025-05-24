import Monsters from '../monsters/Monsters';

/**
 * Represents an ability action where a monster uses a special ability against a defender.
 */
export default class AbilityAction {
    label = "Special";
    
    private attacker: Monsters;
    private defender: Monsters;

    constructor(attacker: Monsters, defender: Monsters) {
        this.attacker = attacker;
        this.defender = defender;
    }

    execute(): void {
        this.attacker.useAbility(this.defender);
    }
}
