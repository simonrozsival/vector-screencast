

module VectorScreencast.UI {
		
	/**
	 * Brush size representation.
	 */
	export class BrushSize {
		constructor(private name: string, private size: number, private unit: string) { }
		
		/**
		 * Textual representation
		 */
		public get Name() : string { return this.name; }
		
		/**
		 * The size of the brush
		 */
		public get Size() : number { return this.size; } 
		
		/**
		 * The units of brush size
		 */
		public get Unit() : string { return this.unit; } 
		
		/**
		 * The size with the unit suitable for css
		 */
		public get CssValue() : string { return `${this.size}${this.unit}`; }
	}
	
} 
