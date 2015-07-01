/// <reference path="BasicElements.ts" />
/// <reference path="Color.ts" />
/// <reference path="../Helpers/HTML.ts" />
/// <reference path="../Helpers/SVG.ts" />
var UI;
(function (UI) {
    var Vector2 = Helpers.Vector2;
    /**
     * Cursor implementation.
     */
    var Cursor = (function () {
        /**
         * Initialise a cursor. It's size and color must be explicitely changed before using it though!
         */
        function Cursor() {
            this.radius = 20;
            this.stroke = 3;
            this.position = new Vector2(0, 0);
            this.CreateHTML();
            this.scalingFactor = 1;
            this.size = null;
        }
        /**
         * Prepares the cursor shape - a dot, but with zero size and no specific color (default white)
         */
        Cursor.prototype.CreateHTML = function () {
            this.element = Helpers.HTML.CreateElement("div", { class: "ui-cursor" });
            this.svg = Helpers.SVG.CreateElement("svg", {
                width: 2 * this.radius,
                height: 2 * this.radius
            });
            this.element.appendChild(this.svg);
            // draw the dot at the center of the SVG element
            this.dot = Helpers.SVG.CreateDot(new Helpers.Vector2(this.radius, this.radius), this.radius - this.stroke, UI.Color.BackgroundColor.CssValue);
            Helpers.SVG.SetAttributes(this.dot, {
                "stroke": "white",
                "stroke-width": this.stroke
            });
            this.svg.appendChild(this.dot);
            // I want to move the cursor to any point and the stuff behind the cursor must be visible
            this.element.style.position = "absolute";
            this.element.style.background = "transparent";
            this.element.style.lineHeight = "0";
        };
        Cursor.prototype.GetHTML = function () {
            return this.element;
        };
        /**
         * Move the cursor to a specified position.
         * @param	x	X coordinate of cursor center
         * @param	y	Y coordinate of cursor center
         */
        Cursor.prototype.MoveTo = function (x, y) {
            this.element.style.left = (x - this.radius - this.stroke) + "px";
            this.element.style.top = (y - this.radius - this.stroke) + "px";
            this.position = new Helpers.Vector2(x, y);
        };
        /**
         * Change the color of brush outline according to current settings.
         */
        Cursor.prototype.ChangeColor = function (color) {
            if (color.CssValue === UI.Color.BackgroundColor.CssValue) {
                color = UI.Color.ForegroundColor; // make it inverse
            }
            Helpers.SVG.SetAttributes(this.dot, {
                stroke: color.CssValue
            });
        };
        /**
         * Resize the brush according to current settings.
         */
        Cursor.prototype.ChangeSize = function (size) {
            this.size = size; // update the last size scaled to
            var originalRadius = this.radius;
            this.radius = (size.Size * this.scalingFactor) / 2 - 2; // make the cursor a bit smaller than the path it will draw
            // resize the whole SVG element
            var calculatedSize = 2 * (this.radius + this.stroke);
            Helpers.SVG.SetAttributes(this.svg, {
                width: calculatedSize,
                height: calculatedSize
            });
            // also correct the element's position, so the center of the dot stays where it was
            var shift = originalRadius - this.radius; // (when shrinking - positive, when expanding - negative)
            this.MoveTo(this.position.X + shift, this.position.Y + shift);
            // scale the dot
            Helpers.SVG.SetAttributes(this.dot, {
                cx: calculatedSize / 2,
                cy: calculatedSize / 2,
                r: Math.max(1, this.radius - this.stroke) // do not allow zero or even negative radius
            });
        };
        /**
         * Set new cursor scaling factor to match the dimensions of the canvas and resize the cursor immediately.
         */
        Cursor.prototype.SetScalingFactor = function (sf) {
            this.scalingFactor = sf;
            if (!!this.size) {
                this.ChangeSize(this.size);
            }
        };
        return Cursor;
    })();
    UI.Cursor = Cursor;
})(UI || (UI = {}));
