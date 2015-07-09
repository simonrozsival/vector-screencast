/// <reference path="../../VectorScreencast" />


module VectorScreencast.VideoFormat.SVGAnimation {

	import SVG = Helpers.SVG;
	import SVGA = Helpers.SVGA;

	import Command = VideoData.Command;
	import Chunk = VideoData.Chunk;
	import VoidChunk = VideoData.VoidChunk;
	import PathChunk = VideoData.PathChunk;
	import EraseChunk = VideoData.EraseChunk;
	
	/** Time is in miliseconds */
	const TIME_PRECISION = 2;
		
	/**
	 * Typed array of init commands and regular commands
	 */
	interface CommandsPair extends Array<Array<Command>> {
		/** Init commands */
		0: Array<Command>;
		/** Commands of the chunk */
		1: Array<Command>;
	}	
	
	/**
	 * Typed array of commands. These are the last command instances of each (interesting) kind.
	 */
	interface InitCommands extends Array<Command> {
		/** Move cursor */
		0: VideoData.MoveCursor;
		/** Change brush color */
		1: VideoData.ChangeBrushColor;
		/** Change brush size */
		2: VideoData.ChangeBrushSize;
	}
		
	/**
	 * Chunk factories - implementing the chain of responsibility design pattern.
	 * ChunkFactory is the base class that moves to the next entity in the chain,
	 * until the end of the chain is reached. 
	 */
	export class ChunkFactory {
		constructor(protected next?: ChunkFactory) { }
		
		/**
		 * Create a chunk from an XML node.
		 */
		FromSVG(node: Node, cmdFactory: CommandFactory): Chunk {
			if (!!this.next) {
				return this.next.FromSVG(node, cmdFactory);
			}

			throw new Error(`Chunk loading failed: Unsupported node ${node.nodeName}.`)
		}

		/**
		 * Create an XML node form a chunk.
		 */
		ToSVG(chunk: Chunk, cmdFactory: CommandFactory): Node {
			if (!!this.next) {
				return this.next.ToSVG(chunk, cmdFactory);
			}

			throw new Error(`Chunk export failed: Unsupported command ${typeof (chunk) }.`);
		}
		
		/**
		 * Convert commands to SVG nodes.
		 */
		
		protected CommandsToSVG(node: Node, cmds: Array<Command>, cmdFactory: CommandFactory): Node {
			for (var i = 0; i < cmds.length; i++) {
				node.appendChild(cmdFactory.ToSVG(cmds[i]));
			}

			return node;
		}
		
		/**
		 * Commands parsing
		 */
		
		/**  */
		private static initCmds: InitCommands = [null, null, null];
		
		protected static GetCommands(cmd: Element, cmdFactory: CommandFactory): CommandsPair {
			var initCommands = this.initCmds;
			var cmds: Array<Command> = []; // loaded commands
						
			while (!!cmd) {
				var loadedCmd = cmdFactory.FromSVG(cmd);
				cmds.push(loadedCmd);
				cmd = cmd.nextElementSibling;
				
				// save the last instance of each command - to form init commands for the next chunk
				if(loadedCmd instanceof VideoData.MoveCursor) {
					this.initCmds[0] = loadedCmd;
				} else if (loadedCmd instanceof VideoData.ChangeBrushColor) {
					this.initCmds[1] = loadedCmd;
				} else if (loadedCmd instanceof VideoData.ChangeBrushSize) {
					this.initCmds[2] = loadedCmd;
				}
			}
			
			return [initCommands.filter((v) => v !== null), cmds];
		} 
	}

	/**
	 * Process an XML element and create a VoidChunk and vice versa.
	 */
	export class VoidChunkFactory extends ChunkFactory {
		/** The XML element type argument */
		private static NodeName: string = "void";

		/**
		 * Convert SVG element to a VoidChunk.
		 * @param	node		The element of th enode
		 * @param	cmdFactory 	Factory for processing commands
		 */
		FromSVG(node: Element, cmdFactory: CommandFactory): Chunk {
			if (SVGA.attr(node, "type") === VoidChunkFactory.NodeName) {
				var chunk: VoidChunk = new VoidChunk(SVGA.numAttr(node, "t"), 0); // 0 will be changed later in the IO class
				[chunk.InitCommands, chunk.Commands] = ChunkFactory.GetCommands(node.firstElementChild, cmdFactory);
				return chunk;
			}

			return super.FromSVG(node, cmdFactory);
		}

		/**
		 * Convert VoidChunk to a SVG element.
		 * @param	chunk		The chunk
		 * @parm	cmdFactory	Factory for converting commands to SVG elements 
		 */
		ToSVG(chunk: Chunk, cmdFactory: CommandFactory): Node {
			if (chunk instanceof VoidChunk) {
				var node: Node = SVG.CreateElement("g");
				SVGA.SetAttributes(node, {
					"type": VoidChunkFactory.NodeName,
					"t": chunk.StartTime.toFixed(TIME_PRECISION)
				});
				this.CommandsToSVG(node, chunk.Commands, cmdFactory);

				return node;
			}

			return super.ToSVG(chunk, cmdFactory);
		}
	}

	/**
	 * Types of SVG path instructions.
	 */
	enum InstructionType {
		Move,
		Line,
		Curve,
		Arc,
		Close
	}

	/**
	 * Instruction with the set of coordinates. 
	 */
	interface Instruction {
		/** Type of the instruction */
		type: InstructionType,
		/** Set of coordinates of this instruction */
		coords: Array<Helpers.Vector2>
	}

	/**
	 * Chain of responsibility for parsing path instructions from a string.
	 */
	class InstructionFactory {
		/**
		 * Create a factory for a specific SVG path instruction.
		 * @param	letter		The letter of the command in the SVG representation [M, L, C, A].
		 * @param	type		Type of the instruction this factory parses.
		 * @param	coordsCount	The count of coordinates that must follow after the instruction letter to make a valid instruction.
		 * @param	next		Next factory in the chain of responsibility.
		 */
		constructor(protected letter: string, protected type: InstructionType, protected coordsCount: number, protected next?: InstructionFactory) { }
		
		/**
		 * Process the array of split isntruction string and maybe create a new instruction. The array is shifted while processing.
		 * @param	c	Array of isntruction parts split by whitespaces
		 * @return		Next instruction
		 * @throws		Error
		 */
		Create(c: Array<string>): Instruction {
			var letter = c.shift();
			if (letter === this.letter) {
				var coords: Array<Helpers.Vector2> = [];
				for (var i = 0; i < this.coordsCount; i++) {
					coords.push(this.CreateVector2(c.shift()));
				}

				return {
					type: this.type,
					coords: coords
				};
			} else {
				if (!!this.next) {
					c.unshift(letter);
					return this.next.Create(c);
				}

				throw new Error(`Unsupported instruction letter '${letter}'`);
			}
		}

		/**
		 * Parse string of coordinates to a two dimensional vector.
		 * @return		A vector.
		 * @throws		Error
		 */
		protected CreateVector2(pair: string): Helpers.Vector2 {
			var coords: Array<string> = pair.split(",");
			if (coords.length !== 2) {
				throw new Error(`Coordinates pair '${pair}' is not valid`);
			}
			return new Helpers.Vector2(Number(coords[0]), Number(coords[1]));
		}
	}

	/**
	 * A specific instruction factory. It has specific parameters, so it must be handled in a different way.
	 */
	class ArcFactory extends InstructionFactory {
		/**
		 * @param	next	Next factory in the chain of responsibility.
		 */
		constructor(next?: InstructionFactory) {
			super("A", InstructionType.Arc, 3, next);
		}
		
		/**
		 * Process the array of split isntruction string and maybe create a new instruction. The array is shifted while processing.
		 * @param	c	Array of isntruction parts split by whitespaces
		 * @return		Next instruction
		 * @throws		Error
		 */
		Create(c: Array<string>): Instruction {
			var letter = c.shift();
			if (letter === this.letter) {
				var coords: Array<Helpers.Vector2> = [];
				coords.push(this.CreateVector2(c.shift()));
				c.shift(); // radius
				coords.push(this.CreateVector2(c.shift()));
				coords.push(this.CreateVector2(c.shift()));

				return {
					type: this.type,
					coords: coords
				};
			} else {
				if (!!this.next) {
					c.unshift(letter);
					return this.next.Create(c);
				}

				throw new Error(`Unsupported instruction letter '${letter}'`);
			}
		}
	}

	/**
	 * Process an XML element and create a specific chunk and vice versa.
	 */
	export class PathChunkFactory extends ChunkFactory {
		/** Name of the XML element */
		private static NodeName: string = "path";
		
		/** Factory for processing path data string */
		private instructionFactory: InstructionFactory;

		/**
		 * Initialises the factory for parsing path data string.
		 * @param	next	Next factory in the chain of responsibility.
		 */
		constructor(protected next?: ChunkFactory) {
			super(next);
			this.instructionFactory = new InstructionFactory("C", InstructionType.Curve, 3,
				new InstructionFactory("L", InstructionType.Line, 1,
					new InstructionFactory("M", InstructionType.Move, 1,
						new ArcFactory()
						)
					)
				);
		}

		/**
		 * Convert SVG element to a path chunk.
		 * @param	node		The element of th enode
		 * @param	cmdFactory 	Factory for processing commands
		 */
		FromSVG(node: Element, cmdFactory: CommandFactory): Chunk {
			if (SVGA.attr(node, "type") === PathChunkFactory.NodeName) {				
				// path chunk must have at least one child node
				if (node.childElementCount === 0) {
					throw new Error(`Path chunk no child elements.`);
				}
				
				// first child must be a PATH
				var pathNode: Element = node.firstElementChild;
				if (pathNode.localName !== "path") {
					throw new Error(`Path chunk must begin with a <path> element, but ${pathNode.localName} found instead`);
				}
				
				// now the chunk instance can be created
				var chunk: PathChunk = new PathChunk(this.SVGNodeToPath(pathNode), SVGA.numAttr(node, "t"), 0); // 0 will be changed to last erase later
				[chunk.InitCommands, chunk.Commands] = ChunkFactory.GetCommands(pathNode.nextElementSibling, cmdFactory);				

				return chunk;
			}

			return super.FromSVG(node, cmdFactory);
		}

		/**
		 * Convert chunk to SVG element if it is a PathChunk.
		 * @param	chunk		The chunk to process.
		 * @param	cmdFactory	Factory for converting commands to SVG elements.
		 * @return				The new chunk
		 * @throws	Error				
		 */
		ToSVG(chunk: Chunk, cmdFactory: CommandFactory): Node {
			if (chunk instanceof PathChunk) {
				var node: Node = SVG.CreateElement("g");
				SVGA.SetAttributes(node, {
					"type": PathChunkFactory.NodeName,
					"t": chunk.StartTime.toFixed(TIME_PRECISION)
				});
				
				// [1] path
				node.appendChild(this.PathToSVGNode(chunk.Path));
				// [2] all the commands
				this.CommandsToSVG(node, chunk.Commands, cmdFactory);

				return node;
			}

			return super.ToSVG(chunk, cmdFactory);
		}
						
		/**
		 * Deserilize path from an SVG "path" node
		 */
		private SVGNodeToPath(node: Node): Drawing.Path {
			var color: string = SVG.attr(node, "fill");
			var path: Drawing.Path = new Drawing.Path(true, color); // curved = true/false doesn't make any difference - the data are already recorded  
			
			// convert path data to sequence of segments 
			var d: string = SVG.attr(node, "d");
			node = null; // I don't need this reference any more
			
			var c: Array<string> = d.split(" ");
			var instructions: Array<Instruction> = [];			
			
			// create list of instructions
			while (c.length > 0) {
				instructions.push(this.instructionFactory.Create(c));
			}

			c = null; // drop references
			d = null;			
						
			// first segment - zero length segment
			var l = instructions.length - 1;
			if (instructions.length >= 2 && instructions[0].type === InstructionType.Move && instructions[l].type === InstructionType.Arc) {
				path.Segments.push(new Drawing.ZeroLengthSegment(instructions[l].coords[2], instructions[0].coords[0]));
				instructions.pop(); // arc
				instructions.pop(); // line
				instructions.shift();
			} else {
				throw new Error(`Only ${instructions.length} valid instructions recognized in a path string`);
			}
			
			// A] a dot: only one instruction's left -> it's the arc and I can determine the center and radius of the dot
			if (instructions.length === 1) {
				var start = path.Segments[0].Right;
				var end = instructions[0].coords[2];
				//var radius = instructions[0].coords[0];
				path.Segments = [new Drawing.ZeroLengthSegment(start, end)]; // override the original zero length seg.
				return path;
			} 
			
			
			// B] a whole path
			
			// left and right parts are at the same distance from the ends of the path
			l = instructions.length - 1;
			var prevSegment: Drawing.Segment = null;

			for (var i = 0; i < Math.floor(instructions.length / 2); i++) { // the item in the very middle is an Arc cap, I want to skip that instruction
				if (instructions[i].type === InstructionType.Line) {
					var qseg = new Drawing.QuadrilateralSegment(instructions[i].coords[0], instructions[l - i].coords[0]);
					path.Segments.push(qseg);

					if (prevSegment instanceof Drawing.CurvedSegment) {
						(<Drawing.CurvedSegment> prevSegment).Left = instructions[l - i].coords[0].clone();
					}
					prevSegment = qseg;
				} else if (instructions[i].type === InstructionType.Curve) {
					var right = new Helpers.BezierCurveSegment(null, instructions[i].coords[0], instructions[i].coords[2], instructions[i].coords[1]);
					var left = new Helpers.BezierCurveSegment(instructions[l - i].coords[2], instructions[l - i].coords[1], null, instructions[l - i].coords[0]);
					var seg = new Drawing.CurvedSegment(left, right);

					if (!!prevSegment && prevSegment instanceof Drawing.CurvedSegment) {
						prevSegment.Left = seg.LeftBezier.Start.clone();
						seg.RightBezier.Start = prevSegment.RightBezier.End.clone();
					} else if (!!prevSegment && prevSegment instanceof Drawing.QuadrilateralSegment) {
						seg.RightBezier.Start = prevSegment.Right.clone();
					}

					path.Segments.push(seg);
					prevSegment = seg;
				} else {
					throw new Error(`Unsupported path segment type ${instructions[i].type} `);
				}
			}
			
			// I need to fix last segment's left bezier End
			if (!!prevSegment && prevSegment instanceof Drawing.CurvedSegment) {
				prevSegment.Left = instructions[Math.floor(instructions.length / 2)].coords[2].clone(); // this is the ARC cap of the path
			}

			return path;
		}
		
		/**
		 * Encode path into a SVG "path" element 
		 */
		private PathToSVGNode(path: Drawing.Path): Node {
			var segments = path.Segments;
					
			// arc cap at the start
			var seg = segments[0];
			var center = seg.Right.pointInBetween(seg.Left);
			var startDirection = seg.Left.clone().subtract(center);
			var endDirection = seg.Right.clone().subtract(center);
			var arc = SVG.ArcString(seg.Right, center.distanceTo(seg.Right), Drawing.Path.angle(startDirection));

			var right: string = `${SVG.MoveToString(segments[0].Right) } `; // SPACE divider
			var left: string = `${SVG.LineToString(segments[0].Left) } ${arc}`;

			for (var i = 0; i < segments.length; i++) {
				var seg = segments[i];
				if (seg instanceof Drawing.CurvedSegment) {
					right += `${SVG.CurveToString(seg.RightBezier.StartCP, seg.RightBezier.EndCP, seg.RightBezier.End) } `; // SPACE divider
					left = `${SVG.CurveToString(seg.LeftBezier.EndCP, seg.LeftBezier.StartCP, seg.LeftBezier.Start) } ${left}`; // SPACE divider
				} else if (seg instanceof Drawing.QuadrilateralSegment) {
					right += `${SVG.LineToString(seg.Right) } `; // SPACE divider
					left = `${SVG.LineToString(seg.Left) } ${left}`; // SPACE divider
				} else {
					throw new Error(`Unsupported segment type ${typeof (seg) }`);
				}
			}


			// arc cap at the end
			seg = segments[segments.length - 1];
			center = seg.Right.pointInBetween(seg.Left);
			startDirection = seg.Right.clone().subtract(center);
			endDirection = seg.Left.clone().subtract(center);
			var cap = `${SVG.ArcString(seg.Left, center.distanceTo(seg.Left), Drawing.Path.angle(startDirection)) } `;

			return SVG.CreateElement("path", {
				"fill": path.Color,
				"d": right + cap + left
			});
		}
	}


	/**
	 * Chunk for erasing the whole canvas with one color.
	 */
	export class EraseChunkFactory extends ChunkFactory {
		private static NodeName: string = "erase";
		
		/** Dimensions of the video - so the SVG rectangle covers the whole underlaying layers */
		public Width: number = 0;
		public Height: number = 0;

		/**
		 * Parse XML element and create an EraseChunk
		 * @param	node		The XML element
		 * @param	cmdFactory	Factory for parsing commands
		 * @return				New chunk
		 * @throws	Error			
		 */
		FromSVG(node: Element, cmdFactory: CommandFactory): Chunk {
			if (SVGA.attr(node, "type") === EraseChunkFactory.NodeName) {				
				// erase chunk must have at least one child element
				if (node.childElementCount === 0) {
					throw new Error(`Erase chunk no child elements.`);
				}
				
				// first child must be a RECT
				var rectNode: Element = node.firstElementChild;
				if (rectNode.localName !== "rect") {
					throw new Error(`Erase chunk must begin with a <rect> element, but ${rectNode.localName} found instead`);
				}
				
				var chunk: EraseChunk = new EraseChunk(new UI.Color(SVG.attr(rectNode, "fill")), SVGA.numAttr(node, "t"), 0); // last erase will be added later
				[chunk.InitCommands, chunk.Commands] = ChunkFactory.GetCommands(rectNode.nextElementSibling, cmdFactory);

				return chunk;
			}

			return super.FromSVG(node, cmdFactory);
		}

		/**
		 * Convert EraseChunk to a SVG element.
		 * @param	chunk		The chunk
		 * @parm	cmdFactory	Factory for converting commands to SVG elements 
		 */
		ToSVG(chunk: Chunk, cmdFactory: CommandFactory): Node {
			if (chunk instanceof EraseChunk) {
				var node: Node = SVG.CreateElement("g");
				SVGA.SetAttributes(node, {
					"type": EraseChunkFactory.NodeName,
					"t": chunk.StartTime.toFixed(TIME_PRECISION)
				});
				
				// [1] rect
				node.appendChild(SVG.CreateElement("rect", { "fill": chunk.Color.CssValue, width: this.Width, height: this.Height }));
				// [2] all the commands
				this.CommandsToSVG(node, chunk.Commands, cmdFactory);

				return node;
			}

			return super.ToSVG(chunk, cmdFactory);
		}

	}


}
