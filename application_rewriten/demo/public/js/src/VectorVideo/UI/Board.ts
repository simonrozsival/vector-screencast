/// <reference path="BasicElements" />
/// <reference path="Cursor" />
/// <reference path="Color" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="../Helpers/State" />
/// <reference path="../Helpers/HTML" />

module UI {
	
	import HTML = Helpers.HTML;
	
	/**
	 * The board itself.
	 */
	export class Board extends Panel {				
			
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
		 * @param	id	HTML element id attribute value
		 */
		constructor(id: string) {
			super("div", id); // Panel
			HTML.SetAttributes(this.GetHTML(), { class: "vector-video-board" });
			
			// create a cursor 
			this.cursor = new Cursor();
			this.AddChild(<IElement> this.cursor);
			
			// make board's position relative for the cursor			
			Helpers.HTML.SetAttributes(this.GetHTML(), { position: "relative" });
			
			// move the cursor
			Helpers.VideoEvents.on(Helpers.VideoEventType.CursorState, 		(state: Helpers.CursorState) 	=> this.UpdateCursorPosition(state));
			Helpers.VideoEvents.on(Helpers.VideoEventType.ChangeBrushSize, 	(state: BrushSize)				=> this.UpdateCursorSize(state));
			Helpers.VideoEvents.on(Helpers.VideoEventType.ChangeColor, 		(state: Color)					=> this.UpdateCursorColor(state));
			Helpers.VideoEvents.on(Helpers.VideoEventType.ChangeColor, 		(state: Color)					=> this.UpdateCursorColor(state));
		}
				
		/**
		 * Position the element
		 */
		private UpdateCursorPosition(state: Helpers.CursorState): void {			
			this.cursor.MoveTo(state.X, state.Y); // @todo: correct the position
		}
		
		/**
		 * Position the element
		 */
		private UpdateCursorSize(size: BrushSize): void {			
			this.cursor.ChangeSize(size);
		}
		
		/**
		 * Position the element
		 */
		private UpdateCursorColor(color: Color): void {			
			this.cursor.ChangeColor(color);
		}
	}
	
}