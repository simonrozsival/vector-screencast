var VideoEvents_1 = require('../Helpers/VideoEvents');
var HTML_1 = require('../Helpers/HTML');
var Path_1 = require('./Path');
var CanvasDrawer = (function () {
    function CanvasDrawer(curved) {
        if (curved === void 0) { curved = true; }
        this.curved = curved;
    }
    CanvasDrawer.prototype.SetEvents = function (events) {
        this.events = events;
    };
    CanvasDrawer.prototype.CreateCanvas = function () {
        this.canvas = HTML_1.default.CreateElement("canvas");
        this.context = this.canvas.getContext("2d");
        return this.canvas;
    };
    CanvasDrawer.prototype.Stretch = function () {
        var parent = this.canvas.parentElement;
        var width = parent.clientWidth;
        var height = parent.clientHeight;
        this.originalHeight = height;
        this.originalWidth = width;
        HTML_1.default.SetAttributes(this.canvas, {
            width: width,
            height: height
        });
        this.events.trigger(VideoEvents_1.VideoEventType.CanvasSize, width, height);
    };
    CanvasDrawer.prototype.SetupOutputCorrection = function (sourceWidth, sourceHeight) {
        var wr = this.canvas.width / sourceWidth;
        var hr = this.canvas.height / sourceHeight;
        var min = Math.min(wr, hr);
        this.context.scale(min, min);
        return min;
    };
    CanvasDrawer.prototype.ClearCanvas = function (color) {
        this.context.fillStyle = color.CssValue;
        this.context.fillRect(0, 0, this.originalWidth, this.originalHeight);
    };
    CanvasDrawer.prototype.SetCurrentColor = function (color) {
        this.currentColor = color;
    };
    CanvasDrawer.prototype.CreatePath = function (events) {
        return new Path_1.CanvasPath(events, this.curved, this.currentColor.CssValue, this.context);
    };
    return CanvasDrawer;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CanvasDrawer;
