/// <reference path="../UI/BasicElements" />

module Drawing {
	
	import CursorState = Helpers.CursorState;
	import Vector2 = Helpers.Vector2;
	
	export interface IDrawingStrategy {
		
		/**
		 * Allow readonly access to the drawing canvas. 
		 */
		GetCanvas() : UI.IElement;
		
		/**
		 * Init drawing mechanisms
		 */
		InitBrushDynamcis(minBrushSize: number, maxBrushSize: number): void;
		
		/**
		 * Set current brush size.
		 * @param	brushSize	The size of the brush
		 */
		SetBrushSize(brushSize: UI.BrushSize): void;
		
		/**
		 * Set current brush color.
		 * @param	brushColor	Color of the brush
		 */
		SetBrushColor(brushColor: UI.Color): void;		
				
        /**
         * Process next cursor state and possibli draw a line. 
		 * @param	state		Cursor state
         */
        ProcessNewState(state: CursorState): void;
				
		/**
		 * Clear everything.
		 */
		ClearCanvas() : void;
		
		/**
		 * Adapt the canvas to the size of the container
		 */
		Stretch() : void;
		
		/**
		 * Scale the content according to given factor 
		 */
		//Scale(center: Vector2, factor: number) : void;
	}	
}