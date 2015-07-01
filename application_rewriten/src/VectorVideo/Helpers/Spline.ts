///<reference path="./Vector.ts" />

module Helpers {
    
    /**
     * A set of functions for better spline handling. 
     */
    export class Spline {
        /**
         * Convert four consequent points to parameters for cubic Bézier curve.
         * (http://therndguy.com/papers/curves.pdf)
         * @param   a     Previous point on the spline
         * @param   b     Start point of this segment
         * @param   c     End point of this segment
         * @param   d     The following point on the spline 
         */        
        public static catmullRomToBezier(a: Vector2, b: Vector2, c: Vector2, d: Vector2) : BezierCurveSegment {                            
            return new BezierCurveSegment(b,
                                          new Vector2((-1/6 * a.X) + b.X + (1/6 * c.X), (-1/6 * a.Y) + b.Y + (1/6 * c.Y)),
                                          c,
                                          new Vector2((1/6 * b.X) + c.X + (-1/6 * d.X), (1/6 * b.Y) + c.Y + (-1/6 * d.Y)));
        }
        
    }   
        
    /**
     * Immutable set of control points of a cubic Bézier curve segment 
     */
    export class BezierCurveSegment {
        /** The point, wher the spline starts */
        get Start(): Vector2 { return this.start; }
        set Start(vec: Vector2) { this.start = vec; }
        
        /** The control point adjecent to the starting point */
        get StartCP(): Vector2 { return this.startCP; }
        set StartCP(vec: Vector2) { this.startCP = vec; }
        
        /** The point, where the spline ends */
        get End(): Vector2 { return this.end; }
        set End(vec: Vector2) { this.end = vec; }
        
        /** The control point adjecent to the ending point */
        get EndCP(): Vector2 {return this.endCP; }
        set EndCp(vec: Vector2) { this.endCP = vec; }
        
        /**
         * Repersents one segment of a bezier curve
         * @param   start   Previous point on the spline
         * @param   startCP Start point of this segment
         * @param   end     End point of this segment
         * @param   endCP   The following point on the spline 
         */                        
        constructor(private start: Vector2, private startCP: Vector2, private end: Vector2, private endCP: Vector2) { }
    }
}