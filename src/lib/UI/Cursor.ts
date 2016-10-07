
import Vector2 from '../Helpers/Vector';
import { Div } from './BasicElements';
import BrushSize from './Brush';
import VideoEvents, { VideoEventType } from '../Helpers/VideoEvents';
import HTML from '../Helpers/HTML';
import SVG from '../Helpers/SVG';
import Color from './Color';


//namespace VectorScreencast.UI {
	
	/**
	 * Cursor implementation.
	 */
	export default class Cursor extends Div {
		
		/** The distance of the  */
		protected radius:  number;
						
		/** This is the very cursor */
		protected svg: Element;
		
		/** SVG representation of the cursor shape */
		protected dot: Element;
		
		/** Current cursor position */
		protected position: Vector2;
		
		/** Constant distance from the top left corner. */
		protected offset: Vector2;
		
		/** Set the value of cursor's offset. */
		public set Offset(val: Vector2) {
			this.offset = val;
		}
		
		/** A "constant" defining the stroke size */
		protected stroke: number;
		
		/** Scaling factor */
		protected scalingFactor: number;
		
		/** Current size of the brush */
		protected size: BrushSize;
		
		
		
		/**
		 * Initialise a cursor. It's size and color must be explicitely changed before using it though!
		 */
		constructor(protected events: VideoEvents) {
			super();			
			this.radius = 20;
			this.stroke = 3;
			this.position = new Vector2(0, 0);
			this.offset = new Vector2(0, 0);
			this.CreateHTML();
			this.scalingFactor = 1;
			this.size = null;
		}
		
		/** Current background color of the dot */
		private bgColor: Color;
		
		/** Current color of the stroke */
		private color: Color;
		
		/**
		 * Prepares the cursor shape - a dot, but with zero size and no specific color (default white)
		 */
		private CreateHTML() : void {
			this.svg = SVG.CreateElement("svg", {
				width: 2*this.radius,
				height: 2*this.radius
			});
			this.AddClass('ui-cursor').GetHTML().appendChild(this.svg);
	
			// draw the dot at the center of the SVG element
			this.bgColor = Color.BackgroundColor;
			this.color = Color.ForegroundColor;
			
			this.dot = SVG.CreateDot(new Vector2(this.radius, this.radius), this.radius - this.stroke, this.bgColor.CssValue);
			SVG.SetAttributes(this.dot, {
				"stroke": this.color.CssValue,
				"stroke-width": this.stroke
			});
			this.svg.appendChild(this.dot);
			
			this.events.on(VideoEventType.ClearCanvas, (color: Color) => {
				this.bgColor = color;
				SVG.SetAttributes(this.dot, { fill: this.bgColor.CssValue });
				this.ChangeColor(this.color); // make sure the border color is contrastant
			});			
		}
		
		/**
		 * Move the cursor to a specified position.
		 * @param	x	X coordinate of cursor center
		 * @param	y	Y coordinate of cursor center
		 */
		public MoveTo(x: number, y: number) : void {
			this.GetHTML().style.left = `${x*this.scalingFactor - this.radius - this.stroke + this.offset.X}px`;
			this.GetHTML().style.top = `${y*this.scalingFactor - this.radius - this.stroke + this.offset.Y	}px`;
			this.position = new Vector2(x, y);
		}
		
		/**
		 * Change the color of brush outline according to current settings.
		 */
		public ChangeColor(color: Color) {
			if (color.CssValue === Color.Transparent.CssValue) {
				color = new Color("black"); 
			} else if (color.CssValue === this.bgColor.CssValue) {
				color = color.CssValue === Color.ForegroundColor.CssValue ? Color.BackgroundColor : Color.ForegroundColor; // make it inverse
			}
			
			SVG.SetAttributes(this.dot, {
				stroke: color.CssValue				
			});
			this.color = color;
		}		
		
		/**
		 * Resize the brush according to current settings.
		 */
		public ChangeSize(size: BrushSize) {
			this.size = size; // update the last size scaled to
			var originalRadius: number = this.radius;
			this.radius = (size.Size * this.scalingFactor) / 2 - 2; // make the cursor a bit smaller than the path it will draw
			
			// resize the whole SVG element
			var calculatedSize: number = 2*(this.radius + this.stroke);
			SVG.SetAttributes(this.svg, {
				width: calculatedSize,
				height: calculatedSize
			});
			
			// also correct the element's position, so the center of the dot stays where it was
			var shift = originalRadius - this.radius; // (when shrinking - positive, when expanding - negative)
			this.MoveTo(this.position.X + shift, this.position.Y + shift);
			
			// scale the dot
			SVG.SetAttributes(this.dot, {
				cx: calculatedSize / 2,
				cy: calculatedSize / 2,
				r: Math.max(1, this.radius - this.stroke) // do not allow zero or even negative radius
			});
		}
		
		/**
		 * Set new cursor scaling factor to match the dimensions of the canvas and resize the cursor immediately.
		 */
		public SetScalingFactor(sf: number): void {
			this.scalingFactor = sf;
			if(!!this.size) { // if the size was already ever specified
				this.ChangeSize(this.size);				
			}
		}
	}	
//}