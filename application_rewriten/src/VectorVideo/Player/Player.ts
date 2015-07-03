/// <reference path="../Helpers/Errors" />
/// <reference path="../Drawing/DrawingStrategy" />
/// <reference path="../Drawing/SVGDrawer" />
/// <reference path="../Drawing/CanvasDrawer" />
/// <reference path="../Settings/PlayerSettings" />
/// <reference path="../UI/PlayerUI" />
/// <reference path="../AudioData/AudioPlayer" />
/// <reference path="../VideoData/Video" />
/// <reference path="../VideoFormat/IO" />
/// <reference path="../VideoFormat/SVGAnimation/IO" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="../UI/Cursor" />
/// <reference path="../Helpers/State" />
/// <reference path="../VideoFormat/JSONAnimation/IO" />

module VectorVideo {
    
    import Video = VideoData.Video;
    import AudioPlayer = AudioData.AudioPlayer;
    
    import VideoEvents = Helpers.VideoEvents;
    import VideoEventType = Helpers.VideoEventType;
    
    import Errors = Helpers.Errors;
    import ErrorType = Helpers.ErrorType;
    import CursorState = Helpers.CursorState;
    
    export class Player {
        
        /** Data of the currently played video */
        protected video: Video;
        
        /** HTML5 Audio player wrapper */
        protected audio: AudioPlayer;
        
        /** The UI */        
        protected ui: UI.PlayerUI;
        
        /** Drawing strategy - reconsruct recorded data */
        protected drawer: Drawing.DrawingStrategy;
        
        /** Remembers current state of the player */
        protected isPlaying: boolean;
        
        /** Current time */
        protected timer: Helpers.VideoTimer;
        
        /** Currently drawn path */
        protected drawnPath: Drawing.Path;
        protected drawnSegment: number;
                                
        constructor(id: string, private settings: Settings.IPlayerSettings) {
            var container: HTMLElement = document.getElementById(id);
            if(!container) {
				Helpers.Errors.Report(Helpers.ErrorType.Fatal, `Container #${id} doesn't exist. Video Player couldn't be initialised.`);
            }
            
			if(!settings.Localization) {
				// default localization
				var loc: Localization.IPlayerLocalization = {
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
            this.timer = new Helpers.VideoTimer(false);
                       
            // init the UI and bind it to an instance of a rendering strategy
            this.ui = !!settings.UI ? settings.UI : new UI.PlayerUI(id);
            this.ui.Timer = this.timer;
            this.ui.Localization = settings.Localization;
            
            if(!!settings.ShowControls) {
                this.ui.CreateControls(!!settings.Autohide);
            }
            
            // init drawing strategy
            this.drawer = !!settings.DrawingStrategy ? settings.DrawingStrategy : new Drawing.CanvasDrawer(true);
            
            // bind drawing strategy with the UI
            this.ui.AcceptCanvas(this.drawer.CreateCanvas());
            container.appendChild(this.ui.GetHTML());
            this.drawer.Stretch();
                                                
			// Start and stop the video
			VideoEvents.on(VideoEventType.Start,		    ()	                  => this.Play());
            VideoEvents.on(VideoEventType.Pause,            ()                    => this.Pause());
            VideoEvents.on(VideoEventType.ReachEnd,         ()                    => this.Pause());
            VideoEvents.on(VideoEventType.ClearCanvas,		(color: UI.Color)	  => this.ClearCavnas(color));
	        VideoEvents.on(VideoEventType.ChangeColor,      (color: UI.Color)     => this.drawer.SetCurrentColor(color));
            VideoEvents.on(VideoEventType.JumpTo,           (progress: number)    => this.JumpTo(progress));
                        
			// Draw path segment by segment
			VideoEvents.on(VideoEventType.DrawSegment,		()	                  => this.DrawSegment());
            VideoEvents.on(VideoEventType.DrawPath,         (path: Drawing.Path)  => {
                this.drawnPath.DrawWholePath();
                this.drawnPath = null; // it is already drawn!
            });
            
            // React for busy/ready state changes
            this.busyLevel = 0;
            VideoEvents.on(VideoEventType.Busy,     () => this.Busy());
            VideoEvents.on(VideoEventType.Ready,    () => this.Ready());
            
            // wait until the file is loaded
            VideoEvents.trigger(VideoEventType.Busy);
                                    
            Helpers.File.ReadFileAsync(settings.Source,
                (file: any) => this.ProcessVideoData(file),
                (errStatusCode: number) => {
                    Errors.Report(ErrorType.Warning, this.settings.Localization.DataLoadingFailed);
                    this.ui.SetBusyText(settings.Localization.DataLoadingFailed);                  
                }  
            );
        }
        
        private ProcessVideoData(data: any): void {
            try {
                var reader: VideoFormat.Reader = !!this.settings.VideoFormat ? this.settings.VideoFormat : new VideoFormat.SVGAnimation.IO();
                this.video = reader.LoadVideo(data);
                reader = null;
                this.audio = new AudioPlayer(this.video.Metadata.AudioTracks);                
            } catch (e) {
                // parsing data failed                
                reader = null;
                this.video = null;
                this.audio = null;
                this.ui.SetBusyText(this.settings.Localization.DataIsCorrupted);
                return;
            }
            
            VideoEvents.trigger(VideoEventType.VideoInfoLoaded, this.video.Metadata);
            var scalingFactor = this.drawer.SetupOutputCorrection(this.video.Metadata.Width, this.video.Metadata.Height);
            VideoEvents.trigger(VideoEventType.CanvasScalingFactor, scalingFactor);
            
            // do zero-time actions:
            this.video.RewindMinusOne(); // churrent chunk <- -1
            this.MoveToNextChunk();
            
            VideoEvents.trigger(VideoEventType.Ready);
            
            // if autostart is set, then this is the right time to start the video 
            if(!!this.settings.Autoplay) {
                VideoEvents.trigger(VideoEventType.Start);
            }
        }        
        
        /**
         * Start (resume) playing of the video from current position
         */
        public Play(): void {
            this.isPlaying = true;
            this.timer.Resume();
            !!this.audio && this.audio.Play();
            this.ticking = requestAnimationFrame(() => this.Tick()); // start async ticking
        }
        
        /**
         * Pause playing of the video immediately
         */
        public Pause(): void {
            this.timer.Pause();
            this.isPlaying = false;
            !!this.audio && this.audio.Pause();
            cancelAnimationFrame(this.ticking);
        }
        
        /** Animation handler  */
        private ticking: number;
        
        public Tick() {
            this.Sync();
            this.ticking = requestAnimationFrame(() => this.Tick());
        }
        
        
        private lastMouseMoveState: VideoData.Command = null;
        private Sync(): void {                 
            // loop through the
            while(!!this.video.CurrentChunk) {                        
                // move to next chunk, if the last one just ended
                if(this.video.CurrentChunk.CurrentCommand === undefined) {
                    this.MoveToNextChunk();
                    
                    // I might have reached the end here
                    if(!this.video.CurrentChunk) {
                        this.ReachedEnd();
                        return;
                    }
                }
                
                if(this.video.CurrentChunk.CurrentCommand.Time > this.timer.CurrentTime()) {
                    break;
                }
                
                if(this.video.CurrentChunk.CurrentCommand instanceof VideoData.MoveCursor) {
                    this.lastMouseMoveState = this.video.CurrentChunk.CurrentCommand;
                } else {
                    this.video.CurrentChunk.CurrentCommand.Execute();                    
                }
                
                this.video.CurrentChunk.MoveNextCommand();                
            }
            
            // only one cursor movement per Sync is enough
            if(this.lastMouseMoveState !== null) {
                this.lastMouseMoveState.Execute();
                this.lastMouseMoveState = null;
            }
                        
            if(this.drawnPath !== null) {
                // flush the changes
                this.drawnPath.Draw();
            }
        }
        
        protected MoveToNextChunk() {            
            do {                        
                this.video.MoveNextChunk();                    
                if(!this.video.CurrentChunk) {
                    this.ReachedEnd();
                    break;
                }
                
                // set current brush color and size, as well as cursor position
                // this will make sure that paths are rendered correctly even though I skip a lot of commands
                this.video.CurrentChunk.ExecuteInitCommands();      
                
                // Prepare a path, if it is a PathChunk, of course                
                if(this.video.CurrentChunk instanceof VideoData.PathChunk) {
                    this.drawnPath = this.drawer.CreatePath();
                    // copy the information
                    var path: Drawing.Path = (<VideoData.PathChunk>this.video.CurrentChunk).Path;
                    this.drawnPath.Segments = path.Segments;               
                    this.drawnPath.Color = path.Color;
                    this.drawnSegment = 0; // rewind to the start
                    path = this.drawnPath; // replace the old one with this drawer-specific
                } else {
                    this.drawnPath = null;
                }
            
                
                if(this.video.PeekNextChunk()
                    && this.video.PeekNextChunk().StartTime <= this.timer.CurrentTime()) {                        
                    this.video.CurrentChunk.Render(); // render the whole chunk at once
                } else {
                    // this chunk will not be rendered at once
                    break;
                }                                            
            } while(true);
        }
        
        /**
         * Skip to a specific time on the timeline. This method is used mainly when the user clicks
         * on the progressbar and the percents are calculated.
         * @param   {number}    progress    The progress to jump to in percent (value in [0; 1]).
         */
		public JumpTo(progress: number) : void {
			var wasPlaying: boolean = this.isPlaying;	
			var time = progress * this.video.Metadata.Length; // convert to milliseconds
            var videoTime = this.timer.CurrentTime();
			this.timer.SetTime(time);
            this.audio.JumpTo(progress);
            
            if(this.isPlaying) {
                // pause after setting the time            
    			VideoEvents.trigger(VideoEventType.Pause);                
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
    			VideoEvents.trigger(VideoEventType.Start);
			} 
		}
        
		/**
		 * Inform everyone, that I have reached the end
		 */
		private ReachedEnd() : void {
			VideoEvents.trigger(VideoEventType.ReachEnd);			
		}
        
        /**
         * Make the canvas clean.
         */
        protected ClearCavnas(color: UI.Color): void {
            this.drawer.ClearCanvas(color);
        }
                
        /**
         * Draw next segment of currently drawn path.
         */
        protected DrawSegment(): void {
            if(this.drawnSegment === 0) {
                this.drawnPath.StartDrawingPath(<Drawing.ZeroLengthSegment> this.drawnPath.Segments[0]);
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
         */
         protected Busy(): void {
             this.busyLevel++;
             this.wasPlayingWhenBusy = this.wasPlayingWhenBusy || this.isPlaying;
             VideoEvents.trigger(VideoEventType.Pause);
             this.ui.Busy();
         }
         
         
         /**
          * The thing that instructed 
          */       
         protected Ready(): void {
             if(--this.busyLevel === 0) {
                 if(this.wasPlayingWhenBusy === true) {
                     VideoEvents.trigger(VideoEventType.Start);
                     this.wasPlayingWhenBusy = false;
                 }
                 this.ui.Ready();                 
             }
         }
    }
}

