
/// <reference path="../../libs/DefinitelyTyped/webaudioapi/waa.d.ts" />
/// <reference path="../Settings/RecorderSettings" /> 
/// <reference path="../Helpers/Errors" />
/// <reference path="../Helpers/VideoEvents" />

module AudioRecording {
		
	/**
	 * The main audio recording class.
	 * This implementation wraps the HTML5 API and takes care of everything needed on the client side.
	 */
	export class AudioRecorder {
		
		/** The audio recording context */
		private context: AudioContext;
	
		/** The input stream */
		private input: any;//MediaStreamAudioSourceNode;
	
		/** Is the audio being captured? */
		private recording: boolean = false;
	
		/** Path to the recording web Worker. This path is absolute and it should be changed if the worker path changes. */
		private recordingWorkerPath: string = "/js/workers/recording-worker.js";
	
		/** The background worker */
		private recordingWorker: Worker;
	
		/** @type {Boolean} */
		private initSuccessful: boolean = false;
	
		/** @type {Boolean} */
		private doNotStartRecording: boolean = false;
	
		/** Default settings of audio recording */
		private settings: Settings.IAudioRecorderSettings = {
			host: "http://localhost",
			port: 3000,
			path: "/upload/audio"
		};
	
	
		/**
		 * Initialise the audio recoder
		 * @param	config	Audio recorder settings from the outside.
		 */
		constructor(config: Settings.IAudioRecorderSettings) {
			// update default settings
			if(!!config.host) this.settings.host = config.host;
			if(!!config.port) this.settings.port = config.port;
			if(!!config.path) this.settings.path = config.path;
	
			// wait until the user starts recording
			this.recording = false;
		}
	
		/**
		 * Prepare audio recording.
		 * Unless the website uses an SSL certificate, the browser will ask for microphone access
		 * each time this method is called.
		 * @param	success		Initialisation success callback
		 */
		public Init(success?: () => any) {
			//window.AudioContext = window.AudioContext || window.webkitAudioContext;
			this.context = new AudioContext();
			navigator.getUserMedia = (navigator.getUserMedia ||
										navigator.webkitGetUserMedia ||
										navigator.mozGetUserMedia);
										
			if (!!navigator.getUserMedia) {
				navigator.getUserMedia(
					// constraints - we record only audio
					{
						video: false,
						audio: true
					},
	
					// success callback
					function(localMediaStream: any) {
						if(this.doNotStartRecording === false) {
							this.input = this.context.createMediaStreamSource(localMediaStream);
								
							// create processing node
							var bufferSize = 2048;
							var recorder = this.context.createScriptProcessor(bufferSize, 1, 1);
							recorder.onaudioprocess = this.processData;
							this.input.connect(recorder);
							recorder.connect(this.context.destination);
							this.initSuccessful = true;
	
							// create web worker audio processor
							this.createAudioProcessor("web-socket", this.settings, () => console.log("Audio recording is ready."));
	
							// call callback and register the tool for later
							if(!!success) {
								success();								
							}
							VideoEvents.trigger(VideoEventType.RegisterRecordingTool, "audio-recorder");
						}
					},
	
					// error callback
					function(err: any) {
						if(err.name === "PermissionDeniedError") {
							Errors.Report(ErrorType.Warning, "User didn't allow microphone recording.");
						}						
						Errors.Report(ErrorType.Warning, "Can't record audio", err);
					}
				);
	
			} else {
				console.log("getUserMedia not supported by the browser");
				Errors.Report(ErrorType.Warning, "getUserMedia not supported by the browser");
			}
		}
	
		/**
		 * Creates a web worker that will process the audio and upload it to the server.
		 * @param	processorType	Type of the audio processor.
		 * @param	cfg				Upload configuration.
		 * @param	success			This callback will be called if the worker is created
	 	 * @param	error			This callback will be called if web workers aren't supported
		 */
		private CreateAudioProcessor(processorType: string, cfg: Settings.IAudioRecorderSettings, success?: Function, error?: Function) {
			if(Worker) { // if web workers are supported
				this.recordingWorker = new Worker(this.recordingWorkerPath);
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
		public Stop(success: (sources: Array<AudioSource>) => any) : void {
			if(this.initSuccessful === true) {
				// stop recording
				if(this.Pause()) {	
					if(this.recordingWorker) {
						// prepare for response from the worker first
						this.recordingWorker.onmessage = (e) => {
							var msg = e.data;
							if(!msg.hasOwnProperty("error")) {
								console.log("Worker response is invalid (missing property 'error')", e.data);
								return;
							}
	
							if(msg.error === true) {								
								Errors.Report(ErrorType.Fatal, msg.message);
							} else {
								VideoEvents.trigger(VideoEventType.RecordingToolFinished, "audio-recorder");
								var sources: Array<AudioSource>;
								for (var i = 0; i < msg.files.length; i++) {
									var file = msg.files[i];
									var source: AudioSource = new AudioSource(file.url, file.type);
									sources.push(source);									
								}
								success(sources);
							}
						};
	
						// now send the message to the worker
						this.recordingWorker.postMessage({
							cmd: "finish"
						});
					}
				}
			} else {
				// there was no recording
				Errors.Report(ErrorType.Warning, "Can't stop AudioRecorder - it wasn't ever initialised.");
			}
		}
	
		/**
		 * 
		 */
		public isRecording() : boolean {
			return this.initSuccessful;
		}
	
		/**
		 *
		 */
		private processData(data: any) : void {
			if(this.recording === false) {
				return; // recording has not started or is paused
			}
	
			// grab only the left channel - lower quality but half the data to transfer..
			// most NTB microphones are mono..
			var left: any = data.inputBuffer.getChannelData(0);
	
			if(this.recordingWorker) {
				this.recordingWorker.postMessage({
					cmd: "pushData",
					data: left
				});
			}
		}	
	}
	
}