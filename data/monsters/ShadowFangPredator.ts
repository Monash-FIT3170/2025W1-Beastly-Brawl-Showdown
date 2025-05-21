import Monsters from './Monsters';
import DiceRoller from '../utils/DiceRoller';

export default class ShadowFangPredator extends Monsters {
    private critRoll: number;
    private isInvulnerable: boolean;

    constructor() {
        super(20, 12, 4, "Critical hit on natural 18-20", "Attacker");
        this.critRoll = 18;
        this.isInvulnerable = false;
    }

    /**
     * Attacks a defender. Rolls d20, ALLOWS CRITS
     * @param defender The monster being attacked.
     * @returns totalAttack The total attack value.
     * defender: Monsters
     * TODO:FIX IF NEEDED
     */
    attack(): number {
        const roll: number = DiceRoller.d20();
        let totalAttack: number = 0;

        if (roll >= this.critRoll) {
            totalAttack = 2 * roll + this.attackBonus;
            console.log(`${this.type} rolls ${roll}... Critical hit! Attack = ${totalAttack}.`);
        } else {
            totalAttack = roll + this.attackBonus;
            console.log(`${this.type} rolls ${roll}... Attack = ${totalAttack}.`);
        }

        return totalAttack;
    }

    defend(totalAttack: number): void {
        if (this.isInvulnerable) {
            console.log(`${this.type} evades the attack!`);
            return;
        } else {
            super.defend(totalAttack);
        }
    }

    revert(): void {
        this.defending = false;
        this.currentAC = this.baseAC;
        this.isInvulnerable = false;
    }

    useAbility(): void {
        this.currentAbilityCharges -= 1;
        this.isInvulnerable = true;
    }
}
