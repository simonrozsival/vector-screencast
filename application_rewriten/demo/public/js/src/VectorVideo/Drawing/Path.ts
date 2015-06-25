/// <reference path="../Helpers/Vector" />
/// <reference path="../Helpers/SVG" />


module Drawing {
	
	import Vector2 = Helpers.Vector2;
	import SVG = Helpers.SVG;
	import BezierHelper = Helpers.BezierCurveSegment;
	
	export class Path {		
				
		/** Current path point */
		private iterator: number;
				
		/** List of all points that were drawn */
		protected points: Array<{ left: Vector2, right: Vector2}>;		
		
		/** The last point that was drawn */
		protected get LastPoint(): { left: Vector2, right: Vector2} {
			return this.points[this.iterator];
		}
		
		/** The last point that was drawn */
		protected get LastButOnePoint(): { left: Vector2, right: Vector2} {
			return this.points[Math.max(0, this.iterator - 1)];
		}
		
		/** The last point that was drawn */
		protected get LastButTwoPoint(): { left: Vector2, right: Vector2} {
			return this.points[Math.max(0, this.iterator - 2)];
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
			
			this.points = [];
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
		public InitPath(right: Vector2, left: Vector2): void {
			this.points.push({
				left: left,
				right: right
			});
			this.iterator = 0;			
		}
		
		/**
		 * Draw another segment of current path.
		 * @param	{Vector2}	right	"Right" point of the segment.
		 * @param	{Vector2}	left	"Left"	point of the segment.
		 */
		public ExtendPath(right: Vector2, left: Vector2): void {
			// draw the segment
			this.DrawSegment(right, left);
			
			// and push it to the list
			this.points.push({
				left: left,
				right: right
			});
			this.iterator++;
		}
				
		private DrawSegment(right: Vector2, left: Vector2): void {
			this.CalculateAndDrawCurvedSegment(right, left);
			//this.DrawQuarilateralSegment(this.LastPoint.right, this.LastPoint.left, right, left);
		}
		
		private CalculateAndDrawCurvedSegment(right: Vector2, left: Vector2): void {
			var leftBezier: Helpers.BezierCurveSegment = Helpers.Spline.catmullRomToBezier(this.LastButTwoPoint.left, this.LastButOnePoint.left, this.LastPoint.left, left);
			var rightBezier: Helpers.BezierCurveSegment = Helpers.Spline.catmullRomToBezier(this.LastButTwoPoint.right, this.LastButOnePoint.right, this.LastPoint.right, right);
			this.DrawCurvedSegment(leftBezier, rightBezier);
		}		
		
		/**
		 * 
		 */
		protected DrawCurvedSegment(left: Helpers.BezierCurveSegment, right: Helpers.BezierCurveSegment): void {
			throw new Error("Not implemented");
		}		
		
		/**
		 * 
		 */
		protected DrawQuadrilateralSegment(pr: Vector2, pl: Vector2, r: Vector2, l: Vector2): void {
			throw new Error("Not implemented");
		}		
		
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
		
		public Redraw(): void {
			this.iterator = 0;
			this.DrawStartDot(this.startPosition, this.startRadius);
			while (this.iterator < this.points.length) {
				this.DrawSegment(this.LastPoint.right, this.LastPoint.left);			
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
		protected DrawCurvedSegment(left: Helpers.BezierCurveSegment, right: Helpers.BezierCurveSegment): void {
			this.right += SVG.CurveToString(right.StartCP, right.EndCP, right.End);
			this.left = SVG.CurveToString(left.EndCP, left.StartCP, left.Start) + " " + this.left;
			
			// A] - a simple line at the end of the line 
			// this.cap = SVG.LineToString(left);
			
			// B] - an "arc cap"
			var center: Vector2 = right.End.add(left.End).scale(0.5);
			var startDirection: Vector2 = right.End.subtract(center);
			var endDirection: Vector2 = left.End.subtract(center);
			this.cap = SVG.ArcString(left.End, center.distanceTo(left.End), this.angle(startDirection));				
		}		
		
		/**
		 * Extend the SVG path with a quadrilateral segment
		 */		
		protected DrawQuadrilateralSegment(pr: Vector2, pl: Vector2, r: Vector2, l: Vector2): void {			
			this.right += SVG.LineToString(r);
			this.left = SVG.LineToString(pl) + " " + this.left;
			
			// A] - a simple line at the end of the line 
			// this.cap = SVG.LineToString(left);
			
			// B] - an "arc cap"
			var center: Vector2 = r.add(l).scale(0.5);
			var startDirection: Vector2 = r.subtract(center);
			var endDirection: Vector2 = l.subtract(center);
			this.cap = SVG.ArcString(l, center.distanceTo(l), this.angle(startDirection));
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
		protected DrawQuarilateralSegment(pr: Vector2, pl: Vector2, r: Vector2, l: Vector2): void { 
			this.context.beginPath();
			this.context.moveTo(pr.X, pr.Y);
			this.context.lineTo(pl.X, pl.Y);			
			this.context.lineTo(l.X, l.Y);
			
			// an "arc cap"
			var center: Vector2 = r.add(l).scale(0.5);
			var startDirection: Vector2 = r.subtract(center);
			var endDirection: Vector2 = l.subtract(center);
			this.context.arc(center.X, center.Y, center.distanceTo(l), this.angle(startDirection), this.angle(endDirection), false);		
			//
			
			this.context.closePath();
			
			this.context.fillStyle = this.color;
			this.context.fill();
		}
		
		/**
		 * Draw a curved segment using bezier curves.
		 */
		protected DrawCurvedSegment(leftBezier: Helpers.BezierCurveSegment, rightBezier: Helpers.BezierCurveSegment): void {
			this.context.beginPath();
			this.context.moveTo(rightBezier.Start.X, rightBezier.Start.Y);	
			this.context.lineTo(leftBezier.Start.X, leftBezier.Start.Y);
						
			// left curve
			this.context.bezierCurveTo(leftBezier.StartCP.X, leftBezier.StartCP.Y, leftBezier.EndCP.X, leftBezier.EndCP.Y, leftBezier.End.X, leftBezier.End.Y);			
			
			// A] - an "arc cap"
			var center: Vector2 = rightBezier.End.add(leftBezier.End).scale(0.5);
			var startDirection: Vector2 = rightBezier.End.subtract(center);
			var endDirection: Vector2 = leftBezier.End.subtract(center);
			this.context.arc(center.X, center.Y, center.distanceTo(leftBezier.End), this.angle(startDirection), this.angle(endDirection), false);
			
			// B] - line cap	
			// this.context.lineTo(rightBezier.End.X, rightBezier.End.Y);
			
			// right curve
			this.context.bezierCurveTo(rightBezier.EndCP.X, rightBezier.EndCP.Y, rightBezier.StartCP.X, rightBezier.StartCP.Y, rightBezier.Start.X, rightBezier.Start.Y);			
			
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