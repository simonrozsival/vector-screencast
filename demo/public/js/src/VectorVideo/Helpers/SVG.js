/// <reference path="vector.ts" />
/// <reference path="HTML.ts" />
/// <reference path="HelperFunctions" />
/**
 * SVG helper
 * @type {{namespace: string, dot: Function, circle: Function, line: Function, createElement: Function, setAttributes: Function, moveToString: Function, lineToString: Function, curveToString: Function}}
 */
var Helpers;
(function (Helpers) {
    var precise = Helpers.precise;
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
            return this.CreateElement("circle", {
                cx: precise(center.X),
                cy: precise(center.Y),
                r: precise(radius),
                fill: color,
                stroke: "transparent"
            });
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
                    cx: precise(center.X),
                    cy: precise(center.Y),
                    r: precise(radius),
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
                    "stroke-width": precise(width),
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
            if (!el) {
                console.log(attributes);
            }
            for (var attr in attributes) {
                el.setAttributeNS(null, attr, attributes[attr]);
            }
        };
        /**
         * Returns string for SVG path - move to the given point without drawing anything.
         * @param   a   End point
         */
        SVG.MoveToString = function (a) {
            return "M " + precise(a.X) + "," + precise(a.Y);
        };
        /**
         * Returns string for SVG path - draw line from current point to the given one.
         * @param   a   End point
         */
        SVG.LineToString = function (a) {
            return "L " + precise(a.X) + "," + precise(a.Y);
        };
        /**
         * Returns string for SVG path - draw a cubic Bézier curfe from current point to point c using control points a and b.
         * @param   a   Control point adjecent to the start
         * @param   b   Control point adjecent to the end
         * @param   c   The end point of the curve
         */
        SVG.CurveToString = function (a, b, c) {
            return "C " + precise(a.X) + "," + precise(a.Y) + " " + precise(b.X) + "," + precise(b.Y) + " " + precise(c.X) + "," + precise(c.Y);
        };
        /**
         * Returns string for SVG path - an arc
         */
        SVG.ArcString = function (end, radius, startAngle) {
            return "A " + precise(radius) + "," + precise(radius) + " " + startAngle + " 0,0 " + precise(end.X) + "," + precise(end.Y);
        };
        /**
         * Read attribute value
         */
        SVG.attr = function (node, name) {
            var attr = node.attributes.getNamedItemNS(this.Namespace, name);
            if (!!attr) {
                return attr.textContent;
            }
            throw new Error("Attribute " + name + " is missing in " + node.localName);
        };
        /**
         * Read numberic value of an attribute
         */
        SVG.numAttr = function (node, name) {
            return Number(node.attributes.getNamedItemNS(this.Namespace, name).textContent);
        };
        /** XML namespace of SVG */
        SVG.namespace = "http://www.w3.org/2000/svg";
        return SVG;
    })();
    Helpers.SVG = SVG;
    var SVGA = (function () {
        function SVGA() {
        }
        Object.defineProperty(SVGA, "Namespace", {
            get: function () { return this.namespace; },
            enumerable: true,
            configurable: true
        });
        /**
         * Creates an element with specified properties.
         */
        SVGA.CreateElement = function (name, attributes) {
            var el = document.createElementNS(this.namespace, "a:" + name);
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
        SVGA.SetAttributes = function (el, attributes) {
            if (!el) {
                console.log(attributes);
            }
            for (var attr in attributes) {
                var a = document.createAttributeNS(this.namespace, "a:" + attr);
                a.textContent = attributes[attr];
                el.attributes.setNamedItemNS(a);
            }
        };
        /**
         * Read attribute value
         */
        SVGA.attr = function (node, name) {
            var attr = node.attributes.getNamedItemNS(this.Namespace, name);
            if (!!attr) {
                return attr.textContent;
            }
            throw new Error("Attribute " + name + " is missing in " + node.localName);
        };
        /**
         * Read numberic value of an attribute
         */
        SVGA.numAttr = function (node, name) {
            return Number(node.attributes.getNamedItemNS(this.Namespace, name).textContent);
        };
        /** XML namespace of SVG */
        SVGA.namespace = "http://www.rozsival.com/2015/vector-video";
        return SVGA;
    })();
    Helpers.SVGA = SVGA;
})(Helpers || (Helpers = {}));
