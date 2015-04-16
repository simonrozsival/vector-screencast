/**
 * Created by rozsival on 05/03/15.
 */

/**
 * Khanova Škola - vektorové video
 *
 * LINE DRAWING OBJECT
 * This is the base script containing line drawing mechanism
 *
 * @author:		Šimon Rozsíval (simon@rozsival.com)
 * @project:	Vector screencast for Khan Academy (Bachelor thesis)
 * @license:	MIT
 * @class
 */
var SVGDrawer = (function() {

    // make _this available in all functions without using the .call(this) method (it also isn't always possible)
    /** @type {SVGDrawer} */
    var _this;

    // private variables
    var paper;

    /** @type {Vector2} Start point of next segment drawing. */
    var start = null;

    /** @type {Vector2} End point of next segment drawing. */
    var end = null;

    /** @type {{pathA: Vector2, pathB: Vector2 }} Control points of the next start point. */
    var startControlPoint = null;

    /** @type {State} Last state received. */
    var lastState;

    var endDot;

    /** @type {Boolean} Was this  */
    var isOnlyClick = false;

    /** @type {Object} */
    var settings;

    /** @type {{a: String, b: String}} */
    var paths = {
        a: "",
        b: ""
    };
    var path;

    /**
     * Create the drawer of "rounded" lines
     * @param {BasicSettings} settingsObject Instance of BasicSettings
     * @constructor
     */
    function SVGDrawer(settingsObject) {
        _this = this;
        settings = settingsObject;

        // attach events
        VideoEvents.on("canvas-container-ready", setupCanvasContainer);
        VideoEvents.on("rewind", function() { });
        VideoEvents.on("new-state", processNewState);
        VideoEvents.on("skip-to", function(e, progress) { });
    }

    var setupCanvasContainer = function(e, container) {
        paper = SVG.createElement("svg", {
            width:  container.width(),
            height: container.height()
        });
        container.get(0).appendChild(paper);
    };

    /**
     * Draw lines correctly.
     * @param e
     * @param {State} state
     */
    var processNewState = function(e, state) {
        if(state.pressure > 0) {
            if(!lastState || lastState.pressure === 0) {
                startLine.call(_this, state.x, state.y, state.pressure);
            } else {
                continueLine.call(_this, state.x, state.y, state.pressure);
            }
        } else if (lastState && lastState.pressure > 0) {
            endLine.call(_this, state.x, state.y);
        }

        lastState = state;
    };

    /**
     * Start drawing a line.
     * @param {Number} x
     * @param {Number} y
     * @param {Number} pressure
     */
    var startLine = function (x, y, pressure) {
        isOnlyClick = true;

        // start every line with a dot to make the start nicely round
        var radius = calculateRadius(pressure);
        var dot = SVG.dot(x, y, radius, current().color);
        paper.appendChild(dot);

        // start a new path and prepare both top and bottom path strings
        path = SVG.createElement("path", {
            fill: current().color,
            stroke: "transparent",
            "stroke-linecap": "round",
            "stroke-linejoin": "round"
        });
        paper.appendChild(path);

        paths.a = "M " + x + "," + y + " ";
        paths.b = "L " + x + "," + y;

        // reset the data
        resetLastState(x, y);
    };

    var continueLine = function(x, y, pressure) {
        var radius = calculateRadius(pressure);
        if(isOnlyClick) {
            isOnlyClick = false;
            endDot = SVG.dot(x, y, radius, current().color);
            paper.appendChild(endDot);
        }

        drawSegment.call(this, x, y, radius);
    };

    /**
     * Convert pressure to brush radius according to current brush settings and pointing device pressure.
     * @param {number}  pressure    Pointing device pressure value in the range of [0;1]
     * @returns {number}
     */
    var calculateRadius = function(pressure) {
        return (pressure * current().brushSize) / 2;
    };

    /**
     * Current brush settings
     * @return {object} Settings.
     */
    var current = function() {
        return settings.getCurrentSettings();
    };

    /** @type {number} cardinal spline parameter */
    var a = 0.3;

    /**
     *
     * @param {number} x
     * @param {number} y
     * @param {number} radius
     */
    var drawSegment = function(x, y, radius) {
        var nextPoint = new Vector2(x, y);

        // calculate normal vector
        var direction = new Vector2(nextPoint.x - start.x, nextPoint.y - start.y);
        var normal = getScaledNormal(direction, radius); // control point "b" indicates the direction of the line in the next step
        if(normal === null) {
            return; // can't calculate normal vector => the distance between the last point and this point is zero => nothing to draw
        }

        // calculate control points for cubic bezier curve
        var controlPoints = getControlPoints(start, end, nextPoint, a, normal);
        if(controlPoints !== false) {
            paths.a += "C " + startControlPoint.pathA.x + "," + startControlPoint.pathA.y + " " +
                                controlPoints.a.pathA.x + "," + controlPoints.a.pathA.y + " " +
                                (end.x + normal.x) + "," + (end.y + normal.y) + " ";
            paths.b  = "C " + controlPoints.a.pathB.x + "," + controlPoints.a.pathB.y + " " +
                                startControlPoint.pathB.x + "," + startControlPoint.pathB.y + " " +
                                (start.x - normal.x) + "," + (start.y - normal.y) + " " + paths.b;

            // save the correct control points for the next time
            startControlPoint = controlPoints.b;
        } else {
            return; // this segment can't be drawn
        }

        // update path string
        var cap = "L " + (end.x - normal.x) + "," + (end.y - normal.y) + " ";
        SVG.setAttributes(path, {
            "d": paths.a + cap + paths.b
        });

        // draw a dot at the last point to make it round
        moveEndDot(end.x, end.y, radius)

        // do not forget to shift points
        start = end;
        end = nextPoint;
    };

    /**
     *
     * @param   {Vector2} direction    Direction vector
     * @param   {Number}  radius       Radius
     * @returns {Vector2} Scaled normal vector.
     */
    var getScaledNormal = function(direction, radius) {
        // calculate the normal vector and normalise it
        try {
            var normal = direction.getNormal()
            normal.x *= radius;
            normal.y *= radius;
            return normal;
        } catch (Exception) {
            return new Vector2(0, 0);
        }
    };

    /**
     * Return control points for point B in a cubic bezier curve going from A to C through point B.
     * @param {Vector2} a Point A
     * @param {Vector2} b Point B
     * @param {Vector2} c Point C
     * @param {Vector2} t Tension
     * @param {Vector2} n Normal vector
     * @returns {{a: {pathA: Vector2, pathB: Vector2}, b: {pathA: Vector2, pathB: Vector2}}}
     */
    var getControlPoints = function(a, b, c, t, n) {
        // calculate the distances
        var dist = {
            ab: Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2)),
            bc: Math.sqrt(Math.pow(c.x - b.x, 2) + Math.pow(c.y - b.y, 2))
        };

        // scaling factors
        var fa = t * dist.ab / (dist.ab + dist.bc);
        var fb = t * dist.bc / (dist.ab + dist.bc);

        var cp = {
            a: {
                x: b.x - fa * (c.x - a.x),
                y: b.y - fa * (c.y - a.y)
            },
            b: {
                x: b.x + fb * (c.x - a.x),
                y: b.y + fb * (c.y - a.y)
            }
        };

        return {
            a: {
                pathA: new Vector2(cp.a.x + n.x, cp.a.y + n.y),
                pathB: new Vector2(cp.a.x - n.x, cp.a.y - n.y)
            },
            b: {
                pathA: new Vector2(cp.b.x + n.x, cp.b.y + n.y),
                pathB: new Vector2(cp.b.x - n.x, cp.b.y - n.y)
            }
        };
    };


    /**
     * Ends currently drawn line.
     * @param x
     * @param y
     */
    var endLine = function(x, y) {
        if(!isOnlyClick) {
            // draw the last segment
            var lastRadius = calculateRadius(lastState.pressure);
            drawSegment(end.x, end.y, lastRadius);

            // draw a dot at the last point to make it round
            moveEndDot(end.x, end.y, lastRadius);
        }

        // reset tmp drawing points
        paths.a = null;
        paths.b = null;
        resetLastState(x, y);
    };

    /**
     * Move the dot and resize it according it to current state.
     * @param {number} x
     * @param {number} y
     * @param {number} radius
     */
    var moveEndDot = function(x, y, radius) {
        SVG.setAttributes(endDot, {
            cx: x,
            cy: y,
            radius: radius
        });
    };

    /**
     * Prepares valid data for later use of start, end and startControlPoint
     * @param  {number} x    X coordinates of pointing device
     * @param  {number} y    Y coordinates of pointing device
     */
    var resetLastState = function (x, y) {
        start = end = new Vector2(x, y);
        startControlPoint = {
            pathA: start,
            pathB: start
        };
    };

    return SVGDrawer;
})();
