/// <reference path="../Helpers/State" />
/// <reference path="ICursor" />
/// <reference path="../Helpers/VideoTimer" />
/// <reference path="../Helpers/VideoEvents" />

module VideoData {	

	import VideoEvents = Helpers.VideoEvents;
	import VideoEventType = Helpers.VideoEventType;
	import CursorState = Helpers.CursorState;
	import Timer = Helpers.VideoTimer;


	export interface PointingDeviceEvent {
		clientX: number;
		clientY: number;
	}
	
	/**
	 * Mouse input detection and processing. 
	 */
	export class PointingDevice {
				
		/** Is video recording running? */
		private isRunning: boolean;		
		
		/** Left mouse button state */
		protected isDown: boolean;
		
		/** Is the cursor inside the canvas area right now? */
		protected isInside: boolean;
		
		/** Filter out clicks on UI controls */
		protected isHoveringOverUIControl: boolean;
		
		/** Last known cursor position */
		protected cursor: ICursor;
		
		/** Last known cursor position */
		public getCursor() : ICursor { return this.cursor; }
		
		/** (High resolution) timer */
		private timer: Timer;
				
		constructor(protected board: HTMLElement) {
			// video events			
			VideoEvents.on(VideoEventType.Start, 	() => this.Start());
			VideoEvents.on(VideoEventType.Start, 	() => this.Start());
			VideoEvents.on(VideoEventType.Pause, 	() => this.Pause());
			VideoEvents.on(VideoEventType.Stop, 	() => this.Pause());
			
			// init the timer - a high resolution timer, if possible
			this.timer = new Timer();
			this.timer.Pause();
			
			this.isHoveringOverUIControl = false; 
		}
		
		/**
		 * Filter all clicks on buttons and other possible UI controls
		 */
		public InitControlsAvoiding(): void {			
			var controls: NodeList = document.getElementsByClassName("ui-control");
			for (var i = 0; i < controls.length; i++) {
				var element = <HTMLElement> controls[i];
				element.onmouseover = (e: MouseEvent) => this.isHoveringOverUIControl = true;
				element.onmouseout = (e: MouseEvent) => this.isHoveringOverUIControl = false; 
			}
		}
		
		/**
		 * Start capturing mouse movement.
		 */
		private Start() : void {
			this.isRunning = true;
			this.timer.Resume();
		}
		
		/**
		 * Pause mouse movement caputring.
		 */
		private Pause() : void {
			this.isRunning = false;
			this.timer.Pause();
		}
		
		/**
		 * Mouse pressure is either 1 (mouse button is down) or 0 (mouse button is up) while the mouse is inside the area of canvas.
		 */
		protected GetPressure() : number {
			return (this.isDown === true && this.isInside === true) ? 1 : 0;
		}
	
		/**
		 * Trace mouse movement.
		 */
		protected onMove(e: PointingDeviceEvent) : any {
			//if(this.isRunning) { // experiment: track mouse movement event when not recording, but don't record clicking		
				this.cursor = this.getCursorPosition(e);
				this.ReportAction();
			//}
		}
	
		/**
		 * Start drawing lines.
		 */
		protected onDown(e: PointingDeviceEvent) : any {
			if(/*this.isRunning
				&&*/ this.isHoveringOverUIControl === false) {		
				this.isDown = true;
				this.cursor = this.getCursorPosition(e);
				this.ReportAction();
			}
		}
	
		/**
		 * Stop drawing lines.
		 */
		protected onUp(e: PointingDeviceEvent) : any {
			//if(this.isRunning) {
				this.isDown = false;
				this.cursor = this.getCursorPosition(e);
				this.ReportAction();
			//}
		}
		
		/**
		 * Stop drawing lines.
		 */
		protected onLeave(e: PointingDeviceEvent) : any {
			if(/*this.isRunning
				&& */this.GetPressure() > 0) {
					
				this.onMove(e); // draw one more segment
				this.isDown = false;
				this.onMove(e); // discontinue the line
				this.isDown = true; // back to current state
			}
			this.isInside = false;
		}
				
		/**
		 * Mark down that the cursor is hovering over the canvas.
		 */
		protected onOver(e: PointingDeviceEvent) : any {
			this.isInside = true;
		}
		
		/**
		 * Force stop drawing lines.
		 */
		private onLooseFocus(e: FocusEvent) : any {
			this.isInside = false;
			this.isDown = false;
		}
		
		/**
		 * Extract the information about cursor position relative to the board.
		 */
		protected getCursorPosition(e: PointingDeviceEvent) : ICursor {
			if (e.clientX == undefined || e.clientY == undefined) {
				console.log("Wrong 'getCursorPosition' parameter. Event data required.");
			}
	
			return <ICursor> {
				x: e.clientX,
				y: e.clientY
			};
		}
		
		/**
		 * Report cursor movement
		 */
		private ReportAction() {					
			var state: State = new CursorState(this.timer.CurrentTime(), this.cursor.x, this.cursor.y, this.GetPressure());
			VideoEvents.trigger(VideoEventType.CursorState, state);
		}
	}
}