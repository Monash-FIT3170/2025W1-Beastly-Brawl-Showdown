const DiceRoller = require('../utils/DiceRoller');

/**
 * Base class for the different monsters in the game.
 * Includes all universal attributes with some default values.
 * Includes default methods such as attack and defend for monster subclasses which share functionality.
 */
class Monsters {
    constructor(health, AC, attackBonus, special, type) {
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
     * Activates this monsters defense, raising the AC and consuming a defense charge.
     */
    activateDefense() {
        this._defending = true;
        this._currentAC = this._baseAC + 2
        this._currentDefenseCharges -= 1;
    }

    /**
     * Initiates an attack against an opponent.
     * Rolls the d20 and calculates the totalAttack delivered using the roll and this monster's attack bonus.
     * 
     * @returns totalAttack: The power of this attack.
     */
    attack() {
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
     * @param {*} totalAttack The power of the incoming attack.
     */
    defend(totalAttack) {
        if (this._defending = true) {

            if (totalAttack >= this._AC) {
                console.log(`${this.type}' defense fails! ${this.type} takes 5 damage.`)
                this._health -= 5
            }
            else {
                console.log(`The attack misses!`);
            }

            this._AC -= 2
            this._defending = false;
            return;
        }
        else {
            if (totalAttack >= this._currentAC) {
                console.log(`${this.type}' takes ${totalAttack} damage!`);
                this._health -= totalAttack;
            }
            else {
                console.log(`${this.type}' the attack misses!`);
            }
        }
    }

    /**
     * Generates the possible actions a monster can take given its status, defense charges and ability charges.
     * 
     * @param {*} opponent The monster which this monster is fighting.
     */
    generateActions(opponent) {
        actions = []
        if (this._stunRemaining == 0) {
            actions.append(new AttackAction(this, opponent));
            if (this._currentDefenseCharges > 0) {
                actions.append(new DefendAction(this));
            }
            if (this._currentAbilityCharges > 0) {
                actions.append(new AbilityAction(this, opponent));
            }
            return actions
        } 
    }

    /**
     * Resets this monster's AC to base.
     * Used to wipe status effects and revert a defense action after each turn in a battle.
     */
    revert() {
        this._currentAC = this._baseAC;
        if(this._stunRemaining > 0) {
            this._stunRemaining -= 1;
        }
    }
    
    /**
     * Resets this monster to its initial state.
     * Used at the end of a battle to ready this monster for the next fight.
     */
    reset() {
        this._currentHealth = this._baseHealth;
        this._currentAC = this._baseAC;
        this._currentDefenseCharges = this._baseDefenseCharges;
        this._stunRemaining = 0;
        this._currentAbilityCharges = this._baseAbilityCharges;
    }

    stun() {
        this._stunRemaining += 2;
    }

    useAbility(defender) { }

    // Getter and Setter for AC
    get AC() {
        return this._AC;
    }

    set AC(value) {
        this._AC = value;
    }
    
    // Getter and Setter for attackBonus
    get attackBonus() {
        return this._attackBonus;
    }

    set attackBonus(value) {
        this._attackBonus = value;
    }

    // Getter and Setter for health
    get health() {
        return this._health;
    }

    set health(value) {
        this._health = value;
    }

    // Getter for type
    get type() {
        return this._type;
    }
}

module.exports = Monsters;