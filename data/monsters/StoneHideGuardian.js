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
var StoneHideGuardian = /** @class */ (function (_super) {
    __extends(StoneHideGuardian, _super);
    function StoneHideGuardian() {
        var _this = _super.call(this, 30, 16, 1, "4 defense actions per battle", "Defender") || this;
        _this.defenseCharges = 4;
        return _this;
    }
    StoneHideGuardian.prototype.useAbility = function (defender) {
        this.currentAbilityCharges -= 1;
        defender.stun();
    };
    return StoneHideGuardian;
}(Monsters_1.default));
exports.default = StoneHideGuardian;
