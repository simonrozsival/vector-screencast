var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Vector_1 = require('../Helpers/Vector');
var BasicElements_1 = require('./BasicElements');
var VideoEvents_1 = require('../Helpers/VideoEvents');
var SVG_1 = require('../Helpers/SVG');
var Color_1 = require('./Color');
var Cursor = (function (_super) {
    __extends(Cursor, _super);
    function Cursor(events) {
        _super.call(this, "div");
        this.events = events;
        this.radius = 20;
        this.stroke = 3;
        this.position = new Vector_1.default(0, 0);
        this.offset = new Vector_1.default(0, 0);
        this.CreateHTML();
        this.scalingFactor = 1;
        this.size = null;
    }
    Object.defineProperty(Cursor.prototype, "Offset", {
        set: function (val) {
            this.offset = val;
        },
        enumerable: true,
        configurable: true
    });
    Cursor.prototype.CreateHTML = function () {
        var _this = this;
        this.svg = SVG_1.default.CreateElement("svg", {
            width: 2 * this.radius,
            height: 2 * this.radius
        });
        this.GetHTML().appendChild(this.svg);
        this.bgColor = Color_1.default.BackgroundColor;
        this.color = Color_1.default.ForegroundColor;
        this.dot = SVG_1.default.CreateDot(new Vector_1.default(this.radius, this.radius), this.radius - this.stroke, this.bgColor.CssValue);
        SVG_1.default.SetAttributes(this.dot, {
            "stroke": this.color.CssValue,
            "stroke-width": this.stroke
        });
        this.svg.appendChild(this.dot);
        this.GetHTML().style.position = "absolute";
        this.GetHTML().style.background = "transparent";
        this.GetHTML().style.lineHeight = "0";
        this.events.on(VideoEvents_1.VideoEventType.ClearCanvas, function (color) {
            _this.bgColor = color;
            SVG_1.default.SetAttributes(_this.dot, { fill: _this.bgColor.CssValue });
            _this.ChangeColor(_this.color);
        });
    };
    Cursor.prototype.MoveTo = function (x, y) {
        this.GetHTML().style.left = (x * this.scalingFactor - this.radius - this.stroke + this.offset.X) + "px";
        this.GetHTML().style.top = (y * this.scalingFactor - this.radius - this.stroke + this.offset.Y) + "px";
        this.position = new Vector_1.default(x, y);
    };
    Cursor.prototype.ChangeColor = function (color) {
        if (color.CssValue === this.bgColor.CssValue) {
            color = color.CssValue === Color_1.default.ForegroundColor.CssValue ? Color_1.default.BackgroundColor : Color_1.default.ForegroundColor;
        }
        SVG_1.default.SetAttributes(this.dot, {
            stroke: color.CssValue
        });
        this.color = color;
    };
    Cursor.prototype.ChangeSize = function (size) {
        this.size = size;
        var originalRadius = this.radius;
        this.radius = (size.Size * this.scalingFactor) / 2 - 2;
        var calculatedSize = 2 * (this.radius + this.stroke);
        SVG_1.default.SetAttributes(this.svg, {
            width: calculatedSize,
            height: calculatedSize
        });
        var shift = originalRadius - this.radius;
        this.MoveTo(this.position.X + shift, this.position.Y + shift);
        SVG_1.default.SetAttributes(this.dot, {
            cx: calculatedSize / 2,
            cy: calculatedSize / 2,
            r: Math.max(1, this.radius - this.stroke)
        });
    };
    Cursor.prototype.SetScalingFactor = function (sf) {
        this.scalingFactor = sf;
        if (!!this.size) {
            this.ChangeSize(this.size);
        }
    };
    return Cursor;
})(BasicElements_1.SimpleElement);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Cursor;
