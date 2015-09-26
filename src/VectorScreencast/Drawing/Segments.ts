/// <reference path="../Helpers" />

import Vector2 from '../Helpers/Vector';
import { BezierCurveSegment } from '../Helpers/Spline';
	
//namespace VectorScreencast.Drawing {
		
	export default class Segment {
		public get Left(): Vector2 { throw new Error("Not implemented"); }
		public get Right(): Vector2 { throw new Error("Not implemented"); }
		
		constructor() { }
	}
	
	export class QuadrilateralSegment extends Segment {		
		public get Left(): Vector2 { return this.left; }
		public get Right(): Vector2 { return this.right; }
		
		constructor(protected left: Vector2, protected right: Vector2) {
			super();			
		}		
	}
	
	export class ZeroLengthSegment extends QuadrilateralSegment {		
		constructor(left: Vector2, right: Vector2) {
			super(left, right);			
		}		
	}
	
	export class CurvedSegment extends Segment {		
		public get Left(): Vector2 { return this.left.End; }
		public get Right(): Vector2 { return this.right.End; }
		public set Left(vec: Vector2) { this.left.End = vec; }
		public set Right(vec: Vector2) { this.right.End = vec; }
		public get LeftBezier(): BezierCurveSegment { return this.left; }
		public get RightBezier(): BezierCurveSegment { return this.right; }
		
		constructor(protected left: BezierCurveSegment, protected right: BezierCurveSegment) {
			super();			
		}		
	}
	
//}