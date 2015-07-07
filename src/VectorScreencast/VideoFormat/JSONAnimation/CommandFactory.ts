/// <reference path="../../VectorScreencast" />

module VectorScreencast.VideoFormat.JSONAnimation {
	
	import Command = VideoData.Command;
	import MoveCursor = VideoData.MoveCursor;
	import ChangeBrushColor = VideoData.ChangeBrushColor;
	import ChangeBrushSize = VideoData.ChangeBrushSize;	
	import ClearCanvas = VideoData.ClearCanvas;	
	import DrawNextSegment = VideoData.DrawNextSegment;		
	
	import SVG = Helpers.SVG;
	import SVGA = Helpers.SVGA;
	
	import precise = Helpers.precise;
	import maxDecPlaces = Helpers.maxDecPlaces;
		
    const TIME_PRECISION = 2;
    const COORDS_PRECISION = 3;
	const PRESSURE_PRECISION = 4;
	
	export interface CommandJSONFormat {
		n: string, 
		t: number
	}
	
	interface MoveCommandJSONFormat extends CommandJSONFormat {
		x: number,
		y: number,
		p?: number
	}	
	
	interface DrawSegmentJSONFormat extends CommandJSONFormat {
	}
		
	interface ChangeBrushColorJSONFormat extends CommandJSONFormat {
		c: string
	}
		
	interface ChangeBrushSizeJSONFormat extends CommandJSONFormat {
		d: number,
		u: string
	}
	
	interface ClearCanvasJSONFormat extends CommandJSONFormat {
		c: string
	}
	
	/**
	 * CommandFactory is the basis of "Chain of responsibility" pattern implementation.
	 * Derived classes are used to convert commands to or from SVG nodes.
	 */
	
	export class CommandFactory {		
		constructor(protected next?: CommandFactory) { }		
		FromJSON(node: any): Command {
			if(!!this.next) {
				return this.next.FromJSON(node);
			}
			
			throw new Error(`Command loading failed: Unsupported node ${node.nodeName}.`) 
		}
		
		ToJSON(cmd: Command): CommandJSONFormat {
			if(!!this.next) {
				return this.next.ToJSON(cmd);
			}
			
			throw new Error(`Command export failed: Unsupported command ${typeof cmd}.`);
		}
	}
	
	export class MoveCursorFactory extends CommandFactory {
		private static TypeName: string = "m";
		
		FromJSON(node: any): Command {
			if(node.hasOwnProperty("n") === true
				&& node.hasOwnProperty("t") === true				
				&& node.hasOwnProperty("x") === true
				&& node.hasOwnProperty("y") === true
				&& node.n === MoveCursorFactory.TypeName) {
					
				return new MoveCursor(node.x, node.y, node.p || 0, node.t);
			}
			
			// else pass through the chain of responsibility
			return super.FromJSON(node);
		}
		
		ToJSON(cmd: Command): CommandJSONFormat {
			if(cmd instanceof MoveCursor) {
				var options: MoveCommandJSONFormat = {
					"n": MoveCursorFactory.TypeName,
					"x": maxDecPlaces(cmd.X),
					"y": maxDecPlaces(cmd.Y),
					"t": maxDecPlaces(cmd.Time, TIME_PRECISION)
				};
				if(cmd.P > 0) {
					options["p"] = maxDecPlaces(cmd.P, PRESSURE_PRECISION);
				}
				
				return options;
			}
			
			// else pass through the chain of responsibility
			return super.ToJSON(cmd);
		}
	}
		
	export class DrawSegmentFactory extends CommandFactory {
		private static TypeName: string = "d";
		
		FromJSON(node: any): Command {
			if(node.hasOwnProperty("n") === true
				&& node.hasOwnProperty("t") === true
				&& node.n === DrawSegmentFactory.TypeName) {
					
				return new DrawNextSegment(node.t);
			}
			
			// else pass through the chain of responsibility
			return super.FromJSON(node);
		}
		
		ToJSON(cmd: Command): CommandJSONFormat {
			if(cmd instanceof DrawNextSegment) {
				var options: DrawSegmentJSONFormat = {
					"n": DrawSegmentFactory.TypeName,
					"t": maxDecPlaces(cmd.Time, TIME_PRECISION)
				};
				
				return options;
			}
			
			// else pass through the chain of responsibility
			return super.ToJSON(cmd);
		}
	}
	
	export class ChangeBrushColorFactory extends CommandFactory {		
		private static TypeName: string = "c";
				
		FromJSON(node: any): Command {
			if(node.hasOwnProperty("n") === true
				&& node.hasOwnProperty("t") === true
				&& node.hasOwnProperty("c") === true
				&& node.n === ChangeBrushColorFactory.TypeName) {
					
				return new ChangeBrushColor(new UI.Color("", node.c), node.t);
			}
			
			// else pass through the chain of responsibility
			return super.FromJSON(node);
		}
		
		ToJSON(cmd: Command): CommandJSONFormat {
			if(cmd instanceof ChangeBrushColor) {
				var options: ChangeBrushColorJSONFormat = {
					"n": ChangeBrushColorFactory.TypeName,
					"t": maxDecPlaces(cmd.Time, TIME_PRECISION),
					"c": cmd.Color.CssValue
				};
				
				return options;
			}
			
			// else pass through the chain of responsibility
			return super.ToJSON(cmd);
		}
	}
	
	
	export class ChangeBrushSizeFactory extends CommandFactory {
		private static TypeName: string = "s";
				
		FromJSON(node: any): Command {
			if(node.hasOwnProperty("n") === true
				&& node.hasOwnProperty("t") === true
				&& node.hasOwnProperty("d") === true
				&& node.hasOwnProperty("u") === true
				&& node.n === ChangeBrushSizeFactory .TypeName) {
					
				return new ChangeBrushSize(new UI.BrushSize("", node.d, node.u), node.t);
			}
			
			// else pass through the chain of responsibility
			return super.FromJSON(node);
		}
		
		ToJSON(cmd: Command): CommandJSONFormat {
			if(cmd instanceof ChangeBrushSize) {
				var options: ChangeBrushSizeJSONFormat = {
					"n": ChangeBrushSizeFactory.TypeName,
					"t": maxDecPlaces(cmd.Time, TIME_PRECISION),
					"d": maxDecPlaces(cmd.Size.Size, 2),
					"u": cmd.Size.Unit
				};
				
				return options;
			}
			
			// else pass through the chain of responsibility
			return super.ToJSON(cmd);
		}
	}
	
	export class ClearCanvasFactory extends CommandFactory {
		private static TypeName: string = "e";
		
		FromJSON(node: any): Command {
			if(node.hasOwnProperty("n") === true
				&& node.hasOwnProperty("t") === true
				&& node.hasOwnProperty("c") === true
				&& node.n === ClearCanvasFactory.TypeName) {
					
				return new ClearCanvas(node.t, new UI.Color("", node.c));
			}
			
			// else pass through the chain of responsibility
			return super.FromJSON(node);
		}
		
		ToJSON(cmd: Command): CommandJSONFormat {
			if(cmd instanceof ClearCanvas) {
				var options: ClearCanvasJSONFormat = {
					"n": ClearCanvasFactory.TypeName,
					"t": maxDecPlaces(cmd.Time, TIME_PRECISION),
					"c": cmd.Color.CssValue
				};
				
				return options;
			}
			
			// else pass through the chain of responsibility
			return super.ToJSON(cmd);
		}
	}
}