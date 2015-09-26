
import VideoEvents from '../Helpers/VideoEvents';
import VideoTimer from '../Helpers/VideoTimer';
import Mouse from './Mouse'; 	
	
//namespace VectorScreencast.VideoData {
	
	/**
	 * Touch Events API implementation
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
	 */
	export default class TouchEventsAPI extends Mouse {
				
		constructor(events: VideoEvents, container: HTMLElement, protected canvas: HTMLElement, timer: VideoTimer) {
			super(events, container, timer);
			
			canvas.addEventListener("touchstart", 	(ev: TouchEvent) => this.TouchStart(ev));
			canvas.addEventListener("touchend", 	(ev: TouchEvent) => this.TouchEnd(ev));
			canvas.addEventListener("touchcancel", 	(ev: TouchEvent) => this.TouchEnd(ev));
			canvas.addEventListener("touchleave", 	(ev: TouchEvent) => this.TouchLeave(ev));
			canvas.addEventListener("touchmove", 	(ev: TouchEvent) => this.TouchMove(ev));
		}
		
		/** current touch identifier */
		private currentTouch: number;
		
		/**
		 * Some finger touches the screen.
		 * @param	event	Touch event information.
		 */
		private TouchStart(event: TouchEvent): void {					
			event.preventDefault();
			var touches: TouchList = event.changedTouches;
			
			// select the first touch and follow only this one touch			
			var touch = touches[0];
			this.currentTouch = touch.identifier;
			this.isInside = true;
			this.isHoveringOverUIControl = false;
			
			this.onMouseDown(touch);
		}
		
		/**
		 * Some touch left the screen.
		 * @param	event	Touch event information.
		 */
		protected TouchLeave(event: TouchEvent): void {
			event.preventDefault();
			var touch = this.filterTouch(event.changedTouches);
			if(touch === null) {
				return; // current touch hasn't left the board
			}
			
			this.onMouseLeave(touch);
		}
		
		/**
		 * Some finger was lifted.
		 * @param	event	Touch event information.
		 */
		protected TouchEnd(event: TouchEvent): void {
			var touch = this.filterTouch(event.changedTouches);
			if(touch === null) {
				return;
			}
			this.onMouseUp(touch);
						
			// forget about the one concrete touch
			this.currentTouch = null;			
		}
		
		/**
		 * Change of touch position.
		 * @param	event	Touch event information.
		 */
		protected TouchMove(event: TouchEvent): void {
			event.preventDefault();	
				
			var touch = this.filterTouch(event.changedTouches);
			if(touch === null) {
				return;
			}
						
			this.onMouseMove(touch);
		}
		
		/**
		 * Find the current touch by it's identifier
		 */
		private filterTouch(touchList: TouchList): Touch {
			for (var i = 0; i < touchList.length; i++) {
				var element = touchList[i];
				if(element.identifier === this.currentTouch) {
					return element;
				}				
			}
			
			return null;
		}
		
	}
	
//}