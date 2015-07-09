

module VectorScreencast.UI {
		
	/**
	 * Brush size representation.
	 */
	export class BrushSize {
		constructor(private size: number) { }
		
		/**
		 * The size of the brush
		 */
		public get Size() : number { return this.size; } 
		
		/**
		 * The units of brush size - pixels
		 */
		public get Unit() : string { return "px"; } 
		
		/**
		 * The size with the unit suitable for css
		 */
		public get CssValue() : string { return `${this.Size}${this.Unit}`; }
	}
	
} 
