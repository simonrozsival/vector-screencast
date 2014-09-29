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
			        fd.append('fileName', settings.fileName);
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
var AudioPlayer = (function() {

	var playing, reachedEnd;
	var audio, $audio;
	var initSuccessful;

	function AudioPlayer(sources, events) {

		// create audio element
		$audio = $("<audio>").attr("preload", "auto");
		audio = $audio[0]; // access to the HTML5 api - I don't want to have it wrapped in the jQuery object

		// default value - if something fails, it will remain set to 'false'
		initSuccessful = false;

		if(audio.canPlayType == undefined) {
			console.log("ERROR: browser does not support HTML5 audio");
			return;
		}

		// the audio is stopped when the page is loaded
		audio.autoplay = false;
		playing = false;
		reachedEnd = false;

		// add sources
		var canPlaySound = false;
		for (var source in sources) {
			var contentType = "audio/" + sources[source].type;

			if(!!audio.canPlayType(contentType)) {	
				// can play type returned "probably" or "maybe"
				// it would return "" if this browser does not support this type (-> I use "!!" to convert string to boolean (empty string -> false))
				$source = $("<source>").attr("type", contentType).attr("src", sources[source].file);
				$audio.append($source);
				canPlaySound = true;
			}
		}

		// check if at least one source is probably acceptable
		if(canPlaySound == true) {
			// init was successful
			initSuccessful = true;

			// default system events
			attachPrivateEvents.call(this);

			// user can pass his events for the audio element
			attachEvents.call(this, events);

			// attach the player to the document
			$("body").append($audio);
			console.log("Audio is available.");
		} else {
			console.log("Can't play any provided audio sources.");
		}

	}

	AudioPlayer.prototype.isReady = function() {
		return initSuccessful;
	};

	//
	// private functions section:
	// 
	
	var attachPrivateEvents = function() {
		$audio.on("ended", function() {
			playing = false;
			reachedEnd = true;
			console.log("(audio reached end)");
		});

		$audio.on("pause", function() {
			if(playing) {
				VideoEvents.trigger("pause");
			}
		});

		$audio.on("timeupdate", function(e) {
			reportCurrentTime();			
		});
		
		VideoEvents.on("start", function() {
			play();
		});

		VideoEvents.on("pause", function() {
			pause();
		});

		VideoEvents.on("reached-end", function() {
			reachedEnd = true;
			pause();
		});

		VideoEvents.on("replay", function() {
			rewind();
			play();
		});

		VideoEvents.on("skip-to", function(e, progress) {
			reachedEnd = false; // if I was at the end and I changed the position, I am not at the end any more!
			changePosition(audio.duration * progress);
		});

		// Has the browser preloaded something since last time?
		// Change the css styles only if needed.
		var lastEnd = null;
		var checkPreloaded = setInterval(function() {
			if(audio.canPlayThrough) {
				clearInterval(checkPreloaded);
			} else {
				var end = audio.buffered.end(audio.buffered.length - 1); 
				if(end !== lastEnd) {
					VideoEvents.trigger("buffered-until", end);
					lastEnd = end;
				}
			}
		}, 1000); // every second check, how much is preloaded
	};
	

	var attachEvents = function(events) {
		for (var eventName in events) {
			$audio.on(eventName, events[eventName]);
		}
	};

	var play = function() {
		if(initSuccessful) {
			if(reachedEnd == true) {
				rewind();
			}

			audio.play();
		}
	};

	var pause = function() {
		if(initSuccessful) {
			audio.pause();
		}
	};

	var rewind = function() {
		if(initSuccessful) {
			audio.pause();
			audio.currentTime = 0;
			reachedEnd = false;
		}
	};

	var changePosition = function(seconds, callback) {
		console.log("audio - change position to " + seconds + "s");
		audio.currentTime = seconds;
		$audio.on("canplay", callback);
	};

	var reportCurrentTime = function() {
		VideoEvents.trigger("current-time", $audio[0].currentTime);
	};

	return AudioPlayer;

})();

// Abstract class

var BaseDataProvider = {

	ready: function() {
		VideoEvents.trigger("data-ready");
	},

	init: function() {
		var _this = this;
		VideoEvents.on("start", function() {
			_this.start();
		});

		VideoEvents.on("pause", function() {
			_this.pause();
		});
	},

	start: function() {
		this.running = true;
	},

	pause: function() {
		this.running = false;
	},

	reportAction: function(state) {
		if(state != undefined && state != {}) {
			VideoEvents.trigger("new-state", state);
		}
	}
};
var UserInputDataProvider = (function() {

	// private variables	
	var state = {
		running: false,
		mouseDown: false
	};

	var offset;

	// cursor position
	var cursor = {
		x: 0,
		y: 0
	};
	var timer;
	var penApi = false;


	function UserInputDataProvider() {
		document.onmousemove = function(e) { onMouseMove(e) };
		document.onmousedown = function(e) { onMouseDown(e); };
		document.onmouseup = function(e) { onMouseUp(e); };
		window.onblur = function(e) { onMouseUp(e); }; // mouse up can't be determined when window (tab) is not focused - the app acts unexpectedly

		init();
	}

	var getCurrentCursorState = function() {
		return {
			x: cursor.x,
			y: cursor.y,
			pressure: getPressure(),
			time: timer.currentTime()
		};
	};

	var getPressure = function() {
		if(penApi && penApi.pointerType == 1) { // 1 == PEN, 0 == MOUSE, 3 == ERASER
			return penApi.pressure; // pressure is from 0.0 to 1.0 - in percent
		} else {
			return state.mouseDown ? 1 : 0;
		}
	}

	var correctMouseCoords = function(e) {
		if (e.pageX == undefined || e.pageY == undefined) {
			console.log("Wrong 'correctMouseCoords' parameter. Event data required.");
		}

		return {
			x: e.pageX - offset.left,
			y: e.pageY - offset.top
		};
	};

	// 
	// Events
	//
	
	var init = function() {
		timer = new VideoTimer();

		VideoEvents.on("canvas-ready", function(e, canvas) {
			offset = canvas.offset();
		});

		VideoEvents.on("start", function() {
			start();
		});

		VideoEvents.on("pause", function() {
			pause();
		});

		// is Wacom tablet ready?
		VideoEvents.on("wacom-plugin-ready", function(e, $plugin) {
			var plugin = $plugin[0];
			if(plugin.version != undefined) {
				console.log("Wacom tablet is connected and plugin installed. Plugin version is " + plugin.version + ".");
				penApi = plugin.penAPI;
			}
		});
	};

	var start = function() {
		state.running = true;
		timer.resetTimer();
	};

	var pause = function() {
		state.running = false;
	};

	var reportAction = function(action) {
		if(action != undefined && action != {}) {
			VideoEvents.trigger("new-state", action);
		}
	};

	//
	// User input
	//  

	var onMouseMove = function(e) {
		if(state.running) {		
			cursor = correctMouseCoords.call(this, e);
			reportAction(getCurrentCursorState());
		}
	};

	var onMouseDown = function(e) {
		if(state.running) {		
			state.mouseDown = true;
			reportAction(getCurrentCursorState());
		}
	};

	var onMouseUp = function(e) {
		if(state.running) {
			state.mouseDown = false;
			reportAction(getCurrentCursorState());
		}
	};

	return UserInputDataProvider;

})();
var XmlDataProvider = (function(){

	// private variables
	var videoInfo;

	// ratio needed to calculate right coordinates of cursor
	var correctionRatio;

	var state = {
		running: false,
		reachedEnd: false,
		current: undefined,
		last: undefined
	};

	var startTime;
	var timeout;

	function XmlDataProvider(fileName) {
		var _this = this;
		videoInfo = new XmlReader({
			file: fileName,
			success: function() {
				// attach events
				initEvents.call(_this);

				// info is ready
				VideoEvents.trigger("data-ready", getInfo());

				// prepare for start!
				rewind();
			},
			error: function(msg) {
				// some other process will take care of the error and display it properly
				VideoEvents.trigger("error", msg);
			}
		});
		state.running = false;
	}

	var initEvents = function() {

		VideoEvents.on("board-dimensions", function(e, size) {			
			// compare the real dimensions to the size of board at the time of recording
			// the width of lines must be corrected with this ratio:
			correctionRatio = size.width / getInfo().board.width;
			VideoEvents.trigger("new-board-correction-ratio", correctionRatio);
		});

		VideoEvents.on("start", function() {
			start();
		});

		VideoEvents.on("pause", function() {
			stop();
		});

		VideoEvents.on("rewind", function() {
			rewind();
		});

		var _this = this;
		VideoEvents.on("skip-to", function(e, progress) {
			var time = progress * getInfo().length;
			if (time > state.current.time) {
				skipForward.call(_this, time);
			} else {
				skipBackwards.call(_this, time);
			}
		});

	};

	var getNextCursorState = function() {

		var next = videoInfo.getNext();
		while (next != undefined
				&& next.type != "cursor-movement") {

			switch(next.type) {
				case "color-change":
					console.log("Change color to ", next.color);
					VideoEvents.trigger("color-change", next.color);
					break;
				case "brush-size-change":
					VideoEvents.trigger("brush-size-change", next.size); // corrected size
					break;
			}

			next = videoInfo.getNext();
		}

		if(next == undefined) {
			next = {
				time: getInfo().length,
				x: -1,
				y: -1,
				pressure: 0
			};

			state.reachedEnd = true;
			stop();
		}

		state.last = state.current;
		state.current = correctCoords(next);

		return state.current;
	};

	var correctCoords = function(state) {
		return {
			x: state.x * correctionRatio,
			y: state.y * correctionRatio,
			pressure: state.pressure,
			time: state.time
		}
	};

	var getInfo = function() {
		return videoInfo.getInfo(); // this information is available only after the document is loaded!
	};

	var rewind = function() {
		state.last = { time: 0 };
		state.current = videoInfo.getNext();
		state.reachedEnd = false;
	};

	var start = function() {
		startTime = Date.now();
		startTime -= state.last.time;	// I can start in the middle (when pausing in the middle)
										// -> I have to "shift" the start time into the past, so it works properly																									
		state.running = true;
		tick();
	};

	var skipForward = function(time) {
		tickUntil.call(this, time);
	};

	var skipBackwards = function(time) {
		VideoEvents.trigger("rewind");
		tickUntil.call(this, time);
	};

	var tickUntil = function(time) {
		getNextCursorState();
		while(state.current.time < time) {
			VideoEvents.trigger("new-state", state.current);
			getNextCursorState();
		}
	};

	// sometimes the rendering is too slow - do not set timeouts at all
	var debt = 0; // always a non-positive number

	var tick = function() {
		getNextCursorState();
		if(state.running) {
			VideoEvents.trigger("next-state-peek", state.current);
			var timeGap = state.current.time - (Date.now() - startTime) - debt;			
			debt = 0; // I have paid off the debt

			if (timeGap > 0) {
				// if there was a dept, I have paid it off I have paid off the debt
				timeout = setTimeout(function() {
					VideoEvents.trigger("new-state", state.current);
					tick();
				}, timeGap);				
			} else {
				debt = timeGap; // I have a time debt!
				console.log("debt: ", debt);
				tick();
			}
		}
	};

	var stop = function() {
		// if there is a timeout waiting, do not let it 
		clearTimeout(timeout);

		if(state.running == true) {
			state.running = false;

			if(state.reachedEnd == true) {
				VideoEvents.trigger("reached-end");
			}
		}
	};


	return XmlDataProvider;
})();/**
 * Khanova Škola - vektorové video
 *
 * BASIC LINE DRAWING OBJECT
 * This is the base script containing basic line drawing
 *
 * @author:		Šimon Rozsíval (simon@rozsival.com)
 * @project:	Vector screencast for Khan Academy (Bachelor thesis)
 * @license:	MIT
 */


var RoundedLines = (function() {

	// private variables
	var canvas, context;
	var last = {
		x: 0,
		y: 0,
		radius: 0
	};

	// dimensions of the board
	var board = {
		width: 0,
		height: 0
	};

	// current settings - color and size
	var settings;

	function RoundedLines(settingsObject) {

		VideoEvents.on("canvas-ready", function(e, $canvas) {
			canvas = $canvas[0];
			context = canvas.getContext("2d");
			board.width = $canvas.width();
			board.height = $canvas.height();
		});

		settings = settingsObject;

		// attach events
		var _this = this;
		VideoEvents.on("rewind", function() {
			clearAll();
		});

		var lastState = { x: this.x, y: this.y, pressure: this.pressure, inside: true };
		VideoEvents.on("new-state", function(e, state) {
			if(state.pressure > 0) {
				//if(state.inside == true || lastState.inside == true) {
					if(lastState.pressure == 0
						) {//|| lastState.inside == false) {
						startLine.call(_this, state.x, state.y, state.pressure);
					} else {
						continueLine.call(_this, state.x, state.y, state.pressure);
					}
				//}
			} else if (lastState.pressure > 0) {
				endLine.call(_this, state.x, state.y);
			}

			// save this state for next time
			lastState = state;
		});

		VideoEvents.on("skip-to", function(e, progress) {

		});

	};

	var startLine = function(x, y, pressure) {
		var radius = calculateRadius(pressure);
		drawDot(x, y, radius);

		// save the data
		last.x = x;
		last.y = y;
		last.radius = radius;
	};

	var continueLine = function(x, y, pressure) {
		var radius = calculateRadius(pressure);
		drawSegment.call(this, x, y, radius);

		// save the data
		last.x = x;
		last.y = y;
		last.radius = radius;
	};

	var calculateRadius = function(pressure) {
		return (pressure * current().brushSize) / 2;
	};

	var current = function() {
		return settings.getCurrentSettings();
	};

	var drawDot = function(x, y, radius) {		
		var c = context;

		// load current settings
		c.fillStyle = current().color;

		// draw a dot
		c.beginPath();
		c.arc(x, y, radius, 0, Math.PI*2, true); 
		c.closePath();
		c.fill();
	};

	var drawSegment = function(x, y, radius) {
		var c = context;

		var current = settings.getCurrentSettings();
		c.strokeStyle = current.color;

		// draw path from the prev point to this one
		c.beginPath();

		var points = calculatePathPoints(x, y, radius);
		var start = points.shift();
		c.moveTo(start.x, start.y);
		for(i in points) {		
			var point = points[i];
			c.lineTo(point.x, point.y);
		}
		c.closePath();
		c.fill();

		drawDot(x, y, radius);
	};

	var calculatePathPoints = function(x, y, radius) {

		// calculate the normal vector and normalise it
		var normalVector = {
			x: last.y - y,
			y: x - last.x
		};
		var norm = Math.sqrt(normalVector.x*normalVector.x + normalVector.y*normalVector.y);
		normalVector.x /= norm;
		normalVector.y /= norm;

		return [
			// A' point
			{
				x: last.x + normalVector.x*last.radius,
				y: last.y + normalVector.y*last.radius
			},
			// A"
			{
				x: last.x - normalVector.x*last.radius,
				y: last.y - normalVector.y*last.radius
			},
			// B"
			{
				x: x - normalVector.x*radius,
				y: y - normalVector.y*radius
			},
			// B'
			{
				x: x + normalVector.x*radius,
				y: y + normalVector.y*radius
			}
		];
	};

	var endLine = function(x, y, pressure) {
		// don't draw anything - segment ends with a dot..
		lastNormalVector = {x: 0, y: 0};
	};

	var clearAll = function() {
		context.clearRect(0, 0, board.width, board.height);
	};


	return RoundedLines;
})();

var XmlReader = (function() {

	// video header
	var info;

	// an ordered array of video data
	var chunks = [];

	// current step
	var currentChunk, currentStep;

	var loadedSuccessfully = false;

	function XmlReader(opts) {
		VideoEvents.on("rewind", function() {
			rewind();
		});

		loadFile(opts, function() {
			// set initial values when the data is loaded
			rewind();			
		});
	}


	var loadFile = function(opts, callback) {
		
		var reportError = console.log;
		if(opts.hasOwnProperty("error") && typeof opts.error == "function") {
			var reportError = opts.error;
		}

		// download the whole file - it shoud be small
		$.ajax({
			
			type: "GET",
			url: opts.file,
			dataType: "xml",	

			success:	function(data) {

							// 
							// this is now not the XmlReader object!
							// 

							var $xml = $(data); // data must be well-formed to succeed
							//
							// @note: the "$" indicates that the variable contains a jQuery object
							// 
							
							if($xml.length == 0) { // jQuery returns an empty array, when data is not well-formed XML
								// xml was not well-formed
								console.log("Document is not a well-formed XML document and the video can't be loaded nor played.");
								return null;
							}
							
							if(checkVersion($xml)) {
								if(loadData($xml)) {
									console.log("Data was loaded successfully.");
									loadedSuccessfully = true;

									// private callback, it is always set
									callback.call();

									//
									// Everything is set up now.
									//
									
									// call a callback if it was set from the outside as an option
									if(opts.hasOwnProperty("success") && typeof opts.success == "function") {
										opts.success.call();
									}
								} else {
									console.log("Could not load data from a valid document.");
									if(typeof reportError == "function") {
										reportError("An error occured while loading data.");
									}
								}
							} else {
								console.log("Document is not valid or the version of the document is unsupported.");
								if(typeof reportError == "function") {
									reportError("Could not open this document. It is damaged or the version of the document is not supported.");
								}
							}
						},

			fail: 	function() {
						console.log("Retrieving the file failed.");
						if (typeof reportError == "function") {
							reportError("Could not open the document.");
						}
					},
		});
	}

	XmlReader.prototype.isLoaded = function() {
		return loadedSuccessfully === true;
	}

	/**
	 * The version of documents that is supported by this
	 * @return {string} Supported version.
	 */
	var supportedVersion = function() { return "dev"; };

	var checkVersion = function($xml) { 
		var attr = $xml.find("animation").attr("version");
		return attr == supportedVersion();
	};

	var xsdFile = function() {
		return "/xml/khan-academy/vector-video.xsd";
	};

	var validateXmlDocument = function(rawXml, validationFunction) {

		// if validation was requested
		if(typeof validationFunction == "function") {
			if(!validationFunction(rawXml, xsdFile())) {
				console.log("Validation against an XSD document was requested and it failed.");
				return false;
			}
		}
		//

		return true; // there might be no validation at all
		// @todo: Explain here in comments, why validation is not strictly required.
	}

	XmlReader.prototype.getInfo = function() {
		return info;
	};

	var loadData = function($xml) {
		// I know that:
		// - the file is a well-formed XML (but it doesn't have to be valid!)
		// - the version is OK too
		
		// [1] load info data

		var search = function(parent) {
			var data = {};

			parent.children().each(function(){
				var child = $(this);
				data[this.tagName] = child.children().length > 0 ? search(child) : child.text();
			});

			return data;
		};
		
		info = search($xml.find("info"));	

		// [2] load image data

		$xml.find("chunk").each(function(){
			// this is now the current chunk
			var chunk = $(this);
			
			var data = {
				start: chunk.attr("start"),
				currentColor: chunk.attr("current-color"),
				currentBrushSize: chunk.attr("current-brush-size"),
				cursor: [],
				prerendered: chunk.children("svg")
			};

			chunk.children("cursor").children().each(function(){
				var tagName = this.tagName;
				var item = $(this);
				switch (tagName) {
					case "m":
						data.cursor.push({
							type: "cursor-movement",
							x: parseInt(item.attr("x")),
							y: parseInt(item.attr("y")),
							pressure: parseFloat(item.attr("p")),
							time: parseInt(item.attr("t"))
						});
						break;
					case "c":
						data.cursor.push({
							type: "color-change",
							color: item.attr("value")
						});
						break;
					case "s":
						data.cursor.push({
							type: "brush-size-change",
							size: parseInt(item.attr("value"))
						});
						break;
				}
			});

			chunks.push(data);
		});

		return true;
	};

	XmlReader.prototype.getNext = function() {
		if(chunks.length <= currentChunk) {
			return undefined;
		}

		if(chunks[currentChunk].cursor.length <= currentStep) {
			// skip to the next chunk
			currentStep = 0;
			currentChunk++;

			// have I reached the very end of the video?
			if(chunks.length <= currentChunk) {
				// end of the video
				return undefined;
			}
		}

		var chunk = chunks[currentChunk].cursor[currentStep++];
		return chunk;
	};


	XmlReader.prototype.getPrerenderedData = function(from, to) {
		
	};

	var rewind = function() {
		console.log("rewind");
		jumpTo(0, 0);
	};

	var jumpTo = function(chunk, step) {
		currentChunk = chunk; // the first chunk
		currentStep = step; // the first "step" of the first chunk
		VideoEvents.trigger("color-change", chunks[currentChunk].currentColor);
		VideoEvents.trigger("brush-size-change", chunks[currentChunk].currentBrushSize);
	};

	return XmlReader;

})();

var XmlWriter = (function() {
	
	var namespaces = {
		"xmlns": "http://www.rozsival.com/xml/khan-academy",
		"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
		"xmlns:noNmespaceSchemaLocation": "vector-video.xsd"
	};

	var createRootElement = function(version) {
		var animation = createElem("animation").attr("version", version);
		for (var ns in namespaces) {
			animation.attr(ns, namespaces[ns]);
		}

		return animation;
	};

	var createInfoElement = function(info, name) {
		if(name == undefined) {
			name = "info"; // the root elem.
		}

		var root = createElem(name);
		for (var item in info) {
			if(typeof info[item] == "object") {
				root.append(createInfoElement(info[item], item))
			} else {
				var el = createElem(item);
				el.text(info[item]);
				root.append(el);
			}
		}

		return root;
	};
	var createDataElement = function(data) {
		var dataEl = createElem("data");

		for (var i = 0; i < data.length; i++) {
			var chunk = createElem("chunk")
							.attr("start", data[i].start)
							.attr("current-color", data[i].color)
							.attr("current-brush-size", data[i].size);
			var cursor = createElem("cursor");
			var cursorData = data[i].cursor;
			for(var j = 0; j < cursorData.length; j++) {
				var item = cursorData[j];

				switch (item.type) {
					case "cursor-movement":
						var m = createElem("m")
									.attr("x", item.x)
									.attr("y", item.y)
									.attr("p", item.pressure)
									.attr("t", item.time);

						cursor.append(m);
						break;
					case "color-change":
						var c = createElem("c");
						c.attr("value", item.color);
						cursor.append(c);
						break;
					case "brush-size-change":
						var s = createElem("s");
						s.attr("value", item.size);
						cursor.append(s);
						break;						
				}

			}
			chunk.append(cursor);

			var svg = $("<svg></svg>");
			// ...
			
			chunk.append(svg);
			dataEl.append(chunk);
		}

		return dataEl;
	}

	var createElem = function(name) {
		return $("<" + name + " />");
	}

	return {
		write: function(info, data) {
			if(info == undefined || data == undefined) {
				console.log("Nothing to save.");
				return;
			}

			var rootEl = createRootElement("dev");
			var infoEl = createInfoElement(info);
			var dataEl = createDataElement(data);

			rootEl.append(infoEl).append(dataEl);

			return rootEl;
		}
	};

})();/**
 * Khanova Škola - vektorové video
 *
 * HELPER FUNCTIONS
 * This script contains several useful functions used throughout the project.
 *
 * @author:     Šimon Rozsíval (simon@rozsival.com)
 * @project:    Vector screencast for Khan Academy (Bachelor thesis)
 * @license:    MIT
 */

/**
 * Does this object implement needed functions?
 * @param  {object}  obj The examined object;
 * @return {bool}     Returns true when the object has all the functions, otherwise returns false;
 */
var hasMethods = function(obj /*, method list as strings */){
    var i = 1, methodName;
    while((methodName = arguments[i++])){
        if(typeof obj[methodName] != 'function') {
            return false;
        }
    }
    return true;
};

/**
 * Converts an integer value of seconds to a human-readable time format - "0:00"
 * @param  {integer} s seconds
 * @return {string}    Human readable time
 */
var secondsToString = function(s) {
    var seconds = Math.floor(s % 60);
    if(seconds <= 9) {
        seconds = "0" + seconds; // seconds should have leading zero if lesser than 10
    }

    var minutes = Math.floor(s / 60);
    return minutes + ":" + seconds;
};

/**
 * Converts an integer value of milliseconds to a human-readable time format - "0:00"
 * @param  {integer} ms     milliseconds
 * @return {string}         Human readable time
 */
var millisecondsToString = function(ms) {
    return secondsToString(Math.floor(ms / 1000));
};


/**
 * Get HEX color value of an object.
 * @type {jQuery object}
 */
$.cssHooks.backgroundColor = {
    get: function(elem) {
        if (elem.currentStyle)
            var bg = elem.currentStyle["backgroundColor"];
        else if (window.getComputedStyle)
            var bg = document.defaultView.getComputedStyle(elem,
                null).getPropertyValue("background-color");
        if (bg.search("rgb") == -1)
            return bg;
        else {
            bg = bg.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            function hex(x) {
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }
            return "#" + hex(bg[1]) + hex(bg[2]) + hex(bg[3]);
        }
    }
}

/**
 * Get a parametr form the URL
 * @param  {string} name Name of the parameter.
 * @return {string}      Value of the parameter. Empty string there is none.
 */
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
/**
 * Khanova Škola - vektorové video
 *
 * SAVING HELPER
 * This static object provides simple way to save WAV and XML data.
 * 
 * @author:		Šimon Rozsíval (simon@rozsival.com)
 * @project:	Vector screencast for Khan Academy (Bachelor thesis)
 * @license:	MIT
 */

var Saver = (function() {

	var saveBlob = function(blob, name) {
		var a = $("<a>").hide();
		$("body").append(a);
		var url = URL.createObjectURL(blob);
		a.attr("href", url);
		a.attr("download", name);
		console.log(a);
		a[0].click(); // click on the link - it is more straighforward without jQuery
		URL.revokeObjectURL(url);
	};

	return {
		saveWav: function(blob) {
			saveBlob(blob, "recording.wav");
		},

		saveXml: function(text) {
			var blob = new Blob([text], { type: "text/xml" });
			saveBlob(blob, "data.xml");
		}
	};
})();

var VideoEvents = (function() {
    
    var events = {};

    return {

        trigger: function(event) {
            e = events[event] || false
            if(e !== false) {                                    
                for(var e in events[event]) {
                    events[event][e].apply(this, arguments);
                }
            }
        },

        on: function(event, callback) {
            if(!events.hasOwnProperty(event)) {
                events[event] = [];
            }

            events[event].push(callback);
        }
    };

})();
var VideoTimer = (function() {

	var startTime;

	function VideoTimer() {
	    this.resetTimer();
	}

	VideoTimer.prototype.resetTimer = function() {
	    startTime = 0;
	    startTime = this.currentTime();
	};

	VideoTimer.prototype.setTime = function(ms) {
		this.resetTimer();
		startTime += ms;
	};

	VideoTimer.prototype.currentTime = function() {
	    return (new Date()).getTime() - startTime;
	};

	return VideoTimer;

})();/**
* Khanova Škola - vektorové video
*
* THE VIDEO PLAYER OBJECT
* This is the base stylesheet that contains the basic layout and appearance of the board.
*
* @author:		Šimon Rozsíval (simon@rozsival.com)
* @project:	Vector screencast for Khan Academy (Bachelor thesis)
* @license:	MIT
*/

var Player = (function(){

	var settings = {
		container: {
			selector: "#player",
		},
		cursor: {
			size: 20,
			color: "#fff"
		},
		audio: []
	};

	function Player(options) {
		// [0] - settings
		$.extend(true, settings, options);
		var el = $(settings.container.selector);

		// [1] - init events
		//VideoEvents.init(el);

		// [2] - prepare the UI
		var ui = new PlayerUI({
			container: el
		});

		// [3] - prepare the player
		var settingsMonitor = new BasicSettings();		
		var lineDrawer = new RoundedLines(settingsMonitor);
		var dataProvider = new XmlDataProvider(options.xml.file);
		var audioPlayer = new AudioPlayer(settings.audio);

	}

	return Player;

})();/**
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
		brush: {
			size: 3,
			color: "#fff"
		},
		cursor: {}, // cursor has it's own defaults
		localization: {
			redirectPrompt: "Do you want to view your recorded video?",
			failureApology: "We are sorry, but your recording could not be uploaded to the server. Do you want to save the recorded data to your computer?"
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
		//VideoEvents.init(el);
		bindEvents.call(this);
			
		// [2] - recorder
		state.recording = false;
		var dataProvider = new UserInputDataProvider();
		var settingsProvider = new BasicSettings();
		var lineDrawer = new RoundedLines(settingsProvider);
		var audioRecorder = new AudioRecorder(settings.audio);

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

			var request = {
				type: "video",
				id: params.fileName,
				fileName: params.fileName,
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

var BasicSettings = (function() {

	var settings = {
		color: "#fbff06", // yellow
		brushSize: 25,
		correctionRatio: 1
	};

	function BasicSettings(options) {
		$.extend(true, settings, options);

		VideoEvents.on("new-board-correction-ratio", function(e, ratio) {
			var originalSize = settings.brushSize / settings.correctionRatio;
			settings.brushSize = originalSize * ratio;
		});

		VideoEvents.on("color-change", function(e, color) {
			setColor(color);
		});

		VideoEvents.on("brush-size-change", function(e, size) {
			setSize(size);
		});
	}

	var setColor = function(color) {
		settings.color = color;
	};

	var setSize = function(size) {
		settings.brushSize = size;
	};

	BasicSettings.prototype.getCurrentSettings = function() {
		return settings;
	};


	return BasicSettings;

})();
var RecordingSettings = (function() {


	// javascript inheritance from BasicSettings (./basic-settings.js)
	RecordingSettings.prototype = BasicSettings;
	RecordingSettings.prototype.constructor = RecordingSettings;

	// private variables
	var settings = {
		pallete: {
			white: "#ffffff",
			yellow: "#fbff06"
		},
		widths: {
			narrow: 5, // in pixels!!
			normal: 15,
			wide: 25
		},
		defaultColor: "yellow",
		defaultSize: "normal",
		colorsPanel: undefined,
		brushSizesPanel: undefined
	};

	var currentSettings;
	

	function RecordingSettings(options) {

		$.extend(true, settings, options);

		// set settings before creating the panels - so default settings can by highlighted
		currentSettings = {
			color: settings.pallete[settings.defaultColor],
			brushSize: settings.widths[settings.defaultSize]
		};

		// create the panels for sellecting 
		preparePanels.call(this);
	}

	RecordingSettings.prototype.getCurrentSettings = function() {
		return settings;
	};


	var preparePanels = function() {
		if(settings.colorsPanel != undefined) {
			var panel = $(settings.colorsPanel);
			for (var color in settings.pallete) {
				var btn = addColorButton(panel, color, settings.pallete[color]);
			}

			// dynamically added elements, i have to attach the event to some other element - like the body, that is always present in a HTML document
			$("body").on("click", settings.colorsPanel + " button", function(e) {
				$(this).addClass("active").siblings().removeClass("active");
				settings.color = $(this).data("color");
			});
		}		

		// @todo the same with sizes
	};

	var addColorButton = function(panel, colorName, colorValue) {
		var btn = $("<button></button>").data("color", colorValue).css("background-color", colorValue).attr("title", colorName);
		if(colorValue == settings.color) {
			btn.addClass("active");
		}
		panel.append(btn);
	};

	return RecordingSettings;

})();
/**
 * Khanova Škola - vektorové video
 *
 * CURSOR OBJECT
 * This object represents the cursor and provides functions for moving the cursor
 *
 * @author:		Šimon Rozsíval (simon@rozsival.com)
 * @project:	Vector screencast for Khan Academy (Bachelor thesis)
 * @license:	MIT
 */

var Cursor = (function(){

	var settings = {
		size: 20,
		color: "#fff"
	};

	var offset = 0;

	function Cursor(options) {
		// load the settings
		$.extend(true, settings, options);

		// position the cursor
		this.element = UIFactory.createCursorCanvas.call(this, settings.size, settings.color);
		offset = settings.size / 2;

		// move the cursor whenever a new state is available
		var _this = this;
		VideoEvents.on("new-state", function(e, state) {
			if(state != undefined) {
				moveTo.call(_this, state.x, state.y);
			}
		});
	}

	var moveTo = function (x, y) {
		this.element.style.left = (x - offset) + "px";
		this.element.style.top = (y - offset) + "px";
	};

	return Cursor;

})();

var PlayerUI = (function() {
	
	// video properties
	var state = {
		playing: false,
		reachedEnd: false,
		progress: 0,
		preloaded: 0
	};
	var videoLength = 0; // in milliseconds

	// UI elements
	var btn, icon;
	var bar, preloaded;
	var currentProgress, bufferedUntil;
	var progressTimeContainer;
	var board, canvas;

	// video screen properties
	var boardInfo = {
		width: 0,
		height: 0
	}

	var settings = {

		// UI can be simply translated to any language
		localization: {
			noJS: "Your browser does not support JavaScript or it is turned off. Video can't be played without enabled JavaScript in your browser.",
			play: "Play video",
			pause: "Pause video",
			replay: "Replay video",
			skip: "Skip to this point"
		},

		// cursor settings - it has it's own defaults.. ;)
		cursor: { },

		container: undefined,
		containerSelector: "#player"

	};

	function PlayerUI(options) {

		// load settings
		$.extend(true, settings, options);
		var container = settings.container || $(settings.containerSelector);

		// wait until data is loaded and parsed
		var _this = this;
		VideoEvents.on("data-ready", function(e, info) {
			console.log(this);
			videoLength = info.length; // video lenght in milliseconds

			// prepare the board - create the elements and set the right size (that is why I have to wait until data is loaded)
			var ratio = info.board.height / info.board.width;
			createBoard.call(this, container, ratio);
			_this.board = board; // make board public

			// now I can create the controls too
			createControls.call(this, container);
			_this.canvas = canvas;

			// create a cursor and place it inside the board
			var cursor = new Cursor(settings.cursor);
			board.append(cursor.element);

			console.log("UI for the player is ready");
			VideoEvents.trigger("ui-ready");
		});
	}

	var createBoard = function(container, aspectRatio) {
		// prepare the board element - and make it as wide as possible
		board = $("<div></div>").attr("id", "board").css("width", "100%");
		container.append(board); // add it to the DOM
		
		// calculate the correct dimensions of the board - width is fixed, use given aspect ratio
		var width = parseInt(board.width());
		var height = aspectRatio * width;
		board.height(height);

		// I have to know final board dimensions by now
		var canvas = $("<canvas></canvas>").attr("width", width).attr("height", height);
		board.append(canvas)
					.append("<noscript><p>"+  +"</p></noscript>");		

		// announce the dimensions of the canvas and make it public - anyone can draw on it
		VideoEvents.trigger("board-dimensions", {
			width: width,
			height: height
		});
		VideoEvents.trigger("canvas-ready", canvas);
	};

	var createControls = function(container) {
		// button
		var buttonContainer = $("<div></div>").attr("id", "button-container");
		preparePlayPauseButton.call(this, buttonContainer);
		
		// progress bar
		var progressBarContainer = $("<div></div>").attr("id", "progress-bar").addClass("progress");
		var progressContainer = $("<div></div>").attr("id", "video-progress")
									.append(progressBarContainer);
		prepareProgressBar.call(this, progressBarContainer);

		// timer
		progressTimeContainer = $("<div></div>").attr("id", "video-time");
		prepareProgressText.call(this, progressTimeContainer);

		// row
		var controls = $("<div></div>").attr("id", "controls")
							.append(buttonContainer)
							.append(progressContainer)
							.append(progressTimeContainer);

		// controls container
		container.append(controls);
	};

	var preparePlayPauseButton = function(container) {

		// create the button
		btn = UIFactory.button("success").attr("title", settings.localization.play);
		icon = UIFactory.glyphicon("play");
		btn.append(icon);
		container.append(btn);	

		// events:
		 
		var playPause = function() {
			// change the icon
			if(state.playing == true) {
				VideoEvents.trigger("pause");
				UIFactory.changeIcon.call(icon, "play");
				btn.attr("title", settings.localization.play);
			} else {
				if(state.reachedEnd == true) {
					// rewind first
					state.reachedEnd = false;
					VideoEvents.trigger("rewind");
				}

				VideoEvents.trigger("start");
				UIFactory.changeIcon.call(icon, "pause");
				btn.attr("title", settings.localization.pause);
			}

			state.playing = !state.playing;
		};
		

		// The play/pause button can be triggerd by mouse clicking or the spacebar hitting:
		btn.on("click", playPause);
		var spacebar = 32; // keyboard key constant is 32
		$("body").on("keyup", function(e) {
			if (e.keyCode == spacebar) {
				playPause();
			}
		});

		// change the icon when the video reaches end
		VideoEvents.on("reached-end", function() {
			state.playing = false;
			state.reachedEnd = true;
			UIFactory.changeIcon.call(icon, "repeat");
			btn.attr("title", settings.localization.replay);
		});

	};

	var prepareProgressBar = function(container) {
		bar = UIFactory.progressbar("success", 0);
		bar.attr("title", settings.localization.skip);
		preloaded = UIFactory.progressbar("info", 0);

		container.append(preloaded).append(bar); // order is important! - overlaping
		currentProgress = 0;

		// skip after clicking on the progress bar
		var skip = function(progress) {			
			UIFactory.changeProgress(bar, progress * 100);
			if (state.reachedEnd && progress < 1) {
				UIFactory.changeIcon.call(icon, "play");
				state.reachedEnd = false;
			}
		};

		container.on("click", function(event) {
			state.progress = (event.pageX - container.offset().left) / container.width();

			if(state.playing == true) VideoEvents.trigger("pause"); // avoid rendering errors			
			VideoEvents.trigger("skip-to", state.progress);
			if(state.playing == true) VideoEvents.trigger("start"); // resume playback

			skip(state.progress);
		});

		VideoEvents.on("rewind", function() {
			last = 0;
			status.reachedEnd = false;
			UIFactory.changeProgress(bar, 0);
		});

		VideoEvents.on("skip-to", function(e, progress) {
			status.reachedEnd = false;
			skip(progress);
		});

		var last = 0;
		VideoEvents.on("next-state-peek", function(e, next) {
			var step = next.time - last;
			last = next.time;
			currentProgress = next.time / videoLength * 100;
			UIFactory.changeProgress(bar, currentProgress, step);
		});

		VideoEvents.on("buffered-until", function(e, time) {
			time *= 1000; // seconds to milliseconds
			buffered = Math.ceil(time / videoLength * 100);
			UIFactory.changeProgress(preloaded, buffered);
		});
	};

	var prepareProgressText = function(container) {
		// [3] displayed time
		var text = $("<strong></strong>").addClass("time").attr("id", "current-time").text(secondsToString(0));
		totalTime = $("<span></span>").addClass("time").attr("id", "total-time").text(millisecondsToString(videoLength));

		container.append(text).append("<span>&nbsp;/&nbsp;</span>").append(totalTime);

		VideoEvents.on("current-time", function(e, time) {
			text.text(secondsToString(time));
		});
	};

	return PlayerUI;

})();/**
* Khanova Škola - vektorové video
*
* RECORDER UI
* This object creates the whole UI of recorder and takes care of user interaction.
*
* @author:		Šimon Rozsíval (simon@rozsival.com)
* @project:		Vector screencast for Khan Academy (Bachelor thesis)
* @license:		MIT
*/

var RecorderUI = (function() {

	// private variables
	var settings = {
		
		// color pallete
		// the pair is "name: (css color constant or hex color value)"
		pallete: {
			white: "#ffffff",
			yellow: "#fbff06",
			red: "#fa5959",
			green: "#8cfa59",
			blue: "#59a0fa"
		},
		
		// brush sizes
		// the pair is "name: size in pixels"
		widths: {
			narrow: 5, // in pixels!!
			normal: 10,
			wide: 15
		},
		
		default: {
			color: "blue",
			size: "narrow"
		},

		cursor: {
			size: 20,
			color: "#fff"
		},

		localization: {
			noJS: "Your browser does not support JavaScript or it is turned off. Video can't be recorded without enabled JavaScript in your browser.",
			record: "Record video",
			pause: "Pause recording",
			upload: "Upload",
			changeColor: "Change brush color",
			changeSize: "Change brush size",
			waitingText: "Please be patient. Converting and uploading video usualy takes some times - up to a few minutes if your video is over ten minutes long. Do not close this tab or browser window."
		},

		container: undefined,
		containerSelector: "#recorder"

	};

	// current ui state
	var state = {
		recording: false
	};

	// ui elements
	var btn, uploadBtn, modal, board, progress;

	function RecorderUI(options) {
		$.extend(true, settings, options);

		var container = settings.container || $(settings.containerSelector);

		// create the board and canvas
		var board = createBoard.call(this, container);

		// create controls
		var controls = createControls.call(this, container);

		// maximize height of the elements
		container.append(controls);
		var availableHeight = container.parent().height() - controls.outerHeight(); // how much can I stretch the board?
		this.board.height(availableHeight);


		// attach board to the container - but make it over the controls
		container.prepend(board);

		createCanvas.call(this, this.board);
		VideoEvents.trigger("canvas-ready", this.canvas);

		// create the cursor cross and place it inside the board
		var cursor = new Cursor(settings.cursor)
		this.board.append(cursor.element);

		// create the modal that will show before uploading recorded data
		prepareUploadModal.call(this);

		// try to load the Wacom plugin
		var plugin = $("<object></object>").attr("id", "wtPlugin").attr("type", "application/x-wacomtabletplugin");
		$("body").append(plugin);
		VideoEvents.trigger("wacom-plugin-ready", plugin);
	}

	var createBoard = function() {
		this.board = $("<div></div>").attr("id", "board")
						.append("<noscript><p>" + settings.localization.noJS + "</p></noscript>");

		return this.board; // add it to the DOM
	};

	var createCanvas = function(board) {
		// the canvas - user will paint here
		this.canvas = $("<canvas></canvas>").attr("width", board.width()).attr("height", board.height());
		this.board.append(this.canvas);
	};

	var createControls = function() {
		// button
		var buttonContainer = $("<div></div>").attr("id", "rec-button-container");
		prepareButtons.call(this, buttonContainer);

		// progress bar
		colorsPanel = $("<div></div>").attr("id", "colors-panel");
		prepareColorsPanel(colorsPanel);
		
		// timer
		sizesPanel = $("<div></div>").attr("id", "brushes-panel");
		prepareSizesPanel(sizesPanel);

		// row
		var controls = $("<div></div>").attr("id", "controls")
							.append(buttonContainer)
							.append(colorsPanel)
							.append(sizesPanel);

		return controls;
	};

	var prepareButtons = function(container) {

		// rec button
		btn = UIFactory.button("success").attr("title", settings.localization.record);
		progressSpan = $("<span></span>").text("REC");
		var glyphicon = UIFactory.glyphicon("record");
		btn.append(glyphicon).append(progressSpan);
		container.append(btn);

		// uplaod button
		uploadBtn = UIFactory.button("default").attr("disabled", "disabled").attr("title", settings.localization.upload);
		var uploadIcon = UIFactory.glyphicon("upload");
		uploadBtn.append(uploadIcon).append("<span>" + settings.localization.upload.toUpperCase() + "</span>");
		container.append(uploadBtn);

		state.recording = false;
		var _this = this;
		btn.on("click", function() {
			if(state.recording == false) {
				start.call(_this);
				btn.attr("title", settings.localization.pause);
			} else {
				stop.call(_this);
				btn.attr("title", settings.localization.record);
			}

			state.recording = !state.recording;
		});

		uploadBtn.on("click", function() {
			modal.modal();
		});
	};

	var tick;

	var start = function() {
		UIFactory.changeButton(btn, "danger"); // danger = red -> recording is ON
		VideoEvents.trigger("start");
		uploadBtn.attr("disabled", "disabled");
		this.board.addClass("no-pointer");

		var time = 0;
		tick = setInterval(function() {
			time += 1;
			progressSpan.text(secondsToString(time));
		}, 1000);

	};

	var stop = function() {
		UIFactory.changeButton(btn, "success"); // success = green -> recording is OFF, can start again
		progressSpan.text("REC");
		this.board.removeClass("no-pointer");
		uploadBtn.removeAttr("disabled");
		VideoEvents.trigger("pause");

		clearInterval(tick);
	};

	var prepareUploadModal = function() {

		// input objects
		var titleInput = $("<input>").attr("type", "text").attr("name", "title").attr("placeholder", "video's title").addClass("form-control");
		var authorInput = $("<input>").attr("type", "text").attr("name", "author").attr("placeholder", "your name").addClass("form-control");
		var descriptionTextarea = $("<textarea />").attr("name", "description").attr("placeholder", "video description").addClass("form-control");

		// button
		var save = $("<button>").attr("type", "button").addClass("btn btn-primary").text("Save video");
        var uploadInfo = $("<div />")
        					.css("display", "none")
        					.append("<p />").addClass("alert alert-info").text(settings.localization.waitingText);

        // uploqe progress
        var uploadBar = UIFactory.progressbar("info", 0).text("0% uploaded").addClass("active progress-striped");
        var uploadProgress = $("<div />").addClass("progress").append(uploadBar).css("display", "none");

        VideoEvents.on("upload-progress", function(e, percent) {
        	console.log(percent);
        	UIFactory.changeProgress(uploadBar, percent);
        	uploadBar.text(Math.floor(percent) + "% uploaded");
        });

        //
        // This is a Twitter Bootstrap 3 modal window
        // see www.bootstrapdocs.com/v3.2.0/docs/
        //
		modal = $("<div />").addClass("modal fade").append(
						$("<div />").addClass("modal-dialog").append(
							$("<div />").addClass("modal-content")
								.append(
									// MODAL HEADER
									$("<div />").addClass("modal-header")
										.append(
											$("<button>").attr("type", "button").addClass("close").attr("data-dismiss", "modal")
												.append($("<span>").attr("aria-hidden", "true").html("&times;"))
												.append($("<span>").addClass("sr-only").text("Close"))
										).append(
											$("<h4>Save captured video</h4>").addClass("modal-title")
										)
								).append(
									// MODAL BODY
									$("<div />").addClass("modal-body")
										.append(
											// name input
											$("<p />").addClass("form-group")
												.append(titleInput)
										).append(
											$("<p />").addClass("form-group")
												.append(authorInput)
										).append(
											$("<p />").addClass("form-group")
												.append(descriptionTextarea)
										).append(uploadInfo).append(uploadProgress)

								).append(
									// MODAL FOOTER
									$("<div />").addClass("modal-footer")
										.append($("<button>").attr("type", "button").addClass("btn btn-default").attr("data-dismiss", "modal").text("Close"))
										.append(save)

								)
						)
					);

		$("body").append(modal);

		save.on("click", function() {

			// inform the user..
			$(this).attr("disabled", "disabled");
			$(this).text("Started uploading...");
			uploadInfo.slideToggle();
			uploadProgress.slideToggle();

			VideoEvents.trigger("upload-recorded-data", {
				fileName: new Date().getTime(),
				info: { // this will be merged with the <info> structure
					about: {
						title: titleInput.val(),
						description: descriptionTextarea.val(),
						author: authorInput.val()
					}
				}
			});
		});

		VideoEvents.on("recording-finished", function() {
			save.text("Video was successfully uploaded.");
		});
	};

	var prepareColorsPanel = function(panel) {
		var changeColor = function(button) {
			button.addClass("active").siblings().removeClass("active");
			VideoEvents.trigger("color-change", button.data("color"));
		};

		Object.keys(settings.pallete).forEach(function(color) {
			var button = addColorButton(panel, color, settings.pallete[color]);
			button.on("click", function() {
				var btn = $(this);
				changeColor(btn);
			});
		});
	};

	var prepareSizesPanel = function(panel) {
		var changeSize = function(button) {
			button.addClass("active").siblings().removeClass("active");
			var size = button.children(".dot").data("size");
			VideoEvents.trigger("brush-size-change", settings.widths[size]);
		};

		Object.keys(settings.widths).forEach(function(size) {
			var button = addSizeButton(panel, size, settings.widths[size]).attr("title", settings.localization.changeSize);
			button.on("click", function() {
				changeSize($(this));
			});
		});
	};

	var addColorButton = function(panel, colorName, colorValue) {
		var button = $("<button></button>").addClass("option").data("color", colorValue).css("background-color", colorValue).attr("title", colorName);
		if(colorName == settings.default.color) {
			VideoEvents.trigger("color-change", colorValue);
			button.addClass("active");
		}
		panel.append(button);
		return button;
	};

	var addSizeButton = function(panel, sizeName, size) {
		var dot = $("<span></span>").addClass("dot").data("size", sizeName).width(size).height(size).css("border-radius", size/2 + "px");
		var button = $("<button></button>").addClass("option").attr("title", size).append(dot);
		if(sizeName == settings.default.size) {
			console.log("size: ", size);
			VideoEvents.trigger("brush-size-change", size);
			button.addClass("active");
		}
		panel.append(button);
		return button;
	};

	return RecorderUI;

})();/**
 * Khanova Škola - vektorové video
 *
 * UI FACTORY OBJECT
 * This is a static object that helps creating common UI elements, as icons, buttons or progress bars.
 *
 * @author:		Šimon Rozsíval (simon@rozsival.com)
 * @project:	Vector screencast for Khan Academy (Bachelor thesis)
 * @license:	MIT
 */


var UIFactory = {
	
	glyphicon: function(type) {
		return $("<span></span>").addClass("glyphicon glyphicon-" + type).attr("data-icon-type", type);
	},

	changeIcon: function(type) {
		var icon = this;
		var old = icon.data("icon-type");
		icon.removeClass("glyphicon-" + old).addClass("glyphicon-" + type).data("icon-type", type);
	},

	button: function(type) {
		return $("<button></button>").addClass("btn btn-" + type).data("type", type);	
	},

	changeButton: function(button, type) {
		return button.removeClass("btn-" + button.data("type")).addClass("btn-" + type).data("type", type);
	},

	//
	// Progress bars
	//

	progressbar: function(type, initialProgress) {
		return $("<div></div>")
					.addClass("progress-bar progress-bar-" + type)
					.attr("role", "progress-bar")
					.data("progress", initialProgress)
					.css("width", initialProgress + "%");
	},

	changeProgress: function(bar, progress, time) {

		// the progress might be
		var first = progress.toString()[0];
		if(first == "+" || first == "-") {			
			var sign = first == "+" ? 1 : -1;
			progress = Number(bar.data("progress")) + sign * number(progress.substr(1));
		};

		bar.stop(); // stop any animation that is in progress
		if (time == undefined) {
			bar.css("width", progress + "%");
		} else {
			// time is defined - animate the progress
			bar.animate({
				width: progress + "%",
			}, time, "linear");
		}

		bar.data("progress", progress);
	},

	//
	// Cursor cross ... -|-
	//

	createCursorCanvas:  function(size, color) {
		var canvas = document.createElement("canvas");
		canvas.width = size;
		canvas.height = size;
		var context = canvas.getContext("2d");
		var offset = size / 2;

		// draw the "+"
		context.lineWidth = size * 0.1; // 10% of the size
		context.strokeStyle = color;
		context.beginPath();

		// vertical line
		context.moveTo(offset, 0);
		context.lineTo(offset, size);

		// horizontal line
		context.moveTo(0, offset);
		context.lineTo(size, offset);

		context.stroke();
		context.closePath();

		// I want to move the cursor to any point and the stuff behind the cursor must be visible
		canvas.style.position = "absolute";
		canvas.style.background = "transparent";

		return canvas;
	}

};