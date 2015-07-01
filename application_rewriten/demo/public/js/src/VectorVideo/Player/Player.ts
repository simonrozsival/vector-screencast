/// <reference path="../Helpers/Errors" />
/// <reference path="../Drawing/DrawingStrategy" />
/// <reference path="../Drawing/SVGDrawer" />
/// <reference path="../Settings/PlayerSettings" />
/// <reference path="../UI/PlayerUI" />
/// <reference path="../AudioData/AudioPlayer" />
/// <reference path="../VideoData/Video" />
/// <reference path="../VideoFormat/IO" />
/// <reference path="../VideoFormat/SVGAnimation/IO" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="../UI/Cursor" />
/// <reference path="../Helpers/State" />


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
				    Play:                   "Play",
                    Pause:                  "Pause"
				};				
				settings.Localization = loc;
			}
            
            // new paused timer
            this.timer = new Helpers.VideoTimer(false);
                       
            // init the UI and bind it to an instance of a rendering strategy
            this.ui = new UI.PlayerUI(id, settings.Localization, this.timer);
            //this.drawer = !!settings.DrawingStrategy ? settings.DrawingStrategy : new Drawing.SVGDrawer(true);
            this.drawer = !!settings.DrawingStrategy ? settings.DrawingStrategy : new Drawing.CanvasDrawer(true);
            this.ui.AcceptCanvas(this.drawer.CreateCanvas());
            container.appendChild(this.ui.GetHTML());
            this.drawer.Stretch();
                        
            // read the file
            Helpers.File.ReadXmlAsync(settings.Source,
                
                (xml: XMLDocument) => this.AcceptXMLData(xml),                
                (errStatusCode: number) => {
                    Errors.Report(ErrorType.Warning, this.settings.Localization.DataLoadingFailed);
                }
                     
            );
                        
			// Start and stop the video
			VideoEvents.on(VideoEventType.Start,		    ()	                  => this.Play());
            VideoEvents.on(VideoEventType.Pause,            ()                    => this.Pause());
            VideoEvents.on(VideoEventType.ReachEnd,         ()                    => this.Pause());
            VideoEvents.on(VideoEventType.ClearCanvas,		(color: UI.Color)	  => this.ClearCavnas(color));
	        VideoEvents.on(VideoEventType.ChangeColor,      (color: UI.Color)     => this.drawer.SetCurrentColor(color));
                        
			// Draw path segment by segment
			VideoEvents.on(VideoEventType.DrawSegment,		()	                  => this.DrawSegment());
            VideoEvents.on(VideoEventType.DrawPath,         (path: Drawing.Path)  => {
                this.drawnPath.DrawWholePath();
                this.drawnPath = null; // it is already drawn!
            });
        }
        
        private AcceptXMLData(xml: XMLDocument): void {
            var reader: VideoFormat.Reader = new VideoFormat.SVGAnimation.IO();
            this.video = reader.LoadVideo(xml);
            this.audio = new AudioPlayer(this.video.Metadata.AudioTracks);
            
            VideoEvents.trigger(VideoEventType.VideoInfoLoaded, this.video.Metadata);
            var scalingFactor = this.drawer.SetupOutputCorrection(this.video.Metadata.Width, this.video.Metadata.Height);
            VideoEvents.trigger(VideoEventType.CanvasScalingFactor, scalingFactor);
            
            // do zero-time actions:
            this.video.RewindMinusOne(); // churrent chunk = -1
            this.MoveToNextChunk();
        }        
        
        /**
         * Start (resume) playing of the video from current position
         */
        public Play(): void {
            this.isPlaying = true;
            this.timer.Resume();
            this.audio.Play();
            this.ticking = requestAnimationFrame(() => this.Tick()); // start async ticking
        }
        
        /**
         * Pause playing of the video immediately
         */
        public Pause(): void {
            this.timer.Pause();
            this.isPlaying = false;
            this.audio.Pause();
            cancelAnimationFrame(this.ticking);
        }
        
        /** Animation handler  */
        private ticking: number;
        
        public Tick() {
            this.Sync();
            this.ticking = requestAnimationFrame(() => this.Tick());
        }
        
        private Sync(): void {            
            // loop through the
            while(!!this.video.CurrentChunk
                    && !!this.video.CurrentChunk.CurrentCommand
                    && this.video.CurrentChunk.CurrentCommand.Time <= this.timer.CurrentTime()) {
                        
                this.video.CurrentChunk.CurrentCommand.Execute();
                this.video.CurrentChunk.MoveNextCommand();
                
                // move to next chunk, if the last one just ended
                if(this.video.CurrentChunk.CurrentCommand === undefined) { 
                    this.MoveToNextChunk();
                }
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
                    this.drawnPath.Segments = (<VideoData.PathChunk>this.video.CurrentChunk).Path.Segments;                    
                    this.drawnSegment = 0; // rewind to the start
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
			this.Pause();		
			var time = progress * this.video.Metadata.Length * 1000; // convert to milliseconds
			
            if (time >= this.timer.CurrentTime()) {                  
                this.video.FastforwardErasedChunksUntil(time);    
			} else {                  
                this.video.RewindToLastEraseBefore(time);
			}                 
            
			this.timer.SetTime(time);
			this.Sync(); // make as many steps as needed to sync canvas status
			// video is paused, so ticking won't continue after it is synchronised
			// rendering request will also be made
			
			if(wasPlaying === true) {
				this.Play(); // continue from the new point in time
			} 
		}
        
		/**
		 * Inform everyone, that I have reached the end
		 */
		private ReachedEnd() : void {
			VideoEvents.trigger(VideoEventType.ReachEnd);			
		}
        
        protected ClearCavnas(color: UI.Color): void {
            this.drawer.ClearCanvas(color);
        }
                
        protected DrawSegment(): void {
            if(this.drawnSegment === 0) {
                this.drawnPath.StartDrawingPath(<Drawing.ZeroLengthSegment> this.drawnPath.Segments[0]);
                this.drawnSegment++;
            } else {
                this.drawnPath.DrawSegment(this.drawnPath.Segments[this.drawnSegment++]);                
            }
            
            // flush the changes
            this.drawnPath.Draw();
        }
                
    }
}

