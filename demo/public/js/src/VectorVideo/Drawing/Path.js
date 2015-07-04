/// <reference path="../Helpers/Vector" />
/// <reference path="../Helpers/SVG" />
/// <reference path="./Segments" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Drawing;
(function (Drawing) {
    var SVG = Helpers.SVG;
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
        Path.prototype.InitPath = function (right, left) {
            this.segments.push(new Drawing.ZeroLengthSegment(left, right));
            this.pathPoints.push({ Left: left, Right: right });
            this.iterator = 0;
        };
        /**
         * Draw another segment of current path.
         * @param	{Vector2}	right	"Right" point of the segment.
         * @param	{Vector2}	left	"Left"	point of the segment.
         */
        Path.prototype.ExtendPath = function (right, left) {
            // draw the segment
            var segment = this.DrawSegment(right, left);
            VideoEvents.trigger(VideoEventType.DrawSegment, segment);
            // and push it to the list
            this.segments.push(segment);
            this.pathPoints.push({ Left: left, Right: right });
            this.iterator++;
        };
        Path.prototype.DrawSegment = function (right, left) {
            if (this.curved) {
                return this.CalculateAndDrawCurvedSegment(right, left);
            }
            return this.CalculateAndDrawQuarilateralSegment(right, left);
        };
        Path.prototype.CalculateAndDrawCurvedSegment = function (right, left) {
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
        Path.prototype.CalculateAndDrawQuarilateralSegment = function (right, left) {
            var segment = new Drawing.QuadrilateralSegment(left, right);
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
        Path.angle = function (vec) {
            return Math.atan2(-vec.X, vec.Y) - Math.PI / 2; /// :-) 
        };
        /**
         * Draw everything from the begining
         */
        Path.prototype.DrawWholePath = function () {
            this.iterator = 0;
            this.DrawStartDot(this.startPosition, this.startRadius);
            while (this.iterator < this.segments.length) {
                var seg = this.segments[this.iterator];
                if (seg instanceof Drawing.CurvedSegment) {
                    this.DrawCurvedSegment(seg);
                }
                else if (seg instanceof Drawing.QuadrilateralSegment) {
                    this.DrawQuadrilateralSegment(seg);
                }
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
        function SvgPath(curved, color, canvas) {
            _super.call(this, curved, color);
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
            this.cap = SVG.ArcString(segment.Left, center.distanceTo(segment.Left), Path.angle(startDirection));
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
        CanvasPath.prototype.DrawQuadrilateralSegment = function (segment) {
            this.context.beginPath();
            this.context.moveTo(this.LastPoint.Right.X, this.LastPoint.Right.Y);
            this.context.lineTo(this.LastPoint.Left.X, this.LastPoint.Left.Y);
            this.context.lineTo(segment.Left.X, segment.Left.Y);
            // an "arc cap"
            var center = segment.Right.add(segment.Left).scale(0.5);
            var startDirection = segment.Right.subtract(center);
            var endDirection = segment.Left.subtract(center);
            this.context.arc(center.X, center.Y, center.distanceTo(segment.Left), Path.angle(startDirection), Path.angle(endDirection), false);
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
            this.context.arc(center.X, center.Y, center.distanceTo(segment.LeftBezier.End), Path.angle(startDirection), Path.angle(endDirection), false);
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
