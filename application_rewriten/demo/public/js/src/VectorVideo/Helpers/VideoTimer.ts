
module Helpers {

	/**
	 * Common interface for my intended usage of Date and Performance.
	 */
	interface IMsTimer {
		/**
		 * Return current time ellapsed from some fixed point in the past in milliseconds.
		 */
		now(): number;
	}
	
	/**
	* (High resolution) timer.
	*/
	export class VideoTimer {
		
		/** The instance of the best available timer by the browser. */
		private clock: IMsTimer;
		
		/** The time of the last reset */
		private startTime: number;
		public get StartTime() : number { return this.startTime; }
		
		private paused: boolean;
		
		/**
		 * Get time ellapsed since the last clock reset
		 */
		public CurrentTime() : number {
			return !this.paused ? this.clock.now() - this.startTime : this.pauseTime;
		}
		
		/**
		 * Set the timer to a specific point (in milliseconds)
		 */
		public SetTime(milliseconds: number) : void {
			this.Reset();
			this.startTime += milliseconds;
		}
				
		/** Current time of the moment when the timer was paused. */
		private pauseTime: number = 0;	
			
		/**
		 * Pause the timer
		 */
		public Pause() : void {
			this.pauseTime = this.CurrentTime();
			this.paused = true;
		}
		
		/**
		 * Unpause the timer
		 */
		public Resume() : void {
			this.paused = false;
			this.SetTime(-this.pauseTime);
		}
		
		/**
		 * Start counting from zero
		 */
		public Reset() : void {
			this.startTime = this.clock.now();
		}
		
		/**
		 * Creates a timer and resets it.
		 */
		constructor() {
			/** @type {Date|object} */
			if(!window.performance) {
				this.clock = Date;
			} else {
				this.clock = window.performance; // High resolution timer
			}
			
			this.paused = false;
			this.Reset();
		}
	}
}