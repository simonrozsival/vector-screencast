/// <reference path="IVideoInfo" />
/// <reference path="../VideoFormat/IO" />
/// <reference path="../Helpers/File" />
/// <reference path="../Helpers/Errors" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="../Helpers/State" />
/// <reference path="../Helpers/VideoTimer" />

import VideoEvents = Helpers.VideoEvents;
import VideoEventType = Helpers.VideoEventType;
import StateType = Helpers.StateType;
import VideoTimer = Helpers.VideoTimer;

module VideoData {
	
	export class Video {
		
		/** Is the data available? */
		private hasData: boolean;
		
		/** Loaded video information. */
		private info: IVideoInfo;
		public get Info() : IVideoInfo { return this.info; }		
		
		/** How much is the image scaled when comapred to the origina? */
		private scale: number;
		
		/** Image information */
		private data: any;
		
		/** Current position in the played file */
		private timer: VideoTimer;
		
		/** Is video playling on or is it paused? */
		private isPlaying: boolean;
				
		/**
		 * 
		 */
		constructor(url: string, private formatReader: VideoFormat.IReader) {						
			this.timer = null;
			this.hasData = false;
			this.isPlaying = false;
			Helpers.File.ReadXmlAsync(url, this.ProcessInputFile, this.ReadingFileError);
			
			// 
			VideoEvents.on(VideoEventType.CanvasSize, this.CanvasSizeChanged);
			VideoEvents.on(VideoEventType.Start, 	this.Start);
			VideoEvents.on(VideoEventType.Continue, this.Start);
			VideoEvents.on(VideoEventType.Pause, 	this.Pause);
			VideoEvents.on(VideoEventType.Stop, 	this.Pause);
			VideoEvents.on(VideoEventType.JumpTo, 	this.JumpTo);
			VideoEvents.on(VideoEventType.ReachEnd, this.Pause);
		}
		
		/**
		 * Process the downloaded XML source.
		 */
		private ProcessInputFile(xml: XMLDocument) : void {
			this.hasData = true;
			this.formatReader.ReadFile(xml);
			
			// load video information
			this.info = this.formatReader.GetInfo();
			VideoEvents.trigger(VideoEventType.VideoInfoLoaded, this.info); // anyone can have the info
		}
		
		/**
		 * Handle an error that occured while downloading or parsing the input XML document.
		 */
		private ReadingFileError(e: Event) : void {
			Errors.Report(ErrorType.Fatal, "Source file couldn't be read and the video won't be played.");
		}				
		
		/**
		 * Compute image scaling factor based on original canvas size and current canvas size
		 */
		private CanvasSizeChanged(width: number, height: number) : void {
			// make sure it doesn't get out of current user's canvas
			this.scale = Math.min(width / this.info.Width, height / this.info.Height);
		}
		 
		/**
		 * Acommodate the position to current canvas size
		 */
		private CorrectCoords(pos: ICursor) : ICursor {
			return <ICursor> {
				x: pos.x * this.scale,
				y: pos.y * this.scale	
			};
		}	
				
		private Start() : void {
			if(this.timer === null) {
				this.timer = new VideoTimer();
			} else {
				this.timer.Resume();
			}
			
			this.isPlaying = true;
			this.Tick(); // this will render as much as needed and then will become async
		}
		
		private Pause() : void {
			this.timer.Pause();
			this.isPlaying = false; // Tick() will stop after next animation frame (in 1/60s)
		}
		
		private Replay() : void {
			//this
		}
		
		private JumpTo(progress: number) : void {
			var wasPlaying: boolean = this.isPlaying;	
			this.Pause();		
			var time = progress * this.info.Length * 1000; // convert to milliseconds
			if (time >= this.timer.CurrentTime()) {
				this.SkipForward(time);
			} else {
				this.SkipBackward(time);
			}
			
			if(wasPlaying === true) {
				this.Start(); // continue from the new point in time
			} 
		}
		
		private SkipForward(time: number) : void {
			this.timer.SetTime(time);
			this.timer.Pause();
						
			while (line.FinishTime <= this.formatReader.GetNextPrerenderedLineFinishTime()) {
				var line: any = this.formatReader.GetNextPrerenderedLine();
				this.PublishWholeLine(line);
			}
			
			this.Tick(); // make as many steps as needed
			// video is paused, so ticking won't continue after it is synchronised
			// rendering request will also be made
		}
		
		private SkipBackward(time: number) : void {
			// rewind... (erase everything)
			this.
			
			// ...and then skip forward
			Tick();
		}
		
		private PublishWholeLine(line: any) : void {
			// @todo
		}
		
		/**
		 * Stop playback when end is reached.
		 */
		private ReachedEnd() : void {
			this.Pause();
		}
		
		/**
		 * Inform everyone, that I have reached the end
		 */
		private ForceReachedEnd() : void {
			VideoEvents.trigger(VideoEventType.ReachEnd);			
		}
		
		private nextState: State;
		private lastCursorState: Helpers.CursorState;
		
		/**
		 * Keep the video running (as long as it is not paused).
		 */
		private Tick() : void {
			// number of states that have drawn something on the canvas			
			var drawingStates: number = 0;
			
			// apply as many states as needed (usually 1 or 2)
			while(this.nextState.GetTime() <= this.timer.CurrentTime()) {
				drawingStates += this.ProcessState(this.nextState);
				this.nextState = this.formatReader.GetNextState();
				
				if(!this.nextState) {
					// I have reached the end
					this.ForceReachedEnd();
				}
			}
			
			// request frame rendering (if something interesting happened, of course)
			if(drawingStates > 0) {				
				this.RequestRendering();				
			}
			
			// repaint on next animation frame
			if(this.isPlaying) {
				requestAnimationFrame(this.Tick); // 1 frame takes about 1/60s
			}
		}
		
		/**
		 * Tell the drawer that there is something it should render...
		 */
		private RequestRendering() : void {
			VideoEvents.trigger(VideoEventType.Render);
		}
		
		/**
		 * Returns 1 if something is drawn, 0 otherwise
		 * @param	state	Next state
		 */
		private ProcessState(state: State) : number {
			switch (state.GetType()) {
				case StateType.ChangeBrushSize:
					this.ChangeBrushSize(<Helpers.SizeState> state);
					return 0;
				case StateType.ChangeColor:
					this.ChangeColor(<Helpers.ColorState> state);
					return 0;
				case StateType.Cursor:
					this.MoveCursor(<Helpers.CursorState> state);
					// nothing is redrawn if the cursor is just 'hovering' over the canvas
					// - unless this is where the line ends...
					return (<Helpers.CursorState> state).Pressure > 0
								|| this.lastCursorState.Pressure > 0 ? 1 : 0;
			}
		} 
		
		private ChangeColor(state: Helpers.ColorState) : void {
			VideoEvents.trigger(VideoEventType.ChangeColor, state.Color.CssValue);
		}
		
		private ChangeBrushSize(state: Helpers.SizeState) : void {
			VideoEvents.trigger(VideoEventType.ChangeBrushSize, state.Size.Size * this.scale);
		}
		
		private MoveCursor(state: Helpers.CursorState) : void {			
			VideoEvents.trigger(VideoEventType.CursorState, state);
		}		
	}	
}