import VideoEvents, { VideoEventType } from '../Helpers/VideoEvents';
import HTML from '../Helpers/HTML';
import VideoTimer from '../Helpers/VideoTimer';
import { millisecondsToString } from '../Helpers/HelperFunctions';

import { IElement, SimpleElement, Panel, IconButton, IconOnlyButton, H2, Span } from './BasicElements';
import Board from './Board';
import BrushSize from './Brush';
import Color from '../UI/Color';
import TimeLine from './TimeLine';
import * as Localization from '../Localization/Player';
import Metadata from '../VideoData/Metadata';

//namespace VectorScreencast.UI {


	/**
	 * This class wraps the whole UI of the recorder.
	 */	
	export default class PlayerUI extends Panel {
		
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
				
		public Localization: Localization.Player;
		
		public Timer: VideoTimer;
		
		private isBusy: boolean = false;
		
		/**
		 * Create a new instance of Player UI
		 * @param	id				Unique ID of this recorder instance
		 */
		constructor(private id: string, protected events: VideoEvents) {						
			super("div", `${id}-player`);
			this.AddClass("vector-video-wrapper");
			
			// prepare the board
			this.board = this.CreateBoard();
			this.AddChild(this.board);
						
			// React to events triggered from outside
			this.events.on(VideoEventType.Start, () => this.StartPlaying());
			this.events.on(VideoEventType.Pause, () => this.PausePlaying());		
			this.events.on(VideoEventType.ReachEnd, () => this.ReachedEnd());
			this.events.on(VideoEventType.JumpTo, () => this.JumpTo());
			this.events.on(VideoEventType.ClearCanvas, (c: Color) => this.GetHTML().style.backgroundColor = c.CssValue); // make the bg of the player match the canvas 
						
			// set current state
			this.isPlaying = false;
			this.reachedEnd = false;
		}
		
		public CreateControls(autohide: boolean): void {	
			// prepare the timeline and other controls
			this.timeline = this.CreateTimeLine();	
			this.hidingButton = <IconOnlyButton> new IconOnlyButton(autohide ? "show" : "hide", "", (e: Event) => this.ToggleAutohiding())
												.AddClasses("autohiding-toggle");
															
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
				new Panel("div")
					.AddClass("ui-controls-wrapper")
					.AddChildren(
						this.controls,
						this.hidingButton
					)
			);
			
			// Set the duration of the video as soon as available
			this.events.on(VideoEventType.VideoInfoLoaded, (meta: Metadata) => {
				this.videoDuration = meta.Length;
				this.totalTime.GetHTML().textContent = millisecondsToString(meta.Length);
				this.timeline.Length = meta.Length;
			});
			this.events.on(VideoEventType.BufferStatus, (seconds: number) => this.timeline.SetBuffer(seconds * 1000)); // convert to milliseconds first
			
			// allow keyboard
			this.BindKeyboardShortcuts();			
		}
		
		/**
		 * Set the text of the "busy" state overlay screen.
		 * @param	text	User information.
		 */
		public SetBusyText(text: string) {
			HTML.SetAttributes(this.GetHTML(), { "data-busy-string": text });
		}
		
		/**
		 * Handle key-up events to make player usage more intuitive.
		 * Handled keys:
		 * - spacebar: play/pause
		 * - left arrow: skip 5 seconds backwards
		 * - right arrow: skip 5 seconds forward
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
						this.timeline.SkipTo(Math.max(0, this.Timer.CurrentTime() - skipTime));
						break;
					case rightArrow:
						this.timeline.SkipTo(Math.min(this.Timer.CurrentTime() + skipTime, this.videoDuration));
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
			var board: Board = new Board(`${this.id}-board`, this.events);		
			board.GetHTML().onclick = () => this.PlayPause();	
			return board;
		}
		
		/** PLAY/PAUSE button */
		private playPauseButton: IconButton;
				
		/**
		 * Create a panel containing the PLAY/PAUSE button and the upload button.
		 */
		private CreateButtonsPanel() : Panel {
			this.playPauseButton = new IconOnlyButton("play", this.Localization.Play, (e) => this.PlayPause());
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
			// do not allow to start playing while busy
			if(this.isBusy || !this.controls) return;
			
			if(this.reachedEnd) {
				this.reachedEnd = false;
				this.timeline.SkipTo(0); // jump to the start				
				this.events.trigger(VideoEventType.Start);
				return;
			}
			
			if(this.isPlaying === true) {
				this.PausePlaying();
				this.events.trigger(VideoEventType.Pause);
			} else {
				this.StartPlaying();
				this.events.trigger(VideoEventType.Start);
			}
		}
		
		private JumpTo(): void {
			if(!this.controls) return;
			if(this.reachedEnd === true) {
				this.reachedEnd = false; // user has skipped somewhere - but definitely not directly to the end (100%)				
				this.playPauseButton.ChangeIcon("play");
			}
		}
				
		/**
		 * Start (or continue) recording
		 */
		private StartPlaying() : void {
			if(!this.controls) return;
			if(this.isPlaying === false) {
				this.isPlaying = true;
				this.playPauseButton.ChangeIcon("pause");
				this.playPauseButton.ChangeContent(this.Localization.Pause);
				this.AddClass("playing");
							
				// update time periodically
				this.ticking = setInterval(() => this.UpdateCurrentTime(), this.tickingInterval);				
			}
		}
		
		/**
		 * Pause playback
		 */
		private PausePlaying() : void {
			if(!this.controls) return;
			
			this.isPlaying = false;			
			this.playPauseButton.ChangeIcon("play");
			this.playPauseButton.ChangeContent(this.Localization.Play);
			this.RemoveClass("playing");
			
			// do not update the status and timeline while paused
			clearInterval(this.ticking);
		}
		
		/**
		 * Create an instance of a timeline.
		 * @return		Timeline instance.
		 */				
		private CreateTimeLine() : TimeLine {
			return new TimeLine(`${this.id}-timeline`, this.events);
		}
		
		/** Element with the ifnromation about the total duration of the video. */
		private totalTime: IElement;
		
		/**
		 * Creates a panel with the information about the progress of the video.
		 */
		private CreateTimeStatus() : IElement {			
			this.currentTime = new Span("0:00");
			this.totalTime = new Span("0:00");
			
			return new Panel("div")
				.AddChildren(
					new H2(this.Localization.TimeStatus),
					new Panel("div")
						.AddChildren(
							this.currentTime,
							new Span(" / "),
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
		 * @param	time	Optional - specific time in seconds
		 */
		public UpdateCurrentTime(time?: number) : void {
			this.currentTime.GetHTML().textContent = millisecondsToString(!!time ? time : this.Timer.CurrentTime());
			this.timeline.Sync(!!time ? time : this.Timer.CurrentTime());
		}
		
		
		/**
		 * React to end of playing - show the replay button
		 */
		public ReachedEnd(): void {
			if(!this.controls) return;
			this.PausePlaying();
			this.playPauseButton.ChangeIcon("replay").ChangeContent(this.Localization.Replay);
			this.reachedEnd = true;			
			this.UpdateCurrentTime(); // make the time be exacetely the duration of the video and the timeline is at 100%
		}
		
		/**
		 * Show information, that the player is currently busy and waits for something.
		 */		 
		public Busy(): void {
			this.AddClass("busy");
			this.isBusy = true;
		}
		
		/**
		 * Remove the "busy state" information.
		 */
		public Ready(): void {
			this.RemoveClass("busy");
			this.isBusy = false;
		}
		
		/**
		 * Volume controls
		 */
		
		/** Decrease volume button. */
		private volumeDownBtn: IconOnlyButton;
		
		/** Increase volume button. */
		private volumeUpBtn: IconOnlyButton;
		
		/** Mute/unmute audio button. */
		private volumeOffBtn: IconOnlyButton;
		 
		/**
		 * Creates a panel with volume up, down and mute buttons.
		 * @return		Panel with audio control buttons.
		 */
		protected CreateAudioControls(): IElement {
			return new Panel("div", `${this.id}-audio`)
				.AddChildren(
					new H2(this.Localization.VolumeControl),
					new Panel("div", `${this.id}-audio-controls`)
						.AddChildren(
							(this.volumeDownBtn = new IconOnlyButton("volume-down", this.Localization.VolumeDown, (e) => this.VolumeDown())),
							(this.volumeUpBtn = new IconOnlyButton("volume-up", this.Localization.VolumeUp, (e) => this.VolumeUp())),
							(this.volumeOffBtn = new IconOnlyButton("volume-off", this.Localization.Mute, (e) => this.Mute()))
						)
						.AddClass("btn-group")
				)
				.AddClasses("ui-controls-panel", "vector-video-audio-controls");
		}
		
		/**
		 * Increase volume
		 * @triggeres-event	VolumeUp
		 */
		protected VolumeUp(): void {
			this.events.trigger(VideoEventType.VolumeUp);
		}
		
		/**
		 * Decrease volume.
		 * @triggers-event	VolumeDown
		 */
		protected VolumeDown(): void {
			this.events.trigger(VideoEventType.VolumeDown);
		}		 
		 
		/** Is the audio muted at the moment? */
		private isMuted: boolean = false;
		
		/**
		 * Mute/unmute the audio and adjust the button look appropriatelly
		 * @triggers-event	Mute
		 */
		protected Mute(): void {
			if(!this.isMuted) {
				HTML.SetAttributes(this.volumeDownBtn.GetHTML(), { disabled: "disabled" });
				HTML.SetAttributes(this.volumeUpBtn.GetHTML(), { disabled: "disabled" });
				this.volumeOffBtn.AddClass("active");
			} else {				
				this.volumeDownBtn.GetHTML().removeAttribute("disabled");
				this.volumeUpBtn.GetHTML().removeAttribute("disabled");
				this.volumeOffBtn.RemoveClass("active");
			}
			
			this.isMuted = !this.isMuted;
			this.events.trigger(VideoEventType.Mute);
		}
		
		/**
		 * Turns autohiding of the toolbar on/off.
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
	
//}