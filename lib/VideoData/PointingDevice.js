var VideoEvents_1 = require('../Helpers/VideoEvents');
var State_1 = require('../Helpers/State');
var WacomTablet_1 = require('./WacomTablet');
var Pointer_1 = require('./Pointer');
var AppleForceTouch_1 = require('./AppleForceTouch');
var Touch_1 = require('./Touch');
var PointingDevice = (function () {
    function PointingDevice(events, board, timer) {
        this.events = events;
        this.board = board;
        this.timer = timer;
        this.isHoveringOverUIControl = false;
    }
    PointingDevice.SelectBestMethod = function (events, board, canvas, timer) {
        var device;
        var wacomApi = WacomTablet_1.default.IsAvailable();
        if (wacomApi !== null) {
            device = new WacomTablet_1.default(events, board, timer, wacomApi);
            console.log("Wacom WebPAPI is used");
        }
        else if (window.hasOwnProperty("PointerEvent")) {
            device = new Pointer_1.default(events, board, timer);
            console.log("Pointer Events API is used");
        }
        else if (AppleForceTouch_1.default.isAvailable()) {
            device = new AppleForceTouch_1.default(events, board, canvas, timer);
            console.log("Apple Force Touch Events over Touch Events API is used");
        }
        else {
            device = new Touch_1.default(events, board, canvas, timer);
            console.log("Touch Events API are used.");
        }
        device.InitControlsAvoiding();
        return device;
    };
    PointingDevice.prototype.getCursor = function () { return this.cursor; };
    PointingDevice.prototype.InitControlsAvoiding = function () {
        var _this = this;
        var controls = document.getElementsByClassName("ui-control-panel");
        for (var i = 0; i < controls.length; i++) {
            var element = controls[i];
            element.onmouseover = function (e) { return _this.isHoveringOverUIControl = true; };
            element.onmouseout = function (e) { return _this.isHoveringOverUIControl = false; };
        }
    };
    PointingDevice.prototype.GetPressure = function () {
        return (this.isDown === true && this.isInside === true) ? 1 : 0;
    };
    PointingDevice.prototype.onMove = function (e) {
        this.cursor = this.getCursorPosition(e);
        this.ReportAction();
    };
    PointingDevice.prototype.onDown = function (e) {
        if (this.isHoveringOverUIControl === false) {
            this.isDown = true;
            this.cursor = this.getCursorPosition(e);
            this.ReportAction();
        }
    };
    PointingDevice.prototype.onUp = function (e) {
        this.isDown = false;
        this.cursor = this.getCursorPosition(e);
        this.ReportAction();
    };
    PointingDevice.prototype.onLeave = function (e) {
        if (this.GetPressure() > 0) {
            this.onMove(e);
            this.isDown = false;
            this.onMove(e);
            this.isDown = true;
        }
        this.isInside = false;
    };
    PointingDevice.prototype.onOver = function (e) {
        this.isInside = true;
    };
    PointingDevice.prototype.onLooseFocus = function (e) {
        this.isInside = false;
        this.isDown = false;
    };
    PointingDevice.prototype.getCursorPosition = function (e) {
        if (e.clientX == undefined || e.clientY == undefined) {
            console.log("Wrong 'getCursorPosition' parameter. Event data required.");
        }
        return {
            x: e.clientX,
            y: e.clientY
        };
    };
    PointingDevice.prototype.ReportAction = function () {
        var state = new State_1.CursorState(this.timer.CurrentTime(), this.cursor.x, this.cursor.y, this.GetPressure());
        this.events.trigger(VideoEvents_1.VideoEventType.CursorState, state);
    };
    return PointingDevice;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PointingDevice;
