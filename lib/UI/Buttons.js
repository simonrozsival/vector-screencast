var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BasicElements_1 = require('./BasicElements');
var VideoEvents_1 = require('../Helpers/VideoEvents');
var HTML_1 = require('../Helpers/HTML');
var ChangeColorButton = (function (_super) {
    __extends(ChangeColorButton, _super);
    function ChangeColorButton(events, color, callback) {
        var _this = this;
        _super.call(this, "");
        this.events = events;
        this.SetColor(color);
        this.GetHTML().onclick = function (e) { return !!callback ? callback() : _this.ChangeColor(e); };
    }
    ChangeColorButton.prototype.ChangeColor = function (e) {
        if (!!ChangeColorButton.active) {
            ChangeColorButton.active.GetHTML().classList.remove("active");
        }
        this.GetHTML().classList.add("active");
        ChangeColorButton.active = this;
        this.events.trigger(VideoEvents_1.VideoEventType.ChangeColor, this.color);
    };
    ChangeColorButton.prototype.SetColor = function (color) {
        this.color = color;
        HTML_1.default.SetAttributes(this.GetHTML(), {
            class: "option",
            "data-color": color.CssValue,
            style: "background-color: " + color.CssValue
        });
    };
    return ChangeColorButton;
})(BasicElements_1.Button);
exports.ChangeColorButton = ChangeColorButton;
var ChangeBrushSizeButton = (function (_super) {
    __extends(ChangeBrushSizeButton, _super);
    function ChangeBrushSizeButton(events, size) {
        var _this = this;
        _super.call(this, "");
        this.events = events;
        this.size = size;
        var dot = HTML_1.default.CreateElement("span", {
            style: "width: " + size.CssValue + ";\t\n\t\t\t\t\t\theight: " + size.CssValue + ";\n\t\t\t\t\t\tborder-radius: " + size.Size / 2 + size.Unit + "; \n\t\t\t\t\t\tdisplay: inline-block;\n\t\t\t\t\t\tbackground: black;\n\t\t\t\t\t\tmargin-top: " + -size.Size / 2 + size.Unit + ";",
            class: "dot",
            "data-size": size.Size
        });
        this.GetHTML().appendChild(dot);
        HTML_1.default.SetAttributes(this.GetHTML(), {
            class: "option",
            "data-size": size.Size
        });
        this.GetHTML().onclick = function (e) { return _this.ChangeSize(e); };
    }
    ChangeBrushSizeButton.prototype.ChangeSize = function (e) {
        e.preventDefault();
        if (!!ChangeBrushSizeButton.active) {
            ChangeBrushSizeButton.active.GetHTML().classList.remove("active");
        }
        this.GetHTML().classList.add("active");
        ChangeBrushSizeButton.active = this;
        this.events.trigger(VideoEvents_1.VideoEventType.ChangeBrushSize, this.size);
    };
    return ChangeBrushSizeButton;
})(BasicElements_1.Button);
exports.ChangeBrushSizeButton = ChangeBrushSizeButton;
