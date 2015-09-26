
import VideoEvents, { VideoEventType } from '../Helpers/VideoEvents';
import HTML from '../Helpers/HTML';
import Vector2 from '../Helpers/Vector';
import { CursorState } from '../Helpers/State';
import Color from '../UI/Color';

import { IElement, SimpleElement, Panel } from './BasicElements';
import Cursor from './Cursor';
import BrushSize from './Brush';


//namespace VectorScreencast.UI {
	
	/**
	 * The board itself.
	 */
	export default class Board extends Panel {				
			
		/** Custom cursor that replaces the system arrow. */
		private cursor: Cursor;
				
		/** Get the width of the board in pixels */
		public get Width(): number {
			return this.GetHTML().clientWidth;
		}
		
		/** Get the height of the board in pixels */
		public get Height(): number {
			return this.GetHTML().clientHeight;
		}
		
		/** Set the height of the board in pixels */
		public set Height(height: number) {
			this.GetHTML().clientHeight = height;
		}
				
		/** Get the color of the board */
		public set IsRecording(isRecording: boolean) {
			isRecording ? this.GetHTML().classList.add("recording") : this.GetHTML().classList.remove("recording");
		}
						
		/**
		 * Create a new board
		 * @param	id	HTML element id attribute value
		 */
		constructor(id: string, protected events: VideoEvents) {
			super("div", id); // Panel
			HTML.SetAttributes(this.GetHTML(), { class: "vector-video-board" });
			
			// create a cursor 
			this.cursor = new Cursor(events);
			this.AddChild(<IElement> this.cursor);
			
			// make board's position relative for the cursor			
			HTML.SetAttributes(this.GetHTML(), { position: "relative" });
			
			// move the cursor
			events.on(VideoEventType.CursorState, 			(state: CursorState) 	=> this.UpdateCursorPosition(state));
			events.on(VideoEventType.CursorState, 			(state: CursorState) 	=> this.UpdateCursorPosition(state));			
			events.on(VideoEventType.ChangeBrushSize, 		(state: BrushSize)				=> this.UpdateCursorSize(state));
			events.on(VideoEventType.ChangeColor, 			(state: Color)					=> this.UpdateCursorColor(state));
			events.on(VideoEventType.ChangeColor, 			(state: Color)					=> this.UpdateCursorColor(state));
			events.on(VideoEventType.CanvasScalingFactor, 	(scalingFactor: number)			=> this.UpdateCursorScale(scalingFactor));
			events.on(VideoEventType.CursorOffset, 		(offset: Vector2)		=> this.cursor.Offset = offset);
		}
				
		/**
		 * Position the element
		 */
		private UpdateCursorPosition(state: CursorState): void {	
			this.cursor.MoveTo(state.X, state.Y);
		}
		
		/**
		 * Position the element
		 */
		private UpdateCursorSize(size: BrushSize): void {			
			this.cursor.ChangeSize(size);
		}
		
		/**
		 * 
		 */
		private UpdateCursorColor(color: Color): void {			
			this.cursor.ChangeColor(color);
		}		
		
		/**
		 * Position the element
		 */
		private UpdateCursorScale(scalingFactor: number): void {			
			this.cursor.SetScalingFactor(scalingFactor);
		}
	}
	
//}