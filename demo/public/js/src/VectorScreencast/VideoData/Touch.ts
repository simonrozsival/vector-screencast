/// <reference path="Mouse.ts" />
/// <reference path="../Helpers/HTML.ts" />

module VideoData {
		
	/**
	 * Touch Events API
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
	 */
	export class TouchEventsAPI extends PointingDevice {
				
		constructor(board: HTMLElement) {
			super(board); // obligatory parent constructor call
			
			board.addEventListener("touchstart", 	(ev: TouchEvent) => this.TouchStart(ev));
			board.addEventListener("touchend", 		(ev: TouchEvent) => this.TouchEnd(ev));
			board.addEventListener("touchcancel", 	(ev: TouchEvent) => this.TouchEnd(ev));
			board.addEventListener("touchleave", 	(ev: TouchEvent) => this.TouchLeave(ev));
			board.addEventListener("touchmove", 	(ev: TouchEvent) => this.TouchMove(ev));
		}
		
		private currentTouch: number;
		
		private TouchStart(event: TouchEvent): void {			
			event.preventDefault();
			var touches: TouchList = event.changedTouches;
			
			// select the first touch and follow only this one touch			
			var touch = touches[0];
			this.currentTouch = touch.identifier;
			
			this.onDown(touch);
		}
		
		protected TouchLeave(event: TouchEvent): void {
			event.preventDefault();
			var touch = this.filterTouch(event.changedTouches);
			if(touch === null) {
				return; // current touch hasn't left the board
			}
			
			this.onLeave(touch);
		}
		
		protected TouchEnd(event: TouchEvent): void {
			event.preventDefault();			
			
			var touch = this.filterTouch(event.changedTouches);
			if(touch === null) {
				return;
			}
			this.onUp(touch);
						
			// forget about the one concrete touch
			this.currentTouch = null;			
		}
		
		protected TouchMove(event: TouchEvent): void {
			event.preventDefault();			
				
			var touch = this.filterTouch(event.changedTouches);
			if(touch === null) {
				return;
			}
			
			this.onMove(touch);
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
	
}