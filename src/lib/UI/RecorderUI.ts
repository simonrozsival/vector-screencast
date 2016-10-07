
import VideoEvents, { VideoEventType } from '../Helpers/VideoEvents';
import HTML from '../Helpers/HTML';
import VideoTimer from '../Helpers/VideoTimer';
import { millisecondsToString } from '../Helpers/HelperFunctions';
import { IElement, SimpleElement, Panel, IconButton, IconOnlyButton, H2, Div } from './BasicElements';
import { ChangeColorButton, ChangeBrushSizeButton } from './Buttons';
import Board from './Board';
import BrushSize from './Brush';
import Color from '../UI/Color';
import * as Localization from '../Localization/Recorder';
import { IconClasses } from '../Settings/IconClasses';


//namespace VectorScreencast.UI {

	/**
	 * This class wraps the whole UI of the recorder.
	 */	
	export default class RecorderUI extends Panel {
		
		/** The black board container */
		protected board: Board;
		
		public get Board(): Board { return this.board; }
		
		/** UI controls */
		protected controls: Panel;
		
		/** UI components */
		protected components: Panel;
		public get ComponentsLayer(): Panel { return this.components; }
			
		/** The element showing the elaspsed time since the begining of recording */
		protected timeDisplay: SimpleElement;
			
		/** Is recording running? */
		protected isRecording: boolean;
		
		/** Microphone is muted by the user. */
		protected micIsMuted: boolean;
		
		/** Get the width of the board in pixels. */
		public get Width(): number {
			return this.board.Width;
		}
		
		/** Get the height of the board in pixels. */
		public get Height(): number {
			return this.board.Height;
		}
		
		/** Get the background color of the board. */
		public get BackgroundColor(): string {
			return Color.BackgroundColor.CssValue;
		}

		/** Translated strings */
		public Localization: Localization.Recorder;
		
		public Icons: IconClasses; 
		
		/** (High res.) timer */
		public Timer: VideoTimer;
		
		/** Is some of the parts of the video waiting for something? */
		protected isBusy: boolean;
		
		protected events: VideoEvents;
		public set Events(e: VideoEvents) { this.events = e; }
			
		/**
		 * Create a new instance of Recorder UI
		 * @param	id				Unique ID of this recorder instance 
		 */
		constructor(protected id: string) {						
			super('div', `${id}-recorder`);
			this.AddClass("vector-video-wrapper");
			
			this.isRecording = false;
			this.isBusy = false;		
			this.micIsMuted = false;					
			this.board = null;				
		}
		
		public CreateHTML(autohide: boolean, colorPallete: Array<Color>, brushSizes: Array<BrushSize>): void {			
			// prepare the board
			this.board = this.CreateBoard();
			this.components = new Panel('div');
			
			// prepare the panels
			this.controls = this.CreateControlsPanel(colorPallete, brushSizes);
									
			// if autohiding is requested, add 'autohide' class
			!!autohide && this.controls.AddClass("autohide");
			
			this.AddChildren(
				this.board,
				this.components,
				new Panel('div').AddClass("ui-controls-wrapper")
									.AddChild(this.controls)
			);
		}
		
			
		protected CreateControlsPanel(colorPallete: Array<Color>, brushSizes: Array<BrushSize>): Panel {
			return new Panel("div", `${this.id}-controls`)
									.AddChildren(
										this.CreateButtonsPanel().AddClass("ui-controls-panel"),			
										this.CreateColorsPanel(colorPallete).AddClass("ui-controls-panel"),
										this.CreateBrushSizesPanel(brushSizes).AddClass("ui-controls-panel"),			
										this.CreateEraserPanel().AddClass("ui-controls-panel"),
										this.CreateMicPanel().AddClass("ui-controls-panel")	
									)
									.AddClasses("ui-controls", "ui-control");
		}
		
		
		/**
		 * Busy/Ready states
		 */
		 
		public Busy(): void {
			this.AddClass("busy");
			this.isBusy = true;
		}
		
		public Ready(): void {
			this.RemoveClass("busy");
			this.isBusy = false;
		}
		
		public SetBusyText(text: string) {
			HTML.SetAttributes(this.GetHTML(), { "data-busy-string": text });
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
		protected CreateBoard() : Board {
			var board: Board = new Board(`${this.id}-board`, this.events);			
			return board;
		}
		
		/** REC/PAUSE button */
		protected recPauseButton: IconButton;
		
		/** UPLOAD button */
		protected uploadButton: IconButton;
		
		/**
		 * Create a panel containing the REC/Pause button and the upload button.
		 */
		protected CreateButtonsPanel() : Panel {
			
			var buttonsPanel: Panel = new Panel("div", `${this.id}-panels`);
			// the rec/pause button:
			this.recPauseButton = new IconOnlyButton(this.Icons.Rec, this.Localization.Record, (e) => this.RecordPause());
			
			// the upload button:
			this.uploadButton = new IconOnlyButton(this.Icons.Upload, this.Localization.Upload, (e) => this.InitializeUpload());
			HTML.SetAttributes(this.uploadButton.GetHTML(), { "disabled": "disabled" });	
			
			buttonsPanel.AddChildren(
				new H2(this.Localization.RecPause),
				new Panel("div").AddClass("btn-group")
						.AddChildren(
							this.recPauseButton,
							this.uploadButton
						)
			);
			return buttonsPanel;
		}
				
		/**
		 * This function is called when the REC/PAUSE button is clicked.
		 */
		protected RecordPause() : void {
			if(this.isRecording === true) {
				this.PauseRecording();
				this.uploadButton.GetHTML().removeAttribute("disabled");
				this.RemoveClass("recording");
			} else {
				this.StartRecording();
				HTML.SetAttributes(this.uploadButton.GetHTML(), { "disabled": "disabled" });
				this.AddClass("recording");
			}
		}
		
		/** Ticking interval handler */
		protected ticking: number;
		
		/** Ticking interval */
		protected tickingInterval: number = 100;
		
		/**
		 * Start (or continue) recording
		 */
		protected StartRecording() : void {
			if(this.isRecording === false) {
				this.isRecording = true;
				
				this.recPauseButton.ChangeIcon("pause");
				this.board.IsRecording = true;
				
				this.ticking = setInterval(() => this.Tick(), this.tickingInterval);
				this.events.trigger(VideoEventType.Start);				
			}
		}
		
		/**
		 * Pause recording
		 */
		protected PauseRecording() : void {
			if(this.isRecording === true) {
				this.isRecording = false;			
				
				this.recPauseButton.ChangeIcon("rec");
				this.board.IsRecording = false;
				
				clearInterval(this.ticking);
				this.events.trigger(VideoEventType.Pause);				
			}
		}
		
		/**
		 * Update the displayed time
		 */
		protected Tick() : void {
			this.recPauseButton.ChangeContent(millisecondsToString(this.Timer.CurrentTime()));
		}
				
		protected InitializeUpload() {
			// disable the record and upload buttons
			HTML.SetAttributes(this.recPauseButton.GetHTML(), { "disabled": "disabled" });
			HTML.SetAttributes(this.uploadButton.GetHTML(), { "disabled": "disabled" });
			// trigger upload
			this.events.trigger(VideoEventType.StartUpload);
		}
		
		/**
		 * Create a panel for changing colors
		 * @param	brushSizes	List of possible brush colors
		 */
		protected CreateColorsPanel(colorPallete: Array<Color>) : Panel {	
			var colorsGroup = new Panel("div").AddClass("btn-group");					
			for(var i = 0; i < colorPallete.length; i++) {
				var btn = new ChangeColorButton(this.events, colorPallete[i]);
				colorsGroup.AddChild(btn);
			}
			
			return new Panel("div")
						.AddClass("color-pallete")
						.AddChildren(
							new H2(this.Localization.ChangeColor),				
							colorsGroup
						);
		}		
		
		/**
		 * Create a panel for changing brush size
		 * @param	brushSizes	List of possible brush sizes
		 */
		protected CreateBrushSizesPanel(brushSizes: Array<BrushSize>) : Panel {
			var sizesGroup = new Panel("div").AddClass("btn-group");
			for(var i = 0; i < brushSizes.length; i++) {
				sizesGroup.AddChild(new ChangeBrushSizeButton(this.events, brushSizes[i]));			
			}
			
			return new Panel("div")
						.AddClass("brush-sizes")
						.AddChildren(
							new H2(this.Localization.ChangeSize),
							sizesGroup
						);
		}	
		
		/** Current selected color. */
		protected currentColor: Color;
		
		/** Special brush color button - current color of the canvas background. */
		protected switchToEraserButton: ChangeColorButton;
		
		/** Button for clearing the canvas with single color. */
		protected eraseAllButton: ChangeColorButton;
		
		/**
		 * Create a panel containing the eraser brush and the "erase all button"
		 */
		protected CreateEraserPanel() : Panel {			
			var switchToEraserButton = new ChangeColorButton(this.events, Color.BackgroundColor);
			// the "erase all" button:
			this.eraseAllButton = new ChangeColorButton(this.events, Color.BackgroundColor, () => {					
				this.events.trigger(VideoEventType.ClearCanvas, this.currentColor);
				switchToEraserButton.SetColor(this.currentColor);
			});
				
			this.events.on(VideoEventType.ChangeColor, (color: Color) => {
				this.currentColor = color;
				this.eraseAllButton.SetColor(color);
			});
			
			return new Panel("div", `${this.id}-erase`)
						.AddChildren(
							new H2(this.Localization.Erase),
							new Panel("div").AddClass("btn-group")
								.AddChildren(				
									switchToEraserButton,
									this.eraseAllButton
								)
						);
		}		
		
		/** Audio recording control button */
		protected micButton: IconOnlyButton;
		
		/**
		 * Create a panel with microphone statistics. 
		 */
		protected CreateMicPanel(): IElement {
			this.micButton = new IconOnlyButton(this.Icons.MicrophoneDisabled, this.Localization.AudioRecordingUnavailable, () => this.MuteMic());
			HTML.SetAttributes(this.micButton.GetHTML(), { disabled: "disabled" });
			
			// Change the microphone icon and text according to current settings
			this.events.on(VideoEventType.AudioRecordingAvailable, () => {			
				this.micButton.GetHTML().removeAttribute("disabled");
				if(!this.micIsMuted) {
					this.micButton.ChangeIcon(this.Icons.MicrophoneEnabled).ChangeContent(this.Localization.AudioRecordingAvailable);					
				}
			});
			
			this.events.on(VideoEventType.AudioRecordingUnavailable, () => {
				this.micButton.ChangeIcon(this.Icons.MicrophoneDisabled).ChangeContent(this.Localization.AudioRecordingUnavailable);
				HTML.SetAttributes(this.micButton.GetHTML(), { disabled: "disabled" });
			});
			
			return new Panel("div").AddChildren(
				new H2(this.Localization.AudioRecording),
				this.micButton
			);
		}
		
		/**
		 * Mute/Unmute the microphone.
		 */
		protected MuteMic(): void {
			this.events.trigger(VideoEventType.MuteAudioRecording);
			this.micIsMuted = !this.micIsMuted;
			
			if(this.micIsMuted) {
				this.micButton.ChangeIcon("mic-off");
			} else {
				this.micButton.ChangeIcon("mic");
			}			
		}
	}	
//}