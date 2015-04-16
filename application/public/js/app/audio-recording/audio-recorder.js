/**
 * Khanova Škola - vektorové video
 *
 * AUDIO RECORDER
 * This recorder uses the HTML5 API to record sound from microphone
 * and produces an MP3 file as an output.
 * 
 * @author:		Šimon Rozsíval (simon@rozsival.com)
 * @project:	Vector screencast for Khan Academy (Bachelor thesis)
 * @license:	MIT
 */

/**
 * @class
 */
var AudioRecorder = (function(navigator, window) {

	/** @type {AudioRecorder} */
	var _this;

	/** @type {AudioContext} */
	var context;

	/** @type {MediaStreamAudioSourceNode} */
	var input;

	/** @type {Boolean} */
	var recording = false;

	/** @type {String} */
	var recordingWorkerPath = "/js/workers/recording-worker.js";

	/** @type {Worker} */
	var recordingWorker = null;

	/** @type {Boolean} */
	var initSuccessful = false;

	/** @type {Boolean} */
	var doNotStartRecording = false;

	/** @type {object} Default settings of audio recording */
	var settings = {
		port: 3000,
		host: "http://localhost",
		path: "/upload/audio",

		// callbacks
		error: function() {
			// passing 'console.log' to error raises 'Illegal invocation' error
			console.log("Error arguments: ", arguments);
		}
	};


	/**
	 *
	 * @param {object} config
	 * @constructor
	 */
	function AudioRecorder(config) {
		$.extend(true, settings, config);

		// wait until the user starts recording
		recording = false;

		// "this" object for closures
		_this = this;
	}

	/**
	 *
	 * @param {object} cfg
	 */
	AudioRecorder.prototype.init = function() {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		context = new AudioContext();
		console.log("Audio context is set up.");

		window.URL = window.URL || window.webkitURL;
		navigator.getUserMedia = (navigator.getUserMedia ||
									navigator.webkitGetUserMedia ||
									navigator.mozGetUserMedia ||
									navigator.msGetUserMedia);
		if (navigator.getUserMedia) {
			navigator.getUserMedia(
				// constraints - we record only audio
				{
					video: false,
					audio: true
				},

				// success callback
				function(localMediaStream) {
					if(doNotStartRecording === false) {
						input = context.createMediaStreamSource(localMediaStream);

						// log
						console.log("Created media stream.");
						console.log("Input sample rate: " + input.context.sampleRate);

						// create processing node
						var bufferSize = 2048;
						var recorder = context.createScriptProcessor(bufferSize, 1, 1);
						recorder.onaudioprocess = processData;
						input.connect(recorder);
						recorder.connect(context.destination);
						initSuccessful = true;

						_this.createAudioProcessor("web-socket", {
							port: settings.port || 4000,
							host: settings.host || "localhost",
							path: settings.path || "/",
							success: function() {
								console.log("Audio recording is ready.");
							},
							error: function(msg) {
								console.log(msg);
							}
						});

						// call callback if it was stated
						if(settings.hasOwnProperty("success")) {
							settings.success();
						}
						VideoEvents.trigger("register-tool", "audio-recorder");
					}
				},

				// error callback
				function(err) {
					if(err.name === "PermissionDeniedError") {
						console.log("User didn't allow microphone usage.");
					}

					console.log("Can't record audio", err);
					// default error callback - console.log
					settings.error({
						code: 0,
						message: "Can't record audio"
					});
				}
			);

		} else {
			console.log("getUserMedia not supported by the browser");
			settings.error({
				code: 0,
				message: "getUserMedia not supported by the browser"
			});
		}
	};

	AudioRecorder.prototype.createAudioProcessor = function(AudioProcessorType, cfg) {
		if(Worker) {
			recordingWorker = new Worker(recordingWorkerPath);
			recordingWorker.postMessage({
				cmd: "init",
				AudioProcessorType: AudioProcessorType || "web-sockets",
				port: cfg.port,
				host: cfg.host,
				path: cfg.path
			});
			if(cfg.hasOwnProperty("success")) {
				cfg.success();
			}
		} else {
			console.log("ERROR - no workers support - non supported browser.");
			alert("Your browser doesn't support Web Workers technology, audio can't be recorded.");
		}
	};

	/**
	 *
	 * @param {object} cfg
	 * @returns {boolean}
	 */
	AudioRecorder.prototype.start = function(cfg) {
		cfg = cfg || {};

		// check, if recorder was successfully initialised first
		if(initSuccessful) {
			if(!recordingWorker) {
				if(cfg && cfg.hasOwnProperty("error")) {
					cfg.error({
						code: 1, // @todo
						message: "No audio processor was set."
					});
				}
				return false;
			} else {
				recording = true;
				return true;
			}
		} else {
			// user didn't allow the audio recording (or doesn't have a microphone)
			doNotStartRecording = true;

			// idea for future development:
			// If there is a way to hide the "allow microphone access" bar or popup, implement it here.
			// - I haven't yet found how to accomplish that.

			return false;
		}
	};

	/**
	 *
	 * @param {object} cfg
	 * @returns {boolean}
	 */
	AudioRecorder.prototype.continue = function(cfg) {
		cfg = cfg || {};

		// check, if recorder was successfully initialised first
		if(initSuccessful) {
			if(!recordingWorker) {
				if(cfg && cfg.hasOwnProperty("error")) {
					cfg.error({
						code: 1, // @todo
						message: "No audio processor was set."
					});
				}
				return false;
			} else {
				recording = true;
				return true;
			}
		} else {
			// do nothing - user didn't allow the microphone or doesn't have one
		}

		return false;
	};

	/**
	 *
	 * @param {object} cfg
	 * @returns {boolean}
	 */
	AudioRecorder.prototype.pause = function(cfg) {
		cfg = cfg || {};
		// check, if recorder was successfully initialised first
		if(initSuccessful) {
			recording = false;
			return true;
		} else {
			// do nothing - user didn't allow the microphone or doesn't have one
		}

		return false;
	};

	/**
	 *
	 * @param {object} cfg
	 */
	AudioRecorder.prototype.stop = function(cfg) {
		cfg = cfg || {};
		if(initSuccessful) {
			// stop recording
			if(this.pause(cfg)) {
				var oldSuccess = cfg.success || undefined;
				cfg.success = function(data) {
					if(oldSuccess) {
						oldSuccess(data);
					}
					VideoEvents.trigger("tool-finished", "audio-recorder");
				};

				if(recordingWorker) {
					// prepare for response from the worker
					// - functions aren't cloneable and I can't therefore pass the cfg object to the worker via a message
					recordingWorker.onmessage = function(e) {
						var msg = e.data;
						if(!msg.hasOwnProperty("error")) {
							console.log("Worker response is invalid (missing property 'error'", e.data);
							return;
						}

						if(msg.error === true && cfg.hasOwnProperty("error")) {
							cfg.error({
								message: msg.message
							});
						} else if (msg.error === false && cfg.hasOwnProperty("success")) {
							cfg.success(msg.fileName);
						}
					};

					recordingWorker.postMessage({
						cmd: "finish"
					});
				}
			}
		} else {
			// there was no recording
			if(cfg.hasOwnProperty("error")) {
				cfg.error(); // report
			}
		}
	};

	/**
	 *
	 * @returns {Boolean}
	 */
	AudioRecorder.prototype.isRecording = function() {
		return initSuccessful;
	}

	/**
	 *
	 */
	var processData = function(data) {
		if(recording === false) {
			return; // recording has not started or is paused
		}

		// grab only the left channel - lower quality but half the data to transfer..
		// most NTB microphones are mono..
		var left = data.inputBuffer.getChannelData(0);

		if(recordingWorker) {
			recordingWorker.postMessage({
				cmd: "pushData",
				data: left
			});
		}
	};


	return AudioRecorder;
    
})(navigator, window);	