/// <reference path="../Helpers/Vector" />
/// <reference path="../Helpers/SVG" />
/// <reference path="./Segments" />

module Drawing {
	
	import BezierHelper = Helpers.BezierCurveSegment;
	import SVG = Helpers.SVG;
	import Vector2 = Helpers.Vector2;
	
	
	interface PathPoint {
		Left: Vector2;
		Right: Vector2;
		Time: number;
	}
	
	export class Path {		
				
		/** Current path point */
		private iterator: number;
				
		/** List of all points that were drawn */
		protected segments: Array<Segment>;		
		
		/** List of raw points along the path */		
		private pathPoints: Array<PathPoint>;
						
		/** The last point that was drawn */
		protected get LastPoint(): PathPoint {
			return this.pathPoints[this.iterator];
		}
		
		/** The last point that was drawn */
		protected get LastButOnePoint(): PathPoint {
			return this.pathPoints[Math.max(0, this.iterator - 1)];
		}
		
		/** The last point that was drawn */
		protected get LastButTwoPoint(): PathPoint {
			return this.pathPoints[Math.max(0, this.iterator - 2)];
		}
		
		
		/** Start point information */
		private startPosition: Vector2;
		private startRadius: number;
		
		/**
		 * Init a new colored path
		 */
		constructor(protected color: string, protected wireframe?: boolean) {
			if(this.wireframe === undefined) {
				this.wireframe = false;
			}
			
			this.segments = [];
			this.pathPoints = [];
		}
		
		public StartPath(pt: Vector2, radius: number): void {
			this.DrawStartDot(pt, radius);
						
			this.startPosition = pt;
			this.startRadius = radius;			
			this.iterator = -1;
		}		
		
		protected DrawStartDot(pt: Vector2, radius: number): void {
			throw new Error("Not impelmented");
		}
		
		/**
		 * Before rendering the first segment, save the coordinates of the left and right
		 * point as soon, as the direction is known.
		 */
		public InitPath(right: Vector2, left: Vector2, time: number): void {
			this.segments.push(new ZeroLengthSegment(left, right, time));
			this.pathPoints.push({ Left: left, Right: right, Time: time });
			this.iterator = 0;			
		}
		
		/**
		 * Draw another segment of current path.
		 * @param	{Vector2}	right	"Right" point of the segment.
		 * @param	{Vector2}	left	"Left"	point of the segment.
		 */
		public ExtendPath(right: Vector2, left: Vector2, time: number): void {
			// draw the segment
			var segment: Segment = this.DrawSegment(right, left, time);
			
			// and push it to the list
			this.segments.push(segment);
			this.pathPoints.push({ Left: left, Right: right, Time: time });
			this.iterator++;
		}
				
		private DrawSegment(right: Vector2, left: Vector2, time: number): Segment {			
			return this.CalculateAndDrawCurvedSegment(right, left, time);
			
			// return this.CalculateAndDrawQuarilateralSegment(right, left, time);
		}
		
		private CalculateAndDrawCurvedSegment(right: Vector2, left: Vector2, time: number): Segment {			
			var leftBezier: Helpers.BezierCurveSegment = Helpers.Spline.catmullRomToBezier(this.LastButTwoPoint.Left, this.LastButOnePoint.Left, this.LastPoint.Left, left);
			var rightBezier: Helpers.BezierCurveSegment = Helpers.Spline.catmullRomToBezier(this.LastButTwoPoint.Right, this.LastButOnePoint.Right, this.LastPoint.Right, right);			
			var segment: CurvedSegment = new CurvedSegment(leftBezier, rightBezier, time)
			this.DrawCurvedSegment(segment);
						
			return segment;
		}		
		
		/**
		 * 
		 */
		protected DrawCurvedSegment(segment: CurvedSegment): void {
			throw new Error("Not implemented");
		}		
		
		/**
		 * 
		 */
		private CalculateAndDrawQuarilateralSegment(right: Vector2, left: Vector2, time: number): Segment {
			var segment: QuadrilateralSegment = new QuadrilateralSegment(left, right, time);
			this.DrawQuadrilateralSegment(segment);
			return segment;			
		}
		
		/**
		 * 
		 */
		protected DrawQuadrilateralSegment(segment: QuadrilateralSegment): void {
			throw new Error("Not implemented");
		}		
		
		/**
		 * 
		 */
		public Draw(): void {
			// No need to draw anything more..
		}
		
		/**
		 * Helper functions for determining, what is the angle between the x axis and vector in radians.
		 * Math.atan(vec) function does this, but the angle is counterclockwise and rotated by PI/2...
		 */
		protected angle(vec: Vector2): number {			
			return Math.atan2(-vec.X, vec.Y) - Math.PI/2; /// :-) 
		}
		
		/**
		 * Draw everything from the begining
		 */
		public Redraw(): void {
			this.iterator = 0;
			this.DrawStartDot(this.startPosition, this.startRadius);
			while (this.iterator < this.segments.length) {
				this.CalculateAndDrawCurvedSegment(this.LastPoint.Right, this.LastPoint.Left, this.LastPoint.Time);			
				this.iterator++;
			}
		}
	}
	
	
	export class SvgPath extends Path {
		
		// SVG elements, which make up the whole path
		private path: Element;
		private startDot: Element;
		private endDot: Element;
		
		// path segments
		private right: string;
		private left: string;
		private cap: string;
								
		/**
		 * Initialise new SVG path
		 */
		constructor(color: string, private canvas: Element) {
			super(color);
		}
			
		
		protected DrawStartDot(position: Vector2, radius: number): void {
			// init SVG
			this.startDot = SVG.CreateDot(position, radius, this.color);
			
			var options: any;
			if(this.wireframe) {
				// "wireframe" is better for debuging:
				options = {
					"stroke": this.color,
					"stroke-width": 1					 	
				};
			} else {
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
		}
				
		/**
		 * Extend the SVG path with a curved segment.
		 */
		protected DrawCurvedSegment(segment: CurvedSegment): void {
			this.right += SVG.CurveToString(segment.RightBezier.StartCP, segment.RightBezier.EndCP, segment.RightBezier.End);
			this.left = SVG.CurveToString(segment.LeftBezier.EndCP, segment.LeftBezier.StartCP, segment.LeftBezier.Start) + " " + this.left;
			
			// A] - a simple line at the end of the line 
			// this.cap = SVG.LineToString(left);
			
			// B] - an "arc cap"
			var center: Vector2 = segment.Right.add(segment.Left).scale(0.5);
			var startDirection: Vector2 = segment.Right.subtract(center);
			var endDirection: Vector2 = segment.Left.subtract(center);
			this.cap = SVG.ArcString(segment.Left, center.distanceTo(segment.Left), this.angle(startDirection));				
		}		
		
		/**
		 * Extend the SVG path with a quadrilateral segment
		 */		
		protected DrawQuadrilateralSegment(segment: QuadrilateralSegment): void {			
			this.right += SVG.LineToString(segment.Right);
			this.left = SVG.LineToString(this.LastPoint.Left) + " " + this.left;
			
			// A] - a simple line at the end of the line 
			// this.cap = SVG.LineToString(left);
			
			// B] - an "arc cap"
			var center: Vector2 = segment.Right.add(segment.Left).scale(0.5);
			var startDirection: Vector2 = segment.Right.subtract(center);
			var endDirection: Vector2 = segment.Left.subtract(center);
			this.cap = SVG.ArcString(segment.Left, center.distanceTo(segment.Left), this.angle(startDirection));
		}
				
		/**
		 * Promote the curve to the DOM
		 */
		public Draw(): void {
			SVG.SetAttributes(this.path, {
				d: this.right + this.cap + this.left 
			});
		}		
	}	
	
	
	export class CanvasPath extends Path {
						
		/** Init empty path */
		constructor(color: string, private context: CanvasRenderingContext2D) {
			super(color);
		}
		
		protected DrawStartDot(position: Vector2, radius: number): void {			
			// now draw the start dot
			this.DrawDot(position, radius);		
		}
		
		/**
		 * Helper function that draws a dot of the curve's color
		 * with specified radius in the given point.
		 */
		private DrawDot(c: Vector2, r: number) {			
			this.context.beginPath();
			this.context.arc(c.X, c.Y, r, 0, 2*Math.PI, true);
			this.context.closePath();
			this.context.fillStyle = this.color;
			this.context.fill();						
		}		
		
		/**
		 * Draw a simple quadrilateral segment
		 */
		protected DrawQuarilateralSegment(segment: QuadrilateralSegment): void { 
			this.context.beginPath();
			this.context.moveTo(this.LastPoint.Right.X, this.LastPoint.Right.Y);
			this.context.lineTo(this.LastPoint.Left.X, this.LastPoint.Left.Y);			
			this.context.lineTo(segment.Left.X, segment.Left.Y);
			
			// an "arc cap"
			var center: Vector2 = segment.Right.add(segment.Left).scale(0.5);
			var startDirection: Vector2 = segment.Right.subtract(center);
			var endDirection: Vector2 = segment.Left.subtract(center);
			this.context.arc(center.X, center.Y, center.distanceTo(segment.Left), this.angle(startDirection), this.angle(endDirection), false);		
			//
			
			this.context.closePath();
			
			this.context.fillStyle = this.color;
			this.context.fill();
		}
		
		/**
		 * Draw a curved segment using bezier curves.
		 */
		protected DrawCurvedSegment(segment: CurvedSegment): void {
			this.context.beginPath();
			this.context.moveTo(segment.RightBezier.Start.X, segment.RightBezier.Start.Y);	
			this.context.lineTo(segment.LeftBezier.Start.X, segment.LeftBezier.Start.Y);
						
			// left curve
			this.context.bezierCurveTo(segment.LeftBezier.StartCP.X, segment.LeftBezier.StartCP.Y, segment.LeftBezier.EndCP.X, segment.LeftBezier.EndCP.Y, segment.LeftBezier.End.X, segment.LeftBezier.End.Y);			
			
			// A] - an "arc cap"
			var center: Vector2 = segment.RightBezier.End.add(segment.LeftBezier.End).scale(0.5);
			var startDirection: Vector2 = segment.RightBezier.End.subtract(center);
			var endDirection: Vector2 = segment.LeftBezier.End.subtract(center);
			this.context.arc(center.X, center.Y, center.distanceTo(segment.LeftBezier.End), this.angle(startDirection), this.angle(endDirection), false);
			
			// B] - line cap	
			// this.context.lineTo(segment.RightBezier.End.X, segment.RightBezier.End.Y);
			
			// right curve
			this.context.bezierCurveTo(segment.RightBezier.EndCP.X, segment.RightBezier.EndCP.Y, segment.RightBezier.StartCP.X, segment.RightBezier.StartCP.Y, segment.RightBezier.Start.X, segment.RightBezier.Start.Y);			
			
			this.context.closePath();
			
			if(this.wireframe) {
				// "wireframe" is better for debuging:
				this.context.strokeStyle = this.color;
				this.context.stroke();				
			} else {
				// filled shape is necessary for production:
				this.context.fillStyle = this.color;
				this.context.fill();				
			}			
		}
	}	
}