/// <reference path="../Helpers/Vector" />
/// <reference path="../Helpers/SVG" />
/// <reference path="./Segments" />

module Drawing {
	
	import BezierHelper = Helpers.BezierCurveSegment;
	import SVG = Helpers.SVG;
	import Vector2 = Helpers.Vector2;
	
	import VideoEvents = Helpers.VideoEvents;
	import VideoEventType = Helpers.VideoEventType;
	
	
	interface PathPoint {
		Left: Vector2;
		Right: Vector2;
	}
		
	export class Path {		
				
				
		/** List of all points that were drawn */
		protected segments: Array<Segment>;		
		
		/** Access to all segments of the path. */
		public get Segments(): Array<Segment> {
			return this.segments;
		}
				
		/** Assign set of all segments at once. */
		public set Segments(value: Array<Segment>) {
			this.segments = value;
		}
		
		/** Segment to extend */
		protected lastDrawnSegment: Segment;
		
		/** Access the segment that was drawn previousely. */
		public get LastDrawnSegment(): Segment {
			return this.lastDrawnSegment;
		}
				
		/** Init the last drawn segment position. */
		public set LastDrawnSegment(value: Segment) {
			this.lastDrawnSegment = value;
		}
		
		
		/** Current path point */
		private iterator: number;
		
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
		constructor(protected curved: boolean, protected color: string, protected wireframe?: boolean) {
			if(this.wireframe === undefined) {
				this.wireframe = false;
			}
			
			this.segments = [];
			this.pathPoints = [];
		}
		
		/**
		 * Path of the color fill.
		 */
		public get Color(): string {
			return this.color;
		}
		
		public StartPath(pt: Vector2, radius: number): void {
			this.segments = [ new ZeroLengthSegment(pt.clone().add(new Vector2(0, radius)), pt.clone().add(new Vector2(0, -radius))) ];		
			this.startPosition = pt;
			this.startRadius = radius;			
			this.iterator = -1;
			
			this.DrawStartDot(pt, radius);
			this.lastDrawnSegment = this.segments[0];				
		}		
		
		public DrawStartDot(pt: Vector2, radius: number): void {
			throw new Error("Not impelmented");
		}
		
		/**
		 * Before rendering the first segment, save the coordinates of the left and right
		 * point as soon, as the direction is known.
		 */
		public InitPath(right: Vector2, left: Vector2): void {
			this.segments = [ new ZeroLengthSegment(left, right) ]; // override the first segment
			this.pathPoints.push({ Left: left, Right: right });
			this.iterator = 0;
		}
		
		public StartDrawingPath(seg: ZeroLengthSegment): void {
			this.DrawStartDot(seg.Left.pointInBetween(seg.Right), seg.Left.distanceTo(seg.Right) / 2);
			this.lastDrawnSegment = seg;
		}
		
		/**
		 * Draw another segment of current path.
		 * @param	{Vector2}	right	"Right" point of the segment.
		 * @param	{Vector2}	left	"Left"	point of the segment.
		 */
		public ExtendPath(right: Vector2, left: Vector2): void {
			// draw the segment
			var segment: Segment = this.CalculateSegment(right, left);
			this.DrawSegment(segment);
			VideoEvents.trigger(VideoEventType.DrawSegment, segment);
			
			// and push it to the list
			this.segments.push(segment);
			this.pathPoints.push({ Left: left, Right: right });
			this.iterator++;
		}
				
		private CalculateSegment(right: Vector2, left: Vector2): Segment {
			if(this.curved) {
				return this.CalculateCurvedSegment(right, left);				
			}
			
			return this.CalculateQuarilateralSegment(right, left);
		}
		
		private CalculateCurvedSegment(right: Vector2, left: Vector2): Segment {			
			var leftBezier: Helpers.BezierCurveSegment = Helpers.Spline.catmullRomToBezier(this.LastButTwoPoint.Left, this.LastButOnePoint.Left, this.LastPoint.Left, left);
			var rightBezier: Helpers.BezierCurveSegment = Helpers.Spline.catmullRomToBezier(this.LastButTwoPoint.Right, this.LastButOnePoint.Right, this.LastPoint.Right, right);			
			var segment: CurvedSegment = new CurvedSegment(leftBezier, rightBezier)
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
		private CalculateQuarilateralSegment(right: Vector2, left: Vector2): Segment {
			return new QuadrilateralSegment(left, right);
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
			// This si up to concrete ancestors..
		}
		
		public DrawSegment(seg: Segment) {
			if(seg instanceof CurvedSegment) {
				this.DrawCurvedSegment(seg);
			} else if (seg instanceof QuadrilateralSegment) {
				this.DrawQuadrilateralSegment(seg);				
			}
			
			this.lastDrawnSegment = seg;
		}
		
		/**
		 * Helper functions for determining, what is the angle between the x axis and vector in radians.
		 * Math.atan(vec) function does this, but the angle is counterclockwise and rotated by PI/2...
		 */
		public static angle(vec: Vector2): number {			
			return Math.atan2(-vec.X, vec.Y) - Math.PI/2; /// :-) 
		}
		
		/**
		 * Draw everything from the begining
		 */
		public DrawWholePath(): void {
			this.iterator = 0;
			
			// if there's nothing to draw, run away!
			if(this.segments.length === 0) return;
			
			var start = this.segments[0].Left.clone().add(this.segments[0].Right).scale(0.5);
			var radius = start.distanceTo(this.segments[0].Left);
			this.DrawStartDot(start, radius);
			this.lastDrawnSegment = this.segments[0];
			
			while (this.iterator < this.segments.length) {
				this.DrawSegment(this.segments[this.iterator++]);
			}
			this.Draw(); // flush
		}
	}
	
	
	export class SvgPath extends Path {
		
		// SVG elements, which make up the whole path
		private path: Element;
		
		// path segments
		private right: string;
		private left: string;
		private cap: string;
								
		/**
		 * Initialise new SVG path
		 */
		constructor(curved: boolean, color: string, private canvas: Element) {
			super(curved, color);
		}
			
		
		public DrawStartDot(position: Vector2, radius: number): void {			
			this.path = this.CreatePathElement();
			
			// arc cap at the start
			var left = new Vector2(position.X - radius, position.Y);
			var right = new Vector2(position.X + radius, position.Y);
			
			var center = right.pointInBetween(left);
			var startDirection = left.clone().subtract(center);
			var endDirection = right.clone().subtract(center);
			var arc = SVG.ArcString(right, center.distanceTo(right), Path.angle(startDirection));
				
			// prepare paths
			this.right = SVG.MoveToString(right);
			this.left = `${SVG.LineToString(left)} ${arc}`;			
			this.cap = SVG.ArcString(left, center.distanceTo(left), Path.angle(endDirection));
			SVG.SetAttributes(this.path, { d: this.right + this.cap + this.left });
			
			// connect SVG's with the canvas				
			this.canvas.appendChild(this.path);
		}
		
		/**
		 * Before rendering the first segment, save the coordinates of the left and right
		 * point as soon, as the direction is known.
		 */
		public InitPath(right: Vector2, left: Vector2): void {
			super.InitPath(right, left);
			this.StartDrawingPath(<ZeroLengthSegment> this.segments[0]);
		}
		
		private CreatePathElement(): Element {
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
			return SVG.CreateElement("path", options);			
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
			var center: Vector2 = segment.Right.pointInBetween(segment.Left);
			var startDirection: Vector2 = segment.Right.clone().subtract(center);
			//var endDirection: Vector2 = segment.Left.clone().subtract(center);
			this.cap = SVG.ArcString(segment.Left, center.distanceTo(segment.Left), Path.angle(startDirection));
		}		
		
		/**
		 * Extend the SVG path with a quadrilateral segment
		 */		
		protected DrawQuadrilateralSegment(segment: QuadrilateralSegment): void {			
			this.right += SVG.LineToString(segment.Right);
			this.left = SVG.LineToString(this.lastDrawnSegment.Left) + " " + this.left;
			
			// A] - a simple line at the end of the line 
			// this.cap = SVG.LineToString(left);
			
			// B] - an "arc cap"
			var center: Vector2 = segment.Right.pointInBetween(segment.Left);
			var startDirection: Vector2 = segment.Right.clone().subtract(center);
			//var endDirection: Vector2 = segment.Left.clone().subtract(center);
			this.cap = SVG.ArcString(segment.Left, center.distanceTo(segment.Left), Path.angle(startDirection));
		}
				
		/**
		 * Create path string.
		 */
		public GetPathString(): string {
			return this.right + this.cap + this.left;
		}
				
		/**
		 * Promote the curve to the DOM
		 */
		public Draw(): void {
			SVG.SetAttributes(this.path, {
				d:  this.GetPathString()
			});
		}		
	}	
	
	
	export class CanvasPath extends Path {
						
		/** Init empty path */
		constructor(curved: boolean, color: string, private context: CanvasRenderingContext2D) {
			super(curved, color);
			//this.context.fillStyle = this.color;
			this.context.strokeStyle = this.color;			
		}
		
		public DrawStartDot(position: Vector2, radius: number): void {			
			// now draw the start dot
			this.context.beginPath();
			this.DrawDot(position, radius);
			this.Draw();
		}
		
		/**
		 * Helper function that draws a dot of the curve's color
		 * with specified radius in the given point.
		 */
		private DrawDot(c: Vector2, r: number) {
			this.context.arc(c.X, c.Y, r, 0, 2*Math.PI, true);
		}		
		
		/**
		 * Draw a simple quadrilateral segment
		 */
		protected DrawQuadrilateralSegment(segment: QuadrilateralSegment): void {
			this.context.moveTo(this.lastDrawnSegment.Right.X, this.lastDrawnSegment.Right.Y);
			this.context.lineTo(this.lastDrawnSegment.Left.X, this.lastDrawnSegment.Left.Y);			
			this.context.lineTo(segment.Left.X, segment.Left.Y);
			
			// an "arc cap"
			var center: Vector2 = segment.Left.pointInBetween(segment.Right);
			var startDirection: Vector2 = segment.Right.clone().subtract(center);
			var endDirection: Vector2 = segment.Left.clone().subtract(center);
			this.context.arc(center.X, center.Y, center.distanceTo(segment.Left), Path.angle(startDirection), Path.angle(endDirection), false);		
			//		
		}
		
		/**
		 * Draw a curved segment using bezier curves.
		 */
		protected DrawCurvedSegment(segment: CurvedSegment): void {						
			this.context.moveTo(segment.RightBezier.Start.X, segment.RightBezier.Start.Y);	
			this.context.lineTo(segment.LeftBezier.Start.X, segment.LeftBezier.Start.Y);
						
			// left curve
			this.context.bezierCurveTo(segment.LeftBezier.StartCP.X, segment.LeftBezier.StartCP.Y, segment.LeftBezier.EndCP.X, segment.LeftBezier.EndCP.Y, segment.LeftBezier.End.X, segment.LeftBezier.End.Y);			
			
			// A] - an "arc cap"
			var center: Vector2 = segment.RightBezier.End.pointInBetween(segment.LeftBezier.End);
			var startDirection: Vector2 = segment.RightBezier.End.clone().subtract(center);
			var endDirection: Vector2 = segment.LeftBezier.End.clone().subtract(center);
			this.context.arc(center.X, center.Y, center.distanceTo(segment.LeftBezier.End), Path.angle(startDirection), Path.angle(endDirection), false);
						
			// B] - line cap	
			// this.context.lineTo(segment.RightBezier.End.X, segment.RightBezier.End.Y);
			
			// right curve
			this.context.bezierCurveTo(segment.RightBezier.EndCP.X, segment.RightBezier.EndCP.Y, segment.RightBezier.StartCP.X, segment.RightBezier.StartCP.Y, segment.RightBezier.Start.X, segment.RightBezier.Start.Y);
											
		}
		
		/**
		 * Fill all drawn segments
		 */
		public Draw(): void {			
			this.context.closePath();		
			this.context.fill();	
			this.context.beginPath();			
		}
	}	
}