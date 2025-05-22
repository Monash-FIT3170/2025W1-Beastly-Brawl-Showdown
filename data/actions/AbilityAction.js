"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents an ability action where a monster uses a special ability against a defender.
 */
var AbilityAction = /** @class */ (function () {
    function AbilityAction(attacker, defender) {
        this.attacker = attacker;
        this.defender = defender;
    }
    /**
     * Static method to perform the ability action outside of instance context.
     * Calls useAbility on the attacker, passing the defender.
     */
    AbilityAction.perform = function (attacker, defender) {
        attacker.useAbility(defender);
    };
    AbilityAction.prototype.execute = function () {
        this.attacker.useAbility(this.defender);
    };
    return AbilityAction;
}());
exports.default = AbilityAction;
