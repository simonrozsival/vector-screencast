/// <reference path="./IDrawingStrategy.ts" />
/// <reference path="../helpers/Vector.ts" />
/// <reference path="../helpers/State.ts" />
/// <reference path="../helpers/SVG.ts" />
/// <reference path="../helpers/Spline.ts" />
/// <reference path="../settings/BrushSettings.ts" />
/// <reference path="../UI/BasicElements" />

import Vector2 = Helpers.Vector2;
import BrushSettings = Settings.BrushSettings;
import Spline = Helpers.Spline;
import BezierCurveSegment = Helpers.BezierCurveSegment;

module Drawing {

    /**
     * This is the main drawing class - processes cursor states
     * and renders the lines on the blackboard.
     * This class uses SVG (http://www.w3.org/TR/SVG) for visualising the lines.
     */
    export class SVGDrawer implements IDrawingStrategy {
        
        /** SVG element */
        private svg: HTMLElement;
        
        /** The canvas UI element */
        private canvas: UI.SimpleElement;        
       
        /**
         * Allow acces to the canvas element. 
         */
        public GetCanvas() : UI.IElement {
            return this.canvas;
        }
       
        constructor() {
            this.svg = HTML.CreateElement("svg");
            this.canvas = new UI.SimpleElement(this.svg);          
            // stretch the SVG canvas as much as possible as soon as it knows where it is in the DOM
            // see http://www.w3.org/TR/2003/NOTE-DOM-Level-3-Events-20031107/DOM3-Events.html#events-event-DOMNodeInsertedIntoDocument
            this.svg.addEventListener("DOMNodeInsertedIntoDocument", this.Stretch);
            // settings will be set later
            this.settings = { 
                Color: "",
                Size: 0
            };
        }
    
        /** Prevousely drawn point. */
        private prevPoint: Vector2;
        
        /** Start point of next segment to be drawn. */
        private start: Vector2;
        
        /** Next start point radius */
        private startRadius: number;
            
        /** End point of next segment drawing. */
        private end: Vector2;
        
        /** Next end point radius. */
        private endRadius: number;
        
        /** The point following next segment end */
        private nextPoint: Vector2;
    
        /** Last state received. */
        private lastState: CursorState;    
        
        /** The dot at the end of a line. */
        private endDot: Element;
    
        /**  */
        private isOnlyClick: boolean;
    
        /** Current brush settings */
        private settings: BrushSettings;
        
        /**
         * Set current brush size
         * @param   size    The new size of the brush (line thickness)
         */
        public SetBrushSize(size: number): void {
            this.settings.Size = size;
        }
        
        /**
         * Set current brush color
         * @param   color   The new color of the brush
         */
        public SetBrushColor(color: string): void {
            this.settings.Color = color;
        }

        /** Currently drawn path */
        private path: Path;
    
    
        /**
         * This method should stretch the canvas to fill it's container.
         * Stretch mus be called after the SVG element is inserted into the DOM. 
         */
        public Stretch(e: MutationEvent): void {
            // this is event handler - "this" isn't SVGDrawer here! 
            var svg: HTMLElement = <HTMLElement> e.target;
            var parent = svg.parentElement;
            var width: number = parent.clientWidth;
            var height: number = parent.clientHeight;
            
            Helpers.HTML.SetAttributes(svg, {
                width: width,
                height: height 
            });
            VideoEvents.trigger(VideoEventType.CanvasSize, width, height);      
        }
    
        /**
         * Process next state and 
         */
        public ProcessNewState(cursor: CursorState): void {
            var nextPoint = new Vector2(cursor.X, cursor.Y);            
            if (cursor.Pressure > 0) {
                if (!this.lastState || this.lastState.Pressure === 0) {
                    this.StartLine(nextPoint, cursor.Pressure);
                } else {
                    this.ContinueLine(nextPoint, cursor.Pressure);
                }
            } else if (this.lastState && cursor.Pressure > 0) {
                this.EndLine(nextPoint);
                this.Render(); // force render
            }

            this.lastState = cursor;
        }
        
        /**
         * Change the DOM so it is rendered correctly.
         * This method is called from outside before screen is repainted
         * - don't change DOM too often.
         */
        public Render() : void {
            if(!!this.path) {
                this.path.UpdatePath();                
            }
        }
        
        /**
         * Make the canvas blank.
         */
        public ClearCanvas() : void {            
            // remove all drawn parts
            while(!!this.svg.firstChild) {
                this.svg.removeChild(this.svg.firstChild);
            }
            
            // dump currently drawn path
            this.path = null;
        }
    
        /**
         * Start drawing a line.
         * @param   point       Start point of the line.
         * @param   pressure    The pressure of the pointing device in this point.
         */
        private StartLine(point: Vector2, pressure: number): void {
            this.isOnlyClick = true;
    
            // start every line with a dot to make it nicely round
            var radius: number = this.CalculateRadius(pressure);
            var dot: Element = SVG.CreateDot(point, radius, this.GetCurrentBrushSettings().Color);
            this.svg.appendChild(dot);
    
            // prepare values for following line segments
            this.prevPoint = point.clone();
            this.start = point.clone();
            this.startRadius = radius;
        }
    
        /**
         * Prolong the current line.
         * @param   nextPoint   Next point of the line.
         * @param   pressure    The pressure of the pointing device in this point.
         */
        private ContinueLine(nextPoint: Vector2, pressure: number): void {
            var radius: number = this.CalculateRadius(pressure);
            if (this.isOnlyClick) {
                // this is the second point of the line - only a dot was drawn so far
                if (this.PreparePath(nextPoint, radius)) {
                    this.isOnlyClick = false;
                    this.end = nextPoint.clone();
                    
                    // place a dot at the end
                    this.endDot = SVG.CreateDot(this.end, radius, this.GetCurrentBrushSettings().Color);
                    this.svg.appendChild(this.endDot);
                }
            }
            
            // save for next time - I have to know the position of one point following to draw the curve nicely              
            this.nextPoint = nextPoint;
            
            // just draw another segment of the line
            this.DrawSegment();
            
            // shift points
            this.startRadius = this.endRadius;
            this.endRadius = radius;
            this.prevPoint = this.start;
            this.start = this.end;
            this.end = this.nextPoint;
        }
    
        /**
         * Convert pressure to brush radius according to current brush settings and pointing device pressure. Pointing device pressure value in the range of [0;1]
         * @param pressure  	Pointing device pressure
         */
        private CalculateRadius(pressure: number): number {
            return (pressure * this.GetCurrentBrushSettings().Size) / 2;
        }
   
        /**
         * Current brush settings
         * @return {object} Settings.
         */
        private GetCurrentBrushSettings(): BrushSettings {
            return this.settings;
        }
    
        /**
         *
         * @param   {Vector2}   nextPoint   The point where the path will start
         * @param   {number}    radius      Start radius
         * @returns {boolean}   True if preparations went well, false otherwise.
         */
        private PreparePath(nextPoint: Vector2, radius: number): boolean {
            // calculate starting points
            var direction: Vector2 = nextPoint.subtract(this.start);
            if (direction.X === 0 && direction.Y === 0) {
                return false; // mouse hasn't moved a bit
            }
                
            // start a new path and prepare both top and bottom path strings
            this.path = new Path(this.GetCurrentBrushSettings().Color);
            this.svg.appendChild(this.path.Element);
    
            // position the start points
            var normal: Vector2 = direction.getNormal().scale(radius);
            this.path.PreparePath(this.start, normal);

            return true;
        }
    
        /**
         * Draw the following sement of the line
         */
        private DrawSegment(): void {
            // calculate normal vector
            var direction: Vector2 = this.end.subtract(this.start);
            if (direction.X === 0 && direction.Y === 0) {
                return; // distance between start and end is zero
            }

            var normal: Vector2 = direction.getNormal();
            var startNormal: Vector2 = normal.scale(this.startRadius);
            var endNormal: Vector2 = normal.scale(this.endRadius);

            if (direction.getSize() > this.startRadius + this.endRadius) {
                var spline: BezierCurveSegment = Spline.catmullRomToBezier(this.prevPoint, this.start, this.end, this.nextPoint);
                this.path.DrawCurvedSegment(spline, startNormal, endNormal);
            } else {
                // the points are too close to each other
                this.path.DrawStraightSegment(this.start, startNormal, this.end, endNormal);
            }

            this.MoveEndDot(this.end, this.endRadius);
        }
    
        /**
         * Ends currently drawn line.
         * @param {Vector2} pos Position of mouse when pressure dropped to 0.
         */
        private EndLine(position: Vector2): void {
            if (!this.isOnlyClick) {
                // draw the last missing segment
                this.DrawSegment();
            }
        }
    
        /**
         * Move the dot and resize it according it to current state.
         * @param {Vector2} center  Center position
         * @param {number}  radius  Dot radius.
         */
        private MoveEndDot(center: Vector2, radius: number): void {
            SVG.SetAttributes(this.endDot, {
                "cx": center.X,
                "cy": center.Y,
                "r": radius
            });
        }
    }
    
    
    /**
     * Reperesnts one path.
     */
    class Path {
        
        /** SVG path element */
        private element: Element;
        get Element(): Element { return this.element;  }

        /**
         * The resulting path is in fact made from two "paralell" paths with variable variable distance from each other.
         * The variable distance helps creating the effect of the pressure sensitive line.
         * 
         *  	top: M -->-- C -->-- ... -->-- L
         *           |                         | }
         *           A   	                   V }- a "cap" 
         *           |                         | }
         *  botttom: Z --<-- C --<-- ... --<-- L
         * 
         * ... well I am no artist, but this might explain the composition of the path at least a bit.  
         */
        private top: TopPathSegment;
        private bottom: BottomPathSegment;
        
        /** Last path end */
        private end: Vector2;
        
        /** Last normal in the end point */
        private endNormal: Vector2;

        constructor(color: string) {            
            this.element = SVG.CreateElement("path", {
                fill: color,
                stroke: "transparent"
            });
            
        }

        PreparePath(start: Vector2, normal: Vector2): void {
            this.top = new TopPathSegment(start.add(normal));
            this.bottom = new BottomPathSegment(start.subtract(normal));
            this.end = start;
            this.endNormal = normal;
        }

        DrawCurvedSegment(spline: BezierCurveSegment, startNormal: Vector2, endNormal: Vector2): void {
            this.top.DrawCurvedSegment(spline, startNormal, endNormal);
            this.bottom.DrawCurvedSegment(spline, startNormal, endNormal);
        }

        DrawStraightSegment(start: Vector2, startNormal: Vector2, end: Vector2, endNormal: Vector2): void {
            this.top.DrawStraightSegment(start, startNormal, end, endNormal);
            this.bottom.DrawStraightSegment(start, startNormal, end, endNormal);
            this.end = end;
            this.endNormal = endNormal;
        }

        public UpdatePath(): void {
            var cap: string = SVG.LineToString(this.end.add(this.endNormal));
            var path: string = this.top.GetPath() + " " + cap + " " + this.bottom.GetPath();
            SVG.SetAttributes(this.element, { d: path });
        }

    }
    
    /**
     * Abstraction of a path segment.
     */
    interface IPathSegment {
        GetPath(): string;
        DrawCurvedSegment(segment: BezierCurveSegment, startNormal: Vector2, endNormal: Vector2): void;
        DrawStraightSegment(start: Vector2, startNormal: Vector2, end: Vector2, endNormal: Vector2): void;
    }
        
    /**
     * The "top" segment is the main spline PLUS normal in main spline control points. 
     * It is built "straignt-forward"
     */
    class TopPathSegment implements IPathSegment {
        private path: string;
        GetPath(): string { return this.path; }

        constructor(start: Vector2) {
            this.path = SVG.MoveToString(start) + " ";
        }

        DrawCurvedSegment(segment: BezierCurveSegment, startNormal: Vector2, endNormal: Vector2): void {
            this.path += " " + SVG.CurveToString(segment.StartCP.add(startNormal), segment.EndCP.add(endNormal), segment.End.add(endNormal));
        }

        DrawStraightSegment(start: Vector2, startNormal: Vector2, end: Vector2, endNormal: Vector2): void {
            this.path += " " + SVG.LineToString(end.add(endNormal));
        }
    }
    
    /**
     * The "bottom" segment is the main spline MINUS the normal in main spline control points.
     * It is build "backwards".
     */
    class BottomPathSegment implements IPathSegment {
        private path: string;
        GetPath(): string { return this.path; }

        constructor(start: Vector2) {
            this.path = SVG.LineToString(start) + " Z";
        }

        DrawCurvedSegment(segment: BezierCurveSegment, startNormal: Vector2, endNormal: Vector2): void {
            this.path = SVG.CurveToString(segment.EndCP.add(endNormal), segment.StartCP.add(startNormal), segment.Start.add(startNormal)) + " " + this.path;
        }

        DrawStraightSegment(start: Vector2, startNormal: Vector2, end: Vector2, endNormal: Vector2): void {
            this.path += " " + SVG.LineToString(start.add(startNormal));
        }
    }

}