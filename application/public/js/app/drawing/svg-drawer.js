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

    /** @type {HTMLElement} */
    var paper;

    /** @type {Vector2} Start point of next segment drawing. */
    var start = null;

    /** @type {Vector2} End point of next segment drawing. */
    var end = null;

    /** @type {State} Last state received. */
    var lastState;

    /** @type {number} Next point's radius */
    var nextRadius;

    /** @type {Vector2} */
    var prevPoint;

    /** @type {Vector2} */
    var lastDrawnPosition;

    /** @type {number} */
    var lastDrawnRadius;

    /** @type {Element} */
    var endDot;

    /** @type {Boolean} Was this  */
    var isOnlyClick = false;

    /** @type {Object} */
    var settings;

    /** @type {{a: String, b: String}} */
    var paths = {
        top: "",
        bottom: ""
    };
    var path;

    /**
     * Create the drawer of "rounded" lines
     * @param {BasicSettings} settingsObject Instance of BasicSettings
     * @constructor
     */
    function SVGDrawer(settingsObject) {
        settings = settingsObject;

        // attach events handlers
        VideoEvents.on("canvas-container-ready", prepareCanvas );
        //VideoEvents.on("rewind", function() { });
        VideoEvents.on("new-state", processNewState);
        //VideoEvents.on("skip-to", function(e, progress) { });
    }

    /**
     * Prepare canvas
     * @param {object}      e           Event object
     * @param {HTMLElement} container   Canvas container
     */
    var prepareCanvas = function(e, container) {
        paper = SVG.createElement("svg", {
            width:  container.offsetWidth,
            height: container.offsetHeight
        });
        container.appendChild(paper);
    };

    /**
     * Draw lines correctly.
     * @param e
     * @param {State} state
     */
    var processNewState = function(e, state) {
        var nextPoint = new Vector2(state.x, state.y);
        if(state.pressure > 0) {
            if(!lastState || lastState.pressure === 0) {
                startLine(nextPoint, state.pressure);
            } else {
                continueLine(nextPoint, state.pressure);
            }
        } else if (lastState && lastState.pressure > 0) {
            endLine(nextPoint);
        }

        lastState = state;
    };

    /**
     * Start drawing a line.
     * @param {Vector2} point       Starting point of the line
     * @param {number}  pressure    Brush pressure
     */
    var startLine = function (point, pressure) {
        isOnlyClick = true;

        // start every line with a dot to make it nicely round
        var radius = calculateRadius(pressure);
        var dot = SVG.dot(point, radius, current().color);
        paper.appendChild(dot);

        // prepare values for following line segments
        prevPoint = point.clone();
        start = point.clone();
        nextRadius = radius;
        lastDrawnPosition = point.clone();
        lastDrawnRadius = radius;
    };

    /**
     *
     * @param {Vector2} nextPoint   Next point of the line
     * @param {number}  pressure    Brush pressure
     */
    var continueLine = function(nextPoint, pressure) {
        var radius = calculateRadius(pressure);
        if(isOnlyClick) {
            // this is the second point of the line - only a dot was drawn so far
            if(preparePath(nextPoint)) {
                end = nextPoint.clone();
                isOnlyClick = false;
                endDot = SVG.dot(end, radius, current().color);
                paper.appendChild(endDot);
            }
        } else {
            // just draw another segment of the line
            drawSegment(nextPoint, radius, false);
        }
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

    /**
     *
     * @param   {Vector2}   nextPoint   The point where the path will start
     * @returns {boolean}   True if preparations went well, false otherwise.
     */
    var preparePath = function(nextPoint) {
        // calculate starting points
        var direction = nextPoint.subtract(start);
        if(direction.getX() === 0 && direction.getY()  === 0) {
            return false; // mouse hasn't moved a bit
        }
        var normal = getScaledNormal(direction, lastDrawnRadius); // control point "b" indicates the direction of the line in the next step

        // start a new path and prepare both top and bottom path strings
        path = SVG.createElement("path", {
            fill: current().color,
            stroke: "transparent"
        });
        paper.appendChild(path);

        // position the start points
        paths.top       = "M " + (start.getX() + normal.getX()) + "," + (start.getY()  + normal.getY() ) + " ";
        paths.bottom    = "L " + (start.getX() - normal.getX()) + "," + (start.getY()  - normal.getY() ) + " Z";

        return true;
    };

    /**
     * Draw the following sement of the line
     * @param {Vector2} nextPoint   Next mouse position
     * @param {number}  radius      Brush radius according to brush pressure
     * @param {boolean} closePath   True if the path won't continue further
     */
    var drawSegment = function(nextPoint, radius, closePath) {
        // swap radius for next radius
        var tmp = nextRadius;
        nextRadius = radius;
        radius = tmp;

        // calculate normal vector
        var direction = end.subtract(start);
        var normal = getScaledNormal(direction, radius); // control point "b" indicates the direction of the line in the next step
        if(normal === null) {
            return; // can't calculate normal vector => the distance between the last point and this point is zero => nothing to draw
        }

        if(direction.getSize() > radius) {
            drawCurvedSegment(nextPoint, normal);
        } else {
            // the points are too close to each other
            drawStraightSegment(normal);
        }

        // 'cap' is a tmp connection of the top and bottom parts of the path
        var cap;
        if(closePath !== true) {
            cap = SVG.lineToString(nextPoint.add(normal)) + " " + SVG.lineToString(nextPoint.subtract(normal));
            moveEndDot(nextPoint, radius);
        } else {
            // 'nextPoint' isn't part of the line - don't draw any tmp segment and close the path
            // with a sharp end instead + move the ending dot to the right position
            cap = SVG.lineToString(end.subtract(normal));
            moveEndDot(end, radius);
        }

        // update path string
        SVG.setAttributes(path, {
            "d": paths.top + cap + paths.bottom
        });

        lastDrawnPosition = start;
        lastDrawnRadius = radius;

        // do not forget to shift points
        prevPoint = start.clone();
        start = end.clone();
        end = nextPoint.clone();
    };

    var drawCurvedSegment = function(nextPoint, normal) {
        // calculate control points for cubic bezier curve
        var spline = calculateSpline(prevPoint, start, end, nextPoint, normal);
        if(spline !== false) {
            paths.top += " " + SVG.curveToString(spline.top.startCP, spline.top.endCP, spline.top.end);
            paths.bottom = SVG.curveToString(spline.bottom.endCP, spline.bottom.startCP, spline.bottom.start) + " " + paths.bottom; // bottom part is drawn "backwards"
        } else {
            return; // this segment can't be drawn
        }
    };


    var drawStraightSegment = function(normal) {
        // @todo !!!!
        // calculate control points for cubic bezier curve
        paths.top += " " + SVG.lineToString(end.add(normal));
        paths.bottom = SVG.lineToString(start.subtract(normal)) + " " + paths.bottom; // bottom part is drawn "backwards"
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
            return direction.getNormal().scale(radius);
        } catch (Exception) {
            return new Vector2(0, 0);
        }
    };

    /**
     * Calculate path points
     * @param {Vector2} a   Previous position
     * @param {Vector2} b   Segment start position
     * @param {Vector2} c   Segment end position
     * @param {Vector2} d   Following position
     * @param {Vector2} n   Normal vector
     * @returns {{top: {start: Vector2, startCP: Vector2, end: Vector2, endCP: Vector2}, bottom: {start: Vector2, startCP: Vector2, end: Vector2, endCP: Vector2}}}
     */
    var calculateSpline = function(a, b, c, d, n) {
        var cp = SplineHelper.catmullRomToBezier(a, b, c, d);
        return {
            top: {
                start:  cp.start.add(n),
                startCP:cp.startCP.add(n),
                end:    cp.end.add(n),
                endCP:  cp.endCP.add(n)
            },
            bottom: {
                start:  cp.start.subtract(n),
                startCP:cp.startCP.subtract(n),
                end:    cp.end.subtract(n),
                endCP:  cp.endCP.subtract(n)
            }
        };
    };


    /**
     * Ends currently drawn line.
     * @param {Vector2} pos Position of mouse when pressure dropped to 0.
     */
    var endLine = function(pos) {
        if(!isOnlyClick) {
            // draw the last missing segment
            var _end = end;
            drawSegment(pos, 0, true);

            var lastRadius = calculateRadius(lastState.pressure);
            moveEndDot(_end, lastRadius);
        }
    };

    /**
     * Move the dot and resize it according it to current state.
     * @param {Vector2} center  Center position
     * @param {number}  radius  Dot radius.
     */
    var moveEndDot = function(center, radius) {
        SVG.setAttributes(endDot, {
            cx: center.getX(),
            cy: center.getY() ,
            r: radius
        });
    };

    return SVGDrawer;
})();
