import DiceRoller from '../utils/DiceRoller';
import AttackAction from '../actions/AttackAction';
import DefendAction from '../actions/DefendAction';
import AbilityAction from '../actions/AbilityAction';

/**
 * Base class for the different monsters in the game.
 * Includes all universal attributes with some default values.
 * Includes default methods such as attack and defend for monster subclasses which share functionality.
 */
export default class Monsters {
    protected _baseHealth: number;
    protected _currentHealth: number;
    protected _baseAC: number;
    protected _currentAC: number;
    protected _attackBonus: number;
    protected _special: string;
    protected _baseAbilityCharges: number;
    protected _currentAbilityCharges: number;
    protected _type: string;
    protected _baseDefenseCharges: number;
    protected _currentDefenseCharges: number;
    protected _defending: boolean;
    protected _stunRemaining: number;

    constructor(health: number, AC: number, attackBonus: number, special: string, type: string) {
        this._baseHealth = health;
        this._currentHealth = health;
        this._baseAC = AC;
        this._currentAC = AC;
        this._attackBonus = attackBonus;
        this._special = special;
        this._baseAbilityCharges = 1;
        this._currentAbilityCharges = 1;
        this._type = type;
        this._baseDefenseCharges = 3;
        this._currentDefenseCharges = 3;
        this._defending = false;
        this._stunRemaining = 0;
    }

    /**
     * Activates this monster's defense, raising the AC and consuming a defense charge.
     */
    activateDefense(): void {
        this._defending = true;
        this._currentAC = this._baseAC + 2;
        this._currentDefenseCharges -= 1;
    }

    /**
     * Initiates an attack against an opponent.
     * Rolls the d20 and calculates the totalAttack delivered using the roll and this monster's attack bonus.
     * 
     * @returns totalAttack: The power of this attack.
     */
    async attack(): Promise<number> {
        const roll = DiceRoller.d20();
        const totalAttack = roll + this._attackBonus;
        console.log(`${this.type} rolls ${roll}... Attack = ${totalAttack}.`);
        return totalAttack;
    }

    /**
     * Computes an incoming attack from another monster.
     * Checks whether this monster's defense is activated.
     * Compares totalAttack to AC and decrements this monster's health appropriately.
     * 
     * @param totalAttack The power of the incoming attack.
     */
    defend(totalAttack: number): void {
        if (this._defending === true) {
            if (totalAttack >= this._currentAC) {
                console.log(`${this.type}'s defense fails! ${this.type} takes 5 damage.`);
                this._currentHealth -= 5;
            } else {
                console.log(`The attack misses!`);
            }

            // Reset AC and defense flag after defense turn ends
            this._currentAC = this._baseAC;
            this._defending = false;
        } else {
            if (totalAttack >= this._currentAC) {
                console.log(`${this.type} takes ${totalAttack} damage!`);
                this._currentHealth -= 5;
            } else {
                console.log(`${this.type}: The attack misses!`);
            }
        }
    }

    /**
     * Generates the possible actions a monster can take given its status, defense charges and ability charges.
     * 
     * @param opponent The monster which this monster is fighting.
     * @returns An array of possible actions.
     */
    generateActions(opponent: Monsters): any[] {
        const actions: any[] = [];
        if (this._stunRemaining === 0) {
            actions.push(new AttackAction(this, opponent));
            if (this._currentDefenseCharges > 0) {
                actions.push(new DefendAction(this));
            }
            if (this._currentAbilityCharges > 0) {
                actions.push(new AbilityAction(this, opponent));
            }
        }
        return actions;
    }

    /**
     * Resets this monster's AC to base.
     * Used to wipe status effects and revert a defense action after each turn in a battle.
     */
    revert(): void {
        this._currentAC = this._baseAC;
        if (this._stunRemaining > 0) {
            this._stunRemaining -= 1;
        }
    }

    /**
     * Resets this monster to its initial state.
     * Used at the end of a battle to ready this monster for the next fight.
     */
    reset(): void {
        this._currentHealth = this._baseHealth;
        this._currentAC = this._baseAC;
        this._currentDefenseCharges = this._baseDefenseCharges;
        this._stunRemaining = 0;
        this._currentAbilityCharges = this._baseAbilityCharges;
    }

    /**
     * Applies a stun effect to the monster, lasting 2 turns.
     */
    stun(): void {
        this._stunRemaining += 2;
    }

    /**
     * Placeholder for a monster's special ability. Should be overridden by subclasses.
     * 
     * @param defender The opponent affected by the ability.
     */
    useAbility(defender: Monsters): void { }

    // Getters and setters

    get AC(): number {
        return this._currentAC;
    }

    set AC(value: number) {
        this._currentAC = value;
    }

    get attackBonus(): number {
        return this._attackBonus;
    }

    set attackBonus(value: number) {
        this._attackBonus = value;
    }

    get health(): number {
        return this._currentHealth;
    }

    set health(value: number) {
        this._currentHealth = value;
    }

    get type(): string {
        return this._type;
    }

    get abilityCharges(): number {
        return this._currentAbilityCharges;
    }

    get defenseCharges(): number {
        return this._currentDefenseCharges;
    }

    get defending(): boolean {
        return this._defending;
    }

}
