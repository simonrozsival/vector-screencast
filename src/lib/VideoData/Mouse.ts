
import VideoEvents, { VideoEventType } from '../Helpers/VideoEvents';
import PointingDevice, { PointingDeviceEvent } from './PointingDevice';
import VideoTimer from '../Helpers/VideoTimer';

//namespace VectorScreencast.VideoData {

	/**
	* Mouse input detection and processing. 
	*/
	export default class Mouse extends PointingDevice {
								
		constructor(events: VideoEvents, board: HTMLElement, timer: VideoTimer) {
			super(events, board, timer);
			// board events						
			this.board.onmousemove = 	(e) => this.onMouseMove(e);
			this.board.onmousedown =	(e) => this.onMouseDown(e);
			this.board.onmouseup = 		(e) => this.onMouseUp(e);
			this.board.onmouseleave = 	(e) => this.onMouseLeave(e); // release the mouse also when the user tries to draw outside of the "board"
			this.board.onmouseenter = 	(e)	=> this.onMouseEnter(e);
			this.board.onmouseover = 	(e)	=> this.onMouseOver(e); // maybe start a new line, if the button is pressed
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
			* Trace mouse movement.
			*/
		protected onMouseMove(e: PointingDeviceEvent) : any {			
			this.onMove(e);
		}
	
		/**
			* Start drawing lines.
			*/
		protected onMouseDown(e: PointingDeviceEvent) : any {
			this.onDown(e);
		}
	
		/**
			* Stop drawing lines.
			*/
		protected onMouseUp(e: PointingDeviceEvent) : any {
			this.onUp(e);
		}
		
		/**
			* Stop drawing lines.
			*/
		protected onMouseLeave(e: PointingDeviceEvent) : any {
			this.onLeave(e);
		}
		
		/**
			* Make sure the status of mouse button is consistent.
			*/
		protected onMouseEnter(e: MouseEvent) : any {
			if(e.buttons === 0) {
				this.isDown = false; // check mouse down status
			}
		}
				
		/**
			* Mark down that the cursor is hovering over the canvas.
			*/
		protected onMouseOver(e: PointingDeviceEvent) : any {
			this.isInside = true;
		}		
	}
	
//}