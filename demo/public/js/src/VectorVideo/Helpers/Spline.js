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
