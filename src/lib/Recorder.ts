import PointingDevice from './VideoData/PointingDevice';
import Video from './VideoData/Video';
import Chunk, { PathChunk, VoidChunk, EraseChunk } from './VideoData/Chunk';
import Command, { DrawNextSegment, ChangeBrushColor, ChangeBrushSize, MoveCursor, ClearCanvas } from './VideoData/Command';

import DynaDraw from './Drawing/DynaDraw';
import { DrawingStrategy } from './Drawing/DrawingStrategy';
import SVGDrawer from './Drawing/SVGDrawer';
import CanvasDrawer from './Drawing/CanvasDrawer';
import Path from './Drawing/Path';

import AudioRecorder from './AudioData/AudioRecorder';
import { AudioSource } from './AudioData/AudioPlayer';
import VideoEvents, { VideoEventType as VET } from './Helpers/VideoEvents';
import Errors, { ErrorType } from './Helpers/Errors';
import VideoTimer from './Helpers/VideoTimer';
import { CursorState } from './Helpers/State';

import Metadata from './VideoData/Metadata';
import Color from './UI/Color';
import BrushSize from './UI/Brush';
import { RecorderSettings } from './Settings/RecorderSettings';
import * as Localization from './Localization/Recorder';

import File from './Helpers/File';
import IO from './VideoFormat/SVGAnimation/IO';
import { Writer } from './VideoFormat/VideoFormat';
import RecorderUI from './UI/RecorderUI';

import selectBestInputMethod from './VideoData/selectBestInputMethod';

//namespace VectorScreencast {
	
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
	export default class Recorder {	
		/** Line drawing algorithm */
		private dynaDraw: DynaDraw;
		
		/** Current drawing strategy */
		private drawer: DrawingStrategy;
					
		/** Audio recording */
		private audioRecorder: AudioRecorder;
	
		/** Current state of the Recorder */
		private isRecording: boolean;
		
		/** User interface instance */
		private ui: RecorderUI;
		
		/** Recorded data */
		protected data: Video;
		protected lastEraseData: number;
		
		/** (High resolution) timer */
		protected timer: VideoTimer;
		
		/** Cursor movement input */
		protected pointer: PointingDevice;
		
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
		constructor(private id: string, private settings: RecorderSettings) {
			this.events = new VideoEvents();
			
			// do not start recording until the user want's to start
			this.isRecording = false;
						
			// create paused stopwatch
			this.timer = new VideoTimer(false);
			
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
			if(!!settings.DefaultBackgroundColor) Color.BackgroundColor = settings.DefaultBackgroundColor;
			if(!!settings.DefaultBrushColor) Color.ForegroundColor = settings.DefaultBrushColor;
			
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
				var colors: Array<Color> = [];
				colors.push(new Color("#ffffff"));
				colors.push(new Color("#fa5959"));
				colors.push(new Color("#8cfa59"));
				colors.push(new Color("#59a0fa"));
				colors.push(new Color("#fbff06"));
				colors.push(Color.BackgroundColor);
				settings.ColorPallete = colors;
			}
			
			// make sure there is an eraser available in the color pallete:
			if(!colors.indexOf(Color.BackgroundColor)) {
				colors.push(Color.BackgroundColor); // eraser is just another brush with a color of the background
			}
	
			if (!settings.BrushSizes || settings.BrushSizes.length === 0) {
				// default brush sizes
				var brushes: Array<BrushSize> = [];
				brushes.push(new BrushSize(2));
				brushes.push(new BrushSize(3));
				brushes.push(new BrushSize(4));
				brushes.push(new BrushSize(6));
				brushes.push(new BrushSize(8));
				brushes.push(new BrushSize(10));
				brushes.push(new BrushSize(15));
				brushes.push(new BrushSize(80));
				settings.BrushSizes = brushes;
			}
	
			if (!settings.Localization) {
				// default localization
				var loc: Localization.Recorder = {
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
			this.events.on(VET.ChangeBrushSize, (size: BrushSize) => this.ChangeBrushSize(size));
			this.events.on(VET.ChangeColor, (color: Color) => this.ChangeColor(color));
			this.events.on(VET.CursorState, (state: CursorState) => this.ProcessCursorState(state));
			this.events.on(VET.ClearCanvas, (color: Color) => this.ClearCanvas(color));
			this.events.on(VET.Start, () => this.Start());
			this.events.on(VET.Pause, () => this.Pause());
			this.events.on(VET.StartUpload, () => this.StartUpload());
			
			this.busyLevel = 0;
			this.events.on(VET.Busy, () => this.Busy());
			this.events.on(VET.Ready, () => this.Ready());
			
			// Record paths
			this.events.on(VET.StartPath, (path: Path) => {
				this.PushChunk(new PathChunk(path, this.timer.CurrentTime(), this.lastEraseData));
				this.data.CurrentChunk.PushCommand(new DrawNextSegment(this.timer.CurrentTime())); // draw the start dot
			});
			this.events.on(VET.DrawSegment, () => this.data.CurrentChunk.PushCommand(new DrawNextSegment(this.timer.CurrentTime())));
	
	
			var min: number = brushes.reduce((previousValue: BrushSize, currentValue: BrushSize, index: number, arr: Array<BrushSize>) =>  previousValue.Size <  currentValue.Size ? previousValue : currentValue).Size;
			var max: number = brushes.reduce((previousValue: BrushSize, currentValue: BrushSize, index: number, arr: Array<BrushSize>) =>  previousValue.Size >  currentValue.Size ? previousValue : currentValue).Size;				
																
			// the most important part - the rendering and drawing strategy
			// - default drawing strategy is using SVG
			this.drawer = !!settings.DrawingStrategy ? settings.DrawingStrategy : new SVGDrawer(true);
			this.drawer.SetEvents(this.events);
			this.dynaDraw = new DynaDraw(this.events, () => this.drawer.CreatePath(this.events), !settings.DisableDynamicLineWidth, min, max, this.timer);
			
			// create UI			
			this.ui = !!settings.UI ? settings.UI : new RecorderUI(id, this.events);
			this.ui.Timer = this.timer;
			this.ui.Localization = settings.Localization;
			this.ui.SetBusyText(settings.Localization.Busy);
			this.ui.CreateHTML(!!settings.Autohide, settings.ColorPallete, settings.BrushSizes);
			
			// ...and connect it to the drawer
			var canvas: HTMLElement = this.drawer.CreateCanvas();
			this.ui.AcceptCanvas(canvas);
			container.appendChild(this.ui.GetHTML());
			this.drawer.Stretch(); // adapt to the environment
			
			this.pointer = selectBestInputMethod(this.events, this.ui.GetHTML(), canvas, this.timer);			
			
			// init audio recording
			if (!!settings.Audio) {
				this.audioRecorder = new AudioRecorder(settings.Audio, this.events);
				this.audioRecorder.Init();
			}
		
			// set default bg color and init the first chunk
			this.ClearCanvas(Color.BackgroundColor); 
			// init some values for the brush - user will change it immediately, but some are needed from the very start
			this.events.trigger(VET.ChangeColor, Color.ForegroundColor);
			this.events.trigger(VET.ChangeBrushSize, new BrushSize(5));
		}
		
		/**
		 * Start recording. Everything must be initialised
		 * and from this moment all data must be stored properly.
		 */
		private Start(): void {
			if(this.isRecording === false) {
				this.isRecording = true;
				this.PushChunk(new VoidChunk(this.timer.CurrentTime(), this.lastEraseData));
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
				this.PushChunk(new VoidChunk(this.timer.CurrentTime(), this.lastEraseData));
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
		private ChangeBrushSize(size: BrushSize): void {			
			// User can change the size even if recording hasn't started or is paused
			!this.recordingBlocked && this.data.CurrentChunk.PushCommand(new ChangeBrushSize(size, this.timer.CurrentTime()))
			this.dynaDraw.SetBrushSize(size);
		}
		
		/**
		 * User want's to change brush color.
		 * @param	colo	New brush color
		 */
		private ChangeColor(color: Color): void {
			// User can change the color even if recording hasn't started or is paused
			!this.recordingBlocked && this.data.CurrentChunk.PushCommand(new ChangeBrushColor(color, this.timer.CurrentTime()))
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
			&& this.data.CurrentChunk.PushCommand(new MoveCursor(state.X, state.Y, this.recordAllRawData ? state.Pressure : 0, this.timer.CurrentTime()));
	
			this.dynaDraw.ObserveCursorMovement(state);
		}
				
		/**
		 * User moved the mouse or a digital pen.
		 */
		private ClearCanvas(color: Color) {
			// add data only if recording is in progress
			var time: number = this.timer.CurrentTime();
			this.lastEraseData = this.PushChunk(new EraseChunk(color, time, this.lastEraseData));
			this.data.CurrentChunk.PushCommand(new ClearCanvas(color, time));
			this.drawer.ClearCanvas(color);
		}
	
		/**
		 * Record new push command.
		 */
		private PushChunk(chunk: Chunk): number {			
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
			var writer: Writer = !!this.settings.VideoFormat ? this.settings.VideoFormat : new IO();
			var videoBlob: Blob = writer.SaveVideo(this.data);
			console.log(videoBlob);
				
			// if I need saving the data to local computer in the future
			this.events.on(VET.DownloadData, function() {
				File.Download(videoBlob, `recorded-animation.${writer.GetExtension() }`);
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
//}