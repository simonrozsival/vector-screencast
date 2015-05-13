/// <references path="BasicElements" />
/// <references path="../Helpers/VideoEvents" />

module UI {
	
	export class TimeLine extends Panel {
		
		/** Length of the video in milliseconds */
		private length: number;		
		public set Length(length: number) { this.length = length; }
		
		/** Visual representation of the progress bar */
		private progresbar: IElement;
		
		constructor(id: string) {
			super("div", id);
			this.length = 0;
			
			// create progress bar
			var bar: SimpleElement = new SimpleElement("div");
			bar.GetHTML().classList.add("ui-progressbar");			
			this.progresbar = bar;
			this.AddChild(bar);
			
			// init progresbar with
			this.Sync(0);
			
			// change video position, when the bar is clicked
			this.GetHTML().onclick = this.OnClick;
			
			// @todo show preloaded content
		}
		
		/**
		 * Skip to given moment after user clicks on the timeline
		 */
		private OnClick(e: MouseEvent) : void {
			var time: number = (e.clientX - this.GetHTML().clientLeft) / this.GetHTML().clientWidth * this.length;
			this.SkipTo(time);  
		}
	
		/**
		 * Synchronize progress bar width with current time 
		 */
		public Sync(time: number) : void {
			this.progresbar.GetHTML().style.width = this.length > 0 ? `${time / this.length * 100}` : "O%";
		}
		
		/**
		 * @param	time	Time in milliseconds
		 */
		public SkipTo(time: number) : void {
			// triger an event...			
			VideoEvents.trigger(VideoEventType.JumpTo, time / this.length);
			
			// sync self
			this.Sync(time);			
		} 
		
	}
	
}