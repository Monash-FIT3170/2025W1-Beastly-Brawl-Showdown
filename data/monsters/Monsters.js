const DiceRoller = require('../utils/DiceRoller');

class Monsters {
    constructor(health, AC, attackBonus, special, type) {
        this._health = health;
        this._baseAC = AC;
        this._currentAC = AC;
        this._attackBonus = attackBonus;
        this._special = special;
        this._type = type;
        this._defenseCharges = 3;
        this._defending = false;
    }

    // Method for Activiting Defending
    activateDefense() {
        this._defending = true;
        this._currentAC = this._baseAC + 2
        this._defenseCharges -= 1;
    }

    revertDefense() {
        if (defending) {
            this._defending = false;
            this._currentAC = this._baseAC;
        }
    }

    // Method for Monster to Attack
    attack(defender) {
        const roll = DiceRoller.d20();
        const totalAttack = roll + this._attackBonus;
        console.log(`${this.type} rolls ${roll}... Attack = ${totalAttack}.`);   
        return totalAttack;
    }

    // Method for Monster to Defend
    defend(totalAttack) {
        if (this._defending = true) {

            if (totalAttack >= this._AC) {
                console.log(`${this.type}' defense fails! ${this.type} takes 5 damage.`)
                this._health -= 5
            }
            else {
                console.log(`${this.type}' the attack misses!`);
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

    ability(attacker, defender) {}

    // Getter and Setter for health
    get health() {
        return this._health;
    }

    set health(value) {
        this._health = value;
    }

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

    // Getter for type
    get type() {
        return this._type;
    }
}

module.exports = Monsters;