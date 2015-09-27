var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PointingDevice_1 = require('./PointingDevice');
var PointerEventsAPI = (function (_super) {
    __extends(PointerEventsAPI, _super);
    function PointerEventsAPI(events, board, timer) {
        var _this = this;
        _super.call(this, events, board, timer);
        this.board.addEventListener("pointermove", function (e) { return _this.onPointerMove(e); });
        this.board.addEventListener("pointerdown", function (e) { return _this.onPointerDown(e); });
        this.board.addEventListener("pointerup", function (e) { return _this.onPointerUp(e); });
        this.board.addEventListener("pointerleave", function (e) { return _this.onPointerLeave(e); });
        this.board.addEventListener("pointerenter", function (e) { return _this.onPointerLeave(e); });
        this.board.addEventListener("pointerover", function (e) { return _this.onPointerOver(e); });
        this.currentEvent = null;
        this.isDown = false;
    }
    PointerEventsAPI.prototype.GetPressure = function () {
        if (this.isDown === false || this.currentEvent === null) {
            return 0;
        }
        if (this.currentEvent.pointerType === "pen") {
            return this.currentEvent.pressure;
        }
        return 1;
    };
    PointerEventsAPI.prototype.InitControlsAvoiding = function () {
        var _this = this;
        var controls = document.getElementsByClassName("ui-control");
        for (var i = 0; i < controls.length; i++) {
            var element = controls[i];
            element.onpointerover = function (e) { return _this.isHoveringOverUIControl = true; };
            element.onpointerout = function (e) { return _this.isHoveringOverUIControl = false; };
        }
    };
    PointerEventsAPI.prototype.onPointerMove = function (e) {
        this.onMove(e);
        this.currentEvent = e;
    };
    PointerEventsAPI.prototype.onPointerDown = function (e) {
        this.onDown(e);
        this.currentEvent = e;
    };
    PointerEventsAPI.prototype.onPointerUp = function (e) {
        this.onUp(e);
        this.currentEvent = e;
    };
    PointerEventsAPI.prototype.onPointerLeave = function (e) {
        this.onLeave(e);
        this.currentEvent = e;
    };
    PointerEventsAPI.prototype.onPointerEnter = function (e) {
        if (e.buttons === 0) {
            this.isDown = false;
        }
        this.currentEvent = e;
    };
    PointerEventsAPI.prototype.onPointerOver = function (e) {
        this.isInside = true;
        this.currentEvent = e;
    };
    return PointerEventsAPI;
})(PointingDevice_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PointerEventsAPI;
