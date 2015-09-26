import Video from './VideoData/Video';
import AudioPlayer from './AudioData/AudioPlayer';

import VideoEvents, { VideoEventType } from './Helpers/VideoEvents';

import Errors, { ErrorType } from './Helpers/Errors';
import { CursorState } from './Helpers/State';
import PlayerUI from './UI/PlayerUI';

import { DrawingStrategy } from './Drawing/DrawingStrategy';
import VideoTimer from './Helpers/VideoTimer';
import Path from './Drawing/Path';

import { PlayerSettings } from './Settings/PlayerSettings';
import * as Localization from './Localization/Player';
import CanvasDrawer from './Drawing/CanvasDrawer';

import Command, { MoveCursor } from './VideoData/Command';
import Chunk, { PathChunk } from './VideoData/Chunk';
import Segment, { ZeroLengthSegment } from './Drawing/Segments';

import Color from './UI/Color';
import File from './Helpers/File';
import { Reader } from './VideoFormat';
import IO from './VideoFormat/SVGAnimation/IO';

/**
 * # Player class.
 * This class defines the behavior of the video player. It loads a source file,
 * prepares the UI and plays the video according to the settings and user's input.
 */
export default class Player {
	
	/** Data of the currently played video */
	protected video: Video;
	
	/** HTML5 Audio player wrapper */
	protected audio: AudioPlayer;
	
	/** The UI */        
	protected ui: PlayerUI;
	
	/** Drawing strategy - reconsruct recorded data */
	protected drawer: DrawingStrategy;
	
	/** Remembers current state of the player */
	protected isPlaying: boolean;
	
	/** Current time */
	protected timer: VideoTimer;
	
	/** Currently drawn path */
	protected drawnPath: Path;
	protected drawnSegment: number;
	
	/** Dimensions of the container */
	private oldWidth: number;
	private oldHeight: number;
	
	/** The instance of video events aggregator */
	private events: VideoEvents;
	public get Events(): VideoEvents { return this.events; }
						
	/**
	 * Create a new instance of the player and append it to a given container element.
	 * @param   id          ID of the container element
	 * @param   settings    User defined settings of the player
	 * @triggeres-event Busy
	 */     
	constructor(id: string, private settings: PlayerSettings) {
		this.events = new VideoEvents();
		
		var container: HTMLElement = document.getElementById(id);
		if(!container) {
			Errors.Report(ErrorType.Fatal, `Container #${id} doesn't exist. Video Player couldn't be initialised.`);
		}
		
		// reset the contents of the container
		while(!!container.firstChild) {
			container.removeChild(container.firstChild);
		}
		
		if(!settings.Localization) {
			// default localization
			var loc: Localization.Player = {
				NoJS:					"Your browser does not support JavaScript or it is turned off. Video can't be recorded without enabled JavaScript in your browser.",
				DataLoadingFailed:      "Unfortunatelly, downloading data failed.",
				DataIsCorrupted:           "This video can't be played, the data is corrupted.",
				
				ControlPlayback:        "Play/Pause video",					
				Play:                   "Play",
				Pause:                  "Pause",
				Replay:                 "Replay",
				
				TimeStatus:             "Video progress",
				
				VolumeControl:          "Volume controls",      
				VolumeUp:               "Volume up",
				VolumeDown:             "Volume down",
				Mute:                   "Mute",
				Busy:                   "Loading..."            
			};				
			settings.Localization = loc;
		}
		
		// new paused timer
		this.timer = new VideoTimer(false);
					
		// init the UI and bind it to an instance of a rendering strategy
		this.ui = !!settings.UI ? settings.UI : new PlayerUI(id, this.events);
		this.ui.Timer = this.timer;
		this.ui.Localization = settings.Localization;
		
		if(!!settings.ShowControls) {
			this.ui.CreateControls(!!settings.Autohide);
		}
		
		// init drawing strategy
		this.drawer = !!settings.DrawingStrategy ? settings.DrawingStrategy : new CanvasDrawer(true);
		this.drawer.SetEvents(this.events);
		
		// bind drawing strategy with the UI
		this.ui.AcceptCanvas(this.drawer.CreateCanvas());
		container.appendChild(this.ui.GetHTML());
											
		// Start and stop the video
		this.events.on(VideoEventType.Start,		    ()	                => this.Play());
		this.events.on(VideoEventType.Pause,            ()                  => this.Pause());
		this.events.on(VideoEventType.ReachEnd,         ()                  => this.Pause());
		this.events.on(VideoEventType.ClearCanvas,		(color: Color)	  	=> this.ClearCavnas(color));
		this.events.on(VideoEventType.ChangeColor,      (color: Color)     	=> this.drawer.SetCurrentColor(color));
		this.events.on(VideoEventType.JumpTo,           (progress: number)  => this.JumpTo(progress));
					
		// Draw path segment by segment
		this.events.on(VideoEventType.DrawSegment,		()	                => this.DrawSegment());
		this.events.on(VideoEventType.DrawPath,         (path: Path)  		=> {
			this.drawnPath.DrawWholePath();
			this.drawnPath = null; // it is already drawn!
		});
		
		// React for busy/ready state changes
		this.busyLevel = 0;
		this.events.on(VideoEventType.Busy,     () => this.Busy());
		this.events.on(VideoEventType.Ready,    () => this.Ready());
		
		// wait until the file is loaded
		this.ui.SetBusyText(settings.Localization.Busy);
		this.events.trigger(VideoEventType.Busy);
								
		File.ReadFileAsync(settings.Source,
			(file: any) => {
				this.ProcessVideoData(file);
				this.MonitorResize(container);                            
				// when the container is resized, stretch the canvas apropriately
				window.onresize = () => this.MonitorResize(container);        
			},
			(errStatusCode: number) => {
				Errors.Report(ErrorType.Warning, this.settings.Localization.DataLoadingFailed);
				this.ui.SetBusyText(settings.Localization.DataLoadingFailed);                  
			}  
		);
	}
	
	/**
	 * Handler of window.onresize event.
	 */
	private MonitorResize(container: HTMLElement): void {
		var rect = container.getBoundingClientRect();
		if(rect.width !== this.oldWidth || rect.height !== this.oldHeight) {
			this.drawer.Stretch();
			var scalingFactor = this.drawer.SetupOutputCorrection(this.video.Metadata.Width, this.video.Metadata.Height);
			this.events.trigger(VideoEventType.CanvasScalingFactor, scalingFactor);
		
			if(!!this.video) {
				this.RedrawCurrentScreen();                    
			}
			this.oldWidth = rect.width;
			this.oldHeight = rect.height;
		}
	}
	
	/**
	 * Processes file data as soon as it is downloaded.
	 * @param   data    The content of the downloaded source document.
	 * @triggersEvents VideoInfoLoaded, Ready, Start
	 */
	private ProcessVideoData(data: any): void {
		try {
			var reader: Reader = !!this.settings.VideoFormat ? this.settings.VideoFormat : new IO();
			this.video = reader.LoadVideo(this.events, data);
			reader = null;
			this.audio = new AudioPlayer(this.events, this.video.Metadata.AudioTracks);                
		} catch (e) {
			// parsing data failed                
			reader = null;
			this.video = null;
			this.audio = null;
			this.ui.SetBusyText(this.settings.Localization.DataIsCorrupted);
			return;
		}
					
		this.events.trigger(VideoEventType.VideoInfoLoaded, this.video.Metadata);
					
		// do zero-time actions:
		this.video.RewindMinusOne(); // churrent chunk <- -1
		this.MoveToNextChunk();
		
		this.events.trigger(VideoEventType.Ready);
		
		// if autostart is set, then this is the right time to start the video 
		if(!!this.settings.Autoplay) {
			this.events.trigger(VideoEventType.Start);
		}
	}        
	
	/**
	 * Start (resume) playing of the video from current position
	 * @handles-event   Start
	 */
	public Play(): void {
		this.isPlaying = true;
		this.timer.Resume();
		!!this.audio && this.audio.Play();
		this.ticking = requestAnimationFrame(() => this.Tick()); // start async ticking
	}
	
	/**
	 * Pause playing of the video immediately
	 * @handles-event   Pause, ReachedEnd
	 */
	public Pause(): void {
		this.timer.Pause();
		this.isPlaying = false;
		!!this.audio && this.audio.Pause();
		cancelAnimationFrame(this.ticking);
	}
	
	/** Animation handler  */
	private ticking: number;
	
	/**
	 * Make one "tick" of the playing algorithm and start a loop using requestAnimationFrame 
	 */
	public Tick() {
		this.Sync();
		this.ticking = requestAnimationFrame(() => this.Tick());
	}
	
	
	private lastMouseMoveState: Command = null;
	
	/**
	 * Synchronize the state of the screen with current time.
	 */
	private Sync(): void {                 
		// loop through the
		while(!!this.video.CurrentChunk) {                        
			// move to next chunk, if the last one just ended
			if(this.video.CurrentChunk.CurrentCommand === undefined) {
				this.MoveToNextChunk();
				
				// I might have reached the end here
				if(!this.video.CurrentChunk
					|| !this.video.CurrentChunk.CurrentCommand) {
						
					// the audio might be running, but there are no more commands,
					// check that it is really the end of the video 
					if(this.timer.CurrentTime() >= this.video.Metadata.Length) {
						this.ReachedEnd();                            
					}                            
					
					break;
				}
			}
			
			if(this.video.CurrentChunk.CurrentCommand.Time > this.timer.CurrentTime()) {
				break;
			}
			
			if(this.video.CurrentChunk.CurrentCommand instanceof MoveCursor) {
				this.lastMouseMoveState = this.video.CurrentChunk.CurrentCommand;
			} else {
				this.video.CurrentChunk.CurrentCommand.Execute(this.events);                    
			}
			
			this.video.CurrentChunk.MoveNextCommand();                
		}
		
		// only one cursor movement per Sync is enough
		if(this.lastMouseMoveState !== null) {
			this.lastMouseMoveState.Execute(this.events);
			this.lastMouseMoveState = null;
		}
					
		if(this.drawnPath !== null) {
			// flush the changes
			this.drawnPath.Draw();
		}
	}
	
	/**
	 * Proceed to next video chunk. This will process as many chunks, as it can, untill current time is reached.
	 * The chunks, that are skipped, are drawn at once.
	 */
	protected MoveToNextChunk() {            
		do {                        
			this.video.MoveNextChunk();                    
			if(!this.video.CurrentChunk) {
				this.ReachedEnd();
				break;
			}
			
			// set current brush color and size, as well as cursor position
			// this will make sure that paths are rendered correctly even though I skip a lot of commands
			this.video.CurrentChunk.ExecuteInitCommands(this.events);      
			
			// Prepare a path, if it is a PathChunk, of course                
			if(this.video.CurrentChunk instanceof PathChunk) {
				this.drawnPath = this.drawer.CreatePath(this.events);
				// copy the information
				var path: Path = (<PathChunk>this.video.CurrentChunk).Path;
				this.drawnPath.Segments = path.Segments;               
				this.drawnPath.Color = path.Color;
				this.drawnSegment = 0; // rewind to the start
				path = this.drawnPath; // replace the old one with this drawer-specific
			} else {
				this.drawnPath = null;
			}
		
			
			if(this.video.PeekNextChunk()
				&& this.video.PeekNextChunk().StartTime <= this.timer.CurrentTime()) {                        
				this.video.CurrentChunk.Render(this.events); // render the whole chunk at once
			} else {
				// this chunk will not be rendered at once
				break;
			}                                            
		} while(true);
	}
	
	/**
	 * Skip to a specific time on the timeline. This method is used mainly when the user clicks
	 * on the progressbar and the percents are calculated.
	 * @param   progress    The progress to jump to in percent (value in [0; 1]).
	 * @triggeres-event Pause, Start
	 * @handles-event   JumpTo
	 */
	public JumpTo(progress: number) : void {
		var wasPlaying: boolean = this.isPlaying;	
		var time = progress * this.video.Metadata.Length; // convert to milliseconds
		var videoTime = this.timer.CurrentTime();
		this.timer.SetTime(time);
		this.audio.JumpTo(progress);
		
		if(this.isPlaying) {
			// pause after setting the time            
			this.events.trigger(VideoEventType.Pause);                
		}
					
		// sync the video:		
		var startChunk = 0;	
		if (time >= videoTime) {          
			startChunk = this.video.FastforwardErasedChunksUntil(time);    
		} else {                  
			startChunk = this.video.RewindToLastEraseBefore(time);
		}
		
		if(startChunk !== this.video.CurrentChunkNumber) {
			this.video.SetCurrentChunkNumber = startChunk - 1;
			this.MoveToNextChunk(); // go throught the next chunk - including executing it's init commands                
		}
		
		this.Sync();  // make as many steps as needed to sync canvas status
		this.ui.UpdateCurrentTime(); // refresh the UI
		
		// video is paused, so ticking won't continue after it is synchronised
		// rendering request will also be made
		
		if(wasPlaying === true) {
			// pause after setting the time            
			this.events.trigger(VideoEventType.Start);
		} 
	}
	
	/**
	 * Redraw current screen - might be necessary after canvas size changes.
	 * @triggersEvents  Pause, Start
	 */
	private RedrawCurrentScreen(): void {
		var wasPlaying: boolean = this.isPlaying;	
		if(this.isPlaying) {
			// pause after setting the time            
			this.events.trigger(VideoEventType.Pause);                
		}
					
		// sync the video:		
		var startChunk = 0;	
		startChunk = this.video.RewindToLastEraseBefore(this.timer.CurrentTime());            
		this.video.SetCurrentChunkNumber = startChunk - 1;
		this.MoveToNextChunk(); // go throught the next chunk - including executing it's init commands
		this.Sync();  // make as many steps as needed to sync canvas status
		
		// video is paused, so ticking won't continue after it is synchronised
		// rendering request will also be made			
		if(wasPlaying === true) {
			// pause after setting the time            
			this.events.trigger(VideoEventType.Start);
		} 
	}
	
	/**
	 * Inform everyone, that I have reached the end
	 * @triggeres-event ReachedEnd
	 */
	private ReachedEnd() : void {
		this.events.trigger(VideoEventType.ReachEnd);			
	}
	
	/**
	 * Make the canvas clean.
	 * @handles-event   ClearCanvas
	 */
	protected ClearCavnas(color: Color): void {
		this.drawer.ClearCanvas(color);
	}
			
	/**
	 * Draw next segment of currently drawn path.
	 */
	protected DrawSegment(): void {
		if(this.drawnSegment === 0) {
			this.drawnPath.StartDrawingPath(<ZeroLengthSegment> this.drawnPath.Segments[0]);
			this.drawnSegment++;
		} else {
			this.drawnPath.DrawSegment(this.drawnPath.Segments[this.drawnSegment++]);                
		}
	}
		
		
	/** Remembers the  */
	private wasPlayingWhenBusy: boolean;
	
	/** How many "busy notifications" have there been, that are not yet ready */
	private busyLevel: number;
		
	/**
	 * Somethimg is taking long time -- probably downloading xml or audio files
	 * @triggeres-event Pause
	 */
	protected Busy(): void {
		this.busyLevel++;
		this.wasPlayingWhenBusy = this.wasPlayingWhenBusy || this.isPlaying;
		this.events.trigger(VideoEventType.Pause);
		this.ui.Busy();
	}
	
	
	/**
	 * The thing that instructed
	 * @triggeres-event    Start 
	 */       
	protected Ready(): void {
		if(--this.busyLevel === 0) {
			if(this.wasPlayingWhenBusy === true) {
				this.events.trigger(VideoEventType.Start);
				this.wasPlayingWhenBusy = false;
			}
			this.ui.Ready();                 
		}
	}
}