/// <reference path="PointingDevice" />

import VideoEvents from '../Helpers/VideoEvents';
import { CursorState } from '../Helpers/State';
import TouchEventsAPI from './Touch';
import VideoTimer from '../Helpers/VideoTimer';

//namespace VectorScreencast.VideoData {
	
	
	interface WebkitMouseEvent extends MouseEvent {
		webkitForce: number;
	}
	
	/**
	 * Mouse input detection and processing. 
	 */
	export default class AppleForceTouch extends TouchEventsAPI {
			
		private useAppleForceTouchAPI: boolean;
				
		/** This property *might* contain information about pressure level, if the device  */
		private forceLevel: number;
						
		constructor(events: VideoEvents, board: HTMLElement, canvas: HTMLElement, timer: VideoTimer) {
			super(events, board, canvas, timer);			
			// board events						
			this.board.onmousemove = (e: MouseEvent) => this.checkForce((<WebkitMouseEvent>e).webkitForce); // only bind the event if I am sure there is the force touch API
			this.forceLevel = 0; 
		}
		
		static isAvailable(): boolean {
			return "WEBKIT_FORCE_AT_FORCE_MOUSE_DOWN" in MouseEvent;
		}
			
		public GetPressure(): number {
			return this.forceLevel; 
		}
		
		/**
		 * Trace mouse movement and check pressure level.
		 */
		private checkForce(webkitForce: number) : any {
			//this.forceLevel = Math.min(1, webkitForce / MouseEvent["WEBKIT_FORCE_AT_FORCE_MOUSE_DOWN"]); // Apple iOS and OSX - force touch
			this.forceLevel = Math.min(1, webkitForce); 
		}
	}
//}