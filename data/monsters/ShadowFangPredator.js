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
var ShadowFangPredator = /** @class */ (function (_super) {
    __extends(ShadowFangPredator, _super);
    function ShadowFangPredator() {
        var _this = _super.call(this, 20, 12, 4, "Critical hit on natural 18-20", "Attacker") || this;
        _this.critRoll = 18;
        _this.isInvulnerable = false;
        return _this;
    }
    /**
     * Attacks a defender. Rolls d20, ALLOWS CRITS
     * @param defender The monster being attacked.
     * @returns totalAttack The total attack value.
     * defender: Monsters
     * TODO:FIX IF NEEDED
     */
    ShadowFangPredator.prototype.attack = function () {
        var roll = DiceRoller_1.default.d20();
        var totalAttack = 0;
        if (roll >= this.critRoll) {
            totalAttack = 2 * roll + this.attackBonus;
            console.log("".concat(this.type, " rolls ").concat(roll, "... Critical hit! Attack = ").concat(totalAttack, "."));
        }
        else {
            totalAttack = roll + this.attackBonus;
            console.log("".concat(this.type, " rolls ").concat(roll, "... Attack = ").concat(totalAttack, "."));
        }
        return totalAttack;
    };
    ShadowFangPredator.prototype.defend = function (totalAttack) {
        if (this.isInvulnerable) {
            console.log("".concat(this.type, " evades the attack!"));
            return;
        }
        else {
            _super.prototype.defend.call(this, totalAttack);
        }
    };
    ShadowFangPredator.prototype.revert = function () {
        this.defending = false;
        this.currentAC = this.baseAC;
        this.isInvulnerable = false;
    };
    ShadowFangPredator.prototype.useAbility = function () {
        this.currentAbilityCharges -= 1;
        this.isInvulnerable = true;
    };
    return ShadowFangPredator;
}(Monsters_1.default));
exports.default = ShadowFangPredator;
