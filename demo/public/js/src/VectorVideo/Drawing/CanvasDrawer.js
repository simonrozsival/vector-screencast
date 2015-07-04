/// <reference path="./DrawingStrategy.ts" />
/// <reference path="../Helpers/Vector.ts" />
/// <reference path="../Helpers/State.ts" />
/// <reference path="../Helpers/HTML.ts" />
/// <reference path="../Helpers/SVG.ts" />
/// <reference path="../Helpers/Spline.ts" />
/// <reference path="../Helpers/VideoEvents.ts" />
/// <reference path="../settings/BrushSettings.ts" />
/// <reference path="../UI/BasicElements" />
/// <reference path="Path" />
var Drawing;
(function (Drawing) {
    var HTML = Helpers.HTML;
    /**
     * This is the main drawing class - processes cursor states
     * and renders the lines on the blackboard.
     * This class uses HTML5 Canvas 2D Context for visualising the lines.
     */
    var CanvasDrawer = (function () {
        /**
         * Init a new drawer.
         * @param   {boolean}   curved  Should the lines be curved, or simple quadrilateral?
         */
        function CanvasDrawer(curved) {
            this.curved = curved;
        }
        /**
         * Create a new renderer that will produce output into the CANVAS elemement usning HTML5.
         */
        CanvasDrawer.prototype.CreateCanvas = function () {
            this.canvas = HTML.CreateElement("canvas");
            this.context = this.canvas.getContext("2d");
            return this.canvas;
        };
        /**
         * Make ths canvas as large as possible (fill the parent element)
         */
        CanvasDrawer.prototype.Stretch = function () {
            // this is event handler - "this" isn't SVGDrawer here!
            var parent = this.canvas.parentElement;
            var width = parent.clientWidth;
            var height = parent.clientHeight;
            Helpers.HTML.SetAttributes(this.canvas, {
                width: width,
                height: height
            });
            Helpers.VideoEvents.trigger(Helpers.VideoEventType.CanvasSize, width, height);
        };
        CanvasDrawer.prototype.SetupOutputCorrection = function (sourceWidth, sourceHeight) {
            var wr = sourceWidth / this.canvas.width;
            var hr = sourceHeight / this.canvas.height;
            var min = Math.min(wr, hr);
            // prepare scale uniformly 
            this.context.scale(min, min);
            // translate the (0,0) point
            if (wr < hr) {
                // this means the width of the source is scaled to match the width of the output canvas
                // corrected height of the source is therefore lesser than the height of the output canvas
                // - shift it a bit so it is centered
                this.context.translate(0, this.canvas.height - (min * sourceHeight / 2));
            }
            else if (hr < wr) {
                // this means the width of the source is scaled to match the width of the output canvas
                // corrected height of the source is therefore lesser than the height of the output canvas
                // - shift it a bit so it is centered
                this.context.translate(this.canvas.width - (min * sourceWidth / 2), 0);
            }
            // else - the ratios match      
            return min;
        };
        /**
         * Make the canvas blank.
         */
        CanvasDrawer.prototype.ClearCanvas = function (color) {
            this.context.fillStyle = color.CssValue;
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        };
        /**
         * Set color of a path, that will be drawn in the future.
         */
        CanvasDrawer.prototype.SetCurrentColor = function (color) {
            this.currentColor = color;
        };
        /**
         * Start drawing a line.
         */
        CanvasDrawer.prototype.CreatePath = function () {
            return new Drawing.CanvasPath(this.curved, this.currentColor.CssValue, this.context);
        };
        return CanvasDrawer;
    })();
    Drawing.CanvasDrawer = CanvasDrawer;
})(Drawing || (Drawing = {}));
