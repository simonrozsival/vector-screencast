/// <reference path="../Settings/BrushSettings" />
/// <reference path="../Settings/RecorderSettings" />
/// <reference path="../AudioData/AudioRecorder" />
/// <reference path="../VideoData/PointingDevice" />
/// <reference path="../VideoData/Mouse" />
/// <reference path="../VideoData/Touch" />
/// <reference path="../VideoData/Pointer" />
/// <reference path="../VideoData/WacomTablet" />
/// <reference path="../Drawing/SVGDrawer" />
/// <reference path="../Drawing/CanvasDrawer" />
/// <reference path="../Drawing/DynaDraw" />
/// <reference path="../VideoData/Metadata" />
/// <reference path="../VideoData/Video" />
/// <reference path="../Helpers/File" />
/// <reference path="../UI/RecorderUI" />
/// <reference path="../UI/BasicElements" />
/// <reference path="../Localization/IRecorderLocalization" />
/// <reference path="../VideoFormat/SVGAnimation/IO" />

module VectorVideo {
	
	import Video = VideoData.Video;
	
	import Mouse = VideoData.Mouse;
	import WacomTablet = VideoData.WacomTablet;
	import TouchEventsAPI = VideoData.TouchEventsAPI;
	import PointerEventsAPI = VideoData.PointerEventsAPI;	
	import IWacomApi = VideoData.IWacomApi;
	
	import SVGDrawer = Drawing.SVGDrawer;
	import CanvasDrawer = Drawing.CanvasDrawer;
	
	import AudioRecorder = AudioData.AudioRecorder;
	import AudioSource = AudioData.AudioSource; 
	
	import Errors = Helpers.Errors;
	import ErrorType = Helpers.ErrorType;
	
	import VideoEvents = Helpers.VideoEvents;
	import VideoEventType = Helpers.VideoEventType;
	
	import Metadata = VideoData.Metadata;
	import CursorState = Helpers.CursorState;
	
	export class Recorder {	
		/** The best available drawing strategy */
		private dynaDraw: Drawing.DynaDraw;
		private drawer: Drawing.DrawingStrategy;
			
		/** UI factory */
		private ui: UI.RecorderUI;
		
		/** Audio recording */
		private audioRecorder: AudioRecorder;
	
		/** Current state of the Recorder */
		private isRecording: boolean;
		
		/** Recorded data */
		protected data: Video;	
		protected lastEraseData: number;
		
		/** (High resolution) timer */
		protected timer: Helpers.VideoTimer;
		
		/** Recording might be blocked at some moment - i.e. when uploading data */
		protected recordingBlocked: boolean;
		
		// Current state values:
		private currColor: UI.Color;
		private currSize: UI.BrushSize;
		private lastCurState: CursorState;
		
		/**
		 * Create a new instance of recorder.
		 * @param	id			Unique ID of this Recorder instance
		 * @param	sttings		Recorder settings
		 */
		constructor(private id: string, private settings: Settings.IRecorderSettings) {
			// do not start recording until the user want's to start
			this.isRecording = false;
						
			// create paused stopwatch
			this.timer = new Helpers.VideoTimer(false);
			
			// recording is allowed even when not recording - but will be blcoked
			// when upload starts
			this.recordingBlocked = false;
					
			// prepare data storage
			this.data = new Video();
			this.lastEraseData = 0;
			
			
			
			//
			// THE UI
			//
			
			// select the container - it must exist
			var container: HTMLElement = document.getElementById(id);
			if(!container) {
				Errors.Report(ErrorType.Fatal, `Container #${id} doesn't exist. Video Recorder couldn't be initialised.`);
				return; // do not start
			}
						
			if(!!settings.Audio) {
				// only if settings are 
				this.audioRecorder = new AudioRecorder(settings.Audio);
				this.audioRecorder.Init();				
			}
			
			if(!settings.ColorPallete || settings.ColorPallete.length === 0) {
				// default color pallete
				var colors: Array<UI.Color> = [];
				colors.push(new UI.Color("white", 	"#ffffff"));
				colors.push(new UI.Color("red", 	"#fa5959"));
				colors.push(new UI.Color("green", 	"#8cfa59"));
				colors.push(new UI.Color("blue", 	"#59a0fa"));
				colors.push(new UI.Color("yellow", 	"#fbff06"));
				colors.push(UI.Color.BackgroundColor);
				settings.ColorPallete = colors;
			}
			
			if(!settings.BrushSizes || settings.BrushSizes.length === 0) {
				// default brush sizes
				var brushes: Array<UI.BrushSize> = [];
				brushes.push(new UI.BrushSize("pixel", 	 2,	"px"));
				brushes.push(new UI.BrushSize("odd", 	 3,	"px"));
				brushes.push(new UI.BrushSize("tiny", 	 4,	"px"));
				brushes.push(new UI.BrushSize("ok", 	 6,	"px"));
				brushes.push(new UI.BrushSize("small", 	 8,	"px"));
				brushes.push(new UI.BrushSize("medium", 10, "px"));
				brushes.push(new UI.BrushSize("large", 	15, "px"));
				brushes.push(new UI.BrushSize("extra", 	80, "px"));
				settings.BrushSizes = brushes;				
			}
			
			if(!settings.Localization) {
				// default localization
				var loc: Localization.IRecorderLocalization = {
					NoJS:					"Your browser does not support JavaScript or it is turned off. Video can't be recorded without enabled JavaScript in your browser.",
					RecPause:				"Control recording",
					Record:					"Start",
					Pause:					"Pause recording",
					Upload:					"Upload",
					ChangeColor:			"Change brush color",
					ChangeSize:				"Change brush size",
					Erase:					"Eraser",
					EraseAll:				"Erase everything",
					WaitingText:			"Please be patient. Uploading video usually takes some times - up to a few minutes if your video is over ten minutes long. Do not close this tab or browser window.",
					UploadWasSuccessful:	"Upload was successful",
					RedirectPrompt:			"Upload was successful - do you want to view your just recorded video?",
					FailureApology:			"Upload failed. Do you want to download your data to your computer instead?",												
				};				
				settings.Localization = loc;
			}
	
			// Bind video events
			VideoEvents.on(VideoEventType.ChangeBrushSize, 	(size: 	UI.BrushSize)		=> this.ChangeBrushSize(size));
			VideoEvents.on(VideoEventType.ChangeColor, 		(color: UI.Color) 			=> this.ChangeColor(color));
			VideoEvents.on(VideoEventType.CursorState, 		(state: CursorState) 		=> this.ProcessCursorState(state));
			VideoEvents.on(VideoEventType.ClearCanvas,		(color: UI.Color)			=> this.ClearCanvas(color));			
			VideoEvents.on(VideoEventType.Start, 			() 							=> this.Start());
			VideoEvents.on(VideoEventType.Continue,			()							=> this.Continue());
			VideoEvents.on(VideoEventType.Pause,			()							=> this.Pause());
			VideoEvents.on(VideoEventType.StartUpload,		()							=> this.StartUpload());
			
			// Record paths
			VideoEvents.on(VideoEventType.StartPath,		(path: Drawing.Path)	=> {
				this.PushChunk(new VideoData.PathChunk(path, this.timer.CurrentTime(), this.lastEraseData));
				this.data.CurrentChunk.PushCommand(new VideoData.DrawNextSegment(this.timer.CurrentTime())); // draw the start dot
			});
			VideoEvents.on(VideoEventType.DrawSegment,		()						=> this.data.CurrentChunk.PushCommand(new VideoData.DrawNextSegment(this.timer.CurrentTime())));
			
			
			var min: number = brushes.reduce((previousValue: UI.BrushSize, currentValue: UI.BrushSize, index: number, arr: Array<UI.BrushSize>) => previousValue.Size < currentValue.Size ? previousValue : currentValue).Size;
			var max: number = brushes.reduce((previousValue: UI.BrushSize, currentValue: UI.BrushSize, index: number, arr: Array<UI.BrushSize>) => previousValue.Size > currentValue.Size ? previousValue : currentValue).Size;				
																
			// the most important part - the rendering and drawing strategy
			// - default drawing strategy is using SVG
			this.drawer = !!settings.DrawingStrategy ? settings.DrawingStrategy : new SVGDrawer(true);
			this.dynaDraw = new Drawing.DynaDraw(() => this.drawer.CreatePath(), true, min, max, this.timer);
			
			// create UI and connect it to the drawer			
			this.ui = new UI.RecorderUI(id, settings.ColorPallete, settings.BrushSizes, settings.Localization, this.timer);
			this.ui.AcceptCanvas(this.drawer.CreateCanvas());
			container.appendChild(this.ui.GetHTML()); 
			this.drawer.Stretch(); // adapt to the environment
			
			// select best input method
			var wacomApi: IWacomApi = WacomTablet.IsAvailable();
			if(window.hasOwnProperty("PointerEvent")) {
				var pointer = new PointerEventsAPI(container);
				pointer.InitControlsAvoiding();
				console.log("Pointer Events API is used");
			} else if (wacomApi !== null) {
				var tablet = new WacomTablet(container, wacomApi);
				console.log("Wacom WebPAPI is used");
			} else {
				var mouse = new Mouse(container);
				mouse.InitControlsAvoiding();
				var touch = new TouchEventsAPI(container);
				console.log("Mouse and Touch Events API are used.");
			}
			
			// init board state
			this.currColor = UI.Color.ForegroundColor;
			this.currSize = brushes.length > 0 ? brushes[0] : new UI.BrushSize("default", 5, "px");
			this.lastCurState = new CursorState(0, 0, 0, 0); // reset the cursor
		
			// set default bg color and init the first chunk
			this.ClearCanvas(UI.Color.BackgroundColor); 
			// init some values for the brush - user will change it immediately, but some are needed from the very start
			VideoEvents.trigger(VideoEventType.ChangeColor, this.currColor);
			VideoEvents.trigger(VideoEventType.ChangeColor, this.currSize);
		}
		
		/**
		 * Start recording. Everything must be initialised
		 * and from this moment all data must be stored properly.
		 */
		private Start() : void {
			this.isRecording = true;
			this.PushChunk(new VideoData.VoidChunk(this.timer.CurrentTime(), this.lastEraseData));			
			this.timer.Resume();
			if(this.audioRecorder) { this.audioRecorder.Start(); }
		}
	
		/**
		 * Pause recording. Do not record data temporarily.
		 */
		private Pause() : void {
			this.isRecording = false;
			this.PushChunk(new VideoData.VoidChunk(this.timer.CurrentTime(), this.lastEraseData));
			this.timer.Pause();
			if(this.audioRecorder) { this.audioRecorder.Pause(); }
		}
	
		/**
		 * Continue recording after the process has been paused for a while.
		 */
		private Continue() : void {
			this.isRecording = true;
			this.timer.Resume();
			if(this.audioRecorder) { this.audioRecorder.Continue(); }
			this.PushChunk(new VideoData.VoidChunk(this.timer.CurrentTime(), this.lastEraseData));
		}
			
		/**
		 * Stop recording and upload the recorded data.
		 */
		private StartUpload() : void {
			// do not record any new data
			this.recordingBlocked = true;
			
			// prepare metadata based on current status
			var info: Metadata = new Metadata();
			info.Length = this.timer.CurrentTime();
			info.Width = this.ui.Width;
			info.Height = this.ui.Height;
			info.AudioTracks = [];			
			this.data.Metadata = info;			
			
			if(!!this.audioRecorder
				&& this.audioRecorder.isRecording()) {					
				this.audioRecorder.Stop(
					(files: Array<AudioSource>) => {
						this.data.Metadata.AudioTracks = files;
						this.UploadData();
					},
					() => {
						this.FinishRecording(false); // upload of audio failed
					}
				);
			} else {
				// there was no audio
				this.UploadData();
			}
		}
		
		/**
		 * User want's to change brush thickness.
		 * @param	size	New brush size
		 */
		private ChangeBrushSize(size: UI.BrushSize) : void {			
			// User can change the size even if recording hasn't started or is paused
			this.currSize = size;
			!this.recordingBlocked && this.data.CurrentChunk.PushCommand(new VideoData.ChangeBrushSize(size, this.timer.CurrentTime()))
			this.dynaDraw.SetBrushSize(size);
		}
		
		/**
		 * User want's to change brush color.
		 * @param	colo	New brush color
		 */
		private ChangeColor(color: UI.Color) : void {
			// User can change the color even if recording hasn't started or is paused
			this.currColor = color;
			!this.recordingBlocked && this.data.CurrentChunk.PushCommand(new VideoData.ChangeBrushColor(color, this.timer.CurrentTime()))
			this.drawer.SetCurrentColor(color);
		}
		
		/**
		 * User moved the mouse or a digital pen.
		 */
		private ProcessCursorState(state: CursorState) {
			this.lastCurState = state;
			!this.recordingBlocked && this.data.CurrentChunk.PushCommand(new VideoData.MoveCursor(state.X, state.Y, state.Pressure, this.timer.CurrentTime()));
			this.dynaDraw.ObserveCursorMovement(state);
		}
				
		/**
		 * User moved the mouse or a digital pen.
		 */
		private ClearCanvas(color: UI.Color) {
			// add data only if recording is in progress
			var time: number = this.timer.CurrentTime();
			this.lastEraseData = this.PushChunk(new VideoData.EraseChunk(color, time, this.lastEraseData));
			this.data.CurrentChunk.PushCommand(new VideoData.ClearCanvas(time, color));
			this.drawer.ClearCanvas(color);
		}
		
		private PushChunk(chunk: VideoData.Chunk): number {			
			// set init commands
			chunk.InitCommands.push(new VideoData.ChangeBrushSize(this.currSize, chunk.StartTime));
			chunk.InitCommands.push(new VideoData.ChangeBrushColor(this.currColor, chunk.StartTime));
			chunk.InitCommands.push(new VideoData.MoveCursor(this.lastCurState.X, this.lastCurState.Y, this.lastCurState.Pressure, chunk.StartTime));
			// now push it
			return this.data.PushChunk(chunk);
		}
			
		//
		// Upload the result
		//
	
		/**
		 * Upload the recorded data to the server.
		 * @param	info	Information about the video.
		 */
		private UploadData() : void {			
			// get the recorded XML
			var writer: VideoFormat.Writer = new VideoFormat.SVGAnimation.IO();
			var xml: Blob = writer.SaveVideo(this.data);
			console.log(xml);
			Helpers.File.Download(xml, "recorded.svg");
				
			// if I need saving the data to local computer in the future
			VideoEvents.on(VideoEventType.DownloadData, function() {
				Helpers.File.Download(xml, "recorded-animation.svg");
			});
		
			// Upload the data via POST Ajax request
			var req: XMLHttpRequest = new XMLHttpRequest();
			req.open("POST", this.settings.UploadURL, true); // async post request			
			req.onerror = (e: Event) => this.FinishRecording(false); // upload failed
			req.onload = (e: Event) => {
				var response: any = JSON.parse(req.responseBody);
				if(req.status === 200 // HTTP code 200 === success
					&& response.hasOwnProperty("success")
					&& response.success === true) {
					
						var url: string = response.hasOwnProperty("redirect") ? response.redirect : false;	
						this.FinishRecording(true, url);
				} else {
					this.FinishRecording(false); // upload failed
				}
			};
			//req.send(xml);
		}
		
	
	
		/**
		 * Redirect the user after successfully finishing recording.
		 * Nothing is returned, if everything is OK and the user agrees
		 * then user is redirected to the player to check his recording.
		 * 
		 * @param  success	Was the whole process successful?
		 * @param  url 		Url to be redirected to
		 */
		private FinishRecording(success: boolean, url?: string|boolean) : void {
			// inform everyone..
			VideoEvents.trigger(VideoEventType.RecordingFinished);
			
			// 
			if(success === true) {		
				if(typeof url === "string") {
					if(confirm(this.settings.Localization.RedirectPrompt)) {
						window.location.replace(url);
					}					
				} else {
					alert(this.settings.Localization.UploadWasSuccessful);
				}
			} else {
				if(confirm(this.settings.Localization.FailureApology)) {
					// download all the recorded data locally
					VideoEvents.trigger(VideoEventType.DownloadData);
				}
			}
		}
	}
	
}

