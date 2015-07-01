/// <reference path="./DrawingStrategy.ts" />
/// <reference path="../helpers/Vector.ts" />
/// <reference path="../helpers/State.ts" />
/// <reference path="../helpers/HTML.ts" />
/// <reference path="../helpers/SVG.ts" />
/// <reference path="../helpers/Spline.ts" />
/// <reference path="../helpers/VideoEvents.ts" />
/// <reference path="../settings/BrushSettings.ts" />
/// <reference path="../UI/BasicElements" />
/// <reference path="Path" />
var Drawing;
(function (Drawing) {
    var SVG = Helpers.SVG;
    /**
     * This is the main drawing class - processes cursor states
     * and renders the lines on the blackboard.
     * This class uses SVG (http://www.w3.org/TR/SVG) for visualising the lines.
     */
    var SVGDrawer = (function () {
        /**
         * Init a new drawer.
         * @param   {boolean}   curved  Should the lines be curved, or simple quadrilateral?
         */
        function SVGDrawer(curved) {
            this.curved = curved;
        }
        SVGDrawer.prototype.CreateCanvas = function () {
            // create the SVG canvas that will be drawn onto
            this.svg = SVG.CreateElement("svg");
            // background:
            var backgroundLayer = SVG.CreateElement("g");
            this.bg = SVG.CreateElement("rect", {
                id: "background"
            });
            backgroundLayer.appendChild(this.bg);
            this.svg.appendChild(backgroundLayer);
            // canvas             
            this.canvas = SVG.CreateElement("g", {
                id: "canvas"
            });
            this.svg.appendChild(this.canvas);
            return this.svg;
        };
        /**
         * Make ths canvas as large as possible (fill the parent element)
         */
        SVGDrawer.prototype.Stretch = function () {
            var parent = this.svg.parentElement;
            var width = parent.clientWidth;
            var height = parent.clientHeight;
            Helpers.SVG.SetAttributes(this.svg, {
                width: width,
                height: height
            });
            this.svg = null; // remove reference
            Helpers.SVG.SetAttributes(this.bg, {
                width: width,
                height: height
            });
            Helpers.VideoEvents.trigger(Helpers.VideoEventType.CanvasSize, width, height);
        };
        /**
         * Make the canvas blank.
         */
        SVGDrawer.prototype.ClearCanvas = function (color) {
            // remove all drawn parts
            while (!!this.canvas.firstChild) {
                this.canvas.removeChild(this.canvas.firstChild);
            }
            // change the bg color
            SVG.SetAttributes(this.bg, { fill: color.CssValue });
        };
        /**
         * Set color of a path, that will be drawn in the future.
         * @param   {string} color       Color of the new path.
         */
        SVGDrawer.prototype.SetCurrentColor = function (color) {
            this.currentColor = color;
        };
        /**
         * Start drawing a line.
         */
        SVGDrawer.prototype.CreatePath = function () {
            return new Drawing.SvgPath(this.curved, this.currentColor.CssValue, this.canvas);
        };
        SVGDrawer.prototype.SetupOutputCorrection = function (sourceWidth, sourceHeight) {
            var wr = sourceWidth / this.svg.clientWidth;
            var hr = sourceHeight / this.svg.clientHeight;
            var min = Math.min(wr, hr);
            // prepare scaling and translating
            SVG.SetAttributes(this.svg, {
                "viewBox": (this.svg.clientWidth - (min * sourceWidth / 2)) + " " + (this.svg.clientHeight - (min * sourceHeight / 2)) + "  " + this.svg.clientWidth * min + " " + this.svg.clientHeight * min
            });
            return min;
        };
        return SVGDrawer;
    })();
    Drawing.SVGDrawer = SVGDrawer;
})(Drawing || (Drawing = {}));
