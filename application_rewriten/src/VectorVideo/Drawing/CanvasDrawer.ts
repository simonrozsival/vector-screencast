/// <reference path="./DrawingStrategy.ts" />
/// <reference path="../helpers/Vector.ts" />
/// <reference path="../helpers/State.ts" />
/// <reference path="../helpers/HTML.ts" />
/// <reference path="../helpers/SVG.ts" />
/// <reference path="../helpers/Spline.ts" />
/// <reference path="../helpers/VideoEvents.ts" />
/// <reference path="../settings/BrushSettings.ts" />
/// <reference path="../UI/BasicElements" />

/// <reference path="DynaDraw" />
/// <reference path="Path" />

module Drawing {

    import Vector2 = Helpers.Vector2;
    import BrushSettings = Settings.BrushSettings;
    import HTML = Helpers.HTML;
    import CursorState = Helpers.CursorState;
    
    /**
     * This is the main drawing class - processes cursor states
     * and renders the lines on the blackboard.
     * This class uses HTML5 Canvas 2D Context for visualising the lines.
     */
    export class CanvasDrawer extends DrawingStrategy {
        
        /** The canvas element */
        private canvas: HTMLCanvasElement;
		
		/** The rendering context of the canvas */
		private context: CanvasRenderingContext2D;      

        /**
         * Create a new renderer that will produce output into the CANVAS elemement usning HTML5.
         */
        constructor(slowSimulation: boolean, canvas?: HTMLCanvasElement) {
            super(slowSimulation);
            
            this.canvas = !!canvas ? canvas : <HTMLCanvasElement> HTML.CreateElement("canvas");
			this.context = <CanvasRenderingContext2D> this.canvas.getContext("2d");
			
            this.canvasWrapper = new UI.SimpleElement("div");
            HTML.SetAttributes(this.canvasWrapper.GetHTML(), { class: "vector-video-canvas-wrapper" });
            this.canvasWrapper.GetHTML().appendChild(this.canvas);        
        }
        
		public Stretch(): void {
            // this is event handler - "this" isn't SVGDrawer here!
			var parent = this.canvas.parentElement;
            var width: number = parent.clientWidth;
            var height: number = parent.clientHeight;            

            Helpers.HTML.SetAttributes(this.canvas, {
                width: width,
                height: height
            });				
				
			// set the dark background color
			this.ClearCanvas();
						    
            Helpers.VideoEvents.trigger(Helpers.VideoEventType.CanvasSize, width, height);
		}
        
        /**
         * Make the canvas blank.
         */
        public ClearCanvas(): void {   
			this.context.fillStyle = UI.Color.BackgroundColor.CssValue;
			this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    
        /**
         * Start drawing a line.
         * @param   point       Start point of the line.
         * @param   pressure    The pressure of the pointing device in this point.
         */
        protected StartLine(point: Vector2, pressure: number): void {
            var path: CanvasPath = new CanvasPath(this.settings.Color, this.context);
            this.dynaDraw.StartPath(point, pressure, this.settings.Size, path);
        }
    
		/**
		 * Scale the content according to given factor 
		 */
		public Scale(center: Vector2, factor: number) : void {
            this.context.scale(factor, factor);
            this.context.translate(-center.X, -center.Y);
            this.RedrawEverything();
        }
    }    

}