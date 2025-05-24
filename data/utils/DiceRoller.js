"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DiceRoller = /** @class */ (function () {
    function DiceRoller() {
    }
    DiceRoller.roll = function (sides) {
        return Math.floor(Math.random() * sides) + 1;
    };
    DiceRoller.d20 = function () {
        return DiceRoller.roll(20);
    };
    DiceRoller.d12 = function () {
        return DiceRoller.roll(12);
    };
    DiceRoller.d10 = function () {
        return DiceRoller.roll(10);
    };
    DiceRoller.d8 = function () {
        return DiceRoller.roll(8);
    };
    DiceRoller.d6 = function () {
        return DiceRoller.roll(6);
    };
    DiceRoller.d4 = function () {
        return DiceRoller.roll(4);
    };
    return DiceRoller;
}());
exports.default = DiceRoller;
