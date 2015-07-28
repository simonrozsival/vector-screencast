/// <reference path="./DrawingStrategy.ts" />
/// <reference path="../Helpers/Vector.ts" />
/// <reference path="../Helpers/State.ts" />
/// <reference path="../Helpers/HTML.ts" />
/// <reference path="../Helpers/SVG.ts" />
/// <reference path="../Helpers/Spline.ts" />
/// <reference path="../Helpers/VideoEvents.ts" />
/// <reference path="../UI/BasicElements" />
/// <reference path="Path" />

module VectorScreencast.Drawing {

    import HTML = Helpers.HTML;
    
    /**
     * This is the main drawing class - processes cursor states
     * and renders the lines on the blackboard.
     * This class uses HTML5 Canvas 2D Context for visualising the lines.
     */
    export class CanvasDrawer implements DrawingStrategy {
                
        /** Video events listening and triggering */
        protected events: Helpers.VideoEvents;
        
        /**
         * Set the events aggregator.
         */
        public SetEvents(events: Helpers.VideoEvents): void {
            this.events = events;
        }
                
        /**
         * Init a new drawer.
         * @param   {boolean}   curved  Should the lines be curved, or simple quadrilateral?
         */
        constructor(protected curved: boolean = true) { }
        
        private originalWidth: number;
        private originalHeight: number;
        
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
            this.originalHeight = height;
            this.originalWidth = width;    

            Helpers.HTML.SetAttributes(this.canvas, {
                width: width,
                height: height
            });				
								    
            this.events.trigger(Helpers.VideoEventType.CanvasSize, width, height);
		}
        
        public SetupOutputCorrection(sourceWidth: number, sourceHeight: number): number {
            var wr = this.canvas.width / sourceWidth;
            var hr = this.canvas.height / sourceHeight;
            var min = Math.min(wr, hr);
                        
            // prepare scale uniformly 
            this.context.scale(min, min);
            
            //this.canvas.width = min*sourceWidth;
            //this.canvas.height = min*sourceHeight;
            
            return min;      
        }
        
        /**
         * Make the canvas blank.
         */
        public ClearCanvas(color: UI.Color): void {   
			this.context.fillStyle = color.CssValue;
			this.context.fillRect(0, 0, this.originalWidth, this.originalHeight);
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
        public CreatePath(events: Helpers.VideoEvents): Path {
            return new CanvasPath(events, this.curved, this.currentColor.CssValue, this.context);
        }       
        
    }    
}