var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Mouse_1 = require('./Mouse');
var TouchEventsAPI = (function (_super) {
    __extends(TouchEventsAPI, _super);
    function TouchEventsAPI(events, container, canvas, timer) {
        var _this = this;
        _super.call(this, events, container, timer);
        this.canvas = canvas;
        canvas.addEventListener("touchstart", function (ev) { return _this.TouchStart(ev); });
        canvas.addEventListener("touchend", function (ev) { return _this.TouchEnd(ev); });
        canvas.addEventListener("touchcancel", function (ev) { return _this.TouchEnd(ev); });
        canvas.addEventListener("touchleave", function (ev) { return _this.TouchLeave(ev); });
        canvas.addEventListener("touchmove", function (ev) { return _this.TouchMove(ev); });
    }
    TouchEventsAPI.prototype.TouchStart = function (event) {
        event.preventDefault();
        var touches = event.changedTouches;
        var touch = touches[0];
        this.currentTouch = touch.identifier;
        this.isInside = true;
        this.isHoveringOverUIControl = false;
        this.onMouseDown(touch);
    };
    TouchEventsAPI.prototype.TouchLeave = function (event) {
        event.preventDefault();
        var touch = this.filterTouch(event.changedTouches);
        if (touch === null) {
            return;
        }
        this.onMouseLeave(touch);
    };
    TouchEventsAPI.prototype.TouchEnd = function (event) {
        var touch = this.filterTouch(event.changedTouches);
        if (touch === null) {
            return;
        }
        this.onMouseUp(touch);
        this.currentTouch = null;
    };
    TouchEventsAPI.prototype.TouchMove = function (event) {
        event.preventDefault();
        var touch = this.filterTouch(event.changedTouches);
        if (touch === null) {
            return;
        }
        this.onMouseMove(touch);
    };
    TouchEventsAPI.prototype.filterTouch = function (touchList) {
        for (var i = 0; i < touchList.length; i++) {
            var element = touchList[i];
            if (element.identifier === this.currentTouch) {
                return element;
            }
        }
        return null;
    };
    return TouchEventsAPI;
})(Mouse_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TouchEventsAPI;
