/// <reference path="../../VectorScreencast" />

module VectorScreencast.VideoFormat.SVGAnimation {
	
	import Command = VideoData.Command;
	import MoveCursor = VideoData.MoveCursor;
	import ChangeBrushColor = VideoData.ChangeBrushColor;
	import ChangeBrushSize = VideoData.ChangeBrushSize;	
	import ClearCanvas = VideoData.ClearCanvas;	
	import DrawNextSegment = VideoData.DrawNextSegment;		
	
	import SVG = Helpers.SVG;
	import SVGA = Helpers.SVGA;
	
	import precise = Helpers.precise;
		
	/** Time precision is 10ns */
    const TIME_PRECISION = 2;
	/** Coordinate precison is 1/1000 of a "pixel" */
    const COORDS_PRECISION = 3;
	/** Pressure precision is 1/10000 */
	const PRESSURE_PRECISION = 4;
	
	/**
	 * CommandFactory is the basis of "Chain of responsibility" pattern implementation.
	 * Derived classes are used to convert commands to or from SVG nodes.
	 */	
	export class CommandFactory {		
		constructor(protected next?: CommandFactory) { }
		
		/**
		 * Convert SVG to a command.
		 * @param	node	SVG element
		 * @return			The command
		 * @throws			Error
		 */		
		FromSVG(node: Node): Command {
			if(!!this.next) {
				return this.next.FromSVG(node);
			}
			
			throw new Error(`Command loading failed: Unsupported node ${node.nodeName}.`) 
		}
				
		/**
		 * Convert command to SVG element.
		 * @param	cmd		The command
		 * @return			SVG element
		 * @throws			Error
		 */		
		ToSVG(cmd: Command): Node {
			if(!!this.next) {
				return this.next.ToSVG(cmd);
			}
			
			throw new Error(`Command export failed: Unsupported command ${typeof cmd}.`);
		}
	}
	
	/**
	 * SVG <-> Command factory for cursor movement commands.
	 */
	export class MoveCursorFactory extends CommandFactory {
		/** SVG tag name */
		private static NodeName: string = "m";
		
		/**
		 * Convert SVG to a cursor movement command.
		 * @param	node	SVG element
		 * @return			The command
		 * @throws			Error
		 */		
		FromSVG(node: Node): Command {
			if(node.localName === MoveCursorFactory.NodeName) {
				return new MoveCursor(SVGA.numAttr(node, "x"), SVGA.numAttr(node, "y"), SVGA.numAttr(node, "p", 0), SVGA.numAttr(node, "t"));
			}
			
			// else pass through the chain of responsibility
			return super.FromSVG(node);
		}		
		
		/**
		 * Convert command to SVG element.
		 * @param	cmd		The command
		 * @return			SVG element
		 * @throws			Error
		 */		
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
		
	
	/**
	 * SVG <-> Command factory for 'draw next segment' commands.
	 */
	export class DrawSegmentFactory extends CommandFactory {
		/** SVG tag name */
		private static NodeName: string = "d";
				
		/**
		 * Convert SVG to a segment drawing command.
		 * @param	node	SVG element
		 * @return			The command
		 * @throws			Error
		 */		
		FromSVG(node: Node): Command {
			if(node.localName === DrawSegmentFactory.NodeName) {
				return new DrawNextSegment(SVGA.numAttr(node, "t"));
			}
			
			// else pass through the chain of responsibility
			return super.FromSVG(node);
		}
		
		/**
		 * Convert command to SVG element.
		 * @param	cmd		The command
		 * @return			SVG element
		 * @throws			Error
		 */		
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
	
	
	/**
	 * SVG <-> Command factory for 'change brush color' commands.
	 */
	export class ChangeBrushColorFactory extends CommandFactory {
		/** SVG tag name */
		private static NodeName: string = "c";
		
		/**
		 * Convert SVG to a brush color changing command.
		 * @param	node	SVG element
		 * @return			The command
		 * @throws			Error
		 */		
		FromSVG(node: Node): Command {
			if(node.localName === ChangeBrushColorFactory.NodeName) {
				return new ChangeBrushColor(new UI.Color(SVGA.attr(node, "c")), SVGA.numAttr(node, "t"));
			}
			
			// else pass through the chain of responsibility
			return super.FromSVG(node);
		}
		
		/**
		 * Convert command to SVG element.
		 * @param	cmd		The command
		 * @return			SVG element
		 * @throws			Error
		 */		
		ToSVG(cmd: Command): Node {
			if(cmd instanceof ChangeBrushColor) {
				return SVGA.CreateElement(ChangeBrushColorFactory.NodeName, {
					"c": cmd.Color.CssValue,
					"t": precise(cmd.Time, TIME_PRECISION)
				});
			}
			
			// else pass through the chain of responsibility
			return super.ToSVG(cmd);
		}
	}
	
	
	
	/**
	 * SVG <-> Command factory for 'change brush size' commands.
	 */
	export class ChangeBrushSizeFactory extends CommandFactory {
		/** SVG tag name */
		private static NodeName: string = "s";
				
		/**
		 * Convert SVG to a brush size changing command.
		 * @param	node	SVG element
		 * @return			The command
		 * @throws			Error
		 */		
		FromSVG(node: Node): Command {
			if(node.localName === ChangeBrushSizeFactory.NodeName) {
				return new ChangeBrushSize(new UI.BrushSize(SVGA.numAttr(node, "w")), SVGA.numAttr(node, "t"));
			}
			
			// else pass through the chain of responsibility
			return super.FromSVG(node);
		}
		
		/**
		 * Convert command to SVG element.
		 * @param	cmd		The command
		 * @return			SVG element
		 * @throws			Error
		 */		
		ToSVG(cmd: Command): Node {
			if(cmd instanceof ChangeBrushSize) {
				return SVGA.CreateElement(ChangeBrushSizeFactory.NodeName, {
					"w": cmd.Size.Size,
					"t": precise(cmd.Time, TIME_PRECISION)
				});
			}
			
			// else pass through the chain of responsibility
			return super.ToSVG(cmd);
		}
	}
	
	
	
	/**
	 * SVG <-> Command factory for 'clear canvas' commands.
	 */
	export class ClearCanvasFactory extends CommandFactory {
		/** SVG tag name */
		private static NodeName: string = "e";
		
		/**
		 * Convert SVG to a clear canvas command.
		 * @param	node	SVG element
		 * @return			The command
		 * @throws			Error
		 */		
		FromSVG(node: Node): Command {
			if(node.localName === ClearCanvasFactory.NodeName) {
				return new ClearCanvas(new UI.Color(SVGA.attr(node, "c")), SVGA.numAttr(node, "t"));
			}
			
			// else pass through the chain of responsibility
			return super.FromSVG(node);
		}
		
		/**
		 * Convert command to SVG element.
		 * @param	cmd		The command
		 * @return			SVG element
		 * @throws			Error
		 */		
		ToSVG(cmd: Command): Node {
			if(cmd instanceof ClearCanvas) {
				return SVGA.CreateElement(ClearCanvasFactory.NodeName, {
					"t": precise(cmd.Time, TIME_PRECISION),
					"c": cmd.Color.CssValue
				});
			}
			
			// else pass through the chain of responsibility
			return super.ToSVG(cmd);
		}
	}
}