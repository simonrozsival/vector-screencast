/// <reference path="../VectorScreencast" />

module VectorScreencast.Settings {
	
	/**
	 * The interface defining current brush settings for rendering.
	 */	
	export interface BrushSettings {
		/** Current brush size */
		Size: UI.BrushSize;
		/** Current brush color */
		Color: UI.Color;
	}
	
}