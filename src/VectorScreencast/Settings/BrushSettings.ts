
import BrushSize from '../UI/Brush';
import Color from '../UI/Color';


//namespace VectorScreencast.Settings {
	
	/**
	 * The interface defining current brush settings for rendering.
	 */	
	export interface BrushSettings {
		/** Current brush size */
		Size: BrushSize;
		/** Current brush color */
		Color: Color;
	}
	
//}