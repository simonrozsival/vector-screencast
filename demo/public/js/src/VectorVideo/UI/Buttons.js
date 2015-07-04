/// <reference path="BasicElements" />
/// <reference path="Color" />
/// <reference path="Brush" />
/// <reference path="../Helpers/HTML" />
/// <reference path="../Helpers/VideoEvents" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var UI;
(function (UI) {
    var VideoEvents = Helpers.VideoEvents;
    var VideoEventType = Helpers.VideoEventType;
    /**
     * Recorder button - change brush color when clicked
     */
    var ChangeColorButton = (function (_super) {
        __extends(ChangeColorButton, _super);
        function ChangeColorButton(color, callback) {
            var _this = this;
            _super.call(this, ""); // empty text			
            this.SetColor(color);
            // announce color change when the button is clicked
            this.GetHTML().onclick = function (e) { return !!callback ? callback() : _this.ChangeColor(e); }; // if there is some expicit callback, then call it
        }
        /**
         * Announce color change
         */
        ChangeColorButton.prototype.ChangeColor = function (e) {
            // mark this button as active and remove the emphasis from the previous one
            if (!!ChangeColorButton.active) {
                ChangeColorButton.active.GetHTML().classList.remove("active");
            }
            this.GetHTML().classList.add("active");
            // announce the change
            ChangeColorButton.active = this;
            VideoEvents.trigger(VideoEventType.ChangeColor, this.color);
        };
        ChangeColorButton.prototype.SetColor = function (color) {
            this.color = color;
            // make the button a color option
            Helpers.HTML.SetAttributes(this.GetHTML(), {
                class: "option",
                "data-color": color.CssValue,
                title: color.Name,
                style: "background-color: " + color.CssValue
            });
        };
        return ChangeColorButton;
    })(UI.Button);
    UI.ChangeColorButton = ChangeColorButton;
    /**
     * Recorder button - change brush color when clicked
     */
    var ChangeBrushSizeButton = (function (_super) {
        __extends(ChangeBrushSizeButton, _super);
        function ChangeBrushSizeButton(size) {
            var _this = this;
            _super.call(this, ""); // empty text			
            this.size = size;
            // there will be a dot corresponding to the brush size
            var dot = Helpers.HTML.CreateElement("span", {
                style: "width: " + size.CssValue + ";\t\n\t\t\t\t\t\theight: " + size.CssValue + ";\n\t\t\t\t\t\tborder-radius: " + size.Size / 2 + size.Unit + "; \n\t\t\t\t\t\tdisplay: inline-block;\n\t\t\t\t\t\tbackground: black;\n\t\t\t\t\t\tmargin-top: " + -size.Size / 2 + size.Unit + ";",
                class: "dot",
                "data-size": size.Size
            });
            //dot.textContent = size.Size.toString();
            this.GetHTML().appendChild(dot);
            // make the button a color option
            Helpers.HTML.SetAttributes(this.GetHTML(), {
                class: "option",
                "data-size": size.Size,
                title: size.Name
            });
            // announce color change when the button is clicked
            this.GetHTML().onclick = function (e) { return _this.ChangeColor(e); };
        }
        /**
         * Announce color change
         */
        ChangeBrushSizeButton.prototype.ChangeColor = function (e) {
            // do not draw a dot behind the bar
            e.preventDefault();
            // mark this button as active and remove the emphasis from the previous one
            if (!!ChangeBrushSizeButton.active) {
                ChangeBrushSizeButton.active.GetHTML().classList.remove("active");
            }
            this.GetHTML().classList.add("active");
            // announce the change
            ChangeBrushSizeButton.active = this;
            VideoEvents.trigger(VideoEventType.ChangeBrushSize, this.size);
        };
        return ChangeBrushSizeButton;
    })(UI.Button);
    UI.ChangeBrushSizeButton = ChangeBrushSizeButton;
})(UI || (UI = {}));
