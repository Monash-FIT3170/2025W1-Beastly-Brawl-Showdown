const DiceRoller = require('../utils/DiceRoller');

class Monsters {
    constructor(health, AC, attackBonus, special, type) {
        this._baseHealth = health; 
        this._currentHealth = health;
        this._baseAC = AC;
        this._currentAC = AC;
        this._attackBonus = attackBonus;
        this.special = special;
        this._type = type; 
        this._defenseCharges = 3;
        this._defending = false;
    }

    ability(name, defender) {}

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

    attack() {
        const roll = DiceRoller.d20();
        const totalAttack = roll + this._attackBonus;
        console.log(`${this.type} rolls ${roll}... Attack = ${totalAttack}.`);   
        return totalAttack;
    }

    defend(totalAttack) {
        if (this._defending = true) {         
            if (totalAttack >= this._currentAC) {
                console.log(`${this.type}' defense fails! ${this.type} takes 5 damage.`);
                this._currentHealth -= 5;
            }
            else {
                console.log(`${this.type}' the attack misses!`);
            }
            return;
        }
        else {
            if (totalAttack >= this._currentAC) {
                console.log(`${this.type}' takes ${totalAttack} damage!`);
                this._currentHealth -= totalAttack;
            }
            else {
                console.log(`${this.type}' the attack misses!`);
            }
        }
    }
}