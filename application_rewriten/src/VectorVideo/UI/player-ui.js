

var PlayerUI = (function() {
	
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

	};

	function PlayerUI(options) {


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

})();