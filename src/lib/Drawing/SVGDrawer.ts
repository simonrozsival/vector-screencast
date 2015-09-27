
import HTML from '../Helpers/HTML';
import SVG from '../Helpers/SVG';
import { DrawingStrategy } from './DrawingStrategy';
import VideoEvents, { VideoEventType } from '../Helpers/VideoEvents';
import Vector2 from '../Helpers/Vector';
import Color from '../UI/Color';
import Path, { SvgPath } from './Path';

//namespace VectorScreencast.Drawing {

    
    /**
     * This is the main drawing class - processes cursor states
     * and renders the lines on the blackboard.
     * This class uses SVG (http://www.w3.org/TR/SVG) for visualising the lines.
     */
    export default class SVGDrawer implements DrawingStrategy {
        
        /** Video events listening and triggering */
        protected events: VideoEvents;
        
        public SetEvents(events: VideoEvents): void {
            this.events = events;
        }
        
        /**
         * Init a new drawer.
         * @param   {boolean}   curved  Should the lines be curved, or simple quadrilateral?
         */
        constructor(protected curved: boolean = true) { }
        
        
        /** SVG element */
        private svg: Element;
        
        /** Canvas layer */
        private canvas: HTMLElement;        
        
        /** Background layer */
        private bg: Element;          
        
        public CreateCanvas(): HTMLElement {            
            // create the SVG canvas that will be drawn onto
            this.svg = SVG.CreateElement("svg");
            
            // background:
            var backgroundLayer: Element = SVG.CreateElement("g");
            this.bg = SVG.CreateElement("rect", {
                id: "background"
            });
            backgroundLayer.appendChild(this.bg);
            this.svg.appendChild(backgroundLayer);
            
            // canvas             
            this.canvas = <HTMLElement> SVG.CreateElement("g", {
                id: "canvas"
            });
            this.svg.appendChild(this.canvas);    
            
            return <HTMLElement> this.svg;      
        }
        
        /**
         * Make ths canvas as large as possible (fill the parent element)
         */
        public Stretch(): void {
            var parent = this.svg.parentElement;
            var width: number = parent.clientWidth;
            var height: number = parent.clientHeight;            

            SVG.SetAttributes(this.svg, {
                width: width,
                height: height
            });
            
            SVG.SetAttributes(this.bg, {
                width: width,
                height: height
            });            
            this.events.trigger(VideoEventType.CanvasSize, width, height);
        }
        
        /**
         * Make the canvas blank.
         */
        public ClearCanvas(color: Color): void {            
            // remove all drawn parts
            while (!!this.canvas.firstChild) {
                this.canvas.removeChild(this.canvas.firstChild);
            }
            
            // change the bg color
            SVG.SetAttributes(this.bg, { fill: color.CssValue });
        }
    
    
        
        /** Currenb brush color */
        protected currentColor: Color;
    
        /**
         * Set color of a path, that will be drawn in the future.
         * @param   {string} color       Color of the new path.
         */
        public SetCurrentColor(color: Color): void {
            this.currentColor = color;
        }
    
    
        /**
         * Start drawing a line.
         */        
		public CreatePath(events: VideoEvents): Path {
            return new SvgPath(events, this.curved, this.currentColor.CssValue, this.canvas);
        }
        
                
        public SetupOutputCorrection(sourceWidth: number, sourceHeight: number): number {
            var wr = this.svg.clientWidth / sourceWidth;
            var hr = this.svg.clientHeight / sourceHeight;
            var min = Math.min(wr, hr);
                        
            // prepare scaling and translating
            SVG.SetAttributes(this.svg, {
                "viewBox": `0 0 ${sourceWidth} ${sourceHeight}`
            });
            
            if(min === wr) {
                this.events.trigger(VideoEventType.CursorOffset, new Vector2(0, (this.svg.clientHeight - sourceHeight*min) / 2));                
            } else {
                this.events.trigger(VideoEventType.CursorOffset, new Vector2((this.svg.clientWidth - sourceWidth*min) / 2, 0));
            }
            
            return min;
        }
    
    }    

//}