/// <reference path="Vector.d.ts" />
import Vector2 from './Vector';
export declare class Spline {
    static catmullRomToBezier(a: Vector2, b: Vector2, c: Vector2, d: Vector2): BezierCurveSegment;
}
export declare class BezierCurveSegment {
    private start;
    private startCP;
    private end;
    private endCP;
    Start: Vector2;
    StartCP: Vector2;
    End: Vector2;
    EndCP: Vector2;
    EndCp: Vector2;
    constructor(start: Vector2, startCP: Vector2, end: Vector2, endCP: Vector2);
}
