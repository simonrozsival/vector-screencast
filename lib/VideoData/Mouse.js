var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PointingDevice_1 = require('./PointingDevice');
var Mouse = (function (_super) {
    __extends(Mouse, _super);
    function Mouse(events, board, timer) {
        var _this = this;
        _super.call(this, events, board, timer);
        this.board.onmousemove = function (e) { return _this.onMouseMove(e); };
        this.board.onmousedown = function (e) { return _this.onMouseDown(e); };
        this.board.onmouseup = function (e) { return _this.onMouseUp(e); };
        this.board.onmouseleave = function (e) { return _this.onMouseLeave(e); };
        this.board.onmouseenter = function (e) { return _this.onMouseEnter(e); };
        this.board.onmouseover = function (e) { return _this.onMouseOver(e); };
    }
    Mouse.prototype.InitControlsAvoiding = function () {
        var _this = this;
        var controls = document.getElementsByClassName("ui-control");
        for (var i = 0; i < controls.length; i++) {
            var element = controls[i];
            element.onmouseover = function (e) { return _this.isHoveringOverUIControl = true; };
            element.onmouseout = function (e) { return _this.isHoveringOverUIControl = false; };
        }
    };
    Mouse.prototype.onMouseMove = function (e) {
        this.onMove(e);
    };
    Mouse.prototype.onMouseDown = function (e) {
        this.onDown(e);
    };
    Mouse.prototype.onMouseUp = function (e) {
        this.onUp(e);
    };
    Mouse.prototype.onMouseLeave = function (e) {
        this.onLeave(e);
    };
    Mouse.prototype.onMouseEnter = function (e) {
        if (e.buttons === 0) {
            this.isDown = false;
        }
    };
    Mouse.prototype.onMouseOver = function (e) {
        this.isInside = true;
    };
    return Mouse;
})(PointingDevice_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Mouse;
