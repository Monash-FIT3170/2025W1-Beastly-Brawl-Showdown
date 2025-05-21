"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DiceRoller_1 = require("../utils/DiceRoller");
var AttackAction_1 = require("../actions/AttackAction");
var DefendAction_1 = require("../actions/DefendAction");
var AbilityAction_1 = require("../actions/AbilityAction");
/**
 * Base class for the different monsters in the game.
 * Includes all universal attributes with some default values.
 * Includes default methods such as attack and defend for monster subclasses which share functionality.
 */
var Monsters = /** @class */ (function () {
    function Monsters(health, AC, attackBonus, special, type) {
        this.baseHealth = health;
        this.currentHealth = health;
        this.baseAC = AC;
        this.currentAC = AC;
        this.atkBonus = attackBonus;
        this.special = special;
        this.baseAbilityCharges = 1;
        this.currentAbilityCharges = 1;
        this.monsterType = type;
        this.baseDefenseCharges = 3;
        this.currentDefenseCharges = 3;
        this.defending = false;
        this.stunRemaining = 0;
    }
    /**
     * Activates this monster's defense, raising the AC and consuming a defense charge.
     */
    Monsters.prototype.activateDefense = function () {
        this.defending = true;
        this.currentAC = this.baseAC + 2;
        this.currentDefenseCharges -= 1;
    };
    /**
     * Initiates an attack against an opponent.
     * Rolls the d20 and calculates the totalAttack delivered using the roll and this monster's attack bonus.
     *
     * @returns totalAttack: The power of this attack.
     */
    Monsters.prototype.attack = function () {
        var roll = DiceRoller_1.default.d20();
        var totalAttack = roll + this.atkBonus;
        console.log("".concat(this.monsterType, " rolls ").concat(roll, "... Attack = ").concat(totalAttack, "."));
        return totalAttack;
    };
    /**
     * Computes an incoming attack from another monster.
     * Checks whether this monster's defense is activated.
     * Compares totalAttack to AC and decrements this monster's health appropriately.
     *
     * @param totalAttack The power of the incoming attack.
     */
    Monsters.prototype.defend = function (totalAttack) {
        if (this.defending === true) {
            if (totalAttack >= this.currentAC) {
                console.log("".concat(this.monsterType, "'s defense fails! ").concat(this.monsterType, " takes 5 damage."));
                this.currentHealth -= 5;
            }
            else {
                console.log("The attack misses!");
            }
            // Reset AC and defense flag after defense turn ends
            this.currentAC = this.baseAC;
            this.defending = false;
        }
        else {
            if (totalAttack >= this.currentAC) {
                console.log("".concat(this.monsterType, " takes ").concat(totalAttack, " damage!"));
                this.currentHealth -= totalAttack;
            }
            else {
                console.log("".concat(this.monsterType, ": The attack misses!"));
            }
        }
    };
    /**
     * Generates the possible actions a monster can take given its status, defense charges and ability charges.
     *
     * @param opponent The monster which this monster is fighting.
     * @returns An array of possible actions.
     */
    Monsters.prototype.generateActions = function (opponent) {
        var actions = [];
        if (this.stunRemaining === 0) {
            actions.push(new AttackAction_1.default(this, opponent));
            if (this.currentDefenseCharges > 0) {
                actions.push(new DefendAction_1.default(this));
            }
            if (this.currentAbilityCharges > 0) {
                actions.push(new AbilityAction_1.default(this, opponent));
            }
        }
        return actions;
    };
    /**
     * Resets this monster's AC to base.
     * Used to wipe status effects and revert a defense action after each turn in a battle.
     */
    Monsters.prototype.revert = function () {
        this.currentAC = this.baseAC;
        if (this.stunRemaining > 0) {
            this.stunRemaining -= 1;
        }
    };
    /**
     * Resets this monster to its initial state.
     * Used at the end of a battle to ready this monster for the next fight.
     */
    Monsters.prototype.reset = function () {
        this.currentHealth = this.baseHealth;
        this.currentAC = this.baseAC;
        this.currentDefenseCharges = this.baseDefenseCharges;
        this.stunRemaining = 0;
        this.currentAbilityCharges = this.baseAbilityCharges;
    };
    /**
     * Applies a stun effect to the monster, lasting 2 turns.
     */
    Monsters.prototype.stun = function () {
        this.stunRemaining += 2;
    };
    /**
     * Placeholder for a monster's special ability. Should be overridden by subclasses.
     *
     * @param defender The opponent affected by the ability.
     */
    Monsters.prototype.useAbility = function (defender) { };
    Object.defineProperty(Monsters.prototype, "AC", {
        // Getters and setters
        get: function () {
            return this.currentAC;
        },
        set: function (value) {
            this.currentAC = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Monsters.prototype, "attackBonus", {
        get: function () {
            return this.atkBonus;
        },
        set: function (value) {
            this.atkBonus = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Monsters.prototype, "health", {
        get: function () {
            return this.currentHealth;
        },
        set: function (value) {
            this.currentHealth = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Monsters.prototype, "type", {
        get: function () {
            return this.monsterType;
        },
        enumerable: false,
        configurable: true
    });
    return Monsters;
}());
exports.default = Monsters;
