
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
})();