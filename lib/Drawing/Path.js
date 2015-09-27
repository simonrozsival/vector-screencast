var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SVG_1 = require('../Helpers/SVG');
var Vector_1 = require('../Helpers/Vector');
var VideoEvents_1 = require('../Helpers/VideoEvents');
var Spline_1 = require('../Helpers/Spline');
var Segments_1 = require('./Segments');
var Path = (function () {
    function Path(events, curved, color, wireframe) {
        this.events = events;
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
        get: function () {
            return this.segments;
        },
        set: function (value) {
            this.segments = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Path.prototype, "LastDrawnSegment", {
        get: function () {
            return this.lastDrawnSegment;
        },
        set: function (value) {
            this.lastDrawnSegment = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Path.prototype, "LastPoint", {
        get: function () {
            return this.pathPoints[this.iterator];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Path.prototype, "LastButOnePoint", {
        get: function () {
            return this.pathPoints[Math.max(0, this.iterator - 1)];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Path.prototype, "LastButTwoPoint", {
        get: function () {
            return this.pathPoints[Math.max(0, this.iterator - 2)];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Path.prototype, "Color", {
        get: function () {
            return this.color;
        },
        enumerable: true,
        configurable: true
    });
    Path.prototype.StartPath = function (pt, radius) {
        this.segments = [new Segments_1.ZeroLengthSegment(pt.clone().add(new Vector_1.default(0, radius)), pt.clone().add(new Vector_1.default(0, -radius)))];
        this.startPosition = pt;
        this.startRadius = radius;
        this.iterator = -1;
        this.DrawStartDot(pt, radius);
        this.lastDrawnSegment = this.segments[0];
    };
    Path.prototype.DrawStartDot = function (pt, radius) {
        throw new Error("Not impelmented");
    };
    Path.prototype.InitPath = function (right, left) {
        this.segments = [new Segments_1.ZeroLengthSegment(left, right)];
        this.pathPoints.push({ Left: left, Right: right });
        this.iterator = 0;
    };
    Path.prototype.StartDrawingPath = function (seg) {
        this.DrawStartDot(seg.Left.pointInBetween(seg.Right), seg.Left.distanceTo(seg.Right) / 2);
        this.lastDrawnSegment = seg;
    };
    Path.prototype.ExtendPath = function (right, left) {
        var last = this.pathPoints[this.pathPoints.length - 1];
        if (last.Left.isEqualTo(left) && last.Right.isEqualTo(right)) {
            return;
        }
        var segment = this.CalculateSegment(right, left);
        this.DrawSegment(segment);
        this.events.trigger(VideoEvents_1.VideoEventType.DrawSegment, segment);
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
        var leftBezier = Spline_1.Spline.catmullRomToBezier(this.LastButTwoPoint.Left, this.LastButOnePoint.Left, this.LastPoint.Left, left);
        var rightBezier = Spline_1.Spline.catmullRomToBezier(this.LastButTwoPoint.Right, this.LastButOnePoint.Right, this.LastPoint.Right, right);
        var segment = new Segments_1.CurvedSegment(leftBezier, rightBezier);
        this.DrawCurvedSegment(segment);
        return segment;
    };
    Path.prototype.DrawCurvedSegment = function (segment) {
        throw new Error("Not implemented");
    };
    Path.prototype.CalculateQuarilateralSegment = function (right, left) {
        return new Segments_1.QuadrilateralSegment(left, right);
    };
    Path.prototype.DrawQuadrilateralSegment = function (segment) {
        throw new Error("Not implemented");
    };
    Path.prototype.Draw = function () {
    };
    Path.prototype.DrawSegment = function (seg) {
        if (seg instanceof Segments_1.CurvedSegment) {
            this.DrawCurvedSegment(seg);
        }
        else if (seg instanceof Segments_1.QuadrilateralSegment) {
            this.DrawQuadrilateralSegment(seg);
        }
        this.lastDrawnSegment = seg;
    };
    Path.angle = function (vec) {
        return Math.atan2(-vec.X, vec.Y) - Math.PI / 2;
    };
    Path.prototype.DrawWholePath = function () {
        this.iterator = 0;
        if (this.segments.length === 0)
            return;
        var start = this.segments[0].Left.clone().add(this.segments[0].Right).scale(0.5);
        var radius = start.distanceTo(this.segments[0].Left);
        this.DrawStartDot(start, radius);
        this.lastDrawnSegment = this.segments[0];
        while (this.iterator < this.segments.length) {
            this.DrawSegment(this.segments[this.iterator++]);
        }
        this.Draw();
    };
    return Path;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Path;
var SvgPath = (function (_super) {
    __extends(SvgPath, _super);
    function SvgPath(events, curved, color, canvas) {
        _super.call(this, events, curved, color);
        this.canvas = canvas;
    }
    SvgPath.prototype.DrawStartDot = function (position, radius) {
        this.path = this.CreatePathElement();
        var left = new Vector_1.default(position.X - radius, position.Y);
        var right = new Vector_1.default(position.X + radius, position.Y);
        var center = right.pointInBetween(left);
        var startDirection = left.clone().subtract(center);
        var endDirection = right.clone().subtract(center);
        var arc = SVG_1.default.ArcString(right, center.distanceTo(right), Path.angle(startDirection));
        this.right = SVG_1.default.MoveToString(right);
        this.left = SVG_1.default.LineToString(left) + " " + arc;
        this.cap = SVG_1.default.ArcString(left, center.distanceTo(left), Path.angle(endDirection));
        SVG_1.default.SetAttributes(this.path, { d: this.right + this.cap + this.left });
        this.canvas.appendChild(this.path);
    };
    SvgPath.prototype.InitPath = function (right, left) {
        _super.prototype.InitPath.call(this, right, left);
        this.StartDrawingPath(this.segments[0]);
    };
    SvgPath.prototype.CreatePathElement = function () {
        var options;
        if (this.wireframe) {
            options = {
                "stroke": this.color,
                "stroke-width": 1
            };
        }
        else {
            options = {
                "fill": this.color
            };
        }
        return SVG_1.default.CreateElement("path", options);
    };
    SvgPath.prototype.DrawCurvedSegment = function (segment) {
        this.right += SVG_1.default.CurveToString(segment.RightBezier.StartCP, segment.RightBezier.EndCP, segment.RightBezier.End);
        this.left = SVG_1.default.CurveToString(segment.LeftBezier.EndCP, segment.LeftBezier.StartCP, segment.LeftBezier.Start) + " " + this.left;
        var center = segment.Right.pointInBetween(segment.Left);
        var startDirection = segment.Right.clone().subtract(center);
        this.cap = SVG_1.default.ArcString(segment.Left, center.distanceTo(segment.Left), Path.angle(startDirection));
    };
    SvgPath.prototype.DrawQuadrilateralSegment = function (segment) {
        this.right += SVG_1.default.LineToString(segment.Right);
        this.left = SVG_1.default.LineToString(this.lastDrawnSegment.Left) + " " + this.left;
        var center = segment.Right.pointInBetween(segment.Left);
        var startDirection = segment.Right.clone().subtract(center);
        this.cap = SVG_1.default.ArcString(segment.Left, center.distanceTo(segment.Left), Path.angle(startDirection));
    };
    SvgPath.prototype.GetPathString = function () {
        return this.right + this.cap + this.left;
    };
    SvgPath.prototype.Draw = function () {
        SVG_1.default.SetAttributes(this.path, {
            d: this.GetPathString()
        });
    };
    return SvgPath;
})(Path);
exports.SvgPath = SvgPath;
var CanvasPath = (function (_super) {
    __extends(CanvasPath, _super);
    function CanvasPath(events, curved, color, context) {
        _super.call(this, events, curved, color);
        this.context = context;
        this.context.fillStyle = this.color;
    }
    CanvasPath.prototype.DrawStartDot = function (position, radius) {
        this.context.beginPath();
        this.DrawDot(position, radius);
        this.Draw();
    };
    CanvasPath.prototype.DrawDot = function (c, r) {
        this.context.arc(c.X, c.Y, r, 0, 2 * Math.PI, true);
    };
    CanvasPath.prototype.DrawQuadrilateralSegment = function (segment) {
        this.context.moveTo(this.lastDrawnSegment.Right.X, this.lastDrawnSegment.Right.Y);
        this.context.lineTo(this.lastDrawnSegment.Left.X, this.lastDrawnSegment.Left.Y);
        this.context.lineTo(segment.Left.X, segment.Left.Y);
        var center = segment.Left.pointInBetween(segment.Right);
        var startDirection = segment.Right.clone().subtract(center);
        var endDirection = segment.Left.clone().subtract(center);
        this.context.arc(center.X, center.Y, center.distanceTo(segment.Left), Path.angle(startDirection), Path.angle(endDirection), false);
    };
    CanvasPath.prototype.DrawCurvedSegment = function (segment) {
        this.context.moveTo(segment.RightBezier.Start.X, segment.RightBezier.Start.Y);
        this.context.lineTo(segment.LeftBezier.Start.X, segment.LeftBezier.Start.Y);
        this.context.bezierCurveTo(segment.LeftBezier.StartCP.X, segment.LeftBezier.StartCP.Y, segment.LeftBezier.EndCP.X, segment.LeftBezier.EndCP.Y, segment.LeftBezier.End.X, segment.LeftBezier.End.Y);
        var center = segment.RightBezier.End.pointInBetween(segment.LeftBezier.End);
        var startDirection = segment.RightBezier.End.clone().subtract(center);
        var endDirection = segment.LeftBezier.End.clone().subtract(center);
        this.context.arc(center.X, center.Y, center.distanceTo(segment.LeftBezier.End), Path.angle(startDirection), Path.angle(endDirection), false);
        this.context.bezierCurveTo(segment.RightBezier.EndCP.X, segment.RightBezier.EndCP.Y, segment.RightBezier.StartCP.X, segment.RightBezier.StartCP.Y, segment.RightBezier.Start.X, segment.RightBezier.Start.Y);
    };
    CanvasPath.prototype.Draw = function () {
        this.context.closePath();
        this.context.fill();
        this.context.beginPath();
    };
    return CanvasPath;
})(Path);
exports.CanvasPath = CanvasPath;
