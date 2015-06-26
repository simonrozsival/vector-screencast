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
            this.size = -1;
            this.sizeSq = -1;
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
            if (this.size < 0) {
                this.size = Math.sqrt(this.getSizeSq());
            }
            return this.size;
        };
        ;
        /**
         * Calculates squared size of the vector.
         */
        Vector2.prototype.getSizeSq = function () {
            if (this.sizeSq < 0) {
                this.sizeSq = this.x * this.x + this.y * this.y;
            }
            return this.sizeSq;
        };
        /**
         * Distance between this and the other point.
         */
        Vector2.prototype.distanceTo = function (b) {
            return this.subtract(b).getSize();
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
            return this.scale(1 / size);
        };
        ;
        /**
         * Creates a normal vector to this vector.
         */
        Vector2.prototype.getNormal = function () {
            return new Vector2(-this.y, this.x).normalize();
        };
        ;
        /**
         * Create a new two-dimensional vector as a combination of this vector with a specified vector.
         */
        Vector2.prototype.add = function (b) {
            return new Vector2(this.x + b.X, this.y + b.Y);
        };
        ;
        /**
         * Create a new two-dimensional vector by subtracting a specified vector from this vector.
         */
        Vector2.prototype.subtract = function (b) {
            return new Vector2(this.x - b.X, this.y - b.Y);
        };
        ;
        /**
         * Create a new vector that is scaled by the coeficient c.
         */
        Vector2.prototype.scale = function (c) {
            return new Vector2(this.x * c, this.y * c);
        };
        ;
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
            return this.CreateElement("circle", {
                cx: center.X,
                cy: center.Y,
                r: radius,
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
            return "C " + a.X + "," + a.Y + " " + b.X + "," + b.Y + " " + c.X + "," + c.Y;
        };
        /**
         * Returns string for SVG path - an arc
         */
        SVG.ArcString = function (end, radius, startAngle) {
            return "A " + radius + "," + radius + " " + startAngle + " 0,0 " + end.X + "," + end.Y;
        };
        /** XML namespace of SVG */
        SVG.namespace = "http://www.w3.org/2000/svg";
        return SVG;
    })();
    Helpers.SVG = SVG;
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
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BezierCurveSegment.prototype, "StartCP", {
            /** The control point adjecent to the starting point */
            get: function () { return this.startCP; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BezierCurveSegment.prototype, "End", {
            /** The point, where the spline ends */
            get: function () { return this.end; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BezierCurveSegment.prototype, "EndCP", {
            /** The control point adjecent to the ending point */
            get: function () { return this.endCP; },
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
        VideoEventType[VideoEventType["BufferStatus"] = 7] = "BufferStatus";
        VideoEventType[VideoEventType["CursorState"] = 8] = "CursorState";
        VideoEventType[VideoEventType["ChangeColor"] = 9] = "ChangeColor";
        VideoEventType[VideoEventType["ChangeBrushSize"] = 10] = "ChangeBrushSize";
        VideoEventType[VideoEventType["CurrentTime"] = 11] = "CurrentTime";
        VideoEventType[VideoEventType["Render"] = 12] = "Render";
        VideoEventType[VideoEventType["ClearCanvas"] = 13] = "ClearCanvas";
        VideoEventType[VideoEventType["VideoInfoLoaded"] = 14] = "VideoInfoLoaded";
        VideoEventType[VideoEventType["CanvasSize"] = 15] = "CanvasSize";
        VideoEventType[VideoEventType["CanvasOffset"] = 16] = "CanvasOffset";
        VideoEventType[VideoEventType["RegisterRecordingTool"] = 17] = "RegisterRecordingTool";
        VideoEventType[VideoEventType["RecordingToolFinished"] = 18] = "RecordingToolFinished";
        VideoEventType[VideoEventType["RecordingFinished"] = 19] = "RecordingFinished";
        VideoEventType[VideoEventType["StartUpload"] = 20] = "StartUpload";
        VideoEventType[VideoEventType["DownloadData"] = 21] = "DownloadData";
    })(Helpers.VideoEventType || (Helpers.VideoEventType = {}));
    var VideoEventType = Helpers.VideoEventType;
    var eventTypesCount = 22; // !!!! do not forget to update if you update VideoEventType enum
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
                this.triggerAsync(cmd, args);
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
            if (type in VideoEvents.events === true) {
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
        VideoEvents.events = new Array(eventTypesCount);
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
            if (typeof tag === "string") {
                this.element = HTML.CreateElement(tag);
            }
            else {
                this.element = tag;
            }
            if (!!content) {
                this.element.textContent = content;
            }
        }
        /**
         * Getter of the element.
         */
        SimpleElement.prototype.GetHTML = function () { return this.element; };
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
            _super.call(this, "button", text);
            if (!!onClick) {
                this.GetHTML().onclick = onClick; // no event arguments are passed on purpose
            }
        }
        return Button;
    })(SimpleElement);
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
            _super.call(this, "", onClick);
            // the content isn't a simple text..
            this.icon = new SimpleElement("span", "");
            this.ChangeIcon(iconClass);
            this.content = new SimpleElement("span", content);
            this.GetHTML().appendChild(this.icon.GetHTML());
            this.GetHTML().appendChild(this.content.GetHTML());
        }
        IconButton.prototype.ChangeIcon = function (iconClass) {
            HTML.SetAttributes(this.icon.GetHTML(), {
                class: "icon " + iconClass
            });
        };
        /**
         * Change the content of the button.
         * @param	content	The content - might be HTML
         */
        IconButton.prototype.ChangeContent = function (content) {
            this.content.GetHTML().innerHTML = content;
        };
        return IconButton;
    })(Button);
    UI.IconButton = IconButton;
    /**
     * Basic UI button
     */
    var Paragraph = (function (_super) {
        __extends(Paragraph, _super);
        /**
         * Create a basic button with a text in it
         */
        function Paragraph(text) {
            _super.call(this, "p", text);
        }
        return Paragraph;
    })(SimpleElement);
    UI.Paragraph = Paragraph;
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
            this.root = Helpers.HTML.CreateElement(tag, {
                id: id,
                class: "ui-panel"
            });
            this.elements = [];
        }
        Object.defineProperty(Panel.prototype, "Children", {
            get: function () { return this.elements; },
            enumerable: true,
            configurable: true
        });
        /**
         * Add another button to the collection.
         * @param	btn		Button instance.
         */
        Panel.prototype.AddChild = function (el) {
            this.elements.push(el);
            this.root.appendChild(el.GetHTML());
        };
        /**
         * Add muiltiple children.
         * @param	elements	Array of elements
         */
        Panel.prototype.AddChildren = function (elements) {
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                this.AddChild(element);
            }
        };
        /**
         * Returns the panel element with it's children
         */
        Panel.prototype.GetHTML = function () { return this.root; };
        return Panel;
    })();
    UI.Panel = Panel;
})(UI || (UI = {}));
/// <reference path="../Helpers/Vector" />
/// <reference path="../Helpers/Spline" />
var Drawing;
(function (Drawing) {
    var Segment = (function () {
        function Segment(time) {
            this.time = time;
        }
        Object.defineProperty(Segment.prototype, "Time", {
            get: function () { return this.time; },
            enumerable: true,
            configurable: true
        });
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
        function QuadrilateralSegment(left, right, time) {
            _super.call(this, time);
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
        function ZeroLengthSegment(left, right, time) {
            _super.call(this, left, right, time);
        }
        return ZeroLengthSegment;
    })(QuadrilateralSegment);
    Drawing.ZeroLengthSegment = ZeroLengthSegment;
    var CurvedSegment = (function (_super) {
        __extends(CurvedSegment, _super);
        function CurvedSegment(left, right, time) {
            _super.call(this, time);
            this.left = left;
            this.right = right;
        }
        Object.defineProperty(CurvedSegment.prototype, "Left", {
            get: function () { return this.left.End; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CurvedSegment.prototype, "Right", {
            get: function () { return this.right.End; },
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
    var Path = (function () {
        /**
         * Init a new colored path
         */
        function Path(color, wireframe) {
            this.color = color;
            this.wireframe = wireframe;
            if (this.wireframe === undefined) {
                this.wireframe = false;
            }
            this.segments = [];
            this.pathPoints = [];
        }
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
        Path.prototype.StartPath = function (pt, radius) {
            this.DrawStartDot(pt, radius);
            this.startPosition = pt;
            this.startRadius = radius;
            this.iterator = -1;
        };
        Path.prototype.DrawStartDot = function (pt, radius) {
            throw new Error("Not impelmented");
        };
        /**
         * Before rendering the first segment, save the coordinates of the left and right
         * point as soon, as the direction is known.
         */
        Path.prototype.InitPath = function (right, left, time) {
            this.segments.push(new Drawing.ZeroLengthSegment(left, right, time));
            this.pathPoints.push({ Left: left, Right: right, Time: time });
            this.iterator = 0;
        };
        /**
         * Draw another segment of current path.
         * @param	{Vector2}	right	"Right" point of the segment.
         * @param	{Vector2}	left	"Left"	point of the segment.
         */
        Path.prototype.ExtendPath = function (right, left, time) {
            // draw the segment
            var segment = this.DrawSegment(right, left, time);
            // and push it to the list
            this.segments.push(segment);
            this.pathPoints.push({ Left: left, Right: right, Time: time });
            this.iterator++;
        };
        Path.prototype.DrawSegment = function (right, left, time) {
            return this.CalculateAndDrawCurvedSegment(right, left, time);
            // return this.CalculateAndDrawQuarilateralSegment(right, left, time);
        };
        Path.prototype.CalculateAndDrawCurvedSegment = function (right, left, time) {
            var leftBezier = Helpers.Spline.catmullRomToBezier(this.LastButTwoPoint.Left, this.LastButOnePoint.Left, this.LastPoint.Left, left);
            var rightBezier = Helpers.Spline.catmullRomToBezier(this.LastButTwoPoint.Right, this.LastButOnePoint.Right, this.LastPoint.Right, right);
            var segment = new Drawing.CurvedSegment(leftBezier, rightBezier, time);
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
        Path.prototype.CalculateAndDrawQuarilateralSegment = function (right, left, time) {
            var segment = new Drawing.QuadrilateralSegment(left, right, time);
            this.DrawQuadrilateralSegment(segment);
            return segment;
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
            // No need to draw anything more..
        };
        /**
         * Helper functions for determining, what is the angle between the x axis and vector in radians.
         * Math.atan(vec) function does this, but the angle is counterclockwise and rotated by PI/2...
         */
        Path.prototype.angle = function (vec) {
            return Math.atan2(-vec.X, vec.Y) - Math.PI / 2; /// :-) 
        };
        /**
         * Draw everything from the begining
         */
        Path.prototype.Redraw = function () {
            this.iterator = 0;
            this.DrawStartDot(this.startPosition, this.startRadius);
            while (this.iterator < this.segments.length) {
                this.CalculateAndDrawCurvedSegment(this.LastPoint.Right, this.LastPoint.Left, this.LastPoint.Time);
                this.iterator++;
            }
        };
        return Path;
    })();
    Drawing.Path = Path;
    var SvgPath = (function (_super) {
        __extends(SvgPath, _super);
        /**
         * Initialise new SVG path
         */
        function SvgPath(color, canvas) {
            _super.call(this, color);
            this.canvas = canvas;
        }
        SvgPath.prototype.DrawStartDot = function (position, radius) {
            // init SVG
            this.startDot = SVG.CreateDot(position, radius, this.color);
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
            this.path = SVG.CreateElement("path", options);
            // prepare paths
            this.right = SVG.MoveToString(position);
            this.left = "Z";
            this.cap = SVG.LineToString(position);
            // connect SVG's with the canvas
            this.canvas.appendChild(this.startDot);
            this.canvas.appendChild(this.path);
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
            var center = segment.Right.add(segment.Left).scale(0.5);
            var startDirection = segment.Right.subtract(center);
            var endDirection = segment.Left.subtract(center);
            this.cap = SVG.ArcString(segment.Left, center.distanceTo(segment.Left), this.angle(startDirection));
        };
        /**
         * Extend the SVG path with a quadrilateral segment
         */
        SvgPath.prototype.DrawQuadrilateralSegment = function (segment) {
            this.right += SVG.LineToString(segment.Right);
            this.left = SVG.LineToString(this.LastPoint.Left) + " " + this.left;
            // A] - a simple line at the end of the line 
            // this.cap = SVG.LineToString(left);
            // B] - an "arc cap"
            var center = segment.Right.add(segment.Left).scale(0.5);
            var startDirection = segment.Right.subtract(center);
            var endDirection = segment.Left.subtract(center);
            this.cap = SVG.ArcString(segment.Left, center.distanceTo(segment.Left), this.angle(startDirection));
        };
        /**
         * Promote the curve to the DOM
         */
        SvgPath.prototype.Draw = function () {
            SVG.SetAttributes(this.path, {
                d: this.right + this.cap + this.left
            });
        };
        return SvgPath;
    })(Path);
    Drawing.SvgPath = SvgPath;
    var CanvasPath = (function (_super) {
        __extends(CanvasPath, _super);
        /** Init empty path */
        function CanvasPath(color, context) {
            _super.call(this, color);
            this.context = context;
        }
        CanvasPath.prototype.DrawStartDot = function (position, radius) {
            // now draw the start dot
            this.DrawDot(position, radius);
        };
        /**
         * Helper function that draws a dot of the curve's color
         * with specified radius in the given point.
         */
        CanvasPath.prototype.DrawDot = function (c, r) {
            this.context.beginPath();
            this.context.arc(c.X, c.Y, r, 0, 2 * Math.PI, true);
            this.context.closePath();
            this.context.fillStyle = this.color;
            this.context.fill();
        };
        /**
         * Draw a simple quadrilateral segment
         */
        CanvasPath.prototype.DrawQuarilateralSegment = function (segment) {
            this.context.beginPath();
            this.context.moveTo(this.LastPoint.Right.X, this.LastPoint.Right.Y);
            this.context.lineTo(this.LastPoint.Left.X, this.LastPoint.Left.Y);
            this.context.lineTo(segment.Left.X, segment.Left.Y);
            // an "arc cap"
            var center = segment.Right.add(segment.Left).scale(0.5);
            var startDirection = segment.Right.subtract(center);
            var endDirection = segment.Left.subtract(center);
            this.context.arc(center.X, center.Y, center.distanceTo(segment.Left), this.angle(startDirection), this.angle(endDirection), false);
            //
            this.context.closePath();
            this.context.fillStyle = this.color;
            this.context.fill();
        };
        /**
         * Draw a curved segment using bezier curves.
         */
        CanvasPath.prototype.DrawCurvedSegment = function (segment) {
            this.context.beginPath();
            this.context.moveTo(segment.RightBezier.Start.X, segment.RightBezier.Start.Y);
            this.context.lineTo(segment.LeftBezier.Start.X, segment.LeftBezier.Start.Y);
            // left curve
            this.context.bezierCurveTo(segment.LeftBezier.StartCP.X, segment.LeftBezier.StartCP.Y, segment.LeftBezier.EndCP.X, segment.LeftBezier.EndCP.Y, segment.LeftBezier.End.X, segment.LeftBezier.End.Y);
            // A] - an "arc cap"
            var center = segment.RightBezier.End.add(segment.LeftBezier.End).scale(0.5);
            var startDirection = segment.RightBezier.End.subtract(center);
            var endDirection = segment.LeftBezier.End.subtract(center);
            this.context.arc(center.X, center.Y, center.distanceTo(segment.LeftBezier.End), this.angle(startDirection), this.angle(endDirection), false);
            // B] - line cap	
            // this.context.lineTo(segment.RightBezier.End.X, segment.RightBezier.End.Y);
            // right curve
            this.context.bezierCurveTo(segment.RightBezier.EndCP.X, segment.RightBezier.EndCP.Y, segment.RightBezier.StartCP.X, segment.RightBezier.StartCP.Y, segment.RightBezier.Start.X, segment.RightBezier.Start.Y);
            this.context.closePath();
            if (this.wireframe) {
                // "wireframe" is better for debuging:
                this.context.strokeStyle = this.color;
                this.context.stroke();
            }
            else {
                // filled shape is necessary for production:
                this.context.fillStyle = this.color;
                this.context.fill();
            }
        };
        return CanvasPath;
    })(Path);
    Drawing.CanvasPath = CanvasPath;
})(Drawing || (Drawing = {}));
var Helpers;
(function (Helpers) {
    /**
    * (High resolution) timer.
    */
    var VideoTimer = (function () {
        /**
         * Creates a timer and resets it.
         */
        function VideoTimer() {
            /** Current time of the moment when the timer was paused. */
            this.pauseTime = 0;
            /** @type {Date|object} */
            if (!window.performance) {
                this.clock = Date;
            }
            else {
                this.clock = window.performance; // High resolution timer
            }
            this.paused = false;
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
            this.Reset();
            this.startTime += milliseconds;
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
            this.SetTime(-this.pauseTime);
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
/// <reference path="Path" />
/// <reference path="../Helpers/VideoTimer" />
var Drawing;
(function (Drawing) {
    var Vector2 = Helpers.Vector2;
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
     * Current cursor
     * - implementation of the "filter" in the original algorithm
     */
    var Cursor = (function () {
        function Cursor(calculateSpeed, timer) {
            this.calculateSpeed = calculateSpeed;
            this.timer = timer;
        }
        /**
         * @param	{Vector2}		position	The starting point of the cursor.
         * @param	{BrushInstance} brush  		Physical properties of the brush.
         */
        Cursor.prototype.Reset = function (position, brush) {
            this.brush = brush;
            this.position = position;
            this.startPosition = position;
            this.previousPosition = position;
            this.previousPressure = -1; // negative means, there is no pressure information yet
            this.mousePosition = position;
            this.acceleration = new Vector2(0, 0);
            this.velocity = new Vector2(0, 0);
            this.firstSegment = true;
        };
        /**
         * Apply force created by mouse movement
         * @param 	{Vector2}	mouse 			Mouse position
         * @param	{number}	elapsedFrames	The number of frames elapsed since last movement
         */
        Cursor.prototype.Apply = function (mouse, elapsedFrames) {
            // calculate the force
            var force = mouse.subtract(this.position);
            if (force.getSizeSq() < Cursor.threshold) {
                return false; // too subtle movement
            }
            // calculate acceleration and velocity
            this.acceleration = force.scale(1 / this.brush.Mass); // derived from the definition of force: (->)a = (->)f / m
            this.velocity = this.velocity.add(this.acceleration);
            if (this.velocity.getSizeSq() < Cursor.threshold) {
                return false; // nearly no movement (a "heavy" brush)
            }
            // destroy unnecessary references
            this.mousePosition = mouse;
            mouse = null;
            force = null;
            this.acceleration = null;
            // calculate the angle of the mouse
            this.angle = this.velocity.getNormal();
            // apply the drag of the digital drawing tool
            this.velocity = this.velocity.scale(1 - this.brush.Friction); // more friction means less movement
            // update position
            this.position = this.position.add(this.velocity.scale(elapsedFrames));
            return true; // there is something to render
        };
        /**
         * Draw next segment
         */
        Cursor.prototype.Draw = function (path, pressure) {
            // the quicker the brush moves, the smaller print it leaves 
            var relativeSpeed = this.calculateSpeed === true ? this.velocity.getSize() / (this.brush.Size * this.brush.Size) : 0; // set to 0 if no speed correction is used
            var width = this.getRadius(pressure, relativeSpeed);
            var delta = this.angle.scale(width);
            if (this.firstSegment) {
                path.InitPath(this.startPosition.add(delta), this.startPosition.subtract(delta), this.timer.CurrentTime());
                this.firstSegment = false;
            }
            path.ExtendPath(this.position.add(delta), this.position.subtract(delta), this.timer.CurrentTime());
            path.Draw();
        };
        Cursor.prototype.StartPath = function (path, pt, pressure) {
            path.StartPath(pt, this.getRadius(pressure, 0));
        };
        /**
         * Calculate current radius from pressure and speed of the cursor.
         */
        Cursor.prototype.getRadius = function (pressure, speed) {
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
        Cursor.prototype.interpolatePressure = function (mousePressure) {
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
        Cursor.prototype.speedFactor = function (speed) {
            return Math.max(1 - speed, 0.4);
        };
        /** Mouse movement threshold - ingore too subtle mouse movements */
        Cursor.threshold = 1;
        return Cursor;
    })();
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
        function DynaDraw(slowSimulation, minBrushSize, maxBrushSize, timer) {
            var _this = this;
            this.slowSimulation = slowSimulation;
            this.minBrushSize = minBrushSize;
            this.maxBrushSize = maxBrushSize;
            /** Physical constants */
            this.minMass = 5;
            this.maxMass = 20;
            this.minFriction = 0.3; // 0.4 is experimentaly derived constant, that gives nice results for all weights
            this.maxFriction = 0.45;
            /**
             * Each brush has different properties - larger brushes are heavier and have greater drag
             */
            this.brushes = {};
            this.oneFrame = 1000 / 60; // 60 Hz in milliseconds
            this.cursor = new Cursor(slowSimulation, timer); // when slow simulation is on, use width adjustments when moving fast
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
        DynaDraw.prototype.interpolateMass = function (brushSize) {
            return this.minMass + (this.maxMass - this.minMass) * (brushSize - this.minBrushSize) / (this.maxBrushSize - this.minBrushSize);
        };
        DynaDraw.prototype.interpolateFriction = function (brushSize) {
            return this.maxFriction - (this.maxFriction - this.minFriction) * (brushSize - this.minBrushSize) / (this.maxBrushSize - this.minBrushSize);
        };
        DynaDraw.prototype.GetBrush = function (brushSize) {
            if (!this.brushes[brushSize]) {
                //this.brushes[brushSize]	= new BrushInstance(this.interpolateMass(brushSize), this.interpolateFriction(brushSize), brushSize); 
                this.brushes[brushSize] = new BrushInstance(this.minMass, this.maxFriction, brushSize);
            }
            return this.brushes[brushSize];
        };
        /**
         * Start drawing a new path with a given color and brush size.
         * @param	{Vector2}		position	Cursor state information
         * @param	{number}		pressure	Cursor pressure
         * @param	{string} 		color		CSS value of the color
         * @param	{number} 		brushSize	The size of the selected brush
         */
        DynaDraw.prototype.StartPath = function (position, pressure, brushSize, path) {
            this.cursor.Reset(position, this.GetBrush(brushSize));
            this.position = position;
            this.pressure = pressure;
            this.path = path;
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
                while (this.cursor.Apply(this.position, 1)) {
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
                if (this.cursor.Apply(this.position, (time - this.lastAnimationTime) / this.oneFrame)) {
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
})(Drawing || (Drawing = {}));
/// <reference path="./DrawingStrategy" />
/// <reference path="../helpers/Vector" />
/// <reference path="../helpers/State" />
/// <reference path="../helpers/HTML" />
/// <reference path="../helpers/SVG" />
/// <reference path="../helpers/Spline" />
/// <reference path="../helpers/VideoEvents" />
/// <reference path="../settings/BrushSettings" />
/// <reference path="../UI/BasicElements" />
/// <reference path="DynaDraw" />
/// <reference path="Path" />
var Drawing;
(function (Drawing) {
    var Vector2 = Helpers.Vector2;
    var HTML = Helpers.HTML;
    var DrawingStrategy = (function () {
        /**
         * Init general things
         */
        function DrawingStrategy(slowSimulation) {
            this.slowSimulation = slowSimulation;
            // wrapper
            this.canvasWrapper = new UI.SimpleElement("div");
            HTML.SetAttributes(this.canvasWrapper.GetHTML(), { class: "vector-video-canvas-wrapper" });
            // settings will be set later
            this.settings = {
                Color: "",
                Size: 0
            };
            // collection of all paths
            this.paths = [];
        }
        /**
         * Allow acces to the canvas element.
         */
        DrawingStrategy.prototype.GetCanvas = function () {
            return this.canvasWrapper;
        };
        DrawingStrategy.prototype.InitDynaDraw = function (minBrushSize, maxBrushSize, timer) {
            // init DynaDraw
            this.dynaDraw = new Drawing.DynaDraw(this.slowSimulation, minBrushSize, maxBrushSize, timer);
        };
        /**
         * Current brush settings
         * @return {object} Settings.
         */
        DrawingStrategy.prototype.GetCurrentBrushSettings = function () {
            return this.settings;
        };
        /**
         * Set current brush size
         * @param   size    The new size of the brush (line thickness)
         */
        DrawingStrategy.prototype.SetBrushSize = function (size) {
            this.settings.Size = size.Size;
        };
        /**
         * Set current brush color
         * @param   color   The new color of the brush
         */
        DrawingStrategy.prototype.SetBrushColor = function (color) {
            this.settings.Color = color.CssValue;
        };
        /**
         * Process next state and
         */
        DrawingStrategy.prototype.ProcessNewState = function (cursor) {
            try {
                var nextPoint = new Vector2(cursor.X, cursor.Y);
                if (cursor.Pressure > 0) {
                    if (!this.lastState || this.lastState.Pressure === 0) {
                        this.StartLine(nextPoint, cursor.Pressure);
                    }
                    else {
                        this.ContinueLine(nextPoint, cursor.Pressure);
                    }
                }
                else if (this.lastState && this.lastState.Pressure > 0) {
                    this.EndLine(nextPoint);
                }
            }
            catch (err) {
                console.log("ProcessNewState error: ", err);
            }
            this.lastState = cursor;
        };
        /**
         *
         */
        DrawingStrategy.prototype.StartLine = function (point, pressure) {
            throw new Error("Not implemented");
        };
        DrawingStrategy.prototype.ContinueLine = function (point, pressure) {
            this.dynaDraw.NextPoint(point, pressure);
        };
        DrawingStrategy.prototype.EndLine = function (point) {
            this.dynaDraw.EndPath(point, 0);
        };
        /**
         * Clear everything.
         */
        DrawingStrategy.prototype.ClearCanvas = function () {
            throw new Error("Not implemented");
        };
        /**
         * Adapt the canvas to the size of the container
         */
        DrawingStrategy.prototype.Stretch = function () {
            throw new Error("Not implemented");
        };
        /**
         * Scale the content according to given factor
         */
        DrawingStrategy.prototype.Scale = function (center, factor) {
            throw new Error("Not implemented");
        };
        /**
         * Clear the canvas and draw everything from the very start until now
         */
        DrawingStrategy.prototype.RedrawEverything = function () {
            this.ClearCanvas();
            for (var i = 0; i < this.paths.length; i++) {
                var element = this.paths[i];
                element.Redraw();
            }
        };
        return DrawingStrategy;
    })();
    Drawing.DrawingStrategy = DrawingStrategy;
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
/// <reference path="DynaDraw" />
/// <reference path="Path" />
var Drawing;
(function (Drawing) {
    var SVG = Helpers.SVG;
    /**
     * This is the main drawing class - processes cursor states
     * and renders the lines on the blackboard.
     * This class uses SVG (http://www.w3.org/TR/SVG) for visualising the lines.
     */
    var SVGDrawer = (function (_super) {
        __extends(SVGDrawer, _super);
        function SVGDrawer(slowSimulation) {
            _super.call(this, slowSimulation);
            // create the SVG canvas that will be drawn onto
            this.svg = SVG.CreateElement("svg");
            // background:
            var backgroundLayer = SVG.CreateElement("g");
            this.bg = SVG.CreateElement("rect", {
                id: "background",
                fill: UI.Color.BackgroundColor.CssValue
            });
            backgroundLayer.appendChild(this.bg);
            this.svg.appendChild(backgroundLayer);
            // canvas             
            this.canvas = SVG.CreateElement("g", {
                id: "canvas"
            });
            this.svg.appendChild(this.canvas);
            this.canvasWrapper.GetHTML().appendChild(this.svg);
        }
        SVGDrawer.prototype.Stretch = function () {
            var parent = this.canvasWrapper.GetHTML().parentElement;
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
            this.bg = null; // remove reference
            Helpers.VideoEvents.trigger(Helpers.VideoEventType.CanvasSize, width, height);
        };
        /**
         * Make the canvas blank.
         */
        SVGDrawer.prototype.ClearCanvas = function () {
            // remove all drawn parts
            while (!!this.canvas.firstChild) {
                this.canvas.removeChild(this.canvas.firstChild);
            }
        };
        /**
         * Start drawing a line.
         * @param   point       Start point of the line.
         * @param   pressure    The pressure of the pointing device in this point.
         */
        SVGDrawer.prototype.StartLine = function (point, pressure) {
            var path = new Drawing.SvgPath(this.settings.Color, this.canvas);
            this.dynaDraw.StartPath(point, pressure, this.settings.Size, path);
        };
        return SVGDrawer;
    })(Drawing.DrawingStrategy);
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
        function ChangeColorButton(color) {
            var _this = this;
            _super.call(this, ""); // empty text			
            this.color = color;
            // make the button a color option
            Helpers.HTML.SetAttributes(this.GetHTML(), {
                class: "option",
                "data-color": color.CssValue,
                title: color.Name,
                style: "background-color: " + color.CssValue
            });
            // announce color change when the button is clicked
            this.GetHTML().onclick = function (e) { return _this.ChangeColor(e); };
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
                style: "width: " + size.CssValue + ";\t\n\t\t\t\t\t\theight: " + size.CssValue + ";\n\t\t\t\t\t\tborder-radius: " + size.Size / 2 + size.Unit + "; \n\t\t\t\t\t\tdisplay: inline-block;\n\t\t\t\t\t\tbackground: black;"
            });
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
    var Cursor = (function () {
        /**
         * Initialise a cursor. It's size and color must be explicitely changed before using it though!
         */
        function Cursor() {
            this.radius = 20;
            this.stroke = 3;
            this.position = new Vector2(0, 0);
            this.CreateHTML();
        }
        /**
         * Prepares the cursor shape - a dot, but with zero size and no specific color (default white)
         */
        Cursor.prototype.CreateHTML = function () {
            this.element = Helpers.HTML.CreateElement("div", { class: "ui-cursor" });
            this.svg = Helpers.SVG.CreateElement("svg", {
                width: 2 * this.radius,
                height: 2 * this.radius
            });
            this.element.appendChild(this.svg);
            // draw the dot at the center of the SVG element
            this.dot = Helpers.SVG.CreateDot(new Helpers.Vector2(this.radius, this.radius), this.radius - this.stroke, UI.Color.BackgroundColor.CssValue);
            Helpers.SVG.SetAttributes(this.dot, {
                "stroke": "white",
                "stroke-width": this.stroke
            });
            this.svg.appendChild(this.dot);
            // I want to move the cursor to any point and the stuff behind the cursor must be visible
            this.element.style.position = "absolute";
            this.element.style.background = "transparent";
            this.element.style.lineHeight = "0";
        };
        Cursor.prototype.GetHTML = function () {
            return this.element;
        };
        /**
         * Move the cursor to a specified position.
         * @param	x	X coordinate of cursor center
         * @param	y	Y coordinate of cursor center
         */
        Cursor.prototype.MoveTo = function (x, y) {
            this.element.style.left = (x - this.radius - this.stroke) + "px";
            this.element.style.top = (y - this.radius - this.stroke) + "px";
            this.position = new Helpers.Vector2(x, y);
        };
        /**
         * Change the color of brush outline according to current settings.
         */
        Cursor.prototype.ChangeColor = function (color) {
            if (color.CssValue === UI.Color.BackgroundColor.CssValue) {
                color = UI.Color.ForegroundColor; // make it inverse
            }
            Helpers.SVG.SetAttributes(this.dot, {
                stroke: color.CssValue
            });
        };
        /**
         * Resize the brush according to current settings.
         */
        Cursor.prototype.ChangeSize = function (size) {
            var originalRadius = this.radius;
            this.radius = size.Size / 2 - 2; // make the cursor a bit smaller than the path it will draw
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
        return Cursor;
    })();
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
    /**
     * The board itself.
     */
    var Board = (function (_super) {
        __extends(Board, _super);
        /**
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
            Helpers.HTML.SetAttributes(this.GetHTML(), { position: "relative" });
            // move the cursor
            Helpers.VideoEvents.on(Helpers.VideoEventType.CursorState, function (state) { return _this.UpdateCursorPosition(state); });
            Helpers.VideoEvents.on(Helpers.VideoEventType.ChangeBrushSize, function (state) { return _this.UpdateCursorSize(state); });
            Helpers.VideoEvents.on(Helpers.VideoEventType.ChangeColor, function (state) { return _this.UpdateCursorColor(state); });
            Helpers.VideoEvents.on(Helpers.VideoEventType.ChangeColor, function (state) { return _this.UpdateCursorColor(state); });
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
         * Position the element
         */
        Board.prototype.UpdateCursorColor = function (color) {
            this.cursor.ChangeColor(color);
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
            _super.call(this, "div", id);
            this.length = 0;
            // create progress bar
            var bar = new UI.SimpleElement("div");
            bar.GetHTML().classList.add("ui-progressbar");
            this.progresbar = bar;
            this.AddChild(bar);
            // init progresbar with
            this.Sync(0);
            // change video position, when the bar is clicked
            this.GetHTML().onclick = this.OnClick;
            // @todo show preloaded content
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
         * Synchronize progress bar width with current time
         */
        TimeLine.prototype.Sync = function (time) {
            this.progresbar.GetHTML().style.width = this.length > 0 ? "" + time / this.length * 100 : "O%";
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
var Helpers;
(function (Helpers) {
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
        function PlayerUI(id, localization) {
            _super.call(this, "div", id + "-player");
            this.id = id;
            this.localization = localization;
            /** The time of recording in milliseconds */
            this.time = 0;
            /** Ticking interval */
            this.tickingInterval = 100;
            // prepare the board
            this.board = this.CreateBoard();
            this.AddChild(this.board);
            // prepare the panels
            var controls = new UI.Panel("div", id + "-controls");
            var buttons = this.CreateButtonsPanel();
            controls.AddChildren([buttons]);
            this.AddChild(controls);
            // allow keyboard
        }
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
                        _this.timeline.SkipTo(_this.time - skipTime);
                        break;
                    case rightArrow:
                        _this.timeline.SkipTo(_this.time + skipTime);
                        break;
                }
            };
        };
        /**
         * Integrate the canvas into the UI elements tree
         */
        PlayerUI.prototype.AcceptCanvas = function (canvas) {
            this.board.AddChild(canvas);
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
            var buttonsPanel = new UI.Panel("div", this.id + "-pannels");
            this.playPauseButton = new UI.Button(this.localization.Play, this.PlayPause);
            buttonsPanel.AddChildren([this.playPauseButton]);
            return buttonsPanel;
        };
        /**
         * This function is called when the PLAY/PAUSE button is clicked.
         */
        PlayerUI.prototype.PlayPause = function () {
            if (this.isPlaying === true) {
                this.PausePlaying();
            }
            else {
                this.StartPlaying();
            }
        };
        /**
         * Start (or continue) recording
         */
        PlayerUI.prototype.StartPlaying = function () {
            this.isPlaying = true;
            this.playPauseButton.GetHTML().classList.add("ui-playing");
            this.playPauseButton.GetHTML().innerText = this.localization.Pause;
            VideoEvents.trigger(VideoEventType.Start);
            // update time periodically
            this.ticking = setInterval(this.UpdateCurrentTime, this.tickingInterval);
        };
        /**
         * Pause playback
         */
        PlayerUI.prototype.PausePlaying = function () {
            this.isPlaying = false;
            this.playPauseButton.GetHTML().classList.remove("ui-playing");
            this.playPauseButton.GetHTML().innerText = this.localization.Play;
            VideoEvents.trigger(VideoEventType.Pause);
            // do not update the status and timeline while paused
            clearInterval(this.ticking);
        };
        PlayerUI.prototype.CreateTimeLine = function () {
            var timeline = new UI.TimeLine(this.id + "-timeline");
            return timeline;
        };
        PlayerUI.prototype.CreateTimeStatus = function () {
            var status = new UI.Panel("div", this.id + "-timeline");
            var currentTime = new UI.SimpleElement("span", "0:00");
            var slash = new UI.SimpleElement("span", "&nbsp;/&nbsp;");
            var totalTime = new UI.SimpleElement("span", "0:00");
            status.AddChildren([currentTime, slash, totalTime]);
            return status;
        };
        /**
         * @param	time	Current time in seconds
         */
        PlayerUI.prototype.UpdateCurrentTime = function () {
            this.time += this.tickingInterval;
            this.currentTime.GetHTML().textContent = Helpers.millisecondsToString(this.time);
            this.timeline.GetHTML().style.width = this.Length > 0 ? this.time / this.Length + "%" : "0%";
        };
        return PlayerUI;
    })(UI.Panel);
    UI.PlayerUI = PlayerUI;
})(UI || (UI = {}));
/// <reference path="../helpers/HTML.ts" />
/// <reference path="../helpers/VideoEvents.ts" />
var VideoData;
(function (VideoData) {
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
    })(VideoData.AudioSourceType || (VideoData.AudioSourceType = {}));
    var AudioSourceType = VideoData.AudioSourceType;
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
    VideoData.AudioSource = AudioSource;
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
                document.appendChild(this.audio);
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
            // important audio events
            this.audio.onended = function () { return VideoEvents.trigger(VideoEventType.ReachEnd); };
            this.audio.onpause = this.InitiatePause;
            this.audio.ontimeupdate = this.ReportCurrentTime;
            // synchronize audio playback with video
            VideoEvents.on(VideoEventType.Start, this.Play);
            VideoEvents.on(VideoEventType.Pause, this.Pause);
            VideoEvents.on(VideoEventType.Stop, this.Pause);
            VideoEvents.on(VideoEventType.ReachEnd, this.ReachedEnd);
            VideoEvents.on(VideoEventType.Replay, this.Replay);
            VideoEvents.on(VideoEventType.JumpTo, this.JumpTo);
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
            // Has the browser preloaded something since last time?
            // Change the css styles only if needed.
            var lastEnd = 0;
            this.checkPreloaded = setInterval(function () {
                if (this.audio.canPlayThrough) {
                    clearInterval(this.checkPreloaded); // no need to run this loop any more
                }
                else {
                    var end = this.audio.buffered.end(this.audio.buffered.length - 1);
                    if (end !== lastEnd) {
                        VideoEvents.trigger(VideoEventType.BufferStatus, end);
                        lastEnd = end;
                    }
                }
            }, 1000); // every second check, how much is preloaded
        };
        /**
         * Jump to a given position.
         * It might take some time before the audio is ready - pause the playback and start as soon as ready.
         */
        AudioPlayer.prototype.JumpTo = function (progress) {
            this.reachedEnd = false; // if I was at the end and I changed the position, I am not at the end any more!			
            var time = this.audio.duration * progress; // duration is in seconds
            if (this.playing === true) {
                this.InitiatePause(); // pause before changing position
                this.ChangePosition(time, this.InitiatePlay); // start playing when ready		
            }
            else {
                this.ChangePosition(time); // do not start playling
            }
            // monitor preloading buffer
            clearInterval(this.checkPreloaded);
            this.MonitorBufferingAsync();
        };
        /**
         * Change current audio position to specified time
         */
        AudioPlayer.prototype.ChangePosition = function (seconds, callback) {
            console.log("audio - change position to " + seconds + "s");
            this.audio.oncanplay = callback;
            this.audio.currentTime = seconds;
        };
        /**
         * Report current time so everyone can synchronize
         */
        AudioPlayer.prototype.ReportCurrentTime = function () {
            VideoEvents.trigger(VideoEventType.CurrentTime, this.audio.currentTime);
        };
        return AudioPlayer;
    })();
    VideoData.AudioPlayer = AudioPlayer;
})(VideoData || (VideoData = {}));
/// <reference path="AudioPlayer" />
var VideoData;
(function (VideoData) {
    /**
     *
     */
    var VideoInfo = (function () {
        function VideoInfo() {
        }
        return VideoInfo;
    })();
    VideoData.VideoInfo = VideoInfo;
})(VideoData || (VideoData = {}));
/// <reference path="../Helpers/State" />
/// <reference path="../VideoData/VideoInfo" />
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
            req.onerror = function (e) { return error(); };
            req.ontimeout = function (e) { return error(); };
            req.onload = function (e) {
                if (req.status === 200) {
                    success(req.responseXML);
                }
                else {
                    error();
                }
            };
        };
        /**
         * Download a Blob with a specified name
         */
        File.Download = function (blob, name) {
            // create a hidden link
            var a = Helpers.HTML.CreateElement("a", {
                css: "display: none"
            });
            document.appendChild(a);
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
/// <reference path="VideoInfo" />
/// <reference path="ICursor" />
/// <reference path="../VideoFormat/IO" />
/// <reference path="../Helpers/File" />
/// <reference path="../Helpers/Errors" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="../Helpers/State" />
/// <reference path="../Helpers/VideoTimer" />
var VideoData;
(function (VideoData) {
    var StateType = Helpers.StateType;
    var VideoTimer = Helpers.VideoTimer;
    var VideoEvents = Helpers.VideoEvents;
    var VideoEventType = Helpers.VideoEventType;
    var Video = (function () {
        /**
         *
         */
        function Video(url, formatReader) {
            this.formatReader = formatReader;
            this.timer = null;
            this.hasData = false;
            this.isPlaying = false;
            Helpers.File.ReadXmlAsync(url, this.ProcessInputFile, this.ReadingFileError);
            // 
            VideoEvents.on(VideoEventType.CanvasSize, this.CanvasSizeChanged);
            VideoEvents.on(VideoEventType.Start, this.Start);
            VideoEvents.on(VideoEventType.Continue, this.Start);
            VideoEvents.on(VideoEventType.Pause, this.Pause);
            VideoEvents.on(VideoEventType.Stop, this.Pause);
            VideoEvents.on(VideoEventType.JumpTo, this.JumpTo);
            VideoEvents.on(VideoEventType.ReachEnd, this.Pause);
        }
        Object.defineProperty(Video.prototype, "Info", {
            get: function () { return this.info; },
            enumerable: true,
            configurable: true
        });
        /**
         * Process the downloaded XML source.
         */
        Video.prototype.ProcessInputFile = function (xml) {
            this.hasData = true;
            this.formatReader.ReadFile(xml);
            // load video information
            this.info = this.formatReader.GetInfo();
            VideoEvents.trigger(VideoEventType.VideoInfoLoaded, this.info); // anyone can have the info
        };
        /**
         * Handle an error that occured while downloading or parsing the input XML document.
         */
        Video.prototype.ReadingFileError = function (e) {
            Helpers.Errors.Report(Helpers.ErrorType.Fatal, "Source file couldn't be read and the video won't be played.");
        };
        /**
         * Compute image scaling factor based on original canvas size and current canvas size
         */
        Video.prototype.CanvasSizeChanged = function (width, height) {
            // make sure it doesn't get out of current user's canvas
            this.scale = Math.min(width / this.info.Width, height / this.info.Height);
        };
        /**
         * Acommodate the position to current canvas size
         */
        Video.prototype.CorrectCoords = function (pos) {
            return {
                x: pos.x * this.scale,
                y: pos.y * this.scale
            };
        };
        Video.prototype.Start = function () {
            if (this.timer === null) {
                this.timer = new VideoTimer();
            }
            else {
                this.timer.Resume();
            }
            this.isPlaying = true;
            this.Tick(); // this will render as much as needed and then will become async
        };
        Video.prototype.Pause = function () {
            this.timer.Pause();
            this.isPlaying = false; // Tick() will stop after next animation frame (in 1/60s)
        };
        Video.prototype.Replay = function () {
            //this
        };
        Video.prototype.JumpTo = function (progress) {
            var wasPlaying = this.isPlaying;
            this.Pause();
            var time = progress * this.info.Length * 1000; // convert to milliseconds
            if (time >= this.timer.CurrentTime()) {
                this.SkipForward(time);
            }
            else {
                this.SkipBackward(time);
            }
            if (wasPlaying === true) {
                this.Start(); // continue from the new point in time
            }
        };
        Video.prototype.SkipForward = function (time) {
            this.timer.SetTime(time);
            this.timer.Pause();
            while (line.FinishTime <= this.formatReader.GetNextPrerenderedLineFinishTime()) {
                var line = this.formatReader.GetNextPrerenderedLine();
                this.PublishWholeLine(line);
            }
            this.Tick(); // make as many steps as needed
            // video is paused, so ticking won't continue after it is synchronised
            // rendering request will also be made
        };
        Video.prototype.SkipBackward = function (time) {
            // rewind... (erase everything)
            this.
                // ...and then skip forward
                Tick();
        };
        Video.prototype.PublishWholeLine = function (line) {
            // @todo
        };
        /**
         * Stop playback when end is reached.
         */
        Video.prototype.ReachedEnd = function () {
            this.Pause();
        };
        /**
         * Inform everyone, that I have reached the end
         */
        Video.prototype.ForceReachedEnd = function () {
            VideoEvents.trigger(VideoEventType.ReachEnd);
        };
        /**
         * Keep the video running (as long as it is not paused).
         */
        Video.prototype.Tick = function () {
            // number of states that have drawn something on the canvas			
            var drawingStates = 0;
            // apply as many states as needed (usually 1 or 2)
            while (this.nextState.GetTime() <= this.timer.CurrentTime()) {
                drawingStates += this.ProcessState(this.nextState);
                this.nextState = this.formatReader.GetNextState();
                if (!this.nextState) {
                    // I have reached the end
                    this.ForceReachedEnd();
                }
            }
            // request frame rendering (if something interesting happened, of course)
            if (drawingStates > 0) {
                this.RequestRendering();
            }
            // repaint on next animation frame
            if (this.isPlaying) {
                requestAnimationFrame(this.Tick); // 1 frame takes about 1/60s
            }
        };
        /**
         * Tell the drawer that there is something it should render...
         */
        Video.prototype.RequestRendering = function () {
            VideoEvents.trigger(VideoEventType.Render);
        };
        /**
         * Returns 1 if something is drawn, 0 otherwise
         * @param	state	Next state
         */
        Video.prototype.ProcessState = function (state) {
            switch (state.GetType()) {
                case StateType.ChangeBrushSize:
                    this.ChangeBrushSize(state);
                    return 0;
                case StateType.ChangeColor:
                    this.ChangeColor(state);
                    return 0;
                case StateType.Cursor:
                    this.MoveCursor(state);
                    // nothing is redrawn if the cursor is just 'hovering' over the canvas
                    // - unless this is where the line ends...
                    return state.Pressure > 0
                        || this.lastCursorState.Pressure > 0 ? 1 : 0;
            }
        };
        Video.prototype.ChangeColor = function (state) {
            VideoEvents.trigger(VideoEventType.ChangeColor, state.Color.CssValue);
        };
        Video.prototype.ChangeBrushSize = function (state) {
            VideoEvents.trigger(VideoEventType.ChangeBrushSize, state.Size.Size * this.scale);
        };
        Video.prototype.MoveCursor = function (state) {
            VideoEvents.trigger(VideoEventType.CursorState, state);
        };
        return Video;
    })();
    VideoData.Video = Video;
})(VideoData || (VideoData = {}));
var VideoFormat;
(function (VideoFormat) {
    /**
     *
     */
    (function (AnimatedSVGNodeType) {
        AnimatedSVGNodeType[AnimatedSVGNodeType["Info"] = 0] = "Info";
        AnimatedSVGNodeType[AnimatedSVGNodeType["Author"] = 1] = "Author";
        AnimatedSVGNodeType[AnimatedSVGNodeType["Title"] = 2] = "Title";
        AnimatedSVGNodeType[AnimatedSVGNodeType["Description"] = 3] = "Description";
        AnimatedSVGNodeType[AnimatedSVGNodeType["Length"] = 4] = "Length";
        AnimatedSVGNodeType[AnimatedSVGNodeType["AudioTracks"] = 5] = "AudioTracks";
        AnimatedSVGNodeType[AnimatedSVGNodeType["AudioSource"] = 6] = "AudioSource";
    })(VideoFormat.AnimatedSVGNodeType || (VideoFormat.AnimatedSVGNodeType = {}));
    var AnimatedSVGNodeType = VideoFormat.AnimatedSVGNodeType;
    /**
     *
     */
    (function (AnimatedSVGAttributeType) {
        AnimatedSVGAttributeType[AnimatedSVGAttributeType["AudioType"] = 0] = "AudioType";
    })(VideoFormat.AnimatedSVGAttributeType || (VideoFormat.AnimatedSVGAttributeType = {}));
    var AnimatedSVGAttributeType = VideoFormat.AnimatedSVGAttributeType;
    /**
     *
     */
    var AnimatedSVG = (function () {
        function AnimatedSVG() {
        }
        Object.defineProperty(AnimatedSVG, "Namespace", {
            /** The namespace of the Animated SVG */
            get: function () { return "http://www.rozsival.com/khan-academy/animated-svg"; },
            enumerable: true,
            configurable: true
        });
        /**
         * Convert the AnimatedSVGNodeType value to string name of XML node.
         */
        AnimatedSVG.TypeToName = function (type) {
            switch (type) {
                case AnimatedSVGNodeType.Info: return "info";
                case AnimatedSVGNodeType.Author: return "author";
                case AnimatedSVGNodeType.Title: return "title";
                case AnimatedSVGNodeType.Description: return "description";
                case AnimatedSVGNodeType.Length: return "length";
                case AnimatedSVGNodeType.AudioTracks: return "audio";
                case AnimatedSVGNodeType.AudioSource: return "source";
                default:
                    throw new Error("Given type is unsupported by Animated SVG.");
            }
        };
        /**
         * Convert the string name of XML node to AnimatedSVGNodeType value
         */
        AnimatedSVG.NameToType = function (name) {
            switch (name) {
                case "info": return AnimatedSVGNodeType.Info;
                case "author": return AnimatedSVGNodeType.Author;
                case "title": return AnimatedSVGNodeType.Title;
                case "description": return AnimatedSVGNodeType.Description;
                case "length": return AnimatedSVGNodeType.Length;
                case "audio": return AnimatedSVGNodeType.AudioTracks;
                case "source": return AnimatedSVGNodeType.AudioSource;
                default:
                    throw new Error("No Animated SVG node type corresponds to the given name '" + name + "'");
            }
        };
        /**
         * Convert the XML attribute of Animated SVG to string
         */
        AnimatedSVG.AttributeToName = function (attr) {
            switch (attr) {
                case AnimatedSVGAttributeType.AudioType: return "type";
                default:
                    throw new Error("Given attribute is unsupported by Animated SVG.");
            }
        };
        /**
         * Convert the string name of XML attribute to AnimatedSVGAttributeType value
         */
        AnimatedSVG.NameToAttribute = function (name) {
            switch (name) {
                case "type": return AnimatedSVGAttributeType.AudioType;
                default:
                    throw new Error("No Animated SVG attribute name corresponds to the given name '" + name + "'");
            }
        };
        return AnimatedSVG;
    })();
    VideoFormat.AnimatedSVG = AnimatedSVG;
})(VideoFormat || (VideoFormat = {}));
/// <reference path="IO" />
/// <reference path="AnimatedSVG" />
/// <reference path="../VideoData/VideoInfo" />
/// <reference path="../Helpers/State" />
/// <reference path="../Helpers/SVG" />
var VideoInfo = VideoData.VideoInfo;
var State = Helpers.State;
//import SVG = Helpers.SVG;
var VideoFormat;
(function (VideoFormat) {
    /**
     * This class takes video data and converts them into the extended SVG format.
     */
    var AnimatedSVGWriter = (function () {
        /**
         * Prepare the XML document that will be built.
         * The namespaces are standard SVG and my custom Animated SVG
         */
        function AnimatedSVGWriter() {
            var type = document.implementation.createDocumentType('svg:svg', '-//W3C//DTD SVG 1.1//EN', 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd');
            this.document = document.implementation.createDocument('http://www.w3.org/2000/svg', 'svg:svg', type);
            this.document.documentElement.setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns:a", VideoFormat.AnimatedSVG.Namespace);
        }
        /**
         * Encode the video information into the SVG format
         */
        AnimatedSVGWriter.prototype.SetInfo = function (info) {
            // store width, height and background information 
            var infoElement = this.document.createElementNS(VideoFormat.AnimatedSVG.Namespace, VideoFormat.AnimatedSVG.TypeToName(VideoFormat.AnimatedSVGNodeType.Info));
            // video lenght
            var length = this.document.createElementNS(VideoFormat.AnimatedSVG.Namespace, VideoFormat.AnimatedSVG.TypeToName(VideoFormat.AnimatedSVGNodeType.Length));
            length.textContent = info.Length.toString(10);
            infoElement.appendChild(length);
            // audio tracks
            var audioElement = this.document.createElementNS(VideoFormat.AnimatedSVG.Namespace, VideoFormat.AnimatedSVG.TypeToName(VideoFormat.AnimatedSVGNodeType.AudioTracks));
            for (var i = 0; i < info.AudioTracks.length; i++) {
                var audioSource = info.AudioTracks[i];
                var source = this.document.createElementNS(VideoFormat.AnimatedSVG.Namespace, VideoFormat.AnimatedSVG.TypeToName(VideoFormat.AnimatedSVGNodeType.AudioSource));
                source.setAttributeNS(VideoFormat.AnimatedSVG.Namespace, "type", audioSource.MimeType);
                source.setAttributeNS(VideoFormat.AnimatedSVG.Namespace, "src", audioSource.Url);
                audioElement.appendChild(source);
            }
            infoElement.appendChild(audioElement);
        };
        AnimatedSVGWriter.prototype.SetNextState = function (state) {
            // @todo
        };
        AnimatedSVGWriter.prototype.SetNextPrerenderedLine = function (line) {
            var path = line;
            this.document.rootElement.appendChild(path);
            // @todo
        };
        /**
         * Serialize the output before sending to the server.
         */
        AnimatedSVGWriter.prototype.ToString = function () {
            return this.document.documentElement.outerHTML;
        };
        return AnimatedSVGWriter;
    })();
    VideoFormat.AnimatedSVGWriter = AnimatedSVGWriter;
})(VideoFormat || (VideoFormat = {}));
/// <reference path="IO" />
/// <reference path="AnimatedSVGWriter" />
/// <reference path="../VideoData/AudioPlayer" />
/// <reference path="../Helpers/Errors" />
/// <reference path="../Helpers/SVG" />
/// <reference path="../VideoData/VideoInfo" />
var VideoFormat;
(function (VideoFormat) {
    var Errors = Helpers.Errors;
    var ErrorType = Helpers.ErrorType;
    var SVG = Helpers.SVG;
    var AnimatedSVGReader = (function () {
        function AnimatedSVGReader() {
        }
        /**
         * Open and parse the input
         */
        AnimatedSVGReader.prototype.ReadFile = function (file) {
            this.file = file;
            // Make a simple test - is it an SVG or not? The file might be invalid or corrupt, but that will be revield later. 
            if (!file.firstChild || file.firstChild.nodeName.toUpperCase() !== "SVG") {
                Errors.Report(ErrorType.Fatal, "Can't read input file - it is not an SVG file.");
            }
        };
        /**
         * Extracts information about the video from the extended SVG
         */
        AnimatedSVGReader.prototype.GetInfo = function () {
            var videoInfo;
            // width and height are parameters of SVG root element
            if (this.file.rootElement.hasAttributeNS(SVG.Namespace, "width")) {
                videoInfo.Width = Number(this.file.rootElement.attributes.getNamedItemNS(SVG.Namespace, "width"));
            }
            else {
                Errors.Report(ErrorType.Fatal, "SVG doesn't have the width attribute.");
            }
            // the same for height...
            if (this.file.rootElement.hasAttributeNS(SVG.Namespace, "height")) {
                videoInfo.Height = Number(this.file.rootElement.attributes.getNamedItemNS(SVG.Namespace, "height"));
            }
            else {
                Errors.Report(ErrorType.Fatal, "SVG doesn't have the height attribute.");
            }
            // @todo - Background
            videoInfo.BackgroundColor = "black";
            // search for <info> element
            var infoSearch = this.file.getElementsByTagNameNS(VideoFormat.AnimatedSVG.Namespace, VideoFormat.AnimatedSVG.TypeToName(VideoFormat.AnimatedSVGNodeType.Info));
            if (infoSearch.length !== 1) {
                Errors.Report(ErrorType.Fatal, "SVG file doesn't contain " + VideoFormat.AnimatedSVG.TypeToName(VideoFormat.AnimatedSVGNodeType.Info) + " element.");
            }
            // the very info element
            var info = infoSearch.item(0);
            // go through all it's children and save their values
            for (var i = 0; i < info.childNodes.length; i++) {
                var node = info.childNodes.item(i);
                switch (VideoFormat.AnimatedSVG.NameToType(node.nodeName)) {
                    case VideoFormat.AnimatedSVGNodeType.AudioTracks:
                        this.LoadAudioSources(videoInfo, node);
                        break;
                    default:
                        Errors.Report(ErrorType.Fatal, "Unexpected node " + node.nodeName + " inside the " + VideoFormat.AnimatedSVG.TypeToName(VideoFormat.AnimatedSVGNodeType.Info) + " element.");
                }
            }
            if (videoInfo.AudioTracks.length === 0) {
                Errors.Report(ErrorType.Warning, "No audio is available.");
            }
            return videoInfo;
        };
        /**
         * Loads all given audio sources
         * @param	info	Extracted information goes here
         * @param	audio	XML node containing information about audio audio sources
         */
        AnimatedSVGReader.prototype.LoadAudioSources = function (info, audio) {
            for (var i = 0; i < audio.childNodes.length; i++) {
                var element = audio.childNodes[i];
                var type = element.attributes.getNamedItemNS(VideoFormat.AnimatedSVG.Namespace, VideoFormat.AnimatedSVG.AttributeToName(VideoFormat.AnimatedSVGAttributeType.AudioType));
                if (!!type) {
                    info.AudioTracks.push(new VideoData.AudioSource(element.textContent, VideoData.AudioSource.StringToType(type.textContent)));
                }
            }
        };
        /**
         * Return next state
         */
        AnimatedSVGReader.prototype.GetNextState = function () {
            // @todo
            return null;
        };
        /**
         *
         */
        AnimatedSVGReader.prototype.GetNextPrerenderedLine = function () {
            // @todo
            return null;
        };
        /**
         *
         */
        AnimatedSVGReader.prototype.GetNextPrerenderedLineFinishTime = function () {
            // @todo
            return 0;
        };
        return AnimatedSVGReader;
    })();
    VideoFormat.AnimatedSVGReader = AnimatedSVGReader;
})(VideoFormat || (VideoFormat = {}));
/// <reference path="../Helpers/Errors" />
/// <reference path="../Drawing/DrawingStrategy" />
/// <reference path="../Drawing/SVGDrawer" />
/// <reference path="../Settings/PlayerSettings" />
/// <reference path="../UI/PlayerUI" />
/// <reference path="../VideoData/AudioPlayer" />
/// <reference path="../VideoData/Video" />
/// <reference path="../VideoFormat/IO" />
/// <reference path="../VideoFormat/AnimatedSVGReader" />
var AudioPlayer = VideoData.AudioPlayer;
var VectorVideo;
(function (VectorVideo) {
    var Player = (function () {
        function Player(id, settings) {
            this.settings = settings;
            var container = document.getElementById(id);
            if (!container) {
                Helpers.Errors.Report(Helpers.ErrorType.Fatal, "Container #" + id + " doesn't exist. Video Player couldn't be initialised.");
            }
            // init the UI
            this.ui = new UI.PlayerUI(id, settings.Localization);
            this.drawer = new Drawing.SVGDrawer(false);
            this.ui.AcceptCanvas(this.drawer.GetCanvas());
            // read the file
            var reader = new VideoFormat.AnimatedSVGReader();
            var videoFile = new VideoData.Video(settings.Source, reader);
            var audioPlayer = new AudioPlayer(reader.GetInfo().AudioTracks);
            // @todo
        }
        return Player;
    })();
    VectorVideo.Player = Player;
})(VectorVideo || (VectorVideo = {}));
/// <reference path="../Drawing/DrawingStrategy.ts" />
/// <reference path="../Localization/IRecorderLocalization.ts" />
/// <reference path="../UI/Color" />
/// <reference path="../UI/Brush" />
/// <reference path="audio.d.ts" />
/// <reference path="../Settings/RecorderSettings" /> 
/// <reference path="../Helpers/Errors" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="../VideoData/AudioPlayer" />
var AudioRecording;
(function (AudioRecording) {
    var Errors = Helpers.Errors;
    var ErrorType = Helpers.ErrorType;
    var VideoEvents = Helpers.VideoEvents;
    var VideoEventType = Helpers.VideoEventType;
    var AudioSource = VideoData.AudioSource;
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
            var context = (new AudioContext() // FF, GCh
                || null); // others
            navigator.getUserMedia = (navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia);
            var $this = this;
            if (!!navigator.getUserMedia) {
                navigator.getUserMedia(
                // constraints - we record only audio
                {
                    video: false,
                    audio: true
                }, 
                // success callback
                function (localMediaStream) {
                    if ($this.doNotStartRecording === false) {
                        $this.input = context.createMediaStreamSource(localMediaStream);
                        // create processing node
                        var bufferSize = 2048;
                        var recorder = context.createScriptProcessor(bufferSize, 1, 1);
                        recorder.onaudioprocess = function (data) { return $this.processData(data); };
                        $this.input.connect(recorder);
                        recorder.connect(context.destination);
                        $this.initSuccessful = true;
                        // create web worker audio processor
                        $this.CreateAudioProcessor("web-socket", $this.settings, function () { return console.log("Audio recording is ready."); });
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
                                    var source = new AudioSource(file.url, file.type);
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
    AudioRecording.AudioRecorder = AudioRecorder;
})(AudioRecording || (AudioRecording = {}));
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
/// <reference path="../helpers/Vector.ts" />
/// <reference path="../helpers/State.ts" />
/// <reference path="../helpers/HTML.ts" />
/// <reference path="../helpers/SVG.ts" />
/// <reference path="../helpers/Spline.ts" />
/// <reference path="../helpers/VideoEvents.ts" />
/// <reference path="../settings/BrushSettings.ts" />
/// <reference path="../UI/BasicElements" />
/// <reference path="DynaDraw" />
/// <reference path="Path" />
var Drawing;
(function (Drawing) {
    var HTML = Helpers.HTML;
    /**
     * This is the main drawing class - processes cursor states
     * and renders the lines on the blackboard.
     * This class uses HTML5 Canvas 2D Context for visualising the lines.
     */
    var CanvasDrawer = (function (_super) {
        __extends(CanvasDrawer, _super);
        /**
         * Create a new renderer that will produce output into the CANVAS elemement usning HTML5.
         */
        function CanvasDrawer(slowSimulation, canvas) {
            _super.call(this, slowSimulation);
            this.canvas = !!canvas ? canvas : HTML.CreateElement("canvas");
            this.context = this.canvas.getContext("2d");
            this.canvasWrapper = new UI.SimpleElement("div");
            HTML.SetAttributes(this.canvasWrapper.GetHTML(), { class: "vector-video-canvas-wrapper" });
            this.canvasWrapper.GetHTML().appendChild(this.canvas);
        }
        CanvasDrawer.prototype.Stretch = function () {
            // this is event handler - "this" isn't SVGDrawer here!
            var parent = this.canvas.parentElement;
            var width = parent.clientWidth;
            var height = parent.clientHeight;
            Helpers.HTML.SetAttributes(this.canvas, {
                width: width,
                height: height
            });
            // set the dark background color
            this.ClearCanvas();
            Helpers.VideoEvents.trigger(Helpers.VideoEventType.CanvasSize, width, height);
        };
        /**
         * Make the canvas blank.
         */
        CanvasDrawer.prototype.ClearCanvas = function () {
            this.context.fillStyle = UI.Color.BackgroundColor.CssValue;
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        };
        /**
         * Start drawing a line.
         * @param   point       Start point of the line.
         * @param   pressure    The pressure of the pointing device in this point.
         */
        CanvasDrawer.prototype.StartLine = function (point, pressure) {
            var path = new Drawing.CanvasPath(this.settings.Color, this.context);
            this.dynaDraw.StartPath(point, pressure, this.settings.Size, path);
        };
        /**
         * Scale the content according to given factor
         */
        CanvasDrawer.prototype.Scale = function (center, factor) {
            this.context.scale(factor, factor);
            this.context.translate(-center.X, -center.Y);
            this.RedrawEverything();
        };
        return CanvasDrawer;
    })(Drawing.DrawingStrategy);
    Drawing.CanvasDrawer = CanvasDrawer;
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
        function RecorderUI(id, colorPallete, brushSizes, localization) {
            _super.call(this, "div", id + "-recorder");
            this.id = id;
            this.localization = localization;
            /** Ticking interval */
            this.tickingInterval = 100;
            this.GetHTML().classList.add("vector-video-wrapper");
            // prepare timer
            this.recordingTimer = new Helpers.VideoTimer();
            this.recordingTimer.Pause();
            // prepare the board
            this.board = this.CreateBoard();
            this.AddChild(this.board);
            // prepare the panels
            var controls = new UI.Panel("div", id + "-controls");
            controls.GetHTML().classList.add("vector-video-controls");
            controls.GetHTML().classList.add("autohide");
            controls.GetHTML().classList.add("ui-control");
            var buttons = this.CreateButtonsPanel();
            buttons.GetHTML().classList.add("vector-video-buttons");
            var colorsPanel = this.CreateColorsPanel(colorPallete);
            colorsPanel.GetHTML().classList.add("vector-video-colors");
            var sizesPanel = this.CreateBrushSizesPanel(brushSizes);
            sizesPanel.GetHTML().classList.add("vector-video-sizes");
            var erasePanel = this.CreateErasePanel();
            erasePanel.GetHTML().classList.add("vector-video-erase");
            controls.AddChildren([buttons, colorsPanel, sizesPanel, erasePanel]);
            this.controls = controls;
            this.AddChild(this.controls);
        }
        Object.defineProperty(RecorderUI.prototype, "Timer", {
            /** Access to the timer for "everyone"" */
            get: function () { return this.recordingTimer; },
            enumerable: true,
            configurable: true
        });
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
            this.board.AddChild(canvas);
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
            this.recPauseButton = new UI.IconButton("rec", this.localization.Record, function (e) { return _this.RecordPause(); });
            // the upload button:
            this.uploadButton = new UI.IconButton("upload", this.localization.Upload, function (e) { return _this.InitializeUpload(); });
            Helpers.HTML.SetAttributes(this.uploadButton.GetHTML(), { "disabled": "disabled" });
            buttonsPanel.AddChildren([this.recPauseButton, this.uploadButton]);
            return buttonsPanel;
        };
        /**
         * This function is called when the REC/PAUSE button is clicked.
         */
        RecorderUI.prototype.RecordPause = function () {
            if (this.isRecording === true) {
                this.PauseRecording();
                this.uploadButton.GetHTML().removeAttribute("disabled");
                this.GetHTML().classList.remove("recording");
                this.recordingTimer.Pause();
            }
            else {
                this.StartRecording();
                Helpers.HTML.SetAttributes(this.uploadButton.GetHTML(), { "disabled": "disabled" });
                this.GetHTML().classList.add("recording");
                this.recordingTimer.Resume();
            }
        };
        /**
         * Start (or continue) recording
         */
        RecorderUI.prototype.StartRecording = function () {
            var _this = this;
            this.isRecording = true;
            this.recPauseButton.ChangeIcon("pause");
            this.board.IsRecording = true;
            this.ticking = setInterval(function () { return _this.Tick(); }, this.tickingInterval);
            Helpers.VideoEvents.trigger(Helpers.VideoEventType.Start);
        };
        /**
         * Pause recording
         */
        RecorderUI.prototype.PauseRecording = function () {
            this.isRecording = false;
            this.recPauseButton.ChangeIcon("rec");
            this.board.IsRecording = false;
            clearInterval(this.ticking);
            Helpers.VideoEvents.trigger(Helpers.VideoEventType.Pause);
        };
        /**
         * Update the displayed time
         */
        RecorderUI.prototype.Tick = function () {
            this.recPauseButton.ChangeContent(Helpers.millisecondsToString(this.recordingTimer.CurrentTime()));
        };
        RecorderUI.prototype.InitializeUpload = function () {
            // trigger upload
            Helpers.VideoEvents.trigger(Helpers.VideoEventType.StartUpload);
        };
        /**
         * Create a panel for changing colors
         * @param	brushSizes	List of possible brush colors
         */
        RecorderUI.prototype.CreateColorsPanel = function (colorPallete) {
            var panel = new UI.Panel("div", "color-pallete");
            for (var i = 0; i < colorPallete.length; i++) {
                panel.AddChild(new UI.ChangeColorButton(colorPallete[i]));
            }
            return panel;
        };
        /**
         * Create a panel for changing brush size
         * @param	brushSizes	List of possible brush sizes
         */
        RecorderUI.prototype.CreateBrushSizesPanel = function (brushSizes) {
            var panel = new UI.Panel("div", "brush-sizes");
            for (var i = 0; i < brushSizes.length; i++) {
                panel.AddChild(new UI.ChangeBrushSizeButton(brushSizes[i]));
            }
            return panel;
        };
        /**
         * Create a panel containing the eraser brush and the "erase all button"
         */
        RecorderUI.prototype.CreateErasePanel = function () {
            var _this = this;
            var panel = new UI.Panel("div", this.id + "-erase");
            // the eraser button
            panel.AddChild(new UI.ChangeColorButton(UI.Color.BackgroundColor));
            // the "erase all" button:
            var eraseBtn = new UI.IconButton("erase", this.localization.EraseAll, function (e) { return _this.EraseAll(); });
            panel.AddChild(eraseBtn);
            return panel;
        };
        /**
         * Clear the canvas
         */
        RecorderUI.prototype.EraseAll = function () {
            Helpers.VideoEvents.trigger(Helpers.VideoEventType.ClearCanvas);
        };
        return RecorderUI;
    })(UI.Panel);
    UI.RecorderUI = RecorderUI;
})(UI || (UI = {}));
/// <reference path="../Settings/BrushSettings" />
/// <reference path="../Settings/RecorderSettings" />
/// <reference path="../AudioRecording/AudioRecorder" />
/// <reference path="../VideoData/PointingDevice" />
/// <reference path="../VideoData/Mouse" />
/// <reference path="../VideoData/Touch" />
/// <reference path="../VideoData/Pointer" />
/// <reference path="../VideoData/WacomTablet" />
/// <reference path="../Drawing/SVGDrawer" />
/// <reference path="../Drawing/CanvasDrawer" />
/// <reference path="../VideoData/VideoInfo" />
/// <reference path="../Helpers/File" />
/// <reference path="../UI/RecorderUI" />
/// <reference path="../UI/BasicElements" />
/// <reference path="../VideoFormat/IO" />
/// <reference path="../VideoFormat/AnimatedSVGWriter" />
/// <reference path="../Localization/IRecorderLocalization" />
var VectorVideo;
(function (VectorVideo) {
    var Mouse = VideoData.Mouse;
    var WacomTablet = VideoData.WacomTablet;
    var TouchEventsAPI = VideoData.TouchEventsAPI;
    var PointerEventsAPI = VideoData.PointerEventsAPI;
    var SVGDrawer = Drawing.SVGDrawer;
    var AudioRecorder = AudioRecording.AudioRecorder;
    var Errors = Helpers.Errors;
    var ErrorType = Helpers.ErrorType;
    var VideoEvents = Helpers.VideoEvents;
    var VideoEventType = Helpers.VideoEventType;
    var VideoInfo = VideoData.VideoInfo;
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
            this.current = {
                Color: "#fff",
                Size: 3
            };
            // do not start recording until the user want's to start
            this.isRecording = false;
            this.lastTime = 0;
            this.data = [];
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
                settings.ColorPallete = colors;
            }
            if (!settings.BrushSizes || settings.BrushSizes.length === 0) {
                // default brush sizes
                var brushes = [];
                brushes.push(new UI.BrushSize("pixel", 2, "px"));
                brushes.push(new UI.BrushSize("tiny", 5, "px"));
                brushes.push(new UI.BrushSize("small", 20, "px"));
                brushes.push(new UI.BrushSize("medium", 30, "px"));
                brushes.push(new UI.BrushSize("large", 40, "px"));
                brushes.push(new UI.BrushSize("extra", 80, "px"));
                settings.BrushSizes = brushes;
            }
            if (!settings.Localization) {
                // default localization
                var loc = {
                    NoJS: "Your browser does not support JavaScript or it is turned off. Video can't be recorded without enabled JavaScript in your browser.",
                    Record: "Record video",
                    Pause: "Pause recording",
                    Upload: "Upload",
                    ChangeColor: "Change brush color",
                    ChangeSize: "Change brush size",
                    EraseAll: "Erase all",
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
            VideoEvents.on(VideoEventType.ClearCanvas, function () { return _this.ClearCanvas(); });
            VideoEvents.on(VideoEventType.Start, function () { return _this.Start(); });
            VideoEvents.on(VideoEventType.Continue, function () { return _this.Continue(); });
            VideoEvents.on(VideoEventType.Pause, function () { return _this.Pause(); });
            VideoEvents.on(VideoEventType.StartUpload, function () { return _this.StartUpload(); });
            // the most important part - the drawer
            if (!!settings.DrawingStrategy) {
                this.drawer = settings.DrawingStrategy;
            }
            else {
                // default drawing strategy is SVG
                this.drawer = new SVGDrawer(true);
            }
            // create UI and connect it to the drawer			
            this.ui = new UI.RecorderUI(id, settings.ColorPallete, settings.BrushSizes, settings.Localization);
            this.ui.AcceptCanvas(this.drawer.GetCanvas());
            container.appendChild(this.ui.GetHTML());
            this.drawer.Stretch(); // adapt to the environment
            var min = brushes.reduce(function (previousValue, currentValue, index, arr) { return previousValue.Size < currentValue.Size ? previousValue : currentValue; }).Size;
            var max = brushes.reduce(function (previousValue, currentValue, index, arr) { return previousValue.Size > currentValue.Size ? previousValue : currentValue; }).Size;
            this.drawer.InitDynaDraw(min, max, this.ui.Timer);
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
            // set default color and size of the brush
            VideoEvents.trigger(VideoEventType.ChangeColor, settings.ColorPallete[0]);
            VideoEvents.trigger(VideoEventType.ChangeBrushSize, settings.BrushSizes[0]);
        }
        /**
         * Start recording. Everything must be initialised
         * and from this moment all data must be stored properly.
         */
        Recorder.prototype.Start = function () {
            this.isRecording = true;
            if (this.audioRecorder) {
                this.audioRecorder.Start();
            }
        };
        /**
         * Pause recording. Do not record data temporarily.
         */
        Recorder.prototype.Pause = function () {
            this.isRecording = false;
            if (this.audioRecorder) {
                this.audioRecorder.Pause();
            }
        };
        /**
         * Continue recording after the process has been paused for a while.
         */
        Recorder.prototype.Continue = function () {
            this.isRecording = true;
            if (this.audioRecorder) {
                this.audioRecorder.Continue();
            }
        };
        /**
         * Stop recording and upload the recorded data.
         */
        Recorder.prototype.StartUpload = function () {
            var info = new VideoInfo;
            // @todo technical data from current settings
            this.isRecording = false;
            if (!!this.audioRecorder
                && this.audioRecorder.isRecording()) {
                var $this = this;
                this.audioRecorder.Stop(function (files) {
                    info.AudioTracks = files;
                    $this.UploadData(info);
                }, function () {
                    $this.FinishRecording(false); // upload failed
                });
            }
            else {
                // there was no audio
                info.AudioTracks = []; // no audio
                this.UploadData(info);
            }
        };
        /**
         * User want's to change brush thickness.
         * @param	size	New brush size
         */
        Recorder.prototype.ChangeBrushSize = function (size) {
            // User can change the size even if recording hasn't started or is paused
            //this.data.push(); // @todo
            this.drawer.SetBrushSize(size);
        };
        /**
         * User want's to change brush color.
         * @param	colo	New brush color
         */
        Recorder.prototype.ChangeColor = function (color) {
            // User can change the color even if recording hasn't started or is paused
            //this.data.push(); // @todo
            this.drawer.SetBrushColor(color);
        };
        /**
         * User moved the mouse or a digital pen.
         */
        Recorder.prototype.ProcessCursorState = function (state) {
            //if(this.isRecording === true) { // user can prepare something - everything will be drawn at once
            // add data only if recording is in progress
            //this.data.push(state); // @todo
            this.drawer.ProcessNewState(state);
            //}
        };
        /**
         * User moved the mouse or a digital pen.
         */
        Recorder.prototype.ClearCanvas = function () {
            //if(this.isRecording === true) { // user can prepare something - everything will be drawn at once
            // add data only if recording is in progress
            //this.data.push(state); // @todo
            this.drawer.ClearCanvas();
            //}
        };
        //
        // Upload the result
        //
        /**
         * Upload the recorded data to the server.
         * @param	info	Information about the video.
         */
        Recorder.prototype.UploadData = function (info) {
            var _this = this;
            // update info according to recorded data
            info.Length = this.lastTime;
            // board data
            info.Width = this.ui.Width;
            info.Height = this.ui.Height;
            info.BackgroundColor = this.ui.BackgroundColor;
            // get the recorded XML
            var writer = new VideoFormat.AnimatedSVGWriter();
            var xml = writer.ToString();
            // if I need saving the data to local computer in the future
            VideoEvents.on(VideoEventType.DownloadData, function () {
                Helpers.File.StartDownloadingXml(xml);
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
            req.send(xml);
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