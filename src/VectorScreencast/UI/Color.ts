
//namespace VectorScreencast.UI {

	/**
	 * Color representation.
	 */
	export default class Color {
		/**
		 * @param	cssValue	Valid CSS value of a color.
		 */
		constructor(private cssValue: string) { }

		/**
		 * CSS value of the color.
		 */
		public get CssValue(): string {  return this.cssValue;  }

		/** Current background color. */
		private static backgroundPrototype = new Color("#111"); // dark gray
		/**
		 * Set different background color.
		 * @param	c 	New background color.
		 */
		public static set BackgroundColor(c: Color) { this.backgroundPrototype = c; }
		/**
		 * Access current background color.
		 * @return 	Current background color.
		 */
		public static get BackgroundColor(): Color {
			return new Color(this.backgroundPrototype.CssValue);
		}

		/** Current foreground color */
		private static foregroundPrototype = new Color("#fff"); // white
		/**
		 * Set different foreground color.
		 * @param	c	New foreground color
		 */
		public static set ForegroundColor(c: Color) { this.foregroundPrototype = c; }
		/**
		 * Get current foreground color.
		 */
		public static get ForegroundColor(): Color {
			return new Color(this.foregroundPrototype.CssValue);
		}

	}
//}
