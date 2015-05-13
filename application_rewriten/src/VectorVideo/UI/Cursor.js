/// <reference path="BasicElements.ts" />
/// <reference path="Color.ts" />
/// <reference path="../Helpers/HTML.ts" />
/// <reference path="../Helpers/SVG.ts" />
var UI;
(function (UI) {
    /**
     * Cursor implementation.
     */
    var Cursor = (function () {
        function Cursor(size, color) {
            this.size = size;
            this.color = color;
            this.offset = size / 2;
            this.CreateHTML();
        }
        /**
         * Prepares the cursor crosshair
         *
         * 		   |
         * 		---|---
         * 		   |
         */
        Cursor.prototype.CreateHTML = function () {
            this.element = Helpers.HTML.CreateElement("svg", {
                width: this.size,
                height: this.size
            });
            // draw the "+"
            var path = Helpers.SVG.CreateElement("path", {
                fill: "transparent",
                stroke: this.color,
                "stroke-width": this.size * 0.1,
                d: "M " + this.offset + ",0 L " + this.offset + "," + this.size + " M 0," + this.offset + " L " + this.size + "," + this.size + " Z"
            });
            this.element.appendChild(path);
            // I want to move the cursor to any point and the stuff behind the cursor must be visible
            this.element.style.position = "absolute";
            this.element.style.background = "transparent";
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
            this.element.style.left = (x - this.offset) + "px";
            this.element.style.top = (y - this.offset) + "px";
        };
        return Cursor;
    })();
    UI.Cursor = Cursor;
})(UI || (UI = {}));
//# sourceMappingURL=Cursor.js.map