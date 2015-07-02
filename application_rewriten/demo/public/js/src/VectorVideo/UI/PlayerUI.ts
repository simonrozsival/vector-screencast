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
				
		/** Container of current time */
		private currentTime: IElement;
		
		/** Panel containing crutial player controls, such as play/pause button or volume controls */
		private controls: Panel;
		
		/** The animated timeline which also enable the user to skip to different parts of the video.  */
		private timeline: TimeLine;
				
		/** Button for toggling autohiding on and off */
		private hidingButton: IconOnlyButton;
				
		/** The total duration of the video in milliseconds */
		private videoDuration: number;
				
		public Localization: Localization.IPlayerLocalization;
		
		public Timer: Helpers.VideoTimer;
		
		/**
		 * Create a new instance of Player UI
		 * @param	id				Unique ID of this recorder instance
		 * @param	localization	List of translated strings 
		 */
		constructor(private id: string) {
						
			super("div", `${id}-player`);
			this.AddClass("vector-video-wrapper");
			
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
		
		public CreateHTML(autohide: boolean): void {			
			Helpers.HTML.SetAttributes(this.GetHTML(), { "data-busy-string": this.Localization.Busy });
								
			// prepare the board
			this.board = this.CreateBoard();
			
			// prepare the timeline and other controls
			this.timeline = this.CreateTimeLine();	
			this.hidingButton = <IconOnlyButton> new IconOnlyButton("icon-hidding-toggle", "", (e: Event) => this.ToggleAutohiding())
												.AddClasses("autohiding-toggle", autohide ? "show" : "hide");
															
			this.controls = new Panel("div", `${this.id}-controls`)
									.AddClasses("ui-controls", "ui-control")
									.AddChildren(
										this.CreateButtonsPanel(),
										this.timeline,
										this.CreateTimeStatus(),
										this.CreateAudioControls()				
									);										
									
			// if autohiding is requested, add 'autohide' class
			!!autohide && this.controls.AddClass("autohide");
			
			
			this.AddChildren(
				this.board,
				new Panel("div")
					.AddClass("ui-controls-wrapper")
					.AddChildren(
						this.controls,
						this.hidingButton
					)
			);
			
			// Set the duration of the video as soon as available
			VideoEvents.on(VideoEventType.VideoInfoLoaded, (meta: VideoData.Metadata) => {
				this.videoDuration = meta.Length;
				this.totalTime.GetHTML().textContent = Helpers.millisecondsToString(meta.Length);
				this.timeline.Length = meta.Length;
			});
			VideoEvents.on(VideoEventType.BufferStatus, (seconds: number) => this.timeline.SetBuffer(seconds * 1000)); // convert to milliseconds first			
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
						this.timeline.SkipTo(this.Timer.CurrentTime() - skipTime);
						break;
					case rightArrow:
						this.timeline.SkipTo(this.Timer.CurrentTime() + skipTime);
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
			board.GetHTML().onclick = () => this.PlayPause();	
			return board;
		}
		
		/** PLAY/PAUSE button */
		private playPauseButton: IconButton;
				
		/**
		 * Create a panel containing the PLAY/PAUSE button and the upload button.
		 */
		private CreateButtonsPanel() : Panel {
			this.playPauseButton = new IconOnlyButton("icon-play", this.Localization.Play, (e) => this.PlayPause());
			return <Panel> new Panel("div")
						.AddChildren(
							new H2(this.Localization.ControlPlayback),
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
			this.playPauseButton.ChangeContent(this.Localization.Pause);
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
			this.playPauseButton.ChangeContent(this.Localization.Play);
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
					new H2(this.Localization.TimeStatus),
					new Panel("div")
						.AddChildren(
							this.currentTime,
							new SimpleElement("span", " / "),
							this.totalTime							
						)
						.AddClass("ui-time")
				)
				.AddClass("ui-controls-panel");
		}
		
		/** Ticking interval handler */
		private ticking: number;
		
		/** Ticking interval - not too often, but precise enough */
		private tickingInterval: number = 200;
		
		/**
		 * @param	time	Current time in seconds
		 */
		public UpdateCurrentTime() : void {
			this.currentTime.GetHTML().textContent = Helpers.millisecondsToString(this.Timer.CurrentTime());
			this.timeline.Sync(this.Timer.CurrentTime());
		}
		
		
		/**
		 * React to end of playing - show the replay button
		 */
		public ReachedEnd(): void {
			this.PausePlaying();
			this.playPauseButton.ChangeIcon("icon-replay").ChangeContent(this.Localization.Replay);
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
					new H2(this.Localization.VolumeControl),
					new Panel("div", `${this.id}-audio-controls`)
						.AddChildren(
							new IconOnlyButton("icon-volume-down", this.Localization.VolumeDown, (e) => this.VolumeDown()),
							new IconOnlyButton("icon-volume-up", this.Localization.VolumeUp, (e) => this.VolumeUp()),
							new IconOnlyButton("icon-mute", this.Localization.Mute, (e) => this.Mute())
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
		
		/**
		 * Autohiding the toolbar
		 */
		
		protected ToggleAutohiding(): void {
			if(this.controls.HasClass("autohide")) {
				this.controls.RemoveClass("autohide");
				this.hidingButton.ChangeIcon("hide");
			} else {
				this.controls.AddClass("autohide");
				this.hidingButton.ChangeIcon("show");
			}
		}
		 
	}
	
}