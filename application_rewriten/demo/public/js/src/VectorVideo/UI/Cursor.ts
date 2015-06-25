/// <reference path="BasicElements.ts" />
/// <reference path="Color.ts" />
/// <reference path="../Helpers/HTML.ts" />
/// <reference path="../Helpers/SVG.ts" />

module UI {
	
	import Vector2 = Helpers.Vector2;
	
	/**
	 * Cursor implementation.
	 */
	export class Cursor implements IElement {
		
		/** The distance of the  */
		private radius:  number;
				
		/** This is the very cursor */
		private element: HTMLElement;
		
		/** This is the very cursor */
		private svg: Element;
		
		/** SVG representation of the cursor shape */
		private dot: Element;
		
		/** Current cursor position */
		private position: Helpers.Vector2;
		
		/** A "constant" defining the stroke size */
		private stroke: number;
		
		/**
		 * Initialise a cursor. It's size and color must be explicitely changed before using it though!
		 */
		constructor() {
			this.radius = 20;
			this.stroke = 3;
			this.position = new Vector2(0, 0);
			this.CreateHTML();
		}
		
		/**
		 * Prepares the cursor shape - a dot, but with zero size and no specific color (default white)
		 */
		private CreateHTML() : void {
			this.element = Helpers.HTML.CreateElement("div", { class: "ui-cursor" });
			
			this.svg = Helpers.SVG.CreateElement("svg", {
				width: 2*this.radius,
				height: 2*this.radius
			});
			this.element.appendChild(this.svg);
	
			// draw the dot at the center of the SVG element
			this.dot = Helpers.SVG.CreateDot(new Helpers.Vector2(this.radius, this.radius), this.radius - this.stroke, Color.BackgroundColor.CssValue);
			Helpers.SVG.SetAttributes(this.dot, {
				"stroke": "white", // default -white
				"stroke-width": this.stroke
			});
			this.svg.appendChild(this.dot);
	
			// I want to move the cursor to any point and the stuff behind the cursor must be visible
			this.element.style.position = "absolute";
			this.element.style.background = "transparent";
			this.element.style.lineHeight = "0";
		}
		
		public GetHTML() : HTMLElement {
			return this.element;
		}
	
		/**
		 * Move the cursor to a specified position.
		 * @param	x	X coordinate of cursor center
		 * @param	y	Y coordinate of cursor center
		 */
		public MoveTo(x: number, y: number) : void {
			this.element.style.left = `${x - this.radius - this.stroke}px`;
			this.element.style.top = `${y - this.radius - this.stroke}px`;
			this.position = new Helpers.Vector2(x, y);
		}
		
		/**
		 * Change the color of brush outline according to current settings.
		 */
		public ChangeColor(color: Color) {
			if(color.CssValue === UI.Color.BackgroundColor.CssValue) {
				color = UI.Color.ForegroundColor; // make it inverse
			}
			
			Helpers.SVG.SetAttributes(this.dot, {
				stroke: color.CssValue				
			});
		}		
		
		/**
		 * Resize the brush according to current settings.
		 */
		public ChangeSize(size: BrushSize) {
			var originalRadius: number = this.radius;
			this.radius = size.Size / 2 - 2; // make the cursor a bit smaller than the path it will draw
			
			// resize the whole SVG element
			var calculatedSize: number = 2*(this.radius + this.stroke);
			Helpers.SVG.SetAttributes(this.svg, {
				width: calculatedSize,
				height: calculatedSize
			});
			
			// also correct the element's position, so the center of the dot stays where it was
			var shift = originalRadius - this.radius; // (when shrinking - positive, when expanding - negative)
			this.MoveTo(this.position.X + shift, this.position.Y + shift);
			
			// scale the dot
			Helpers.SVG.SetAttributes(this.dot, {
				cx: calculatedSize / 2,
				cy: calculatedSize / 2,
				r: Math.max(1, this.radius - this.stroke) // do not allow zero or even negative radius
			});
		}
	}	
}