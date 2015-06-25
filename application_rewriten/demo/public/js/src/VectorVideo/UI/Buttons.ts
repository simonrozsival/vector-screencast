/// <reference path="BasicElements" />
/// <reference path="Color" />
/// <reference path="Brush" />
/// <reference path="../Helpers/HTML" />
/// <reference path="../Helpers/VideoEvents" />

module UI {
	
	import VideoEvents = Helpers.VideoEvents;
	import VideoEventType = Helpers.VideoEventType;
		
	/**
	 * Recorder button - change brush color when clicked
	 */
	export class ChangeColorButton extends Button {
		
		/** Reference to the active button. */
		private static active: Button;
		
		constructor(private color: Color) {						
			super(""); // empty text			
			
			// make the button a color option
			Helpers.HTML.SetAttributes(this.GetHTML(), {
				class: "option",
				"data-color": color.CssValue,
				title: color.Name,
				style: "background-color: " + color.CssValue					
			});			
			
			// announce color change when the button is clicked
			this.GetHTML().onclick = (e) => this.ChangeColor(e);
		}
		
		/**
		 * Announce color change
		 */
		private ChangeColor(e: MouseEvent) : void {
			// mark this button as active and remove the emphasis from the previous one
			if(!!ChangeColorButton.active) { // if there is already an active button
				ChangeColorButton.active.GetHTML().classList.remove("active");				
			}
			this.GetHTML().classList.add("active");
						
			// announce the change
			ChangeColorButton.active = this;
			VideoEvents.trigger(VideoEventType.ChangeColor, this.color);
		}
		
	}
	
	/**
	 * Recorder button - change brush color when clicked
	 */
	export class ChangeBrushSizeButton extends Button {
				
		/** Reference to the active button. */
		private static active: Button;
		
		constructor(private size: BrushSize) {						
			super(""); // empty text			
			
			// there will be a dot corresponding to the brush size
			var dot = Helpers.HTML.CreateElement("span", {
				style: `width: ${size.CssValue};	
						height: ${size.CssValue};
						border-radius: ${size.Size / 2}${size.Unit}; 
						display: inline-block;
						background: black;`				
			});
			this.GetHTML().appendChild(dot);			
					
			// make the button a color option
			Helpers.HTML.SetAttributes(this.GetHTML(), {
				class: "option",
				"data-size": size.Size,
				title: size.Name				
			});
			
			// announce color change when the button is clicked
			this.GetHTML().onclick = (e) => this.ChangeColor(e);
		}
		
		
		/**
		 * Announce color change
		 */
		private ChangeColor(e: MouseEvent) : void {
			// do not draw a dot behind the bar
			e.preventDefault();
			
			// mark this button as active and remove the emphasis from the previous one
			if(!!ChangeBrushSizeButton.active) { // if there is already an active button
				ChangeBrushSizeButton.active.GetHTML().classList.remove("active");				
			}
			this.GetHTML().classList.add("active");
						
			// announce the change
			ChangeBrushSizeButton.active = this;
			VideoEvents.trigger(VideoEventType.ChangeBrushSize, this.size);
		}
		
	}
	
}