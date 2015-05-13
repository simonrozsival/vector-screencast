/// <reference path="vector.ts" />
/// <reference path="HTML.ts" />
/**
 * SVG helper
 * @type {{namespace: string, dot: Function, circle: Function, line: Function, createElement: Function, setAttributes: Function, moveToString: Function, lineToString: Function, curveToString: Function}}
 */
var Helpers;
(function (Helpers) {
    var SVG = (function () {
        function SVG() {
        }
        Object.defineProperty(SVG, "Namespace", {
            get: function () { return this.namespace; },
            enumerable: true,
            configurable: true
        });
        /**
         * Creates a filled circle on the canvas.
         * @param   center  Dot center position vector.
         * @param   radius  Dot radius.
         * @param   coor    Dot fill color.
         */
        SVG.CreateDot = function (center, radius, color) {
            if (radius > 0) {
                return this.CreateElement("circle", {
                    cx: center.X,
                    cy: center.Y,
                    r: radius,
                    fill: color,
                    stroke: "transparent"
                });
            }
            return null;
        };
        /**
         * Create a circle with a specific center, radius and stroke color.
         * @param   center  Circle center position vector.
         * @param   radius  Circle radius.
         * @param   coor    Circumference stroke color.
         */
        SVG.CreateCircle = function (center, radius, color) {
            if (radius > 0) {
                return this.CreateElement("circle", {
                    cx: center.X,
                    cy: center.Y,
                    r: radius,
                    stroke: color,
                    fill: "transparent",
                    "stroke-width": 1
                });
            }
            return null;
        };
        /**
         * Create line element.
         * @param   start   Starting point of the line
         * @param   end     Ending point of the line
         * @param   width   Line thickness in pixels (relative to parent SVG width and height)
         * @param   color   Line stroke color
         */
        SVG.CreateLine = function (start, end, width, color) {
            if (width > 0) {
                return this.CreateElement("path", {
                    fill: "transparent",
                    stroke: color,
                    "stroke-width": width,
                    d: this.MoveToString(start) + " " + this.LineToString(end)
                });
            }
            return null;
        };
        /**
         * Creates an element with specified properties.
         */
        SVG.CreateElement = function (name, attributes) {
            var el = document.createElementNS(this.namespace, name);
            if (!!attributes) {
                this.SetAttributes(el, attributes);
            }
            return el;
        };
        /**
         * Assign a set of attributes to an element.
         * @param   el          The element
         * @param   attributes  The set of attributes
         */
        SVG.SetAttributes = function (el, attributes) {
            for (var attr in attributes) {
                el.setAttributeNS(null, attr, attributes[attr]);
            }
        };
        /**
         * Returns string for SVG path - move to the given point without drawing anything.
         * @param   a   End point
         */
        SVG.MoveToString = function (a) {
            return "M " + a.X + "," + a.Y;
        };
        /**
         * Returns string for SVG path - draw line from current point to the given one.
         * @param   a   End point
         */
        SVG.LineToString = function (a) {
            return "L " + a.X + "," + a.Y;
        };
        /**
         * Returns string for SVG path - draw a cubic Bézier curfe from current point to point c using control points a and b.
         * @param   a   Control point adjecent to the start
         * @param   b   Control point adjecent to the end
         * @param   c   The end point of the curve
         */
        SVG.CurveToString = function (a, b, c) {
            return "C " + a.X + "," + a.Y + " " + b.X + "," + b.Y;
        };
        /** XML namespace of SVG */
        SVG.namespace = "http://www.w3.org/2000/svg";
        return SVG;
    })();
    Helpers.SVG = SVG;
})(Helpers || (Helpers = {}));
//# sourceMappingURL=SVG.js.map