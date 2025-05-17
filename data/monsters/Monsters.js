class Monsters {
    constructor(health, AC, attackBonus, special, type) {
        this._health = health; 
        this._AC = AC;
        this._attackBonus = attackBonus;
        this.special = special;
        this._type = type; 
    }

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

    // Method to activate special
    activateSpecial() {

    }

    // Method for abilities
    activateAbility() {

    }
}

module.exports = Monsters;