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
	var lastTime = 0;
	var chunkLength;
	var currentColor, currentSize;

	// board
	var width, height, background;

	function Recorder(opts, board) {
				
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

		if(board != undefined) {
			width = board.width();
			height = board.height();
			background = board.css("backgroundColor");
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
				state.type = "cursor-movement";
				addState(state);
			}
		});

		VideoEvents.on("color-change", function(e, color) {
			currentColor = color; // color can be changed at any time

			if(recording == true) {
				addState({
					type: "color-change",
					color: color
				});
			}
		});

		VideoEvents.on("brush-size-change", function(e, size) {
			currentSize = size;

			if(recording == true) {
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
			info.chunksCount = data.length;

			// board data
			info.board.width = width;
			info.board.height = height;
			info.board.background = background;


			// get the XML
			var animation = XmlWriter.write(info, data);
			var rawXml = $("<hack />").append(animation).html();
			// html() returns string of it's INNER content
			// - I want to include the root element, so I use this "hack"

			var request = {
				type: "video",
				format: "xml",
				rawData: rawXml
			};

			$.ajax({
				type: "POST",
				url: params.url,
				data: request,
				success: function(e) {
					if(e.hasOwnProperty("path")) {
						var url = "index.html?file=" + e.path;
						window.location.replace(url);
					}
				},
				error: function(e) {
					alert("Could not save the data.");
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
			lastTime = state.time;
		}

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
		chunksCount: 0,
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
