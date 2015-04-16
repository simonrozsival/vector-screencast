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
var AudioPlayer = (function() {

	var playing, reachedEnd;
	var audio;
	var initSuccessful;

	function AudioPlayer(sources, events) {

		// create audio element
		audio = HTML.createElement("audio", {
			preload: "auto"
		});

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
				var source = HTML.createElement("source", {
					type: contentType,
					src: sources[source].file
				});
				audio.appendChild($source);
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
		audio.onended = function() {
			playing = false;
			reachedEnd = true;
			console.log("(audio reached end)");
		};

		audio.onpause = function() {
			if(playing) {
				VideoEvents.trigger("pause");
			}
		};

		audio.ontimeupdate = function(e) {
			reportCurrentTime();			
		};
		
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
		events = events || [];
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

	/**
	 * Return current cursor state in time.
 	 * @returns {State}
	 */
	var getCurrentCursorState = function() {
		return new State({
			x: cursor.x,
			y: cursor.y,
			pressure: getPressure(),
			time: timer.currentTime()
		});
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

		VideoEvents.on("canvas-container-ready", function(e, canvasContainer) {
			offset = canvasContainer.offset();
		});

		VideoEvents.on("start", start);
		VideoEvents.on("continue", start);
		VideoEvents.on("pause", pause);
		VideoEvents.on("stop", pause);

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
		if(action != undefined) {
			VideoEvents.trigger("new-state", action);
		}
	};

	//
	// User input
	//  

	var onMouseMove = function(e) {
		if(state.running) {		
			cursor = correctMouseCoords.call(this, e);
			var current = getCurrentCursorState();
			reportAction(current);
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

	/** @type {XmlReader} */
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
				videoInfo = null;
				VideoEvents.trigger("error", msg);
			}
		});
		state.running = false;
	}

	/**
	 * Title of the video.
	 * @returns {String|Boolean}
	 */
	XmlDataProvider.prototype.getTitle = function() {
		if(videoInfo) {
			return videoInfo.getInfo().about.title;
		}

		return null;
	};

	/**
	 * Author of the video.
	 * @returns {String|Boolean}
	 */
	XmlDataProvider.prototype.getAuthor = function() {
		if(videoInfo) {
			return videoInfo.getInfo().about.author;
		}

		return null;
	};

	/**
	 * Author of the video.
	 * @returns {String|Boolean}
	 */
	XmlDataProvider.prototype.getDescription = function() {
		if(videoInfo) {
			return videoInfo.getInfo().about.description;
		}

		return null;
	};

	/**
	 * Audio sources of the video.
	 * @returns {String|Boolean}
	 */
	XmlDataProvider.prototype.getAudioSources = function() {
		if(videoInfo) {
			var sources = [];
			var audio = videoInfo.getInfo().about.audio;
			for(var i in audio) {
				sources.push({
					file: audio[i],
					type: getType(audio[i])
				});
			}

			return sources;
		}

		return null;
	};

	var getType = function(fileName) {
		// ext - last 3 characters of the fileName
		return fileName.substr(fileName.length - 3);
	};

	var initEvents = function() {

		VideoEvents.on("board-dimensions", function(e, size) {			
			// compare the real dimensions to the size of board at the time of recording
			// the width of lines must be corrected with this ratio:
			correctionRatio = size.width / getInfo().board.width;
			VideoEvents.trigger("new-board-correction-ratio", correctionRatio);
		});

		VideoEvents.on("start", start);
		VideoEvents.on("continue", start);
		VideoEvents.on("pause", stop);
		VideoEvents.on("stop", stop);
		VideoEvents.on("rewind", rewind);

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

	/**
	 * Create the drawer of "rounded" lines
	 * @param {BasicSettings} settingsObject Instance of BasicSettings
	 */
	function RoundedLines(settingsObject) {

		VideoEvents.on("canvas-container-ready", function(e, canvasContainer) {
			canvas = document.createElement("canvas");
			canvasContainer.append($(canvas));

			context = canvas.getContext("2d");
			canvas.width = canvasContainer.width();
			canvas.height = canvasContainer.height();
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

		if(radius > 1) {
			drawDot(x, y, radius);			
		}
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
/**
 * Created by rozsival on 05/03/15.
 */

/**
 * Khanova Škola - vektorové video
 *
 * LINE DRAWING OBJECT
 * This is the base script containing line drawing mechanism
 *
 * @author:		Šimon Rozsíval (simon@rozsival.com)
 * @project:	Vector screencast for Khan Academy (Bachelor thesis)
 * @license:	MIT
 * @class
 */
var SVGDrawer = (function() {

    // make _this available in all functions without using the .call(this) method (it also isn't always possible)
    /** @type {SVGDrawer} */
    var _this;

    // private variables
    var paper;

    /** @type {Vector2} Start point of next segment drawing. */
    var start = null;

    /** @type {Vector2} End point of next segment drawing. */
    var end = null;

    /** @type {{pathA: Vector2, pathB: Vector2 }} Control points of the next start point. */
    var startControlPoint = null;

    /** @type {State} Last state received. */
    var lastState;

    var endDot;

    /** @type {Boolean} Was this  */
    var isOnlyClick = false;

    /** @type {Object} */
    var settings;

    /** @type {{a: String, b: String}} */
    var paths = {
        a: "",
        b: ""
    };
    var path;

    /**
     * Create the drawer of "rounded" lines
     * @param {BasicSettings} settingsObject Instance of BasicSettings
     * @constructor
     */
    function SVGDrawer(settingsObject) {
        _this = this;
        settings = settingsObject;

        // attach events
        VideoEvents.on("canvas-container-ready", setupCanvasContainer);
        VideoEvents.on("rewind", function() { });
        VideoEvents.on("new-state", processNewState);
        VideoEvents.on("skip-to", function(e, progress) { });
    }

    var setupCanvasContainer = function(e, container) {
        paper = SVG.createElement("svg", {
            width:  container.width(),
            height: container.height()
        });
        container.get(0).appendChild(paper);
    };

    /**
     * Draw lines correctly.
     * @param e
     * @param {State} state
     */
    var processNewState = function(e, state) {
        if(state.pressure > 0) {
            if(!lastState || lastState.pressure === 0) {
                startLine.call(_this, state.x, state.y, state.pressure);
            } else {
                continueLine.call(_this, state.x, state.y, state.pressure);
            }
        } else if (lastState && lastState.pressure > 0) {
            endLine.call(_this, state.x, state.y);
        }

        lastState = state;
    };

    /**
     * Start drawing a line.
     * @param {Number} x
     * @param {Number} y
     * @param {Number} pressure
     */
    var startLine = function (x, y, pressure) {
        isOnlyClick = true;

        // start every line with a dot to make the start nicely round
        var radius = calculateRadius(pressure);
        var dot = SVG.dot(x, y, radius, current().color);
        paper.appendChild(dot);

        // start a new path and prepare both top and bottom path strings
        path = SVG.createElement("path", {
            fill: current().color,
            stroke: "transparent",
            "stroke-linecap": "round",
            "stroke-linejoin": "round"
        });
        paper.appendChild(path);

        paths.a = "M " + x + "," + y + " ";
        paths.b = "L " + x + "," + y;

        // reset the data
        resetLastState(x, y);
    };

    var continueLine = function(x, y, pressure) {
        var radius = calculateRadius(pressure);
        if(isOnlyClick) {
            isOnlyClick = false;
            endDot = SVG.dot(x, y, radius, current().color);
            paper.appendChild(endDot);
        }

        drawSegment.call(this, x, y, radius);
    };

    /**
     * Convert pressure to brush radius according to current brush settings and pointing device pressure.
     * @param {number}  pressure    Pointing device pressure value in the range of [0;1]
     * @returns {number}
     */
    var calculateRadius = function(pressure) {
        return (pressure * current().brushSize) / 2;
    };

    /**
     * Current brush settings
     * @return {object} Settings.
     */
    var current = function() {
        return settings.getCurrentSettings();
    };

    /** @type {number} cardinal spline parameter */
    var a = 0.3;

    /**
     *
     * @param {number} x
     * @param {number} y
     * @param {number} radius
     */
    var drawSegment = function(x, y, radius) {
        var nextPoint = new Vector2(x, y);

        // calculate normal vector
        var direction = new Vector2(nextPoint.x - start.x, nextPoint.y - start.y);
        var normal = getScaledNormal(direction, radius); // control point "b" indicates the direction of the line in the next step
        if(normal === null) {
            return; // can't calculate normal vector => the distance between the last point and this point is zero => nothing to draw
        }

        // calculate control points for cubic bezier curve
        var controlPoints = getControlPoints(start, end, nextPoint, a, normal);
        if(controlPoints !== false) {
            paths.a += "C " + startControlPoint.pathA.x + "," + startControlPoint.pathA.y + " " +
                                controlPoints.a.pathA.x + "," + controlPoints.a.pathA.y + " " +
                                (end.x + normal.x) + "," + (end.y + normal.y) + " ";
            paths.b  = "C " + controlPoints.a.pathB.x + "," + controlPoints.a.pathB.y + " " +
                                startControlPoint.pathB.x + "," + startControlPoint.pathB.y + " " +
                                (start.x - normal.x) + "," + (start.y - normal.y) + " " + paths.b;

            // save the correct control points for the next time
            startControlPoint = controlPoints.b;
        } else {
            return; // this segment can't be drawn
        }

        // update path string
        var cap = "L " + (end.x - normal.x) + "," + (end.y - normal.y) + " ";
        SVG.setAttributes(path, {
            "d": paths.a + cap + paths.b
        });

        // draw a dot at the last point to make it round
        moveEndDot(end.x, end.y, radius)

        // do not forget to shift points
        start = end;
        end = nextPoint;
    };

    /**
     *
     * @param   {Vector2} direction    Direction vector
     * @param   {Number}  radius       Radius
     * @returns {Vector2} Scaled normal vector.
     */
    var getScaledNormal = function(direction, radius) {
        // calculate the normal vector and normalise it
        try {
            var normal = direction.getNormal()
            normal.x *= radius;
            normal.y *= radius;
            return normal;
        } catch (Exception) {
            return new Vector2(0, 0);
        }
    };

    /**
     * Return control points for point B in a cubic bezier curve going from A to C through point B.
     * @param {Vector2} a Point A
     * @param {Vector2} b Point B
     * @param {Vector2} c Point C
     * @param {Vector2} t Tension
     * @param {Vector2} n Normal vector
     * @returns {{a: {pathA: Vector2, pathB: Vector2}, b: {pathA: Vector2, pathB: Vector2}}}
     */
    var getControlPoints = function(a, b, c, t, n) {
        // calculate the distances
        var dist = {
            ab: Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2)),
            bc: Math.sqrt(Math.pow(c.x - b.x, 2) + Math.pow(c.y - b.y, 2))
        };

        // scaling factors
        var fa = t * dist.ab / (dist.ab + dist.bc);
        var fb = t * dist.bc / (dist.ab + dist.bc);

        var cp = {
            a: {
                x: b.x - fa * (c.x - a.x),
                y: b.y - fa * (c.y - a.y)
            },
            b: {
                x: b.x + fb * (c.x - a.x),
                y: b.y + fb * (c.y - a.y)
            }
        };

        return {
            a: {
                pathA: new Vector2(cp.a.x + n.x, cp.a.y + n.y),
                pathB: new Vector2(cp.a.x - n.x, cp.a.y - n.y)
            },
            b: {
                pathA: new Vector2(cp.b.x + n.x, cp.b.y + n.y),
                pathB: new Vector2(cp.b.x - n.x, cp.b.y - n.y)
            }
        };
    };


    /**
     * Ends currently drawn line.
     * @param x
     * @param y
     */
    var endLine = function(x, y) {
        if(!isOnlyClick) {
            // draw the last segment
            var lastRadius = calculateRadius(lastState.pressure);
            drawSegment(end.x, end.y, lastRadius);

            // draw a dot at the last point to make it round
            moveEndDot(end.x, end.y, lastRadius);
        }

        // reset tmp drawing points
        paths.a = null;
        paths.b = null;
        resetLastState(x, y);
    };

    /**
     * Move the dot and resize it according it to current state.
     * @param {number} x
     * @param {number} y
     * @param {number} radius
     */
    var moveEndDot = function(x, y, radius) {
        SVG.setAttributes(endDot, {
            cx: x,
            cy: y,
            radius: radius
        });
    };

    /**
     * Prepares valid data for later use of start, end and startControlPoint
     * @param  {number} x    X coordinates of pointing device
     * @param  {number} y    Y coordinates of pointing device
     */
    var resetLastState = function (x, y) {
        start = end = new Vector2(x, y);
        startControlPoint = {
            pathA: start,
            pathB: start
        };
    };

    return SVGDrawer;
})();
/**
 * Created by rozsival on 11/04/15.
 */


/**
 * SVG helper object.
 * @type {{namespace: string, dot: Function, circle: Function, line: Function, createElement: Function, setAttributes: Function}}
 */
var SVG = {

    /** @type {String} XML namespace of SVG */
    namespace: "http://www.w3.org/2000/svg",

    /**
     * Creates a filled circle on the canvas.
     * @param  {float} x      X position
     * @param  {float} y      Y position
     * @param  {float} radius Circle radius
     * @param  {string} color  CSS compatible color value
     */
    dot: function(x, y, radius, color) {
        if(radius > 0) {
            return SVG.createElement("circle", {
                cx:     x,
                cy:     y,
                r:      radius,
                fill:   color,
                stroke: "transparent"
            });
        }

        return null;
    },

    circle: function(x, y, radius, color) {
        if(radius > 0) {
            return SVG.createElement("circle", {
                cx:     x,
                cy:     y,
                r:      radius,
                stroke:   color,
                fill: "transparent",
                "stroke-width": 1
            });
        }

        return null;
    },

    line: function(start, end, width, color) {
        if(width > 0) {
            return SVG.createElement("path", {
                fill: "transparent",
                stroke: color,
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
                "stroke-width": width,
                d: "M" + start.x + " " + start.y + " L" + end.x + " " + end.y
            });
        }

        return null;
    },

    createElement: function(name, attributes) {
        var el = document.createElementNS(SVG.namespace, name);
        SVG.setAttributes(el, attributes);
        return el;
    },

    setAttributes: function(el, attributes) {
        for (var attr in attributes) {
            el.setAttributeNS(null, attr, attributes[attr]);
        }
    }


};
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
		/** @todo */
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
		var attrs = { version: version };
		for (var ns in namespaces) {
			attrs[ns] = namespaces[ns];
		}
		var animation = HTML.createElement("animation", attrs);
		return animation;
	};

	var createInfoElement = function(info, name) {
		name = name || "info";
		var root = HTML.createElement(name);
		for (var item in info) {
			if(Array.isArray(info[item])) {
				root = []; // return an array of nodes
				for(var i in info[item]) {
					root.push(createInfoElement(info[item][i], name));
				}
			} else if(typeof info[item] == "object") {
				var child = createInfoElement(info[item], item);
				if(Array.isArray(child)) {
					for(var i in child) {
						root.appendChild(child[i]);
					}
				} else {
					root.appendChild(child);
				}
			} else {
				var el = HTML.createElement(item, name);
				el.textContent = info[item];
				root.appendChild(el);
			}
		}

		return root;
	};
	var createDataElement = function(data) {
		var dataEl = HTML.createElement("data");

		for (var i = 0; i < data.length; i++) {
			var chunk = HTML.createElement("chunk", {
				start: data[i].start,
				"current-color": data[i].color,
				"current-brush-size": data[i].size
			});
			var cursor = HTML.createElement("cursor");
			var cursorData = data[i].cursor;
			for(var j = 0; j < cursorData.length; j++) {
				var item = cursorData[j];

				switch (item.type) {
					case "cursor-movement":
						var m = HTML.createElement("m", {
							x: item.x,
							y: item.y,
							p: item.pressure,
							t: item.time
						});
						cursor.appendChild(m);
						break;
					case "color-change":
						var c = HTML.createElement("c", {
							value: item.color
						});
						cursor.appendChild(c);
						break;
					case "brush-size-change":
						var s = HTML.createElement("s", {
							value: item.size
						});
						cursor.append(s);
						break;						
				}

			}
			chunk.appendChild(cursor);

			var svg = HTML.createElement("svg");
			// ...
			
			chunk.appendChild(svg);
			dataEl.appendChild(chunk);
		}

		return dataEl;
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

			rootEl.appendChild(infoEl);
			rootEl.appendChild(dataEl);

			return rootEl;
		}
	};

})();/**
 * Created by rozsival on 11/04/15.
 */

var Dimensions = (function() {

    function Dimensions(width, height) {
        if(typeof width === "object") {
            this.width = width.width;
            this.height= width.height;
        } else {
            this.width = width;
            this.height = height;
        }
    }

    return Dimensions;

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
};/**
 * Created by rozsival on 12/04/15.
 */


/**
 * HTML helper object.
 * @type {{namespace: string, dot: Function, circle: Function, line: Function, createElement: Function, setAttributes: Function}}
 */
var HTML = {

    createElement: function(name, attributes) {
        var el = document.createElement(name);
        HTML.setAttributes(el, attributes);
        return el;
    },

    setAttributes: function(el, attributes) {
        for (var attr in attributes) {
            el.setAttribute(attr, attributes[attr]);
        }
    }


};/**
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
	
})();/**
 * Created by rozsival on 11/04/15.
 */

/**
 * @property    {number}    x
 * @property    {number}    y
 * @property    {number}    pressure
 * @property    {number}    time
 * @property    {String}    type
 * @class
 */
var State = (function() {

    /**
     *
     * @param {Object|number} x
     * @param {number} y
     * @param {number} pressure
     * @param {number} time
     * @param {String} type
     * @constructor
     */
    function State(x, y, pressure, time, type) {
        if(typeof x === "object") {
            this.x = x.x;
            this.y = x.y;
            this.pressure = x.pressure;
            this.time = x.time;
            this.type = x.type;
        } else {
            this.x = x;
            this.y = y;
            this.pressure = pressure;
            this.time = time;
            this.type = type;
        }
    }

    return State;
})();/**
 * Created by rozsival on 11/04/15.
 */

/**
 * @class
 * @property    {number} x
 * @property    {number} y
 */
var Vector2 = (function() {

    /**
     * Math vector
     * @param {number} x
     * @param {number} y
     * @constructor
     */
    function Vector2(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Calculates size of the vector.
     * @returns {number}
     */
    Vector2.prototype.getSize = function() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    };

    /**
     * Normalizes the vector.
     * @throws Exception
     */
    Vector2.prototype.normalize = function() {
        var size = this.getSize();
        if(size === 0) {
            throw new Exception("Can't normalize zero vector.");
        }

        this.x /= size;
        this.y /= size;
    };

    /**
     * Creates a normal vector to this vector.
     * @returns {Vector2}
     */
    Vector2.prototype.getNormal = function() {
        var n = new Vector2(-this.y, this.x);
        n.normalize();
        return n;
    };

    return Vector2;

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
		xml: {
			file: ""
		},
		container: {
			selector: "#player",
		},
		cursor: {
			size: 20,
			color: "#fff"
		},
		audio: [],
		localization: {
			ui: {}
		}
	};

	function Player(options) {
		// [0] - settings
		$.extend(true, settings, options);
		var el = $(settings.container.selector);

		// [1] - prepare the UI
		var ui = new PlayerUI({
			container: el,
			localization: settings.localization.ui
		});

		// [2] - prepare the player
		var settingsMonitor = new BasicSettings();		
		//var lineDrawer = new RoundedLines(settingsMonitor);
		var lineDrawer = new SVGDrawer(settingsMonitor);
		var dataProvider = new XmlDataProvider(options.xml.file);
		var audioPlayer = new AudioPlayer(dataProvider.getAudioSources());
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
			selector: "#recorder"
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
		var el = $(settings.container.selector);

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

var BasicSettings = (function() {

	var settings = {
		color: "",
		brushSize: 0,
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

})();/**
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
		var canvasContainer = $("<div>");
		canvasContainer.attr("id", "canvas-container");
		canvasContainer.attr("width", width).attr("height", height);
		board.append(canvasContainer)
					.append("<noscript><p>"+  +"</p></noscript>");		

		// announce the dimensions of the canvas and make it public - anyone can draw on it
		VideoEvents.trigger("board-dimensions", {
			width: width,
			height: height
		});
		VideoEvents.trigger("canvas-container-ready", canvasContainer);
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
				UIFactory.changeIcon(icon, "play");
				btn.attr("title", settings.localization.play);
			} else {
				if(state.reachedEnd == true) {
					// rewind first
					state.reachedEnd = false;
					VideoEvents.trigger("rewind");
				}

				VideoEvents.trigger("start");
				UIFactory.changeIcon(icon, "pause");
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
			UIFactory.changeIcon(icon, "repeat");
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
				UIFactory.changeIcon(icon, "play");
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
		recording: false,
		paused: false
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
		this.board.css("height", "100%");
		//this.board.css("height", this.board.height());


		// attach board to the container - but make it over the controls
		container.prepend(board);

		createCanvasContainer.call(this, this.board);
		VideoEvents.trigger("canvas-container-ready", this.canvas);

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

	var createCanvasContainer = function(board) {
		// the canvas - user will paint here
		this.canvas = $("<div>").attr("id", "canvas-container").attr("width", board.width()).attr("height", board.height());
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
		btn.on("click", function(e) {
			e.preventDefault();
			if(state.recording === false) {
				if(state.paused) {
					continueRecording.call(_this);
				} else {
					start.call(_this);
				}
				state.paused = false;
				btn.attr("title", settings.localization.pause);
			} else {
				state.paused = true;
				pause.call(_this);
				btn.attr("title", settings.localization.record);
			}

			state.recording = !state.recording;
		});

		uploadBtn.on("click", function(e) {
			e.preventDefault();
			modal.modal();
		});
	};

	var tick;

	var start = function() {
		VideoEvents.trigger("start");
		recording.call(this);
	};

	var continueRecording = function() {
		VideoEvents.trigger("continue");
		recording.call(this);
	};

	var recording = function() {
		UIFactory.changeButton(btn, "danger"); // danger = red -> recording is ON
		uploadBtn.attr("disabled", "disabled");
		this.board.addClass("no-pointer");

		var time = 0;
		tick = setInterval(function() {
			time += 1;
			progressSpan.text(secondsToString(time));
		}, 1000);
	};

	var pause = function() {
		UIFactory.changeButton(btn, "success"); // success = green -> recording is OFF, can start again
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

		save.on("click", function(e) {
			e.preventDefault();

			// inform the user..
			$(this).attr("disabled", "disabled");
			$(this).text("Started uploading...");
			uploadInfo.slideToggle();
			uploadProgress.slideToggle();

			VideoEvents.trigger("stop", {
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

	/**
	 * Creates buttons for changing colors during recording.
	 * @param  {object} panel Parent element of the buttons.	 
	 */
	var prepareColorsPanel = function(panel) {
		var changeColor = function(button) {
			button.addClass("active").siblings().removeClass("active");
			VideoEvents.trigger("color-change", button.data("color"));
		};

		Object.keys(settings.pallete).forEach(function(color) {
			var button = addColorButton(panel, color, settings.pallete[color]);
			button.on("click", function(e) {
				// prevent default - 
				e.preventDefault();
				var btn = $(this);
				changeColor(btn);
			});
		});
	};

	/**
	 * Creates buttons for changing brush size during recording.
	 * @param  {object} panel Parent element of the buttons.
	 */
	var prepareSizesPanel = function(panel) {
		var changeSize = function(button) {
			button.addClass("active").siblings().removeClass("active");
			var size = button.children(".dot").data("size");
			VideoEvents.trigger("brush-size-change", settings.widths[size]);
		};

		Object.keys(settings.widths).forEach(function(size) {
			var button = addSizeButton(panel, size, settings.widths[size]).attr("title", settings.localization.changeSize);
			button.on("click", function(e) {
				e.preventDefault();
				changeSize($(this));
			});
		});
	};

	/**
	 * Creates a button for changing color.
	 * @param {object} 	panel      	Parent element.
	 * @param {string} 	colorName  	Displayed color name.
	 * @param {string} 	colorValue 	CSS compatible value of color.
	 * @return {object}				The button
	 */
	var addColorButton = function(panel, colorName, colorValue) {
		var button = $("<button></button>").addClass("option").data("color", colorValue).css("background-color", colorValue).attr("title", colorName);
		if(colorName == settings.default.color) {
			VideoEvents.trigger("color-change", colorValue);
			button.addClass("active");
		}
		panel.append(button);
		return button;
	};

	/**
	 * Creates a button for changing size.
	 * @param {object} 	panel      	Parent element.
	 * @param {string} 	sizeName  	Displayed size name.
	 * @param {string} 	sizeValue 	Brush diameter in pixels. // @todo chnage to percent or sth.
	 * @return {object}				The button
	 */
	var addSizeButton = function(panel, sizeName, size) {
		var dot = $("<span></span>").addClass("dot").data("size", sizeName).width(size).height(size).css("border-radius", size/2 + "px");
		var button = $("<button></button>").addClass("option").attr("title", size).append(dot);
		if(sizeName == settings.default.size) {
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
	
	/**
	 * Creates a jQuery object representing a span element with classes specific for Twitter Bootstrap 3 icon.
	 * @param  {string} type Icon type - sufix of class name - "glyphicon-<type>". See http://bootstrapdocs.com/v3.2.0/docs/components#glyphicons for the list of icons.
	 * @return {object}      jQuery object, needs to be pushed into the DOM
	 */
	glyphicon: function(type) {
		return $("<span></span>").addClass("glyphicon glyphicon-" + type).attr("data-icon-type", type);
	},

	/**
	 * Changes icon type.
	 * @param  {object} jQuery icon object.
	 * @param  {[type]} type New icon type - glyphicon class sufix.
	 * @return {void}
	 */
	changeIcon: function(icon, type) {
		var old = icon.data("icon-type");
		icon.removeClass("glyphicon-" + old).addClass("glyphicon-" + type).data("icon-type", type);
	},

	/**
	 * Creates a jQuery object representing a button element with classes specific for Twitter Bootstrap 3 button.
	 * @param  {string} type Button type - suffix of class name - "btn-<type>". See http://bootstrapdocs.com/v3.2.0/docs/css/#buttons for list of button types.
	 * @return {[type]}      [description]
	 */
	button: function(type) {
		return $("<button></button>").addClass("btn btn-" + type).data("type", type);	
	},

	/**
	 * Changes icon type. *this* should be the jQuery object of the icon. Function useage: *UIFactory. changeIcon(icon, "new-type")*
	 * @param  {string} type New icon type - glyphicon class sufix.
	 * @return {void}
	 */
	changeButton: function(button, type) {
		return button.removeClass("btn-" + button.data("type")).addClass("btn-" + type).data("type", type);
	},

	//
	// Progress bars
	//

	/**
	 * Creates a jQuery object representing a div element with classes specific for Twitter Bootstrap 3 progress bar.
	 * @param  {string} type Progressbar type - suffix of class name - "progress-bar-<type>". See http://bootstrapdocs.com/v3.2.0/docs/css/#progressbars for list of button types.
	 * @return {[type]}      [description]
	 */
	progressbar: function(type, initialProgress) {
		return $("<div></div>")
					.addClass("progress-bar progress-bar-" + type)
					.attr("role", "progress-bar")
					.data("progress", initialProgress)
					.css("width", initialProgress + "%");
	},

	/**
	 * Changes progressbar type and progress.
	 * @param  {object} bar      Progress bar object.
	 * @param  {int} 	progress Progress in percents.
	 * @param  {int}	time     Time in milliseconds - how long will it take to animate the progress change.
	 * @return {void}
	 */
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

	/**
	 * Create canvas element with a cross on transparent background.
	 * @param  {int}	size  Width and height of the cross in pixels.
	 * @param  {string} color Css color atribute. Specifies the color of the cross.
	 * @return {DOMObject}    The cavnas element.
	 */
	createCursorCanvas:  function(size, color) {
		var canvas = document.createElement("canvas");
		canvas.width = size;
		canvas.height = size;
		var context = canvas.getContext("2d");
		var offset = size / 2;

		// draw the "+"
		context.lineWidth = size * 0.1; // 10% of the size is the line
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