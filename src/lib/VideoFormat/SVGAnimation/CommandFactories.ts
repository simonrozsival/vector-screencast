import Chunk, { EraseChunk, PathChunk, VoidChunk } from '../../VideoData/Chunk';
import { Command, MoveCursor, ChangeBrushColor, ChangeBrushSize, ClearCanvas, DrawNextSegment, AddComponent, RemoveComponent, ComponentCommand } from '../../VideoData/Command';
import { SVGA } from '../../Helpers/SVG';
import { precise } from '../../Helpers/HelperFunctions';
import Color from '../../UI/Color';
import BrushSize from '../../UI/Brush';
import { ComponentParams } from '../../Components/Component';


//namespace VectorScreencast.VideoFormat.SVGAnimation {
		
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
	export default class CommandFactory {		
		constructor(protected next?: CommandFactory) { }
		
		/**
		 * Convert SVG to a command.
		 * @param	node		SVG element
		 * @param	chunkStart	Time of parent chunk start.
		 * @return				The command
		 * @throws				Error
		 */		
		FromSVG(node: Node, chunkStart: number): Command {
			if(!!this.next) {
				return this.next.FromSVG(node, chunkStart);
			}
			
			throw new Error(`Command loading failed: Unsupported node ${node.nodeName}.`) 
		}
		
		protected get CmdTimeParamName(): string { return "t"; }
		
		protected getCmdTime(el: Node, chunkStart: number): number {
			return SVGA.numAttr(el, this.CmdTimeParamName, 0) + chunkStart;
		}
				
		/**
		 * Convert command to SVG element.
		 * @param	cmd		The command
		 * @return			SVG element
		 * @throws			Error
		 */		
		ToSVG(cmd: Command, chunkStart: number): Node {
			if(!!this.next) {
				return this.next.ToSVG(cmd, chunkStart);
			}
			
			throw new Error(`Command export failed: Unsupported command ${typeof cmd}.`);
		}
		
		/**
		 * 
		 */
		protected storeTime(el: Node, time: number) {
			if(time > 0) {
				let params: { [index: string]: any } = {};
				params[this.CmdTimeParamName] = precise(time, TIME_PRECISION);
				SVGA.SetAttributes(el, params);
			}
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
		FromSVG(node: Node, chunkStart: number): Command {
			if(node.localName === MoveCursorFactory.NodeName) {
				return new MoveCursor(SVGA.numAttr(node, "x"), SVGA.numAttr(node, "y"), SVGA.numAttr(node, "p", 0), super.getCmdTime(node, chunkStart));
			}
			
			// else pass through the chain of responsibility
			return super.FromSVG(node, chunkStart);
		}		
		
		/**
		 * Convert command to SVG element.
		 * @param	cmd		The command
		 * @return			SVG element
		 * @throws			Error
		 */		
		ToSVG(cmd: Command, chunkStart: number): Node {
			if(cmd instanceof MoveCursor) {
				var options: any = {
					"x": precise(cmd.X),
					"y": precise(cmd.Y)
				};
				if(cmd.P > 0) {
					options["p"] = precise(cmd.P, PRESSURE_PRECISION);
				}
				
				var cmdEl = SVGA.CreateElement(MoveCursorFactory.NodeName, options);					
				super.storeTime(cmdEl, cmd.Time - chunkStart);
				return cmdEl;
			}
			
			// else pass through the chain of responsibility
			return super.ToSVG(cmd, chunkStart);
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
		FromSVG(node: Node, chunkStart: number): Command {
			if(node.localName === DrawSegmentFactory.NodeName) {
				return new DrawNextSegment(super.getCmdTime(node, chunkStart));
			}
			
			// else pass through the chain of responsibility
			return super.FromSVG(node, chunkStart);
		}
		
		/**
		 * Convert command to SVG element.
		 * @param	cmd		The command
		 * @return			SVG element
		 * @throws			Error
		 */		
		ToSVG(cmd: Command, chunkStart: number): Node {
			if(cmd instanceof DrawNextSegment) {
				var cmdEl = SVGA.CreateElement(DrawSegmentFactory.NodeName);					
				super.storeTime(cmdEl, cmd.Time - chunkStart);
				return cmdEl;
			}
			
			// else pass through the chain of responsibility
			return super.ToSVG(cmd, chunkStart);
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
		FromSVG(node: Node, chunkStart: number): Command {
			if(node.localName === ChangeBrushColorFactory.NodeName) {
				return new ChangeBrushColor(new Color(SVGA.attr(node, "c")), super.getCmdTime(node, chunkStart));
			}
			
			// else pass through the chain of responsibility
			return super.FromSVG(node, chunkStart);
		}
		
		/**
		 * Convert command to SVG element.
		 * @param	cmd		The command
		 * @return			SVG element 
		 * @throws			Error
		 */		
		ToSVG(cmd: Command, chunkStart: number): Node {
			if(cmd instanceof ChangeBrushColor) {
				var cmdEl = SVGA.CreateElement(ChangeBrushColorFactory.NodeName, {
					"c": cmd.Color.CssValue
				});
					
				super.storeTime(cmdEl, cmd.Time - chunkStart);
				return cmdEl;
			}
			
			// else pass through the chain of responsibility
			return super.ToSVG(cmd, chunkStart);
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
		FromSVG(node: Node, chunkStart: number): Command {
			if(node.localName === ChangeBrushSizeFactory.NodeName) {
				return new ChangeBrushSize(new BrushSize(SVGA.numAttr(node, "w")), super.getCmdTime(node, chunkStart));
			}
			
			// else pass through the chain of responsibility
			return super.FromSVG(node, chunkStart);
		}
		
		/**
		 * Convert command to SVG element.
		 * @param	cmd		The command
		 * @return			SVG element
		 * @throws			Error
		 */		
		ToSVG(cmd: Command, chunkStart: number): Node {
			if(cmd instanceof ChangeBrushSize) {
				var cmdEl = SVGA.CreateElement(ChangeBrushSizeFactory.NodeName, {
					"w": cmd.Size.Size
				});				
				super.storeTime(cmdEl, cmd.Time - chunkStart);
				return cmdEl;
			}
			
			// else pass through the chain of responsibility
			return super.ToSVG(cmd, chunkStart);
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
		FromSVG(node: Node, chunkStart: number): Command {
			if(node.localName === ClearCanvasFactory.NodeName) {
				return new ClearCanvas(new Color(SVGA.attr(node, "c")), super.getCmdTime(node, chunkStart));
			}
			
			// else pass through the chain of responsibility
			return super.FromSVG(node, chunkStart);
		}
		
		/**
		 * Convert command to SVG element.
		 * @param	cmd		The command
		 * @return			SVG element
		 * @throws			Error
		 */		
		ToSVG(cmd: Command, chunkStart: number): Node {
			if(cmd instanceof ClearCanvas) {
				var cmdEl = SVGA.CreateElement(ClearCanvasFactory.NodeName, {
					"c": cmd.Color.CssValue
				});
				super.storeTime(cmdEl, cmd.Time - chunkStart);
				return cmdEl;
			}
			
			// else pass through the chain of responsibility
			return super.ToSVG(cmd, chunkStart);
		}
	}
	
	
	export class AddComponentFactory extends CommandFactory {
		/** SVG tag name */
		private static NodeName: string = "add-component";
		
		FromSVG(node: Node, chunkStart: number): Command {
			if(node.localName === AddComponentFactory.NodeName) {				
				let attrs: Attr[] = SVGA.attrs(node);
				let params: ComponentParams = {};
				attrs.forEach(el => params[el.name] = el.value);						
				return new AddComponent(SVGA.attr(node, "type"), SVGA.attr(node, "id"), params, this.getCmdTime(node, chunkStart));
			}
			return super.FromSVG(node, chunkStart);
		}
		
		ToSVG(cmd: Command, chunkStart: number): Node {
			if(cmd instanceof AddComponent) {
				let cmdEl = SVGA.CreateElement(AddComponentFactory.NodeName, cmd.Params);
				super.storeTime(cmdEl, cmd.Time - chunkStart);				
				return cmdEl;
			}
			
			return super.ToSVG(cmd, chunkStart);
		}
	}
		
	export class RemoveComponentFactory extends CommandFactory {
		/** SVG tag name */
		private static NodeName: string = "remove-component";
		
		FromSVG(node: Node, chunkStart: number): Command {
			if(node.localName === RemoveComponentFactory.NodeName) {				
				return new RemoveComponent(SVGA.attr(node, "id"), this.getCmdTime(node, chunkStart));
			}
			return super.FromSVG(node, chunkStart);
		}
		
		ToSVG(cmd: Command, chunkStart: number): Node {
			if(cmd instanceof RemoveComponent) {
				let cmdEl = SVGA.CreateElement(RemoveComponentFactory.NodeName, { "id": cmd.Id });
				super.storeTime(cmdEl, cmd.Time - chunkStart);				
				return cmdEl;
			}
			
			return super.ToSVG(cmd, chunkStart);
		}
	}
	
	export class ComponentCommandFactory extends CommandFactory {
		/** SVG tag name */
		private static NodeName: string = "component-cmd";
		
		FromSVG(node: Node, chunkStart: number): Command {
			if(node.localName === ComponentCommandFactory.NodeName) {				
				let attrs: Attr[] = SVGA.attrs(node);
				let params: ComponentParams = {};
				attrs.forEach(el => {
					params[el.name] = el.value;
				});
						
				return new AddComponent(SVGA.attr(node, "target"), SVGA.attr(node, "cmd"), params, this.getCmdTime(node, chunkStart));
			}
			return super.FromSVG(node, chunkStart);
		}
		
		ToSVG(cmd: Command, chunkStart: number): Node {
			if(cmd instanceof ComponentCommand) {
				let cmdEl = SVGA.CreateElement(ComponentCommandFactory.NodeName, cmd.Params);
				super.storeTime(cmdEl, cmd.Time - chunkStart);				
				return cmdEl;
			}
			
			return super.ToSVG(cmd, chunkStart);
		}
	}
//}