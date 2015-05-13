/// <reference path="../Helpers/State" />
/// <reference path="ICursor" />
/// <reference path="../Helpers/VideoTimer" />

import CursorState = Helpers.CursorState;
import Timer = Helpers.VideoTimer;

module VideoData {	
	
	/**
	 * Mouse input detection and processing. 
	 */
	export class Mouse {
				
		/** Is video recording running? */
		private isRunning: boolean;		
		
		/** Left mouse button state */
		private isMouseDown: boolean;
		
		/** Last known cursor position */
		protected cursor: ICursor;
		
		/** Last known cursor position */
		public getCursor() : ICursor { return this.cursor; }
		
		/** (High resolution) timer */
		private timer: Timer;
				
		constructor(protected board: HTMLElement) {				
			// board events						
			this.board.onmousemove = this.onMouseMove;
			this.board.onmousedown = this.onMouseDown;
			this.board.onmouseup = this.onMouseUp;
			this.board.onmouseleave = this.onMouseUp; // release the mouse also when the user tries to draw outside of the "board"
			document.onblur = this.onLooseFocus; // mouse up can't be detected when window (tab) is not focused - the app behaviour would be weird
			
			// video events			
			VideoEvents.on(VideoEventType.Start, this.Start);
			VideoEvents.on(VideoEventType.Start, this.Start);
			VideoEvents.on(VideoEventType.Pause, this.Pause);
			VideoEvents.on(VideoEventType.Stop, this.Pause);
			
			// init the timer - a high resolution timer, if possible
			this.timer = new Timer(); 
		}
		
		/**
		 * Start capturing mouse movement.
		 */
		private Start() : void {
			this.isRunning = true;
			this.timer.Reset();
		}
		
		/**
		 * Pause mouse movement caputring.
		 */
		private Pause() : void {
			this.isRunning = false;
		}
		
		/**
		 * Mouse pressure is either 1 (mouse button is down) or 0 (mouse button is up).
		 */
		protected GetPressure() : number {
			return this.isMouseDown === true ? 1 : 0; 
		}
	
		/**
		 * Trace mouse movement.
		 */
		private onMouseMove(e: MouseEvent) : any {
			if(this.isRunning) {		
				this.cursor = this.getCursorPosition(e);
				this.ReportAction();
			}
		}
	
		/**
		 * Start drawing lines.
		 */
		private onMouseDown(e: MouseEvent) : any {
			if(this.isRunning) {		
				this.isMouseDown = true;
				this.cursor = this.getCursorPosition(e);
				this.ReportAction();
			}
		}
	
		/**
		 * Stop drawing lines.
		 */
		private onMouseUp(e: MouseEvent) : any {
			if(this.isRunning) {
				this.isMouseDown = false;
				this.cursor = this.getCursorPosition(e);
				this.ReportAction();
			}
		}
		
		/**
		 * Force stop drawing lines.
		 */
		private onLooseFocus(e: FocusEvent) : any {
			this.isMouseDown = false;
		}
		
		/**
		 * Extract the information about cursor position relative to the board.
		 */
		protected getCursorPosition(e: MouseEvent) : ICursor {
			if (e.pageX == undefined || e.pageY == undefined) {
				console.log("Wrong 'correctMouseCoords' parameter. Event data required.");
			}
	
			return <ICursor> {
				x: e.pageX,
				y: e.pageY
			};
		}
		
		/**
		 * Report cursor movement
		 */
		private ReportAction() {					
			var state: State = new CursorState(this.cursor.x, this.cursor.y, this.GetPressure(), this.timer.CurrentTime());
			VideoEvents.trigger(VideoEventType.CursorState, state);
		}
	}
}