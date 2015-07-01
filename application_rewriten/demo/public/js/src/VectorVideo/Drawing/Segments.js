/// <reference path="../Helpers/Vector" />
/// <reference path="../Helpers/Spline" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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
