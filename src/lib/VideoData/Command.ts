import VideoEvents, { VideoEventType } from '../Helpers/VideoEvents';
import { SVGA } from '../Helpers/SVG';
import Color from '../UI/Color';
import BrushSize from '../UI/Brush';
import { CursorState } from '../Helpers/State';
import { Component, ComponentParams } from '../Components/Component';
	
//namespace VectorScreencast.VideData {
	
	/**
	 * Commands are used to trigger some event at given moment.
	 */		
	export abstract class Command {		
		public get Time(): number { return this.time; }		
		constructor(private time: number) { }		
		abstract Execute(events: VideoEvents): void;
		abstract Clone(): Command;
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
		Execute(events: VideoEvents): void {
			events.trigger(VideoEventType.CursorState, new CursorState(this.Time, this.x, this.y, this.p));
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
		Execute(events: VideoEvents): void {
			events.trigger(VideoEventType.DrawSegment);
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
		get Color(): Color { return this.color; }
				
		/**
	 	 * @param	color	New color of the brush
	 	 * @param	time	Time, when this command should be executed
	 	 */
		constructor(protected color: Color, time: number) {
			super(time);
		}
						
		/**
		 * Change current color of the brush to a given color.
		 * @triggers-event	ChangeColor
		 */
		Execute(events: VideoEvents): void {
			events.trigger(VideoEventType.ChangeColor, this.color);
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
		get Size(): BrushSize { return this.size; }
		
		/**
		 * @param	size	New size of the brush
		 * @param	time	The time, when this command should be executed
		 */
		constructor(protected size: BrushSize, time: number) {
			super(time);
		}
						
		/**
		 * Change brush size to a given value.
		 * @triggeres-event	ChangeBrushSize
		 */
		Execute(events: VideoEvents): void {
			events.trigger(VideoEventType.ChangeBrushSize, this.size);
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
		public get Color(): Color { return this.color; }
		
		/**
		 * @param	color	The intended color of the background.
		 * @param	time	The time, when this command should be executed
		 */
		constructor(protected color: Color, time: number) {
			super(time);
		}
		
		Execute(events: VideoEvents): void {
			events.trigger(VideoEventType.ClearCanvas, this.color);			
		}
		
		/**
		 * Create a clone of this command.
		 */
		Clone(): Command {
			return new ClearCanvas(this.color, this.Time);
		}
	}
	
	export class AddComponent extends Command {		
		public get Type(): string { return this.type; }
		public get Id(): string { return this.id; }
		public get Params(): ComponentParams { return this.params; }
		
		constructor(protected type: string, protected id: string, protected params: ComponentParams, time: number) {
			super(time);
		}		
		
		Clone(): Command {
			return new AddComponent(this.type, this.id, this.params, this.Time);
		}
		
		Execute(events: VideoEvents): void {
			events.trigger(VideoEventType.AddComponent, this.type, this.id, this.params);
		}
	}
	
	export class RemoveComponent extends Command {		
		public get Id(): string { return this.id; }
		
		constructor(protected id: string, time: number) {
			super(time);
		}		
		
		Clone(): Command {
			return new RemoveComponent(this.id, this.Time);
		}
		
		Execute(events: VideoEvents): void {
			events.trigger(VideoEventType.RemoveComponent, this.id);
		}
	}
		
	export class ComponentCommand extends Command {		
		public get Cmd(): string { return this.cmd; }
		public get TargetId(): string { return this.targetId; }
		public get Params(): ComponentParams { return this.params; }
		
		constructor(protected targetId: string, protected cmd: string, protected params: ComponentParams, time: number) {
			super(time);
		}		
		
		Clone(): Command {
			return new ComponentCommand(this.targetId, this.cmd, this.params, this.Time);
		}
		
		Execute(events: VideoEvents): void {
			events.trigger(VideoEventType.ComponentCommand, this.targetId, this.cmd, this.params);
		}
	}
	
//}