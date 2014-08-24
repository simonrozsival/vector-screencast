/**
 * This recorder uses the HTML5 API to record sound from microphone
 * and produces an MP3 file as an output.
 * 
 * @author Šimon Rozsíval
 */

var AudioRecorderUsingRecordRTC = (function(navigator, window) {
	
	/** AudioContext */
	var context;

	/** Audio stream source */
	var input;

	/** object */
	var settings;

	/** bool */
	var readyToExport;

	/** RecorderRTC */
	var recorder = false;

	function AudioRecorderUsingRecordRTC(config) {

		// "this" object for closures
		var _this = this;

		readyToExport = false;

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
					
					// init the library
					recorder = RecordRTC(localMediaStream, {
	                	bufferSize: 16384
		            });

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
			readyToExport = false;
			recorder.startRecording();
		}
	};

	var pause = function() {
		// check, if recorder was successfully initialised first
		if(recorder) {
			recorder.stopRecording(function(wavBlob) {
				// original... I don't want to do anything with wav files..
				 
				// I can convert the content to any desired format
				readyToExport = true;
			});
		}
	};

	var convert = function() {
		if(recorder && readyToExport == true) {
			console.log("Starting converting.");
			convertStreams(recorder.getBlob());
		}
	};

	// cdn ffmpeg library - about 18 MB large :-(
	// @author: @bgrins (https://twitter.com/bgrins), @aaronm67 (https://twitter.com/aaronm67) - see https://github.com/bgrins/videoconverter.js - LGPL v2.1
	var workerPath = 'https://cdn.webrtc-experiment.com/ffmpeg_asm.js';

	function createFFmpegWorker() {
	    var blob = URL.createObjectURL(new Blob(['importScripts("' + workerPath + '");var now = Date.now;function print(text) {postMessage({"type" : "stdout","data" : text});};onmessage = function(event) {var message = event.data;if (message.type === "command") {var Module = {print: print,printErr: print,files: message.files || [],arguments: message.arguments || [],TOTAL_MEMORY: message.TOTAL_MEMORY || false};postMessage({"type" : "start","data" : Module.arguments.join(" ")});postMessage({"type" : "stdout","data" : "Received command: " +Module.arguments.join(" ") +((Module.TOTAL_MEMORY) ? ".  Processing with " + Module.TOTAL_MEMORY + " bits." : "")});var time = now();var result = ffmpeg_run(Module);var totalTime = now() - time;postMessage({"type" : "stdout","data" : "Finished processing (took " + totalTime + "ms)"});postMessage({"type" : "done","data" : result,"time" : totalTime});}};postMessage({"type" : "ready"});'], {
	        type: 'application/javascript'
	    }));

	    var worker = new Worker(blob);
	    URL.revokeObjectURL(blob);
	    return worker;
	}

	var worker;

	/**
	 * Converts recorded audio to OGG.
	 * @param  {Blob} audioBlob The blob recorded by RecordRTC
	 */
	function convertStreams(audioBlob) {

	    // contains 
	    var audioArrayBuffer;

	    var buffersReady;
	    var workerReady;
	    var posted;

	    // read audioBlob and prepare it to be sent to the FFmpeg (running in a background task as a Worker)
	    // that will convert it from 
	    var fileReader = new FileReader();
	    fileReader.onload = function() {
	        audioArrayBuffer = this.result; // result is ArrayBuffer
	        postMessage();
	    };
	    fileReader.readAsArrayBuffer(audioBlob);

	    if (!worker) {
	        worker = createFFmpegWorker();
	    }

	    // responses from the "ffmpeg worker"
	    worker.onmessage = function(event) {
	        var message = event.data;
	        if (message.type == "ready") {
	            workerReady = true;
	            if (buffersReady)
	                postMessage();
	        } else if (message.type == "done") {
	            var result = message.data[0];
	            var blob = new Blob([result.data], {
	                type: 'audio/ogg'
	            });
	            upload(blob);
	        }
	    };

	    var postMessage = function() {
	        posted = true;

	        worker.postMessage({
	            type: 'command',
	            arguments: [
	                '-i', 'audio.wav', 
	                '-c:a', 'vorbis', 
	                '-b:a', '4800k', 
	                '-strict', 'experimental', 'output.mp4'
	            ],
	            files: [
	                {
	                    data: new Uint8Array(audioArrayBuffer),
	                    name: "audio.wav"
	                }
	            ]
	        });
	    };
	}

	var upload = function(oggBlob) {	
		console.log("ogg data to be uploaded", oggBlob);

		var fileReader = new FileReader();
		fileReader.onload = function() {
            VideoEvents.trigger("finsihed-audio-converting");

			var dataUrl = this.result;
			console.log("Ogg - data url: ", dataUrl);

			// send the data to the server
	        var fd = new FormData();
	        fd.append('fileName', settings.fileName);
	        fd.append('data', dataUrl);
	        $.ajax({
	            type: 'POST',
	            url: settings.audioUpload,
	            data: fd,
	            processData: false,
	            contentType: false
	        }).success(function(data) {
	        	// I have sucessfully 
	            console.log("ogg upload was successful");
	            VideoEvents.trigger("finsihed-audio-upload");
	        }).fail(function(data) {
	        	console.log("ogg upload failed");
	        });
		};
		fileReader.readAsDataURL(oggBlob);

    }

	return AudioRecorderUsingRecordRTC;
    
})(navigator, window);	