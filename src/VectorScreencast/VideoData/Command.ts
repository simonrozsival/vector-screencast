/// <reference path="../VectorScreencast" />

module VectorScreencast.VideoData {
	
	import VideoEvents = Helpers.VideoEvents;
	import VideoEventType = Helpers.VideoEventType;
	import SVGA = Helpers.SVGA;
		
	
	/**
	 * Commands are used to trigger some event at given moment.
	 */
		
	export class Command {		
		public get Time(): number { return this.time; }		
		constructor(private time: number) { }		
		Execute(): void {
			throw new Error("Not implemented");
		}
	}
	
	export class MoveCursor extends Command {
		get X(): number { return this.x; }
		get Y(): number { return this.y; }
		get P(): number { return this.p; }
		
		constructor(protected x: number, protected y: number, protected p: number, time: number) {
			super(time);
		}
		
		Execute(): void {
			VideoEvents.trigger(VideoEventType.CursorState, new Helpers.CursorState(this.Time, this.x, this.y, this.p));
		}
	}		
			
	export class DrawNextSegment extends Command {
		Execute(): void {
			VideoEvents.trigger(VideoEventType.DrawSegment);
		}
	}
		
	export class ChangeBrushColor extends Command {
		get Color(): UI.Color { return this.color; }
				
		constructor(protected color: UI.Color, time: number) {
			super(time);
		}
						
		Execute(): void {			
			VideoEvents.trigger(VideoEventType.ChangeColor, this.color);
		}
	}
	
	export class ChangeBrushSize extends Command {
		get Size(): UI.BrushSize { return this.size; }
		
		constructor(protected size: UI.BrushSize, time: number) {
			super(time);
		}
						
		Execute(): void {			
			VideoEvents.trigger(VideoEventType.ChangeBrushSize, this.size);
		}
	}
	
	export class ClearCanvas extends Command {
		public get Color(): UI.Color { return this.color; }
		
		constructor(time: number, protected color: UI.Color) {
			super(time);
		}
		
		Execute(): void {	
			VideoEvents.trigger(VideoEventType.ClearCanvas, this.color);			
		}
	}			
}