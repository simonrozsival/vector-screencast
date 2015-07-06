/// <reference path="../../VideoData/Chunk" />
/// <reference path="../../VideoData/Command" />
/// <reference path="../../Drawing/Segments" />
/// <reference path="../../Drawing/Path" />
/// <reference path="./CommandFactory" />"
/// <reference path="../../Helpers/SVG" />
/// <reference path="../../Helpers/Vector" />


module VideoFormat.JSONAnimation {

	import Command = VideoData.Command;
	import Chunk = VideoData.Chunk;
	import VoidChunk = VideoData.VoidChunk;
	import PathChunk = VideoData.PathChunk;
	import EraseChunk = VideoData.EraseChunk;
	import maxDecPlaces = Helpers.maxDecPlaces;
	import Vector2 = Helpers.Vector2;
	
	/** Time is in miliseconds */
	const TIME_PRECISION = 2;
	
	export interface ChunkJSONFormat {
		type: string,
		t: number,
		init: Array<CommandJSONFormat>,
		cmds: Array<CommandJSONFormat>
	}
	
	interface PathChunkJSONFormat {
		path: {
			color: string,
			segments: Array<SegmentJSONFormat>
		}
	}
		
	/**
	 * Chunk factories - implementing the chain of responsibility design pattern
	 */

	export class ChunkFactory {
		constructor(protected next?: ChunkFactory) { }
		FromJSON(node: any, cmdFactory: CommandFactory): Chunk {
			if (!!this.next) {
				return this.next.FromJSON(node, cmdFactory);
			}

			throw new Error(`Chunk loading failed: Unsupported node ${node}.`)
		}

		ToJSON(chunk: Chunk, cmdFactory: CommandFactory): ChunkJSONFormat {
			if (!!this.next) {
				return this.next.ToJSON(chunk, cmdFactory);
			}

			throw new Error(`Chunk export failed: Unsupported command ${typeof (chunk) }.`);
		}
		
		protected CommandsFromJSON(arr: Array<any>, cmdFactory: CommandFactory): Array<Command> {
			var cmds: Array<Command> = [];
			for(var i = 0; i < arr.length; i++) {
				cmds.push(cmdFactory.FromJSON(arr[i]));
			}
			return cmds;
		}

		protected CommandsToJSON(cmds: Array<Command>, cmdFactory: CommandFactory): Array<CommandJSONFormat> {
			var commands: Array<CommandJSONFormat> = [];
			for (var i = 0; i < cmds.length; i++) {
				commands.push(cmdFactory.ToJSON(cmds[i]));
			}

			return commands;
		}
	}

	export class VoidChunkFactory extends ChunkFactory {
		private static TypeName: string = "void";

		FromJSON(node: any, cmdFactory: CommandFactory): Chunk {
			if (node.hasOwnProperty("type") && node.type === VoidChunkFactory.TypeName
				&& node.hasOwnProperty("t")) {
					
				var chunk: VoidChunk = new VoidChunk(node.t, 0); // last erase will be set later
				// load init commands
				if(node.hasOwnProperty("init") === false || Array.isArray(node.init) === false) {
					throw new Error(`Node ${node} has no 'init' attr or it is not an array`);						
				}
				
				if(node.hasOwnProperty("cmds") === false && Array.isArray(node.cmds) === false) {
					throw new Error(`Node ${node} has no 'cmds' attr or it is not an array`);
				}
				
				chunk.InitCommands = this.CommandsFromJSON(node.init, cmdFactory);
				
				var cmds = this.CommandsFromJSON(node.cmds, cmdFactory);
				for (var i = 0; i < cmds.length; i++) {
					chunk.PushCommand(cmds[i]);
				}

				return chunk;
			}

			return super.FromJSON(node, cmdFactory);
		}

		ToJSON(chunk: Chunk, cmdFactory: CommandFactory): ChunkJSONFormat {
			if (chunk instanceof VoidChunk) {
				return {
					type: VoidChunkFactory.TypeName,
					t: maxDecPlaces(chunk.StartTime),
					init: this.CommandsToJSON(chunk.Commands, cmdFactory),
					cmds: this.CommandsToJSON(chunk.Commands, cmdFactory)
				};
			}

			return super.ToJSON(chunk, cmdFactory);
		}
	}
	
	interface SegmentJSONFormat {
		t: string,
	}
	
	class SegmentFactory {
		constructor(private next?: SegmentFactory) { }
		FromJSON(node: any): Drawing.Segment {
			if(!!this.next) return this.next.FromJSON(node);
			throw new Error(`Unsupported segment ${node}`);
		}
		ToJSON(segment: Drawing.Segment): SegmentJSONFormat {
			if(!!this.next) return this.next.ToJSON(segment);
			throw new Error(`Unsupported segment ${typeof segment}`);
		} 
	}
	
	class CurvedSegmentFactory extends SegmentFactory {
		ToJSON(segment: Drawing.Segment): SegmentJSONFormat {
			if(segment instanceof Drawing.CurvedSegment) {
				return {
					t: "curved",
					l: {
						s: 	[ maxDecPlaces(segment.LeftBezier.Start.X), maxDecPlaces(segment.LeftBezier.Start.Y) ],
						sc: [ maxDecPlaces(segment.LeftBezier.StartCP.X), maxDecPlaces(segment.LeftBezier.StartCP.Y) ],
						e: 	[ maxDecPlaces(segment.LeftBezier.End.X), maxDecPlaces(segment.LeftBezier.End.Y) ],
						ec: [ maxDecPlaces(segment.LeftBezier.EndCP.X), maxDecPlaces(segment.LeftBezier.EndCP.Y) ]
					},
					r: {				
						s: 	[ maxDecPlaces(segment.RightBezier.Start.X), maxDecPlaces(segment.RightBezier.Start.Y) ],
						sc: [ maxDecPlaces(segment.RightBezier.StartCP.X), maxDecPlaces(segment.RightBezier.StartCP.Y) ],
						e: 	[ maxDecPlaces(segment.RightBezier.End.X), maxDecPlaces(segment.RightBezier.End.Y) ],
						ec: [ maxDecPlaces(segment.RightBezier.EndCP.X), maxDecPlaces(segment.RightBezier.EndCP.Y) ]	
					}
				};				
			}
			
			return super.ToJSON(segment);
		}
		
		FromJSON(node: any): Drawing.Segment {
			if(node.hasOwnProperty("t") && node.t === "curved") {
				if(node.hasOwnProperty("l")
					&& node.hasOwnProperty("r")
					&& node.l.hasOwnProperty("s") && node.l.hasOwnProperty("sc") && node.l.hasOwnProperty("e") && node.l.hasOwnProperty("ec")
					&& node.r.hasOwnProperty("s") && node.r.hasOwnProperty("sc") && node.r.hasOwnProperty("e") && node.r.hasOwnProperty("ec")
					&& Array.isArray(node.l.s) && Array.isArray(node.l.sc) && Array.isArray(node.l.e) && Array.isArray(node.l.ec)
					&& Array.isArray(node.r.s) && Array.isArray(node.r.sc) && Array.isArray(node.r.e) && Array.isArray(node.r.ec)
					&& node.l.s.length === 2 && node.l.sc.length === 2 && node.l.e.length === 2 && node.l.ec.length === 2
					&& node.r.s.length === 2 && node.r.sc.length === 2 && node.r.e.length === 2 && node.r.ec.length === 2) {
						var left = new Helpers.BezierCurveSegment(new Vector2(node.l.s[0], node.l.s[1]), new Vector2(node.l.sc[0], node.l.sc[1]), new Vector2(node.l.e[0], node.l.e[1]), new Vector2(node.l.ec[0], node.l.ec[1]));
						var right = new Helpers.BezierCurveSegment(new Vector2(node.r.s[0], node.r.s[1]), new Vector2(node.r.sc[0], node.r.sc[1]), new Vector2(node.r.e[0], node.r.e[1]), new Vector2(node.r.ec[0], node.r.ec[1]));
						return new Drawing.CurvedSegment(left, right);
					}
					
				throw new Error("Error parsing 'curved' segment JSON");
			}
			
			return super.FromJSON(node);
		}
	}
	
	class QuadrilateralSegmentFactory extends SegmentFactory {
		ToJSON(segment: Drawing.Segment): SegmentJSONFormat {
			if(segment instanceof Drawing.QuadrilateralSegment) {
				return {
					t: "quad",
					l: [ maxDecPlaces(segment.Left.X), maxDecPlaces(segment.Left.Y) ],
					r: [ maxDecPlaces(segment.Right.X), maxDecPlaces(segment.Right.Y) ]
				};				
			}
			
			return super.ToJSON(segment);
		}
		FromJSON(node: any): Drawing.Segment {
			if(node.hasOwnProperty("t") && node.t === "quad") {
				if(node.hasOwnProperty("l")
					&& node.hasOwnProperty("r")
					&& Array.isArray(node.l)
					&& Array.isArray(node.r)
					&& node.l.length === 2
					&& node.r.length === 2) {
						return new Drawing.QuadrilateralSegment(new Vector2(node.l[0], node.l[1]), new Vector2(node.r[0], node.r[1]));
					}
					
				throw new Error("Error parsing 'quadrilateral' segment JSON");
			}
			
			return super.FromJSON(node);
		}
	}
	
	class ZeroLengthSegmentFactory extends SegmentFactory {
		ToJSON(segment: Drawing.Segment): SegmentJSONFormat {
			if(segment instanceof Drawing.QuadrilateralSegment) {
				return {
					t: "zero",
					l: [ maxDecPlaces(segment.Left.X), maxDecPlaces(segment.Left.Y) ],
					r: [ maxDecPlaces(segment.Right.X), maxDecPlaces(segment.Right.Y) ]
				};				
			}
			
			return super.ToJSON(segment);
		}
		FromJSON(node: any): Drawing.Segment {
			if(node.hasOwnProperty("t") && node.t === "zero") {
				if(node.hasOwnProperty("l")
					&& node.hasOwnProperty("r")
					&& Array.isArray(node.l)
					&& Array.isArray(node.r)
					&& node.l.length === 2
					&& node.r.length === 2) {
						return new Drawing.ZeroLengthSegment(new Vector2(node.l[0], node.l[1]), new Vector2(node.r[0], node.r[1]));
					}
					
				throw new Error("Error parsing 'zerolength' segment JSON");
			}
			
			return super.FromJSON(node);
		}
	}
			
	export class PathChunkFactory extends ChunkFactory {
		private static TypeName: string = "path";
		private segmentFactory: SegmentFactory;
				
		constructor(next?: ChunkFactory) {
			super(next);
			this.segmentFactory = new CurvedSegmentFactory(
										new QuadrilateralSegmentFactory(
											new ZeroLengthSegmentFactory()
										)	
									);
		}
				
		FromJSON(node: any, cmdFactory: CommandFactory): Chunk {			
			if (node.hasOwnProperty("type") && node.type === PathChunkFactory.TypeName
				&& node.hasOwnProperty("t")) {
							
				// [1] PATH child
				if (node.hasOwnProperty("path") === false
					&& node.path.hasOwnProperty("color")
					&& node.path.hasOwnProperty("segments")
					&& Array.isArray(node.path.segments)) {
						
					throw new Error(`Path chunk must have a valid 'path' attr`);
				}								
				
				// load init commands
				if(node.hasOwnProperty("init") === false || Array.isArray(node.init) === false) {
					throw new Error(`Node ${node} has no 'init' attr or it is not an array`);						
				}
				
				if(node.hasOwnProperty("cmds") === false && Array.isArray(node.cmds) === false) {
					throw new Error(`Node ${node} has no 'cmds' attr or it is not an array`);
				}
				
				var path = new Drawing.Path(true, node.path.color);
				path.Segments = [];
				for (var i = 0; i < node.path.segments.length; i++) {
					path.Segments.push(this.segmentFactory.FromJSON(node.path.segments[i]));					
				}
								
				var chunk: PathChunk = new PathChunk(path, node.t, 0); // last erase will be set later
				chunk.InitCommands = this.CommandsFromJSON(node.init, cmdFactory);
				
				var cmds = this.CommandsFromJSON(node.cmds, cmdFactory);
				for (var i = 0; i < cmds.length; i++) {
					chunk.PushCommand(cmds[i]);
				}
				
				return chunk;
			}

			return super.FromJSON(node, cmdFactory);
		}

		ToJSON(chunk: Chunk, cmdFactory: CommandFactory): ChunkJSONFormat {
			if (chunk instanceof PathChunk) {				
				var segments: Array<SegmentJSONFormat> = [];
				for (var i = 0; i < chunk.Path.Segments.length; i++) {
					segments.push(this.segmentFactory.ToJSON(chunk.Path.Segments[i]));					
				}
				
				return {
					type: "path",
					t: maxDecPlaces(chunk.StartTime),
					path: {
						color: chunk.Path.Color,
						segments: segments
					},
					init: this.CommandsToJSON(chunk.InitCommands, cmdFactory),
					cmds: this.CommandsToJSON(chunk.Commands, cmdFactory)
				};
			}

			return super.ToJSON(chunk, cmdFactory);
		}
	}


	export class EraseChunkFactory extends ChunkFactory {
		private static TypeName: string = "erase";
		
		FromJSON(node: any, cmdFactory: CommandFactory): Chunk {
			if (node.hasOwnProperty("type") && node.type === EraseChunkFactory.TypeName
				&& node.hasOwnProperty("t")) {
					
				if(node.hasOwnProperty("color") === false) {
					throw new Error(`Erase chunk must have a valid 'color' attr`);
				}
				
				// load init commands
				if(node.hasOwnProperty("init") === false || Array.isArray(node.init) === false) {
					throw new Error(`Node ${node} has no 'init' attr or it is not an array`);						
				}
				
				if(node.hasOwnProperty("cmds") === false && Array.isArray(node.cmds) === false) {
					throw new Error(`Node ${node} has no 'cmds' attr or it is not an array`);
				}

				var chunk: EraseChunk = new EraseChunk(new UI.Color("", node.color), node.t, 0); // last erase will be added later
				chunk.InitCommands = this.CommandsFromJSON(node.init, cmdFactory);
				var cmds = this.CommandsFromJSON(node.cmds, cmdFactory);
				for (var i = 0; i < cmds.length; i++) {
					chunk.PushCommand(cmds[i]);
				}
				
				return chunk;
			}

			return super.FromJSON(node, cmdFactory);
		}

		ToJSON(chunk: Chunk, cmdFactory: CommandFactory): ChunkJSONFormat {
			if (chunk instanceof EraseChunk) {
				return {
					type: EraseChunkFactory.TypeName,
					t: maxDecPlaces(chunk.StartTime),
					color: chunk.Color.CssValue,
					init: this.CommandsToJSON(chunk.Commands, cmdFactory),
					cmds: this.CommandsToJSON(chunk.Commands, cmdFactory)
				};
			}

			return super.ToJSON(chunk, cmdFactory);
		}
	}
}