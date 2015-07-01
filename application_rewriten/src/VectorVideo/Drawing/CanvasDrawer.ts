/// <reference path="./DrawingStrategy.ts" />
/// <reference path="../Helpers/Vector.ts" />
/// <reference path="../Helpers/State.ts" />
/// <reference path="../Helpers/HTML.ts" />
/// <reference path="../Helpers/SVG.ts" />
/// <reference path="../Helpers/Spline.ts" />
/// <reference path="../Helpers/VideoEvents.ts" />
/// <reference path="../settings/BrushSettings.ts" />
/// <reference path="../UI/BasicElements" />
/// <reference path="Path" />

module Drawing {

    import HTML = Helpers.HTML;
    
    /**
     * This is the main drawing class - processes cursor states
     * and renders the lines on the blackboard.
     * This class uses HTML5 Canvas 2D Context for visualising the lines.
     */
    export class CanvasDrawer implements DrawingStrategy {
                
        /**
         * Init a new drawer.
         * @param   {boolean}   curved  Should the lines be curved, or simple quadrilateral?
         */
        constructor(protected curved: boolean = true) { }
        
        /** The canvas element */
        private canvas: HTMLCanvasElement;
		
		/** The rendering context of the canvas */
		private context: CanvasRenderingContext2D;      

        /**
         * Create a new renderer that will produce output into the CANVAS elemement usning HTML5.
         */
        CreateCanvas(): Element {
            this.canvas = <HTMLCanvasElement> HTML.CreateElement("canvas");
			this.context = <CanvasRenderingContext2D> this.canvas.getContext("2d");            
            return <Element> this.canvas;     
        }
        
        /**
         * Make ths canvas as large as possible (fill the parent element)
         */
		public Stretch(): void {
            // this is event handler - "this" isn't SVGDrawer here!
			var parent = this.canvas.parentElement;
            var width: number = parent.clientWidth;
            var height: number = parent.clientHeight;            

            Helpers.HTML.SetAttributes(this.canvas, {
                width: width,
                height: height
            });				
								    
            Helpers.VideoEvents.trigger(Helpers.VideoEventType.CanvasSize, width, height);
		}
        
        public SetupOutputCorrection(sourceWidth: number, sourceHeight: number): number {
            var wr = sourceWidth / this.canvas.width;
            var hr = sourceHeight / this.canvas.height;
            var min = Math.min(wr, hr);
                        
            // prepare scale uniformly 
            this.context.scale(min, min);
            // translate the (0,0) point
            if(wr < hr) {
                // this means the width of the source is scaled to match the width of the output canvas
                // corrected height of the source is therefore lesser than the height of the output canvas
                // - shift it a bit so it is centered
                // this.context.translate(0, this.canvas.height - (min * sourceHeight / 2));  
            } else if (hr < wr) {                
                // this means the width of the source is scaled to match the width of the output canvas
                // corrected height of the source is therefore lesser than the height of the output canvas
                // - shift it a bit so it is centered
                // this.context.translate(this.canvas.width - (min * sourceWidth / 2), 0);  
            }
            // else - the ratios match      
            
            return min;      
        }
        
        /**
         * Make the canvas blank.
         */
        public ClearCanvas(color: UI.Color): void {   
			this.context.fillStyle = color.CssValue;
			this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        /** Currenb brush color */
        protected currentColor: UI.Color;
    
        /**
         * Set color of a path, that will be drawn in the future.
         */
        public SetCurrentColor(color: UI.Color): void {
            this.currentColor = color;
        }
    
        /**
         * Start drawing a line.
         */
        public CreatePath(): Path {
            return new CanvasPath(this.curved, this.currentColor.CssValue, this.context);
        }       
        
    }    
}