/// <reference path="../VectorScreencast" />

module VectorScreencast.VideoData {
	
	
	import StateType = Helpers.StateType;
	import VideoTimer = Helpers.VideoTimer;
	import VideoEvents = Helpers.VideoEvents;
	import VideoEventType = Helpers.VideoEventType;
	import SVG = Helpers.SVG;	
	import SVGA = Helpers.SVGA;	
		
	/**
	 * Chunk represents part of the whole video process.
	 * It starts in a specific time and contains list of commands and pre-rendered paths,
	 * that are used to render one chunk in a single moment without unnecessary looping through all commands.
	 * Each chunk contains an information about the last time the screen was erased. 
	 */
	export class Chunk {	
		public get StartTime(): number { return this.time; }
		public get LastErase(): number { return this.lastErase; }
		
		/** The list of initialisation commands of this chunk */
		private initCommands: Array<Command>;
		
		/** The list of all comands of this chunk */
		private commands: Array<Command>;
		
		/** Pointer to current command */
		private cmdIterator: number;
		
		/** Get the command that is pointed to by the internal command pointer */
		public get CurrentCommand(): Command {
			return this.commands[this.cmdIterator]; // if the index exceeds the bound of the array, undefined is returned
		}		
		
		/** Access the next command without moving the internal command pointer. */
		public PeekNextCommand(): Command {
			return this.commands[this.cmdIterator + 1]; // if the index exceeds the bound of the array, undefined is returned
		}
		
		/** Move the internal command pointer to the next command. */
		public MoveNextCommand(): void { this.cmdIterator++; }
		
		/** Set internal command pointer to the beginning of the list of commands. */
		public Rewind(): void { this.cmdIterator = 0; }
		
				
		/**
		 * @param	time		Start time of the chunk
		 * @param	lastErase	Sequence number of the last time, that the canvas is cleared before this path chunk is drawn. 
		 */		
		constructor(protected time: number, protected lastErase: number) {
			this.initCommands = [];
			this.commands = [];
			this.cmdIterator = 0;
		}
				
		/**
		 * Execute all initialising commands to make sure video is in the right state
		 * before continuing the playback. This is necessary when skipping to different point 
		 * on the timeline and skipping rendering of some parts of the video using "lastErase" hints.. 
		 */
		ExecuteInitCommands(): void {
			for (var i = 0; i < this.initCommands.length; i++) {
				this.initCommands[i].Execute();
			}
		}
					
		/**
		 * Get a specific command by it's sequence number.
		 * @param	i	Commands sequence number.
		 */
		GetCommand(i: number): Command {
			return i < this.commands.length ? this.commands[i] : null;
		}		
						
		/**
		 * Add new command at the end of the list of commands of this chunk. 
		 * @param	cmd		The command
		 */
		PushCommand(cmd: Command): void {
			this.commands.push(cmd);
		}
		
		/**
		 * Access the whole list of all commands.
		 */
		get Commands(): Array<Command> {
			return this.commands;
		}
		
		/**
		 * Set all commands at once.
		 */
		set Commands(value: Array<Command>) {
			this.commands = value;
		}
		
		
		/**
		 * Get initialisation commands that must be executed before this chunk is started to be processed. 
		 */
		get InitCommands(): Array<Command> {
			return this.initCommands;
		}
		
		/**
		 * Set the list of initialisation commands.
		 */
		set InitCommands(initCmds: Array<Command>) {
			this.initCommands = initCmds;
		}
		
		/**
		 * Render the whole chunk at once.
		 * @abstract
		 * @throws Error
		 */
		Render(): void {
			throw new Error("Not implemented");
		}
	}
	
	/**
	 * Concrete chunks:
	 */
	
	/**
	 * Wraps a chunk of the video, where nothing really important happens (in visuals).
	 * Contains typically only cursor movement, color changes and brush size changes. 
	 */
	export class VoidChunk extends Chunk {
		/** Do nothing. */
		Render(): void { /* Void.. */ }
	} 
	
	/**
	 * Chunk representing one path drawn by the author of the video.
	 */
	export class PathChunk extends Chunk {
		/** The path to be rendered by this chunk */
		get Path(): Drawing.Path { return this.path; }
		
		/**
		 * @param	path		The path containing of the list of segments.
		 * @param	time		Start time of the chunk
		 * @param	lastErase	Sequence number of the last time, that the canvas is cleared before this path chunk is drawn. 
		 */
		constructor(protected path: Drawing.Path, time: number, lastErase: number) {
			super(time, lastErase);
		}
		
		/**
		 * Render the whole (current) path.
		 * @treggers-event	DrawPath
		 */
		Render(): void { VideoEvents.trigger(VideoEventType.DrawPath); }
	}
	
	/**
	 * Remove everything from the canvas and replace it with a single color + afterwards movement of the cursor.
	 */
	export class EraseChunk extends Chunk {
		/** Get the new background color. */
		get Color(): UI.Color { return this.color; }
		
		/**
		 * Run the implicit erase command.
		 */
		ExecuteInitCommands(): void {
			// the clear canvas command is not stored anywhere, create it ad hoc:
			this.Render();
			
			// now the rest
			super.ExecuteInitCommands();
		}
		
		/**
		 * Clear the whole canvas with a single color.
		 * @triggers-event	ClearCanvas
		 */
		Render(): void {
			VideoEvents.trigger(VideoEventType.ClearCanvas, this.color);
		}
		
		/**
		 * @param	color		The color to clear the canvas with.
		 * @param	time		Start time of the chunk.
		 * @param	lastErase	Sequence number of the last time, that the canvas is cleared before this path chunk is drawn. 
		 */
		constructor(protected color: UI.Color, time: number, lastErase: number) {
			super(time, lastErase);
		}
	}
	
}