/// <reference path="Command" />
/// <reference path="../Helpers/State" />
/// <reference path="../Helpers/VideoTimer" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="../Drawing/Path" />

module VideoData {
	
	
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
		
		/** The data of this segment */
		private initCommands: Array<Command>;
		private commands: Array<Command>;
		
		/** Iterating over commands */
		private cmdIterator: number;
		public get CurrentCommand(): Command {
			return this.commands[this.cmdIterator]; // if the index exceeds the bound of the array, undefined is returned
		}		
		public PeekNextCommand(): Command {
			return this.commands[this.cmdIterator + 1]; // if the index exceeds the bound of the array, undefined is returned
		}
		public MoveNextCommand(): void { this.cmdIterator++; }
		public Rewind(): void { this.cmdIterator = 0; }
		
		
		private pathIterator: number;
				
		/*private*/ constructor(protected time: number, protected lastErase: number) {
			this.initCommands = [];
			this.commands = [];
			this.cmdIterator = 0;
			this.pathIterator = 0;
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
					
		GetCommand(i: number): Command {
			return i < this.commands.length ? this.commands[i] : null;
		}		
						
		PushCommand(cmd: Command): void {
			this.commands.push(cmd);
		}
				
		get Commands(): Array<Command> {
			return this.commands;
		}
		
		get InitCommands(): Array<Command> {
			return this.initCommands;
		}
		
		set InitCommands(initCmds: Array<Command>) {
			this.initCommands = initCmds;
		}
		
		Render(): void {
			throw new Error("Not implemented");
		}
	}
	
	/**
	 * Concrete chunks:
	 */
	
	export class VoidChunk extends Chunk {
		static get NodeName(): string { return "void"; }
		
		Render(): void {
			/* Void.. */
		}
	} 
	
	export class PathChunk extends Chunk {
		static get NodeName(): string { return "path"; }
		get Path(): Drawing.Path { return this.path; }
		
		constructor(protected path: Drawing.Path, time: number, lastErase: number) {
			super(time, lastErase);
		}
		
		Render(): void {
			VideoEvents.trigger(VideoEventType.DrawPath);
		}
	}
	
	export class EraseChunk extends Chunk {
		static get NodeName(): string { return "erase"; }
		get Color(): UI.Color { return this.color; }
		
		Render(): void {
			VideoEvents.trigger(VideoEventType.ClearCanvas, this.color);
		}
		
		constructor(protected color: UI.Color, time: number, lastErase: number) {
			super(time, lastErase);
		}
	}
	
}