

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

		// cursor settings
		cursor: {
			size: 20,
			color: "#fff"
		},

		container: undefined,
		containerSelector: "#player"

	};

	function PlayerUI(config) {

		// load settings
		$.extend(true, settings, config);
		var container = settings.container || $(settings.containerSelector);

		// wait until data is loaded and parsed
		VideoEvents.on("data-ready", function(e, info) {
			videoLength = info.length; // video lenght in milliseconds

			// prepare the board - create the elements and set the right size (that is why I have to wait until data is loaded)
			var ratio = info.board.height / info.board.width;
			createBoard.call(this, container, ratio);

			// now I can create the controls too
			createControls.call(this, container);

			// create a cursor and place it inside the board
			var cursor = new Cursor(settings.cursor);
			this.board.append(cursor.element);

			console.log("UI for the player is ready");
			VideoEvents.trigger("ui-ready");
		});
	}

	var createBoard = function(container, aspectRatio) {
		// prepare the board element - and make it as wide as possible
		var board = this.board = $("<div></div>").attr("id", "board").css("width", "100%");
		container.append(board); // add it to the DOM
		
		// calculate the correct dimensions of the board - width is fixed, use given aspect ratio
		var width = parseInt(board.width());
		var height = aspectRatio * width;
		board.height(height);

		// I have to know final board dimensions by now
		var canvas = this.canvas = $("<canvas></canvas>").attr("width", width).attr("height", height);
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
			skip(progress);
		});

		var last = 0;
		VideoEvents.on("next-state-peek", function(e, next) {
			var step = next.time - last;
			last = next.time;
			currentProgress = next.time / videoLength * 100;
			UIFactory.changeProgress(bar, currentProgress, step);
		});

		VideoEvents.on("current-time", function(e, time) {
			time *= 1000; // seconds to milliseconds
			var progress = time / videoLength * 100;
			//UIFactory.changeProgress(bar, progress);
			currentProgress = progress;
		});

		VideoEvents.on("buffered-until", function(e, time) {
			time *= 1000; // seconds to milliseconds
			//buffered = Math.min(100, time / videoLength * 100);
			buffered = Math.ceil(time / videoLength * 100);
			UIFactory.changeProgress(preloaded, buffered);
		});
	};

	var prepareProgressText = function(container) {
		// [3] displayed time
		var text = $("<strong></strong>").addClass("time").attr("id", "current-time").text(secondsToString(0));
		totalTime = $("<span></span>").addClass("time").attr("id", "total-time").text(millisecondsToString(videoLength));

		container.append(text).append("<span>&nbsp;/&nbsp;</span>").append(totalTime);

		VideoEvents.on("new-state", function(e, state) {
			text.text(millisecondsToString(state.time));
		});
	};

	return PlayerUI;

})();