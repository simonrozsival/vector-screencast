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
			selector: "#recorder",
		},
		cursor: {}, // cursor has it's own defaults
		localization: {
			redirectPrompt: "Do you want to view your recorded video?",
			failureApology: "We are sorry, but your recording could not be uploaded to the server. Do you want to save the recorded data to your computer?",
			ui: {}
		},
		url: {
			uploadVideo: "",
			redirect: ""
		},
		audio: {
			uploadAudio: "",
			recordJs: {}
		}
	};

	// the UI object
	var ui;

	// current state of the Recorder
	var state = {
		recording: false
	};

	// ID of database row
	var recordingId;

	function Recorder(options) {

		// [0] - settings
		$.extend(true, settings, options);
		var el = $(settings.container.selector);

		// [1] - init events
		bindEvents.call(this);
			
		// [2] - recorder
		state.recording = false;
		var dataProvider = new UserInputDataProvider();
		var settingsProvider = new BasicSettings();
		var lineDrawer = new RoundedLines(settingsProvider);
		var audioRecorder = new AudioRecorder(settings.audio);

		// [3] - UI
		ui = new RecorderUI({
			container: el,
			localization: settings.localization.ui
		});

	}

	var bindEvents = function() {
		VideoEvents.on("start", function() {
			state.recording = true;
			addChunk(0); // add first chunk
		});

		VideoEvents.on("pause", function() {
			state.recording = false;
			data.push(chunk);
			chunk = null;
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

		VideoEvents.on("upload-recorded-data", function(e, params) {

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


			// get the XML
			var animation = XmlWriter.write(info, data);
			var rawXml = $("<hack />").append(animation).html();
			// html() returns string of it's INNER content
			// - I want to include the root element, so I use this "hack" 
			
			// if I need saving the data to local computer in the future
			VideoEvents.on("save-data", function() {
				Saver.saveXml(rawXml);
			});

			// the data of the request
			// 
			var request = {
				type: "video",
				id: params.fileName,
				format: "xml",
				rawData: rawXml,
				title: info.about.title,
				author: info.about.author,
				description: info.about.description
			};

			$.ajax({
				type: "POST",
				url: settings.url.uploadVideo,
				data: request,
				success: function(e) {
					recordingId = e.recordingId;
					VideoEvents.trigger("recording-id", e.recordingId);
					VideoEvents.trigger("tool-finished", "video-recorder");
				},
				error: function(e) {
					alert("Could not save the data.");
					console.log("request error", e);
				}
			});

		});

		VideoEvents.on("update-info", function(e, infoData) {
			setInfoData(infoData);
		});

		// array of all registered tools
		// recorder waits until all registered tools finish their job (either successfully or unsuccessfully) before finishing recording
		var tools = [];

		VideoEvents.on("register-tool", function(e, which) {
			console.log("registered tool: ", which);
			tools.push(which);
		});

		// were all subtasks successful?
		var success = true;

		VideoEvents.on("tool-finished", function(e, which) {
			unregisterTool(which);
		});

		VideoEvents.on("tool-failed", function(e, which) {
			success = false;
			unregisterTool(which);
		});
		
		var unregisterTool = function(tool) {
			console.log("unregistered tool: ", tool);
			var i = tools.indexOf(tool);
			if(i > -1) {
				tools.splice(i, 1);
			}

			if(tools.length == 0) { // all the tools have finished doing their job - finish the recording
				finishRecording(success);
			}			
		};

		VideoEvents.trigger("register-tool", "video-recorder");
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
		}
	};

	var setInfoData = function(infoData) {
		$.extend(true, info, data);
	};


	/**
	 * Redirect the user after successfully finishing recording.
	 * @param  {bool} success Was the whole process successful?
	 * @return {void}         Nothing is returned, if everything is OK and the user agrees 
	 *                        then user is redirected to the player to check his recording.
	 */
	var finishRecording = function(success) {
		VideoEvents.trigger("recording-finished");

		if(success === true) {			
			if(confirm(settings.localization.redirectPrompt)) {
				$.ajax({
					url: settings.url.getLink,
					type: "GET",
					data: {
						recordingId: recordingId
					},
					success: function(data) {						
						window.location.replace(data.url);
					},
					error: function() {
						alert(settings.localization.redirectFailiure);
					}
				});
			}
		} else {
			if(confirm(settings.localization.failureApology)) {
				VideoEvents.trigger("save-data");
			}
		}
	};

	return Recorder;

})();
