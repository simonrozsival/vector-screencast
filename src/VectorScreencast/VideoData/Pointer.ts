/// <reference path="../VectorScreencast" />

module VectorScreencast.VideoData {	

	import VideoEvents = Helpers.VideoEvents;
	import VideoEventType = Helpers.VideoEventType;
	import CursorState = Helpers.CursorState;
	import Timer = Helpers.VideoTimer;

	
	/**
	 * Mouse input detection and processing. 
	 */
	export class PointerEventsAPI extends PointingDevice {
						
		private currentEvent: PointerEvent; 
						
		constructor(board: HTMLElement) {
			super(board);
							
			// board events						
			this.board.addEventListener("pointermove",  	(e) => this.onPointerMove(e));
			this.board.addEventListener("pointerdown", 		(e) => this.onPointerDown(e));
			this.board.addEventListener("pointerup",  		(e) => this.onPointerUp(e));
			this.board.addEventListener("pointerleave",  	(e) => this.onPointerLeave(e)); // release the mouse also when the user tries to draw outside of the "board"
			this.board.addEventListener("pointerenter",  	(e)	=> this.onPointerLeave(e));
			this.board.addEventListener("pointerover",  	(e)	=> this.onPointerOver(e)); // maybe start a new line, if the button is pressed
			this.currentEvent = null;
			this.isDown = false;
		}
		
		/**
		 * Return pressure of the mouse, touch or pen.
		 */
		public GetPressure(): number {
			if(this.isDown === false || this.currentEvent === null) {
					return 0; // no envent, no pressure
			}

			// if(this.currentEvent.pointerType === "mouse"
			// 	|| this.currentEvent.pointerType === "touch") {
			// 		return 1; // button is pressed or touchscreen touched - maximum presure
			// }

			return this.currentEvent.pressure; // this device knows, what is current pressure
		}
		
		/**
		 * Filter all clicks on buttons and other possible UI controls
		 */
		public InitControlsAvoiding(): void {			
			var controls: NodeList = document.getElementsByClassName("ui-control");
			for (var i = 0; i < controls.length; i++) {
				var element = <HTMLElement> controls[i];
				element.onpointerover = (e: PointerEvent) => this.isHoveringOverUIControl = true;
				element.onpointerout = (e: PointerEvent) => this.isHoveringOverUIControl = false; 
			}
		}
	
		/**
		 * Trace mouse movement.
		 */
		protected onPointerMove(e: PointerEvent) : any {
			this.onMove(e);
			this.currentEvent = e;
		}
	
		/**
		 * Start drawing lines.
		 */
		protected onPointerDown(e: PointerEvent) : any {
			this.onDown(e);
			this.currentEvent = e;
		}
	
		/**
		 * Stop drawing lines.
		 */
		protected onPointerUp(e: PointerEvent) : any {
			this.onUp(e);
			this.currentEvent = e;
		}
		
		/**
		 * Stop drawing lines.
		 */
		protected onPointerLeave(e: PointerEvent) : any {
			this.onLeave(e);
			this.currentEvent = e;
		}
		
		/**
		 * Make sure the status of mouse button is consistent.
		 */
		protected onPointerEnter(e: PointerEvent) : any {
			if(e.buttons === 0) {
				this.isDown = false; // check mouse down status
			}
			this.currentEvent = e;
		}
				
		/**
		 * Mark down that the cursor is hovering over the canvas.
		 */
		protected onPointerOver(e: PointerEvent) : any {
			this.isInside = true;
			this.currentEvent = e;
		}		
	}
}