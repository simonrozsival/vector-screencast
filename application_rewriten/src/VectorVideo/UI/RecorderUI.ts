/// <reference path="BasicElements" />
/// <reference path="Buttons" />
/// <reference path="Modal" />
/// <reference path="Color" />
/// <reference path="Brush" />
/// <reference path="Board" />
/// <reference path="../Drawing/IDrawingStrategy" />
/// <reference path="../Helpers/HelperFunctions" />

module UI {

	/**
	 * This class wraps the whole UI of the recorder.
	 */	
	export class RecorderUI extends Panel {
		
		/** The black board container */
		private board: Board;
			
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
			return this.board.BackgroundColor;
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
								
			// prepare the board
			this.board = this.CreateBoard();
			this.AddChild(<IElement> this.board);
			
			// prepare the panels
			var controls: Panel = new Panel("div", `${id}-controls`);
			var buttons: IElement = this.CreateButtonsPanel();
			var colorsPanel: IElement = this.CreateColorsPanel(colorPallete);
			var sizesPanel: IElement = this.CreateBrushSizesPanel(brushSizes);
			controls.AddChildren([ buttons, colorsPanel, sizesPanel ]);
			this.AddChild(controls);			
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
		private recPauseButton: Button;
		
		/** UPLOAD button */
		private uploadButton: Button;
		
		/**
		 * Create a panel containing the REC/Pause button and the upload button.
		 */
		private CreateButtonsPanel() : Panel {
			var buttonsPanel: Panel = new Panel("div", `${this.id}-pannels`);
			this.recPauseButton = new Button(this.localization.Record, this.RecordPause);
			this.uploadButton = new Button(this.localization.Upload, this.ShowInfoModal);
			buttonsPanel.AddChildren([ this.recPauseButton, this.uploadButton ]);
			return buttonsPanel;
		}
		
		/**
		 * This function is called when the REC/PAUSE button is clicked.
		 */
		private RecordPause() : void {
			if(this.isRecording === true) {
				this.PauseRecording();
			} else {
				this.StartRecording();
			}
		}
		
		/** Ticking interval handler */
		private ticking: number;
		
		/** The time of recording in milliseconds */
		private recordingTime: number = 0;
		
		/** Ticking interval */
		private tickingInterval: number = 100;
		
		/**
		 * Start (or continue) recording
		 */
		private StartRecording() : void {
			this.isRecording = true;
			this.recPauseButton.GetHTML().classList.add("ui-recording");
			this.recPauseButton.GetHTML().innerText = Helpers.millisecondsToString(this.recordingTime);
			this.ticking = setInterval(this.Tick, this.tickingInterval);
			VideoEvents.trigger(VideoEventType.Start);
		}
		
		/**
		 * Pause recording
		 */
		private PauseRecording() : void {
			this.isRecording = false;			
			this.recPauseButton.GetHTML().classList.remove("ui-recording");
			this.recPauseButton.GetHTML().innerText = this.localization.Record;
			clearInterval(this.ticking);
			VideoEvents.trigger(VideoEventType.Pause);
		}
		
		/**
		 * Update the displayed time
		 */
		private Tick() : void {
			this.recordingTime += this.tickingInterval;
			this.recPauseButton.GetHTML().innerText = Helpers.millisecondsToString(this.recordingTime);
		}
		
		private ShowInfoModal() : void {			
			// show modal
			var modal: UI.FormModal = new UI.FormModal(`${this.id}-modal`,
														this.localization.UploadModalTitle,
														this.localization.Upload,
														this.InitializeUpload);

			modal.AddInput("author", "Your name: ");
			modal.AddInput("title", "Video title: ");
			modal.AddTextArea("description", "Video description: ");
			
			// add the modal to the DOM
			this.AddChild(modal);														
			modal.Show();
		}
		
		private InitializeUpload(results: IModalResults) {
			var info: IVideoInfo;
			
			// user's input
			info.AuthorName = results["author"];
			info.VideoTitle = results["title"];
			info.VideoDescription = results["description"];
			
			// trigger upload
			VideoEvents.trigger(VideoEventType.StartUpload, info);
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
	}
	
}