"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents a defend action taken by a monster.
 * When executed, it activates the monster's defense.
 */
var DefendAction = /** @class */ (function () {
    function DefendAction(monster) {
        this.monster = monster;
    }
    DefendAction.prototype.execute = function () {
        this.monster.activateDefense();
    };
    return DefendAction;
}());
exports.default = DefendAction;
