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
	var lastState;


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
	};

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
			var rect = canvasContainer.getBoundingClientRect();
			offset = {
				top: rect.top,
				left: rect.left
			};
		});

		VideoEvents.on("start", start);
		VideoEvents.on("continue", start);
		VideoEvents.on("pause", pause);
		VideoEvents.on("stop", pause);

		// is Wacom tablet ready?
		VideoEvents.on("wacom-plugin-ready", function(e, plugin) {
			console.log("Wacom plugin: ", plugin.version);
			if(!!plugin === true // plugin is 'undefined' if the tablet isn't installed or plugged in
				&& !!plugin.version === true) {
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
			lastState = current;
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
		while(state.running) {
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

    /** @type {HTMLElement} */
    var paper;

    /** @type {Vector2} Start point of next segment drawing. */
    var start = null;

    /** @type {Vector2} End point of next segment drawing. */
    var end = null;

    /** @type {State} Last state received. */
    var lastState;

    /** @type {number} Next point's radius */
    var nextRadius;

    /** @type {Vector2} */
    var prevPoint;

    /** @type {Vector2} */
    var lastDrawnPosition;

    /** @type {number} */
    var lastDrawnRadius;

    /** @type {Element} */
    var endDot;

    /** @type {Boolean} Was this  */
    var isOnlyClick = false;

    /** @type {Object} */
    var settings;

    /** @type {{a: String, b: String}} */
    var paths = {
        top: "",
        bottom: ""
    };
    var path;

    /**
     * Create the drawer of "rounded" lines
     * @param {BasicSettings} settingsObject Instance of BasicSettings
     * @constructor
     */
    function SVGDrawer(settingsObject) {
        settings = settingsObject;

        // attach events handlers
        VideoEvents.on("canvas-container-ready", prepareCanvas );
        //VideoEvents.on("rewind", function() { });
        VideoEvents.on("new-state", processNewState);
        //VideoEvents.on("skip-to", function(e, progress) { });
    }

    /**
     * Prepare canvas
     * @param {object}      e           Event object
     * @param {HTMLElement} container   Canvas container
     */
    var prepareCanvas = function(e, container) {
        paper = SVG.createElement("svg", {
            width:  container.offsetWidth,
            height: container.offsetHeight
        });
        container.appendChild(paper);
    };

    /**
     * Draw lines correctly.
     * @param e
     * @param {State} state
     */
    var processNewState = function(e, state) {
        var nextPoint = new Vector2(state.x, state.y);
        if(state.pressure > 0) {
            if(!lastState || lastState.pressure === 0) {
                startLine(nextPoint, state.pressure);
            } else {
                continueLine(nextPoint, state.pressure);
            }
        } else if (lastState && lastState.pressure > 0) {
            endLine(nextPoint);
        }

        lastState = state;
    };

    /**
     * Start drawing a line.
     * @param {Vector2} point       Starting point of the line
     * @param {number}  pressure    Brush pressure
     */
    var startLine = function (point, pressure) {
        isOnlyClick = true;

        // start every line with a dot to make it nicely round
        var radius = calculateRadius(pressure);
        var dot = SVG.dot(point, radius, current().color);
        paper.appendChild(dot);

        // prepare values for following line segments
        prevPoint = point.clone();
        start = point.clone();
        nextRadius = radius;
        lastDrawnPosition = point.clone();
        lastDrawnRadius = radius;
    };

    /**
     *
     * @param {Vector2} nextPoint   Next point of the line
     * @param {number}  pressure    Brush pressure
     */
    var continueLine = function(nextPoint, pressure) {
        var radius = calculateRadius(pressure);
        if(isOnlyClick) {
            // this is the second point of the line - only a dot was drawn so far
            if(preparePath(nextPoint)) {
                end = nextPoint.clone();
                isOnlyClick = false;
                endDot = SVG.dot(end, radius, current().color);
                paper.appendChild(endDot);
            }
        } else {
            // just draw another segment of the line
            drawSegment(nextPoint, radius, false);
        }
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

    /**
     *
     * @param   {Vector2}   nextPoint   The point where the path will start
     * @returns {boolean}   True if preparations went well, false otherwise.
     */
    var preparePath = function(nextPoint) {
        // calculate starting points
        var direction = nextPoint.subtract(start);
        if(direction.getX() === 0 && direction.getY()  === 0) {
            return false; // mouse hasn't moved a bit
        }
        var normal = getScaledNormal(direction, lastDrawnRadius); // control point "b" indicates the direction of the line in the next step

        // start a new path and prepare both top and bottom path strings
        path = SVG.createElement("path", {
            fill: current().color,
            stroke: "transparent"
        });
        paper.appendChild(path);

        // position the start points
        paths.top       = "M " + (start.getX() + normal.getX()) + "," + (start.getY()  + normal.getY() ) + " ";
        paths.bottom    = "L " + (start.getX() - normal.getX()) + "," + (start.getY()  - normal.getY() ) + " Z";

        return true;
    };

    /**
     * Draw the following sement of the line
     * @param {Vector2} nextPoint   Next mouse position
     * @param {number}  radius      Brush radius according to brush pressure
     * @param {boolean} closePath   True if the path won't continue further
     */
    var drawSegment = function(nextPoint, radius, closePath) {
        // swap radius for next radius
        var tmp = nextRadius;
        nextRadius = radius;
        radius = tmp;

        // calculate normal vector
        var direction = end.subtract(start);
        var normal = getScaledNormal(direction, radius); // control point "b" indicates the direction of the line in the next step
        if(normal === null) {
            return; // can't calculate normal vector => the distance between the last point and this point is zero => nothing to draw
        }

        if(direction.getSize() > radius) {
            drawCurvedSegment(nextPoint, normal);
        } else {
            // the points are too close to each other
            drawStraightSegment(normal);
        }

        // 'cap' is a tmp connection of the top and bottom parts of the path
        var cap;
        if(closePath !== true) {
            cap = SVG.lineToString(nextPoint.add(normal)) + " " + SVG.lineToString(nextPoint.subtract(normal));
            moveEndDot(nextPoint, radius);
        } else {
            // 'nextPoint' isn't part of the line - don't draw any tmp segment and close the path
            // with a sharp end instead + move the ending dot to the right position
            cap = SVG.lineToString(end.subtract(normal));
            moveEndDot(end, radius);
        }

        // update path string
        SVG.setAttributes(path, {
            "d": paths.top + cap + paths.bottom
        });

        lastDrawnPosition = start;
        lastDrawnRadius = radius;

        // do not forget to shift points
        prevPoint = start.clone();
        start = end.clone();
        end = nextPoint.clone();
    };

    var drawCurvedSegment = function(nextPoint, normal) {
        // calculate control points for cubic bezier curve
        var spline = calculateSpline(prevPoint, start, end, nextPoint, normal);
        if(spline !== false) {
            paths.top += " " + SVG.curveToString(spline.top.startCP, spline.top.endCP, spline.top.end);
            paths.bottom = SVG.curveToString(spline.bottom.endCP, spline.bottom.startCP, spline.bottom.start) + " " + paths.bottom; // bottom part is drawn "backwards"
        } else {
            return; // this segment can't be drawn
        }
    };


    var drawStraightSegment = function(normal) {
        // @todo !!!!
        // calculate control points for cubic bezier curve
        paths.top += " " + SVG.lineToString(end.add(normal));
        paths.bottom = SVG.lineToString(start.subtract(normal)) + " " + paths.bottom; // bottom part is drawn "backwards"
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
            return direction.getNormal().scale(radius);
        } catch (Exception) {
            return new Vector2(0, 0);
        }
    };

    /**
     * Calculate path points
     * @param {Vector2} a   Previous position
     * @param {Vector2} b   Segment start position
     * @param {Vector2} c   Segment end position
     * @param {Vector2} d   Following position
     * @param {Vector2} n   Normal vector
     * @returns {{top: {start: Vector2, startCP: Vector2, end: Vector2, endCP: Vector2}, bottom: {start: Vector2, startCP: Vector2, end: Vector2, endCP: Vector2}}}
     */
    var calculateSpline = function(a, b, c, d, n) {
        var cp = SplineHelper.catmullRomToBezier(a, b, c, d);
        return {
            top: {
                start:  cp.start.add(n),
                startCP:cp.startCP.add(n),
                end:    cp.end.add(n),
                endCP:  cp.endCP.add(n)
            },
            bottom: {
                start:  cp.start.subtract(n),
                startCP:cp.startCP.subtract(n),
                end:    cp.end.subtract(n),
                endCP:  cp.endCP.subtract(n)
            }
        };
    };


    /**
     * Ends currently drawn line.
     * @param {Vector2} pos Position of mouse when pressure dropped to 0.
     */
    var endLine = function(pos) {
        if(!isOnlyClick) {
            // draw the last missing segment
            var _end = end;
            drawSegment(pos, 0, true);

            var lastRadius = calculateRadius(lastState.pressure);
            moveEndDot(_end, lastRadius);
        }
    };

    /**
     * Move the dot and resize it according it to current state.
     * @param {Vector2} center  Center position
     * @param {number}  radius  Dot radius.
     */
    var moveEndDot = function(center, radius) {
        SVG.setAttributes(endDot, {
            cx: center.getX(),
            cy: center.getY() ,
            r: radius
        });
    };

    return SVGDrawer;
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

    createElement: function(name, attributes, children) {
        var el = document.createElement(name);
        HTML.setAttributes(el, attributes);
        if(!!children && Array.isArray(children)) {
            for(var i in children) {
                el.appendChild(children[i]);
            }
        }

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
 * Created by rozsival on 16/04/15.
 */

var SplineHelper = (function() {

    return {

        /**
         * Convert four consequent points to parameters for cubic Bézier curve.
         * (http://therndguy.com/papers/curves.pdf)
         * @param {Vector2} a
         * @param {Vector2} b
         * @param {Vector2} c
         * @param {Vector2} d
         * @returns {{start: Vector2, startCP: Vector2, end: Vector2, endCP: Vector2}}
         */
        catmullRomToBezier: function(a, b, c, d) {
            return {
                start:    b,
                startCP:  new Vector2((-1/6 * a.getX()) + b.getX() + (1/6 * c.getX()), (-1/6 * a.getY()) + b.getY() + (1/6 * c.getY())),
                end:      c,
                endCP:    new Vector2((1/6 * b.getX()) + c.getX() + (-1/6 * d.getX()), (1/6 * b.getY()) + c.getY() + (-1/6 * d.getY()))
            };
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
 * SVG helper object.
 * @type {{namespace: string, dot: Function, circle: Function, line: Function, createElement: Function, setAttributes: Function, moveToString: Function, lineToString: Function, curveToString: Function}}
 */
var SVG = {

    /** @type {String} XML namespace of SVG */
    namespace: "http://www.w3.org/2000/svg",

    /**
     * Creates a filled circle on the canvas.
     * @param  {Vector2} center     Center of the dot.
     * @param  {number}  radius     Circle radius
     * @param  {string}  color      CSS compatible color value
     * @return {null|HTMLElement}
     */
    dot: function(center, radius, color) {
        if(radius > 0) {
            return SVG.createElement("circle", {
                cx:     center.getX(),
                cy:     center.getY(),
                r:      radius,
                fill:   color,
                stroke: "transparent"
            });
        }

        return null;
    },

    /**
     * Create a circle with a specific center, radius and stroke color.
     * @param {Vector2} center  Circle of the circle.
     * @param {number} radius   Circle radius
     * @param {string} color    Circumference stroke color
     * @returns {null|HTMLElement}
     */
    circle: function(center, radius, color) {
        if(radius > 0) {
            return SVG.createElement("circle", {
                cx:     center.getX(),
                cy:     center.getY(),
                r:      radius,
                stroke:   color,
                fill: "transparent",
                "stroke-width": 1
            });
        }

        return null;
    },

    /**
     * Create line element.
     * @param {Vector2} start   Start vector
     * @param {Vector2} end
     * @param {number}  width
     * @param {string}  color
     * @returns {*}
     */
    line: function(start, end, width, color) {
        if(width > 0) {
            return SVG.createElement("path", {
                fill: "transparent",
                stroke: color,
                "stroke-width": width,
                d: SVG.moveToString(start) + " " + SVG.lineToString(end)
            });
        }

        return null;
    },

    /**
     * Creates an element with specified properties.
     * @param {string} name         Element name
     * @param {object} attributes   Element properties
     * @returns {HTMLElement}
     */
    createElement: function(name, attributes) {
        var el = document.createElementNS(SVG.namespace, name);
        if(attributes) {
            SVG.setAttributes(el, attributes);
        }
        return el;
    },

    /**
     * Assign a set of attributes to an element.
     * @param {HTMLElement} el          Target element
     * @param {object}      attributes  Properties to be set to the element.
     */
    setAttributes: function(el, attributes) {
        for (var attr in attributes) {
            el.setAttributeNS(null, attr, attributes[attr]);
        }
    },


    /**
     * Move SVG "cursor" to given end point.
     * @param   {Vector2}   a   End point
     * @returns {string}        SVG path argument
     */
    moveToString: function(a) {
        return "M " + a.getX() + "," + a.getY();
    },

    /**
     * Create a straight line according to given end point.
     * @param   {Vector2}   a   End point
     * @returns {string}        SVG path argument
     */
    lineToString: function(a) {
        return "L " + a.getX() + "," + a.getY();
    },

    /**
     * Create a cubic bézier curve according to given control points.
     * @param {Vector2} a   Start control point
     * @param {Vector2} b   End control point
     * @param {Vector2} c   End point
     * @returns {string}    SVG path argument
     */
    curveToString: function(a, b, c) {
        return "C " + a.getX() + "," + a.getY() + " " + b.getX() + "," + b.getY() + " " + c.getX() + "," + c.getY();
    }


};/**
 * Created by rozsival on 11/04/15.
 */

/**
 * Immutable two dimensional vector representation with basic operations.
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
        /**
         * X coordinate getter.
         * @returns {number}    x
         */
        this.getX = function() {
            return x;
        };

        /**
         * Y coordinate getter.
         * @returns {number}    y
         */
        this.getY = function() {
            return y;
        };
    }

    /**
     * Calculates size of the vector.
     * @returns {number}
     */
    Vector2.prototype.getSize = function() {
        return Math.sqrt(this.getX()*this.getX() + this.getY()*this.getY());
    };

    /**
     * Distance between this and the other point.
     * @param {Vector2} b
     * @return number
     */
    Vector2.prototype.distanceTo = function(b) {
        return this.subtract(b).getSize();
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

        return this.scale(1/size);
    };

    /**
     * Creates a normal vector to this vector.
     * @returns {Vector2}
     */
    Vector2.prototype.getNormal = function() {
        return new Vector2(-this.getY(), this.getX()).normalize();
    };

    /**
     * Create a new two-dimensional vector as a combination of this vector with a specified vector.
     * @param {Vector2} b   The other vector
     * @return {Vector2}    Result of addition
     */
    Vector2.prototype.add = function(b) {
        return new Vector2(this.getX() + b.getX(), this.getY() + b.getY());
    };

    /**
     * Create a new two-dimensional vector as a combination of this vector with a specified vector.
     * @param {Vector2} b   The other vector
     * @return {Vector2}    Result of addition
     */
    Vector2.prototype.subtract = function(b) {
        return new Vector2(this.getX() - b.getX(), this.getY() - b.getY());
    };

    /**
     * Create a new two-dimensional vector as a combination of this vector with a specified vector.
     * @param {number} c    Scaling coeficient
     * @return {Vector2}    Result of addition
     */
    Vector2.prototype.scale = function(c) {
        return new Vector2(this.getX() * c, this.getY() * c);
    };

    /**
     * Make a copy of the vector.
     * @returns {Vector2} Copy.
     */
    Vector2.prototype.clone = function() {
        return new Vector2(this.getX(), this.getY());
    };

    return Vector2;

})();/**
 * Event Aggregator object.
 * @author Šimon Rozsíval
 */
var VideoEvents = (function() {

    /** @type {(object|{string: callback[]})}   The list of all events. */
    var events = {};

    /**
     * Triggers a specified event callback asynchronously.
     * @param {string}  event   Event identificator
     * @param {number}  i       Callback index
     */
    var triggerAsync = function(event, i, _arguments) {
        setTimeout(function() {
            events[event][i].apply(this, _arguments);
        }, 0);
    };

    return {

        /**
         * Trigger all callbacks subscribed to a specified event.
         * @param {string} event    Event identificator
         */
        trigger: function(event) {
            if(events.hasOwnProperty(event)) {
                for(var i = 0; i < events[event].length; ++i) {
                    triggerAsync.call(this, event, i, arguments);
                }
            }
        },

        /**
         * Subscribe for an event.
         * @param {string}      event       Event identificator
         * @param {callback}    callback    Callback function
         */
        on: function(event, callback) {
            if(!events.hasOwnProperty(event)) {
                events[event] = [];
            }

            events[event].push(callback);
        },

        /**
         * Unsubscribe for an event.
         * @param {string}      event       Event identificator
         * @param {callback}    callback    Subscribed callback to be removed
         */
        off: function(event, callback) {            
            if(events.hasOwnProperty(event)) {
                var index = events[event].indexOf(callback);
                if(index !== -1) { // -1 means nothing was found
                    events[event].splice(index, 1);
                }
            }
        }
    };

})();/**
 * (High) resolution timer.
 */
var VideoTimer = (function() {

	/**
	 * Creates a timer with a reset clock.
	 * @constructor
	 */
	function VideoTimer() {

		/** @type {Date|object} */
		var clock;
		if(!window.performance) {
			clock = Date;
		} else {
			clock = window.performance; // High resolution timer
		}

		/**
		 * Get timer.
		 * @returns {Date|Object}
		 */
		this.getClock = function() {
			return clock;
		};

		/** @type {number} System clock at the time of the last timer reset. */
		var startTime;

		/**
		 * Get start time;
		 * @returns {number}
		 */
		this.getStartTime = function() {
			return startTime;
		}

		/**
		 * Start measuring time from zero.
		 */
		this.resetTimer = function() {
			startTime = clock.now();
		};

		/**
		 * Set timer clock to specific time.
		 * @param {number}	ms	Time in milliseconds
		 */
		this.setTime = function(ms) {
			this.resetTimer();
			startTime += ms;
		};

		this.resetTimer();
	}


	/**
	 * Get elapsed time since last timer reset.
	 * @returns {number} Elapsed time since last timer reset in milliseconds.
	 */
	VideoTimer.prototype.currentTime = function() {
	    return this.getClock().now() - this.getStartTime();
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
var Player = (function () {
    var settings = {
        xml: {
            file: ""
        },
        container: {
            selector: "#player"
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
})();
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
 * Created by rozsival on 25/04/15.
 */

var DelayedInvokeQueue = (function() {

    /** @type {Worker|DelayedInvokeWorkerMockup} */
    var worker;

    /** @type {object} */
    var queue = [];

    function DelayedInvokeQueue() {
        if(!!window.Worker && false) { // (!! trick - convert to boolean)
            worker = new Worker("delayed-invoke-worker.js");
        } else {
            worker = new DelayedInvokeWorkerMockup();
        }

        worker.onmessage = receiveMessage;
    }

    /**
     * Delay function call for a specified time.
     * @param {function}    callback    What to do.
     * @param {number}      ms          Delay time in milliseconds.
     */
    DelayedInvokeQueue.prototype.enqueue = function(callback, ms) {
        queue.push(callback);
        worker.postMessage({ time: ms });
    };

    var receiveMessage = function() {
        queue.shift().call();
    };

    return DelayedInvokeQueue;

})();

var DelayedInvokeWorkerMockup = (function() {

    /**
     * Prepare mockup object.
     * @constructor
     */
    function DelayedInvokeWorkerMockup() {
        // default onmessage - don't do anything
        this.onmessage = function() { };
    }

    /**
     * Add timeout.
     * @param data
     */
    DelayedInvokeWorkerMockup.prototype.postMessage = function(data) {
        setTimeout(this.onmessage, data.time);
    };

    return DelayedInvokeWorkerMockup;

})();/**
 * Created by rozsival on 25/04/15.
 */

var isRunning = false;

self.onmessage = function(data) {
    queue.push(data.time);
    if(!isRunning) {
        run();
    }
};

var run = function() {
    /** @type {object} Timeouts queue - contains waiting times in milliseconds (possibly high resolution time). */
    var queue = [];

    /** @type {VideoTimer} (High resolution) timer */
    var timer = new VideoTimer();

    do {
        if(queue.length > 0) {
            var next = queue.shift();
            timer.resetTimer();
            while(timer.currentTime() < next) {
                // keep spinning
            }
            // notify the parrent that another task should be executed
            self.postMessage();
        }
    } while (true);
};
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
			waitingText: "Please be patient. Uploading video usually takes some times - up to a few minutes if your video is over ten minutes long. Do not close this tab or browser window."
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
	var btn, uploadBtn, modal, board, progressSpan;

	function RecorderUI(options) {
		$.extend(true, settings, options);

		var container = settings.container;

		// create the board and canvas
		var board = createBoard.call(this, container);

		// create controls
		var controls = createControls.call(this, container);

		// maximize height of the elements
		container.appendChild(controls);
		this.board.style.height = "100%";

		// attach board to the container - but make it over the controls
		container.insertBefore(board, container.firstChild);

		createCanvasContainer.call(this, this.board);
		VideoEvents.trigger("canvas-container-ready", this.canvas);

		// create the cursor cross and place it inside the board
		var cursor = new Cursor(settings.cursor)
		this.board.appendChild(cursor.element);

		// create the modal that will show before uploading recorded data
		var modal = prepareUploadModal.call(this);
		container.appendChild(modal);

		// try to load the Wacom plugin
		var plugin = HTML.createElement("object", {
			id: "wtPlugin",
			type: "application/x-wacomtabletplugin"
		});
		document.body.appendChild(plugin);
		VideoEvents.trigger("wacom-plugin-ready", plugin);
	}

	var createBoard = function() {
		this.board = HTML.createElement("div", { id: "board" }, [
			HTML.createElement("noscript", {}, [
				(function() { var p = HTML.createElement("p"); p.innerHTML = settings.localization.noJS; return p; })()
			])
		]);

		return this.board; // add it to the DOM
	};

	var createCanvasContainer = function(board) {
		// the canvas - user will paint here
		this.canvas = HTML.createElement("div", {
			id: "canvas-container",
			width: board.outerWidth,
			height: board.outerHeight
		});
		this.board.appendChild(this.canvas);
	};

	var createControls = function() {
		// button
		var buttonContainer = HTML.createElement("div", { id: "rec-button-container" });
		prepareButtons.call(this, buttonContainer);

		// progress bar
		var colorsPanel = HTML.createElement("div", { id: "colors-panel" });
		prepareColorsPanel(colorsPanel);
		
		// timer
		var sizesPanel = HTML.createElement("div", { id: "brushes-panel" });
		prepareSizesPanel(sizesPanel);

		// row
		var controls = HTML.createElement("div", { id: "controls" },
			[
				buttonContainer,
				colorsPanel,
				sizesPanel
			]);

		return controls;
	};

	/**
	 * Add play/stop and upload buttons to the container.
	 * @param {HTMLElement} container
	 */
	var prepareButtons = function(container) {

		// rec button
		btn = UIFactory.button("success");
		HTML.setAttributes(btn, { title: settings.localization.record });
		btn.innerHTML = "REC";
		container.appendChild(btn);

		// upload button
		uploadBtn = UIFactory.button("default");
		HTML.setAttributes(uploadBtn, {
			disabled: "disabled",
			title: settings.localization.upload
		});
		uploadBtn.innerHTML = settings.localization.upload.toUpperCase();
		container.appendChild(uploadBtn);

		state.recording = false;
		var _this = this;
		btn.addEventListener("mouseup", function(e) {
			e.preventDefault();
			if(state.recording === false) {
				if(state.paused) {
					continueRecording.call(_this);
				} else {
					start.call(_this);
				}
				state.paused = false;
				HTML.setAttributes(btn, {
					title: settings.localization.pause
				});
			} else {
				state.paused = true;
				pause.call(_this);
				HTML.setAttributes(btn, {
					title: settings.localization.record
				});
			}

			state.recording = !state.recording;
		});

		uploadBtn.addEventListener("mouseup", function(e) {
			e.preventDefault();
			var modal = document.getElementsByClassName("modal-bg");
			modal.className = "modal-bg active"; // activate modal
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
		HTML.setAttributes(uploadBtn, { disabled: "disabled" });
		this.board.className += " no-pointer";

		var time = 0;
		tick = setInterval(function() {
			time += 1;
			btn.innerHTML = secondsToString(time);
		}, 1000);
	};

	var pause = function() {
		UIFactory.changeButton(btn, "success"); // success = green -> recording is OFF, can start again
		this.board.className.replace("no-pointer", "");
		uploadBtn.removeAttribute("disabled");
		VideoEvents.trigger("pause");

		clearInterval(tick);
	};

	var prepareUploadModal = function() {

		// input objects
		var titleInput = HTML.createElement("input", {
			type: "text",
			name: "title",
			placeholder: "video's title",
			class: "form-control"
		});
		var authorInput = HTML.createElement("input", {
			type: "text",
			name: "author",
			placeholder: "your name",
			class: "form-control"
		});
		var descriptionTextarea = HTML.createElement("textarea", {
			name: "description",
			placeholder: "video description",
			class: "form-control"
		});

		// button
		var save = HTML.createElement("button", {
			type: "button",
			class: "btn btn-primary"
		});
		save.innerHTML = "Save video";

		//
		var infoAlert = HTML.createElement("p", { class: "alert alert-info" });
		infoAlert.innerHTML = settings.localization.waitingText;
        var uploadInfo = HTML.createElement("div", { style: "display: none;" }, [ infoAlert ]);

		VideoEvents.on("upload-progress", function(e, percent) {
        	console.log(percent);
        });

		var closeBtn = HTML.createElement("button", { class: "close-btn" });
		closeBtn.innerHTML = "&times";
		closeBtn.addEventListener("mouseup", function(e) {
			e.preventDefault();
			var wrapper = document.getElementsByClassName("modal-bg");
			wrapper.className = ""; // remove "active"
			wrapper.className = "modal-bg";
		});

		var title = HTML.createElement("h4");
		title.innerHTML = "Save captured video";

		var modalBody = HTML.createElement("div", { class: "modal-body" },
			[
				HTML.createElement("p", { class: "form-group" }, [ titleInput ]),
				HTML.createElement("p", { class: "form-group" }, [ authorInput ]),
				HTML.createElement("p", { class: "form-group" }, [ descriptionTextarea ]),
				uploadInfo
			]);

		var modalFooter = HTML.createElement("div", { class: "modal-footer" },
			[
				closeBtn,
				save
			]);

		modal = HTML.createElement("div", { class: "modal" },
			[
				closeBtn,
				title,
				modalBody,
				modalFooter
			]);

		save.addEventListener("mouseup", function(e) {
			e.preventDefault();

			// inform the user..
			HTML.setAttributes(save, {
				disabled: "disabled"
			});
			save.innerHTML = "Starting upload...";
			uploadInfo.slideToggle();

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
			save.innerHTML = "Video was successfully uploaded.";
		});

		return HTML.createElement("div", { class: "modal-bg" }, [ modal ]);
	};

	/**
	 * Creates buttons for changing colors during recording.
	 * @param  {object} panel Parent element of the buttons.	 
	 */
	var prepareColorsPanel = function(panel) {
		var changeColor = function(button) {
			var children = button.parentNode.childNodes;
			for (var i = 0; i < children.length; ++i) {
				HTML.setAttributes(children[i], { class: "option" });
			}

			HTML.setAttributes(button, { class: "option active" });
			VideoEvents.trigger("color-change", button.getAttribute("data-color"));
		};

		Object.keys(settings.pallete).forEach(function(color) {
			var button = addColorButton(panel, color, settings.pallete[color]);
			button.addEventListener("mouseup", function(e) {
				// prevent default - 
				e.preventDefault();
				changeColor(button);
			});
		});
	};

	/**
	 * Creates buttons for changing brush size during recording.
	 * @param  {HTMLElement} panel Parent element of the buttons.
	 */
	var prepareSizesPanel = function(panel) {
		/**
		 * @param {HTMLElement} button
		 */
		var changeSize = function(button) {
			// reset btns
			var children = button.parentNode.childNodes;
			for (var i = 0; i < children.length; ++i) {
				HTML.setAttributes(children[i], { class: "option" });
			}

			HTML.setAttributes(button, { class: "option active" });
			var size = button.firstChild.getAttribute("data-size"); // it has only one child
			VideoEvents.trigger("brush-size-change", settings.widths[size]);
		};

		Object.keys(settings.widths).forEach(function(size) {
			var button = addSizeButton(panel, size, settings.widths[size]);
			HTML.setAttributes(button, { title: settings.localization.changeSize });
			button.addEventListener("mouseup", function(e) {
				e.preventDefault();
				changeSize(button);
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
		var button = HTML.createElement("button", {
			class: "option",
			"data-color": colorValue,
			title: colorName,
			style: "background-color: " + colorValue
		});
		if(colorName == settings.default.color) {
			VideoEvents.trigger("color-change", colorValue);
			HTML.setAttributes(button, { class: "option active" });
		}
		panel.appendChild(button);
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
		var dot = HTML.createElement("span", {
			class: "dot",
			"data-size": sizeName
		});
		var borderWidth = 2;
		dot.style.borderWidth = borderWidth + "px";
		dot.style.borderRadius = size/2 + "px";
		dot.style.width = (size - 2*borderWidth) + "px";
		dot.style.height = (size - 2*borderWidth) + "px";


		var button = HTML.createElement("button", {
			class: "option",
			title: size
		}, [ dot ]);

		if(sizeName == settings.default.size) {
			VideoEvents.trigger("brush-size-change", size);
			HTML.setAttributes(button, { class: "option active" });
		}

		panel.appendChild(button);

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
	 * Creates a jQuery object representing a button element with classes specific for Twitter Bootstrap 3 button.
	 * @param  {string} type Button type - suffix of class name - "btn-<type>". See http://bootstrapdocs.com/v3.2.0/docs/css/#buttons for list of button types.
	 * @return {HTMLElement} Button element
	 */
	button: function(type) {
		return HTML.createElement("button", { class: "btn btn-" + type, "data-type": type });
	},

	/**
	 * Changes icon type. *this* should be the jQuery object of the icon. Function useage: *UIFactory. changeIcon(icon, "new-type")*
	 * @param  {string} type New icon type - glyphicon class sufix.
	 * @return {HTMLElement}
	 */
	changeButton: function(button, type) {
		HTML.setAttributes(button, {
			class: "btn btn-" + type,
			"data-type": type
		});

		return button
	},

	//
	// Progress bars
	//

	/**
	 * Creates a jQuery object representing a div element with classes specific for Twitter Bootstrap 3 progress bar.
	 * @param  {string} type Progressbar type - suffix of class name - "progress-bar-<type>". See http://bootstrapdocs.com/v3.2.0/docs/css/#progressbars for list of button types.
	 * @return {HTMLElement} Progressbar
	 */
	progressbar: function(type, initialProgress) {
		return HTML.createElement("div", {
			class: "progress-bar progress-bar-" + type,
			"data-progress": initialProgress,
			css: "width: " + initialProgress + "%",
			role: "progress-bar"
		});
	},

	/**
	 * Changes progressbar type and progress.
	 * @param  {object} bar      Progress bar object.
	 * @param  {string}	progress Progress in percents.
	 * @param  {int}	time     Time in milliseconds - how long will it take to animate the progress change.
	 * @return {void}
	 */
	changeProgress: function(bar, progress, time) {

		// the progress might be
		var first = progress.innerHTML[0];
		if(first === "+" || first === "-") {
			var sign = first === "+" ? 1 : -1;
			progress = Number(bar.getAttribute("data-progress")) + sign * Number(progress.substr(1));
		};

		bar.stop(); // stop any animation that is in progress
		if (time == undefined) {
			bar.style.width = progress + "%";
		} else {
			// time is defined - animate the progress
			bar.style.transitionDuration = (time / 1000) + "s";
			bar.style.width = progress + "%";
		}

		bar.setAttribute("data-progress", progress);
	},

	//
	// Cursor cross ... -|-
	//

	/**
	 * Create canvas element with a cross on transparent background.
	 * @param  {int}	size  Width and height of the cross in pixels.
	 * @param  {string} color Css color atribute. Specifies the color of the cross.
	 * @return {Element}    The SVG element.
	 */
	createCursorCanvas:  function(size, color) {
		var canvas = SVG.createElement("svg", {
			width: size,
			height: size
		});
		var offset = size / 2;

		// draw the "+"
		var path = SVG.createElement("path", {
			fill: "transparent",
			stroke: color,
			"stroke-width": size * 0.1,
			d: "M " + offset + ",0 L " + offset + "," + size + " M 0," + offset + " L " + size + "," + offset + " Z"
		});
		canvas.appendChild(path);

		// I want to move the cursor to any point and the stuff behind the cursor must be visible
		canvas.style.position = "absolute";
		canvas.style.background = "transparent";

		return canvas;
	}

};