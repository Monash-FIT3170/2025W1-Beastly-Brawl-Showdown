import Monsters from './Monsters';
import DiceRoller from '../utils/DiceRoller';

export default class ShadowFangPredator extends Monsters {
    private _critRoll: number;
    private _isInvulnerable: boolean;

    constructor() {
        super(20, 12, 4, "Critical hit on natural 18-20", "Attacker");
        this._critRoll = 18;
        this._isInvulnerable = false;
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

        if (roll >= this._critRoll) {
            totalAttack = 2 * roll + this._attackBonus;
            console.log(`${this._type} rolls ${roll}... Critical hit! Attack = ${totalAttack}.`);
        } else {
            totalAttack = roll + this._attackBonus;
            console.log(`${this._type} rolls ${roll}... Attack = ${totalAttack}.`);
        }

        return totalAttack;
    }

    defend(totalAttack: number): void {
        if (this._isInvulnerable) {
            console.log(`${this._type} evades the attack!`);
            return;
        } else {
            super.defend(totalAttack);
        }
    }

    revert(): void {
        this._defending = false;
        this._currentAC = this._baseAC;
        this._isInvulnerable = false;
    }

    useAbility(): void {
        this._currentAbilityCharges -= 1;
        this._isInvulnerable = true;
    }
}
