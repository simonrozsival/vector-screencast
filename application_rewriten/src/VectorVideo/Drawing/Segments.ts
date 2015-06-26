/// <reference path="../Helpers/Vector" />
/// <reference path="../Helpers/Spline" />

module Drawing {
	
	import Vector2 = Helpers.Vector2;
	import BezierCurveSegment = Helpers.BezierCurveSegment;
	
	export class Segment {
		public get Time(): number { return this.time; }
		public get Left(): Vector2 { throw new Error("Not implemented"); }
		public get Right(): Vector2 { throw new Error("Not implemented"); }
		
		constructor(private time: number) {
		}
	}
	
	export class QuadrilateralSegment extends Segment {		
		public get Left(): Vector2 { return this.left; }
		public get Right(): Vector2 { return this.right; }
		
		constructor(protected left: Vector2, protected right: Vector2, time: number) {
			super(time);			
		}		
	}
	
	export class ZeroLengthSegment extends QuadrilateralSegment {		
		constructor(left: Vector2, right: Vector2, time: number) {
			super(left, right, time);			
		}		
	}
	
	export class CurvedSegment extends Segment {		
		public get Left(): Vector2 { return this.left.End; }
		public get Right(): Vector2 { return this.right.End; }
		public get LeftBezier(): BezierCurveSegment { return this.left; }
		public get RightBezier(): BezierCurveSegment { return this.right; }
		
		constructor(protected left: BezierCurveSegment, protected right: BezierCurveSegment, time: number) {
			super(time);			
		}		
	}
	
}