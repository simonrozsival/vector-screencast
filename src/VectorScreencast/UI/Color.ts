

module VectorScreencast.UI {
		
	/**
	 * Color representation.
	 */
	export class Color {
		constructor(private name: string, private cssValue: string) { }
		
		/**
		 * Textual representation
		 */
		public get Name() : string { return this.name; }
		
		/**
		 * CSS value of the color
		 */
		public get CssValue() : string { return this.cssValue; } 
		
		
		/**
		 * Color prototypes
		 */
		 		
		private static backgroundPrototype: Color = new Color("Dark gray", "#111");
		public static set BackgroundColor(c: Color) { this.backgroundPrototype = c; }
		public static get BackgroundColor() : Color {
			return new Color(this.backgroundPrototype.Name, this.backgroundPrototype.CssValue);
		}
		
		private static foregroundPrototype: Color = new Color("White", "#fff");
		public static set ForegroundColor(c: Color) { this.foregroundPrototype = c; }
		public static get ForegroundColor() : Color {
			return new Color(this.foregroundPrototype.Name, this.foregroundPrototype.CssValue);
		}
		 
	}
	
}