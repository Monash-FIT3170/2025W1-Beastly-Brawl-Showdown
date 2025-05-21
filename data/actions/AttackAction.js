"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents an attack action between two monsters.
 * The attacker attempts to strike the defender with a total attack value.
 */
var AttackAction = /** @class */ (function () {
    function AttackAction(attacker, defender) {
        this.attacker = attacker;
        this.defender = defender;
    }
    AttackAction.prototype.execute = function () {
        var totalAttack = this.attacker.attack();
        this.defender.defend(totalAttack);
    };
    return AttackAction;
}());
exports.default = AttackAction;
