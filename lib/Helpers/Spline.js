///<reference path="./Vector.ts" />
var Vector_1 = require('./Vector');
var Spline = (function () {
    function Spline() {
    }
    Spline.catmullRomToBezier = function (a, b, c, d) {
        return new BezierCurveSegment(b, new Vector_1.default((-1 / 6 * a.X) + b.X + (1 / 6 * c.X), (-1 / 6 * a.Y) + b.Y + (1 / 6 * c.Y)), c, new Vector_1.default((1 / 6 * b.X) + c.X + (-1 / 6 * d.X), (1 / 6 * b.Y) + c.Y + (-1 / 6 * d.Y)));
    };
    return Spline;
})();
exports.Spline = Spline;
var BezierCurveSegment = (function () {
    function BezierCurveSegment(start, startCP, end, endCP) {
        this.start = start;
        this.startCP = startCP;
        this.end = end;
        this.endCP = endCP;
    }
    Object.defineProperty(BezierCurveSegment.prototype, "Start", {
        get: function () { return this.start; },
        set: function (vec) { this.start = vec; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BezierCurveSegment.prototype, "StartCP", {
        get: function () { return this.startCP; },
        set: function (vec) { this.startCP = vec; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BezierCurveSegment.prototype, "End", {
        get: function () { return this.end; },
        set: function (vec) { this.end = vec; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BezierCurveSegment.prototype, "EndCP", {
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
exports.BezierCurveSegment = BezierCurveSegment;
