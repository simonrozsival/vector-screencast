/// <reference path="BasicElements" />
/// <reference path="Buttons" />
/// <reference path="Color" />
/// <reference path="Brush" />
/// <reference path="Board" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="../Localization/IRecorderLocalization" />
/// <reference path="../Helpers/HelperFunctions" />


module UI {

	/**
	 * This class wraps the whole UI of the recorder.
	 */	
	export class RecorderUI extends Panel {
		
		/** The black board container */
		private board: Board;
		
		/** UI controls */
		private controls: Panel;
			
		/** The element showing the elaspsed time since the begining of recording */
		private timeDisplay: SimpleElement;
			
		/** Is recording running? */
		private isRecording: boolean;
		
		/** Informative recording timer */
		private recordingTimer: Helpers.VideoTimer;
		
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
			
		/**
		 * Create a new instance of Recorder UI
		 * @param	id				Unique ID of this recorder instance
		 * @param	brushSizes		List of possible brush colors
		 * @param	brushSizes		List of possible brush sizes
		 * @param	localization	List of translated strings 
		 */
		constructor(private id: string,
					colorPallete: Array<Color>, 
					brushSizes: Array<BrushSize>,
					private localization: Localization.IRecorderLocalization) {
						
			super("div", `${id}-recorder`);
			this.GetHTML().classList.add("vector-video-wrapper");
			
			// prepare timer
			this.recordingTimer = new Helpers.VideoTimer();
			this.recordingTimer.Pause();
								
			// prepare the board
			this.board = this.CreateBoard();
			this.AddChild(<IElement> this.board);
			
			// prepare the panels
			var controls: Panel = new Panel("div", `${id}-controls`);
			controls.GetHTML().classList.add("vector-video-controls");
			controls.GetHTML().classList.add("autohide");
			controls.GetHTML().classList.add("ui-control");
			
			var buttons: IElement = this.CreateButtonsPanel();
			buttons.GetHTML().classList.add("vector-video-buttons");
			
			var colorsPanel: IElement = this.CreateColorsPanel(colorPallete);
			colorsPanel.GetHTML().classList.add("vector-video-colors");
			
			var sizesPanel: IElement = this.CreateBrushSizesPanel(brushSizes);
			sizesPanel.GetHTML().classList.add("vector-video-sizes");
			
			var erasePanel: IElement = this.CreateErasePanel();
			erasePanel.GetHTML().classList.add("vector-video-erase");
			
			controls.AddChildren([ buttons, colorsPanel, sizesPanel, erasePanel ]);
			
			this.controls = controls;
			this.AddChild(this.controls);			
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
		
		/** REC/PAUSE button */
		private recPauseButton: IconButton;
		
		/** UPLOAD button */
		private uploadButton: IconButton;
		
		/**
		 * Create a panel containing the REC/Pause button and the upload button.
		 */
		private CreateButtonsPanel() : Panel {
			var buttonsPanel: Panel = new Panel("div", `${this.id}-panels`);
			
			// the rec/pause button:
			this.recPauseButton = new IconButton("rec", this.localization.Record, (e) => this.RecordPause());
			
			// the upload button:
			this.uploadButton = new IconButton("upload", this.localization.Upload, (e) => this.InitializeUpload());
			Helpers.HTML.SetAttributes(this.uploadButton.GetHTML(), { "disabled": "disabled" });	
			
			buttonsPanel.AddChildren([ this.recPauseButton, this.uploadButton ]);
			return buttonsPanel;
		}
				
		/**
		 * This function is called when the REC/PAUSE button is clicked.
		 */
		private RecordPause() : void {
			if(this.isRecording === true) {
				this.PauseRecording();
				this.uploadButton.GetHTML().removeAttribute("disabled");
				this.GetHTML().classList.remove("recording");
				this.recordingTimer.Pause();
			} else {
				this.StartRecording();
				Helpers.HTML.SetAttributes(this.uploadButton.GetHTML(), { "disabled": "disabled" });
				this.GetHTML().classList.add("recording");
				this.recordingTimer.Resume();
			}
		}
		
		/** Ticking interval handler */
		private ticking: number;
		
		/** Ticking interval */
		private tickingInterval: number = 100;
		
		/**
		 * Start (or continue) recording
		 */
		private StartRecording() : void {
			this.isRecording = true;
			
			this.recPauseButton.ChangeIcon("pause");
			this.board.IsRecording = true;
			
			this.ticking = setInterval(() => this.Tick(), this.tickingInterval);
			Helpers.VideoEvents.trigger(Helpers.VideoEventType.Start);
		}
		
		/**
		 * Pause recording
		 */
		private PauseRecording() : void {
			this.isRecording = false;			
			
			this.recPauseButton.ChangeIcon("rec");
			this.board.IsRecording = false;
			
			clearInterval(this.ticking);
			Helpers.VideoEvents.trigger(Helpers.VideoEventType.Pause);
		}
		
		/**
		 * Update the displayed time
		 */
		private Tick() : void {
			this.recPauseButton.ChangeContent(Helpers.millisecondsToString(this.recordingTimer.CurrentTime()));
		}
				
		private InitializeUpload() {
			// trigger upload
			Helpers.VideoEvents.trigger(Helpers.VideoEventType.StartUpload);
		}
		
		/**
		 * Create a panel for changing colors
		 * @param	brushSizes	List of possible brush colors
		 */
		private CreateColorsPanel(colorPallete: Array<Color>) : Panel {			
			var panel = new Panel("div", "color-pallete");
			for(var i = 0; i < colorPallete.length; i++) {
				panel.AddChild(new ChangeColorButton(colorPallete[i]));				
			}
			
			return panel;
		}		
		
		/**
		 * Create a panel for changing brush size
		 * @param	brushSizes	List of possible brush sizes
		 */
		private CreateBrushSizesPanel(brushSizes: Array<BrushSize>) : Panel {			
			var panel = new Panel("div", "brush-sizes");
			for(var i = 0; i < brushSizes.length; i++) {
				panel.AddChild(new ChangeBrushSizeButton(brushSizes[i]));				
			}
			
			return panel;
		}	
		
		/**
		 * Create a panel containing the eraser brush and the "erase all button"
		 */
		private CreateErasePanel() : Panel {
			var panel: Panel = new Panel("div", `${this.id}-erase`);
			
			// the eraser button
			panel.AddChild(new ChangeColorButton(UI.Color.BackgroundColor));	
			
			// the "erase all" button:
			var eraseBtn: Button = new IconButton("erase", this.localization.EraseAll, (e) => this.EraseAll());	
			
			panel.AddChild(eraseBtn);
			return panel;
		}
		
		/**
		 * Clear the canvas
		 */
		private EraseAll(): void {
			Helpers.VideoEvents.trigger(Helpers.VideoEventType.ClearCanvas);
		}
	}	
}