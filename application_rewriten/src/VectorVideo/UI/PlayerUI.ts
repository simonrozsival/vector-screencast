/// <reference path="BasicElements" />
/// <reference path="Buttons" />
/// <reference path="Modal" />
/// <reference path="Color" />
/// <reference path="Brush" />
/// <reference path="Board" />
/// <reference path="TimeLine" />
/// <reference path="../Drawing/IDrawingStrategy" />
/// <reference path="../Helpers/HelperFunctions" />

module UI {

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
		private Length: number;
		
		/**
		 * Create a new instance of Player UI
		 * @param	id				Unique ID of this recorder instance
		 * @param	localization	List of translated strings 
		 */
		constructor(private id: string,					
					private localization: Localization.IPlayerLocalization) {
						
			super("div", `${id}-player`);
								
			// prepare the board
			this.board = this.CreateBoard();
			this.AddChild(<IElement> this.board);
			
			// prepare the panels
			var controls: Panel = new Panel("div", `${id}-controls`);
			var buttons: IElement = this.CreateButtonsPanel();			
			controls.AddChildren([ buttons ]);
			this.AddChild(controls);
			
			// allow keyboard
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
						this.timeline.SkipTo(this.time - skipTime);
						break;
					case rightArrow:
						this.timeline.SkipTo(this.time + skipTime);
						break;		
				}
			};
		}
		
		/**
		 * Integrate the canvas into the UI elements tree
		 */
		public AcceptCanvas(canvas: IElement) {
			this.board.AddChild(canvas);
		}
		
		/**
		 * Create the 
		 */
		private CreateBoard() : Board {
			var board: Board = new Board(`${this.id}-board`);			
			return board;
		}
		
		/** PLAY/PAUSE button */
		private playPauseButton: Button;
		
		/**
		 * Create a panel containing the PLAY/PAUSE button and the upload button.
		 */
		private CreateButtonsPanel() : Panel {
			var buttonsPanel: Panel = new Panel("div", `${this.id}-pannels`);
			this.playPauseButton = new Button(this.localization.Play, this.PlayPause);
			buttonsPanel.AddChildren([ this.playPauseButton ]);						
			return buttonsPanel;
		}
		
		/**
		 * This function is called when the PLAY/PAUSE button is clicked.
		 */
		private PlayPause() : void {
			if(this.isPlaying === true) {
				this.PausePlaying();
			} else {
				this.StartPlaying();
			}
		}
				
		/**
		 * Start (or continue) recording
		 */
		private StartPlaying() : void {
			this.isPlaying = true;
			this.playPauseButton.GetHTML().classList.add("ui-playing");
			this.playPauseButton.GetHTML().innerText = this.localization.Pause;
			VideoEvents.trigger(VideoEventType.Start);
						
			// update time periodically
			this.ticking = setInterval(this.UpdateCurrentTime, this.tickingInterval);
		}
		
		/**
		 * Pause playback
		 */
		private PausePlaying() : void {
			this.isPlaying = false;			
			this.playPauseButton.GetHTML().classList.remove("ui-playing");
			this.playPauseButton.GetHTML().innerText = this.localization.Play;
			VideoEvents.trigger(VideoEventType.Pause);
			
			// do not update the status and timeline while paused
			clearInterval(this.ticking);
		}
						
		private CreateTimeLine() : IElement {
			var timeline: Panel = new TimeLine(`${this.id}-timeline`);			
			return timeline;
		}
		
		private CreateTimeStatus() : IElement {			
			var status: Panel = new Panel("div", `${this.id}-timeline`);
			
			var currentTime: IElement = new SimpleElement("span", "0:00");
			var slash: IElement = new SimpleElement("span", "&nbsp;/&nbsp;");
			var totalTime: IElement = new SimpleElement("span", "0:00");
			
			status.AddChildren([ currentTime, slash, totalTime ]); 
			return status;
		}
		
		/** Ticking interval handler */
		private ticking: number;
		
		/** The time of recording in milliseconds */
		private time: number = 0;
		
		/** Ticking interval */
		private tickingInterval: number = 100;
		
		/**
		 * @param	time	Current time in seconds
		 */
		private UpdateCurrentTime() : void {
			this.time += this.tickingInterval;
			this.currentTime.GetHTML().textContent = Helpers.millisecondsToString(this.time);
			this.timeline.GetHTML().style.width = this.Length > 0 ? `${this.time/this.Length}%` : "0%";
		}
	}
	
}