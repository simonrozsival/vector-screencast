import VideoEvents, { VideoEventType } from '../Helpers/VideoEvents';
import { IElement, SimpleElement, Panel, Div } from './BasicElements';
import { millisecondsToString } from '../Helpers/HelperFunctions';


//namespace VectorScreencast.UI {
	
	/**
	 * Video progress visualisation in the form of a progress bar.
	 */
	export default class TimeLine extends Panel {
		
		/** Length of the video in milliseconds */
		private length: number;		
		/** Set the actual length of the video in milliseconds */
		public set Length(length: number) { this.length = length; }
		
		/** Visual representation of the progress bar */
		private progresbar: IElement;
		/** Visual representation of the buffering bar */
		private bufferbar: IElement;
		/** Hovering helper */
		private arrow: IElement;
		
		constructor(id: string, protected events: VideoEvents) {
			super("div", id);
			this.length = 0; // must be changed later, when the metadata is loaded 
			this.GetHTML().classList.add("ui-progressbar");
			
			// create progress bar
			var bar: Panel = new Panel("div");
			bar.AddClass("ui-progress");			
			bar.AddChild(new Div().AddClass("ui-current-time"));
			this.progresbar = bar;
			this.AddChild(bar);
			bar = null;
			
			// create progress bar
			var buffer: SimpleElement = new Div();
			buffer.AddClass("ui-buffer");			
			this.bufferbar = buffer;
			this.AddChild(buffer);
			buffer = null;
			
			// skipping helper
			this.arrow = new Div("0:00");
			this.arrow.AddClass("ui-arrow");
			this.AddChild(this.arrow);
			
			// init progresbar with
			this.Sync(0);
			
			// change video position, when the bar is clicked
			this.GetHTML().onclick = (e: MouseEvent) => this.OnClick(e);
			this.GetHTML().onmousemove = (e: MouseEvent) => this.OnMouseMove(e);
		}
		
		/**
		 * Skip to given moment after user clicks on the timeline
		 * @param	e	Event information
		 */
		private OnClick(e: MouseEvent) {
			var time: number = (e.clientX / this.GetHTML().clientWidth) * this.length;
			this.SkipTo(time);  
		}
	
		/**
		 * Show the user an information about the point he is pointing to
		 * @param	e	Event information
		 */
		private OnMouseMove(e: MouseEvent) {
			var progress: number = e.clientX / this.GetHTML().clientWidth;
			var time: string = millisecondsToString(progress * this.length);
			this.arrow.GetHTML().textContent = time;
			this.arrow.GetHTML().style.left = `${progress * 100}%`;  
			
			var rect = this.arrow.GetHTML().getBoundingClientRect();			
			if(rect.left < 0) {
				this.arrow.GetHTML().style.left = `${rect.width / 2}px`;
			} else if (rect.right > this.GetHTML().getBoundingClientRect().right) {
				this.arrow.GetHTML().style.left = `${this.GetHTML().getBoundingClientRect().right - (rect.width / 2)}px`;
			}
		}
		
		/**
		 * Synchronize progress bar width with current time 
		 * @param	time	What is the current progress in milliseconds.
		 */
		public Sync(time: number) {
			this.progresbar.GetHTML().style.width = this.length > 0 ? `${time / this.length * 100}%` : "O%";
		}
		
		/**
		 * Synchronize buffer bar width with current time 
		 * @param	time	How much is loaded in seconds.
		 */
		public SetBuffer(time: number) {
			this.bufferbar.GetHTML().style.width = this.length > 0 ? `${time / this.length * 100}%` : "O%";
		}
		
		/**
		 * Change the width of the timeline according to the time.
		 * @param	time	Time in milliseconds
		 * @triggers-event	JumpTo
		 */
		public SkipTo(time: number) {
			// triger an event...			
			this.events.trigger(VideoEventType.JumpTo, time / this.length);
			
			// sync self
			this.Sync(time);			
		} 
		
	}
	
//}