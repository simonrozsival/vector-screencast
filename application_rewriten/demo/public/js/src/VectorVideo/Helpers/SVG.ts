/// <reference path="vector.ts" />
/// <reference path="HTML.ts" />

/**
 * SVG helper
 * @type {{namespace: string, dot: Function, circle: Function, line: Function, createElement: Function, setAttributes: Function, moveToString: Function, lineToString: Function, curveToString: Function}}
 */
module Helpers {

    export class SVG {
        
        /** XML namespace of SVG */
        private static namespace: string = "http://www.w3.org/2000/svg";
        public static get Namespace(): string { return this.namespace; }
        
        /**
         * Creates a filled circle on the canvas.
         * @param   center  Dot center position vector.
         * @param   radius  Dot radius.
         * @param   coor    Dot fill color. 
         */
        public static CreateDot(center: Vector2, radius: number, color: string): Element {
            return this.CreateElement("circle", {
                cx: center.X,
                cy: center.Y,
                r: radius,
                fill: color,
                stroke: "transparent"
            });
        }
        
        /**
         * Create a circle with a specific center, radius and stroke color.
         * @param   center  Circle center position vector.
         * @param   radius  Circle radius.
         * @param   coor    Circumference stroke color.
         */
        public static CreateCircle(center: Vector2, radius: number, color: string): Element {
            if (radius > 0) {
                return this.CreateElement("circle", {
                    cx: center.X,
                    cy: center.Y,
                    r: radius,
                    stroke: color,
                    fill: "transparent",
                    "stroke-width": 1
                });
            }

            return null;
        }
        
        /**
         * Create line element.
         * @param   start   Starting point of the line
         * @param   end     Ending point of the line
         * @param   width   Line thickness in pixels (relative to parent SVG width and height)
         * @param   color   Line stroke color
         */
        public static CreateLine(start: Vector2, end: Vector2, width: number, color: string): Element {
            if (width > 0) {
                return this.CreateElement("path", {
                    fill: "transparent",
                    stroke: color,
                    "stroke-width": width,
                    d: this.MoveToString(start) + " " + this.LineToString(end)
                });
            }

            return null;
        }
        
        /**
         * Creates an element with specified properties.
         */
        public static CreateElement(name: string, attributes?: IAttributes): Element {
            var el = document.createElementNS(this.namespace, name);
            if (!!attributes) { // convert to boolean
                this.SetAttributes(el, attributes);
            }

            return el;
        }
        
        /**
         * Assign a set of attributes to an element.
         * @param   el          The element
         * @param   attributes  The set of attributes
         */
        public static SetAttributes(el: Element, attributes: IAttributes): void {
            if(!el) {
                console.log(attributes);
            }
            
            for (var attr in attributes) {
                el.setAttributeNS(null, attr, attributes[attr]);
            }
        }
        
        
        /**
         * Returns string for SVG path - move to the given point without drawing anything.
         * @param   a   End point
         */
        public static MoveToString(a: Vector2): string {
            return `M ${a.X},${a.Y}`;
        }
        
        /**
         * Returns string for SVG path - draw line from current point to the given one.
         * @param   a   End point
         */
        public static LineToString(a: Vector2): string {
            return `L ${a.X},${a.Y}`;
        }
        
        /**
         * Returns string for SVG path - draw a cubic Bézier curfe from current point to point c using control points a and b.
         * @param   a   Control point adjecent to the start
         * @param   b   Control point adjecent to the end
         * @param   c   The end point of the curve
         */
        public static CurveToString(a: Vector2, b: Vector2, c: Vector2): string {
            return `C ${a.X},${a.Y} ${b.X},${b.Y} ${c.X},${c.Y}`;
        }
        
        /**
         * Returns string for SVG path - an arc
         */
        public static ArcString(end: Vector2, radius: number, startAngle: number): string {
            return `A ${radius},${radius} ${startAngle} 0,0 ${end.X},${end.Y}`;
        }

    }

}