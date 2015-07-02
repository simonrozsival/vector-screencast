/// <reference path="BasicElements" />
/// <reference path="Buttons" />
/// <reference path="Color" />
/// <reference path="Brush" />
/// <reference path="Board" />
/// <reference path="TimeLine" />
/// <reference path="../Helpers/HelperFunctions" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="../Localization/IPlayerLocalization" />

module UI {

	import VideoEvents = Helpers.VideoEvents;
	import VideoEventType = Helpers.VideoEventType;


	/**
	 * This class wraps the whole UI of the recorder.
	 */	
	export class PlayerUI extends Panel {
		
		/** The black board container */
		private board: Board;
			
		/** Is recording running? */
		private isPlaying: boolean;
		
		private reachedEnd: boolean;
				
		/**  */
		private currentTime: IElement;
		
		/**  */
		private controls: Panel;
		
		/**  */
		private timeline: TimeLine;
				
		/**  */
		private videoDuration: number;
		
		/**
		 * Create a new instance of Player UI
		 * @param	id				Unique ID of this recorder instance
		 * @param	localization	List of translated strings 
		 */
		constructor(private id: string,					
					private localization: Localization.IPlayerLocalization,
					private timer: Helpers.VideoTimer) {
						
			super("div", `${id}-player`);
			this.AddClass("vector-video-wrapper");
			Helpers.HTML.SetAttributes(this.GetHTML(), { "data-busy-string": this.localization.Busy });
								
			// prepare the board
			this.board = this.CreateBoard();
			
			// prepare the panels
			this.timeline = this.CreateTimeLine();			
			this.controls = <Panel> new Panel("div", `${id}-controls`)
								.AddChildren(this.CreateButtonsPanel(), this.timeline, this.CreateTimeStatus(), this.CreateAudioControls())
								.AddClasses("vector-video-controls", "autohide", "ui-control");
			
			this.AddChildren(this.board, this.controls);
			
			// Set the duration of the video as soon as available
			VideoEvents.on(VideoEventType.VideoInfoLoaded, (meta: VideoData.Metadata) => {
				this.videoDuration = meta.Length;
				this.totalTime.GetHTML().textContent = Helpers.millisecondsToString(meta.Length);
				this.timeline.Length = meta.Length;
			});
			VideoEvents.on(VideoEventType.BufferStatus, (seconds: number) => this.timeline.SetBuffer(seconds * 1000)); // convert to milliseconds first
			
			// React to events triggered from outside
			VideoEvents.on(VideoEventType.Start, () => this.StartPlaying());
			VideoEvents.on(VideoEventType.Pause, () => this.PausePlaying());		
			VideoEvents.on(VideoEventType.ReachEnd, () => this.ReachedEnd());
			VideoEvents.on(VideoEventType.ClearCanvas, (c: Color) => this.GetHTML().style.backgroundColor = c.CssValue); // make the bg of the player match the canvas 
			
			// allow keyboard
			this.BindKeyboardShortcuts();
			
			// set current state
			this.isPlaying = false;
			this.reachedEnd = false;
		}
		
		public HideControls(): void {
			this.controls.GetHTML().style.display = "none";
		}
				
		public ShowControls(): void {
			this.controls.GetHTML().style.display = "block";
		}
		
		/**
		 * 
		 */
		private BindKeyboardShortcuts() : void {
			const spacebar: number = 32;
			const leftArrow: number = 37;
			const rightArrow: number = 39;
			const skipTime: number = 5000; // 5 seconds
			
			window.onkeyup = (e) => {
				switch (e.keyCode) {
					case spacebar:				
						this.PlayPause();
						break;			
					case leftArrow:
						this.timeline.SkipTo(this.timer.CurrentTime() - skipTime);
						break;
					case rightArrow:
						this.timeline.SkipTo(this.timer.CurrentTime() + skipTime);
						break;		
				}
			};
		}
		
		/**
		 * Integrate the canvas into the UI elements tree
		 */
		public AcceptCanvas(canvas: Element) {
			this.board.GetHTML().appendChild(canvas);
		}
		
		/**
		 * Create the 
		 */
		private CreateBoard() : Board {
			var board: Board = new Board(`${this.id}-board`);			
			return board;
		}
		
		/** PLAY/PAUSE button */
		private playPauseButton: IconButton;
				
		/**
		 * Create a panel containing the PLAY/PAUSE button and the upload button.
		 */
		private CreateButtonsPanel() : Panel {
			this.playPauseButton = new IconOnlyButton("icon-play", this.localization.Play, (e) => this.PlayPause());
			return <Panel> new Panel("div")
						.AddChildren(
							new H2(this.localization.ControlPlayback),
							this.playPauseButton
						)
						.AddClass("ui-controls-panel");
		}
		
		/**
		 * This function is called when the PLAY/PAUSE button is clicked.
		 */
		private PlayPause() : void {
			if(this.reachedEnd) {
				this.reachedEnd = false;
				this.timeline.SkipTo(0); // jump to the start				
				VideoEvents.trigger(VideoEventType.Start);
				return;
			}
			
			if(this.isPlaying === true) {
				this.PausePlaying();
				VideoEvents.trigger(VideoEventType.Pause);
			} else {
				this.StartPlaying();
				VideoEvents.trigger(VideoEventType.Start);
			}
		}
				
		/**
		 * Start (or continue) recording
		 */
		private StartPlaying() : void {
			this.isPlaying = true;
			this.playPauseButton.ChangeIcon("icon-pause");
			this.playPauseButton.ChangeContent(this.localization.Pause);
			this.AddClass("playing");
						
			// update time periodically
			this.ticking = setInterval(() => this.UpdateCurrentTime(), this.tickingInterval);
		}
		
		/**
		 * Pause playback
		 */
		private PausePlaying() : void {
			this.isPlaying = false;			
			this.playPauseButton.ChangeIcon("icon-play");
			this.playPauseButton.ChangeContent(this.localization.Play);
			this.RemoveClass("playing");
			
			// do not update the status and timeline while paused
			clearInterval(this.ticking);
		}
						
		private CreateTimeLine() : TimeLine {
			return new TimeLine(`${this.id}-timeline`);
		}
		
		private totalTime: IElement;
		
		private CreateTimeStatus() : IElement {			
			this.currentTime = new SimpleElement("span", "0:00");
			this.totalTime = new SimpleElement("span", "0:00");
			
			return new Panel("div")
				.AddChildren(
					new H2(this.localization.TimeStatus),
					this.currentTime,
					new SimpleElement("span", " / "),
					this.totalTime
				)
				.AddClasses("ui-controls-panel", "ui-time");
		}
		
		/** Ticking interval handler */
		private ticking: number;
		
		/** Ticking interval - not too often, but precise enough */
		private tickingInterval: number = 200;
		
		/**
		 * @param	time	Current time in seconds
		 */
		public UpdateCurrentTime() : void {
			this.currentTime.GetHTML().textContent = Helpers.millisecondsToString(this.timer.CurrentTime());
			this.timeline.Sync(this.timer.CurrentTime());
		}
		
		
		/**
		 * React to end of playing - show the replay button
		 */
		public ReachedEnd(): void {
			this.PausePlaying();
			this.playPauseButton.ChangeIcon("icon-replay").ChangeContent(this.localization.Replay);
			this.reachedEnd = true;
		}
		
		/**
		 * Busy/Ready states
		 */
		 
		public Busy(): void {
			this.AddClass("busy");
		}
		
		public Ready(): void {
			this.RemoveClass("busy");
		}
		
		/**
		 * Volume controls
		 */
		 
		protected CreateAudioControls(): IElement {
			return new Panel("div", `${this.id}-audio`)
				.AddChildren(
					new H2(this.localization.VolumeControl),
					new Panel("div", `${this.id}-audio-controls`)
						.AddChildren(
							new IconOnlyButton("icon-volume-down", this.localization.VolumeDown, (e) => this.VolumeDown()),
							new IconOnlyButton("icon-volume-up", this.localization.VolumeUp, (e) => this.VolumeUp()),
							new IconOnlyButton("icon-mute", this.localization.Mute, (e) => this.Mute())
						)
						.AddClass("btn-group")
				)
				.AddClasses("ui-controls-panel", "vector-video-audio-controls");
		}
		
		protected VolumeUp(): void {
			VideoEvents.trigger(VideoEventType.VolumeUp);
		}
		
		protected VolumeDown(): void {
			VideoEvents.trigger(VideoEventType.VolumeDown);
		}		 
		 
		protected Mute(): void {
			VideoEvents.trigger(VideoEventType.Mute);
		}
	}
	
}