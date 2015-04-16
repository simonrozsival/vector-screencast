/**
 * Created by rozsival on 11/04/15.
 */


/**
 * SVG helper object.
 * @type {{namespace: string, dot: Function, circle: Function, line: Function, createElement: Function, setAttributes: Function}}
 */
var SVG = {

    /** @type {String} XML namespace of SVG */
    namespace: "http://www.w3.org/2000/svg",

    /**
     * Creates a filled circle on the canvas.
     * @param  {float} x      X position
     * @param  {float} y      Y position
     * @param  {float} radius Circle radius
     * @param  {string} color  CSS compatible color value
     */
    dot: function(x, y, radius, color) {
        if(radius > 0) {
            return SVG.createElement("circle", {
                cx:     x,
                cy:     y,
                r:      radius,
                fill:   color,
                stroke: "transparent"
            });
        }

        return null;
    },

    circle: function(x, y, radius, color) {
        if(radius > 0) {
            return SVG.createElement("circle", {
                cx:     x,
                cy:     y,
                r:      radius,
                stroke:   color,
                fill: "transparent",
                "stroke-width": 1
            });
        }

        return null;
    },

    line: function(start, end, width, color) {
        if(width > 0) {
            return SVG.createElement("path", {
                fill: "transparent",
                stroke: color,
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
                "stroke-width": width,
                d: "M" + start.x + " " + start.y + " L" + end.x + " " + end.y
            });
        }

        return null;
    },

    createElement: function(name, attributes) {
        var el = document.createElementNS(SVG.namespace, name);
        SVG.setAttributes(el, attributes);
        return el;
    },

    setAttributes: function(el, attributes) {
        for (var attr in attributes) {
            el.setAttributeNS(null, attr, attributes[attr]);
        }
    }


};