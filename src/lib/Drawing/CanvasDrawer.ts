import { DrawingStrategy } from './DrawingStrategy';
import VideoEvents, { VideoEventType } from '../Helpers/VideoEvents';
import HTML from '../Helpers/HTML';
import Color from '../UI/Color';
import Path, { CanvasPath } from './Path';

//namespace VectorScreencast.Drawing {
    
    /**
     * This is the main drawing class - processes cursor states
     * and renders the lines on the blackboard.
     * This class uses HTML5 Canvas 2D Context for visualising the lines.
     */
    export default class CanvasDrawer implements DrawingStrategy {
                
        /** Video events listening and triggering */
        protected events: VideoEvents;
        
        /**
         * Set the events aggregator.
         */
        public SetEvents(events: VideoEvents): void {
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
        CreateCanvas(): HTMLElement {
            this.canvas = <HTMLCanvasElement> HTML.CreateElement("canvas");
			this.context = <CanvasRenderingContext2D> this.canvas.getContext("2d");            
            return this.canvas;     
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

            HTML.SetAttributes(this.canvas, {
                width: width,
                height: height
            });				
								    
            this.events.trigger(VideoEventType.CanvasSize, width, height);
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
        public ClearCanvas(color: Color): void {
			if(color.CssValue === "transparent") {
				// make the background transparent
				let op = this.context.globalCompositeOperation;
				this.context.globalCompositeOperation = "destination-out";
				this.context.fillStyle = "rgba(0,0,0,1)";
				this.context.fillRect(0, 0, this.originalWidth, this.originalHeight);
				this.context.globalCompositeOperation = op;	
			} else {
				this.context.fillStyle = color.CssValue;
				this.context.fillRect(0, 0, this.originalWidth, this.originalHeight);	
			}
        }
		
		private oldOperation: string;
		
		/**
		 * Turn the brush into an eraser.
		 */
		public EnterEraserMode() {
			this.oldOperation = this.context.globalCompositeOperation;
			this.context.globalCompositeOperation = "destination-out";
			this.context.fillStyle = "rgba(0,0,0,1)";
			this.context.strokeStyle = "rgba(0,0,0,1)";			
		}
		
		/**
		 * Turn the eraser back to the brush mode. 
		 */
		public ExitEraserMode() {
			this.context.globalCompositeOperation = this.oldOperation;
		}
        
        /** Currenb brush color */
        protected currentColor: Color;
    
        /**
         * Set color of a path, that will be drawn in the future.
         */
        public SetCurrentColor(color: Color): void {
            this.currentColor = color;
        }
    
        /**
         * Start drawing a line.
         */
        public CreatePath(events: VideoEvents): Path {
            return new CanvasPath(events, this.curved, this.currentColor.CssValue, this.context);
        }       
        
    }    
//}