import Vector2 from '../Helpers/Vector';
import { BezierCurveSegment } from '../Helpers/Spline';
export default class Segment {
    Left: Vector2;
    Right: Vector2;
    constructor();
}
export declare class QuadrilateralSegment extends Segment {
    protected left: Vector2;
    protected right: Vector2;
    Left: Vector2;
    Right: Vector2;
    constructor(left: Vector2, right: Vector2);
}
export declare class ZeroLengthSegment extends QuadrilateralSegment {
    constructor(left: Vector2, right: Vector2);
}
export declare class CurvedSegment extends Segment {
    protected left: BezierCurveSegment;
    protected right: BezierCurveSegment;
    Left: Vector2;
    Right: Vector2;
    LeftBezier: BezierCurveSegment;
    RightBezier: BezierCurveSegment;
    constructor(left: BezierCurveSegment, right: BezierCurveSegment);
}
