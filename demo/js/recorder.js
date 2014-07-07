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

	// defaults
	var defaultChunkLength = 2000;
	var defaultColor = "#fff";
	var defaultSize = 3;

	// tmp data
	var lastChunkStart = 0;
	var chunkLength;
	var currentColor, currentSize;

	function Recorder(opts) {
				
		if(opts != undefined && opts.hasOwnProperty("chunkLength")) {
			chunkLength = opts.chunkLength;
		} else {
			chunkLength = defaultChunkLength;
		}

		if(opts != undefined && opts.hasOwnProperty("defaultColor")) {
			currentColor = opts.defaultColor;
		} else {
			currentColor = defaultColor;
		}

		if(opts != undefined && opts.hasOwnProperty("defaultSize")) {
			currentSize = opts.defaultSize;
		} else {
			currentSize = defaultSize;
		}

		var recording = false;

		VideoEvents.on("start", function() {
			recording = true;
			addChunk(0); // add first chunk
		});

		VideoEvents.on("pause", function() {
			recording = false;
			data.push(chunk);
			chunk = null;
		});

		VideoEvents.on("new-state", function(e, state) {
			if(recording == true) {
				// add data
				addState(state);
			}
		});

		VideoEvents.on("color-change", function(e, state) {
			currentColor = state.value; // color can be changed at any time

			if(recording == true) {
				addState({
					type: "color-change",
					value: state.value
				});
			}
		});

		VideoEvents.on("brush-size-change", function(e, state) {
			currentSize = state.value;

			if(recording == true) {
				addState({
					type: "brush-size-change",
					value: state.value
				});
			}
		});

		VideoEvents.on("upload-recorded-data", function(e, url) {
			console.log("info", info);
			console.log("data", data);

			var animation = XmlWriter.write(info, data);
			var rawXml = $("<hack />").append(animation).html();
			// html() returns string of it's INNER content
			// - I want to include the root element, so I use this "hack"

			var request = {
				type: "video",
				format: "xml",
				rawData: rawXml
			};

			console.log("request data", request);

			$.ajax({
				type: "POST",
				url: url,
				data: request,
				success: function(e) {
					console.log("request success", e);
				},
				error: function(e) {
					console.log("request error", e);
				}
			});
		});

		VideoEvents.on("update-info", function(e, infoData) {
			setinfoData(infoData);
		});
	};

	var addState = function(state) {
		if (state.hasOwnProperty("time") && chunk.start + chunkLength < state.time) {
			// color changes and brush size changes do not have exact timing
			addChunk(state.time);
		}

		lastChunkStart = 0;
		chunk.cursor.push(state);
	};

	var addChunk = function(time) {
		if (chunk != null) {
			data.push(chunk);
		}

		chunk = {
			start: time - (time % chunkLength), // rounded start time
			color: currentColor,
			size: currentSize,
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
		chunkCount: 0,
		board: {
			width: 800,
			height: 400,
			background: "#000"
		}
	};

	var setinfoData = function(infoData) {
		$.extend(true, info, data);
	};

	return Recorder;

})();
