var Helpers;
(function (Helpers) {
    (function (LogLevel) {
        LogLevel[LogLevel["Silent"] = 0] = "Silent";
        LogLevel[LogLevel["Normal"] = 1] = "Normal";
        LogLevel[LogLevel["Verbose"] = 2] = "Verbose";
        LogLevel[LogLevel["Annoying"] = 3] = "Annoying";
    })(Helpers.LogLevel || (Helpers.LogLevel = {}));
    var LogLevel = Helpers.LogLevel;
    /**
     * Debug class wraps the console.log function.
     * Only some messages should be logged according to user's choice.
     */
    var Debug = (function () {
        function Debug() {
        }
        /**
         * Change current logging level
         */
        Debug.SetLevel = function (level) {
            this.level = level;
        };
        /**
         * Log data only if the logging level is lesser
         */
        Debug.Log = function (level) {
            var data = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                data[_i - 1] = arguments[_i];
            }
            if (level <= this.level) {
                console.log(data);
            }
        };
        /** Current logging level - default is Normal */
        Debug.level = LogLevel.Normal;
        return Debug;
    })();
    Helpers.Debug = Debug;
})(Helpers || (Helpers = {}));
/// <reference path="Log" />
var Helpers;
(function (Helpers) {
    (function (ErrorType) {
        ErrorType[ErrorType["Warning"] = 0] = "Warning";
        ErrorType[ErrorType["Fatal"] = 1] = "Fatal";
    })(Helpers.ErrorType || (Helpers.ErrorType = {}));
    var ErrorType = Helpers.ErrorType;
    /**
     * A class for logging errors that happen within the application
     */
    var Errors = (function () {
        function Errors() {
        }
        Errors.TurnOn = function () { this.doLog = true; };
        Errors.TurnOff = function () { this.doLog = false; };
        /**
         * Set different logging impementation
         */
        Errors.SetLogFunction = function (f) {
            this.LogFunction = f;
        };
        /**
         * Report an error
         */
        Errors.Report = function (type) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (this.doLog) {
                this.LogFunction(type, args);
            }
        };
        /**
         * Convert error type to string
         */
        Errors.ErrorTypeName = function (e) {
            switch (e) {
                case ErrorType.Warning:
                    return "Warning";
                case ErrorType.Fatal:
                    return "Fatal error";
                default:
                    return "Unknown error type";
            }
        };
        /** If the logging should be done or not. */
        Errors.doLog = true;
        /**
         * Implmentation of the logging function
         */
        Errors.LogFunction = function (type, args) {
            // this is the basic logging function, it can be replaced by anything else...
            if (type === ErrorType.Fatal) {
                throw new Error("Fatal Error: " + args.join("; "));
            }
            else {
                Helpers.Debug.Log(Helpers.LogLevel.Normal, Errors.ErrorTypeName(type), args);
            }
        };
        return Errors;
    })();
    Helpers.Errors = Errors;
})(Helpers || (Helpers = {}));
var Helpers;
(function (Helpers) {
    /**
     * Immutable two dimensional vector representation with basic operations.
     * @author  Šimon Rozsíval
     */
    var Vector2 = (function () {
        function Vector2(x, y) {
            this.x = x;
            this.y = y;
        }
        Object.defineProperty(Vector2.prototype, "X", {
            /**
             * X coord
             */
            get: function () { return this.x; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vector2.prototype, "Y", {
            /**
             * Y coord
             */
            get: function () { return this.y; },
            enumerable: true,
            configurable: true
        });
        /**
         * Compare two vectors
         */
        Vector2.prototype.isEqualTo = function (b) {
            return this.X === b.X && this.Y === b.Y;
        };
        /**
         * Calculates size of the vector.
         */
        Vector2.prototype.getSize = function () {
            return Math.sqrt(this.getSizeSq());
        };
        ;
        /**
         * Calculates squared size of the vector.
         */
        Vector2.prototype.getSizeSq = function () {
            return this.x * this.x + this.y * this.y;
        };
        /**
         * Distance between this and the other point.
         */
        Vector2.prototype.distanceTo = function (b) {
            var dx = this.x - b.X;
            var dy = this.y - b.Y;
            return Math.sqrt(dx * dx + dy * dy);
        };
        ;
        /**
         * Normalizes the vector.
         * @throws Error
         */
        Vector2.prototype.normalize = function () {
            var size = this.getSize();
            if (size === 0) {
                throw new Error("Can't normalize zero vector.");
            }
            this.scale(1 / size);
            return this;
        };
        ;
        /**
         * Creates a normal vector to this vector.
         */
        Vector2.prototype.getNormal = function () {
            return (new Vector2(-this.y, this.x)).normalize();
        };
        ;
        /**
         * Create a new two-dimensional vector as a combination of this vector with a specified vector.
         */
        Vector2.prototype.add = function (b) {
            this.x += b.X;
            this.y += b.Y;
            return this;
        };
        ;
        /**
         * Create a new two-dimensional vector by subtracting a specified vector from this vector.
         */
        Vector2.prototype.subtract = function (b) {
            this.x -= b.X;
            this.y -= b.Y;
            return this;
        };
        ;
        /**
         * Create a new vector that is scaled by the coeficient c.
         */
        Vector2.prototype.scale = function (c) {
            this.x *= c;
            this.y *= c;
            return this;
        };
        ;
        /**
         * Calculates a point in between this and the other point.
         */
        Vector2.prototype.pointInBetween = function (b) {
            return new Vector2((this.x + b.X) / 2, (this.y + b.Y) / 2);
        };
        /**
         * Make a copy of the vector.
         */
        Vector2.prototype.clone = function () {
            return new Vector2(this.x, this.y);
        };
        ;
        return Vector2;
    })();
    Helpers.Vector2 = Vector2;
})(Helpers || (Helpers = {}));
var UI;
(function (UI) {
    /**
     * Color representation.
     */
    var Color = (function () {
        function Color(name, cssValue) {
            this.name = name;
            this.cssValue = cssValue;
        }
        Object.defineProperty(Color.prototype, "Name", {
            /**
             * Textual representation
             */
            get: function () { return this.name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "CssValue", {
            /**
             * CSS value of the color
             */
            get: function () { return this.cssValue; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color, "BackgroundColor", {
            get: function () {
                return new Color(this.backgroundPrototype.Name, this.backgroundPrototype.CssValue);
            },
            set: function (c) { this.backgroundPrototype = c; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color, "ForegroundColor", {
            get: function () {
                return new Color(this.foregroundPrototype.Name, this.foregroundPrototype.CssValue);
            },
            set: function (c) { this.foregroundPrototype = c; },
            enumerable: true,
            configurable: true
        });
        /**
         * Color prototypes
         */
        Color.backgroundPrototype = new Color("Dark gray", "#111");
        Color.foregroundPrototype = new Color("White", "#fff");
        return Color;
    })();
    UI.Color = Color;
})(UI || (UI = {}));
var UI;
(function (UI) {
    /**
     * Brush size representation.
     */
    var BrushSize = (function () {
        function BrushSize(name, size, unit) {
            this.name = name;
            this.size = size;
            this.unit = unit;
        }
        Object.defineProperty(BrushSize.prototype, "Name", {
            /**
             * Textual representation
             */
            get: function () { return this.name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BrushSize.prototype, "Size", {
            /**
             * The size of the brush
             */
            get: function () { return this.size; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BrushSize.prototype, "Unit", {
            /**
             * The units of brush size
             */
            get: function () { return this.unit; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BrushSize.prototype, "CssValue", {
            /**
             * The size with the unit suitable for css
             */
            get: function () { return "" + this.size + this.unit; },
            enumerable: true,
            configurable: true
        });
        return BrushSize;
    })();
    UI.BrushSize = BrushSize;
})(UI || (UI = {}));
/// <reference path="Vector" />
/// <reference path="../UI/Color" />
/// <reference path="../UI/Brush" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Helpers;
(function (Helpers) {
    (function (StateType) {
        StateType[StateType["ChangeBrushSize"] = 0] = "ChangeBrushSize";
        StateType[StateType["ChangeColor"] = 1] = "ChangeColor";
        StateType[StateType["Cursor"] = 2] = "Cursor";
    })(Helpers.StateType || (Helpers.StateType = {}));
    var StateType = Helpers.StateType;
    var State = (function () {
        /**
         * @param   type    State type
         * @param   time    Time when this state should be processed
         */
        function State(type, time) {
            this.type = type;
            this.time = time;
        }
        /** Type of this state */
        State.prototype.GetType = function () { return this.type; };
        /** Time elapsed from video start in milliseconds */
        State.prototype.GetTime = function () { return this.time; };
        return State;
    })();
    Helpers.State = State;
    /**
     * Class representing state of app.
     */
    var CursorState = (function (_super) {
        __extends(CursorState, _super);
        function CursorState(time, x, y, pressure) {
            _super.call(this, StateType.Cursor, time);
            this.x = x;
            this.y = y;
            this.pressure = pressure;
        }
        Object.defineProperty(CursorState.prototype, "X", {
            /** Get pointing device X coordinate */
            get: function () { return this.x; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CursorState.prototype, "Y", {
            /** Get pointing device Y coordinate */
            get: function () { return this.y; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CursorState.prototype, "Pressure", {
            /** Get pointing device pressure from 0 to 1 */
            get: function () { return this.pressure; },
            enumerable: true,
            configurable: true
        });
        /**
         * Get pointing device position as a vector
         */
        CursorState.prototype.getPosition = function () {
            return new Helpers.Vector2(this.x, this.y);
        };
        return CursorState;
    })(State);
    Helpers.CursorState = CursorState;
    /**
     * Class representing state of app.
     */
    var ColorState = (function (_super) {
        __extends(ColorState, _super);
        function ColorState(time, color) {
            _super.call(this, StateType.ChangeColor, time);
            this.color = color;
        }
        Object.defineProperty(ColorState.prototype, "Color", {
            get: function () { return this.color; },
            enumerable: true,
            configurable: true
        });
        return ColorState;
    })(State);
    Helpers.ColorState = ColorState;
    /**
     * Class representing state of app.
     */
    var SizeState = (function (_super) {
        __extends(SizeState, _super);
        function SizeState(time, size) {
            _super.call(this, StateType.ChangeBrushSize, time);
            this.size = size;
        }
        Object.defineProperty(SizeState.prototype, "Size", {
            get: function () { return this.size; },
            enumerable: true,
            configurable: true
        });
        return SizeState;
    })(State);
    Helpers.SizeState = SizeState;
})(Helpers || (Helpers = {}));
/**
 * HTML helper.
 */
var Helpers;
(function (Helpers) {
    /**
     *
     */
    var HTML = (function () {
        function HTML() {
        }
        /**
         * Create a HTML element with specified attributes and appended children (if any)
         */
        HTML.CreateElement = function (name, attributes, children) {
            var el = document.createElement(name);
            // set attributes right away - if passed
            if (!!attributes) {
                HTML.SetAttributes(el, attributes);
            }
            if (!!children && Array.isArray(children)) {
                for (var i in children) {
                    el.appendChild(children[i]);
                }
            }
            return el;
        };
        /**
         * Add attributes to a HTML element
         */
        HTML.SetAttributes = function (el, attributes) {
            for (var attr in attributes) {
                el.setAttribute(attr, attributes[attr]);
            }
        };
        return HTML;
    })();
    Helpers.HTML = HTML;
})(Helpers || (Helpers = {}));
;
var Helpers;
(function (Helpers) {
    var COORDS_PRECISION = 3;
    /**
     * Prints a number rounded and with trimmed trailing zeros.
     */
    function precise(n, precision) {
        if (precision === void 0) { precision = COORDS_PRECISION; }
        return Number(n.toFixed(precision)).toString(); // isn't there a better way?
    }
    Helpers.precise = precise;
    /**
    * Converts an integer value of seconds to a human-readable time format - "0:00"
    * @param  s seconds
    * @return Human readable time
    */
    function secondsToString(s) {
        var time;
        var minutes = Math.floor(s / 60);
        time = minutes + ":";
        var seconds = Math.floor(s % 60);
        if (seconds <= 9) {
            time += "0" + seconds.toString(10); // seconds should have leading zero if lesser than 10
        }
        else {
            time += seconds.toString(10);
        }
        return time;
    }
    Helpers.secondsToString = secondsToString;
    ;
    /**
    * Converts an integer value of milliseconds to a human-readable time format - "0:00"
    * @param  ms     Time in milliseconds
    * @return Human readable time
    */
    function millisecondsToString(ms) {
        return secondsToString(Math.floor(ms / 1000));
    }
    Helpers.millisecondsToString = millisecondsToString;
    ;
})(Helpers || (Helpers = {}));
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
            var attr = node.attributes.getNamedItemNS(null, name);
            if (!!attr) {
                return attr.textContent;
            }
            throw new Error("Attribute " + name + " is missing in " + node.localName);
        };
        /**
         * Read numberic value of an attribute
         */
        SVG.numAttr = function (node, name) {
            return Number(node.attributes.getNamedItemNS(null, name).textContent);
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
        /**
         * Read numberic value of an attribute
         */
        SVGA.numAttr = function (node, name, defaultValue) {
            return Number(SVGA.attr(node, name, defaultValue !== undefined ? defaultValue.toString() : undefined));
        };
        /** XML namespace of SVG */
        SVGA.namespace = "http://www.rozsival.com/2015/vector-video";
        return SVGA;
    })();
    Helpers.SVGA = SVGA;
})(Helpers || (Helpers = {}));
///<reference path="./Vector.ts" />
var Helpers;
(function (Helpers) {
    /**
     * A set of functions for better spline handling.
     */
    var Spline = (function () {
        function Spline() {
        }
        /**
         * Convert four consequent points to parameters for cubic Bézier curve.
         * (http://therndguy.com/papers/curves.pdf)
         * @param   a     Previous point on the spline
         * @param   b     Start point of this segment
         * @param   c     End point of this segment
         * @param   d     The following point on the spline
         */
        Spline.catmullRomToBezier = function (a, b, c, d) {
            return new BezierCurveSegment(b, new Helpers.Vector2((-1 / 6 * a.X) + b.X + (1 / 6 * c.X), (-1 / 6 * a.Y) + b.Y + (1 / 6 * c.Y)), c, new Helpers.Vector2((1 / 6 * b.X) + c.X + (-1 / 6 * d.X), (1 / 6 * b.Y) + c.Y + (-1 / 6 * d.Y)));
        };
        return Spline;
    })();
    Helpers.Spline = Spline;
    /**
     * Immutable set of control points of a cubic Bézier curve segment
     */
    var BezierCurveSegment = (function () {
        /**
         * Repersents one segment of a bezier curve
         * @param   start   Previous point on the spline
         * @param   startCP Start point of this segment
         * @param   end     End point of this segment
         * @param   endCP   The following point on the spline
         */
        function BezierCurveSegment(start, startCP, end, endCP) {
            this.start = start;
            this.startCP = startCP;
            this.end = end;
            this.endCP = endCP;
        }
        Object.defineProperty(BezierCurveSegment.prototype, "Start", {
            /** The point, wher the spline starts */
            get: function () { return this.start; },
            set: function (vec) { this.start = vec; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BezierCurveSegment.prototype, "StartCP", {
            /** The control point adjecent to the starting point */
            get: function () { return this.startCP; },
            set: function (vec) { this.startCP = vec; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BezierCurveSegment.prototype, "End", {
            /** The point, where the spline ends */
            get: function () { return this.end; },
            set: function (vec) { this.end = vec; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BezierCurveSegment.prototype, "EndCP", {
            /** The control point adjecent to the ending point */
            get: function () { return this.endCP; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BezierCurveSegment.prototype, "EndCp", {
            set: function (vec) { this.endCP = vec; },
            enumerable: true,
            configurable: true
        });
        return BezierCurveSegment;
    })();
    Helpers.BezierCurveSegment = BezierCurveSegment;
})(Helpers || (Helpers = {}));
/**
 * Event Aggregator object.
 * @author Šimon Rozsíval
 */
var Helpers;
(function (Helpers) {
    /**
     * The list of supported video events.
     */
    (function (VideoEventType) {
        VideoEventType[VideoEventType["Start"] = 0] = "Start";
        VideoEventType[VideoEventType["Pause"] = 1] = "Pause";
        VideoEventType[VideoEventType["Continue"] = 2] = "Continue";
        VideoEventType[VideoEventType["Stop"] = 3] = "Stop";
        VideoEventType[VideoEventType["ReachEnd"] = 4] = "ReachEnd";
        VideoEventType[VideoEventType["Replay"] = 5] = "Replay";
        VideoEventType[VideoEventType["JumpTo"] = 6] = "JumpTo";
        VideoEventType[VideoEventType["VideoInfoLoaded"] = 7] = "VideoInfoLoaded";
        VideoEventType[VideoEventType["BufferStatus"] = 8] = "BufferStatus";
        VideoEventType[VideoEventType["CursorState"] = 9] = "CursorState";
        VideoEventType[VideoEventType["ChangeColor"] = 10] = "ChangeColor";
        VideoEventType[VideoEventType["ChangeBrushSize"] = 11] = "ChangeBrushSize";
        VideoEventType[VideoEventType["StartPath"] = 12] = "StartPath";
        VideoEventType[VideoEventType["DrawSegment"] = 13] = "DrawSegment";
        VideoEventType[VideoEventType["DrawPath"] = 14] = "DrawPath";
        VideoEventType[VideoEventType["CurrentTime"] = 15] = "CurrentTime";
        VideoEventType[VideoEventType["Render"] = 16] = "Render";
        VideoEventType[VideoEventType["ClearCanvas"] = 17] = "ClearCanvas";
        VideoEventType[VideoEventType["CanvasSize"] = 18] = "CanvasSize";
        VideoEventType[VideoEventType["CanvasScalingFactor"] = 19] = "CanvasScalingFactor";
        VideoEventType[VideoEventType["RegisterRecordingTool"] = 20] = "RegisterRecordingTool";
        VideoEventType[VideoEventType["RecordingToolFinished"] = 21] = "RecordingToolFinished";
        VideoEventType[VideoEventType["RecordingFinished"] = 22] = "RecordingFinished";
        VideoEventType[VideoEventType["StartUpload"] = 23] = "StartUpload";
        VideoEventType[VideoEventType["DownloadData"] = 24] = "DownloadData";
        VideoEventType[VideoEventType["VolumeUp"] = 25] = "VolumeUp";
        VideoEventType[VideoEventType["VolumeDown"] = 26] = "VolumeDown";
        VideoEventType[VideoEventType["Mute"] = 27] = "Mute";
        VideoEventType[VideoEventType["Busy"] = 28] = "Busy";
        VideoEventType[VideoEventType["Ready"] = 29] = "Ready";
        // DO NOT ADD NEW EVENTS UNDERNEATH:    
        // hack:
        VideoEventType[VideoEventType["length"] = 30] = "length";
    })(Helpers.VideoEventType || (Helpers.VideoEventType = {}));
    var VideoEventType = Helpers.VideoEventType; // if nothing follows "length", then VideoEventType.length gives the total count of valid values        
    var VideoEvent = (function () {
        function VideoEvent(type) {
            this.type = type;
            this.listeners = new Array(0); // prepare a dense empty array
        }
        Object.defineProperty(VideoEvent.prototype, "Type", {
            get: function () { return this.type; },
            enumerable: true,
            configurable: true
        });
        /**
         * Attach a new listener.
         */
        VideoEvent.prototype.on = function (command) {
            this.listeners.push(command);
        };
        /**
         * Remove listener
         */
        VideoEvent.prototype.off = function (command) {
            var index = this.listeners.indexOf(command);
            if (index >= 0) {
                // delete just the one listener
                this.listeners.splice(index, 1);
            }
        };
        /**
         * Trigger this event
         */
        VideoEvent.prototype.trigger = function (args) {
            for (var i = 0; i < this.listeners.length; i++) {
                var cmd = this.listeners[i];
                cmd.apply(this, args);
            }
        };
        /**
         * Trigger event handle asynchronousely
         */
        VideoEvent.prototype.triggerAsync = function (command, args) {
            setTimeout(function () {
                command.apply(this, args);
            }, 0);
        };
        return VideoEvent;
    })();
    /**
     * Global mediator class.
     * Implements the Mediator design pattern.
     */
    var VideoEvents = (function () {
        function VideoEvents() {
        }
        /**
         * Register new event listener
         */
        VideoEvents.on = function (type, command) {
            if (!VideoEvents.events[type]) {
                VideoEvents.events[type] = new VideoEvent(type);
            }
            VideoEvents.events[type].on(command);
        };
        /**
         * Unregister event listener
         */
        VideoEvents.off = function (type, command) {
            if (!!VideoEvents.events[type]) {
                VideoEvents.events[type].off(command);
            }
        };
        /**
         * Trigger an event
         */
        VideoEvents.trigger = function (type) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var e = VideoEvents.events[type];
            if (!!e) {
                e.trigger(args);
            }
        };
        /** Registered events */
        VideoEvents.events = new Array(VideoEventType.length);
        return VideoEvents;
    })();
    Helpers.VideoEvents = VideoEvents;
})(Helpers || (Helpers = {}));
/// <reference path="../Helpers/HTML" />
var UI;
(function (UI) {
    var HTML = Helpers.HTML;
    var SimpleElement = (function () {
        /**
         * Create a simple HTML element, that can be part of a Panel
         * @param	tag		Tag name or HTMLElement instance
         * @param	content	Optional textual content of the tag
         */
        function SimpleElement(tag, content) {
            if (tag instanceof HTMLElement) {
                this.element = tag;
            }
            else {
                this.element = HTML.CreateElement(tag);
            }
            if (!!content) {
                this.element.textContent = content;
            }
        }
        /**
         * Getter of the element.
         */
        SimpleElement.prototype.GetHTML = function () { return this.element; };
        /**
         * Add one class to the class attribute of the HTML element.
         */
        SimpleElement.prototype.AddClass = function (className) {
            return this.AddClasses(className);
        };
        /**
         * Add any number of classes to the class attribute of the HTML element.
         */
        SimpleElement.prototype.AddClasses = function () {
            var classes = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                classes[_i - 0] = arguments[_i];
            }
            for (var i = 0; i < classes.length; i++) {
                this.GetHTML().classList.add(classes[i]);
            }
            return this;
        };
        /**
         * Remove one class from the class attribute of the HTML element.
         */
        SimpleElement.prototype.RemoveClass = function (className) {
            return this.RemoveClasses(className);
        };
        /**
         * Remove any number of classes from the class attribute of the HTML element.
         */
        SimpleElement.prototype.RemoveClasses = function () {
            var classes = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                classes[_i - 0] = arguments[_i];
            }
            for (var i = 0; i < classes.length; i++) {
                this.GetHTML().classList.remove(classes[i]);
            }
            return this;
        };
        return SimpleElement;
    })();
    UI.SimpleElement = SimpleElement;
    /**
     * A few concrete UI elements
     */
    /**
     * Basic UI button
     */
    var Button = (function (_super) {
        __extends(Button, _super);
        /**
         * Create a basic button with a text in it
         * @param	text	Button caption
         * @param	onClick	Optional click event handler
         */
        function Button(text, onClick) {
            _super.call(this, "button");
            this.content = new SimpleElement("span", text);
            if (!!onClick) {
                this.GetHTML().onclick = onClick; // no event arguments are passed on purpose
            }
        }
        /**
         * Change the content of the button.
         * @param	content	The content - might be HTML
         */
        Button.prototype.ChangeContent = function (content) {
            this.content.GetHTML().innerHTML = content;
            return this;
        };
        return Button;
    })(Panel);
    UI.Button = Button;
    /**
     * Extended UI button
     */
    var IconButton = (function (_super) {
        __extends(IconButton, _super);
        /**
         * Create a basic button with a text in it
         * @param	iconClass	CSS class of the icon
         * @param	content		The textual content of the button
         * @param	onClick	Optional click event handler
         */
        function IconButton(iconClass, content, onClick) {
            _super.call(this, content, onClick);
            this.iconClass = iconClass;
            // the content isn't a simple text..
            this.icon = new SimpleElement("span", "").AddClasses("icon", iconClass);
            this.AddChild(this.icon)
                .AddClass("has-icon");
        }
        IconButton.prototype.ChangeIcon = function (iconClass) {
            this.icon.RemoveClass(this.iconClass).AddClass(iconClass);
            this.iconClass = iconClass;
            return this;
        };
        return IconButton;
    })(Button);
    UI.IconButton = IconButton;
    var IconOnlyButton = (function (_super) {
        __extends(IconOnlyButton, _super);
        function IconOnlyButton(iconClass, title, onClick) {
            _super.call(this, iconClass, "", onClick); // empty content
            this.ChangeContent(title);
            this.AddClass("ui-button");
        }
        IconOnlyButton.prototype.ChangeContent = function (content) {
            HTML.SetAttributes(this.GetHTML(), { title: content });
            return this;
        };
        return IconOnlyButton;
    })(IconButton);
    UI.IconOnlyButton = IconOnlyButton;
    /**
     * Basic HTML paragraph
     */
    var Paragraph = (function (_super) {
        __extends(Paragraph, _super);
        function Paragraph(text) {
            _super.call(this, "p", text);
        }
        return Paragraph;
    })(SimpleElement);
    UI.Paragraph = Paragraph;
    /**
     * Basic HTML heading
     */
    var Heading = (function (_super) {
        __extends(Heading, _super);
        function Heading(level, text) {
            _super.call(this, "h" + level, text);
        }
        return Heading;
    })(SimpleElement);
    UI.Heading = Heading;
    /**
     * Basic HTML heading of level two
     */
    var H2 = (function (_super) {
        __extends(H2, _super);
        function H2(text) {
            _super.call(this, 2, text);
        }
        return H2;
    })(Heading);
    UI.H2 = H2;
    /**
     * A composite UI element
     */
    var Panel = (function () {
        /**
         * Create a new specific panel
         * @param	tag		The tag name of the panel
         * @param	id		The HTML ID of the panel
         */
        function Panel(tag, id) {
            this.element = HTML.CreateElement(tag);
            if (!!id) {
                HTML.SetAttributes(this.element, { id: id });
            }
            this.elements = [];
        }
        Object.defineProperty(Panel.prototype, "Children", {
            get: function () { return this.elements; },
            enumerable: true,
            configurable: true
        });
        /**
         * Add another element to the collection.
         * @param	btn		Element instance.
         */
        Panel.prototype.AddChild = function (el) {
            return this.AddChildren(el);
        };
        /**
         * Add muiltiple children to the panel.
         * @param	elements	Array of elements
         */
        Panel.prototype.AddChildren = function () {
            var elements = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                elements[_i - 0] = arguments[_i];
            }
            for (var i = 0; i < elements.length; i++) {
                this.elements.push(elements[i]);
                this.GetHTML().appendChild(elements[i].GetHTML());
            }
            return this;
        };
        /**
         * Getter of the element.
         */
        Panel.prototype.GetHTML = function () { return this.element; };
        /**
         * Add one class to the class attribute of the HTML element.
         */
        Panel.prototype.AddClass = function (className) {
            return this.AddClasses(className);
        };
        /**
         * Add any number of classes to the class attribute of the HTML element.
         */
        Panel.prototype.AddClasses = function () {
            var classes = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                classes[_i - 0] = arguments[_i];
            }
            for (var i = 0; i < classes.length; i++) {
                this.GetHTML().classList.add(classes[i]);
            }
            return this;
        };
        /**
         * Remove one class from the class attribute of the HTML element.
         */
        Panel.prototype.RemoveClass = function (className) {
            return this.RemoveClasses(className);
        };
        /**
         * Remove any number of classes from the class attribute of the HTML element.
         */
        Panel.prototype.RemoveClasses = function () {
            var classes = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                classes[_i - 0] = arguments[_i];
            }
            for (var i = 0; i < classes.length; i++) {
                this.GetHTML().classList.remove(classes[i]);
            }
            return this;
        };
        return Panel;
    })();
    UI.Panel = Panel;
})(UI || (UI = {}));
/// <reference path="../Helpers/Vector" />
/// <reference path="../Helpers/Spline" />
var Drawing;
(function (Drawing) {
    var Segment = (function () {
        function Segment() {
        }
        Object.defineProperty(Segment.prototype, "Left", {
            get: function () { throw new Error("Not implemented"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Segment.prototype, "Right", {
            get: function () { throw new Error("Not implemented"); },
            enumerable: true,
            configurable: true
        });
        return Segment;
    })();
    Drawing.Segment = Segment;
    var QuadrilateralSegment = (function (_super) {
        __extends(QuadrilateralSegment, _super);
        function QuadrilateralSegment(left, right) {
            _super.call(this);
            this.left = left;
            this.right = right;
        }
        Object.defineProperty(QuadrilateralSegment.prototype, "Left", {
            get: function () { return this.left; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(QuadrilateralSegment.prototype, "Right", {
            get: function () { return this.right; },
            enumerable: true,
            configurable: true
        });
        return QuadrilateralSegment;
    })(Segment);
    Drawing.QuadrilateralSegment = QuadrilateralSegment;
    var ZeroLengthSegment = (function (_super) {
        __extends(ZeroLengthSegment, _super);
        function ZeroLengthSegment(left, right) {
            _super.call(this, left, right);
        }
        return ZeroLengthSegment;
    })(QuadrilateralSegment);
    Drawing.ZeroLengthSegment = ZeroLengthSegment;
    var CurvedSegment = (function (_super) {
        __extends(CurvedSegment, _super);
        function CurvedSegment(left, right) {
            _super.call(this);
            this.left = left;
            this.right = right;
        }
        Object.defineProperty(CurvedSegment.prototype, "Left", {
            get: function () { return this.left.End; },
            set: function (vec) { this.left.End = vec; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CurvedSegment.prototype, "Right", {
            get: function () { return this.right.End; },
            set: function (vec) { this.right.End = vec; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CurvedSegment.prototype, "LeftBezier", {
            get: function () { return this.left; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CurvedSegment.prototype, "RightBezier", {
            get: function () { return this.right; },
            enumerable: true,
            configurable: true
        });
        return CurvedSegment;
    })(Segment);
    Drawing.CurvedSegment = CurvedSegment;
})(Drawing || (Drawing = {}));
/// <reference path="../Helpers/Vector" />
/// <reference path="../Helpers/SVG" />
/// <reference path="./Segments" />
var Drawing;
(function (Drawing) {
    var SVG = Helpers.SVG;
    var Vector2 = Helpers.Vector2;
    var VideoEvents = Helpers.VideoEvents;
    var VideoEventType = Helpers.VideoEventType;
    var Path = (function () {
        /**
         * Init a new colored path
         */
        function Path(curved, color, wireframe) {
            this.curved = curved;
            this.color = color;
            this.wireframe = wireframe;
            if (this.wireframe === undefined) {
                this.wireframe = false;
            }
            this.segments = [];
            this.pathPoints = [];
        }
        Object.defineProperty(Path.prototype, "Segments", {
            /** Access to all segments of the path. */
            get: function () {
                return this.segments;
            },
            /** Assign set of all segments at once. */
            set: function (value) {
                this.segments = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Path.prototype, "LastDrawnSegment", {
            /** Access the segment that was drawn previousely. */
            get: function () {
                return this.lastDrawnSegment;
            },
            /** Init the last drawn segment position. */
            set: function (value) {
                this.lastDrawnSegment = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Path.prototype, "LastPoint", {
            /** The last point that was drawn */
            get: function () {
                return this.pathPoints[this.iterator];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Path.prototype, "LastButOnePoint", {
            /** The last point that was drawn */
            get: function () {
                return this.pathPoints[Math.max(0, this.iterator - 1)];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Path.prototype, "LastButTwoPoint", {
            /** The last point that was drawn */
            get: function () {
                return this.pathPoints[Math.max(0, this.iterator - 2)];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Path.prototype, "Color", {
            /**
             * Path of the color fill.
             */
            get: function () {
                return this.color;
            },
            enumerable: true,
            configurable: true
        });
        Path.prototype.StartPath = function (pt, radius) {
            this.segments = [new Drawing.ZeroLengthSegment(pt.clone().add(new Vector2(0, radius)), pt.clone().add(new Vector2(0, -radius)))];
            this.startPosition = pt;
            this.startRadius = radius;
            this.iterator = -1;
            this.DrawStartDot(pt, radius);
            this.lastDrawnSegment = this.segments[0];
        };
        Path.prototype.DrawStartDot = function (pt, radius) {
            throw new Error("Not impelmented");
        };
        /**
         * Before rendering the first segment, save the coordinates of the left and right
         * point as soon, as the direction is known.
         */
        Path.prototype.InitPath = function (right, left) {
            this.segments = [new Drawing.ZeroLengthSegment(left, right)]; // override the first segment
            this.pathPoints.push({ Left: left, Right: right });
            this.iterator = 0;
        };
        Path.prototype.StartDrawingPath = function (seg) {
            this.DrawStartDot(seg.Left.pointInBetween(seg.Right), seg.Left.distanceTo(seg.Right) / 2);
            this.lastDrawnSegment = seg;
        };
        /**
         * Draw another segment of current path.
         * @param	{Vector2}	right	"Right" point of the segment.
         * @param	{Vector2}	left	"Left"	point of the segment.
         */
        Path.prototype.ExtendPath = function (right, left) {
            // draw the segment
            var segment = this.CalculateSegment(right, left);
            this.DrawSegment(segment);
            VideoEvents.trigger(VideoEventType.DrawSegment, segment);
            // and push it to the list
            this.segments.push(segment);
            this.pathPoints.push({ Left: left, Right: right });
            this.iterator++;
        };
        Path.prototype.CalculateSegment = function (right, left) {
            if (this.curved) {
                return this.CalculateCurvedSegment(right, left);
            }
            return this.CalculateQuarilateralSegment(right, left);
        };
        Path.prototype.CalculateCurvedSegment = function (right, left) {
            var leftBezier = Helpers.Spline.catmullRomToBezier(this.LastButTwoPoint.Left, this.LastButOnePoint.Left, this.LastPoint.Left, left);
            var rightBezier = Helpers.Spline.catmullRomToBezier(this.LastButTwoPoint.Right, this.LastButOnePoint.Right, this.LastPoint.Right, right);
            var segment = new Drawing.CurvedSegment(leftBezier, rightBezier);
            this.DrawCurvedSegment(segment);
            return segment;
        };
        /**
         *
         */
        Path.prototype.DrawCurvedSegment = function (segment) {
            throw new Error("Not implemented");
        };
        /**
         *
         */
        Path.prototype.CalculateQuarilateralSegment = function (right, left) {
            return new Drawing.QuadrilateralSegment(left, right);
        };
        /**
         *
         */
        Path.prototype.DrawQuadrilateralSegment = function (segment) {
            throw new Error("Not implemented");
        };
        /**
         *
         */
        Path.prototype.Draw = function () {
            // This si up to concrete ancestors..
        };
        Path.prototype.DrawSegment = function (seg) {
            if (seg instanceof Drawing.CurvedSegment) {
                this.DrawCurvedSegment(seg);
            }
            else if (seg instanceof Drawing.QuadrilateralSegment) {
                this.DrawQuadrilateralSegment(seg);
            }
            this.lastDrawnSegment = seg;
        };
        /**
         * Helper functions for determining, what is the angle between the x axis and vector in radians.
         * Math.atan(vec) function does this, but the angle is counterclockwise and rotated by PI/2...
         */
        Path.angle = function (vec) {
            return Math.atan2(-vec.X, vec.Y) - Math.PI / 2; /// :-) 
        };
        /**
         * Draw everything from the begining
         */
        Path.prototype.DrawWholePath = function () {
            this.iterator = 0;
            // if there's nothing to draw, run away!
            if (this.segments.length === 0)
                return;
            var start = this.segments[0].Left.clone().add(this.segments[0].Right).scale(0.5);
            var radius = start.distanceTo(this.segments[0].Left);
            this.DrawStartDot(start, radius);
            this.lastDrawnSegment = this.segments[0];
            while (this.iterator < this.segments.length) {
                this.DrawSegment(this.segments[this.iterator++]);
            }
            this.Draw(); // flush
        };
        return Path;
    })();
    Drawing.Path = Path;
    var SvgPath = (function (_super) {
        __extends(SvgPath, _super);
        /**
         * Initialise new SVG path
         */
        function SvgPath(curved, color, canvas) {
            _super.call(this, curved, color);
            this.canvas = canvas;
        }
        SvgPath.prototype.DrawStartDot = function (position, radius) {
            this.path = this.CreatePathElement();
            // arc cap at the start
            var left = new Vector2(position.X - radius, position.Y);
            var right = new Vector2(position.X + radius, position.Y);
            var center = right.pointInBetween(left);
            var startDirection = left.clone().subtract(center);
            var endDirection = right.clone().subtract(center);
            var arc = SVG.ArcString(right, center.distanceTo(right), Path.angle(startDirection));
            // prepare paths
            this.right = SVG.MoveToString(right);
            this.left = SVG.LineToString(left) + " " + arc;
            this.cap = SVG.ArcString(left, center.distanceTo(left), Path.angle(endDirection));
            SVG.SetAttributes(this.path, { d: this.right + this.cap + this.left });
            // connect SVG's with the canvas				
            this.canvas.appendChild(this.path);
        };
        /**
         * Before rendering the first segment, save the coordinates of the left and right
         * point as soon, as the direction is known.
         */
        SvgPath.prototype.InitPath = function (right, left) {
            _super.prototype.InitPath.call(this, right, left);
            this.StartDrawingPath(this.segments[0]);
        };
        SvgPath.prototype.CreatePathElement = function () {
            var options;
            if (this.wireframe) {
                // "wireframe" is better for debuging:
                options = {
                    "stroke": this.color,
                    "stroke-width": 1
                };
            }
            else {
                // filled shape is necessary for production:
                options = {
                    "fill": this.color
                };
            }
            return SVG.CreateElement("path", options);
        };
        /**
         * Extend the SVG path with a curved segment.
         */
        SvgPath.prototype.DrawCurvedSegment = function (segment) {
            this.right += SVG.CurveToString(segment.RightBezier.StartCP, segment.RightBezier.EndCP, segment.RightBezier.End);
            this.left = SVG.CurveToString(segment.LeftBezier.EndCP, segment.LeftBezier.StartCP, segment.LeftBezier.Start) + " " + this.left;
            // A] - a simple line at the end of the line 
            // this.cap = SVG.LineToString(left);
            // B] - an "arc cap"
            var center = segment.Right.pointInBetween(segment.Left);
            var startDirection = segment.Right.clone().subtract(center);
            var endDirection = segment.Left.clone().subtract(center);
            this.cap = SVG.ArcString(segment.Left, center.distanceTo(segment.Left), Path.angle(startDirection));
        };
        /**
         * Extend the SVG path with a quadrilateral segment
         */
        SvgPath.prototype.DrawQuadrilateralSegment = function (segment) {
            this.right += SVG.LineToString(segment.Right);
            this.left = SVG.LineToString(this.lastDrawnSegment.Left) + " " + this.left;
            // A] - a simple line at the end of the line 
            // this.cap = SVG.LineToString(left);
            // B] - an "arc cap"
            var center = segment.Right.clone().add(segment.Left).scale(0.5);
            var startDirection = segment.Right.clone().subtract(center);
            //var endDirection: Vector2 = segment.Left.clone().subtract(center);
            this.cap = SVG.ArcString(segment.Left, center.distanceTo(segment.Left), Path.angle(startDirection));
        };
        /**
         * Create path string.
         */
        SvgPath.prototype.GetPathString = function () {
            return this.right + this.cap + this.left;
        };
        /**
         * Promote the curve to the DOM
         */
        SvgPath.prototype.Draw = function () {
            SVG.SetAttributes(this.path, {
                d: this.GetPathString()
            });
        };
        return SvgPath;
    })(Path);
    Drawing.SvgPath = SvgPath;
    var CanvasPath = (function (_super) {
        __extends(CanvasPath, _super);
        /** Init empty path */
        function CanvasPath(curved, color, context) {
            _super.call(this, curved, color);
            this.context = context;
            this.context.fillStyle = this.color;
        }
        CanvasPath.prototype.DrawStartDot = function (position, radius) {
            // now draw the start dot
            this.context.beginPath();
            this.DrawDot(position, radius);
            this.Draw();
        };
        /**
         * Helper function that draws a dot of the curve's color
         * with specified radius in the given point.
         */
        CanvasPath.prototype.DrawDot = function (c, r) {
            this.context.arc(c.X, c.Y, r, 0, 2 * Math.PI, true);
        };
        /**
         * Draw a simple quadrilateral segment
         */
        CanvasPath.prototype.DrawQuadrilateralSegment = function (segment) {
            this.context.moveTo(this.lastDrawnSegment.Right.X, this.lastDrawnSegment.Right.Y);
            this.context.lineTo(this.lastDrawnSegment.Left.X, this.lastDrawnSegment.Left.Y);
            this.context.lineTo(segment.Left.X, segment.Left.Y);
            // an "arc cap"
            var center = segment.Left.pointInBetween(segment.Right);
            var startDirection = segment.Right.clone().subtract(center);
            var endDirection = segment.Left.clone().subtract(center);
            this.context.arc(center.X, center.Y, center.distanceTo(segment.Left), Path.angle(startDirection), Path.angle(endDirection), false);
            //		
        };
        /**
         * Draw a curved segment using bezier curves.
         */
        CanvasPath.prototype.DrawCurvedSegment = function (segment) {
            this.context.moveTo(segment.RightBezier.Start.X, segment.RightBezier.Start.Y);
            this.context.lineTo(segment.LeftBezier.Start.X, segment.LeftBezier.Start.Y);
            // left curve
            this.context.bezierCurveTo(segment.LeftBezier.StartCP.X, segment.LeftBezier.StartCP.Y, segment.LeftBezier.EndCP.X, segment.LeftBezier.EndCP.Y, segment.LeftBezier.End.X, segment.LeftBezier.End.Y);
            // A] - an "arc cap"
            var center = segment.RightBezier.End.pointInBetween(segment.LeftBezier.End);
            var startDirection = segment.RightBezier.End.clone().subtract(center);
            var endDirection = segment.LeftBezier.End.clone().subtract(center);
            this.context.arc(center.X, center.Y, center.distanceTo(segment.LeftBezier.End), Path.angle(startDirection), Path.angle(endDirection), false);
            // B] - line cap	
            // this.context.lineTo(segment.RightBezier.End.X, segment.RightBezier.End.Y);
            // right curve
            this.context.bezierCurveTo(segment.RightBezier.EndCP.X, segment.RightBezier.EndCP.Y, segment.RightBezier.StartCP.X, segment.RightBezier.StartCP.Y, segment.RightBezier.Start.X, segment.RightBezier.Start.Y);
        };
        /**
         * Fill all drawn segments
         */
        CanvasPath.prototype.Draw = function () {
            this.context.closePath();
            this.context.fill();
            this.context.beginPath();
        };
        return CanvasPath;
    })(Path);
    Drawing.CanvasPath = CanvasPath;
})(Drawing || (Drawing = {}));
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
            if (curved === void 0) { curved = true; }
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
            var wr = this.svg.clientWidth / sourceWidth;
            var hr = this.svg.clientHeight / sourceHeight;
            var min = Math.min(wr, hr);
            // prepare scaling and translating
            SVG.SetAttributes(this.svg, {
                //"viewBox": `${this.svg.clientWidth - (min * sourceWidth / 2)} ${this.svg.clientHeight - (min * sourceHeight / 2)}  ${this.svg.clientWidth * min} ${this.svg.clientHeight * min}`
                "viewBox": "0 0 " + sourceWidth * min + " " + sourceHeight * min
            });
            return min;
        };
        return SVGDrawer;
    })();
    Drawing.SVGDrawer = SVGDrawer;
})(Drawing || (Drawing = {}));
/// <reference path="../Drawing/DrawingStrategy" />
/// <reference path="../Localization/IPlayerLocalization" />
/// <reference path="BasicElements" />
/// <reference path="Color" />
/// <reference path="Brush" />
/// <reference path="../Helpers/HTML" />
/// <reference path="../Helpers/VideoEvents" />
var UI;
(function (UI) {
    var VideoEvents = Helpers.VideoEvents;
    var VideoEventType = Helpers.VideoEventType;
    /**
     * Recorder button - change brush color when clicked
     */
    var ChangeColorButton = (function (_super) {
        __extends(ChangeColorButton, _super);
        function ChangeColorButton(color, callback) {
            var _this = this;
            _super.call(this, ""); // empty text			
            this.SetColor(color);
            // announce color change when the button is clicked
            this.GetHTML().onclick = function (e) { return !!callback ? callback() : _this.ChangeColor(e); }; // if there is some expicit callback, then call it
        }
        /**
         * Announce color change
         */
        ChangeColorButton.prototype.ChangeColor = function (e) {
            // mark this button as active and remove the emphasis from the previous one
            if (!!ChangeColorButton.active) {
                ChangeColorButton.active.GetHTML().classList.remove("active");
            }
            this.GetHTML().classList.add("active");
            // announce the change
            ChangeColorButton.active = this;
            VideoEvents.trigger(VideoEventType.ChangeColor, this.color);
        };
        ChangeColorButton.prototype.SetColor = function (color) {
            this.color = color;
            // make the button a color option
            Helpers.HTML.SetAttributes(this.GetHTML(), {
                class: "option",
                "data-color": color.CssValue,
                title: color.Name,
                style: "background-color: " + color.CssValue
            });
        };
        return ChangeColorButton;
    })(UI.Button);
    UI.ChangeColorButton = ChangeColorButton;
    /**
     * Recorder button - change brush color when clicked
     */
    var ChangeBrushSizeButton = (function (_super) {
        __extends(ChangeBrushSizeButton, _super);
        function ChangeBrushSizeButton(size) {
            var _this = this;
            _super.call(this, ""); // empty text			
            this.size = size;
            // there will be a dot corresponding to the brush size
            var dot = Helpers.HTML.CreateElement("span", {
                style: "width: " + size.CssValue + ";\t\n\t\t\t\t\t\theight: " + size.CssValue + ";\n\t\t\t\t\t\tborder-radius: " + size.Size / 2 + size.Unit + "; \n\t\t\t\t\t\tdisplay: inline-block;\n\t\t\t\t\t\tbackground: black;\n\t\t\t\t\t\tmargin-top: " + -size.Size / 2 + size.Unit + ";",
                class: "dot",
                "data-size": size.Size
            });
            //dot.textContent = size.Size.toString();
            this.GetHTML().appendChild(dot);
            // make the button a color option
            Helpers.HTML.SetAttributes(this.GetHTML(), {
                class: "option",
                "data-size": size.Size,
                title: size.Name
            });
            // announce color change when the button is clicked
            this.GetHTML().onclick = function (e) { return _this.ChangeColor(e); };
        }
        /**
         * Announce color change
         */
        ChangeBrushSizeButton.prototype.ChangeColor = function (e) {
            // do not draw a dot behind the bar
            e.preventDefault();
            // mark this button as active and remove the emphasis from the previous one
            if (!!ChangeBrushSizeButton.active) {
                ChangeBrushSizeButton.active.GetHTML().classList.remove("active");
            }
            this.GetHTML().classList.add("active");
            // announce the change
            ChangeBrushSizeButton.active = this;
            VideoEvents.trigger(VideoEventType.ChangeBrushSize, this.size);
        };
        return ChangeBrushSizeButton;
    })(UI.Button);
    UI.ChangeBrushSizeButton = ChangeBrushSizeButton;
})(UI || (UI = {}));
/// <reference path="BasicElements.ts" />
/// <reference path="Color.ts" />
/// <reference path="../Helpers/HTML.ts" />
/// <reference path="../Helpers/SVG.ts" />
var UI;
(function (UI) {
    var Vector2 = Helpers.Vector2;
    /**
     * Cursor implementation.
     */
    var Cursor = (function (_super) {
        __extends(Cursor, _super);
        /**
         * Initialise a cursor. It's size and color must be explicitely changed before using it though!
         */
        function Cursor() {
            _super.call(this, "div");
            this.radius = 20;
            this.stroke = 3;
            this.position = new Vector2(0, 0);
            this.CreateHTML();
            this.scalingFactor = 1;
            this.size = null;
        }
        /**
         * Prepares the cursor shape - a dot, but with zero size and no specific color (default white)
         */
        Cursor.prototype.CreateHTML = function () {
            var _this = this;
            this.svg = Helpers.SVG.CreateElement("svg", {
                width: 2 * this.radius,
                height: 2 * this.radius
            });
            this.GetHTML().appendChild(this.svg);
            // draw the dot at the center of the SVG element
            this.bgColor = UI.Color.BackgroundColor;
            this.color = UI.Color.ForegroundColor;
            this.dot = Helpers.SVG.CreateDot(new Helpers.Vector2(this.radius, this.radius), this.radius - this.stroke, this.bgColor.CssValue);
            Helpers.SVG.SetAttributes(this.dot, {
                "stroke": this.color.CssValue,
                "stroke-width": this.stroke
            });
            this.svg.appendChild(this.dot);
            // I want to move the cursor to any point - access directly the HTML style attribute
            this.GetHTML().style.position = "absolute";
            this.GetHTML().style.background = "transparent";
            this.GetHTML().style.lineHeight = "0";
            Helpers.VideoEvents.on(Helpers.VideoEventType.ClearCanvas, function (color) {
                _this.bgColor = color;
                Helpers.SVG.SetAttributes(_this.dot, { fill: _this.bgColor.CssValue });
                _this.ChangeColor(_this.color); // make sure the border color is contrastant
            });
        };
        /**
         * Move the cursor to a specified position.
         * @param	x	X coordinate of cursor center
         * @param	y	Y coordinate of cursor center
         */
        Cursor.prototype.MoveTo = function (x, y) {
            this.GetHTML().style.left = (x * this.scalingFactor - this.radius - this.stroke) + "px";
            this.GetHTML().style.top = (y * this.scalingFactor - this.radius - this.stroke) + "px";
            this.position = new Helpers.Vector2(x, y);
        };
        /**
         * Change the color of brush outline according to current settings.
         */
        Cursor.prototype.ChangeColor = function (color) {
            if (color.CssValue === this.bgColor.CssValue) {
                color = color.CssValue === UI.Color.ForegroundColor.CssValue ? UI.Color.BackgroundColor : UI.Color.ForegroundColor; // make it inverse
            }
            Helpers.SVG.SetAttributes(this.dot, {
                stroke: color.CssValue
            });
            this.color = color;
        };
        /**
         * Resize the brush according to current settings.
         */
        Cursor.prototype.ChangeSize = function (size) {
            this.size = size; // update the last size scaled to
            var originalRadius = this.radius;
            this.radius = (size.Size * this.scalingFactor) / 2 - 2; // make the cursor a bit smaller than the path it will draw
            // resize the whole SVG element
            var calculatedSize = 2 * (this.radius + this.stroke);
            Helpers.SVG.SetAttributes(this.svg, {
                width: calculatedSize,
                height: calculatedSize
            });
            // also correct the element's position, so the center of the dot stays where it was
            var shift = originalRadius - this.radius; // (when shrinking - positive, when expanding - negative)
            this.MoveTo(this.position.X + shift, this.position.Y + shift);
            // scale the dot
            Helpers.SVG.SetAttributes(this.dot, {
                cx: calculatedSize / 2,
                cy: calculatedSize / 2,
                r: Math.max(1, this.radius - this.stroke) // do not allow zero or even negative radius
            });
        };
        /**
         * Set new cursor scaling factor to match the dimensions of the canvas and resize the cursor immediately.
         */
        Cursor.prototype.SetScalingFactor = function (sf) {
            this.scalingFactor = sf;
            if (!!this.size) {
                this.ChangeSize(this.size);
            }
        };
        return Cursor;
    })(UI.SimpleElement);
    UI.Cursor = Cursor;
})(UI || (UI = {}));
/// <reference path="BasicElements" />
/// <reference path="Cursor" />
/// <reference path="Color" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="../Helpers/State" />
/// <reference path="../Helpers/HTML" />
var UI;
(function (UI) {
    var HTML = Helpers.HTML;
    var VideoEvents = Helpers.VideoEvents;
    var VideoEventType = Helpers.VideoEventType;
    /**
     * The board itself.
     */
    var Board = (function (_super) {
        __extends(Board, _super);
        /**
         * Create a new board
         * @param	id	HTML element id attribute value
         */
        function Board(id) {
            var _this = this;
            _super.call(this, "div", id); // Panel
            HTML.SetAttributes(this.GetHTML(), { class: "vector-video-board" });
            // create a cursor 
            this.cursor = new UI.Cursor();
            this.AddChild(this.cursor);
            // make board's position relative for the cursor			
            HTML.SetAttributes(this.GetHTML(), { position: "relative" });
            // move the cursor
            VideoEvents.on(VideoEventType.CursorState, function (state) { return _this.UpdateCursorPosition(state); });
            VideoEvents.on(VideoEventType.CursorState, function (state) { return _this.UpdateCursorPosition(state); });
            VideoEvents.on(VideoEventType.ChangeBrushSize, function (state) { return _this.UpdateCursorSize(state); });
            VideoEvents.on(VideoEventType.ChangeColor, function (state) { return _this.UpdateCursorColor(state); });
            VideoEvents.on(VideoEventType.ChangeColor, function (state) { return _this.UpdateCursorColor(state); });
            VideoEvents.on(VideoEventType.CanvasScalingFactor, function (scalingFactor) { return _this.UpdateCursorScale(scalingFactor); });
        }
        Object.defineProperty(Board.prototype, "Width", {
            /** Get the width of the board in pixels */
            get: function () {
                return this.GetHTML().clientWidth;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Board.prototype, "Height", {
            /** Get the height of the board in pixels */
            get: function () {
                return this.GetHTML().clientHeight;
            },
            /** Set the height of the board in pixels */
            set: function (height) {
                this.GetHTML().clientHeight = height;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Board.prototype, "IsRecording", {
            /** Get the color of the board */
            set: function (isRecording) {
                isRecording ? this.GetHTML().classList.add("recording") : this.GetHTML().classList.remove("recording");
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Position the element
         */
        Board.prototype.UpdateCursorPosition = function (state) {
            this.cursor.MoveTo(state.X, state.Y); // @todo: correct the position
        };
        /**
         * Position the element
         */
        Board.prototype.UpdateCursorSize = function (size) {
            this.cursor.ChangeSize(size);
        };
        /**
         *
         */
        Board.prototype.UpdateCursorColor = function (color) {
            this.cursor.ChangeColor(color);
        };
        /**
         * Position the element
         */
        Board.prototype.UpdateCursorScale = function (scalingFactor) {
            this.cursor.SetScalingFactor(scalingFactor);
        };
        return Board;
    })(UI.Panel);
    UI.Board = Board;
})(UI || (UI = {}));
/// <references path="BasicElements" />
/// <references path="../Helpers/VideoEvents" />
var UI;
(function (UI) {
    var VideoEvents = Helpers.VideoEvents;
    var VideoEventType = Helpers.VideoEventType;
    var TimeLine = (function (_super) {
        __extends(TimeLine, _super);
        function TimeLine(id) {
            var _this = this;
            _super.call(this, "div", id);
            this.length = 0;
            //
            this.GetHTML().classList.add("ui-progressbar");
            // create progress bar
            var bar = new UI.SimpleElement("div");
            bar.GetHTML().classList.add("ui-progress");
            this.progresbar = bar;
            this.AddChild(bar);
            // create progress bar
            bar = new UI.SimpleElement("div");
            bar.GetHTML().classList.add("ui-buffer");
            this.bufferbar = bar;
            this.AddChild(bar);
            // skipping helper
            this.arrow = new UI.SimpleElement("div", "0:00");
            this.arrow.GetHTML().classList.add("ui-arrow");
            this.AddChild(this.arrow);
            // init progresbar with
            this.Sync(0);
            // change video position, when the bar is clicked
            this.GetHTML().onclick = function (e) { return _this.OnClick(e); };
            this.GetHTML().onmousemove = function (e) { return _this.OnMouseMove(e); };
        }
        Object.defineProperty(TimeLine.prototype, "Length", {
            set: function (length) { this.length = length; },
            enumerable: true,
            configurable: true
        });
        /**
         * Skip to given moment after user clicks on the timeline
         */
        TimeLine.prototype.OnClick = function (e) {
            var time = (e.clientX - this.GetHTML().clientLeft) / this.GetHTML().clientWidth * this.length;
            this.SkipTo(time);
        };
        /**
         * Show the user an information about the point he is pointing to
         */
        TimeLine.prototype.OnMouseMove = function (e) {
            var progress = (e.clientX - this.GetHTML().clientLeft) / this.GetHTML().clientWidth;
            var time = Helpers.millisecondsToString(progress * this.length);
            this.arrow.GetHTML().textContent = time;
            this.arrow.GetHTML().style.left = progress * 100 + "%";
            var rect = this.arrow.GetHTML().getBoundingClientRect();
            if (rect.left < 0) {
                this.arrow.GetHTML().style.left = rect.width / 2 + "px";
            }
            else if (rect.right > this.GetHTML().getBoundingClientRect().right) {
                this.arrow.GetHTML().style.left = (this.GetHTML().getBoundingClientRect().right - (rect.width / 2)) + "px";
            }
        };
        /**
         * Synchronize progress bar width with current time
         * @param	{number} 	time	What is the current progress in milliseconds.
         */
        TimeLine.prototype.Sync = function (time) {
            this.progresbar.GetHTML().style.width = this.length > 0 ? time / this.length * 100 + "%" : "O%";
        };
        /**
         * Synchronize buffer bar width with current time
         * @param	{number} 	time	How much is loaded in seconds.
         */
        TimeLine.prototype.SetBuffer = function (time) {
            this.bufferbar.GetHTML().style.width = this.length > 0 ? time / this.length * 100 + "%" : "O%";
        };
        /**
         * @param	time	Time in milliseconds
         */
        TimeLine.prototype.SkipTo = function (time) {
            // triger an event...			
            VideoEvents.trigger(VideoEventType.JumpTo, time / this.length);
            // sync self
            this.Sync(time);
        };
        return TimeLine;
    })(UI.Panel);
    UI.TimeLine = TimeLine;
})(UI || (UI = {}));
/// <reference path="BasicElements" />
/// <reference path="Buttons" />
/// <reference path="Color" />
/// <reference path="Brush" />
/// <reference path="Board" />
/// <reference path="TimeLine" />
/// <reference path="../Helpers/HelperFunctions" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="../Localization/IPlayerLocalization" />
var UI;
(function (UI) {
    var VideoEvents = Helpers.VideoEvents;
    var VideoEventType = Helpers.VideoEventType;
    /**
     * This class wraps the whole UI of the recorder.
     */
    var PlayerUI = (function (_super) {
        __extends(PlayerUI, _super);
        /**
         * Create a new instance of Player UI
         * @param	id				Unique ID of this recorder instance
         * @param	localization	List of translated strings
         */
        function PlayerUI(id, localization, timer) {
            var _this = this;
            _super.call(this, "div", id + "-player");
            this.id = id;
            this.localization = localization;
            this.timer = timer;
            /** Ticking interval - not too often, but precise enough */
            this.tickingInterval = 200;
            this.AddClass("vector-video-wrapper");
            Helpers.HTML.SetAttributes(this.GetHTML(), { "data-busy-string": this.localization.Busy });
            // prepare the board
            this.board = this.CreateBoard();
            // prepare the panels
            this.timeline = this.CreateTimeLine();
            this.controls = new UI.Panel("div", id + "-controls")
                .AddChildren(this.CreateButtonsPanel(), this.timeline, this.CreateTimeStatus(), this.CreateAudioControls())
                .AddClasses("vector-video-controls", "autohide", "ui-control");
            this.AddChildren(this.board, this.controls);
            // Set the duration of the video as soon as available
            VideoEvents.on(VideoEventType.VideoInfoLoaded, function (meta) {
                _this.videoDuration = meta.Length;
                _this.totalTime.GetHTML().textContent = Helpers.millisecondsToString(meta.Length);
                _this.timeline.Length = meta.Length;
            });
            VideoEvents.on(VideoEventType.BufferStatus, function (seconds) { return _this.timeline.SetBuffer(seconds * 1000); }); // convert to milliseconds first
            // React to events triggered from outside
            VideoEvents.on(VideoEventType.Start, function () { return _this.StartPlaying(); });
            VideoEvents.on(VideoEventType.Pause, function () { return _this.PausePlaying(); });
            VideoEvents.on(VideoEventType.ReachEnd, function () { return _this.ReachedEnd(); });
            VideoEvents.on(VideoEventType.ClearCanvas, function (c) { return _this.GetHTML().style.backgroundColor = c.CssValue; }); // make the bg of the player match the canvas 
            // allow keyboard
            this.BindKeyboardShortcuts();
            // set current state
            this.isPlaying = false;
            this.reachedEnd = false;
        }
        PlayerUI.prototype.HideControls = function () {
            this.controls.GetHTML().style.display = "none";
        };
        PlayerUI.prototype.ShowControls = function () {
            this.controls.GetHTML().style.display = "block";
        };
        /**
         *
         */
        PlayerUI.prototype.BindKeyboardShortcuts = function () {
            var _this = this;
            var spacebar = 32;
            var leftArrow = 37;
            var rightArrow = 39;
            var skipTime = 5000; // 5 seconds
            window.onkeyup = function (e) {
                switch (e.keyCode) {
                    case spacebar:
                        _this.PlayPause();
                        break;
                    case leftArrow:
                        _this.timeline.SkipTo(_this.timer.CurrentTime() - skipTime);
                        break;
                    case rightArrow:
                        _this.timeline.SkipTo(_this.timer.CurrentTime() + skipTime);
                        break;
                }
            };
        };
        /**
         * Integrate the canvas into the UI elements tree
         */
        PlayerUI.prototype.AcceptCanvas = function (canvas) {
            this.board.GetHTML().appendChild(canvas);
        };
        /**
         * Create the
         */
        PlayerUI.prototype.CreateBoard = function () {
            var board = new UI.Board(this.id + "-board");
            return board;
        };
        /**
         * Create a panel containing the PLAY/PAUSE button and the upload button.
         */
        PlayerUI.prototype.CreateButtonsPanel = function () {
            var _this = this;
            this.playPauseButton = new UI.IconOnlyButton("icon-play", this.localization.Play, function (e) { return _this.PlayPause(); });
            return new UI.Panel("div")
                .AddChildren(new UI.H2(this.localization.ControlPlayback), this.playPauseButton)
                .AddClass("ui-controls-panel");
        };
        /**
         * This function is called when the PLAY/PAUSE button is clicked.
         */
        PlayerUI.prototype.PlayPause = function () {
            if (this.reachedEnd) {
                this.reachedEnd = false;
                this.timeline.SkipTo(0); // jump to the start				
                VideoEvents.trigger(VideoEventType.Start);
                return;
            }
            if (this.isPlaying === true) {
                this.PausePlaying();
                VideoEvents.trigger(VideoEventType.Pause);
            }
            else {
                this.StartPlaying();
                VideoEvents.trigger(VideoEventType.Start);
            }
        };
        /**
         * Start (or continue) recording
         */
        PlayerUI.prototype.StartPlaying = function () {
            var _this = this;
            this.isPlaying = true;
            this.playPauseButton.ChangeIcon("icon-pause");
            this.playPauseButton.ChangeContent(this.localization.Pause);
            this.AddClass("playing");
            // update time periodically
            this.ticking = setInterval(function () { return _this.UpdateCurrentTime(); }, this.tickingInterval);
        };
        /**
         * Pause playback
         */
        PlayerUI.prototype.PausePlaying = function () {
            this.isPlaying = false;
            this.playPauseButton.ChangeIcon("icon-play");
            this.playPauseButton.ChangeContent(this.localization.Play);
            this.RemoveClass("playing");
            // do not update the status and timeline while paused
            clearInterval(this.ticking);
        };
        PlayerUI.prototype.CreateTimeLine = function () {
            return new UI.TimeLine(this.id + "-timeline");
        };
        PlayerUI.prototype.CreateTimeStatus = function () {
            this.currentTime = new UI.SimpleElement("span", "0:00");
            this.totalTime = new UI.SimpleElement("span", "0:00");
            return new UI.Panel("div")
                .AddChildren(new UI.H2(this.localization.TimeStatus), this.currentTime, new UI.SimpleElement("span", " / "), this.totalTime)
                .AddClasses("ui-controls-panel", "ui-time");
        };
        /**
         * @param	time	Current time in seconds
         */
        PlayerUI.prototype.UpdateCurrentTime = function () {
            this.currentTime.GetHTML().textContent = Helpers.millisecondsToString(this.timer.CurrentTime());
            this.timeline.Sync(this.timer.CurrentTime());
        };
        /**
         * React to end of playing - show the replay button
         */
        PlayerUI.prototype.ReachedEnd = function () {
            this.PausePlaying();
            this.playPauseButton.ChangeIcon("icon-replay").ChangeContent(this.localization.Replay);
            this.reachedEnd = true;
        };
        /**
         * Busy/Ready states
         */
        PlayerUI.prototype.Busy = function () {
            this.AddClass("busy");
        };
        PlayerUI.prototype.Ready = function () {
            this.RemoveClass("busy");
        };
        /**
         * Volume controls
         */
        PlayerUI.prototype.CreateAudioControls = function () {
            var _this = this;
            return new UI.Panel("div", this.id + "-audio")
                .AddChildren(new UI.H2(this.localization.VolumeControl), new UI.Panel("div", this.id + "-audio-controls")
                .AddChildren(new UI.IconOnlyButton("icon-volume-down", this.localization.VolumeDown, function (e) { return _this.VolumeDown(); }), new UI.IconOnlyButton("icon-volume-up", this.localization.VolumeUp, function (e) { return _this.VolumeUp(); }), new UI.IconOnlyButton("icon-mute", this.localization.Mute, function (e) { return _this.Mute(); }))
                .AddClass("btn-group"))
                .AddClasses("ui-controls-panel", "vector-video-audio-controls");
        };
        PlayerUI.prototype.VolumeUp = function () {
            VideoEvents.trigger(VideoEventType.VolumeUp);
        };
        PlayerUI.prototype.VolumeDown = function () {
            VideoEvents.trigger(VideoEventType.VolumeDown);
        };
        PlayerUI.prototype.Mute = function () {
            VideoEvents.trigger(VideoEventType.Mute);
        };
        return PlayerUI;
    })(UI.Panel);
    UI.PlayerUI = PlayerUI;
})(UI || (UI = {}));
/// <reference path="../Helpers/HTML.ts" />
/// <reference path="../Helpers/VideoEvents.ts" />
var AudioData;
(function (AudioData) {
    var VideoEvents = Helpers.VideoEvents;
    var VideoEventType = Helpers.VideoEventType;
    var Errors = Helpers.Errors;
    var ErrorType = Helpers.ErrorType;
    /**
     * Enumeration of supported audio types.
     */
    (function (AudioSourceType) {
        AudioSourceType[AudioSourceType["MP3"] = 0] = "MP3";
        AudioSourceType[AudioSourceType["OGG"] = 1] = "OGG";
        AudioSourceType[AudioSourceType["WAV"] = 2] = "WAV";
    })(AudioData.AudioSourceType || (AudioData.AudioSourceType = {}));
    var AudioSourceType = AudioData.AudioSourceType;
    /**
     * Class representing one audio source.
     */
    var AudioSource = (function () {
        function AudioSource(url, type) {
            this.url = url;
            this.type = type;
        }
        Object.defineProperty(AudioSource.prototype, "Url", {
            /** Read only audio URL. */
            get: function () { return this.url; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AudioSource.prototype, "Type", {
            /** Read only information about the type of the source. */
            get: function () { return this.type; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AudioSource.prototype, "MimeType", {
            /** The MIME type of the audio source. */
            get: function () {
                switch (this.type) {
                    case AudioSourceType.MP3:
                        return "audio/mp3";
                    case AudioSourceType.OGG:
                        return "audio/ogg";
                    case AudioSourceType.WAV:
                        return "audio/wav";
                    default:
                        return null;
                }
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Convert the MIME type to AudioSourceType
         * @param 	type 	Audio MIME type
         * @return			The appropriate audio source type enum item
         */
        AudioSource.StringToType = function (type) {
            switch (type) {
                case "audio/mp3":
                    return AudioSourceType.MP3;
                case "audio/wav":
                    return AudioSourceType.WAV;
                case "audio/ogg":
                    return AudioSourceType.OGG;
                default:
                    throw new Error("Unknown audio type " + type);
            }
        };
        return AudioSource;
    })();
    AudioData.AudioSource = AudioSource;
    /**
     * This is the audio player
     */
    var AudioPlayer = (function () {
        function AudioPlayer(sources) {
            // create audio element
            this.audio = this.CreateAudio(sources);
            if (this.audio === null) {
                this.isReady = false;
            }
            else {
                // the audio is stopped when the page is loaded
                this.playing = false;
                this.reachedEnd = false;
                // init was successful
                this.InitAudio();
                this.isReady = true;
                // attach the player to the document
                document.documentElement.appendChild(this.audio);
                console.log("Audio is available.");
            }
        }
        Object.defineProperty(AudioPlayer.prototype, "IsReady", {
            get: function () { return this.isReady; },
            enumerable: true,
            configurable: true
        });
        /**
         * Create an audio element and attach supported
         */
        AudioPlayer.prototype.CreateAudio = function (sources) {
            try {
                var audio = new Audio();
                if (!audio.canPlayType) {
                    Errors.Report(ErrorType.Warning, "AudioPlayer: browser does not support HTML5 audio");
                    return null;
                }
                var canPlayAtLeastOne = false;
                for (var i = 0; i < sources.length; i++) {
                    var element = sources[i];
                    if (audio.canPlayType(element.MimeType) === "probably") {
                        var source = Helpers.HTML.CreateElement("source", {
                            src: element.Url,
                            type: element.MimeType
                        });
                        audio.appendChild(source);
                        canPlayAtLeastOne = true;
                    }
                }
                // no source can be played by the browser?
                if (canPlayAtLeastOne === false) {
                    Errors.Report(ErrorType.Warning, "Browser can't play any of available audio sources.", sources);
                    return null;
                }
                return audio;
            }
            catch (e) {
                // unsupported browser
                Errors.Report(ErrorType.Warning, "AudioPlayer: can't create audio element", e);
                return null;
            }
        };
        //
        // private functions section:
        // 
        AudioPlayer.prototype.InitAudio = function () {
            var _this = this;
            // important audio events
            this.audio.onended = function () { return VideoEvents.trigger(VideoEventType.ReachEnd); };
            this.audio.onpause = function () { if (_this.playing)
                _this.InitiatePause(); };
            this.audio.ontimeupdate = function () { return _this.ReportCurrentTime(); };
            // user's volume settings			
            VideoEvents.on(VideoEventType.Mute, function () { return _this.Mute(); });
            VideoEvents.on(VideoEventType.VolumeUp, function () { return _this.VolumeUp(); });
            VideoEvents.on(VideoEventType.VolumeDown, function () { return _this.VolumeDown(); });
            this.MonitorBufferingAsync();
        };
        ;
        /**
         * Start playling
         */
        AudioPlayer.prototype.Play = function () {
            if (this.isReady) {
                if (this.reachedEnd == true) {
                    this.Rewind();
                }
                this.audio.play();
            }
        };
        /**
         * Be the one who tells others, when to play!
         */
        AudioPlayer.prototype.InitiatePlay = function () {
            VideoEvents.trigger(VideoEventType.Start);
        };
        /**
         * Pause audio
         */
        AudioPlayer.prototype.Pause = function () {
            if (this.isReady) {
                this.audio.pause();
            }
        };
        /**
         * Be the one who tells others, when to pause!
         */
        AudioPlayer.prototype.InitiatePause = function () {
            VideoEvents.trigger(VideoEventType.Pause);
        };
        /**
         * Video playback has ended.
         */
        AudioPlayer.prototype.ReachedEnd = function () {
            this.reachedEnd = true;
            this.Pause();
        };
        /**
         * Play the audio from the start.
         */
        AudioPlayer.prototype.Replay = function () {
            this.Rewind();
            this.Play();
        };
        /**
         * Change current position back to the start
         */
        AudioPlayer.prototype.Rewind = function () {
            if (this.isReady) {
                this.audio.pause();
                this.audio.currentTime = 0;
                this.reachedEnd = false;
            }
        };
        /**
         * Asynchronousely monitor current audio buffer
         */
        AudioPlayer.prototype.MonitorBufferingAsync = function () {
            var _this = this;
            // Has the browser preloaded something since last time?
            // Change the css styles only if needed.
            var lastEnd = 0;
            this.checkPreloaded = setInterval(function () {
                var end = _this.audio.buffered.end(_this.audio.buffered.length - 1);
                if (end !== lastEnd) {
                    VideoEvents.trigger(VideoEventType.BufferStatus, end);
                    lastEnd = end;
                }
                if (end === _this.audio.duration) {
                    clearInterval(_this.checkPreloaded);
                }
            }, 300); // every second check, how much is preloaded
        };
        /**
         * Jump to a given position.
         * It might take some time before the audio is ready - pause the playback and start as soon as ready.
         */
        AudioPlayer.prototype.JumpTo = function (progress) {
            this.reachedEnd = false; // if I was at the end and I changed the position, I am not at the end any more!			
            var time = this.audio.duration * progress; // duration is in seconds
            this.ChangePosition(time);
            // monitor preloading buffer
            clearInterval(this.checkPreloaded);
            this.MonitorBufferingAsync();
        };
        /**
         * Change current audio position to specified time
         */
        AudioPlayer.prototype.ChangePosition = function (seconds) {
            this.audio.currentTime = seconds;
        };
        /**
         * Report current time so everyone can synchronize
         */
        AudioPlayer.prototype.ReportCurrentTime = function () {
            VideoEvents.trigger(VideoEventType.CurrentTime, this.audio.currentTime);
        };
        /**
         * Volume MUTE/UP/DOWN
         */
        AudioPlayer.prototype.Mute = function () {
            this.audio.volume = 0;
        };
        AudioPlayer.prototype.VolumeUp = function () {
            this.audio.volume = Math.min(1, this.audio.volume + 0.1);
        };
        AudioPlayer.prototype.VolumeDown = function () {
            this.audio.volume = Math.max(0, this.audio.volume - 0.1);
        };
        return AudioPlayer;
    })();
    AudioData.AudioPlayer = AudioPlayer;
})(AudioData || (AudioData = {}));
/// <reference path="../AudioData/AudioPlayer" />
var VideoData;
(function (VideoData) {
    /**
     *
     */
    var Metadata = (function () {
        function Metadata() {
        }
        return Metadata;
    })();
    VideoData.Metadata = Metadata;
})(VideoData || (VideoData = {}));
var VideoData;
(function (VideoData) {
    var VideoEvents = Helpers.VideoEvents;
    var VideoEventType = Helpers.VideoEventType;
    /**
     * Commands are used to trigger some event at given moment.
     */
    var Command = (function () {
        function Command(time) {
            this.time = time;
        }
        Object.defineProperty(Command.prototype, "Time", {
            get: function () { return this.time; },
            enumerable: true,
            configurable: true
        });
        Command.prototype.Execute = function () {
            throw new Error("Not implemented");
        };
        return Command;
    })();
    VideoData.Command = Command;
    var MoveCursor = (function (_super) {
        __extends(MoveCursor, _super);
        function MoveCursor(x, y, p, time) {
            _super.call(this, time);
            this.x = x;
            this.y = y;
            this.p = p;
        }
        Object.defineProperty(MoveCursor.prototype, "X", {
            get: function () { return this.x; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MoveCursor.prototype, "Y", {
            get: function () { return this.y; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MoveCursor.prototype, "P", {
            get: function () { return this.p; },
            enumerable: true,
            configurable: true
        });
        MoveCursor.prototype.Execute = function () {
            VideoEvents.trigger(VideoEventType.CursorState, new Helpers.CursorState(this.Time, this.x, this.y, this.p));
        };
        return MoveCursor;
    })(Command);
    VideoData.MoveCursor = MoveCursor;
    var DrawNextSegment = (function (_super) {
        __extends(DrawNextSegment, _super);
        function DrawNextSegment() {
            _super.apply(this, arguments);
        }
        DrawNextSegment.prototype.Execute = function () {
            VideoEvents.trigger(VideoEventType.DrawSegment);
        };
        return DrawNextSegment;
    })(Command);
    VideoData.DrawNextSegment = DrawNextSegment;
    var ChangeBrushColor = (function (_super) {
        __extends(ChangeBrushColor, _super);
        function ChangeBrushColor(color, time) {
            _super.call(this, time);
            this.color = color;
        }
        Object.defineProperty(ChangeBrushColor.prototype, "Color", {
            get: function () { return this.color; },
            enumerable: true,
            configurable: true
        });
        ChangeBrushColor.prototype.Execute = function () {
            VideoEvents.trigger(VideoEventType.ChangeColor, this.color);
        };
        return ChangeBrushColor;
    })(Command);
    VideoData.ChangeBrushColor = ChangeBrushColor;
    var ChangeBrushSize = (function (_super) {
        __extends(ChangeBrushSize, _super);
        function ChangeBrushSize(size, time) {
            _super.call(this, time);
            this.size = size;
        }
        Object.defineProperty(ChangeBrushSize.prototype, "Size", {
            get: function () { return this.size; },
            enumerable: true,
            configurable: true
        });
        ChangeBrushSize.prototype.Execute = function () {
            VideoEvents.trigger(VideoEventType.ChangeBrushSize, this.size);
        };
        return ChangeBrushSize;
    })(Command);
    VideoData.ChangeBrushSize = ChangeBrushSize;
    var ClearCanvas = (function (_super) {
        __extends(ClearCanvas, _super);
        function ClearCanvas(time, color) {
            _super.call(this, time);
            this.color = color;
        }
        Object.defineProperty(ClearCanvas.prototype, "Color", {
            get: function () { return this.color; },
            enumerable: true,
            configurable: true
        });
        ClearCanvas.prototype.Execute = function () {
            VideoEvents.trigger(VideoEventType.ClearCanvas, this.color);
        };
        return ClearCanvas;
    })(Command);
    VideoData.ClearCanvas = ClearCanvas;
})(VideoData || (VideoData = {}));
var Helpers;
(function (Helpers) {
    /**
    * (High resolution) timer.
    */
    var VideoTimer = (function () {
        /**
         * Creates a timer and resets it.
         */
        function VideoTimer(running) {
            /** Current time of the moment when the timer was paused. */
            this.pauseTime = 0;
            /** @type {Date|object} */
            if (!window.performance) {
                this.clock = Date;
            }
            else {
                this.clock = window.performance; // High resolution timer
            }
            this.paused = !running; // default is false
            this.Reset();
        }
        Object.defineProperty(VideoTimer.prototype, "StartTime", {
            get: function () { return this.startTime; },
            enumerable: true,
            configurable: true
        });
        /**
         * Get time ellapsed since the last clock reset
         */
        VideoTimer.prototype.CurrentTime = function () {
            return !this.paused ? this.clock.now() - this.startTime : this.pauseTime;
        };
        /**
         * Set the timer to a specific point (in milliseconds)
         */
        VideoTimer.prototype.SetTime = function (milliseconds) {
            if (this.paused) {
                this.pauseTime = milliseconds;
            }
            else {
                this.startTime = this.clock.now() - milliseconds;
            }
        };
        /**
         * Pause the timer
         */
        VideoTimer.prototype.Pause = function () {
            this.pauseTime = this.CurrentTime();
            this.paused = true;
        };
        /**
         * Unpause the timer
         */
        VideoTimer.prototype.Resume = function () {
            this.paused = false;
            this.Reset();
            this.SetTime(this.pauseTime);
        };
        /**
         * Start counting from zero
         */
        VideoTimer.prototype.Reset = function () {
            this.startTime = this.clock.now();
        };
        return VideoTimer;
    })();
    Helpers.VideoTimer = VideoTimer;
})(Helpers || (Helpers = {}));
/// <reference path="Command" />
/// <reference path="../Helpers/State" />
/// <reference path="../Helpers/VideoTimer" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="../Drawing/Path" />
var VideoData;
(function (VideoData) {
    var VideoEvents = Helpers.VideoEvents;
    var VideoEventType = Helpers.VideoEventType;
    /**
     * Chunk represents part of the whole video process.
     * It starts in a specific time and contains list of commands and pre-rendered paths,
     * that are used to render one chunk in a single moment without unnecessary looping through all commands.
     * Each chunk contains an information about the last time the screen was erased.
     */
    var Chunk = (function () {
        /*private*/ function Chunk(time, lastErase) {
            this.time = time;
            this.lastErase = lastErase;
            this.initCommands = [];
            this.commands = [];
            this.cmdIterator = 0;
            this.pathIterator = 0;
        }
        Object.defineProperty(Chunk.prototype, "StartTime", {
            get: function () { return this.time; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Chunk.prototype, "LastErase", {
            get: function () { return this.lastErase; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Chunk.prototype, "CurrentCommand", {
            get: function () {
                return this.commands[this.cmdIterator]; // if the index exceeds the bound of the array, undefined is returned
            },
            enumerable: true,
            configurable: true
        });
        Chunk.prototype.PeekNextCommand = function () {
            return this.commands[this.cmdIterator + 1]; // if the index exceeds the bound of the array, undefined is returned
        };
        Chunk.prototype.MoveNextCommand = function () { this.cmdIterator++; };
        /**
         * Execute all initialising commands to make sure video is in the right state
         * before continuing the playback. This is necessary when skipping to different point
         * on the timeline and skipping rendering of some parts of the video using "lastErase" hints..
         */
        Chunk.prototype.ExecuteInitCommands = function () {
            for (var i = 0; i < this.initCommands.length; i++) {
                this.initCommands[i].Execute();
            }
        };
        Chunk.prototype.GetCommand = function (i) {
            return i < this.commands.length ? this.commands[i] : null;
        };
        Chunk.prototype.PushCommand = function (cmd) {
            this.commands.push(cmd);
        };
        Object.defineProperty(Chunk.prototype, "Commands", {
            get: function () {
                return this.commands;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Chunk.prototype, "InitCommands", {
            get: function () {
                return this.initCommands;
            },
            set: function (initCmds) {
                this.initCommands = initCmds;
            },
            enumerable: true,
            configurable: true
        });
        Chunk.prototype.Render = function () {
            throw new Error("Not implemented");
        };
        return Chunk;
    })();
    VideoData.Chunk = Chunk;
    /**
     * Concrete chunks:
     */
    var VoidChunk = (function (_super) {
        __extends(VoidChunk, _super);
        function VoidChunk() {
            _super.apply(this, arguments);
        }
        Object.defineProperty(VoidChunk, "NodeName", {
            get: function () { return "void"; },
            enumerable: true,
            configurable: true
        });
        VoidChunk.prototype.Render = function () {
            /* Void.. */
        };
        return VoidChunk;
    })(Chunk);
    VideoData.VoidChunk = VoidChunk;
    var PathChunk = (function (_super) {
        __extends(PathChunk, _super);
        function PathChunk(path, time, lastErase) {
            _super.call(this, time, lastErase);
            this.path = path;
        }
        Object.defineProperty(PathChunk, "NodeName", {
            get: function () { return "path"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PathChunk.prototype, "Path", {
            get: function () { return this.path; },
            enumerable: true,
            configurable: true
        });
        PathChunk.prototype.Render = function () {
            VideoEvents.trigger(VideoEventType.DrawPath);
        };
        return PathChunk;
    })(Chunk);
    VideoData.PathChunk = PathChunk;
    var EraseChunk = (function (_super) {
        __extends(EraseChunk, _super);
        function EraseChunk(color, time, lastErase) {
            _super.call(this, time, lastErase);
            this.color = color;
        }
        Object.defineProperty(EraseChunk, "NodeName", {
            get: function () { return "erase"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EraseChunk.prototype, "Color", {
            get: function () { return this.color; },
            enumerable: true,
            configurable: true
        });
        EraseChunk.prototype.Render = function () {
            VideoEvents.trigger(VideoEventType.ClearCanvas, this.color);
        };
        return EraseChunk;
    })(Chunk);
    VideoData.EraseChunk = EraseChunk;
})(VideoData || (VideoData = {}));
/// <referece path="../VideoData/Video" />
/// <reference path="HTML" />
var Helpers;
(function (Helpers) {
    /**
     * File helper
     */
    var File = (function () {
        function File() {
        }
        /**
         * Checks, if request was successful and if the MIME type is matching (if requested)
         */
        File.Check = function (req, mimeType) {
            return req.status === 200
                && !!mimeType ? req.getResponseHeader("ContentType") === mimeType : true; // !! - convert to boolean
        };
        /**
         * Check, if there is an existing file on the specified url.
         * This function is blocking.
         */
        File.Exists = function (url, mimeType) {
            var req = new XMLHttpRequest();
            req.open("HEAD", url, false);
            req.send();
            return this.Check(req, mimeType);
        };
        /**
         * Check, if there is an existing file on the specified url.
         * This function is not blocking.
         */
        File.ExistsAsync = function (url, success, error, mimeType) {
            var _this = this;
            var req = new XMLHttpRequest();
            req.open("HEAD", url, true);
            req.onerror = error;
            req.ontimeout = error;
            req.onload = function (e) {
                if (_this.Check(req, mimeType)) {
                    success(e);
                }
                else {
                    error(e);
                }
            };
            req.send();
        };
        /**
         * Asynchronousely open and parse an XML file.
         * @param 	url		File URL
         * @param	success	Success callback
         * @param 	error	Error callback
         */
        File.ReadXmlAsync = function (url, success, error) {
            var req = new XMLHttpRequest();
            req.open("GET", url, true);
            req.onerror = function (e) { return error(req.status); };
            req.ontimeout = function (e) { return error(req.status); };
            req.onload = function (e) {
                if (req.status === 200) {
                    success(req.responseXML);
                }
                else {
                    error(req.status);
                }
            };
            req.send();
        };
        /**
         * Download a Blob with a specified name
         */
        File.Download = function (blob, name) {
            // create a hidden link
            var a = Helpers.HTML.CreateElement("a", {
                css: "display: none"
            });
            document.documentElement.appendChild(a);
            var url = URL.createObjectURL(blob);
            Helpers.HTML.SetAttributes(a, {
                href: url,
                download: name
            });
            a.click(); // initiate download
            URL.revokeObjectURL(url);
        };
        /**
         * Current time in this format: "mm-dd-YYYY_H-i"
         */
        File.CurrentDateTime = function () {
            var date = new Date();
            return "$(date.getMonth())-$(date.getDay())-$(date.getFullYear())_$(date.getHour())-$(date.getMinute())";
        };
        /**
         * Download a WAV file
         */
        File.StartDownloadingWav = function (blob) {
            File.Download(blob, "recording-" + File.CurrentDateTime() + ".wav");
        };
        /**
         * Download an XML file
         */
        File.StartDownloadingXml = function (text) {
            var blob = new Blob([text], { type: "text/xml" });
            File.Download(blob, "data-" + File.CurrentDateTime() + ".xml");
        };
        return File;
    })();
    Helpers.File = File;
})(Helpers || (Helpers = {}));
/// <reference path="Metadata" />
/// <reference path="Command" />
/// <reference path="Chunk" />
/// <reference path="ICursor" />
/// <reference path="../VideoFormat/IO" />
/// <reference path="../Helpers/File" />
/// <reference path="../Helpers/Errors" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="../Helpers/State" />
/// <reference path="../Helpers/VideoTimer" />
/// <reference path="../Drawing/Path" />
var VideoData;
(function (VideoData) {
    var Video = (function () {
        /**
         * Video data storage
         */
        function Video() {
            this.chunks = [];
        }
        Object.defineProperty(Video.prototype, "Metadata", {
            /** Video information. */
            get: function () { return this.metadata; },
            set: function (value) { this.metadata = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Video.prototype, "CurrentChunk", {
            /** Reference to current chunk */
            get: function () {
                return this.chunks[this.currentChunk]; // if the index exceeds the bound of the array, undefined is returned
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Video.prototype, "CurrentChunkNumber", {
            /** Reference to current chunk */
            get: function () {
                return this.currentChunk; // if the index exceeds the bound of the array, undefined is returned
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Video.prototype, "SetCurrentChunkNumber", {
            /** Reference to current chunk */
            set: function (n) {
                this.currentChunk = n; // if the index exceeds the bound of the array, undefined is returned
            },
            enumerable: true,
            configurable: true
        });
        /** Look for the next chunk, but do not move the iterator. */
        Video.prototype.PeekNextChunk = function () {
            return this.chunks[this.currentChunk + 1];
        };
        /** Jump to the next chunk */
        Video.prototype.MoveNextChunk = function () { this.currentChunk++; };
        /**
         * Add a new chunk at the end of the data.
         */
        Video.prototype.PushChunk = function (chunk) {
            this.currentChunk = this.chunks.push(chunk) - 1;
            return this.currentChunk;
        };
        /**.
         * Change current chunk to the one before the very first
         */
        Video.prototype.Rewind = function () {
            this.currentChunk = 0;
        };
        /**
         * Rewind one item before the very first one - the next MoveNextChunk will enter the first chunk.
         */
        Video.prototype.RewindMinusOne = function () {
            this.currentChunk = -1;
        };
        /**
         * Go on in time until you find the given timeframe and skip to the very preciding "erase" chunk.
         * If the "erase" chunk preceded current chunk, then there are no erased chunks to fastforward and currentChunk
         * remains untouched.
         * @param	{number}	time			Searched time point in milliseconds
         */
        Video.prototype.FastforwardErasedChunksUntil = function (time) {
            var c = this.FindChunk(time, +1); // seek among the future chunks
            return Math.max(this.currentChunk, this.chunks[c].LastErase);
        };
        /**
         * Go back in time until you find the given timeframe and skip to the very preceding "erase" chunk.
         * @param	{number}	time			Searched time point in milliseconds
         */
        Video.prototype.RewindToLastEraseBefore = function (time) {
            var c = this.FindChunk(time, -1); // seek among the past chunks
            return this.chunks[c].LastErase;
        };
        /**
         * Find a chunk that starts at or after "time" and ends after "time"
         * @param	{number}	time			Searched time point in milliseconds
         * @param	{number}	directionHint	1 for searching in the future, -1 to search in the past
         */
        Video.prototype.FindChunk = function (time, directionHint) {
            var foundChunk = this.currentChunk;
            while ((!!this.chunks[foundChunk] && !!this.chunks[foundChunk + 1])
                && (this.chunks[foundChunk].StartTime <= time && this.chunks[foundChunk + 1].StartTime >= time) === false) {
                foundChunk += directionHint;
            }
            if (!this.CurrentChunk) {
                return 0; // I haven't found, what I was looking for, return the first chunk ever
            }
            return foundChunk;
        };
        return Video;
    })();
    VideoData.Video = Video;
})(VideoData || (VideoData = {}));
/// <reference path="../../Helpers/SVG" />
/// <reference path="../../VideoData/Command" />
/// <reference path="../../Helpers/HelperFunctions" />
var VideoFormat;
(function (VideoFormat) {
    var SVGAnimation;
    (function (SVGAnimation) {
        var MoveCursor = VideoData.MoveCursor;
        var ChangeBrushColor = VideoData.ChangeBrushColor;
        var ChangeBrushSize = VideoData.ChangeBrushSize;
        var ClearCanvas = VideoData.ClearCanvas;
        var DrawNextSegment = VideoData.DrawNextSegment;
        var SVGA = Helpers.SVGA;
        var precise = Helpers.precise;
        var TIME_PRECISION = 2;
        var COORDS_PRECISION = 3;
        var PRESSURE_PRECISION = 4;
        /**
         * CommandFactory is the basis of "Chain of responsibility" pattern implementation.
         * Derived classes are used to convert commands to or from SVG nodes.
         */
        var CommandFactory = (function () {
            function CommandFactory(next) {
                this.next = next;
            }
            CommandFactory.prototype.FromSVG = function (node) {
                if (!!this.next) {
                    return this.next.FromSVG(node);
                }
                throw new Error("Command loading failed: Unsupported node " + node.nodeName + ".");
            };
            CommandFactory.prototype.ToSVG = function (cmd) {
                if (!!this.next) {
                    return this.next.ToSVG(cmd);
                }
                throw new Error("Command export failed: Unsupported command " + typeof cmd + ".");
            };
            return CommandFactory;
        })();
        SVGAnimation.CommandFactory = CommandFactory;
        var MoveCursorFactory = (function (_super) {
            __extends(MoveCursorFactory, _super);
            function MoveCursorFactory() {
                _super.apply(this, arguments);
            }
            MoveCursorFactory.prototype.FromSVG = function (node) {
                if (node.localName === MoveCursorFactory.NodeName) {
                    return new MoveCursor(SVGA.numAttr(node, "x"), SVGA.numAttr(node, "y"), SVGA.numAttr(node, "p", 0), SVGA.numAttr(node, "t"));
                }
                // else pass through the chain of responsibility
                return _super.prototype.FromSVG.call(this, node);
            };
            MoveCursorFactory.prototype.ToSVG = function (cmd) {
                if (cmd instanceof MoveCursor) {
                    var options = {
                        "x": precise(cmd.X),
                        "y": precise(cmd.Y),
                        "t": precise(cmd.Time, TIME_PRECISION)
                    };
                    if (cmd.P > 0) {
                        options["p"] = precise(cmd.P, PRESSURE_PRECISION);
                    }
                    return SVGA.CreateElement(MoveCursorFactory.NodeName, options);
                }
                // else pass through the chain of responsibility
                return _super.prototype.ToSVG.call(this, cmd);
            };
            MoveCursorFactory.NodeName = "m";
            return MoveCursorFactory;
        })(CommandFactory);
        SVGAnimation.MoveCursorFactory = MoveCursorFactory;
        var DrawSegmentFactory = (function (_super) {
            __extends(DrawSegmentFactory, _super);
            function DrawSegmentFactory() {
                _super.apply(this, arguments);
            }
            DrawSegmentFactory.prototype.FromSVG = function (node) {
                if (node.localName === DrawSegmentFactory.NodeName) {
                    return new DrawNextSegment(SVGA.numAttr(node, "t"));
                }
                // else pass through the chain of responsibility
                return _super.prototype.FromSVG.call(this, node);
            };
            DrawSegmentFactory.prototype.ToSVG = function (cmd) {
                if (cmd instanceof DrawNextSegment) {
                    return SVGA.CreateElement(DrawSegmentFactory.NodeName, {
                        "t": precise(cmd.Time, TIME_PRECISION)
                    });
                }
                // else pass through the chain of responsibility
                return _super.prototype.ToSVG.call(this, cmd);
            };
            DrawSegmentFactory.NodeName = "ds";
            return DrawSegmentFactory;
        })(CommandFactory);
        SVGAnimation.DrawSegmentFactory = DrawSegmentFactory;
        var ChangeBrushColorFactory = (function (_super) {
            __extends(ChangeBrushColorFactory, _super);
            function ChangeBrushColorFactory() {
                _super.apply(this, arguments);
            }
            ChangeBrushColorFactory.prototype.FromSVG = function (node) {
                if (node.localName === ChangeBrushColorFactory.NodeName) {
                    return new ChangeBrushColor(new UI.Color("", SVGA.attr(node, "d")), SVGA.numAttr(node, "t"));
                }
                // else pass through the chain of responsibility
                return _super.prototype.FromSVG.call(this, node);
            };
            ChangeBrushColorFactory.prototype.ToSVG = function (cmd) {
                if (cmd instanceof ChangeBrushColor) {
                    return SVGA.CreateElement(ChangeBrushColorFactory.NodeName, {
                        "d": cmd.Color.CssValue,
                        "t": precise(cmd.Time, TIME_PRECISION)
                    });
                }
                // else pass through the chain of responsibility
                return _super.prototype.ToSVG.call(this, cmd);
            };
            ChangeBrushColorFactory.NodeName = "c";
            return ChangeBrushColorFactory;
        })(CommandFactory);
        SVGAnimation.ChangeBrushColorFactory = ChangeBrushColorFactory;
        var ChangeBrushSizeFactory = (function (_super) {
            __extends(ChangeBrushSizeFactory, _super);
            function ChangeBrushSizeFactory() {
                _super.apply(this, arguments);
            }
            ChangeBrushSizeFactory.prototype.FromSVG = function (node) {
                if (node.localName === ChangeBrushSizeFactory.NodeName) {
                    return new ChangeBrushSize(new UI.BrushSize("", SVGA.numAttr(node, "d"), SVGA.attr(node, "u")), SVGA.numAttr(node, "t"));
                }
                // else pass through the chain of responsibility
                return _super.prototype.FromSVG.call(this, node);
            };
            ChangeBrushSizeFactory.prototype.ToSVG = function (cmd) {
                if (cmd instanceof ChangeBrushSize) {
                    return SVGA.CreateElement(ChangeBrushSizeFactory.NodeName, {
                        "d": cmd.Size.Size,
                        "u": cmd.Size.Unit,
                        "t": precise(cmd.Time, TIME_PRECISION)
                    });
                }
                // else pass through the chain of responsibility
                return _super.prototype.ToSVG.call(this, cmd);
            };
            ChangeBrushSizeFactory.NodeName = "s";
            return ChangeBrushSizeFactory;
        })(CommandFactory);
        SVGAnimation.ChangeBrushSizeFactory = ChangeBrushSizeFactory;
        var ClearCanvasFactory = (function (_super) {
            __extends(ClearCanvasFactory, _super);
            function ClearCanvasFactory() {
                _super.apply(this, arguments);
            }
            ClearCanvasFactory.prototype.FromSVG = function (node) {
                if (node.localName === ClearCanvasFactory.NodeName) {
                    return new ClearCanvas(SVGA.numAttr(node, "t"), new UI.Color("", SVGA.attr(node, "color")));
                }
                // else pass through the chain of responsibility
                return _super.prototype.FromSVG.call(this, node);
            };
            ClearCanvasFactory.prototype.ToSVG = function (cmd) {
                if (cmd instanceof ClearCanvas) {
                    return SVGA.CreateElement(ClearCanvasFactory.NodeName, {
                        "t": precise(cmd.Time, TIME_PRECISION),
                        "color": cmd.Color.CssValue
                    });
                }
                // else pass through the chain of responsibility
                return _super.prototype.ToSVG.call(this, cmd);
            };
            ClearCanvasFactory.NodeName = "e";
            return ClearCanvasFactory;
        })(CommandFactory);
        SVGAnimation.ClearCanvasFactory = ClearCanvasFactory;
    })(SVGAnimation = VideoFormat.SVGAnimation || (VideoFormat.SVGAnimation = {}));
})(VideoFormat || (VideoFormat = {}));
/// <reference path="../../VideoData/Chunk" />
/// <reference path="../../VideoData/Command" />
/// <reference path="CommandFactories" />
/// <reference path="../../Helpers/SVG" />
var VideoFormat;
(function (VideoFormat) {
    var SVGAnimation;
    (function (SVGAnimation) {
        var SVG = Helpers.SVG;
        var SVGA = Helpers.SVGA;
        var VoidChunk = VideoData.VoidChunk;
        var PathChunk = VideoData.PathChunk;
        var EraseChunk = VideoData.EraseChunk;
        /** Time is in miliseconds */
        var TIME_PRECISION = 2;
        /**
         * Chunk factories - implementing the chain of responsibility design pattern
         */
        var ChunkFactory = (function () {
            function ChunkFactory(next) {
                this.next = next;
            }
            ChunkFactory.prototype.FromSVG = function (node, cmdFactory) {
                if (!!this.next) {
                    return this.next.FromSVG(node, cmdFactory);
                }
                throw new Error("Chunk loading failed: Unsupported node " + node.nodeName + ".");
            };
            ChunkFactory.prototype.ToSVG = function (chunk, cmdFactory) {
                if (!!this.next) {
                    return this.next.ToSVG(chunk, cmdFactory);
                }
                throw new Error("Chunk export failed: Unsupported command " + typeof (chunk) + ".");
            };
            Object.defineProperty(ChunkFactory.prototype, "InitCommandsNodeName", {
                get: function () { return "init"; },
                enumerable: true,
                configurable: true
            });
            ChunkFactory.prototype.InitCommandsFromSVG = function (node, cmdFactory) {
                if (node.localName === this.InitCommandsNodeName) {
                    var cmds = [];
                    var cmd = node.firstElementChild;
                    while (!!cmd) {
                        cmds.push(cmdFactory.FromSVG(cmd));
                        cmd = cmd.nextElementSibling;
                    }
                    return cmds;
                }
                throw new Error("Can't read init commands from " + node.nodeName);
            };
            ChunkFactory.prototype.InitCommandsToSVG = function (cmds, cmdFactory) {
                var node = SVGA.CreateElement(this.InitCommandsNodeName);
                return this.CommandsToSVG(node, cmds, cmdFactory);
            };
            ChunkFactory.prototype.CommandsToSVG = function (node, cmds, cmdFactory) {
                for (var i = 0; i < cmds.length; i++) {
                    node.appendChild(cmdFactory.ToSVG(cmds[i]));
                }
                return node;
            };
            return ChunkFactory;
        })();
        SVGAnimation.ChunkFactory = ChunkFactory;
        var VoidChunkFactory = (function (_super) {
            __extends(VoidChunkFactory, _super);
            function VoidChunkFactory() {
                _super.apply(this, arguments);
            }
            VoidChunkFactory.prototype.FromSVG = function (node, cmdFactory) {
                if (SVGA.attr(node, "type") === VoidChunkFactory.NodeName) {
                    var chunk = new VoidChunk(SVGA.numAttr(node, "t"), SVGA.numAttr(node, "lastErase"));
                    // load init commands
                    var init = node.firstElementChild;
                    chunk.InitCommands = this.InitCommandsFromSVG(init, cmdFactory);
                    var cmd = init.nextElementSibling;
                    while (!!cmd) {
                        chunk.PushCommand(cmdFactory.FromSVG(cmd));
                        cmd = cmd.nextElementSibling;
                    }
                    return chunk;
                }
                return _super.prototype.FromSVG.call(this, node, cmdFactory);
            };
            VoidChunkFactory.prototype.ToSVG = function (chunk, cmdFactory) {
                if (chunk instanceof VoidChunk) {
                    var node = SVG.CreateElement("g");
                    SVGA.SetAttributes(node, {
                        "type": VoidChunkFactory.NodeName,
                        "t": chunk.StartTime.toFixed(TIME_PRECISION),
                        "lastErase": chunk.LastErase
                    });
                    node.appendChild(this.InitCommandsToSVG(chunk.InitCommands, cmdFactory));
                    this.CommandsToSVG(node, chunk.Commands, cmdFactory);
                    return node;
                }
                return _super.prototype.ToSVG.call(this, chunk, cmdFactory);
            };
            VoidChunkFactory.NodeName = "void";
            return VoidChunkFactory;
        })(ChunkFactory);
        SVGAnimation.VoidChunkFactory = VoidChunkFactory;
        var InstructionType;
        (function (InstructionType) {
            InstructionType[InstructionType["Move"] = 0] = "Move";
            InstructionType[InstructionType["Line"] = 1] = "Line";
            InstructionType[InstructionType["Curve"] = 2] = "Curve";
            InstructionType[InstructionType["Arc"] = 3] = "Arc";
            InstructionType[InstructionType["Close"] = 4] = "Close";
        })(InstructionType || (InstructionType = {}));
        var InstructionFactory = (function () {
            function InstructionFactory(letter, type, coordsCount, next) {
                this.letter = letter;
                this.type = type;
                this.coordsCount = coordsCount;
                this.next = next;
            }
            InstructionFactory.prototype.Create = function (c) {
                var letter = c.shift();
                if (letter === this.letter) {
                    var coords = [];
                    for (var i = 0; i < this.coordsCount; i++) {
                        coords.push(this.CreateVector2(c.shift()));
                    }
                    return {
                        type: this.type,
                        coords: coords
                    };
                }
                else {
                    if (!!this.next) {
                        c.unshift(letter);
                        return this.next.Create(c);
                    }
                    throw new Error("Unsupported instruction letter '" + letter + "'");
                }
            };
            InstructionFactory.prototype.CreateVector2 = function (pair) {
                var coords = pair.split(",");
                if (coords.length !== 2) {
                    throw new Error("Coordinates pair '" + pair + "' is not valid");
                }
                return new Helpers.Vector2(Number(coords[0]), Number(coords[1]));
            };
            return InstructionFactory;
        })();
        var ArcFactory = (function (_super) {
            __extends(ArcFactory, _super);
            function ArcFactory(next) {
                _super.call(this, "A", InstructionType.Arc, 3, next);
            }
            ArcFactory.prototype.Create = function (c) {
                var letter = c.shift();
                if (letter === this.letter) {
                    var coords = [];
                    coords.push(this.CreateVector2(c.shift()));
                    c.shift(); // radius
                    coords.push(this.CreateVector2(c.shift()));
                    coords.push(this.CreateVector2(c.shift()));
                    return {
                        type: this.type,
                        coords: coords
                    };
                }
                else {
                    if (!!this.next) {
                        c.unshift(letter);
                        return this.next.Create(c);
                    }
                    throw new Error("Unsupported instruction letter '" + letter + "'");
                }
            };
            return ArcFactory;
        })(InstructionFactory);
        var PathChunkFactory = (function (_super) {
            __extends(PathChunkFactory, _super);
            function PathChunkFactory(next) {
                _super.call(this, next);
                this.next = next;
                this.instructionFactory = new InstructionFactory("C", InstructionType.Curve, 3, new InstructionFactory("L", InstructionType.Line, 1, new InstructionFactory("M", InstructionType.Move, 1, new ArcFactory())));
            }
            PathChunkFactory.prototype.FromSVG = function (node, cmdFactory) {
                if (SVGA.attr(node, "type") === PathChunkFactory.NodeName) {
                    // [0] path chunk must have at least two child nodes
                    if (node.childElementCount < 2) {
                        throw new Error("Path chunk has only " + node.childElementCount + " nodes.");
                    }
                    // [1] first child must be a PATH
                    var pathNode = node.firstElementChild;
                    if (pathNode.localName !== "path") {
                        throw new Error("Path chunk must begin with a <path> element, but " + pathNode.localName + " found instead");
                    }
                    // [2] second node must be init commands container
                    var init = pathNode.nextElementSibling;
                    if (init.localName !== this.InitCommandsNodeName) {
                        throw new Error("Second child of chunk must be an <init> element, but " + init.localName + " found instead");
                    }
                    var initCmds = this.InitCommandsFromSVG(init, cmdFactory);
                    // now the chunk instance can be created
                    var chunk = new PathChunk(this.SVGNodeToPath(pathNode), SVGA.numAttr(node, "t"), SVGA.numAttr(node, "lastErase"));
                    chunk.InitCommands = initCmds;
                    // [3 ..] all the others are cmds
                    var cmd = init.nextElementSibling;
                    while (!!cmd) {
                        chunk.PushCommand(cmdFactory.FromSVG(cmd));
                        cmd = cmd.nextElementSibling;
                    }
                    return chunk;
                }
                return _super.prototype.FromSVG.call(this, node, cmdFactory);
            };
            PathChunkFactory.prototype.ToSVG = function (chunk, cmdFactory) {
                if (chunk instanceof PathChunk) {
                    var node = SVG.CreateElement("g");
                    SVGA.SetAttributes(node, {
                        "type": PathChunkFactory.NodeName,
                        "t": chunk.StartTime.toFixed(TIME_PRECISION),
                        "lastErase": chunk.LastErase
                    });
                    // [1] path
                    node.appendChild(this.PathToSVGNode(chunk.Path));
                    // [2] init commands
                    node.appendChild(this.InitCommandsToSVG(chunk.InitCommands, cmdFactory));
                    // [3] all the commands
                    this.CommandsToSVG(node, chunk.Commands, cmdFactory);
                    return node;
                }
                return _super.prototype.ToSVG.call(this, chunk, cmdFactory);
            };
            /**
             * Deserilize path from an SVG "path" node
             */
            PathChunkFactory.prototype.SVGNodeToPath = function (node) {
                var color = SVG.attr(node, "fill");
                var path = new Drawing.Path(true, color); // curved = true/false doesn't make any difference - the data are already recorded  
                // convert path data to sequence of segments 
                var d = SVG.attr(node, "d");
                node = null; // I don't need this reference any more
                var c = d.split(" ");
                var instructions = [];
                // create list of instructions
                while (c.length > 0) {
                    instructions.push(this.instructionFactory.Create(c));
                }
                c = null; // drop references
                d = null;
                // first segment - zero length segment
                var l = instructions.length - 1;
                if (instructions.length >= 2 && instructions[0].type === InstructionType.Move && instructions[l].type === InstructionType.Arc) {
                    path.Segments.push(new Drawing.ZeroLengthSegment(instructions[l].coords[2], instructions[0].coords[0]));
                    instructions.pop(); // arc
                    instructions.pop(); // line
                    instructions.shift();
                }
                else {
                    throw new Error("Only " + instructions.length + " valid instructions recognized in a path string");
                }
                // A] a dot: only one instruction's left -> it's the arc and I can determine the center and radius of the dot
                if (instructions.length === 1) {
                    var start = path.Segments[0].Right;
                    var end = instructions[0].coords[2];
                    //var radius = instructions[0].coords[0];
                    path.Segments = [new Drawing.ZeroLengthSegment(start, end)]; // override the original zero length seg.
                    return path;
                }
                // B] a whole path
                // left and right parts are at the same distance from the ends of the path
                l = instructions.length - 1;
                var prevSegment = null;
                for (var i = 0; i < Math.floor(instructions.length / 2); i++) {
                    if (instructions[i].type === InstructionType.Line) {
                        var qseg = new Drawing.QuadrilateralSegment(instructions[i].coords[0], instructions[l - i].coords[0]);
                        path.Segments.push(qseg);
                        if (prevSegment instanceof Drawing.CurvedSegment) {
                            prevSegment.Left = instructions[l - i].coords[0].clone();
                        }
                        prevSegment = qseg;
                    }
                    else if (instructions[i].type === InstructionType.Curve) {
                        var right = new Helpers.BezierCurveSegment(null, instructions[i].coords[0], instructions[i].coords[2], instructions[i].coords[1]);
                        var left = new Helpers.BezierCurveSegment(instructions[l - i].coords[2], instructions[l - i].coords[1], null, instructions[l - i].coords[0]);
                        var seg = new Drawing.CurvedSegment(left, right);
                        if (!!prevSegment && prevSegment instanceof Drawing.CurvedSegment) {
                            prevSegment.Left = seg.LeftBezier.Start.clone();
                            seg.RightBezier.Start = prevSegment.RightBezier.End.clone();
                        }
                        else if (!!prevSegment && prevSegment instanceof Drawing.QuadrilateralSegment) {
                            seg.RightBezier.Start = prevSegment.Right.clone();
                        }
                        path.Segments.push(seg);
                        prevSegment = seg;
                    }
                    else {
                        throw new Error("Unsupported path segment type " + instructions[i].type + " ");
                    }
                }
                // I need to fix last segment's left bezier End
                if (!!prevSegment && prevSegment instanceof Drawing.CurvedSegment) {
                    prevSegment.Left = instructions[Math.floor(instructions.length / 2)].coords[2].clone(); // this is the ARC cap of the path
                }
                return path;
            };
            /**
             * Encode path into a SVG "path" element
             */
            PathChunkFactory.prototype.PathToSVGNode = function (path) {
                var segments = path.Segments;
                // arc cap at the start
                var seg = segments[0];
                var center = seg.Right.pointInBetween(seg.Left);
                var startDirection = seg.Left.clone().subtract(center);
                var endDirection = seg.Right.clone().subtract(center);
                var arc = SVG.ArcString(seg.Right, center.distanceTo(seg.Right), Drawing.Path.angle(startDirection));
                var right = SVG.MoveToString(segments[0].Right) + " "; // SPACE divider
                var left = SVG.LineToString(segments[0].Left) + " " + arc;
                for (var i = 0; i < segments.length - 1; i++) {
                    var seg = segments[i];
                    if (seg instanceof Drawing.CurvedSegment) {
                        right += SVG.CurveToString(seg.RightBezier.StartCP, seg.RightBezier.EndCP, seg.RightBezier.End) + " "; // SPACE divider
                        left = SVG.CurveToString(seg.LeftBezier.EndCP, seg.LeftBezier.StartCP, seg.LeftBezier.Start) + " " + left; // SPACE divider
                    }
                    else if (seg instanceof Drawing.QuadrilateralSegment) {
                        right += SVG.LineToString(seg.Right) + " "; // SPACE divider
                        left = SVG.LineToString(seg.Left) + " " + left; // SPACE divider
                    }
                    else {
                        throw new Error("Unsupported segment type " + typeof (seg));
                    }
                }
                // arc cap at the end
                seg = segments[segments.length - 1];
                center = seg.Right.pointInBetween(seg.Left);
                startDirection = seg.Right.clone().subtract(center);
                endDirection = seg.Left.clone().subtract(center);
                var cap = SVG.ArcString(seg.Left, center.distanceTo(seg.Left), Drawing.Path.angle(startDirection)) + " ";
                return SVG.CreateElement("path", {
                    "fill": path.Color,
                    "d": right + cap + left
                });
            };
            PathChunkFactory.NodeName = "path";
            return PathChunkFactory;
        })(ChunkFactory);
        SVGAnimation.PathChunkFactory = PathChunkFactory;
        var EraseChunkFactory = (function (_super) {
            __extends(EraseChunkFactory, _super);
            function EraseChunkFactory() {
                _super.apply(this, arguments);
            }
            EraseChunkFactory.prototype.FromSVG = function (node, cmdFactory) {
                if (SVGA.attr(node, "type") === EraseChunkFactory.NodeName) {
                    // [0] erase chunk must have at least two child nodes
                    if (node.childElementCount < 2) {
                        throw new Error("Erase chunk has only " + node.childNodes.length + " nodes.");
                    }
                    // [1] first child must be a PATH
                    var rectNode = node.firstElementChild;
                    if (rectNode.localName !== "rect") {
                        throw new Error("Erase chunk must begin with a <rect> element, but " + rectNode.localName + " found instead");
                    }
                    // [2] second node must be init commands container
                    var init = rectNode.nextElementSibling;
                    if (init.localName !== this.InitCommandsNodeName) {
                        throw new Error("Second child of chunk must be an <init> element, but " + init.localName + " found instead");
                    }
                    var initCmds = this.InitCommandsFromSVG(init, cmdFactory);
                    // now the chunk instance can be created
                    var chunk = new EraseChunk(new UI.Color("", SVG.attr(rectNode, "fill")), SVGA.numAttr(node, "t"), SVGA.numAttr(node, "lastErase"));
                    chunk.InitCommands = initCmds;
                    // [3 ..] all the others are cmds
                    var cmd = init.nextElementSibling;
                    while (!!cmd) {
                        chunk.PushCommand(cmdFactory.FromSVG(cmd));
                        cmd = cmd.nextElementSibling;
                    }
                    return chunk;
                }
                return _super.prototype.FromSVG.call(this, node, cmdFactory);
            };
            EraseChunkFactory.prototype.ToSVG = function (chunk, cmdFactory) {
                if (chunk instanceof EraseChunk) {
                    var node = SVG.CreateElement("g");
                    SVGA.SetAttributes(node, {
                        "type": EraseChunkFactory.NodeName,
                        "t": chunk.StartTime.toFixed(TIME_PRECISION),
                        "lastErase": chunk.LastErase
                    });
                    // [1] rect
                    node.appendChild(SVG.CreateElement("rect", { "fill": chunk.Color.CssValue, width: "100%", height: "100%" }));
                    // [2] init commands
                    node.appendChild(this.InitCommandsToSVG(chunk.InitCommands, cmdFactory));
                    // [3] all the commands
                    this.CommandsToSVG(node, chunk.Commands, cmdFactory);
                    return node;
                }
                return _super.prototype.ToSVG.call(this, chunk, cmdFactory);
            };
            EraseChunkFactory.NodeName = "erase";
            return EraseChunkFactory;
        })(ChunkFactory);
        SVGAnimation.EraseChunkFactory = EraseChunkFactory;
    })(SVGAnimation = VideoFormat.SVGAnimation || (VideoFormat.SVGAnimation = {}));
})(VideoFormat || (VideoFormat = {}));
/// <reference path="../../VideoData/Metadata" />
/// <reference path="../../Helpers/SVG" />
var VideoFormat;
(function (VideoFormat) {
    var SVGAnimation;
    (function (SVGAnimation) {
        var Metadata = VideoData.Metadata;
        var SVGA = Helpers.SVGA;
        var MetadataFactory = (function () {
            function MetadataFactory() {
            }
            MetadataFactory.prototype.FromSVG = function (rootNode) {
                var meta = new Metadata();
                // [0] is this the correct element?
                if (rootNode.localName !== "metadata") {
                    throw new Error("MetadataFactory error parsing SVG: Wrong metadata element " + rootNode.localName);
                }
                // [1] video lenght			
                var length = rootNode.firstElementChild;
                if (length.localName !== "length") {
                    throw new Error("MetadataFactory error parsing SVG: Expected 'length', found '" + length.nodeName + "'");
                }
                meta.Length = Number(length.textContent);
                // [2] video width
                var width = length.nextElementSibling;
                length = null;
                if (width.localName !== "width") {
                    throw new Error("MetadataFactory error parsing SVG: Expected 'length', found '" + width.nodeName + "'");
                }
                meta.Width = Number(width.textContent);
                // [3] video lenght
                var height = width.nextElementSibling;
                width = null;
                if (height.localName !== "height") {
                    throw new Error("MetadataFactory error parsing SVG: Expected 'length', found '" + height.nodeName + "'");
                }
                meta.Height = Number(height.textContent);
                // [4] audio tracks
                meta.AudioTracks = [];
                var audioElement = height.nextElementSibling;
                var audioSource = audioElement.firstElementChild;
                while (!!audioSource) {
                    var type = AudioData.AudioSource.StringToType(SVGA.attr(audioSource, "type"));
                    meta.AudioTracks.push(new AudioData.AudioSource(SVGA.attr(audioSource, "src"), type));
                    audioSource = audioSource.nextElementSibling;
                }
                // That's it.
                return meta;
            };
            MetadataFactory.prototype.ToSVG = function (data) {
                // the "root" element
                var meta = SVGA.CreateElement("metadata");
                // video lenght
                var length = SVGA.CreateElement("length");
                length.textContent = data.Length.toFixed(3);
                meta.appendChild(length);
                length = null;
                // original video width
                var width = SVGA.CreateElement("width");
                width.textContent = data.Width.toFixed(0);
                meta.appendChild(width);
                width = null;
                // original video height
                var height = SVGA.CreateElement("height");
                height.textContent = data.Height.toFixed(0);
                meta.appendChild(height);
                height = null;
                // audio tracks
                var audioElement = SVGA.CreateElement("audio");
                for (var i = 0; i < data.AudioTracks.length; i++) {
                    var audioSource = data.AudioTracks[i];
                    var source = SVGA.CreateElement("source", {
                        "type": audioSource.MimeType,
                        "src": audioSource.Url
                    });
                    audioElement.appendChild(source);
                    source = null;
                }
                meta.appendChild(audioElement);
                // That's it.
                return meta;
            };
            return MetadataFactory;
        })();
        SVGAnimation.MetadataFactory = MetadataFactory;
    })(SVGAnimation = VideoFormat.SVGAnimation || (VideoFormat.SVGAnimation = {}));
})(VideoFormat || (VideoFormat = {}));
/// <reference path="../IO" />
/// <reference path="../../VideoData/Chunk" />
/// <reference path="ChunkFactories" />
/// <reference path="CommandFactories" />
/// <reference path="MetadataFactory" />
var VideoFormat;
(function (VideoFormat) {
    var SVGAnimation;
    (function (SVGAnimation) {
        var Video = VideoData.Video;
        var SVG = Helpers.SVG;
        var SVGA = Helpers.SVGA;
        /**
         * Read video information from an SVG file.
         */
        var IO = (function () {
            function IO() {
                this.VideoChunksLayerType = "video-chunks";
                // chain of responsibility - command factory and chunk factory
                // note: moving cursor is the most typical and far most frequent command - IT **MUST** BE FIRST IN THE CHAIN!
                this.commandFactory = new SVGAnimation.MoveCursorFactory(new SVGAnimation.DrawSegmentFactory(new SVGAnimation.ChangeBrushColorFactory(new SVGAnimation.ChangeBrushSizeFactory(new SVGAnimation.ClearCanvasFactory()))));
                this.chunkFactory = new SVGAnimation.VoidChunkFactory(new SVGAnimation.PathChunkFactory(new SVGAnimation.EraseChunkFactory()));
                this.metadataFactory = new SVGAnimation.MetadataFactory();
            }
            /**
             * Load video from defined URL
             * @param	{VideoData.Video}	data	Recorded video data
             * @return	{Blob}						The converted data.
             */
            IO.prototype.SaveVideo = function (data) {
                // init the document
                var type = document.implementation.createDocumentType('svg:svg', '-//W3C//DTD SVG 1.1//EN', 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd');
                var doc = document.implementation.createDocument('http://www.w3.org/2000/svg', 'svg', type);
                doc.documentElement.setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns:a", SVGA.Namespace);
                SVG.SetAttributes(doc.rootElement, {
                    width: data.Metadata.Width,
                    height: data.Metadata.Height,
                    viewBox: "0 0 " + data.Metadata.Width + " " + data.Metadata.Height
                });
                // save the metadata
                doc.rootElement.appendChild(this.metadataFactory.ToSVG(data.Metadata));
                // all the chunks
                var chunks = SVG.CreateElement("g");
                SVGA.SetAttributes(chunks, { "type": this.VideoChunksLayerType });
                data.Rewind();
                while (!!data.CurrentChunk) {
                    chunks.appendChild(this.chunkFactory.ToSVG(data.CurrentChunk, this.commandFactory));
                    data.MoveNextChunk();
                }
                doc.rootElement.appendChild(chunks);
                // serialize the document to string and then create a blob out of it
                var serializer = new XMLSerializer();
                var blob = new Blob([serializer.serializeToString(doc)], { type: "application/svg+xml" });
                return blob;
            };
            /**
             * Read an XML document and if it is valid, return the data contianed.
             * @param	{Document}	doc		Downloaded XML document.
             * @return	{Video}				Video data
             */
            IO.prototype.LoadVideo = function (doc) {
                if (doc instanceof Document === false) {
                    throw new Error("SVGAnimation IO parsing error: Document must be an XML document");
                }
                var xml = doc;
                if (xml.documentElement.childElementCount !== 2) {
                    throw new Error("SVGAnimation document root element must have exactely two children nodes, but has " + xml.documentElement.childNodes.length + " instead");
                }
                var video = new Video();
                // load video info
                var metaNode = xml.documentElement.firstElementChild;
                video.Metadata = this.metadataFactory.FromSVG(metaNode);
                // load chunks of data
                var chunksLayer = metaNode.nextElementSibling;
                if (chunksLayer.localName !== "g" || SVGA.attr(chunksLayer, "type") !== this.VideoChunksLayerType) {
                    throw new Error(("SVGAnimation IO parsing error: chunks layer must be a SVG\u00A0<g> node with a:type='" + this.VideoChunksLayerType + "',")
                        + (" got <" + chunksLayer.localName + "> with a:type='" + SVGA.attr(chunksLayer, "type") + "'"));
                }
                var chunk = chunksLayer.firstElementChild;
                while (!!chunk) {
                    video.PushChunk(this.chunkFactory.FromSVG(chunk, this.commandFactory));
                    chunk = chunk.nextElementSibling;
                }
                video.Rewind(); // currentChunk = 0
                return video;
            };
            return IO;
        })();
        SVGAnimation.IO = IO;
    })(SVGAnimation = VideoFormat.SVGAnimation || (VideoFormat.SVGAnimation = {}));
})(VideoFormat || (VideoFormat = {}));
/// <reference path="../Helpers/Errors" />
/// <reference path="../Drawing/DrawingStrategy" />
/// <reference path="../Drawing/SVGDrawer" />
/// <reference path="../Settings/PlayerSettings" />
/// <reference path="../UI/PlayerUI" />
/// <reference path="../AudioData/AudioPlayer" />
/// <reference path="../VideoData/Video" />
/// <reference path="../VideoFormat/IO" />
/// <reference path="../VideoFormat/SVGAnimation/IO" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="../UI/Cursor" />
/// <reference path="../Helpers/State" />
var VectorVideo;
(function (VectorVideo) {
    var AudioPlayer = AudioData.AudioPlayer;
    var VideoEvents = Helpers.VideoEvents;
    var VideoEventType = Helpers.VideoEventType;
    var Errors = Helpers.Errors;
    var ErrorType = Helpers.ErrorType;
    var Player = (function () {
        function Player(id, settings) {
            var _this = this;
            this.settings = settings;
            var container = document.getElementById(id);
            if (!container) {
                Helpers.Errors.Report(Helpers.ErrorType.Fatal, "Container #" + id + " doesn't exist. Video Player couldn't be initialised.");
            }
            if (!settings.Localization) {
                // default localization
                var loc = {
                    NoJS: "Your browser does not support JavaScript or it is turned off. Video can't be recorded without enabled JavaScript in your browser.",
                    DataLoadingFailed: "Unfortunatelly, downloading data failed.",
                    ControlPlayback: "Play/Pause video",
                    Play: "Play",
                    Pause: "Pause",
                    Replay: "Replay",
                    TimeStatus: "Video progress",
                    VolumeControl: "Volume controls",
                    VolumeUp: "Volume up",
                    VolumeDown: "Volume down",
                    Mute: "Mute",
                    Busy: "Loading..."
                };
                settings.Localization = loc;
            }
            // new paused timer
            this.timer = new Helpers.VideoTimer(false);
            // init the UI and bind it to an instance of a rendering strategy
            this.ui = new UI.PlayerUI(id, settings.Localization, this.timer);
            //this.drawer = !!settings.DrawingStrategy ? settings.DrawingStrategy : new Drawing.SVGDrawer(true);
            this.drawer = !!settings.DrawingStrategy ? settings.DrawingStrategy : new Drawing.CanvasDrawer(true);
            this.ui.AcceptCanvas(this.drawer.CreateCanvas());
            container.appendChild(this.ui.GetHTML());
            this.drawer.Stretch();
            if (!!settings.ShowControls) {
                this.ui.HideControls();
            }
            // Start and stop the video
            VideoEvents.on(VideoEventType.Start, function () { return _this.Play(); });
            VideoEvents.on(VideoEventType.Pause, function () { return _this.Pause(); });
            VideoEvents.on(VideoEventType.ReachEnd, function () { return _this.Pause(); });
            VideoEvents.on(VideoEventType.ClearCanvas, function (color) { return _this.ClearCavnas(color); });
            VideoEvents.on(VideoEventType.ChangeColor, function (color) { return _this.drawer.SetCurrentColor(color); });
            VideoEvents.on(VideoEventType.JumpTo, function (progress) { return _this.JumpTo(progress); });
            // Draw path segment by segment
            VideoEvents.on(VideoEventType.DrawSegment, function () { return _this.DrawSegment(); });
            VideoEvents.on(VideoEventType.DrawPath, function (path) {
                _this.drawnPath.DrawWholePath();
                _this.drawnPath = null; // it is already drawn!
            });
            // React for busy/ready state changes
            this.busyLevel = 0;
            VideoEvents.on(VideoEventType.Busy, function () { return _this.Busy(); });
            VideoEvents.on(VideoEventType.Ready, function () { return _this.Ready(); });
            // wait until the file is loaded
            VideoEvents.trigger(VideoEventType.Busy);
            // read the file
            Helpers.File.ReadXmlAsync(settings.Source, function (xml) { return _this.AcceptXMLData(xml); }, function (errStatusCode) {
                Errors.Report(ErrorType.Warning, _this.settings.Localization.DataLoadingFailed);
            });
        }
        Player.prototype.AcceptXMLData = function (xml) {
            var reader = new VideoFormat.SVGAnimation.IO();
            this.video = reader.LoadVideo(xml);
            this.audio = new AudioPlayer(this.video.Metadata.AudioTracks);
            VideoEvents.trigger(VideoEventType.VideoInfoLoaded, this.video.Metadata);
            var scalingFactor = this.drawer.SetupOutputCorrection(this.video.Metadata.Width, this.video.Metadata.Height);
            VideoEvents.trigger(VideoEventType.CanvasScalingFactor, scalingFactor);
            // do zero-time actions:
            this.video.RewindMinusOne(); // churrent chunk = -1
            this.MoveToNextChunk();
            VideoEvents.trigger(VideoEventType.Ready);
            // if autostart is set, then this is the right time to start the video 
            if (!!this.settings.Autoplay) {
                VideoEvents.trigger(VideoEventType.Start);
            }
        };
        /**
         * Start (resume) playing of the video from current position
         */
        Player.prototype.Play = function () {
            var _this = this;
            this.isPlaying = true;
            this.timer.Resume();
            !!this.audio && this.audio.Play();
            this.ticking = requestAnimationFrame(function () { return _this.Tick(); }); // start async ticking
        };
        /**
         * Pause playing of the video immediately
         */
        Player.prototype.Pause = function () {
            this.timer.Pause();
            this.isPlaying = false;
            !!this.audio && this.audio.Pause();
            cancelAnimationFrame(this.ticking);
        };
        Player.prototype.Tick = function () {
            var _this = this;
            this.Sync();
            this.ticking = requestAnimationFrame(function () { return _this.Tick(); });
        };
        Player.prototype.Sync = function () {
            // loop through the
            while (!!this.video.CurrentChunk
                && !!this.video.CurrentChunk.CurrentCommand
                && this.video.CurrentChunk.CurrentCommand.Time <= this.timer.CurrentTime()) {
                this.video.CurrentChunk.CurrentCommand.Execute();
                this.video.CurrentChunk.MoveNextCommand();
                // move to next chunk, if the last one just ended
                if (this.video.CurrentChunk.CurrentCommand === undefined) {
                    this.MoveToNextChunk();
                }
            }
        };
        Player.prototype.MoveToNextChunk = function () {
            do {
                this.video.MoveNextChunk();
                if (!this.video.CurrentChunk) {
                    this.ReachedEnd();
                    break;
                }
                // set current brush color and size, as well as cursor position
                // this will make sure that paths are rendered correctly even though I skip a lot of commands
                this.video.CurrentChunk.ExecuteInitCommands();
                // Prepare a path, if it is a PathChunk, of course                
                if (this.video.CurrentChunk instanceof VideoData.PathChunk) {
                    this.drawnPath = this.drawer.CreatePath();
                    // copy the information
                    var path = this.video.CurrentChunk.Path;
                    this.drawnPath.Segments = path.Segments;
                    this.drawnPath.Color = path.Color;
                    this.drawnSegment = 0; // rewind to the start
                    path = this.drawnPath; // replace the old one with this drawer-specific
                }
                else {
                    this.drawnPath = null;
                }
                if (this.video.PeekNextChunk()
                    && this.video.PeekNextChunk().StartTime <= this.timer.CurrentTime()) {
                    this.video.CurrentChunk.Render(); // render the whole chunk at once
                }
                else {
                    // this chunk will not be rendered at once
                    break;
                }
            } while (true);
        };
        /**
         * Skip to a specific time on the timeline. This method is used mainly when the user clicks
         * on the progressbar and the percents are calculated.
         * @param   {number}    progress    The progress to jump to in percent (value in [0; 1]).
         */
        Player.prototype.JumpTo = function (progress) {
            var wasPlaying = this.isPlaying;
            var time = progress * this.video.Metadata.Length; // convert to milliseconds
            var videoTime = this.timer.CurrentTime();
            this.timer.SetTime(time);
            this.audio.JumpTo(progress);
            if (this.isPlaying) {
                // pause after setting the time            
                VideoEvents.trigger(VideoEventType.Pause);
            }
            // sync the video:		
            var startChunk = 0;
            if (time >= videoTime) {
                startChunk = this.video.FastforwardErasedChunksUntil(time);
            }
            else {
                startChunk = this.video.RewindToLastEraseBefore(time);
            }
            if (startChunk !== this.video.CurrentChunkNumber) {
                this.video.SetCurrentChunkNumber = startChunk - 1;
                this.MoveToNextChunk(); // go throught the next chunk - including executing it's init commands                
            }
            this.Sync(); // make as many steps as needed to sync canvas status
            this.ui.UpdateCurrentTime(); // refresh the UI
            // video is paused, so ticking won't continue after it is synchronised
            // rendering request will also be made
            if (wasPlaying === true) {
                // pause after setting the time            
                VideoEvents.trigger(VideoEventType.Start);
            }
        };
        /**
         * Inform everyone, that I have reached the end
         */
        Player.prototype.ReachedEnd = function () {
            VideoEvents.trigger(VideoEventType.ReachEnd);
        };
        /**
         * Make the canvas clean.
         */
        Player.prototype.ClearCavnas = function (color) {
            this.drawer.ClearCanvas(color);
        };
        /**
         * Draw next segment of currently drawn path.
         */
        Player.prototype.DrawSegment = function () {
            if (this.drawnSegment === 0) {
                this.drawnPath.StartDrawingPath(this.drawnPath.Segments[0]);
                this.drawnSegment++;
            }
            else {
                this.drawnPath.DrawSegment(this.drawnPath.Segments[this.drawnSegment++]);
            }
            // flush the changes
            this.drawnPath.Draw();
        };
        /**
         * Somethimg is taking long time -- probably downloading xml or audio files
         */
        Player.prototype.Busy = function () {
            this.busyLevel++;
            this.wasPlayingWhenBusy = this.wasPlayingWhenBusy || this.isPlaying;
            VideoEvents.trigger(VideoEventType.Pause);
            this.ui.Busy();
        };
        /**
         * The thing that instructed
         */
        Player.prototype.Ready = function () {
            if (--this.busyLevel === 0) {
                if (this.wasPlayingWhenBusy === true) {
                    VideoEvents.trigger(VideoEventType.Start);
                    this.wasPlayingWhenBusy = false;
                }
                this.ui.Ready();
            }
        };
        return Player;
    })();
    VectorVideo.Player = Player;
})(VectorVideo || (VectorVideo = {}));
/// <reference path="../Drawing/DrawingStrategy.ts" />
/// <reference path="../Localization/IRecorderLocalization.ts" />
/// <reference path="../UI/Color" />
/// <reference path="../UI/Brush" />
/// <reference path="audio.d.ts" />
/// <reference path="AudioPlayer" />
/// <reference path="../Settings/RecorderSettings" /> 
/// <reference path="../Helpers/Errors" />
/// <reference path="../Helpers/VideoEvents" />
var AudioData;
(function (AudioData) {
    var Errors = Helpers.Errors;
    var ErrorType = Helpers.ErrorType;
    var VideoEvents = Helpers.VideoEvents;
    var VideoEventType = Helpers.VideoEventType;
    /**
     * The main audio recording class.
     * This implementation wraps the HTML5 API and takes care of everything needed on the client side.
     */
    var AudioRecorder = (function () {
        /**
         * Initialise the audio recoder
         * @param	config	Audio recorder settings from the outside.
         */
        function AudioRecorder(config) {
            /** Is the audio being captured? */
            this.recording = false;
            /** @type {Boolean} */
            this.initSuccessful = false;
            /** @type {Boolean} */
            this.doNotStartRecording = false;
            /** Default settings of audio recording */
            this.settings = {
                host: "http://localhost",
                port: 4000,
                path: "/upload/audio",
                recordingWorkerPath: "/js/workers/RecordingWorker.js" // Path to the recording web Worker.
            };
            // update default settings
            if (!!config.host)
                this.settings.host = config.host;
            if (!!config.port)
                this.settings.port = config.port;
            if (!!config.path)
                this.settings.path = config.path;
            // wait until the user starts recording
            this.recording = false;
        }
        /**
         * Prepare audio recording.
         * Unless the website uses an SSL certificate, the browser will ask for microphone access
         * each time this method is called.
         * @param	success		Initialisation success callback
         */
        AudioRecorder.prototype.Init = function (success) {
            var _this = this;
            navigator.getUserMedia = (navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia);
            if (!!navigator.getUserMedia && window.hasOwnProperty("AudioContext")) {
                var context = (new AudioContext() // FF, GCh
                    || null); // others
                navigator.getUserMedia(
                // constraints - we record only audio
                {
                    video: false,
                    audio: true
                }, 
                // success callback
                function (localMediaStream) {
                    if (_this.doNotStartRecording === false) {
                        _this.input = context.createMediaStreamSource(localMediaStream);
                        // create processing node
                        var bufferSize = 2048;
                        var recorder = context.createScriptProcessor(bufferSize, 1, 1);
                        recorder.onaudioprocess = function (data) { return _this.processData(data); };
                        _this.input.connect(recorder);
                        recorder.connect(context.destination);
                        _this.initSuccessful = true;
                        // create web worker audio processor
                        _this.CreateAudioProcessor("web-socket", _this.settings, function () { return console.log("Audio recording is ready."); });
                        // call callback and register the tool for later
                        if (!!success) {
                            success();
                        }
                        VideoEvents.trigger(VideoEventType.RegisterRecordingTool, "audio-recorder");
                    }
                }, 
                // error callback
                function (err) {
                    if (err.name === "PermissionDeniedError") {
                        Errors.Report(ErrorType.Warning, "User didn't allow microphone recording.");
                    }
                    Errors.Report(ErrorType.Warning, "Can't record audio", err);
                });
            }
            else {
                console.log("getUserMedia not supported by the browser");
                Errors.Report(ErrorType.Warning, "getUserMedia not supported by the browser");
            }
        };
        /**
         * Creates a web worker that will process the audio and upload it to the server.
         * @param	processorType	Type of the audio processor.
         * @param	cfg				Upload configuration.
         * @param	success			This callback will be called if the worker is created
         * @param	error			This callback will be called if web workers aren't supported
         */
        AudioRecorder.prototype.CreateAudioProcessor = function (processorType, cfg, success, error) {
            if (Worker) {
                this.recordingWorker = new Worker(cfg.recordingWorkerPath);
                this.recordingWorker.postMessage({
                    cmd: "init",
                    AudioProcessorType: processorType || "web-sockets",
                    port: cfg.port,
                    host: cfg.host,
                    path: cfg.path
                });
                // call optional user's callback
                if (!!success) {
                    success();
                }
            }
            else {
                Errors.Report(ErrorType.Fatal, "No web workers support - this feature is not supported by the browser.");
                // call optional user's callback
                if (!!error) {
                    error();
                }
            }
        };
        /**
         * Start recording
         */
        AudioRecorder.prototype.Start = function () {
            // check, if recorder was successfully initialised first
            if (this.initSuccessful === true) {
                if (!this.recordingWorker) {
                    Errors.Report(ErrorType.Fatal, "No audio processor was set.");
                    return false;
                }
                else {
                    this.recording = true;
                    return true;
                }
            }
            else {
                // user didn't allow the audio recording (or doesn't have a microphone)
                this.doNotStartRecording = true;
                // idea for future development:
                // If there is a way to hide the "allow microphone access" (-> I dan't want to access the microphone any more,
                // the user already started recording without it) bar or popup, implement it here.
                // - I haven't yet found how to accomplish that...
                return false;
            }
        };
        /**
         * Continue recording
         */
        AudioRecorder.prototype.Continue = function () {
            // check, if recorder was successfully initialised first
            if (this.initSuccessful) {
                if (!this.recordingWorker) {
                    Errors.Report(ErrorType.Fatal, "No audio processor was set.");
                    return false;
                }
                else {
                    this.recording = true;
                    return true;
                }
            }
            else {
            }
            return false;
        };
        /**
         * Pause recording
         */
        AudioRecorder.prototype.Pause = function () {
            // check, if recorder was successfully initialised first
            if (this.initSuccessful) {
                this.recording = false;
                return true;
            }
            else {
            }
            return false;
        };
        /**
         * Stop the recording
         */
        AudioRecorder.prototype.Stop = function (success, error) {
            if (this.initSuccessful === true) {
                // stop recording
                if (this.Pause()) {
                    if (this.recordingWorker) {
                        // prepare for response from the worker first
                        this.recordingWorker.onmessage = function (e) {
                            var msg = e.data;
                            if (!msg.hasOwnProperty("error")) {
                                console.log("Worker response is invalid (missing property 'error')", e.data);
                                error();
                                return;
                            }
                            if (msg.error === true) {
                                Errors.Report(ErrorType.Fatal, msg.message);
                                error();
                                return;
                            }
                            else {
                                VideoEvents.trigger(VideoEventType.RecordingToolFinished, "audio-recorder");
                                var sources = [];
                                for (var i = 0; i < msg.files.length; i++) {
                                    var file = msg.files[i];
                                    var source = new AudioData.AudioSource(file.url, AudioData.AudioSource.StringToType(file.type));
                                    sources.push(source);
                                }
                                success(sources);
                            }
                        };
                        // now send the message to the worker
                        this.recordingWorker.postMessage({
                            cmd: "finish"
                        });
                    }
                }
            }
            else {
                // there was no recording
                Errors.Report(ErrorType.Warning, "Can't stop AudioRecorder - it wasn't ever initialised.");
                error();
            }
        };
        /**
         *
         */
        AudioRecorder.prototype.isRecording = function () {
            return this.initSuccessful;
        };
        /**
         *
         */
        AudioRecorder.prototype.processData = function (data) {
            if (this.recording === false) {
                return; // recording has not started or is paused
            }
            // grab only the left channel - lower quality but half the data to transfer..
            // most NTB microphones are mono..
            var left = data.inputBuffer.getChannelData(0);
            if (this.recordingWorker) {
                this.recordingWorker.postMessage({
                    cmd: "pushData",
                    data: left
                });
            }
        };
        return AudioRecorder;
    })();
    AudioData.AudioRecorder = AudioRecorder;
})(AudioData || (AudioData = {}));
/// <reference path="../Helpers/State" />
/// <reference path="ICursor" />
/// <reference path="../Helpers/VideoTimer" />
/// <reference path="../Helpers/VideoEvents" />
var VideoData;
(function (VideoData) {
    var VideoEvents = Helpers.VideoEvents;
    var VideoEventType = Helpers.VideoEventType;
    var CursorState = Helpers.CursorState;
    var Timer = Helpers.VideoTimer;
    /**
     * Mouse input detection and processing.
     */
    var PointingDevice = (function () {
        function PointingDevice(board) {
            var _this = this;
            this.board = board;
            // video events			
            VideoEvents.on(VideoEventType.Start, function () { return _this.Start(); });
            VideoEvents.on(VideoEventType.Start, function () { return _this.Start(); });
            VideoEvents.on(VideoEventType.Pause, function () { return _this.Pause(); });
            VideoEvents.on(VideoEventType.Stop, function () { return _this.Pause(); });
            // init the timer - a high resolution timer, if possible
            this.timer = new Timer();
            this.timer.Pause();
            this.isHoveringOverUIControl = false;
        }
        /** Last known cursor position */
        PointingDevice.prototype.getCursor = function () { return this.cursor; };
        /**
         * Filter all clicks on buttons and other possible UI controls
         */
        PointingDevice.prototype.InitControlsAvoiding = function () {
            var _this = this;
            var controls = document.getElementsByClassName("ui-control");
            for (var i = 0; i < controls.length; i++) {
                var element = controls[i];
                element.onmouseover = function (e) { return _this.isHoveringOverUIControl = true; };
                element.onmouseout = function (e) { return _this.isHoveringOverUIControl = false; };
            }
        };
        /**
         * Start capturing mouse movement.
         */
        PointingDevice.prototype.Start = function () {
            this.isRunning = true;
            this.timer.Resume();
        };
        /**
         * Pause mouse movement caputring.
         */
        PointingDevice.prototype.Pause = function () {
            this.isRunning = false;
            this.timer.Pause();
        };
        /**
         * Mouse pressure is either 1 (mouse button is down) or 0 (mouse button is up) while the mouse is inside the area of canvas.
         */
        PointingDevice.prototype.GetPressure = function () {
            return (this.isDown === true && this.isInside === true) ? 1 : 0;
        };
        /**
         * Trace mouse movement.
         */
        PointingDevice.prototype.onMove = function (e) {
            //if(this.isRunning) { // experiment: track mouse movement event when not recording, but don't record clicking		
            this.cursor = this.getCursorPosition(e);
            this.ReportAction();
            //}
        };
        /**
         * Start drawing lines.
         */
        PointingDevice.prototype.onDown = function (e) {
            if (this.isHoveringOverUIControl === false) {
                this.isDown = true;
                this.cursor = this.getCursorPosition(e);
                this.ReportAction();
            }
        };
        /**
         * Stop drawing lines.
         */
        PointingDevice.prototype.onUp = function (e) {
            //if(this.isRunning) {
            this.isDown = false;
            this.cursor = this.getCursorPosition(e);
            this.ReportAction();
            //}
        };
        /**
         * Stop drawing lines.
         */
        PointingDevice.prototype.onLeave = function (e) {
            if (this.GetPressure() > 0) {
                this.onMove(e); // draw one more segment
                this.isDown = false;
                this.onMove(e); // discontinue the line
                this.isDown = true; // back to current state
            }
            this.isInside = false;
        };
        /**
         * Mark down that the cursor is hovering over the canvas.
         */
        PointingDevice.prototype.onOver = function (e) {
            this.isInside = true;
        };
        /**
         * Force stop drawing lines.
         */
        PointingDevice.prototype.onLooseFocus = function (e) {
            this.isInside = false;
            this.isDown = false;
        };
        /**
         * Extract the information about cursor position relative to the board.
         */
        PointingDevice.prototype.getCursorPosition = function (e) {
            if (e.clientX == undefined || e.clientY == undefined) {
                console.log("Wrong 'getCursorPosition' parameter. Event data required.");
            }
            return {
                x: e.clientX,
                y: e.clientY
            };
        };
        /**
         * Report cursor movement
         */
        PointingDevice.prototype.ReportAction = function () {
            var state = new CursorState(this.timer.CurrentTime(), this.cursor.x, this.cursor.y, this.GetPressure());
            VideoEvents.trigger(VideoEventType.CursorState, state);
        };
        return PointingDevice;
    })();
    VideoData.PointingDevice = PointingDevice;
})(VideoData || (VideoData = {}));
/// <reference path="../Helpers/State" />
/// <reference path="ICursor" />
/// <reference path="../Helpers/VideoTimer" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="PointingDevice" />
var VideoData;
(function (VideoData) {
    /**
     * Mouse input detection and processing.
     */
    var Mouse = (function (_super) {
        __extends(Mouse, _super);
        function Mouse(board) {
            var _this = this;
            _super.call(this, board);
            // board events						
            this.board.onmousemove = function (e) { return _this.onMouseMove(e); };
            this.board.onmousedown = function (e) { return _this.onMouseDown(e); };
            this.board.onmouseup = function (e) { return _this.onMouseUp(e); };
            this.board.onmouseleave = function (e) { return _this.onMouseLeave(e); }; // release the mouse also when the user tries to draw outside of the "board"
            this.board.onmouseenter = function (e) { return _this.onMouseEnter(e); };
            this.board.onmouseover = function (e) { return _this.onMouseOver(e); }; // maybe start a new line, if the button is pressed
        }
        /**
         * Filter all clicks on buttons and other possible UI controls
         */
        Mouse.prototype.InitControlsAvoiding = function () {
            var _this = this;
            var controls = document.getElementsByClassName("ui-control");
            for (var i = 0; i < controls.length; i++) {
                var element = controls[i];
                element.onmouseover = function (e) { return _this.isHoveringOverUIControl = true; };
                element.onmouseout = function (e) { return _this.isHoveringOverUIControl = false; };
            }
        };
        /**
         * Trace mouse movement.
         */
        Mouse.prototype.onMouseMove = function (e) {
            this.onMove(e);
        };
        /**
         * Start drawing lines.
         */
        Mouse.prototype.onMouseDown = function (e) {
            this.onDown(e);
        };
        /**
         * Stop drawing lines.
         */
        Mouse.prototype.onMouseUp = function (e) {
            this.onUp(e);
        };
        /**
         * Stop drawing lines.
         */
        Mouse.prototype.onMouseLeave = function (e) {
            this.onLeave(e);
        };
        /**
         * Make sure the status of mouse button is consistent.
         */
        Mouse.prototype.onMouseEnter = function (e) {
            if (e.buttons === 0) {
                this.isDown = false; // check mouse down status
            }
        };
        /**
         * Mark down that the cursor is hovering over the canvas.
         */
        Mouse.prototype.onMouseOver = function (e) {
            this.isInside = true;
        };
        return Mouse;
    })(VideoData.PointingDevice);
    VideoData.Mouse = Mouse;
})(VideoData || (VideoData = {}));
/// <reference path="Mouse.ts" />
/// <reference path="../Helpers/HTML.ts" />
var VideoData;
(function (VideoData) {
    /**
     * Touch Events API
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
     */
    var TouchEventsAPI = (function (_super) {
        __extends(TouchEventsAPI, _super);
        function TouchEventsAPI(board) {
            var _this = this;
            _super.call(this, board); // obligatory parent constructor call
            board.addEventListener("touchstart", function (ev) { return _this.TouchStart(ev); });
            board.addEventListener("touchend", function (ev) { return _this.TouchEnd(ev); });
            board.addEventListener("touchcancel", function (ev) { return _this.TouchEnd(ev); });
            board.addEventListener("touchleave", function (ev) { return _this.TouchLeave(ev); });
            board.addEventListener("touchmove", function (ev) { return _this.TouchMove(ev); });
        }
        TouchEventsAPI.prototype.TouchStart = function (event) {
            event.preventDefault();
            var touches = event.changedTouches;
            // select the first touch and follow only this one touch			
            var touch = touches[0];
            this.currentTouch = touch.identifier;
            this.onDown(touch);
        };
        TouchEventsAPI.prototype.TouchLeave = function (event) {
            event.preventDefault();
            var touch = this.filterTouch(event.changedTouches);
            if (touch === null) {
                return; // current touch hasn't left the board
            }
            this.onLeave(touch);
        };
        TouchEventsAPI.prototype.TouchEnd = function (event) {
            event.preventDefault();
            var touch = this.filterTouch(event.changedTouches);
            if (touch === null) {
                return;
            }
            this.onUp(touch);
            // forget about the one concrete touch
            this.currentTouch = null;
        };
        TouchEventsAPI.prototype.TouchMove = function (event) {
            event.preventDefault();
            var touch = this.filterTouch(event.changedTouches);
            if (touch === null) {
                return;
            }
            this.onMove(touch);
        };
        /**
         * Find the current touch by it's identifier
         */
        TouchEventsAPI.prototype.filterTouch = function (touchList) {
            for (var i = 0; i < touchList.length; i++) {
                var element = touchList[i];
                if (element.identifier === this.currentTouch) {
                    return element;
                }
            }
            return null;
        };
        return TouchEventsAPI;
    })(VideoData.PointingDevice);
    VideoData.TouchEventsAPI = TouchEventsAPI;
})(VideoData || (VideoData = {}));
/// <reference path="../Helpers/State" />
/// <reference path="ICursor" />
/// <reference path="../Helpers/VideoTimer" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="PointingDevice" />
var VideoData;
(function (VideoData) {
    /**
     * Mouse input detection and processing.
     */
    var PointerEventsAPI = (function (_super) {
        __extends(PointerEventsAPI, _super);
        function PointerEventsAPI(board) {
            var _this = this;
            _super.call(this, board);
            // board events						
            this.board.addEventListener("pointermove", function (e) { return _this.onPointerMove(e); });
            this.board.addEventListener("pointerdown", function (e) { return _this.onPointerDown(e); });
            this.board.addEventListener("pointerup", function (e) { return _this.onPointerUp(e); });
            this.board.addEventListener("pointerleave", function (e) { return _this.onPointerLeave(e); }); // release the mouse also when the user tries to draw outside of the "board"
            this.board.addEventListener("pointerenter", function (e) { return _this.onPointerLeave(e); });
            this.board.addEventListener("pointerover", function (e) { return _this.onPointerOver(e); }); // maybe start a new line, if the button is pressed
            this.currentEvent = null;
            this.isDown = false;
        }
        /**
         * Return pressure of the mouse, touch or pen.
         */
        PointerEventsAPI.prototype.GetPressure = function () {
            if (this.isDown === false || this.currentEvent === null) {
                return 0; // no envent, no pressure
            }
            // if(this.currentEvent.pointerType === "mouse"
            // 	|| this.currentEvent.pointerType === "touch") {
            // 		return 1; // button is pressed or touchscreen touched - maximum presure
            // }
            return this.currentEvent.pressure; // this device knows, what is current pressure
        };
        /**
         * Filter all clicks on buttons and other possible UI controls
         */
        PointerEventsAPI.prototype.InitControlsAvoiding = function () {
            var _this = this;
            var controls = document.getElementsByClassName("ui-control");
            for (var i = 0; i < controls.length; i++) {
                var element = controls[i];
                element.onpointerover = function (e) { return _this.isHoveringOverUIControl = true; };
                element.onpointerout = function (e) { return _this.isHoveringOverUIControl = false; };
            }
        };
        /**
         * Trace mouse movement.
         */
        PointerEventsAPI.prototype.onPointerMove = function (e) {
            this.onMove(e);
            this.currentEvent = e;
        };
        /**
         * Start drawing lines.
         */
        PointerEventsAPI.prototype.onPointerDown = function (e) {
            this.onDown(e);
            this.currentEvent = e;
        };
        /**
         * Stop drawing lines.
         */
        PointerEventsAPI.prototype.onPointerUp = function (e) {
            this.onUp(e);
            this.currentEvent = e;
        };
        /**
         * Stop drawing lines.
         */
        PointerEventsAPI.prototype.onPointerLeave = function (e) {
            this.onLeave(e);
            this.currentEvent = e;
        };
        /**
         * Make sure the status of mouse button is consistent.
         */
        PointerEventsAPI.prototype.onPointerEnter = function (e) {
            if (e.buttons === 0) {
                this.isDown = false; // check mouse down status
            }
            this.currentEvent = e;
        };
        /**
         * Mark down that the cursor is hovering over the canvas.
         */
        PointerEventsAPI.prototype.onPointerOver = function (e) {
            this.isInside = true;
            this.currentEvent = e;
        };
        return PointerEventsAPI;
    })(VideoData.PointingDevice);
    VideoData.PointerEventsAPI = PointerEventsAPI;
})(VideoData || (VideoData = {}));
/// <reference path="Mouse.ts" />
/// <reference path="../Helpers/HTML.ts" />
var VideoData;
(function (VideoData) {
    /**
     * Pointer type
     * see http://www.wacomeng.com/web/WebPluginReleaseNotes.htm#Group_x0020_77
     */
    var WacomPointerType;
    (function (WacomPointerType) {
        WacomPointerType[WacomPointerType["OutOfProximity"] = 0] = "OutOfProximity";
        WacomPointerType[WacomPointerType["Pen"] = 1] = "Pen";
        WacomPointerType[WacomPointerType["Mouse"] = 2] = "Mouse";
        WacomPointerType[WacomPointerType["Eraseer"] = 3] = "Eraseer";
    })(WacomPointerType || (WacomPointerType = {}));
    /**
     * Wacom tablets can be used to enhance the recording with their ability to detect pen pressure
     * for variable thickness of drawn lines.
     */
    var WacomTablet = (function (_super) {
        __extends(WacomTablet, _super);
        function WacomTablet(board, penApi) {
            _super.call(this, board); // obligatory parent constructor call
            this.penApi = penApi;
        }
        /**
         * Current level of pressure. When the mouse is outside of the canvas, then it is automaticaly zero.
         * @return {number}	The pressure from 0.0 to 1.0
         */
        WacomTablet.prototype.GetPressure = function () {
            if (this.penApi && this.penApi.pointerType == WacomPointerType.Pen) {
                return this.isInside === true ? this.penApi.pressure : 0; // pressure is from 0.0 (no pressure) to 1.0 (max pressure)
            }
        };
        /**
         * Is Wacom API available on this computer and this browser?
         */
        WacomTablet.IsAvailable = function () {
            // create the plugin according to the documentation
            var plugin = Helpers.HTML.CreateElement("object", { type: "application/x-wacomtabletplugin" });
            plugin.style.display = "none";
            document.body.appendChild(plugin);
            // does the plugin work?
            if (!!plugin.version === true) {
                console.log("Wacom tablet is connected and plugin installed. Plugin version is " + plugin.version + ".");
                return plugin.penAPI;
            }
            return null;
        };
        return WacomTablet;
    })(VideoData.Mouse);
    VideoData.WacomTablet = WacomTablet;
})(VideoData || (VideoData = {}));
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
            if (curved === void 0) { curved = true; }
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
            this.originalHeight = height;
            this.originalWidth = width;
            Helpers.HTML.SetAttributes(this.canvas, {
                width: width,
                height: height
            });
            Helpers.VideoEvents.trigger(Helpers.VideoEventType.CanvasSize, width, height);
        };
        CanvasDrawer.prototype.SetupOutputCorrection = function (sourceWidth, sourceHeight) {
            var wr = this.canvas.width / sourceWidth;
            var hr = this.canvas.height / sourceHeight;
            var min = Math.min(wr, hr);
            // prepare scale uniformly 
            this.canvas.width = min * sourceWidth;
            this.canvas.height = min * sourceHeight;
            this.context.scale(min, min);
            // translate the (0,0) point
            if (wr < hr) {
            }
            else if (hr < wr) {
            }
            // else - the ratios match      
            this.originalHeight = sourceHeight;
            this.originalWidth = sourceWidth;
            return min;
        };
        /**
         * Make the canvas blank.
         */
        CanvasDrawer.prototype.ClearCanvas = function (color) {
            this.context.fillStyle = color.CssValue;
            this.context.fillRect(0, 0, this.originalWidth, this.originalHeight);
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
/// <reference path="Path" />
/// <reference path="../Helpers/VideoTimer" />
var Drawing;
(function (Drawing) {
    var Vector2 = Helpers.Vector2;
    var VideoEvents = Helpers.VideoEvents;
    var VideoEventType = Helpers.VideoEventType;
    /**
     * This class is an implementation of the algorithm originally created
     * in 1989 by Paul Haeberli - see http://www.sgi.com/grafica/dyna/index.html
     * The algorithm is based on physical properties of an object which is guided
     * by mouse movement.
     */
    var DynaDraw = (function () {
        /**
         * Initialise new instance of DynaDraw
         */
        function DynaDraw(pathFactory, slowSimulation, minBrushSize, maxBrushSize, timer) {
            var _this = this;
            this.pathFactory = pathFactory;
            this.slowSimulation = slowSimulation;
            this.minBrushSize = minBrushSize;
            this.maxBrushSize = maxBrushSize;
            /** Physical constants */
            this.minMass = 1;
            this.maxMass = 10;
            this.minFriction = 0.4; // 0.4 is experimentaly derived constant, that gives nice results for all weights
            this.maxFriction = 0.6;
            /**
             * Each brush has different properties - larger brushes are heavier and have greater drag
             */
            this.brushes = {};
            this.oneFrame = 1000 / 60; // 60 Hz in milliseconds
            // 						
            //this.cursor = new BrushTip(slowSimulation, timer); // when slow simulation is on, use width adjustments when moving fast
            this.cursor = new BrushTip(true, timer);
            // start the periodical simulation right away!
            if (slowSimulation === true) {
                requestAnimationFrame(function (time) {
                    _this.lastAnimationTime = time;
                    _this.Tick(time);
                });
            }
            else {
                requestAnimationFrame(function () { return _this.TickWhile(); });
            }
        }
        /**
         * Set current brush size
         * @param   size    The new size of the brush (line thickness)
         */
        DynaDraw.prototype.SetBrushSize = function (size) {
            this.currentBrushSize = size;
        };
        DynaDraw.prototype.interpolateMass = function (brushSize) {
            return this.minMass + (this.maxMass - this.minMass) * (brushSize - this.minBrushSize) / (this.maxBrushSize - this.minBrushSize);
        };
        DynaDraw.prototype.interpolateFriction = function (brushSize) {
            return this.maxFriction - (this.maxFriction - this.minFriction) * (brushSize - this.minBrushSize) / (this.maxBrushSize - this.minBrushSize);
        };
        DynaDraw.prototype.GetBrush = function (brushSize) {
            if (!this.brushes[brushSize]) {
                this.brushes[brushSize] = new BrushInstance(this.interpolateMass(brushSize), this.interpolateFriction(brushSize), brushSize);
            }
            return this.brushes[brushSize];
        };
        /**
         * Process next state and
         */
        DynaDraw.prototype.ObserveCursorMovement = function (cursor) {
            try {
                var nextPoint = new Vector2(cursor.X, cursor.Y);
                if (cursor.Pressure > 0) {
                    if (!this.lastState || this.lastState.Pressure === 0) {
                        // start a new path - prepare new chunk		
                        this.path = this.pathFactory();
                        VideoEvents.trigger(VideoEventType.StartPath, this.path);
                        this.StartPath(nextPoint, cursor.Pressure);
                    }
                    else {
                        this.NextPoint(nextPoint, cursor.Pressure);
                    }
                }
                else if (this.lastState && this.lastState.Pressure > 0) {
                    this.EndPath(nextPoint, this.lastState.Pressure);
                }
            }
            catch (err) {
                console.log("ProcessNewState error: ", err);
            }
            this.lastState = cursor;
        };
        /**
         * Start drawing a new path with a given color and brush size.
         * @param	{Vector2}		position	Cursor state information
         * @param	{number}		pressure	Cursor pressure
         */
        DynaDraw.prototype.StartPath = function (position, pressure) {
            this.cursor.Reset(position, this.GetBrush(this.currentBrushSize.Size));
            this.position = position;
            this.pressure = pressure;
            this.cursor.StartPath(this.path, position, pressure);
        };
        /**
         * Animate cursor movement
         * @param	{Vector2}		position	Cursor state information
         * @param	{number}		pressure	Cursor pressure
         */
        DynaDraw.prototype.NextPoint = function (position, pressure) {
            this.position = position;
            this.pressure = pressure;
        };
        /**
         * Stop drawing the line when the mouse or digital pen is released.
         * @param	{Vector2}		position	Cursor state information
         * @param	{number}		pressure	Cursor pressure
         */
        DynaDraw.prototype.EndPath = function (position, pressure) {
            this.position = position;
        };
        /**
         * Simulate brush's movement frame by frame as long as it keeps moving.
         * This approach will be more responsive (the path will always reach the cursor before it moves in a different direction),
         * but the resulting curves aren't as nice and smooth as with the regular simulation.
         */
        DynaDraw.prototype.TickWhile = function () {
            var _this = this;
            if (!!this.position) {
                var d2 = 0; // squared distance the brush has traveled
                var step = 0;
                do {
                    d2 = this.cursor.ApplyForce(this.position, 1);
                    step += d2;
                    if (step > this.currentBrushSize.Size) {
                        this.cursor.Draw(this.path, this.pressure);
                        step = 0;
                    }
                } while (d2 > 0);
                // draw the rest
                if (step > 0) {
                    this.cursor.Draw(this.path, this.pressure);
                }
                this.position = null; // skip Apply(..) that will return false next time
            }
            // do the next tick
            requestAnimationFrame(function (time) { return _this.TickWhile(); }); // ~ 60 FPS
        };
        DynaDraw.prototype.Tick = function (time) {
            var _this = this;
            if (!!this.position) {
                if (this.cursor.ApplyForce(this.position, (time - this.lastAnimationTime) / this.oneFrame) > 0) {
                    this.cursor.Draw(this.path, this.pressure);
                }
                else {
                    this.position = null; // skip Apply(..) that will return false next time	
                }
            }
            // do the next tick
            this.lastAnimationTime = time;
            requestAnimationFrame(function (time) { return _this.Tick(time); }); // ~ 60 FPS
            //setTimeout(() => this.Tick(time + 1), 1); // ~ 1000 FPS
            //setTimeout(() => this.Tick(time + 30), 30); // ~ 30 FPS
            //setTimeout(() => this.Tick(time + 200), 200); // ~ 30 FPS
        };
        return DynaDraw;
    })();
    Drawing.DynaDraw = DynaDraw;
    /**
     * Set of brush properties that have effect on the outcome
     */
    var BrushInstance = (function () {
        function BrushInstance(mass, friction, size) {
            this.mass = mass;
            this.friction = friction;
            this.size = size;
        }
        Object.defineProperty(BrushInstance.prototype, "Mass", {
            get: function () { return this.mass; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BrushInstance.prototype, "Friction", {
            get: function () { return this.friction; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BrushInstance.prototype, "Size", {
            get: function () { return this.size; },
            enumerable: true,
            configurable: true
        });
        return BrushInstance;
    })();
    /**
     * Brush with all it's physical properties
     * - implementation of the "filter" in the original algorithm
     */
    var BrushTip = (function () {
        function BrushTip(calculateSpeed, timer) {
            this.calculateSpeed = calculateSpeed;
            this.timer = timer;
        }
        /**
         * @param	{Vector2}		position	The starting point of the cursor.
         * @param	{BrushInstance} brush  		Physical properties of the brush.
         */
        BrushTip.prototype.Reset = function (position, brush) {
            this.brush = brush;
            this.position = position.clone();
            this.startPosition = position.clone();
            this.previousPosition = position.clone();
            this.previousPressure = -1; // negative means, there is no pressure information yet
            this.mousePosition = position.clone();
            this.acceleration = new Vector2(0, 0);
            this.velocity = new Vector2(0, 0);
            this.firstSegment = true;
        };
        /**
         * Apply force created by mouse movement
         * @param 	{Vector2}	mouse 			Mouse position
         * @param	{number}	elapsedFrames	The number of frames elapsed since last movement
         * @return	{number}					Brush movement distance squared
         */
        BrushTip.prototype.ApplyForce = function (mouse, elapsedFrames) {
            // calculate the force
            var force = mouse.clone().subtract(this.position);
            if (force.getSizeSq() < 1 /* Force */) {
                return 0; // too subtle movement
            }
            // calculate acceleration and velocity
            this.acceleration = force.clone().scale(1 / this.brush.Mass); // derived from the definition of force: (->)a = (->)f / m
            this.velocity.add(this.acceleration);
            if (this.velocity.getSizeSq() < 1 /* Velocity */) {
                return 0; // nearly no movement (a "heavy" brush)
            }
            // destroy unnecessary references
            this.mousePosition = mouse.clone();
            mouse = null;
            force = null;
            this.acceleration = null;
            // calculate the angle of the mouse
            this.angle = this.velocity.getNormal();
            // apply the drag of the digital drawing tool
            this.velocity.scale((1 - this.brush.Friction) * elapsedFrames); // more friction means less movement
            // update position
            this.position.add(this.velocity);
            return this.velocity.getSizeSq(); // there is something to render
        };
        /**
         * Draw next segment
         */
        BrushTip.prototype.Draw = function (path, pressure) {
            // the quicker the brush moves, the smaller print it leaves 
            var relativeSpeed = this.calculateSpeed === true ? this.velocity.getSize() / (this.brush.Size * this.brush.Size) : 0; // set to 0 if no speed correction is used
            var width = this.getRadius(pressure, relativeSpeed);
            this.angle.scale(width);
            if (this.firstSegment) {
                path.InitPath(this.startPosition.clone().add(this.angle), this.startPosition.clone().subtract(this.angle));
                this.firstSegment = false;
            }
            path.ExtendPath(this.position.clone().add(this.angle), this.position.clone().subtract(this.angle));
            path.Draw();
        };
        BrushTip.prototype.StartPath = function (path, pt, pressure) {
            path.StartPath(pt, this.getRadius(pressure, 0));
        };
        /**
         * Calculate current radius from pressure and speed of the cursor.
         */
        BrushTip.prototype.getRadius = function (pressure, speed) {
            // I must interpolate the pressure between the last point and current pressure in the 
            if (this.previousPressure < 0)
                this.previousPressure = pressure;
            var interpolatedPressure = this.interpolatePressure(pressure);
            var radius = this.speedFactor(speed) * this.brush.Size * interpolatedPressure / 2;
            // save for next time
            this.previousPosition = this.position;
            this.previousPressure = interpolatedPressure;
            return radius;
        };
        /**
         * Get current pressure - achieve smooth pressure gradients
         */
        BrushTip.prototype.interpolatePressure = function (mousePressure) {
            var d1 = this.position.distanceTo(this.previousPosition);
            var d2 = this.position.distanceTo(this.mousePosition);
            if (d1 === 0 && d2 === 0) {
                return mousePressure; // I don't have to interpolate
            }
            return (d1 / (d1 + d2)) * (mousePressure - this.previousPressure) + this.previousPressure;
        };
        /**
         * Determine the effect of the speed on thickness of the path
         */
        BrushTip.prototype.speedFactor = function (speed) {
            return Math.max(1 - speed, 0.4);
        };
        /** Mouse movement threshold - ingore too subtle mouse movements */
        BrushTip.threshold = 0.001;
        return BrushTip;
    })();
})(Drawing || (Drawing = {}));
/// <reference path="BasicElements" />
/// <reference path="Buttons" />
/// <reference path="Color" />
/// <reference path="Brush" />
/// <reference path="Board" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="../Localization/IRecorderLocalization" />
/// <reference path="../Helpers/HelperFunctions" />
var UI;
(function (UI) {
    /**
     * This class wraps the whole UI of the recorder.
     */
    var RecorderUI = (function (_super) {
        __extends(RecorderUI, _super);
        /**
         * Create a new instance of Recorder UI
         * @param	id				Unique ID of this recorder instance
         * @param	brushSizes		List of possible brush colors
         * @param	brushSizes		List of possible brush sizes
         * @param	localization	List of translated strings
         */
        function RecorderUI(id, colorPallete, brushSizes, localization, timer) {
            _super.call(this, "div", id + "-recorder");
            this.id = id;
            this.localization = localization;
            this.timer = timer;
            /** Ticking interval */
            this.tickingInterval = 100;
            this.AddClass("vector-video-wrapper");
            // prepare the board
            this.board = this.CreateBoard();
            // prepare the panels
            this.controls = new UI.Panel("div", id + "-controls")
                .AddChildren(this.CreateButtonsPanel().AddClass("vector-video-buttons"), this.CreateColorsPanel(colorPallete).AddClass("vector-video-colors"), this.CreateBrushSizesPanel(brushSizes).AddClass("vector-video-sizes"), this.CreateEraserPanel().AddClass("vector-video-erase"), this.CreateEraseAllPanel().AddClasses("vector-video-erase"))
                .AddClasses("vector-video-controls", "autohide", "ui-control");
            this.AddChildren(this.board, this.controls);
        }
        Object.defineProperty(RecorderUI.prototype, "Width", {
            /** Get the width of the board in pixels. */
            get: function () {
                return this.board.Width;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RecorderUI.prototype, "Height", {
            /** Get the height of the board in pixels. */
            get: function () {
                return this.board.Height;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RecorderUI.prototype, "BackgroundColor", {
            /** Get the background color of the board. */
            get: function () {
                return UI.Color.BackgroundColor.CssValue;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Integrate the canvas into the UI elements tree
         */
        RecorderUI.prototype.AcceptCanvas = function (canvas) {
            this.board.GetHTML().appendChild(canvas);
        };
        /**
         * Create the
         */
        RecorderUI.prototype.CreateBoard = function () {
            var board = new UI.Board(this.id + "-board");
            return board;
        };
        /**
         * Create a panel containing the REC/Pause button and the upload button.
         */
        RecorderUI.prototype.CreateButtonsPanel = function () {
            var _this = this;
            var buttonsPanel = new UI.Panel("div", this.id + "-panels");
            // the rec/pause button:
            this.recPauseButton = new UI.IconButton("icon-rec", this.localization.Record, function (e) { return _this.RecordPause(); });
            // the upload button:
            this.uploadButton = new UI.IconButton("icon-upload", this.localization.Upload, function (e) { return _this.InitializeUpload(); });
            Helpers.HTML.SetAttributes(this.uploadButton.GetHTML(), { "disabled": "disabled" });
            buttonsPanel.AddChildren(new UI.H2(this.localization.RecPause), this.recPauseButton, this.uploadButton);
            return buttonsPanel;
        };
        /**
         * This function is called when the REC/PAUSE button is clicked.
         */
        RecorderUI.prototype.RecordPause = function () {
            if (this.isRecording === true) {
                this.PauseRecording();
                this.uploadButton.GetHTML().removeAttribute("disabled");
                this.RemoveClass("recording");
            }
            else {
                this.StartRecording();
                Helpers.HTML.SetAttributes(this.uploadButton.GetHTML(), { "disabled": "disabled" });
                this.AddClass("recording");
            }
        };
        /**
         * Start (or continue) recording
         */
        RecorderUI.prototype.StartRecording = function () {
            var _this = this;
            this.isRecording = true;
            this.recPauseButton.ChangeIcon("icon-pause");
            this.board.IsRecording = true;
            this.ticking = setInterval(function () { return _this.Tick(); }, this.tickingInterval);
            Helpers.VideoEvents.trigger(Helpers.VideoEventType.Start);
        };
        /**
         * Pause recording
         */
        RecorderUI.prototype.PauseRecording = function () {
            this.isRecording = false;
            this.recPauseButton.ChangeIcon("icon-rec");
            this.board.IsRecording = false;
            clearInterval(this.ticking);
            Helpers.VideoEvents.trigger(Helpers.VideoEventType.Pause);
        };
        /**
         * Update the displayed time
         */
        RecorderUI.prototype.Tick = function () {
            this.recPauseButton.ChangeContent(Helpers.millisecondsToString(this.timer.CurrentTime()));
        };
        RecorderUI.prototype.InitializeUpload = function () {
            // disable the record and upload buttons
            Helpers.HTML.SetAttributes(this.recPauseButton.GetHTML(), { "disabled": "disabled" });
            Helpers.HTML.SetAttributes(this.uploadButton.GetHTML(), { "disabled": "disabled" });
            // trigger upload
            Helpers.VideoEvents.trigger(Helpers.VideoEventType.StartUpload);
        };
        /**
         * Create a panel for changing colors
         * @param	brushSizes	List of possible brush colors
         */
        RecorderUI.prototype.CreateColorsPanel = function (colorPallete) {
            var panel = new UI.Panel("div", "color-pallete");
            var title = new UI.H2(this.localization.ChangeColor);
            panel.AddChild(title);
            for (var i = 0; i < colorPallete.length; i++) {
                var btn = new UI.ChangeColorButton(colorPallete[i]);
                panel.AddChild(btn);
            }
            return panel;
        };
        /**
         * Create a panel for changing brush size
         * @param	brushSizes	List of possible brush sizes
         */
        RecorderUI.prototype.CreateBrushSizesPanel = function (brushSizes) {
            var panel = new UI.Panel("div", "brush-sizes");
            var title = new UI.H2(this.localization.ChangeSize);
            panel.AddChild(title);
            for (var i = 0; i < brushSizes.length; i++) {
                var btn = new UI.ChangeBrushSizeButton(brushSizes[i]);
                panel.AddChild(btn);
            }
            return panel;
        };
        /**
         * Create a panel containing the eraser brush and the "erase all button"
         */
        RecorderUI.prototype.CreateEraserPanel = function () {
            this.switchToEraserButton = new UI.ChangeColorButton(UI.Color.BackgroundColor);
            return new UI.Panel("div", this.id + "-erase")
                .AddChildren(new UI.H2(this.localization.Erase), this.switchToEraserButton);
        };
        /**
         * Create a panel containing the eraser brush and the "erase all button"
         */
        RecorderUI.prototype.CreateEraseAllPanel = function () {
            var _this = this;
            var panel = new UI.Panel("div", this.id + "-erase");
            var title = new UI.H2(this.localization.EraseAll);
            panel.AddChild(title);
            // the "erase all" button:
            this.eraseAllButton = new UI.ChangeColorButton(UI.Color.BackgroundColor, function () { return _this.EraseAll(); });
            Helpers.VideoEvents.on(Helpers.VideoEventType.ChangeColor, function (color) {
                _this.currentColor = color;
                _this.eraseAllButton.SetColor(color);
            });
            panel.AddChild(this.eraseAllButton);
            return panel;
        };
        /**
         * Clear the canvas
         */
        RecorderUI.prototype.EraseAll = function () {
            Helpers.VideoEvents.trigger(Helpers.VideoEventType.ClearCanvas, this.currentColor);
            this.switchToEraserButton.SetColor(this.currentColor);
        };
        return RecorderUI;
    })(UI.Panel);
    UI.RecorderUI = RecorderUI;
})(UI || (UI = {}));
/// <reference path="../Settings/BrushSettings" />
/// <reference path="../Settings/RecorderSettings" />
/// <reference path="../AudioData/AudioRecorder" />
/// <reference path="../VideoData/PointingDevice" />
/// <reference path="../VideoData/Mouse" />
/// <reference path="../VideoData/Touch" />
/// <reference path="../VideoData/Pointer" />
/// <reference path="../VideoData/WacomTablet" />
/// <reference path="../Drawing/SVGDrawer" />
/// <reference path="../Drawing/CanvasDrawer" />
/// <reference path="../Drawing/DynaDraw" />
/// <reference path="../VideoData/Metadata" />
/// <reference path="../VideoData/Video" />
/// <reference path="../Helpers/File" />
/// <reference path="../UI/RecorderUI" />
/// <reference path="../UI/BasicElements" />
/// <reference path="../Localization/IRecorderLocalization" />
/// <reference path="../VideoFormat/SVGAnimation/IO" />
var VectorVideo;
(function (VectorVideo) {
    var Video = VideoData.Video;
    var Mouse = VideoData.Mouse;
    var WacomTablet = VideoData.WacomTablet;
    var TouchEventsAPI = VideoData.TouchEventsAPI;
    var PointerEventsAPI = VideoData.PointerEventsAPI;
    var SVGDrawer = Drawing.SVGDrawer;
    var AudioRecorder = AudioData.AudioRecorder;
    var Errors = Helpers.Errors;
    var ErrorType = Helpers.ErrorType;
    var VideoEvents = Helpers.VideoEvents;
    var VideoEventType = Helpers.VideoEventType;
    var Metadata = VideoData.Metadata;
    var CursorState = Helpers.CursorState;
    var Recorder = (function () {
        /**
         * Create a new instance of recorder.
         * @param	id			Unique ID of this Recorder instance
         * @param	sttings		Recorder settings
         */
        function Recorder(id, settings) {
            var _this = this;
            this.id = id;
            this.settings = settings;
            // do not start recording until the user want's to start
            this.isRecording = false;
            // create paused stopwatch
            this.timer = new Helpers.VideoTimer(false);
            // recording is allowed even when not recording - but will be blcoked
            // when upload starts
            this.recordingBlocked = false;
            // prepare data storage
            this.data = new Video();
            this.lastEraseData = 0;
            //
            // THE UI
            //
            // select the container - it must exist
            var container = document.getElementById(id);
            if (!container) {
                Errors.Report(ErrorType.Fatal, "Container #" + id + " doesn't exist. Video Recorder couldn't be initialised.");
                return; // do not start
            }
            if (!!settings.Audio) {
                // only if settings are 
                this.audioRecorder = new AudioRecorder(settings.Audio);
                this.audioRecorder.Init();
            }
            if (!settings.ColorPallete || settings.ColorPallete.length === 0) {
                // default color pallete
                var colors = [];
                colors.push(new UI.Color("white", "#ffffff"));
                colors.push(new UI.Color("red", "#fa5959"));
                colors.push(new UI.Color("green", "#8cfa59"));
                colors.push(new UI.Color("blue", "#59a0fa"));
                colors.push(new UI.Color("yellow", "#fbff06"));
                colors.push(UI.Color.BackgroundColor);
                settings.ColorPallete = colors;
            }
            if (!settings.BrushSizes || settings.BrushSizes.length === 0) {
                // default brush sizes
                var brushes = [];
                brushes.push(new UI.BrushSize("pixel", 2, "px"));
                brushes.push(new UI.BrushSize("odd", 3, "px"));
                brushes.push(new UI.BrushSize("tiny", 4, "px"));
                brushes.push(new UI.BrushSize("ok", 6, "px"));
                brushes.push(new UI.BrushSize("small", 8, "px"));
                brushes.push(new UI.BrushSize("medium", 10, "px"));
                brushes.push(new UI.BrushSize("large", 15, "px"));
                brushes.push(new UI.BrushSize("extra", 80, "px"));
                settings.BrushSizes = brushes;
            }
            if (!settings.Localization) {
                // default localization
                var loc = {
                    NoJS: "Your browser does not support JavaScript or it is turned off. Video can't be recorded without enabled JavaScript in your browser.",
                    RecPause: "Control recording",
                    Record: "Start",
                    Pause: "Pause recording",
                    Upload: "Upload",
                    ChangeColor: "Change brush color",
                    ChangeSize: "Change brush size",
                    Erase: "Eraser",
                    EraseAll: "Erase everything",
                    WaitingText: "Please be patient. Uploading video usually takes some times - up to a few minutes if your video is over ten minutes long. Do not close this tab or browser window.",
                    UploadWasSuccessful: "Upload was successful",
                    RedirectPrompt: "Upload was successful - do you want to view your just recorded video?",
                    FailureApology: "Upload failed. Do you want to download your data to your computer instead?",
                };
                settings.Localization = loc;
            }
            // Bind video events
            VideoEvents.on(VideoEventType.ChangeBrushSize, function (size) { return _this.ChangeBrushSize(size); });
            VideoEvents.on(VideoEventType.ChangeColor, function (color) { return _this.ChangeColor(color); });
            VideoEvents.on(VideoEventType.CursorState, function (state) { return _this.ProcessCursorState(state); });
            VideoEvents.on(VideoEventType.ClearCanvas, function (color) { return _this.ClearCanvas(color); });
            VideoEvents.on(VideoEventType.Start, function () { return _this.Start(); });
            VideoEvents.on(VideoEventType.Continue, function () { return _this.Continue(); });
            VideoEvents.on(VideoEventType.Pause, function () { return _this.Pause(); });
            VideoEvents.on(VideoEventType.StartUpload, function () { return _this.StartUpload(); });
            // Record paths
            VideoEvents.on(VideoEventType.StartPath, function (path) {
                _this.PushChunk(new VideoData.PathChunk(path, _this.timer.CurrentTime(), _this.lastEraseData));
                _this.data.CurrentChunk.PushCommand(new VideoData.DrawNextSegment(_this.timer.CurrentTime())); // draw the start dot
            });
            VideoEvents.on(VideoEventType.DrawSegment, function () { return _this.data.CurrentChunk.PushCommand(new VideoData.DrawNextSegment(_this.timer.CurrentTime())); });
            var min = brushes.reduce(function (previousValue, currentValue, index, arr) { return previousValue.Size < currentValue.Size ? previousValue : currentValue; }).Size;
            var max = brushes.reduce(function (previousValue, currentValue, index, arr) { return previousValue.Size > currentValue.Size ? previousValue : currentValue; }).Size;
            // the most important part - the rendering and drawing strategy
            // - default drawing strategy is using SVG
            this.drawer = !!settings.DrawingStrategy ? settings.DrawingStrategy : new SVGDrawer(true);
            this.dynaDraw = new Drawing.DynaDraw(function () { return _this.drawer.CreatePath(); }, true, min, max, this.timer);
            // create UI and connect it to the drawer			
            this.ui = new UI.RecorderUI(id, settings.ColorPallete, settings.BrushSizes, settings.Localization, this.timer);
            this.ui.AcceptCanvas(this.drawer.CreateCanvas());
            container.appendChild(this.ui.GetHTML());
            this.drawer.Stretch(); // adapt to the environment
            // select best input method
            var wacomApi = WacomTablet.IsAvailable();
            if (window.hasOwnProperty("PointerEvent")) {
                var pointer = new PointerEventsAPI(container);
                pointer.InitControlsAvoiding();
                console.log("Pointer Events API is used");
            }
            else if (wacomApi !== null) {
                var tablet = new WacomTablet(container, wacomApi);
                console.log("Wacom WebPAPI is used");
            }
            else {
                var mouse = new Mouse(container);
                mouse.InitControlsAvoiding();
                var touch = new TouchEventsAPI(container);
                console.log("Mouse and Touch Events API are used.");
            }
            // init board state
            this.currColor = UI.Color.ForegroundColor;
            this.currSize = brushes.length > 0 ? brushes[0] : new UI.BrushSize("default", 5, "px");
            this.lastCurState = new CursorState(0, 0, 0, 0); // reset the cursor
            // set default bg color and init the first chunk
            this.ClearCanvas(UI.Color.BackgroundColor);
            // init some values for the brush - user will change it immediately, but some are needed from the very start
            VideoEvents.trigger(VideoEventType.ChangeColor, this.currColor);
            VideoEvents.trigger(VideoEventType.ChangeColor, this.currSize);
        }
        /**
         * Start recording. Everything must be initialised
         * and from this moment all data must be stored properly.
         */
        Recorder.prototype.Start = function () {
            this.isRecording = true;
            this.PushChunk(new VideoData.VoidChunk(this.timer.CurrentTime(), this.lastEraseData));
            this.timer.Resume();
            if (this.audioRecorder) {
                this.audioRecorder.Start();
            }
        };
        /**
         * Pause recording. Do not record data temporarily.
         */
        Recorder.prototype.Pause = function () {
            this.isRecording = false;
            this.PushChunk(new VideoData.VoidChunk(this.timer.CurrentTime(), this.lastEraseData));
            this.timer.Pause();
            if (this.audioRecorder) {
                this.audioRecorder.Pause();
            }
        };
        /**
         * Continue recording after the process has been paused for a while.
         */
        Recorder.prototype.Continue = function () {
            this.isRecording = true;
            this.timer.Resume();
            if (this.audioRecorder) {
                this.audioRecorder.Continue();
            }
            this.PushChunk(new VideoData.VoidChunk(this.timer.CurrentTime(), this.lastEraseData));
        };
        /**
         * Stop recording and upload the recorded data.
         */
        Recorder.prototype.StartUpload = function () {
            var _this = this;
            // do not record any new data
            this.recordingBlocked = true;
            // prepare metadata based on current status
            var info = new Metadata();
            info.Length = this.timer.CurrentTime();
            info.Width = this.ui.Width;
            info.Height = this.ui.Height;
            info.AudioTracks = [];
            this.data.Metadata = info;
            if (!!this.audioRecorder
                && this.audioRecorder.isRecording()) {
                this.audioRecorder.Stop(function (files) {
                    _this.data.Metadata.AudioTracks = files;
                    _this.UploadData();
                }, function () {
                    _this.FinishRecording(false); // upload of audio failed
                });
            }
            else {
                // there was no audio
                this.UploadData();
            }
        };
        /**
         * User want's to change brush thickness.
         * @param	size	New brush size
         */
        Recorder.prototype.ChangeBrushSize = function (size) {
            // User can change the size even if recording hasn't started or is paused
            this.currSize = size;
            !this.recordingBlocked && this.data.CurrentChunk.PushCommand(new VideoData.ChangeBrushSize(size, this.timer.CurrentTime()));
            this.dynaDraw.SetBrushSize(size);
        };
        /**
         * User want's to change brush color.
         * @param	colo	New brush color
         */
        Recorder.prototype.ChangeColor = function (color) {
            // User can change the color even if recording hasn't started or is paused
            this.currColor = color;
            !this.recordingBlocked && this.data.CurrentChunk.PushCommand(new VideoData.ChangeBrushColor(color, this.timer.CurrentTime()));
            this.drawer.SetCurrentColor(color);
        };
        /**
         * User moved the mouse or a digital pen.
         */
        Recorder.prototype.ProcessCursorState = function (state) {
            this.lastCurState = state;
            !this.recordingBlocked && this.data.CurrentChunk.PushCommand(new VideoData.MoveCursor(state.X, state.Y, state.Pressure, this.timer.CurrentTime()));
            this.dynaDraw.ObserveCursorMovement(state);
        };
        /**
         * User moved the mouse or a digital pen.
         */
        Recorder.prototype.ClearCanvas = function (color) {
            // add data only if recording is in progress
            var time = this.timer.CurrentTime();
            this.lastEraseData = this.PushChunk(new VideoData.EraseChunk(color, time, this.lastEraseData));
            this.data.CurrentChunk.PushCommand(new VideoData.ClearCanvas(time, color));
            this.drawer.ClearCanvas(color);
        };
        Recorder.prototype.PushChunk = function (chunk) {
            // set init commands
            chunk.InitCommands.push(new VideoData.ChangeBrushSize(this.currSize, chunk.StartTime));
            chunk.InitCommands.push(new VideoData.ChangeBrushColor(this.currColor, chunk.StartTime));
            chunk.InitCommands.push(new VideoData.MoveCursor(this.lastCurState.X, this.lastCurState.Y, this.lastCurState.Pressure, chunk.StartTime));
            // now push it
            return this.data.PushChunk(chunk);
        };
        //
        // Upload the result
        //
        /**
         * Upload the recorded data to the server.
         * @param	info	Information about the video.
         */
        Recorder.prototype.UploadData = function () {
            var _this = this;
            // get the recorded XML
            var writer = new VideoFormat.SVGAnimation.IO();
            var xml = writer.SaveVideo(this.data);
            console.log(xml);
            Helpers.File.Download(xml, "recorded.svg");
            // if I need saving the data to local computer in the future
            VideoEvents.on(VideoEventType.DownloadData, function () {
                Helpers.File.Download(xml, "recorded-animation.svg");
            });
            // Upload the data via POST Ajax request
            var req = new XMLHttpRequest();
            req.open("POST", this.settings.UploadURL, true); // async post request			
            req.onerror = function (e) { return _this.FinishRecording(false); }; // upload failed
            req.onload = function (e) {
                var response = JSON.parse(req.responseBody);
                if (req.status === 200 // HTTP code 200 === success
                    && response.hasOwnProperty("success")
                    && response.success === true) {
                    var url = response.hasOwnProperty("redirect") ? response.redirect : false;
                    _this.FinishRecording(true, url);
                }
                else {
                    _this.FinishRecording(false); // upload failed
                }
            };
            //req.send(xml);
        };
        /**
         * Redirect the user after successfully finishing recording.
         * Nothing is returned, if everything is OK and the user agrees
         * then user is redirected to the player to check his recording.
         *
         * @param  success	Was the whole process successful?
         * @param  url 		Url to be redirected to
         */
        Recorder.prototype.FinishRecording = function (success, url) {
            // inform everyone..
            VideoEvents.trigger(VideoEventType.RecordingFinished);
            // 
            if (success === true) {
                if (typeof url === "string") {
                    if (confirm(this.settings.Localization.RedirectPrompt)) {
                        window.location.replace(url);
                    }
                }
                else {
                    alert(this.settings.Localization.UploadWasSuccessful);
                }
            }
            else {
                if (confirm(this.settings.Localization.FailureApology)) {
                    // download all the recorded data locally
                    VideoEvents.trigger(VideoEventType.DownloadData);
                }
            }
        };
        return Recorder;
    })();
    VectorVideo.Recorder = Recorder;
})(VectorVideo || (VectorVideo = {}));
/// <reference path="Player/Player.ts" />
/// <reference path="Recorder/Recorder.ts" /> 
//# sourceMappingURL=vector-video.js.map