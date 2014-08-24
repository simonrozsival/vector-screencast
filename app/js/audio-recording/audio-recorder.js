/**
 * This recorder uses the HTML5 API to record sound from microphone
 * and produces an MP3 file as an output.
 * 
 * @author Šimon Rozsíval
 */

var AudioRecorder = (function(navigator, window) {
	
	/** AudioContext */
	var context;

	/** Audio stream source */
	var input;

	/** object */
	var settings;

	/** */
	var recorder = false;

	function AudioRecorder(config) {
		
		// wait until the user starts recording
		recording = false;

		// "this" object for closures
		var _this = this;

		// init the api
		init.call(this, config);

		VideoEvents.on("start", function() {
			start.call(_this);
		});

		VideoEvents.on("pause", function() {
			pause.call(_this);
		});

		VideoEvents.on("upload-recorded-data", function(e, args) {
			settings = args;
			convert.call(_this);			
		});

		VideoEvents.on("save-audio/mp3", function(e, url) {
			// url - the encoded mp3
			upload.call(_this, url);
		});

	}

	var init = function(cfg) {
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
					recorder = new MicrophoneRecorder(input, {
						workerPath: "js/audio-recording/libs/recordjs/recorderWorker-mono.js"
					});
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

	var convert = function() {
		if(recorder) {
			recorder.exportWAV(function(blob) {
				// -> "blob" is WAV
				// the recorder will now automatically convert the WAV into MP3
				// and then trigger event "save-audio/mp3" with the mp3 data URL
				// as parameter
			});
		}
	};

	var upload = function(mp3data) {	
		console.log("mp3 data to upload", mp3data);

        var fd = new FormData();
        fd.append('fileName', settings.fileName);
        fd.append('data', mp3data);
        $.ajax({
            type: 'POST',
            url: settings.audioUpload,
            data: fd,
            processData: false,
            contentType: false
        }).success(function(data) {
        	// I have sucessfully 
            console.log("mp3 upload was successful");
            VideoEvents.trigger("finsihed-audio-upload");
        }).fail(function(data) {
        	console.log("mp3 upload failed");
        });
    }

	return AudioRecorder;
    
})(navigator, window);	