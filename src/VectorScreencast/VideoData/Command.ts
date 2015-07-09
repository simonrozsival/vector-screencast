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
		Clone(): Command {
			throw new Error("Not implemented");
		}
	}
	
	/**
	 * Moves cursor to a given point at given time.
	 */
	export class MoveCursor extends Command {
		/** Cursor's X coordinate */
		get X(): number { return this.x; }
		/** Cursor's Y coordinate */
		get Y(): number { return this.y; }
		/** Applied pressure in this point */
		get P(): number { return this.p; }
		
		/**
		 * @param	x		X coordinate of the cursor
		 * @param	y		Y coordinate of the cursor
		 * @param	p		Applied pressure in this point
		 * @param	time	The time, when this command should be executed
		 */
		constructor(protected x: number, protected y: number, protected p: number, time: number) {
			super(time);
		}
		
		/**
		 * Move cursor to a given point.
		 * @triggeres-event	CursorState
		 */
		Execute(): void {
			VideoEvents.trigger(VideoEventType.CursorState, new Helpers.CursorState(this.Time, this.x, this.y, this.p));
		}
		
		/**
		 * Create a clone of this command.
		 */
		Clone(): Command {
			return new MoveCursor(this.x, this.y, this.p, this.Time);
		}
	}		
			
	/**
	 * Draw next segment of current path.
	 */
	export class DrawNextSegment extends Command {
		/**
		 * Draw next segment of current path.
		 * @triggers-event	DrawSegment
		 */
		Execute(): void {
			VideoEvents.trigger(VideoEventType.DrawSegment);
		}
		
		/**
		 * Create a clone of this command.
		 */
		Clone(): Command {
			return new DrawNextSegment(this.Time);
		}
	}
		
	/**
	 * Change current color of the bursh at given time to a given value.
	 */
	export class ChangeBrushColor extends Command {
		/** Color to change the brush to */
		get Color(): UI.Color { return this.color; }
				
		/**
		 * @param	color	New color of the brush
		 * @param	time	Time, when this command should be executed
		 */
		constructor(protected color: UI.Color, time: number) {
			super(time);
		}
						
		/**
		 * Change current color of the brush to a given color.
		 * @triggers-event	ChangeColor
		 */
		Execute(): void {			
			VideoEvents.trigger(VideoEventType.ChangeColor, this.color);
		}
		
		/**
		 * Create a clone of this command.
		 */
		Clone(): Command {
			return new ChangeBrushColor(this.color, this.Time);
		}
	}
	
	/**
	 * Changes the size of the brush.
	 */
	export class ChangeBrushSize extends Command {
		/** The new size of the brush */
		get Size(): UI.BrushSize { return this.size; }
		
		/**
		 * @param	size	New size of the brush
		 * @param	time	The time, when this command should be executed
		 */
		constructor(protected size: UI.BrushSize, time: number) {
			super(time);
		}
						
		/**
		 * Change brush size to a given value.
		 * @triggeres-event	ChangeBrushSize
		 */
		Execute(): void {			
			VideoEvents.trigger(VideoEventType.ChangeBrushSize, this.size);
		}
		
		/**
		 * Create a clone of this command.
		 */
		Clone(): Command {
			return new ChangeBrushSize(this.size, this.Time);
		}
	}
	
	/**
	 * Clear canvas with a single color.
	 */
	export class ClearCanvas extends Command {
		/** New color of the canvas */
		public get Color(): UI.Color { return this.color; }
		
		/**
		 * @param	color	The intended color of the background.
		 * @param	time	The time, when this command should be executed
		 */
		constructor(protected color: UI.Color, time: number) {
			super(time);
		}
		
		Execute(): void {	
			VideoEvents.trigger(VideoEventType.ClearCanvas, this.color);			
		}
		
		/**
		 * Create a clone of this command.
		 */
		Clone(): Command {
			return new ClearCanvas(this.color, this.Time);
		}
	}			
}