/// <reference path="VectorScreencast" />
module VectorScreencast {

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
	import VET = Helpers.VideoEventType;

	import Metadata = VideoData.Metadata;
	import CursorState = Helpers.CursorState;

	
	/**
	 * Temporary fix for wrong type definition in TypeScript 1.5 beta
	 * - according to the lib.d.ts the XMLHttpRequest.send(data) method doesn't have an overload
	 * for sending a Blob, which it shouhld have.
	 * 
	 * @see https://github.com/Microsoft/TypeScript/issues/3002
	 */
	interface XMLHttpRequest_fix extends XMLHttpRequest {
	    send(data?: any): void;
	}



	/**
	 * The main class responsible for video recording. Recorder creates all the necessary
	 * objects and connects them. Recorder captures user's input and actions and stores them
	 * and uploads it to the server when the recording is finsihed.
	 */
	export class Recorder {	
		/** Line drawing algorithm */
		private dynaDraw: Drawing.DynaDraw;
		
		/** Current drawing strategy */
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
				
		// Cursor movement and pressure is irrelevant for playback, should it be recorded anyway?
		private recordAllRawData: boolean;
		
        /** The instance of video events aggregator */
        private events: VideoEvents;
        public get Events(): VideoEvents { return this.events; }
		
		/**
		 * Create a new instance of recorder.		 
         * @param   id          ID of the container element
		 * @param	sttings		User's own recorder settings
		 */
		constructor(private id: string, private settings: Settings.RecorderSettings) {
			this.events = new VideoEvents();
			
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
			
			// by default record all the data that goes through the recorder
			this.recordAllRawData = settings.RecordAllRawData !== undefined ? !!settings.RecordAllRawData : true;
			
			
			//
			// THE UI
			//
			
			// set the colors according to the 
			if(!!settings.DefaultBackgroundColor) UI.Color.BackgroundColor = settings.DefaultBackgroundColor;
			if(!!settings.DefaultBrushColor) UI.Color.ForegroundColor = settings.DefaultBrushColor;
			
			// select the container - it must exist
			var container: HTMLElement = document.getElementById(id);
			if (!container) {
				Errors.Report(ErrorType.Fatal, `Container #${id} doesn't exist. Video Recorder couldn't be initialised.`);
				return; // do not start
			}
			
            // reset the contents of the container
            while(!!container.firstChild) {
                container.removeChild(container.firstChild);
            }

			if (!settings.ColorPallete || settings.ColorPallete.length === 0) {
				// default color pallete
				var colors: Array<UI.Color> = [];
				colors.push(new UI.Color("#ffffff"));
				colors.push(new UI.Color("#fa5959"));
				colors.push(new UI.Color("#8cfa59"));
				colors.push(new UI.Color("#59a0fa"));
				colors.push(new UI.Color("#fbff06"));
				colors.push(UI.Color.BackgroundColor);
				settings.ColorPallete = colors;
			}
			
			// make sure there is an eraser available in the color pallete:
			if(!colors.indexOf(UI.Color.BackgroundColor)) {
				colors.push(UI.Color.BackgroundColor); // eraser is just another brush with a color of the background
			}

			if (!settings.BrushSizes || settings.BrushSizes.length === 0) {
				// default brush sizes
				var brushes: Array<UI.BrushSize> = [];
				brushes.push(new UI.BrushSize(2));
				brushes.push(new UI.BrushSize(3));
				brushes.push(new UI.BrushSize(4));
				brushes.push(new UI.BrushSize(6));
				brushes.push(new UI.BrushSize(8));
				brushes.push(new UI.BrushSize(10));
				brushes.push(new UI.BrushSize(15));
				brushes.push(new UI.BrushSize(80));
				settings.BrushSizes = brushes;
			}

			if (!settings.Localization) {
				// default localization
				var loc: Localization.RecorderLocalization = {
					NoJS: "Your browser does not support JavaScript or it is turned off. Video can't be recorded without enabled JavaScript in your browser.",
					Busy: "Preparing recording studio...",
					RecPause: "Control recording",
					Record: "Start",
					Pause: "Pause recording",
					Upload: "Upload",
					UploadInProgress: "Uploading data...",
					ChangeColor: "Change brush color",
					ChangeSize: "Change brush size",
					Erase: "Eraser",
					EraseAll: "Erase everything",
					WaitingText: "Please be patient. Uploading video usually takes some times - up to a few minutes if your video is over ten minutes long. Do not close this tab or browser window.",
					UploadWasSuccessful: "Upload was successful",
					RedirectPrompt: "Upload was successful - press OK to continue",
					UploadFailure: "Upload failed.",
					FailureApology: "We are sorry, but upload failed. Do you want to download your data to your computer instead?",
					AudioRecording: "Audio recording",
					AudioRecordingAvailable: "Audio recording is available",
					AudioRecordingUnavailable: "Audio recording is unavailable"
				};
				settings.Localization = loc;
			}
	
			// Bind video events
			this.events.on(VET.ChangeBrushSize, (size: UI.BrushSize) => this.ChangeBrushSize(size));
			this.events.on(VET.ChangeColor, (color: UI.Color) => this.ChangeColor(color));
			this.events.on(VET.CursorState, (state: CursorState) => this.ProcessCursorState(state));
			this.events.on(VET.ClearCanvas, (color: UI.Color) => this.ClearCanvas(color));
			this.events.on(VET.Start, () => this.Start());
			this.events.on(VET.Pause, () => this.Pause());
			this.events.on(VET.StartUpload, () => this.StartUpload());
			
			this.busyLevel = 0;
			this.events.on(VET.Busy, () => this.Busy());
			this.events.on(VET.Ready, () => this.Ready());
			
			// Record paths
			this.events.on(VET.StartPath, (path: Drawing.Path) => {
				this.PushChunk(new VideoData.PathChunk(path, this.timer.CurrentTime(), this.lastEraseData));
				this.data.CurrentChunk.PushCommand(new VideoData.DrawNextSegment(this.timer.CurrentTime())); // draw the start dot
			});
			this.events.on(VET.DrawSegment, () => this.data.CurrentChunk.PushCommand(new VideoData.DrawNextSegment(this.timer.CurrentTime())));


			var min: number = brushes.reduce((previousValue: UI.BrushSize, currentValue: UI.BrushSize, index: number, arr: Array<UI.BrushSize>) =>  previousValue.Size <  currentValue.Size ? previousValue : currentValue).Size;
			var max: number = brushes.reduce((previousValue: UI.BrushSize, currentValue: UI.BrushSize, index: number, arr: Array<UI.BrushSize>) =>  previousValue.Size >  currentValue.Size ? previousValue : currentValue).Size;				
																
			// the most important part - the rendering and drawing strategy
			// - default drawing strategy is using SVG
			this.drawer = !!settings.DrawingStrategy ? settings.DrawingStrategy : new SVGDrawer(true);
			this.drawer.SetEvents(this.events);
			this.dynaDraw = new Drawing.DynaDraw(this.events, () => this.drawer.CreatePath(this.events), !settings.DisableDynamicLineWidth, min, max, this.timer);
			
			// create UI			
			this.ui = !!settings.UI ? settings.UI : new UI.RecorderUI(id, this.events);
			this.ui.Timer = this.timer;
			this.ui.Localization = settings.Localization;
            this.ui.SetBusyText(settings.Localization.Busy);
			this.ui.CreateHTML(!!settings.Autohide, settings.ColorPallete, settings.BrushSizes);
			
			// ...and connect it to the drawer
			var canvas: HTMLElement = this.drawer.CreateCanvas();
			this.ui.AcceptCanvas(canvas);
			container.appendChild(this.ui.GetHTML());
			this.drawer.Stretch(); // adapt to the environment
			
			// select best input method
			var wacomApi: IWacomApi = WacomTablet.IsAvailable();
			if (false && wacomApi !== null) { // Wacom plugin is prefered
				var tablet = new WacomTablet(this.events, container, this.timer, wacomApi);
				tablet.InitControlsAvoiding();
				console.log("Wacom WebPAPI is used");
			} else if (window.hasOwnProperty("PointerEvent")) { // pointer events implement pressure-sensitivity
				var pointer = new PointerEventsAPI(this.events, container, this.timer);
				pointer.InitControlsAvoiding();
				console.log("Pointer Events API is used");
			} else { // fallback to mouse + touch events
				var touch = new TouchEventsAPI(this.events, container, canvas, this.timer);
				touch.InitControlsAvoiding();
				console.log("Mouse and Touch Events API are used.");
			}
			
			// init audio recording
			if (!!settings.Audio) {
				this.audioRecorder = new AudioRecorder(settings.Audio, this.events);
				this.audioRecorder.Init();
			}
		
			// set default bg color and init the first chunk
			this.ClearCanvas(UI.Color.BackgroundColor); 
			// init some values for the brush - user will change it immediately, but some are needed from the very start
			this.events.trigger(VET.ChangeColor, UI.Color.ForegroundColor);
			this.events.trigger(VET.ChangeBrushSize, new UI.BrushSize(5));
		}
		
		/**
		 * Start recording. Everything must be initialised
		 * and from this moment all data must be stored properly.
		 */
		private Start(): void {
			if(this.isRecording === false) {
				this.isRecording = true;
				this.PushChunk(new VideoData.VoidChunk(this.timer.CurrentTime(), this.lastEraseData));
				this.timer.Resume();
				if (this.audioRecorder) { this.audioRecorder.Start(); }				
			}
		}
	
		/**
		 * Pause recording. Do not record data temporarily.
		 */
		private Pause(): void {
			if(this.isRecording === true) {
				this.isRecording = false;
				this.PushChunk(new VideoData.VoidChunk(this.timer.CurrentTime(), this.lastEraseData));
				this.timer.Pause();
				if (this.audioRecorder) { this.audioRecorder.Pause(); }				
			}
		}
			
		/**
		 * Stop recording and upload the recorded data.
		 */
		private StartUpload(): void {
			// do not record any new data
			this.recordingBlocked = true;
			
			// prepare metadata based on current status
			var info: Metadata = new Metadata();
			info.Length = this.timer.CurrentTime();
			info.Width = this.ui.Width;
			info.Height = this.ui.Height;
			info.AudioTracks = [];
			this.data.Metadata = info;

			if (!!this.audioRecorder
				&& this.audioRecorder.isRecording()) {
				this.audioRecorder.Stop(
					(files: Array<AudioSource>) =>  {
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
		private ChangeBrushSize(size: UI.BrushSize): void {			
			// User can change the size even if recording hasn't started or is paused
			!this.recordingBlocked && this.data.CurrentChunk.PushCommand(new VideoData.ChangeBrushSize(size, this.timer.CurrentTime()))
			this.dynaDraw.SetBrushSize(size);
		}
		
		/**
		 * User want's to change brush color.
		 * @param	colo	New brush color
		 */
		private ChangeColor(color: UI.Color): void {
			// User can change the color even if recording hasn't started or is paused
			!this.recordingBlocked && this.data.CurrentChunk.PushCommand(new VideoData.ChangeBrushColor(color, this.timer.CurrentTime()))
			this.drawer.SetCurrentColor(color);
		}
		
		/**
		 * User moved the mouse or a digital pen.
		 */
		private ProcessCursorState(state: CursorState) {
			// record cursor movement only if the video recording isn't over (already uploading)
			// or the recording is currently running or all raw data should be captured
			!this.recordingBlocked
			&& (this.recordAllRawData || this.isRecording)                                   // zero pressure will be omitted in the output
			&& this.data.CurrentChunk.PushCommand(new VideoData.MoveCursor(state.X, state.Y, this.recordAllRawData ? state.Pressure : 0, this.timer.CurrentTime()));

			this.dynaDraw.ObserveCursorMovement(state);
		}
				
		/**
		 * User moved the mouse or a digital pen.
		 */
		private ClearCanvas(color: UI.Color) {
			// add data only if recording is in progress
			var time: number = this.timer.CurrentTime();
			this.lastEraseData = this.PushChunk(new VideoData.EraseChunk(color, time, this.lastEraseData));
			this.data.CurrentChunk.PushCommand(new VideoData.ClearCanvas(color, time));
			this.drawer.ClearCanvas(color);
		}

		/**
		 * Record new push command.
		 */
		private PushChunk(chunk: VideoData.Chunk): number {			
			// now push it
			return this.data.PushChunk(chunk);
		}
		
		
         
        /** Remembers the  */
        private wasRecordingWhenBusy: boolean;
        
        /** How many "busy notifications" have there been, that are not yet ready */
        private busyLevel: number;
         
        /**
         * Somethimg is taking long time -- probably downloading xml or audio files
         */
         protected Busy(): void {
             this.busyLevel++;
             this.wasRecordingWhenBusy = this.wasRecordingWhenBusy || this.isRecording;
             this.events.trigger(VET.Pause);
             this.ui.Busy();
         }
         
         
         /**
          * The thing that instructed 
          */       
         protected Ready(): void {
             if(--this.busyLevel === 0) {
                 if(this.wasRecordingWhenBusy === true) {
                     this.events.trigger(VET.Start);
                     this.wasRecordingWhenBusy = false;
                 }
                 this.ui.Ready();                 
             }
         }
			
		//
		// Upload the result
		//
	
		/**
		 * Upload the recorded data to the server.
		 * @param	info	Information about the video.
		 */
		private UploadData(): void {			
			// get the recorded XML
			var writer: VideoFormat.Writer = !!this.settings.VideoFormat ? this.settings.VideoFormat : new VideoFormat.SVGAnimation.IO();
			var videoBlob: Blob = writer.SaveVideo(this.data);
			console.log(videoBlob);
				
			// if I need saving the data to local computer in the future
			this.events.on(VET.DownloadData, function() {
				Helpers.File.Download(videoBlob, `recorded-animation.${writer.GetExtension() }`);
			});
			
			this.ui.SetBusyText(this.settings.Localization.UploadInProgress);
			this.events.trigger(VET.Busy);
								
			// Upload the data via POST Ajax request
			var formData: FormData = new FormData();
			formData.append("extension", writer.GetExtension());
			formData.append("file", videoBlob);

			var req: XMLHttpRequest_fix = new XMLHttpRequest(); // remove the "_fix" when next version of TypeScript fixes this but: https://github.com/Microsoft/TypeScript/issues/3002
			req.open("POST", this.settings.UploadURL, true); // async post request			
			req.onerror = (e: Event) => this.FinishRecording(false); // upload failed
			req.onload = (e: Event) => {
				var response: any = JSON.parse(req.response);
				if (req.status === 200 // HTTP code 200 === success
					&& response.hasOwnProperty("success")
					&&  response.success === true) {

					var url: string = response.hasOwnProperty("redirect") ? response.redirect : false;
					this.FinishRecording(true, url);
				} else {
					this.FinishRecording(false); // upload failed
				}
			};
			req.send(formData);
		}
		
	
	
		/**
		 * Redirect the user after successfully finishing recording.
		 * Nothing is returned, if everything is OK and the user agrees
		 * then user is redirected to the player to check his recording.
		 * 
		 * @param  success	Was the whole process successful?
		 * @param  url 		Url to be redirected to
		 */
		private FinishRecording(success: boolean, url?: string|boolean): void {
			if (success === true) {
				this.ui.SetBusyText(this.settings.Localization.UploadWasSuccessful);
				if (typeof url === "string") {
					if (confirm(this.settings.Localization.RedirectPrompt))  {
						window.location.replace(url);
					}
				} else {
					alert(this.settings.Localization.UploadWasSuccessful);
				}
			} else {
				this.ui.SetBusyText(this.settings.Localization.UploadFailure);
				if (confirm(this.settings.Localization.FailureApology)) {
					// download all the recorded data locally
					this.events.trigger(VET.DownloadData);
				}
			}
		}
	}

}

