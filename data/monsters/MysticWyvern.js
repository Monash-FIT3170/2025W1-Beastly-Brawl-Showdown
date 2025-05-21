"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Monsters_1 = require("./Monsters");
var DiceRoller_1 = require("../utils/DiceRoller");
/**
 * MysticWyvern monster subclass.
 * Has the ability to reroll an attack once per battle.
 * Uses elemental breath as special ability.
 */
var MysticWyvern = /** @class */ (function (_super) {
    __extends(MysticWyvern, _super);
    function MysticWyvern() {
        var _this = _super.call(this, 25, 14, 2, "Reroll once per battle", "Balanced") || this;
        _this.rerollCharge = true;
        return _this;
    }
    /**
     * Attacks a defender. Rolls d20, optionally allows reroll once per battle.
     * @param defender The monster being attacked.
     * @returns totalAttack The total attack value.
     * defender: Monsters
     * TODO:FIX IF NEEDED
     */
    MysticWyvern.prototype.attack = function () {
        var roll = DiceRoller_1.default.d20();
        console.log("".concat(this.type, " rolls ").concat(roll, "."));
        // Ask the user if they want to reroll, only if reroll charge is available
        if (this.rerollCharge) {
            // Note: In Node.js or non-browser environments, confirm won't work.
            // You may want to replace with a different prompt method or remove this in non-browser context.
            var reroll = confirm("Do you want to reroll the d20?");
            if (reroll) {
                this.rerollCharge = false;
                roll = DiceRoller_1.default.d20();
                console.log("".concat(this.type, " rerolls and gets ").concat(roll, "."));
            }
        }
        var totalAttack = roll + this.attackBonus;
        console.log("".concat(this.type, " rolls ").concat(roll, "... Attack = ").concat(totalAttack, "."));
        return totalAttack;
    };
    /**
     * Uses elemental breath ability against the defender.
     * Deals 15 + d10 damage.
     * @param defender The monster being attacked.
     */
    MysticWyvern.prototype.useAbility = function (defender) {
        console.log("".concat(this.type, " uses elemental breath..."));
        var roll = DiceRoller_1.default.d10();
        var totalAttack = 15 + roll;
        console.log("".concat(this.type, " rolls ").concat(roll, "... Attack = ").concat(totalAttack, "."));
        defender.defend(totalAttack);
    };
    return MysticWyvern;
}(Monsters_1.default));
exports.default = MysticWyvern;
