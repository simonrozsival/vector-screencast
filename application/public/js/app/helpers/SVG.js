/**
 * Created by rozsival on 11/04/15.
 */


/**
 * SVG helper object.
 * @type {{namespace: string, dot: Function, circle: Function, line: Function, createElement: Function, setAttributes: Function, moveToString: Function, lineToString: Function, curveToString: Function}}
 */
var SVG = {

    /** @type {String} XML namespace of SVG */
    namespace: "http://www.w3.org/2000/svg",

    /**
     * Creates a filled circle on the canvas.
     * @param  {Vector2} center     Center of the dot.
     * @param  {number}  radius     Circle radius
     * @param  {string}  color      CSS compatible color value
     * @return {null|HTMLElement}
     */
    dot: function(center, radius, color) {
        if(radius > 0) {
            return SVG.createElement("circle", {
                cx:     center.getX(),
                cy:     center.getY(),
                r:      radius,
                fill:   color,
                stroke: "transparent"
            });
        }

        return null;
    },

    /**
     * Create a circle with a specific center, radius and stroke color.
     * @param {Vector2} center  Circle of the circle.
     * @param {number} radius   Circle radius
     * @param {string} color    Circumference stroke color
     * @returns {null|HTMLElement}
     */
    circle: function(center, radius, color) {
        if(radius > 0) {
            return SVG.createElement("circle", {
                cx:     center.getX(),
                cy:     center.getY(),
                r:      radius,
                stroke:   color,
                fill: "transparent",
                "stroke-width": 1
            });
        }

        return null;
    },

    /**
     * Create line element.
     * @param {Vector2} start   Start vector
     * @param {Vector2} end
     * @param {number}  width
     * @param {string}  color
     * @returns {*}
     */
    line: function(start, end, width, color) {
        if(width > 0) {
            return SVG.createElement("path", {
                fill: "transparent",
                stroke: color,
                "stroke-width": width,
                d: SVG.moveToString(start) + " " + SVG.lineToString(end)
            });
        }

        return null;
    },

    /**
     * Creates an element with specified properties.
     * @param {string} name         Element name
     * @param {object} attributes   Element properties
     * @returns {HTMLElement}
     */
    createElement: function(name, attributes) {
        var el = document.createElementNS(SVG.namespace, name);
        if(attributes) {
            SVG.setAttributes(el, attributes);
        }
        return el;
    },

    /**
     * Assign a set of attributes to an element.
     * @param {HTMLElement} el          Target element
     * @param {object}      attributes  Properties to be set to the element.
     */
    setAttributes: function(el, attributes) {
        for (var attr in attributes) {
            el.setAttributeNS(null, attr, attributes[attr]);
        }
    },


    /**
     * Move SVG "cursor" to given end point.
     * @param   {Vector2}   a   End point
     * @returns {string}        SVG path argument
     */
    moveToString: function(a) {
        return "M " + a.getX() + "," + a.getY();
    },

    /**
     * Create a straight line according to given end point.
     * @param   {Vector2}   a   End point
     * @returns {string}        SVG path argument
     */
    lineToString: function(a) {
        return "L " + a.getX() + "," + a.getY();
    },

    /**
     * Create a cubic bézier curve according to given control points.
     * @param {Vector2} a   Start control point
     * @param {Vector2} b   End control point
     * @param {Vector2} c   End point
     * @returns {string}    SVG path argument
     */
    curveToString: function(a, b, c) {
        return "C " + a.getX() + "," + a.getY() + " " + b.getX() + "," + b.getY() + " " + c.getX() + "," + c.getY();
    }


};