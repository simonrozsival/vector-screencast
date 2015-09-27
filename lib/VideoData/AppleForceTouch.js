var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Touch_1 = require('./Touch');
var AppleForceTouch = (function (_super) {
    __extends(AppleForceTouch, _super);
    function AppleForceTouch(events, board, canvas, timer) {
        var _this = this;
        _super.call(this, events, board, canvas, timer);
        this.board.onmousemove = function (e) { return _this.checkForce(e.webkitForce); };
        this.forceLevel = 0;
    }
    AppleForceTouch.isAvailable = function () {
        return "WEBKIT_FORCE_AT_FORCE_MOUSE_DOWN" in MouseEvent;
    };
    AppleForceTouch.prototype.GetPressure = function () {
        return this.forceLevel;
    };
    AppleForceTouch.prototype.checkForce = function (webkitForce) {
        this.forceLevel = Math.min(1, webkitForce);
    };
    return AppleForceTouch;
})(Touch_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AppleForceTouch;
