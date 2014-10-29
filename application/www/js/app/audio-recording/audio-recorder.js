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


var AudioRecorder = (function(navigator, window) {
	
	/** HTML5 AudioContext */
	var context;

	/** Audio stream source */
	var input;

	/** object */
	var settings = {
		fileName: "",
		uploadAudio: "",
		recordJs: {
			workerPath: "/js/libs/recordjs/recorderWorker.js"			
		}
	};

	/** RecordJS library object */
	var recorder = false;

	function AudioRecorder(config) {
		$.extend(true, settings, config);

		// wait until the user starts recording
		recording = false;

		// "this" object for closures
		var _this = this;

		// init the api
		init.call(this);

		VideoEvents.on("start", function() {
			start.call(_this);
		});

		VideoEvents.on("pause", function() {
			pause.call(_this);
		});

		VideoEvents.on("upload-recorded-data", function(e, args) {
			settings.fileName = args.fileName;
			upload.call(_this);			
		});
		
		VideoEvents.trigger("register-tool", "audio-recorder");
	}

	var init = function() {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		window.URL = window.URL || window.webkitURL;
		navigator.getUserMedia = (navigator.getUserMedia ||
									navigator.webkitGetUserMedia ||
									navigator.mozGetUserMedia ||
									navigator.msGetUserMedia);
		context = new AudioContext;
		console.log("Audio context is set up.");

		if (navigator.getUserMedia) {
	   		navigator.getUserMedia (

				// constraints
				{
					video: false,
					audio: true
				},

				// successCallback
				function(localMediaStream) {
					input = context.createMediaStreamSource(localMediaStream);
					//input.connect(context.destination);

					// log
					console.log("Created media stream.");
					console.log("Input sample rate: " + input.context.sampleRate);

					// init the Recorder.js library
					recorder = new MicrophoneRecorder(input, settings.recordJs);
					console.log("Recodrer.js library is initialized.");
				},

				// errorCallback
				function(err) {
					console.log("Can't stream live audio: " + err);
				}

			); 

		} else {
			console.log("getUserMedia not supported by the browser");
		}
	};

	var start = function() {
		// check, if recorder was successfully initialised first
		if(recorder) {
			recorder.record();
		}
	};

	var pause = function() {
		// check, if recorder was successfully initialised first
		if(recorder) {
			recorder.stop();
		}
	};

	var upload = function() {
		if(recorder) {
			VideoEvents.on("recording-id", function(e, recordingId) {
				recorder.exportWAV(function(blob) {		        

					// 
					// blob contains proper WAV file
					// 
					
					VideoEvents.on("save-data", function() {
						Saver.saveWav(blob);
					});
					
					// pretend to submit multipart form data...
			        var fd = new FormData();
			        fd.append('id', settings.fileName);
			        fd.append('recordingId', recordingId); // the ID of the recording in the database
			        fd.append('wav', blob);

			        //
			        // POST ajax request
			        //
			         
			        $.ajax({
			            type: 'POST',
			            url: settings.uploadAudio,
			            data: fd,
			            processData: false,
			            contentType: false,
			            xhr: function() {
			            	var xhr = new window.XMLHttpRequest();
					        xhr.upload.addEventListener("progress", function(evt) {
					            if (evt.lengthComputable) {
					                var percentComplete = evt.loaded / evt.total * 100;
					                VideoEvents.trigger("upload-progress", percentComplete);
					            }
					       }, false);
					       return xhr;
			            },
			        	success: function(data) {		        	
				            console.log("audio upload was successful");
				            VideoEvents.trigger("tool-finished", "audio-recorder");
				        },
			        	fail: function(data) {
				        	console.log(data);
				        	VideoEvents.trigger("tool-failed", "audio-recorder");
			        	}
					});
				});
			});
		}
	};

	return AudioRecorder;
    
})(navigator, window);	