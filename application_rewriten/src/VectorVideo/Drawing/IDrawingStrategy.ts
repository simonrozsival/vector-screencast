/// <reference path="../UI/BasicElements" />

module Drawing {
	
	export interface IDrawingStrategy {
		
		/**
		 * Allow readonly access to the drawing canvas. 
		 */
		GetCanvas() : UI.IElement;
		
		/**
		 * Set current brush size.
		 * @param	brushSize	The size of the brush
		 */		
		SetBrushSize(brushSize: number): void;
		
		/**
		 * Set current brush color.
		 * @param	brushColor	Color of the brush
		 */
		SetBrushColor(brushColor: string): void;		
				
        /**
         * Process next cursor state and possibli draw a line. 
		 * @param	state		Cursor state
         */
        ProcessNewState(state: CursorState): void;
		
		/**
		 * Request rendering.
		 */
		Render() : void;
		
		/**
		 * Clear everything.
		 */
		ClearCanvas() : void;
	}	
}