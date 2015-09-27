
import Color from './Color';
import { Button } from './BasicElements';
import BrushSize from './Brush';
import VideoEvents, { VideoEventType } from '../Helpers/VideoEvents';
import HTML from '../Helpers/HTML';

//namespace VectorScreencast.UI {
			
	/**
	 * Recorder button - change brush color when clicked
	 */
	export class ChangeColorButton extends Button {
		
		/** Reference to the active button. */
		private static active: Button;
		
		/** Current color of this button. */
		private color: Color;
		
		constructor(protected events: VideoEvents, color: Color, callback?: Function) {						
			super(""); // empty text			
			this.SetColor(color);
			
			// announce color change when the button is clicked
			this.GetHTML().onclick = (e) => !!callback ? callback() : this.ChangeColor(e); // if there is some expicit callback, then call it
		}
		
		/**
		 * Announce color change
		 * @param	e	Event information
		 */
		private ChangeColor(e: MouseEvent) : void {
			// mark this button as active and remove the emphasis from the previous one
			if(!!ChangeColorButton.active) { // if there is already an active button
				ChangeColorButton.active.GetHTML().classList.remove("active");				
			}
			this.GetHTML().classList.add("active");
						
			// announce the change
			ChangeColorButton.active = this;
			this.events.trigger(VideoEventType.ChangeColor, this.color);
		}
	
		/**
		 * Set the color of the button.
		 */
		public SetColor(color: Color): void {
			this.color = color;
			
			// make the button a color option
			HTML.SetAttributes(this.GetHTML(), {
				class: "option",
				"data-color": color.CssValue,
				style: "background-color: " + color.CssValue					
			});			
		}
		
	}
	
	/**
	 * Recorder button - change brush color when clicked
	 */
	export class ChangeBrushSizeButton extends Button {
				
		/** Reference to the active button. */
		private static active: Button;
		
		constructor(protected events: VideoEvents, private size: BrushSize) {						
			super(""); // empty text			
			
			// there will be a dot corresponding to the brush size
			var dot = HTML.CreateElement("span", {
				style: `width: ${size.CssValue};	
						height: ${size.CssValue};
						border-radius: ${size.Size / 2}${size.Unit}; 
						display: inline-block;
						background: black;
						margin-top: ${-size.Size / 2}${size.Unit};`,
				class: "dot",
				"data-size": size.Size				
			});
			//dot.textContent = size.Size.toString();
			this.GetHTML().appendChild(dot);
					
			// make the button a color option
			HTML.SetAttributes(this.GetHTML(), {
				class: "option",
				"data-size": size.Size	
			});
			
			// announce color change when the button is clicked
			this.GetHTML().onclick = (e) => this.ChangeSize(e);
		}
		
		
		/**
		 * Announce change of brush size.
		 * @param	e	Event information
		 */
		private ChangeSize(e: MouseEvent) : void {
			e.preventDefault();
			
			// mark this button as active and remove the emphasis from the previous one
			if(!!ChangeBrushSizeButton.active) { // if there is already an active button
				ChangeBrushSizeButton.active.GetHTML().classList.remove("active");				
			}
			this.GetHTML().classList.add("active");
						
			// announce the change
			ChangeBrushSizeButton.active = this;
			this.events.trigger(VideoEventType.ChangeBrushSize, this.size);
		}
		
	}
	
//}