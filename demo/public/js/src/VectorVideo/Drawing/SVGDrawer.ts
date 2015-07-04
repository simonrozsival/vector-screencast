/// <reference path="./DrawingStrategy.ts" />
/// <reference path="../helpers/Vector.ts" />
/// <reference path="../helpers/State.ts" />
/// <reference path="../helpers/HTML.ts" />
/// <reference path="../helpers/SVG.ts" />
/// <reference path="../helpers/Spline.ts" />
/// <reference path="../helpers/VideoEvents.ts" />
/// <reference path="../settings/BrushSettings.ts" />
/// <reference path="../UI/BasicElements" />
/// <reference path="Path" />

module Drawing {

    import HTML = Helpers.HTML;
    import SVG = Helpers.SVG;
    
    /**
     * This is the main drawing class - processes cursor states
     * and renders the lines on the blackboard.
     * This class uses SVG (http://www.w3.org/TR/SVG) for visualising the lines.
     */
    export class SVGDrawer implements DrawingStrategy {
        
        /**
         * Init a new drawer.
         * @param   {boolean}   curved  Should the lines be curved, or simple quadrilateral?
         */
        constructor(protected curved: boolean = true) { }
        
        
        /** SVG element */
        private svg: Element;
        
        /** Canvas layer */
        private canvas: Element;        
        
        /** Background layer */
        private bg: Element;          
        
        public CreateCanvas(): Element {            
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
            this.canvas = SVG.CreateElement("g", {
                id: "canvas"
            });
            this.svg.appendChild(this.canvas);    
            
            return this.svg;      
        }
        
        /**
         * Make ths canvas as large as possible (fill the parent element)
         */
        public Stretch(): void {
            var parent = this.svg.parentElement;
            var width: number = parent.clientWidth;
            var height: number = parent.clientHeight;            

            Helpers.SVG.SetAttributes(this.svg, {
                width: width,
                height: height
            });
            
            Helpers.SVG.SetAttributes(this.bg, {
                width: width,
                height: height
            });            
            Helpers.VideoEvents.trigger(Helpers.VideoEventType.CanvasSize, width, height);
        }
        
        /**
         * Make the canvas blank.
         */
        public ClearCanvas(color: UI.Color): void {            
            // remove all drawn parts
            while (!!this.canvas.firstChild) {
                this.canvas.removeChild(this.canvas.firstChild);
            }
            
            // change the bg color
            SVG.SetAttributes(this.bg, { fill: color.CssValue });
        }
    
    
        
        /** Currenb brush color */
        protected currentColor: UI.Color;
    
        /**
         * Set color of a path, that will be drawn in the future.
         * @param   {string} color       Color of the new path.
         */
        public SetCurrentColor(color: UI.Color): void {
            this.currentColor = color;
        }
    
    
        /**
         * Start drawing a line.
         */
        public CreatePath(): Path {
            return new SvgPath(this.curved, this.currentColor.CssValue, this.canvas);
        }
        
                
        public SetupOutputCorrection(sourceWidth: number, sourceHeight: number): number {
            var wr = this.svg.clientWidth / sourceWidth;
            var hr = this.svg.clientHeight / sourceHeight;
            var min = Math.min(wr, hr);
                        
            // prepare scaling and translating
            SVG.SetAttributes(this.svg, {
                //"viewBox": `${this.svg.clientWidth - (min * sourceWidth / 2)} ${this.svg.clientHeight - (min * sourceHeight / 2)}  ${this.svg.clientWidth * min} ${this.svg.clientHeight * min}`
                "viewBox": `0 0 ${sourceWidth} ${sourceHeight}`
            });
            
            return min;
        }
    
    }    

}