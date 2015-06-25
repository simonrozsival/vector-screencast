/// <reference path="./DrawingStrategy" />
/// <reference path="../helpers/Vector" />
/// <reference path="../helpers/State" />
/// <reference path="../helpers/HTML" />
/// <reference path="../helpers/SVG" />
/// <reference path="../helpers/Spline" />
/// <reference path="../helpers/VideoEvents" />
/// <reference path="../settings/BrushSettings" />
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

	export class DrawingStrategy {
        
                  
        /**  */
        protected paths: Array<CanvasPath>;
        
        /**
         * Init general things
         */
        constructor(protected slowSimulation: boolean) {
            // wrapper
            this.canvasWrapper = new UI.SimpleElement("div");
            HTML.SetAttributes(this.canvasWrapper.GetHTML(), { class: "vector-video-canvas-wrapper" });
            
            // settings will be set later
            this.settings = {
                Color: "",
                Size: 0
            };                          
            
            // collection of all paths
            this.paths = [];
        }
              
        
        /** The canvas UI element */
        protected canvasWrapper: UI.SimpleElement; 
                            
        /**
         * Allow acces to the canvas element. 
         */
        public GetCanvas(): UI.IElement {
            return this.canvasWrapper;
        }
        
        /** The drawing algorithm implementation */
        protected dynaDraw: DynaDraw;
		
        public InitBrushDynamcis(minBrushSize: number, maxBrushSize: number): void {            
            // init DynaDraw
            this.dynaDraw = new DynaDraw(this.slowSimulation, minBrushSize, maxBrushSize);
        }
			
        /** Last state received. */
        protected lastState: CursorState;
        
        /** Current brush settings */
        protected settings: BrushSettings;
        
        /**
         * Current brush settings
         * @return {object} Settings.
         */
        protected GetCurrentBrushSettings(): BrushSettings {
            return this.settings;
        }
        
        /**
         * Set current brush size
         * @param   size    The new size of the brush (line thickness)
         */
        public SetBrushSize(size: UI.BrushSize): void {
            this.settings.Size = size.Size;
        }
        
        /**
         * Set current brush color
         * @param   color   The new color of the brush
         */
        public SetBrushColor(color: UI.Color): void {
            this.settings.Color = color.CssValue;
        }
        
        /**
         * Process next state and 
         */
        public ProcessNewState(cursor: CursorState): void {
            try {
                var nextPoint = new Vector2(cursor.X, cursor.Y);
                if (cursor.Pressure > 0) {
                    if (!this.lastState || this.lastState.Pressure === 0) {
                        this.StartLine(nextPoint, cursor.Pressure);      
                    } else {
                        this.ContinueLine(nextPoint, cursor.Pressure);
                    }
                } else if (this.lastState && this.lastState.Pressure > 0) {
                    this.EndLine(nextPoint);
                }
            } catch (err) {
                console.log("ProcessNewState error: ", err);
            }
            
            this.lastState = cursor;
        }
        
        /**
         * 
         */
        protected StartLine(point: Vector2, pressure: number): void {
            throw new Error("Not implemented");
        }
                
        protected ContinueLine(point: Vector2, pressure: number): void {
            this.dynaDraw.NextPoint(point, pressure);
        }
        
        protected EndLine(point: Vector2): void {
            this.dynaDraw.EndPath(point, 0);
        }
		
		/**
		 * Clear everything.
		 */
		public ClearCanvas() : void {
            throw new Error("Not implemented");
        }
		
		/**
		 * Adapt the canvas to the size of the container
		 */
		public Stretch() : void {
            throw new Error("Not implemented");
        }
		
		/**
		 * Scale the content according to given factor 
		 */
		public Scale(center: Vector2, factor: number) : void {
            throw new Error("Not implemented");
        }
        
        
        /**
         * Clear the canvas and draw everything from the very start until now
         */
        protected RedrawEverything(): void {
            this.ClearCanvas();
            for (var i = 0; i < this.paths.length; i++) {
                var element = this.paths[i];
                element.Redraw();
            }   
        }
	}	
}