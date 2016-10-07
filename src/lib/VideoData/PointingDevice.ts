import VideoEvents, { VideoEventType } from '../Helpers/VideoEvents';
import VideoTimer from '../Helpers/VideoTimer';
import { State, CursorState } from '../Helpers/State';
import Cursor from './Cursor';

//namespace VectorScreencast.VideoData {

	/**
	 * Minimum information needed to determine cursor movement across different events - Mouse/Touch/Pointer... 
	 */
	export interface PointingDeviceEvent {
		/** Relative X position of the mouse to the top left corner of the target element */
		clientX: number;
		/** Relative Y position of the mouse to the top left corner of the target element */
		clientY: number;
	}
	
	/**
	 * Any pointing device input detection and processing. 
	 */
	export default class PointingDevice {
						
		/** Left mouse button state */
		protected isDown: boolean;
		
		/** Is the cursor inside the canvas area right now? */
		protected isInside: boolean;
		
		/** Filter out clicks on UI controls */
		protected isHoveringOverUIControl: boolean;
		
		/** Last known cursor position */
		protected cursor: Cursor;
		
		/** Last known cursor position */
		public getCursor() : Cursor { return this.cursor; }
					
		/**
		 * Listen to events
		 * @param	events	Event aggregator
		 * @param	board	HTML element of the board
		 * @param	timer	(High resolution) timer
		 */
		constructor(protected events: VideoEvents, protected board: HTMLElement, protected timer: VideoTimer) {			
			this.isHoveringOverUIControl = false; 
		}
		
		/**
		 * Filter all clicks on buttons and other possible UI controls
		 */
		public InitControlsAvoiding(): void {			
			var controls = <Array<HTMLElement>><any>document.getElementsByClassName("ui-control-panel"); // typescript hack :-)
			for (var i = 0; i < controls.length; i++) {
				var element = controls[i];
				element.onmouseover = (e: MouseEvent) => this.isHoveringOverUIControl = true;
				element.onmouseout = (e: MouseEvent) => this.isHoveringOverUIControl = false; 
			}
		}
		
		/**
		 * Mouse pressure is either 1 (mouse button is down) or 0 (mouse button is up) while the mouse is inside the area of canvas.
		 * @return	Current device pressure in percent
		 */
		protected GetPressure() : number {
			return (this.isDown === true && this.isInside === true) ? 1 : 0;
		}
	
		/**
		 * Trace mouse movement.
		 * @param	e	Cursor position information
		 */
		protected onMove(e: PointingDeviceEvent) : any {
			this.cursor = this.getCursorPosition(e);
			this.ReportAction();
		}
	
		/**
		 * Start drawing lines.
		 * @param	e	Cursor position information
		 */
		protected onDown(e: PointingDeviceEvent) : any {
			if(this.isHoveringOverUIControl === false) {		
				this.isDown = true;
				this.cursor = this.getCursorPosition(e);
				this.ReportAction();
			}
		}
	
		/**
		 * Stop drawing lines.
		 * @param	e	Cursor position information
		 */
		protected onUp(e: PointingDeviceEvent) : any {
			this.isDown = false;
			this.cursor = this.getCursorPosition(e);
			this.ReportAction();
		}
		
		/**
		 * Stop drawing lines.
		 * @param	e	Cursor position information
		 */
		protected onLeave(e: PointingDeviceEvent) : any {
			if(this.GetPressure() > 0) {					
				this.onMove(e); // draw one more segment
				this.isDown = false;
				this.onMove(e); // discontinue the line
				this.isDown = true; // back to current state
			}
			
			this.isInside = false;
		}
				
		/**
		 * Mark down that the cursor is hovering over the canvas.
		 * @param	e	Cursor position information
		 */
		protected onOver(e: PointingDeviceEvent) : any {
			this.isInside = true;
		}
		
		/**
		 * Force stop drawing lines.
		 * @param	e	Event information
		 */
		private onLooseFocus(e: FocusEvent) : any {
			this.isInside = false;
			this.isDown = false;
		}
		
		/**
		 * Extract the information about cursor position relative to the board.
		 */
		protected getCursorPosition(e: PointingDeviceEvent) : Cursor {
			if (e.clientX == undefined || e.clientY == undefined) {
				console.log("Wrong 'getCursorPosition' parameter. Event data required.");
			}
	
			const rect = this.board.getBoundingClientRect();
			return <Cursor> {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top
			};
		}
		
		/**
		 * Report cursor movement
		 */
		private ReportAction() {					
			var state: State = new CursorState(this.timer.CurrentTime(), this.cursor.x, this.cursor.y, this.GetPressure());
			this.events.trigger(VideoEventType.CursorState, state);
		}
	}
	
//}