/// <reference path="Path" />
/// <reference path="../Helpers/VideoTimer" />

module Drawing {
	
	import Vector2 = Helpers.Vector2;
	import VideoTimer = Helpers.VideoTimer;
	
	/**
	 * Set of brush properties that have effect on the outcome
	 */
	class BrushInstance {
		public get Mass(): number { return this.mass; }
		public get Friction(): number { return this.friction; }
		public get Size(): number { return this.size; }
		constructor(private mass: number, private friction: number, private size: number) { }
	}
	
	/**
	 * Current cursor
	 * - implementation of the "filter" in the original algorithm
	 */
	class Cursor {
				
		/** Current cursor position */
		private position: Vector2;
		
		/** Last drawn position */
		private startPosition: Vector2;
		
		/** Current velicoity of the brush */
		private velocity: Vector2;
		
		/** Current acceleration of the tip of the brush */
		private acceleration: Vector2;
		
		/** Current rotation of the cursor */
		private angle: Vector2;
		
		/** Physical properties of the current brush. */
		private brush: BrushInstance;
		
		/** Mouse movement threshold - ingore too subtle mouse movements */
		private static threshold: number = 1;
		
		/** First segment must be treated differently */
		private firstSegment: boolean;
		
		/** Information needed for interpolating pressure */
		private previousPosition: Vector2;
		private previousPressure: number;
		private mousePosition: Vector2;
		
		constructor(private calculateSpeed: boolean, private timer: VideoTimer) { }
		
		/**
		 * @param	{Vector2}		position	The starting point of the cursor.
		 * @param	{BrushInstance} brush  		Physical properties of the brush.
		 */			
		public Reset(position: Vector2, brush: BrushInstance): void {
			this.brush = brush;
			this.position = position;
			this.startPosition = position;
			this.previousPosition = position;
			this.previousPressure = -1; // negative means, there is no pressure information yet
			this.mousePosition = position;
			this.acceleration = new Vector2(0, 0);
			this.velocity = new Vector2(0, 0);
			this.firstSegment = true;
		}
			
		/**
		 * Apply force created by mouse movement
		 * @param 	{Vector2}	mouse 			Mouse position
		 * @param	{number}	elapsedFrames	The number of frames elapsed since last movement
		 */
		public Apply(mouse: Vector2, elapsedFrames: number): boolean {			
			// calculate the force
			var force: Vector2 = mouse.subtract(this.position);
			if(force.getSizeSq() < Cursor.threshold) {
				return false; // too subtle movement
			}
			
			// calculate acceleration and velocity
			this.acceleration = force.scale(1/this.brush.Mass); // derived from the definition of force: (->)a = (->)f / m
			this.velocity = this.velocity.add(this.acceleration);
			if(this.velocity.getSizeSq() < Cursor.threshold) {
				return false; // nearly no movement (a "heavy" brush)
			}
			
		 	// destroy unnecessary references
		 	this.mousePosition = mouse;
			mouse = null;
			force = null;	
			this.acceleration = null;
			
			// calculate the angle of the mouse
			this.angle = this.velocity.getNormal();
			
			// apply the drag of the digital drawing tool
			this.velocity = this.velocity.scale(1 - this.brush.Friction); // more friction means less movement
			
			// update position
			this.position = this.position.add(this.velocity.scale(elapsedFrames));	
						
			return true; // there is something to render
		}
		
		/**
		 * Draw next segment
		 */
		public Draw(path: Path, pressure: number): void {
			// the quicker the brush moves, the smaller print it leaves 
			var relativeSpeed: number = this.calculateSpeed === true ? this.velocity.getSize() / (this.brush.Size * this.brush.Size) : 0; // set to 0 if no speed correction is used
			var width: number = this.getRadius(pressure, relativeSpeed);
			var delta: Vector2 = this.angle.scale(width);
			if(this.firstSegment) {
				path.InitPath(this.startPosition.add(delta), this.startPosition.subtract(delta), this.timer.CurrentTime());
				this.firstSegment = false;
			}
			
			path.ExtendPath(this.position.add(delta), this.position.subtract(delta), this.timer.CurrentTime());
			path.Draw();
		}
		
		public StartPath(path: Path, pt: Vector2, pressure: number): void {
			path.StartPath(pt, this.getRadius(pressure, 0));
		} 
		
		/**
		 * Calculate current radius from pressure and speed of the cursor.
		 */
		private getRadius(pressure: number, speed: number): number {
			// I must interpolate the pressure between the last point and current pressure in the 
			if(this.previousPressure < 0) this.previousPressure = pressure;
			var interpolatedPressure: number = this.interpolatePressure(pressure);
			var radius: number = this.speedFactor(speed) * this.brush.Size * interpolatedPressure / 2;
			
			// save for next time
			this.previousPosition = this.position;
			this.previousPressure = interpolatedPressure;
			return radius;
		}
		
		/**
		 * Get current pressure - achieve smooth pressure gradients
		 */
		private interpolatePressure(mousePressure: number): number {
			var d1: number = this.position.distanceTo(this.previousPosition);
			var d2: number = this.position.distanceTo(this.mousePosition);
			if(d1 === 0 && d2 === 0) {
				return mousePressure; // I don't have to interpolate
			}
									
			return (d1/(d1 + d2))*(mousePressure - this.previousPressure) + this.previousPressure;
		}
		
		/**
		 * Determine the effect of the speed on thickness of the path
		 */
		private speedFactor(speed: number) : number {
			return Math.max(1 - speed, 0.4); 
		}
		
	}
	
	/**
	 * This class is an implementation of the algorithm originally created
	 * in 1989 by Paul Haeberli - see http://www.sgi.com/grafica/dyna/index.html
	 * The algorithm is based on physical properties of an object which is guided
	 * by mouse movement.
	 */	
	export class DynaDraw {
		
		/** Currently drawn path */
		private path: Path;
		
		/** The cursor */
		private cursor: Cursor;
		
		/** Next cursor position */
		private position: Vector2;
		
		/** Next cursor pressure */
		private pressure: number;
		
		/** Physical constants */
		private minMass: number = 5;
		private maxMass: number = 20;
		private minFriction: number = 0.3; // 0.4 is experimentaly derived constant, that gives nice results for all weights
		private maxFriction: number = 0.45;		 
		
		private interpolateMass(brushSize: number): number {
			return this.minMass + (this.maxMass - this.minMass)*(brushSize - this.minBrushSize)/(this.maxBrushSize - this.minBrushSize);
		}
		
		private interpolateFriction(brushSize: number): number {
			return this.maxFriction - (this.maxFriction - this.minFriction)*(brushSize - this.minBrushSize)/(this.maxBrushSize - this.minBrushSize);
		}
				
		/**
		 * Each brush has different properties - larger brushes are heavier and have greater drag
		 */
		private brushes: { [size: number]: BrushInstance }  = {};
		private GetBrush(brushSize: number): BrushInstance {
			if(!this.brushes[brushSize]) {
				//this.brushes[brushSize]	= new BrushInstance(this.interpolateMass(brushSize), this.interpolateFriction(brushSize), brushSize); 
				this.brushes[brushSize]	= new BrushInstance(this.minMass, this.maxFriction, brushSize);
			}			
			return this.brushes[brushSize];
		}
		
		/**
		 * Initialise new instance of DynaDraw
		 */
		constructor(private slowSimulation: boolean, private minBrushSize: number, private maxBrushSize: number, timer: VideoTimer) {
			this.cursor = new Cursor(slowSimulation, timer); // when slow simulation is on, use width adjustments when moving fast
			if(slowSimulation === true) {
				requestAnimationFrame((time: number) => {
					this.lastAnimationTime = time;
					this.Tick(time)
				});
			} else {
				requestAnimationFrame(() => this.TickWhile());				
			}
		}
		
		/**
		 * Start drawing a new path with a given color and brush size.
		 * @param	{Vector2}		position	Cursor state information
		 * @param	{number}		pressure	Cursor pressure
		 * @param	{string} 		color		CSS value of the color
		 * @param	{number} 		brushSize	The size of the selected brush
		 */
		public StartPath(position: Vector2, pressure: number, brushSize: number, path: Path) {
			this.cursor.Reset(position, this.GetBrush(brushSize));
			this.position = position;
			this.pressure = pressure;
			this.path = path;
			this.cursor.StartPath(this.path, position, pressure);
		}
		
		/**
		 * Animate cursor movement
		 * @param	{Vector2}		position	Cursor state information
		 * @param	{number}		pressure	Cursor pressure
		 */
		public NextPoint(position: Vector2, pressure: number) {
			this.position = position;
			this.pressure = pressure;
		}
		
		/**
		 * Stop drawing the line when the mouse or digital pen is released.
		 * @param	{Vector2}		position	Cursor state information
		 * @param	{number}		pressure	Cursor pressure
		 */
		public EndPath(position: Vector2, pressure: number) {
			this.position = position;
		}
				
		/**
		 * Simulate brush's movement frame by frame as long as it keeps moving.
		 * This approach will be more responsive (the path will always reach the cursor before it moves in a different direction),
		 * but the resulting curves aren't as nice and smooth as with the regular simulation.
		 */
		private TickWhile() {
			if(!!this.position) {				
				while(this.cursor.Apply(this.position, 1)) { // simulate one frame					
					this.cursor.Draw(this.path, this.pressure);
				}
				
				this.position = null; // skip Apply(..) that will return false next time
			}
			
			// do the next tick
			requestAnimationFrame((time: number) => this.TickWhile()); // ~ 60 FPS
		}
				
		/** Animation timing values */
		private lastAnimationTime: number;
		private oneFrame: number = 1000 / 60; // 60 Hz in milliseconds
		
		private Tick(time: number) {
			if(!!this.position) {
				if(this.cursor.Apply(this.position, (time - this.lastAnimationTime) / this.oneFrame)) {
					this.cursor.Draw(this.path, this.pressure);
				} else {
					this.position = null; // skip Apply(..) that will return false next time	
				}
			}
			
			// do the next tick
			this.lastAnimationTime = time;
			requestAnimationFrame((time: number) => this.Tick(time)); // ~ 60 FPS
			//setTimeout(() => this.Tick(time + 1), 1); // ~ 1000 FPS
			//setTimeout(() => this.Tick(time + 30), 30); // ~ 30 FPS
			//setTimeout(() => this.Tick(time + 200), 200); // ~ 30 FPS
		}
	}	
}