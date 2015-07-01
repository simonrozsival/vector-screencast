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
				
		/**  */
		private currentTime: IElement;
		
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
			this.GetHTML().classList.add("vector-video-wrapper");
								
			// prepare the board
			this.board = this.CreateBoard();
			this.AddChild(<IElement> this.board);
			
			// prepare the panels
			var controls: Panel = new Panel("div", `${id}-controls`);
			controls.GetHTML().classList.add("vector-video-controls", "autohide", "ui-control");
			
			var buttons: IElement = this.CreateButtonsPanel();
			this.timeline = this.CreateTimeLine();
			var timeStatus = this.CreateTimeStatus();
			
			controls.AddChildren([ buttons, this.timeline, timeStatus ]);
			this.AddChild(controls);
			
			// Set the duration of the video as soon as available
			VideoEvents.on(VideoEventType.VideoInfoLoaded, (meta: VideoData.Metadata) => {
				this.videoDuration = meta.Length;
				this.totalTime.GetHTML().textContent = Helpers.millisecondsToString(meta.Length);
				this.timeline.Length = meta.Length;
			});
			VideoEvents.on(VideoEventType.BufferStatus, (status: number) => this.timeline.SetBuffer(status));
			
			// allow keyboard
			this.BindKeyboardShortcuts();
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
			var buttonsPanel: Panel = new Panel("div", `${this.id}-pannels`);
			this.playPauseButton = new IconButton("icon-play", this.localization.Play, (e) => this.PlayPause());
			buttonsPanel.AddChildren([ this.playPauseButton ]);
			return buttonsPanel;
		}
		
		/**
		 * This function is called when the PLAY/PAUSE button is clicked.
		 */
		private PlayPause() : void {
			if(this.isPlaying === true) {
				this.PausePlaying();
				this.GetHTML().classList.remove("playing");
			} else {
				this.StartPlaying();
				this.GetHTML().classList.add("playing");
			}
		}
				
		/**
		 * Start (or continue) recording
		 */
		private StartPlaying() : void {
			this.isPlaying = true;
			this.playPauseButton.ChangeIcon("icon-pause");
			this.playPauseButton.ChangeContent(this.localization.Pause);
			VideoEvents.trigger(VideoEventType.Start);
						
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
			VideoEvents.trigger(VideoEventType.Pause);
			
			// do not update the status and timeline while paused
			clearInterval(this.ticking);
		}
						
		private CreateTimeLine() : TimeLine {
			var timeline: TimeLine = new TimeLine(`${this.id}-timeline`);			
			return timeline;
		}
		
		private totalTime: IElement;
		
		private CreateTimeStatus() : IElement {			
			var status: Panel = new Panel("div", `${this.id}-current-time`);
			status.GetHTML().classList.add("ui-time");
			
			this.currentTime = new SimpleElement("span", "0:00");
			var slash: IElement = new SimpleElement("span", " / ");
			this.totalTime = new SimpleElement("span", "0:00");
			
			status.AddChildren([ this.currentTime, slash, this.totalTime ]); 
			return status;
		}
		
		/** Ticking interval handler */
		private ticking: number;
		
		/** Ticking interval - not too often, but precise enough */
		private tickingInterval: number = 200;
		
		/**
		 * @param	time	Current time in seconds
		 */
		private UpdateCurrentTime() : void {
			this.currentTime.GetHTML().textContent = Helpers.millisecondsToString(this.timer.CurrentTime());
			this.timeline.Sync(this.timer.CurrentTime());
		}
	}
	
}