/// <reference path="BasicElements" />
/// <reference path="Cursor" />
/// <reference path="Color" />
/// <reference path="../Drawing/IDrawingStrategy" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="../Helpers/State" />
/// <reference path="../Helpers/HTML" />

module UI {
	
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
		
		/** Get the color of the board */
		public get BackgroundColor(): string {
			return this.GetHTML().style.backgroundColor;
		}
						
		/**
		 * @param	id	HTML element id attribute value
		 */
		constructor(id: string) {
			super("div", id); // Panel
			
			// create a cursor 
			const CursorSize: number = 20;
			this.cursor = new Cursor(CursorSize, Color.ForegroundColor);
			this.AddChild(<IElement> this.cursor);
						
			// the implicit color of the board is dark, but it might be different 
			this.GetHTML().style.backgroundColor = Color.BackgroundColor.CssValue;
			Helpers.HTML.SetAttributes(this.GetHTML(), { position: "relative" });
			
			// move the cursor
			VideoEvents.on(VideoEventType.CursorState, this.UpdateCursorPosition);
		}
				
		/**
		 * Position the element
		 */
		private UpdateCursorPosition(state: Helpers.CursorState) {			
			this.cursor.MoveTo(state.X, state.Y); // @todo: correct the position
		}
	}
	
}