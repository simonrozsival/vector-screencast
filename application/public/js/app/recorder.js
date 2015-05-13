/**
* Khanova Škola - vektorové video
*
* THE VIDEO RECORDER OBJECT
* This is the main recorder object. It creates instances of all objects needed
* for the tool to run properly.
*
* @author:		Šimon Rozsíval (simon@rozsival.com)
* @project:	Vector screencast for Khan Academy (Bachelor thesis)
* @license:	MIT
*/

var Recorder = (function(){

	// recorded data
	var data = [];
	var chunk = null;

	// tmp data
	var lastTime = 0;
	var current = {
		color: "#fff", 
		size: 3
	};

	// default settings
	var settings = {
		chunkLength: 2000,
		container: {
			id: "recorder"
		},
		cursor: {}, // cursor has it's own defaults
		localization: {
			redirectPrompt: "Do you want to view your recorded video?",
			failureApology: "We are sorry, but your recording could not be uploaded to the server. Do you want to save the recorded data to your computer?",
			ui: {}
		},
		url: {
			saveResult: "",
			redirect: ""
		},
		audio: { }
	};

	// objects
	var ui;
	var audioRecorder;

	// current state of the Recorder
	var state = {
		recording: false
	};

	function Recorder(options) {

		// [0] - settings
		$.extend(true, settings, options);
		var el = document.getElementById(settings.container.id);
		
		// [1] - init events
		bindEvents.call(this);
			
		// [2] - recorder
		state.recording = false;
		var dataProvider = new UserInputDataProvider();
		var settingsProvider = new BasicSettings();
		//var lineDrawer = new RoundedLines(settingsProvider);
		var lineDrawer = new SVGDrawer(settingsProvider);

		// init audio recording
		audioRecorder = new AudioRecorder(settings.audio);
		audioRecorder.init();

		// [3] - UI
		ui = new RecorderUI({
			container: el,
			localization: settings.localization.ui
		});

	}

	var bindEvents = function() {
		VideoEvents.on("start", function() {
			addChunk(0); // add first chunk
			state.recording = true;
			audioRecorder.start();
		});

		VideoEvents.on("continue", function() {
			state.recording = true;
			if(audioRecorder) {
				audioRecorder.continue();
			}
		});

		VideoEvents.on("pause", function() {
			state.recording = false;
			if(audioRecorder) {
				audioRecorder.pause();
			}
		});

		VideoEvents.on("stop", function(e, params) {
			state.recording = false;
			data.push(chunk);
			chunk = null;
			if(audioRecorder && audioRecorder.isRecording()) {
				audioRecorder.stop({
					success: function(files) {
						params.audio = files;
						uploadData(params);
					},
					error: function() {
						finishRecording(false);
					}
				});
			} else {
				// there was no audio
				params.audio = [];
				uploadData(params);
			}
		});

		VideoEvents.on("new-state", function(e, movement) {
			if(state.recording == true) {
				// add data
				movement.type = "cursor-movement";
				addState(movement);
			}
		});

		VideoEvents.on("color-change", function(e, color) {
			current.color = color; // color can be changed at any time

			if(state.recording == true) {
				addState({
					type: "color-change",
					color: color
				});
			}
		});

		VideoEvents.on("brush-size-change", function(e, size) {
			current.size = size;

			if(state.recording == true) {
				addState({
					type: "brush-size-change",
					size: size
				});
			}
		});

		VideoEvents.on("update-info", function(e, infoData) {
			setInfoData(infoData);
		});

	};

	var addState = function(videoState) {
		// color changes and brush size changes do not have exact timing
		if (videoState.hasOwnProperty("time")) {
			lastTime = videoState.time;
			if(chunk.start + settings.chunkLength < videoState.time) {
				addChunk(videoState.time);
			}
		}
		chunk.cursor.push(videoState);
	};

	var addChunk = function(time) {
		if (chunk != null) {
			data.push(chunk);
		}

		chunk = {
			start: time - (time % settings.chunkLength), // rounded start time
			color: current.color,
			size: current.size,
			cursor: []
		};
	};

	//
	// Video information
	//

	var info = {
		about: {
			author: "",
			title: "",
			description: ""
		},
		length: 0,
		chunkLength: 2000,
		chunksCount: 0,
		board: {
			width: 800,
			height: 400,
			background: "#000"
		},
		audio: []
	};

	var setInfoData = function(infoData) {
		$.extend(true, info, infoData);
	};


	//
	// Upload the result
	//

	var uploadData = function(params) {
		console.log("Uploading recorded data...");

		// load settings
		params = params || {};
		params.info = params.info || {};
		$.extend(true, info, params.info);

		// update info according to recorded data
		info.length = lastTime;
		info.chunkLength = settings.chunkLength;
		info.chunksCount = data.length;

		// board data
		info.board.width = ui.board.width();
		info.board.height = ui.board.height();
		info.board.background = ui.board.css("background");

		// audio data
		info.audio = params.audio || [];

		// DOMElement to XML (String)
		// - wrap inside an imaginary node and then use it's INNER HTML
		var animation = XmlWriter.write(info, data);
		var hack = document.createElement("hack");
		hack.appendChild(animation);
		var rawXml = hack.innerHTML;

		// if I need saving the data to local computer in the future
		VideoEvents.on("save-data", function() {
			Saver.saveXml(rawXml);
		});

		// the data of the request
		//
		var request = {
			title: info.about.title,
			description: info.about.description,
			xml: rawXml,
			audio: params.audio
		};

		$.ajax({
			type: "POST",
			url: settings.url.saveResult,
			data: request,
			success: function(data) {
				// data saved
				if(data.success === true) {
					finishRecording(true, data.redirect);
				} else {
					console.log("Error: ", data.msg);
					finishRecording(false);
				}
			},
			error: function(e) {
				alert("Could not save the data.");
				console.log("request error", e);
				finishRecording(false);
			}
		});

	};


	/**
	 * Redirect the user after successfully finishing recording.
	 * @param  {bool} 	success Was the whole process successful?
	 * @param  {string}	url to redirect to
	 * @return {void}   Nothing is returned, if everything is OK and the user agrees
	 *                  then user is redirected to the player to check his recording.
	 */
	var finishRecording = function(success, url) {
		VideoEvents.trigger("recording-finished");

		if(success === true) {			
			if(confirm(settings.localization.redirectPrompt)) {
				window.location.replace(url);
			}
		} else {
			if(confirm(settings.localization.failureApology)) {
				VideoEvents.trigger("save-data");
			}
		}
	};

	return Recorder;

})();
