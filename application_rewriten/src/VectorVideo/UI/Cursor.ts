/// <reference path="BasicElements.ts" />
/// <reference path="Color.ts" />
/// <reference path="../Helpers/HTML.ts" />
/// <reference path="../Helpers/SVG.ts" />

module UI {
	
	/**
	 * Cursor implementation.
	 */
	export class Cursor implements IElement {
		
		/** The offset of the center of the cursor */
		private offset: number;
		
		/** This is the very cursor */
		private element: HTMLElement;
		
		constructor(private size: number, private color: Color) {
			this.offset = size / 2;
			this.CreateHTML();
		}
		
		/**
		 * Prepares the cursor crosshair
		 * 
		 * 		   |
		 * 		---|---
		 * 		   | 
		 */
		private CreateHTML() : void {
			this.element = Helpers.HTML.CreateElement("svg", {
				width: this.size,
				height: this.size
			});
	
			// draw the "+"
			var path = Helpers.SVG.CreateElement("path", {
				fill: "transparent",
				stroke: this.color,
				"stroke-width": this.size * 0.1, // 10% of the cursor with and height
				d: `M ${this.offset},0 L ${this.offset},${this.size} M 0,${this.offset} L ${this.size},${this.size} Z`
			});
			this.element.appendChild(path);
	
			// I want to move the cursor to any point and the stuff behind the cursor must be visible
			this.element.style.position = "absolute";
			this.element.style.background = "transparent";
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
			this.element.style.left = `${x - this.offset}px`;
			this.element.style.top = `${y - this.offset}px`;
		}
	}	
}