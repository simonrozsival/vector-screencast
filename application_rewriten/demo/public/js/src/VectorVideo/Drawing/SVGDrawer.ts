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
    import Spline = Helpers.Spline;
    import BezierCurveSegment = Helpers.BezierCurveSegment;
    import HTML = Helpers.HTML;
    import SVG = Helpers.SVG;
    import CursorState = Helpers.CursorState;

    /**
     * This is the main drawing class - processes cursor states
     * and renders the lines on the blackboard.
     * This class uses SVG (http://www.w3.org/TR/SVG) for visualising the lines.
     */
    export class SVGDrawer extends DrawingStrategy {
        
        /** SVG element */
        private svg: Element;
        
        /** Canvas layer */
        private canvas: Element;        
        
        /** Background layer */
        private bg: Element;          
        
        constructor(slowSimulation: boolean) {
            super(slowSimulation);
            
            // create the SVG canvas that will be drawn onto
            this.svg = SVG.CreateElement("svg");
            
            // background:
            var backgroundLayer: Element = SVG.CreateElement("g");
            this.bg = SVG.CreateElement("rect", {
                id: "background",
                fill: UI.Color.BackgroundColor.CssValue
            });
            backgroundLayer.appendChild(this.bg);
            this.svg.appendChild(backgroundLayer);
            
            // canvas             
            this.canvas = SVG.CreateElement("g", {
                id: "canvas"
            });
            this.svg.appendChild(this.canvas);            
            
            this.canvasWrapper.GetHTML().appendChild(this.svg);              
        }
        
        public Stretch(): void {
            var parent = this.canvasWrapper.GetHTML().parentElement;
            var width: number = parent.clientWidth;
            var height: number = parent.clientHeight;            

            Helpers.SVG.SetAttributes(this.svg, {
                width: width,
                height: height
            });
            this.svg = null; // remove reference
            
            Helpers.SVG.SetAttributes(this.bg, {
                width: width,
                height: height
            });
            this.bg = null; // remove reference
            
            Helpers.VideoEvents.trigger(Helpers.VideoEventType.CanvasSize, width, height);
        }
        
        /**
         * Make the canvas blank.
         */
        public ClearCanvas(): void {            
            // remove all drawn parts
            while (!!this.canvas.firstChild) {
                this.canvas.removeChild(this.canvas.firstChild);
            }
        }
    
        /**
         * Start drawing a line.
         * @param   point       Start point of the line.
         * @param   pressure    The pressure of the pointing device in this point.
         */
        protected StartLine(point: Vector2, pressure: number): void {
            var path: SvgPath = new SvgPath(this.settings.Color, this.canvas);
            this.dynaDraw.StartPath(point, pressure, this.settings.Size, path);
        }
    
    }    

}