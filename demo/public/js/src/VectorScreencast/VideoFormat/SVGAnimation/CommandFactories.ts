/// <reference path="../../Helpers/SVG" />
/// <reference path="../../VideoData/Command" />
/// <reference path="../../Helpers/HelperFunctions" />
/// <reference path="../../Helpers/SVG" />

module VideoFormat.SVGAnimation {
	
	import Command = VideoData.Command;
	import MoveCursor = VideoData.MoveCursor;
	import ChangeBrushColor = VideoData.ChangeBrushColor;
	import ChangeBrushSize = VideoData.ChangeBrushSize;	
	import ClearCanvas = VideoData.ClearCanvas;	
	import DrawNextSegment = VideoData.DrawNextSegment;		
	
	import SVG = Helpers.SVG;
	import SVGA = Helpers.SVGA;
	
	import precise = Helpers.precise;
		
    const TIME_PRECISION = 2;
    const COORDS_PRECISION = 3;
	const PRESSURE_PRECISION = 4;
	
	/**
	 * CommandFactory is the basis of "Chain of responsibility" pattern implementation.
	 * Derived classes are used to convert commands to or from SVG nodes.
	 */
	
	export class CommandFactory {		
		constructor(protected next?: CommandFactory) { }		
		FromSVG(node: Node): Command {
			if(!!this.next) {
				return this.next.FromSVG(node);
			}
			
			throw new Error(`Command loading failed: Unsupported node ${node.nodeName}.`) 
		}
		
		ToSVG(cmd: Command): Node {
			if(!!this.next) {
				return this.next.ToSVG(cmd);
			}
			
			throw new Error(`Command export failed: Unsupported command ${typeof cmd}.`);
		}
	}
	
	export class MoveCursorFactory extends CommandFactory {
		private static NodeName: string = "m";
		
		FromSVG(node: Node): Command {
			if(node.localName === MoveCursorFactory.NodeName) {
				return new MoveCursor(SVGA.numAttr(node, "x"), SVGA.numAttr(node, "y"), SVGA.numAttr(node, "p", 0), SVGA.numAttr(node, "t"));
			}
			
			// else pass through the chain of responsibility
			return super.FromSVG(node);
		}
		
		ToSVG(cmd: Command): Node {
			if(cmd instanceof MoveCursor) {
				var options: any = {
					"x": precise(cmd.X),
					"y": precise(cmd.Y),
					"t": precise(cmd.Time, TIME_PRECISION)
				};
				if(cmd.P > 0) {
					options["p"] = precise(cmd.P, PRESSURE_PRECISION);
				}
				
				return SVGA.CreateElement(MoveCursorFactory.NodeName, options);
			}
			
			// else pass through the chain of responsibility
			return super.ToSVG(cmd);
		}
	}
		
	export class DrawSegmentFactory extends CommandFactory {
		private static NodeName: string = "ds";
		
		FromSVG(node: Node): Command {
			if(node.localName === DrawSegmentFactory.NodeName) {
				return new DrawNextSegment(SVGA.numAttr(node, "t"));
			}
			
			// else pass through the chain of responsibility
			return super.FromSVG(node);
		}
		
		ToSVG(cmd: Command): Node {
			if(cmd instanceof DrawNextSegment) {
				return SVGA.CreateElement(DrawSegmentFactory.NodeName, {
					"t": precise(cmd.Time, TIME_PRECISION)
				});
			}
			
			// else pass through the chain of responsibility
			return super.ToSVG(cmd);
		}
	}
	
	export class ChangeBrushColorFactory extends CommandFactory {
		private static NodeName: string = "c";
		
		FromSVG(node: Node): Command {
			if(node.localName === ChangeBrushColorFactory.NodeName) {
				return new ChangeBrushColor(new UI.Color("", SVGA.attr(node, "d")), SVGA.numAttr(node, "t"));
			}
			
			// else pass through the chain of responsibility
			return super.FromSVG(node);
		}
		
		ToSVG(cmd: Command): Node {
			if(cmd instanceof ChangeBrushColor) {
				return SVGA.CreateElement(ChangeBrushColorFactory.NodeName, {
					"d": cmd.Color.CssValue,
					"t": precise(cmd.Time, TIME_PRECISION)
				});
			}
			
			// else pass through the chain of responsibility
			return super.ToSVG(cmd);
		}
	}
	
	
	export class ChangeBrushSizeFactory extends CommandFactory {
		private static NodeName: string = "s";
		
		FromSVG(node: Node): Command {
			if(node.localName === ChangeBrushSizeFactory.NodeName) {
				return new ChangeBrushSize(new UI.BrushSize("", SVGA.numAttr(node, "d"), SVGA.attr(node, "u")), SVGA.numAttr(node, "t"));
			}
			
			// else pass through the chain of responsibility
			return super.FromSVG(node);
		}
		
		ToSVG(cmd: Command): Node {
			if(cmd instanceof ChangeBrushSize) {
				return SVGA.CreateElement(ChangeBrushSizeFactory.NodeName, {
					"d": cmd.Size.Size,
					"u": cmd.Size.Unit,
					"t": precise(cmd.Time, TIME_PRECISION)
				});
			}
			
			// else pass through the chain of responsibility
			return super.ToSVG(cmd);
		}
	}
	
	export class ClearCanvasFactory extends CommandFactory {
		private static NodeName: string = "e";
		
		FromSVG(node: Node): Command {
			if(node.localName === ClearCanvasFactory.NodeName) {
				return new ClearCanvas(SVGA.numAttr(node, "t"), new UI.Color("", SVGA.attr(node, "color")));
			}
			
			// else pass through the chain of responsibility
			return super.FromSVG(node);
		}
		
		ToSVG(cmd: Command): Node {
			if(cmd instanceof ClearCanvas) {
				return SVGA.CreateElement(ClearCanvasFactory.NodeName, {
					"t": precise(cmd.Time, TIME_PRECISION),
					"color": cmd.Color.CssValue
				});
			}
			
			// else pass through the chain of responsibility
			return super.ToSVG(cmd);
		}
	}
}