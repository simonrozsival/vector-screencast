var SVG_1 = require('../Helpers/SVG');
var VideoEvents_1 = require('../Helpers/VideoEvents');
var Vector_1 = require('../Helpers/Vector');
var Path_1 = require('./Path');
var SVGDrawer = (function () {
    function SVGDrawer(curved) {
        if (curved === void 0) { curved = true; }
        this.curved = curved;
    }
    SVGDrawer.prototype.SetEvents = function (events) {
        this.events = events;
    };
    SVGDrawer.prototype.CreateCanvas = function () {
        this.svg = SVG_1.default.CreateElement("svg");
        var backgroundLayer = SVG_1.default.CreateElement("g");
        this.bg = SVG_1.default.CreateElement("rect", {
            id: "background"
        });
        backgroundLayer.appendChild(this.bg);
        this.svg.appendChild(backgroundLayer);
        this.canvas = SVG_1.default.CreateElement("g", {
            id: "canvas"
        });
        this.svg.appendChild(this.canvas);
        return this.svg;
    };
    SVGDrawer.prototype.Stretch = function () {
        var parent = this.svg.parentElement;
        var width = parent.clientWidth;
        var height = parent.clientHeight;
        SVG_1.default.SetAttributes(this.svg, {
            width: width,
            height: height
        });
        SVG_1.default.SetAttributes(this.bg, {
            width: width,
            height: height
        });
        this.events.trigger(VideoEvents_1.VideoEventType.CanvasSize, width, height);
    };
    SVGDrawer.prototype.ClearCanvas = function (color) {
        while (!!this.canvas.firstChild) {
            this.canvas.removeChild(this.canvas.firstChild);
        }
        SVG_1.default.SetAttributes(this.bg, { fill: color.CssValue });
    };
    SVGDrawer.prototype.SetCurrentColor = function (color) {
        this.currentColor = color;
    };
    SVGDrawer.prototype.CreatePath = function (events) {
        return new Path_1.SvgPath(events, this.curved, this.currentColor.CssValue, this.canvas);
    };
    SVGDrawer.prototype.SetupOutputCorrection = function (sourceWidth, sourceHeight) {
        var wr = this.svg.clientWidth / sourceWidth;
        var hr = this.svg.clientHeight / sourceHeight;
        var min = Math.min(wr, hr);
        SVG_1.default.SetAttributes(this.svg, {
            "viewBox": "0 0 " + sourceWidth + " " + sourceHeight
        });
        if (min === wr) {
            this.events.trigger(VideoEvents_1.VideoEventType.CursorOffset, new Vector_1.default(0, (this.svg.clientHeight - sourceHeight * min) / 2));
        }
        else {
            this.events.trigger(VideoEvents_1.VideoEventType.CursorOffset, new Vector_1.default((this.svg.clientWidth - sourceWidth * min) / 2, 0));
        }
        return min;
    };
    return SVGDrawer;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SVGDrawer;
