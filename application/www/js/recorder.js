/**
* Khanova Škola - vektorové video
*
* THE VIDEO RECORDER OBJECT
* This is the base stylesheet that contains the basic layout and appearance of the board.
*
* @author:		Šimon Rozsíval (simon@rozsival.com)
* @project:	Vector screencast for Khan Academy (Bachelor thesis)
* @license:	MIT
*/

var Recorder = (function(){

	var data = [];
	var chunk = null;

	// tmp data
	var lastTime = 0;
	var current = {
		color: "#fff", 
		size: 3
	};

	var settings = {
		chunkLength: 2000,
		container: {
			selector: "#recorder",
		},
		brush: {
			size: 3,
			color: "#fff"
		},
		cursor: {
			size: 20,
			color: "#fff"
		},
		localization: {
			redirectPrompt: "Do you want to view your recorded video?"
		},
		redirectUrl: ""
	};

	var ui;

	var state = {
		recording: false
	};

	function Recorder(options) {

		// [0] - settings
		$.extend(true, settings, options);
		var el = $(settings.container.selector);

		// [1] - init events
		VideoEvents.init(el);
		bindEvents.call(this);
			
		// [2] - recorder
		state.recording = false;
		var dataProvider = new UserInputDataProvider();
		var settingsProvider = new BasicSettings();
		var lineDrawer = new RoundedLines(settingsProvider);
		var audioRecorder = new AudioRecorder();

		// [3] - UI
		ui = new RecorderUI({
			container: el
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

			if(params.hasOwnProperty("info")) {
				$.extend(true, info, params.info);
			}

			// update info according to recorded data
			info.length = lastTime;
			info.chunkLength = settings.chunkLength;
			info.chunksCount = data.length;

			// board data
			info.board.width = ui.board.width();
			info.board.height = ui.board.height();
			info.board.background = ui.board.css("background");


			// get the XML
			console.log(data);
			var animation = XmlWriter.write(info, data);
			var rawXml = $("<hack />").append(animation).html();
			// html() returns string of it's INNER content
			// - I want to include the root element, so I use this "hack"

			var request = {
				type: "video",
				fileName: params.fileName,
				format: "xml",
				rawData: rawXml
			};

			$.ajax({
				type: "POST",
				url: params.url,
				data: request,
				success: function(e) {

					if(e.hasOwnProperty("path")) {
						settings.redirectUrl = "index.html?file=" + e.path;
					}
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

		var tools = [];

		VideoEvents.on("register-tool", function(e, which) {
			console.log("registered tool: ", which);
			tools.push(which);
		});

		VideoEvents.on("tool-finished", function(e, which) {
			console.log("unregistered tool: ", which);
			var i = tools.indexOf(which);
			if(i > -1) {
				tools.splice(i, 1);
			}

			if(tools.length == 0) { // all the tools have finished doing their job - finish the recording
				finishRecording();
			}
		});

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

	var finishRecording = function() {
		VideoEvents.trigger("recording-finished");
		if(confirm(settings.localization.redirectPrompt)) {
			window.location.replace(settings.redirectUrl);
		}
	};

	return Recorder;

})();
