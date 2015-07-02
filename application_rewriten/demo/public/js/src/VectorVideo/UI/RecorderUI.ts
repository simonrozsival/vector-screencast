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
		public Localization: Localization.IRecorderLocalization;
		
		/** (High res.) timer */
		public Timer: Helpers.VideoTimer;
			
		/**
		 * Create a new instance of Recorder UI
		 * @param	id				Unique ID of this recorder instance
		 * @param	brushSizes		List of possible brush colors
		 * @param	brushSizes		List of possible brush sizes
		 * @param	localization	List of translated strings 
		 */
		constructor(private id: string) {
						
			super("div", `${id}-recorder`);
			this.AddClass("vector-video-wrapper");											
		}
		
		public CreateHTML(autohide: boolean, colorPallete: Array<Color>, brushSizes: Array<BrushSize>): void {			
			// prepare the board
			this.board = this.CreateBoard();
			
			// prepare the panels
			this.controls = new Panel("div", `${this.id}-controls`)
									.AddChildren(
										this.CreateButtonsPanel().AddClass("ui-controls-panel"),			
										this.CreateColorsPanel(colorPallete).AddClass("ui-controls-panel"),
										this.CreateBrushSizesPanel(brushSizes).AddClass("ui-controls-panel"),			
										this.CreateEraserPanel().AddClass("ui-controls-panel"),			
										this.CreateEraseAllPanel().AddClass("ui-controls-panel")		
									)
									.AddClasses("ui-controls", "ui-control");
									
			// if autohiding is requested, add 'autohide' class
			!!autohide && this.controls.AddClass("autohide");
			
			this.AddChildren(
				this.board,
				new Panel("div").AddClass("ui-controls-wrapper")
								.AddChild(this.controls)
			);
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
			this.recPauseButton = new IconButton("icon-rec", this.Localization.Record, (e) => this.RecordPause());
			
			// the upload button:
			this.uploadButton = new IconButton("icon-upload", this.Localization.Upload, (e) => this.InitializeUpload());
			Helpers.HTML.SetAttributes(this.uploadButton.GetHTML(), { "disabled": "disabled" });	
			
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
		private RecordPause() : void {
			if(this.isRecording === true) {
				this.PauseRecording();
				this.uploadButton.GetHTML().removeAttribute("disabled");
				this.RemoveClass("recording");
			} else {
				this.StartRecording();
				Helpers.HTML.SetAttributes(this.uploadButton.GetHTML(), { "disabled": "disabled" });
				this.AddClass("recording");
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
			
			this.recPauseButton.ChangeIcon("icon-pause");
			this.board.IsRecording = true;
			
			this.ticking = setInterval(() => this.Tick(), this.tickingInterval);
			Helpers.VideoEvents.trigger(Helpers.VideoEventType.Start);
		}
		
		/**
		 * Pause recording
		 */
		private PauseRecording() : void {
			this.isRecording = false;			
			
			this.recPauseButton.ChangeIcon("icon-rec");
			this.board.IsRecording = false;
			
			clearInterval(this.ticking);
			Helpers.VideoEvents.trigger(Helpers.VideoEventType.Pause);
		}
		
		/**
		 * Update the displayed time
		 */
		private Tick() : void {
			this.recPauseButton.ChangeContent(Helpers.millisecondsToString(this.Timer.CurrentTime()));
		}
				
		private InitializeUpload() {
			// disable the record and upload buttons
			Helpers.HTML.SetAttributes(this.recPauseButton.GetHTML(), { "disabled": "disabled" });
			Helpers.HTML.SetAttributes(this.uploadButton.GetHTML(), { "disabled": "disabled" });
			// trigger upload
			Helpers.VideoEvents.trigger(Helpers.VideoEventType.StartUpload);
		}
		
		/**
		 * Create a panel for changing colors
		 * @param	brushSizes	List of possible brush colors
		 */
		private CreateColorsPanel(colorPallete: Array<Color>) : Panel {	
			var colorsGroup = new Panel("div").AddClass("btn-group");					
			for(var i = 0; i < colorPallete.length; i++) {
				var btn = new ChangeColorButton(colorPallete[i]);
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
		private CreateBrushSizesPanel(brushSizes: Array<BrushSize>) : Panel {
			var sizesGroup = new Panel("div").AddClass("btn-group");
			for(var i = 0; i < brushSizes.length; i++) {
				sizesGroup.AddChild(new ChangeBrushSizeButton(brushSizes[i]));			
			}
			
			return new Panel("div")
						.AddClass("brush-sizes")
						.AddChildren(
							new H2(this.Localization.ChangeSize),
							sizesGroup
						);
		}	
		
		/** Current selected color */
		private currentColor: UI.Color;
		
		private switchToEraserButton: ChangeColorButton;
		
		private eraseAllButton: ChangeColorButton;
		
		/**
		 * Create a panel containing the eraser brush and the "erase all button"
		 */
		private CreateEraserPanel() : Panel {			
			this.switchToEraserButton = new ChangeColorButton(UI.Color.BackgroundColor);
			return new Panel("div", `${this.id}-erase`)
						.AddChildren(
							new H2(this.Localization.Erase),
							this.switchToEraserButton
						);
		}
		
		/**
		 * Create a panel containing the eraser brush and the "erase all button"
		 */
		private CreateEraseAllPanel() : Panel {			
			var panel: Panel = new Panel("div", `${this.id}-erase`);
			var title: SimpleElement = new H2(this.Localization.EraseAll);
			panel.AddChild(title);
			
			// the "erase all" button:
			this.eraseAllButton = new ChangeColorButton(UI.Color.BackgroundColor, () => this.EraseAll());	
			Helpers.VideoEvents.on(Helpers.VideoEventType.ChangeColor, (color: UI.Color) => {
				this.currentColor = color;
				this.eraseAllButton.SetColor(color);
			});
			
			panel.AddChild(this.eraseAllButton);
			return panel;
		}
		
		/**
		 * Clear the canvas
		 */
		private EraseAll(): void {
			Helpers.VideoEvents.trigger(Helpers.VideoEventType.ClearCanvas, this.currentColor);
			this.switchToEraserButton.SetColor(this.currentColor);			
		}
	}	
}