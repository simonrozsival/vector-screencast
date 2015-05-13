/// <reference path="./IDrawingStrategy.ts" />
/// <reference path="../helpers/Vector.ts" />
/// <reference path="../helpers/State.ts" />
/// <reference path="../helpers/SVG.ts" />
/// <reference path="../helpers/Spline.ts" />
/// <reference path="../settings/BrushSettings.ts" />
/// <reference path="../UI/BasicElements" />
var Vector2 = Helpers.Vector2;
var Spline = Helpers.Spline;
var BezierCurveSegment = Helpers.BezierCurveSegment;
var Drawing;
(function (Drawing) {
    /**
     * This is the main drawing class - processes cursor states
     * and renders the lines on the blackboard.
     * This class uses SVG (http://www.w3.org/TR/SVG) for visualising the lines.
     */
    var SVGDrawer = (function () {
        function SVGDrawer() {
            this.svg = HTML.CreateElement("svg");
            this.canvas = new UI.SimpleElement(this.svg);
            // stretch the SVG canvas as much as possible as soon as it knows where it is in the DOM
            // see http://www.w3.org/TR/2003/NOTE-DOM-Level-3-Events-20031107/DOM3-Events.html#events-event-DOMNodeInsertedIntoDocument
            this.svg.addEventListener("DOMNodeInsertedIntoDocument", this.Stretch);
            // settings will be set later
            this.settings = {
                Color: "",
                Size: 0
            };
        }
        /**
         * Allow acces to the canvas element.
         */
        SVGDrawer.prototype.GetCanvas = function () {
            return this.canvas;
        };
        /**
         * Set current brush size
         * @param   size    The new size of the brush (line thickness)
         */
        SVGDrawer.prototype.SetBrushSize = function (size) {
            this.settings.Size = size;
        };
        /**
         * Set current brush color
         * @param   color   The new color of the brush
         */
        SVGDrawer.prototype.SetBrushColor = function (color) {
            this.settings.Color = color;
        };
        /**
         * This method should stretch the canvas to fill it's container.
         * Stretch mus be called after the SVG element is inserted into the DOM.
         */
        SVGDrawer.prototype.Stretch = function (e) {
            // this is event handler - "this" isn't SVGDrawer here! 
            var svg = e.target;
            var parent = svg.parentElement;
            var width = parent.clientWidth;
            var height = parent.clientHeight;
            Helpers.HTML.SetAttributes(svg, {
                width: width,
                height: height
            });
            VideoEvents.trigger(VideoEventType.CanvasSize, width, height);
        };
        /**
         * Process next state and
         */
        SVGDrawer.prototype.ProcessNewState = function (cursor) {
            var nextPoint = new Vector2(cursor.X, cursor.Y);
            if (cursor.Pressure > 0) {
                if (!this.lastState || this.lastState.Pressure === 0) {
                    this.StartLine(nextPoint, cursor.Pressure);
                }
                else {
                    this.ContinueLine(nextPoint, cursor.Pressure);
                }
            }
            else if (this.lastState && cursor.Pressure > 0) {
                this.EndLine(nextPoint);
                this.Render(); // force render
            }
            this.lastState = cursor;
        };
        /**
         * Change the DOM so it is rendered correctly.
         * This method is called from outside before screen is repainted
         * - don't change DOM too often.
         */
        SVGDrawer.prototype.Render = function () {
            if (!!this.path) {
                this.path.UpdatePath();
            }
        };
        /**
         * Make the canvas blank.
         */
        SVGDrawer.prototype.ClearCanvas = function () {
            // remove all drawn parts
            while (!!this.svg.firstChild) {
                this.svg.removeChild(this.svg.firstChild);
            }
            // dump currently drawn path
            this.path = null;
        };
        /**
         * Start drawing a line.
         * @param   point       Start point of the line.
         * @param   pressure    The pressure of the pointing device in this point.
         */
        SVGDrawer.prototype.StartLine = function (point, pressure) {
            this.isOnlyClick = true;
            // start every line with a dot to make it nicely round
            var radius = this.CalculateRadius(pressure);
            var dot = SVG.CreateDot(point, radius, this.GetCurrentBrushSettings().Color);
            this.svg.appendChild(dot);
            // prepare values for following line segments
            this.prevPoint = point.clone();
            this.start = point.clone();
            this.startRadius = radius;
        };
        /**
         * Prolong the current line.
         * @param   nextPoint   Next point of the line.
         * @param   pressure    The pressure of the pointing device in this point.
         */
        SVGDrawer.prototype.ContinueLine = function (nextPoint, pressure) {
            var radius = this.CalculateRadius(pressure);
            if (this.isOnlyClick) {
                // this is the second point of the line - only a dot was drawn so far
                if (this.PreparePath(nextPoint, radius)) {
                    this.isOnlyClick = false;
                    this.end = nextPoint.clone();
                    // place a dot at the end
                    this.endDot = SVG.CreateDot(this.end, radius, this.GetCurrentBrushSettings().Color);
                    this.svg.appendChild(this.endDot);
                }
            }
            // save for next time - I have to know the position of one point following to draw the curve nicely              
            this.nextPoint = nextPoint;
            // just draw another segment of the line
            this.DrawSegment();
            // shift points
            this.startRadius = this.endRadius;
            this.endRadius = radius;
            this.prevPoint = this.start;
            this.start = this.end;
            this.end = this.nextPoint;
        };
        /**
         * Convert pressure to brush radius according to current brush settings and pointing device pressure. Pointing device pressure value in the range of [0;1]
         * @param pressure  	Pointing device pressure
         */
        SVGDrawer.prototype.CalculateRadius = function (pressure) {
            return (pressure * this.GetCurrentBrushSettings().Size) / 2;
        };
        /**
         * Current brush settings
         * @return {object} Settings.
         */
        SVGDrawer.prototype.GetCurrentBrushSettings = function () {
            return this.settings;
        };
        /**
         *
         * @param   {Vector2}   nextPoint   The point where the path will start
         * @param   {number}    radius      Start radius
         * @returns {boolean}   True if preparations went well, false otherwise.
         */
        SVGDrawer.prototype.PreparePath = function (nextPoint, radius) {
            // calculate starting points
            var direction = nextPoint.subtract(this.start);
            if (direction.X === 0 && direction.Y === 0) {
                return false; // mouse hasn't moved a bit
            }
            // start a new path and prepare both top and bottom path strings
            this.path = new Path(this.GetCurrentBrushSettings().Color);
            this.svg.appendChild(this.path.Element);
            // position the start points
            var normal = direction.getNormal().scale(radius);
            this.path.PreparePath(this.start, normal);
            return true;
        };
        /**
         * Draw the following sement of the line
         */
        SVGDrawer.prototype.DrawSegment = function () {
            // calculate normal vector
            var direction = this.end.subtract(this.start);
            if (direction.X === 0 && direction.Y === 0) {
                return; // distance between start and end is zero
            }
            var normal = direction.getNormal();
            var startNormal = normal.scale(this.startRadius);
            var endNormal = normal.scale(this.endRadius);
            if (direction.getSize() > this.startRadius + this.endRadius) {
                var spline = Spline.catmullRomToBezier(this.prevPoint, this.start, this.end, this.nextPoint);
                this.path.DrawCurvedSegment(spline, startNormal, endNormal);
            }
            else {
                // the points are too close to each other
                this.path.DrawStraightSegment(this.start, startNormal, this.end, endNormal);
            }
            this.MoveEndDot(this.end, this.endRadius);
        };
        /**
         * Ends currently drawn line.
         * @param {Vector2} pos Position of mouse when pressure dropped to 0.
         */
        SVGDrawer.prototype.EndLine = function (position) {
            if (!this.isOnlyClick) {
                // draw the last missing segment
                this.DrawSegment();
            }
        };
        /**
         * Move the dot and resize it according it to current state.
         * @param {Vector2} center  Center position
         * @param {number}  radius  Dot radius.
         */
        SVGDrawer.prototype.MoveEndDot = function (center, radius) {
            SVG.SetAttributes(this.endDot, {
                "cx": center.X,
                "cy": center.Y,
                "r": radius
            });
        };
        return SVGDrawer;
    })();
    Drawing.SVGDrawer = SVGDrawer;
    /**
     * Reperesnts one path.
     */
    var Path = (function () {
        function Path(color) {
            this.element = SVG.CreateElement("path", {
                fill: color,
                stroke: "transparent"
            });
        }
        Object.defineProperty(Path.prototype, "Element", {
            get: function () { return this.element; },
            enumerable: true,
            configurable: true
        });
        Path.prototype.PreparePath = function (start, normal) {
            this.top = new TopPathSegment(start.add(normal));
            this.bottom = new BottomPathSegment(start.subtract(normal));
            this.end = start;
            this.endNormal = normal;
        };
        Path.prototype.DrawCurvedSegment = function (spline, startNormal, endNormal) {
            this.top.DrawCurvedSegment(spline, startNormal, endNormal);
            this.bottom.DrawCurvedSegment(spline, startNormal, endNormal);
        };
        Path.prototype.DrawStraightSegment = function (start, startNormal, end, endNormal) {
            this.top.DrawStraightSegment(start, startNormal, end, endNormal);
            this.bottom.DrawStraightSegment(start, startNormal, end, endNormal);
            this.end = end;
            this.endNormal = endNormal;
        };
        Path.prototype.UpdatePath = function () {
            var cap = SVG.LineToString(this.end.add(this.endNormal));
            var path = this.top.GetPath() + " " + cap + " " + this.bottom.GetPath();
            SVG.SetAttributes(this.element, { d: path });
        };
        return Path;
    })();
    /**
     * The "top" segment is the main spline PLUS normal in main spline control points.
     * It is built "straignt-forward"
     */
    var TopPathSegment = (function () {
        function TopPathSegment(start) {
            this.path = SVG.MoveToString(start) + " ";
        }
        TopPathSegment.prototype.GetPath = function () { return this.path; };
        TopPathSegment.prototype.DrawCurvedSegment = function (segment, startNormal, endNormal) {
            this.path += " " + SVG.CurveToString(segment.StartCP.add(startNormal), segment.EndCP.add(endNormal), segment.End.add(endNormal));
        };
        TopPathSegment.prototype.DrawStraightSegment = function (start, startNormal, end, endNormal) {
            this.path += " " + SVG.LineToString(end.add(endNormal));
        };
        return TopPathSegment;
    })();
    /**
     * The "bottom" segment is the main spline MINUS the normal in main spline control points.
     * It is build "backwards".
     */
    var BottomPathSegment = (function () {
        function BottomPathSegment(start) {
            this.path = SVG.LineToString(start) + " Z";
        }
        BottomPathSegment.prototype.GetPath = function () { return this.path; };
        BottomPathSegment.prototype.DrawCurvedSegment = function (segment, startNormal, endNormal) {
            this.path = SVG.CurveToString(segment.EndCP.add(endNormal), segment.StartCP.add(startNormal), segment.Start.add(startNormal)) + " " + this.path;
        };
        BottomPathSegment.prototype.DrawStraightSegment = function (start, startNormal, end, endNormal) {
            this.path += " " + SVG.LineToString(start.add(startNormal));
        };
        return BottomPathSegment;
    })();
})(Drawing || (Drawing = {}));
//# sourceMappingURL=SVGDrawer.js.map