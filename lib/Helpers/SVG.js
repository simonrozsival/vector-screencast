var HelperFunctions_1 = require('./HelperFunctions');
var SVG = (function () {
    function SVG() {
    }
    Object.defineProperty(SVG, "Namespace", {
        get: function () { return this.namespace; },
        enumerable: true,
        configurable: true
    });
    SVG.CreateDot = function (center, radius, color) {
        return this.CreateElement("circle", {
            cx: HelperFunctions_1.precise(center.X),
            cy: HelperFunctions_1.precise(center.Y),
            r: HelperFunctions_1.precise(radius),
            fill: color,
            stroke: "transparent"
        });
    };
    SVG.CreateCircle = function (center, radius, color) {
        if (radius > 0) {
            return this.CreateElement("circle", {
                cx: HelperFunctions_1.precise(center.X),
                cy: HelperFunctions_1.precise(center.Y),
                r: HelperFunctions_1.precise(radius),
                stroke: color,
                fill: "transparent",
                "stroke-width": 1
            });
        }
        return null;
    };
    SVG.CreateLine = function (start, end, width, color) {
        if (width > 0) {
            return this.CreateElement("path", {
                fill: "transparent",
                stroke: color,
                "stroke-width": HelperFunctions_1.precise(width),
                d: this.MoveToString(start) + " " + this.LineToString(end)
            });
        }
        return null;
    };
    SVG.CreateElement = function (name, attributes) {
        var el = document.createElementNS(this.namespace, name);
        if (!!attributes) {
            this.SetAttributes(el, attributes);
        }
        return el;
    };
    SVG.SetAttributes = function (el, attributes) {
        if (!el) {
            console.log(attributes);
        }
        for (var attr in attributes) {
            el.setAttributeNS(null, attr, attributes[attr]);
        }
    };
    SVG.MoveToString = function (a) {
        return "M " + HelperFunctions_1.precise(a.X) + "," + HelperFunctions_1.precise(a.Y);
    };
    SVG.LineToString = function (a) {
        return "L " + HelperFunctions_1.precise(a.X) + "," + HelperFunctions_1.precise(a.Y);
    };
    SVG.CurveToString = function (a, b, c) {
        return "C " + HelperFunctions_1.precise(a.X) + "," + HelperFunctions_1.precise(a.Y) + " " + HelperFunctions_1.precise(b.X) + "," + HelperFunctions_1.precise(b.Y) + " " + HelperFunctions_1.precise(c.X) + "," + HelperFunctions_1.precise(c.Y);
    };
    SVG.ArcString = function (end, radius, startAngle) {
        return "A " + HelperFunctions_1.precise(radius) + "," + HelperFunctions_1.precise(radius) + " " + startAngle + " 0,0 " + HelperFunctions_1.precise(end.X) + "," + HelperFunctions_1.precise(end.Y);
    };
    SVG.attr = function (node, name) {
        var attr = node.attributes.getNamedItemNS(null, name);
        if (!!attr) {
            return attr.textContent;
        }
        throw new Error("Attribute " + name + " is missing in " + node.localName);
    };
    SVG.numAttr = function (node, name) {
        return Number(node.attributes.getNamedItemNS(null, name).textContent);
    };
    SVG.namespace = "http://www.w3.org/2000/svg";
    return SVG;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SVG;
var SVGA = (function () {
    function SVGA() {
    }
    Object.defineProperty(SVGA, "Namespace", {
        get: function () { return this.namespace; },
        enumerable: true,
        configurable: true
    });
    SVGA.CreateElement = function (name, attributes) {
        var el = document.createElementNS(this.namespace, "a:" + name);
        if (!!attributes) {
            this.SetAttributes(el, attributes);
        }
        return el;
    };
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
    SVGA.attr = function (node, name, defaultValue) {
        var attr = node.attributes.getNamedItemNS(this.Namespace, name);
        if (!!attr) {
            return attr.textContent;
        }
        if (!!defaultValue) {
            return defaultValue;
        }
        throw new Error("Attribute " + name + " is missing in " + node.localName);
    };
    SVGA.numAttr = function (node, name, defaultValue) {
        return Number(SVGA.attr(node, name, defaultValue !== undefined ? defaultValue.toString() : undefined));
    };
    SVGA.namespace = "http://www.rozsival.com/2015/vector-screencast";
    return SVGA;
})();
exports.SVGA = SVGA;
