/// <reference path="audio.d.ts" />
/// <reference path="../Helpers" />

module VectorScreencast.AudioData {
	
	import Errors = Helpers.Errors;
	import ErrorType = Helpers.ErrorType;
	import VideoEvents = Helpers.VideoEvents;
	import VideoEventType = Helpers.VideoEventType;
		
	/**
	 * The main audio recording class.
	 * This implementation wraps the HTML5 API and takes care of everything needed on the client side.
	 */
	export class AudioRecorder {
		
		/** The input stream */
		private input: any;//MediaStreamAudioSourceNode;
	
		/** Is the audio being captured? */
		private recording: boolean = false;
		
		/** Reference to the processing node - it must not be garbage collected! */
		private scriptProcessorNode: ScriptProcessorNode;
		
		/** The background worker */
		private recordingWorker: Worker;
	
		/** Recording was initialised successfully. */
		private initSuccessful: boolean = false;
	
		/** Do not start recording even if the author enables microphone - recording has probably already started. */
		private doNotStartRecording: boolean = false;
		
		/** Recording of audio is paused while the screen recording continues. */
		private muted: boolean;
	
		/** Default settings of audio recording */
		private settings: Settings.AudioRecorderSettings = {
			host: "http://localhost",
			port: 4000,
			path: "/upload/audio",			
			recordingWorkerPath: "/js/workers/RecordingWorker.js" 	// Path to the recording web Worker.
																	// This path is absolute and it should be changed
																	// if the worker path changes.
		};
	
		/** Error callback */
		private error: (msg: any) => void;
		/** Success callback */
		private success: (msg: any) => void; 
	
	
		/**
		 * Initialise the audio recoder
		 * @param	config	Audio recorder settings from the outside.
		 */
		constructor(config: Settings.AudioRecorderSettings, protected events: VideoEvents) {
			// update default settings
			if(!!config.host) this.settings.host = config.host;
			if(!!config.port) this.settings.port = config.port;
			if(!!config.path) this.settings.path = config.path;
	
			// wait until the user starts recording
			this.recording = false;
			this.muted = false;
			this.events.on(VideoEventType.MuteAudioRecording, () => this.muted = !this.muted);
			
			// default callbacks
			this.error = (msg: any) => console.log("AudioRecorder error: ", msg);
			this.success = (msg: any) => console.log("AudioRecorder success: ", msg);
		}
	
		/**
		 * Prepare audio recording.
		 * Unless the website uses an SSL certificate, the browser will ask for microphone access
		 * each time this method is called.
		 * @param	success		Initialisation success callback
		 */
		public Init(success?: () => any) {
			navigator.getUserMedia = (navigator.getUserMedia ||
										navigator.webkitGetUserMedia ||
										navigator.mozGetUserMedia);
			
			if (!!navigator.getUserMedia && window.hasOwnProperty("AudioContext")) {
				var context: AudioContext = (new AudioContext() // FF, GCh
											//|| new webkitAudioContext() // Safari
											|| null); // others
			
				// busy until user confirms or bans audio recording
				this.events.trigger(VideoEventType.Busy);
				navigator.getUserMedia(
					// constraints - we record only audio
					{
						video: false,
						audio: true
					},
	
					// success callback
					(localMediaStream: any) => { // (localMediaStream: MediaStream) => { ... } // not supported by TypeScript yet (absent in MS(I)E)						
						if(this.doNotStartRecording === false) {
							this.input = context.createMediaStreamSource(localMediaStream);
								
							// create processing node
							var bufferSize = 2048;
							this.scriptProcessorNode = context.createScriptProcessor(bufferSize, 1, 1);
							this.scriptProcessorNode.onaudioprocess = (data: AudioProcessingEvent) => this.processData(data);
							this.input.connect(this.scriptProcessorNode);
							this.scriptProcessorNode.connect(context.destination);
							this.initSuccessful = true;
	
							// create web worker audio processor
							this.CreateAudioProcessor("web-socket", this.settings, () => console.log("Audio recording is ready."));
	
							// call callback and register the tool for later
							if(!!success) {
								success();								
							}
							this.events.trigger(VideoEventType.AudioRecordingAvailable);
							this.events.trigger(VideoEventType.RegisterRecordingTool, "audio-recorder");
							this.events.trigger(VideoEventType.Ready); // now the recording might start
						}
					},
	
					// error callback
					(err: any) => {
						if(err.name === "PermissionDeniedError") {
							Errors.Report(ErrorType.Warning, "User didn't allow microphone recording.");
						}						
						Errors.Report(ErrorType.Warning, "Can't record audio", err);
						this.events.trigger(VideoEventType.AudioRecordingUnavailable);
						this.events.trigger(VideoEventType.Ready); // now the recording might start
					}
				);
	
			} else {
				console.log("getUserMedia not supported by the browser");
				Errors.Report(ErrorType.Warning, "getUserMedia not supported by the browser");
				this.events.trigger(VideoEventType.AudioRecordingUnavailable);
			}
		}
	
		/**
		 * Creates a web worker that will process the audio and upload it to the server.
		 * @param	processorType	Type of the audio processor.
		 * @param	cfg				Upload configuration.
		 * @param	success			This callback will be called if the worker is created
	 	 * @param	error			This callback will be called if web workers aren't supported
		 */
		private CreateAudioProcessor(processorType: string, cfg: Settings.AudioRecorderSettings, success?: Function, error?: Function) {
			if(Worker) { // if web workers are supported
				this.recordingWorker = new Worker(cfg.recordingWorkerPath);
				this.recordingWorker.onmessage = (e: MessageEvent) => this.ReceiveMessageFromWorker(e);
				this.recordingWorker.postMessage({
					cmd: "init",
					AudioProcessorType: processorType || "web-sockets",
					port: cfg.port,
					host: cfg.host,
					path: cfg.path
				});
				
				// call optional user's callback
				if(!!success) {
					success();					
				}
			} else {
				Errors.Report(ErrorType.Fatal, "No web workers support - this feature is not supported by the browser.");
				
				// call optional user's callback
				if(!!error) {
					error();					
				}
			}
		}
	
		/**
		 * Start recording
		 */
		public Start() {	
			// check, if recorder was successfully initialised first
			if(this.initSuccessful === true) {
				if(!this.recordingWorker) {
					Errors.Report(ErrorType.Fatal, "No audio processor was set.");
					return false;
				} else {
					this.recording = true;
					return true;
				}
			} else {
				// user didn't allow the audio recording (or doesn't have a microphone)
				this.doNotStartRecording = true;
	
				// idea for future development:
				// If there is a way to hide the "allow microphone access" (-> I dan't want to access the microphone any more,
				// the user already started recording without it) bar or popup, implement it here.
				// - I haven't yet found how to accomplish that...
	
				return false;
			}
		}
	
		/**
		 * Continue recording
		 */
		public Continue() : boolean {	
			// check, if recorder was successfully initialised first
			if(this.initSuccessful) {
				if(!this.recordingWorker) {
					Errors.Report(ErrorType.Fatal, "No audio processor was set.");
					return false;
				} else {
					this.recording = true;
					return true;
				}
			} else {
				// do nothing - user didn't allow the microphone or doesn't have one
			}
	
			return false;
		}
	
		/**
		 * Pause recording
		 */
		public Pause() : boolean {
			// check, if recorder was successfully initialised first
			if(this.initSuccessful) {
				this.recording = false;
				return true;
			} else {
				// do nothing - user didn't allow the microphone or doesn't have one
			}
	
			return false;
		}
	
		/**
		 * Stop the recording
		 */
		public Stop(success: (sources: Array<AudioSource>) => any, error: () => void) : void {
			// prepare callbacks
			this.success = success;
			this.error = error;
			
			if(this.initSuccessful === true) {
				// stop recording
				if(this.Pause()) {	
					if(this.recordingWorker) {
						// now send the message to the worker
						this.recordingWorker.postMessage({
							cmd: "finish"
						});
					}
				}
			} else {
				// there was no recording
				Errors.Report(ErrorType.Warning, "Can't stop AudioRecorder - it wasn't ever initialised.");
				error();
			}
		}
	
		/**
		 * Is audio recorder ready to be recording?
		 */
		public isRecording() : boolean {
			return this.initSuccessful;
		}
	
		/**
		 * Pass data from the microphone to the worker to be processed.
		 */
		private processData(data: AudioProcessingEvent) : void {
			if(this.recording === false) {
				return; // recording has not started or is paused
			}
	
			// grab only the left channel - lower quality but half the data to transfer..
			// most NTB microphones are mono..
			var left: Float32Array = data.inputBuffer.getChannelData(0);				
			if(this.muted) {
				for (var i = 0; i < left.length; i++) {
					left[i] = 0; // mute the sound, but keep the audio synchronized with the image as soon as it is un-muted
				}	
			}
	
			if(this.recordingWorker) {
				this.recordingWorker.postMessage({
					cmd: "pushData",
					data: left
				});
			}
		}	
		
		/**
		 * Process a message from the WebWorker processing the data.
		 */
		private ReceiveMessageFromWorker(e: MessageEvent): void {
			var msg = e.data;
			
			if(!msg.hasOwnProperty("type")) {
				console.log("Worker response is invalid (missing property 'type')", e.data);
				this.error("AudioRecorder received invalid message from the worker.");
				return;
			}	
			
			switch (msg.type) {
				case "error":
					this.error(msg.msg);
				case "network-error":
					this.WorkerNetworkError();
					break;
				case "finished":
					this.WorkerFinished(msg);
					break;
				default:
					console.log("Unknown message type: ", msg.type, msg);
					break;
			}
		}
		
		/**
		 * Process information from the web worker.
		 */
		private WorkerFinished(msg: any): void {
			// destroy the worker
			this.recordingWorker.terminate();
			this.recordingWorker = null;
			
			this.events.trigger(VideoEventType.RecordingToolFinished, "audio-recorder");
			var sources: Array<AudioSource> = [];
			for (var i = 0; i < msg.files.length; i++) {
				var file = msg.files[i];
				var source: AudioSource = new AudioSource(file.url, AudioSource.StringToType(file.type));
				sources.push(source);									
			}
			this.success(sources);
		}
		
		/**
		 * Inform about network connection loss.
		 */
		 private WorkerNetworkError(): void {
			 this.events.trigger(VideoEventType.AudioRecordingUnavailable);
		 }
	}
	
}