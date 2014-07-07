

var PlayerUI = (function() {
	
	var playing = false, reachedEnd = false;
	var videoLegnth = 0;

	function PlayerUI(options) {

		// prepare UI and bind events
		preparePlayPauseButton.call(this, options.buttonContainer);
		prepareProgressBar.call(this, options.progressBarContainer);

		VideoEvents.on("data-ready", function(e, info) {
			videoLength = info.length;
			prepareProgressText.call(this, options.progressTimeContainer);
		});
	}


	var preparePlayPauseButton = function(container) {

		// create the button
		var btn = UIFactory.button("success").attr("disabled", "disabled");
		var icon = UIFactory.glyphicon("play");
		btn.append(icon);
		container.append(btn);	

		// events:
		 
		var playPause = function() {
			// change the icon
			if(playing == true) {
				VideoEvents.trigger("pause");
				UIFactory.changeIcon.call(icon, "play");
			} else {
				if(reachedEnd == true) {
					// rewind first
					reachedEnd = false;
					VideoEvents.trigger("rewind");
				}
				VideoEvents.trigger("start");
				UIFactory.changeIcon.call(icon, "pause");
			}

			playing = !playing;

			// trigger play or pause event
		};
		
		btn.on("click", playPause);

		var spacebar = 32; // key constant
		$("body").on("keydown", function(e) {
			if (e.keyCode == spacebar) {
				playPause();
			}
		});

		// the button is disabled until data is preloaded
		VideoEvents.on("data-ready", function() {
			btn.removeAttr("disabled");
		});

		// change the icon when the video reaches end
		VideoEvents.on("reached-end", function() {
			playing = false;
			reachedEnd = true;
			UIFactory.changeIcon.call(icon, "repeat");
		});

	};

	var prepareProgressBar = function(container) {
		var bar = UIFactory.progressbar("success", 0);
		var preloaded = UIFactory.progressbar("info", 0);

		container.append(bar).append(preloaded);

		// skip after clicking on the progress bar
		var skip = function(progress) {
			UIFactory.changeProgress(bar, progress * 100);
		};

		container.on("click", function(event) {
			var progress = (event.pageX - container.offset().left) / container.width();
			VideoEvents.trigger("skip-to", progress);
			skip(progress);
		});

		VideoEvents.on("rewind", function() {
			last = 0;
			reachedEnd = false;
			UIFactory.changeProgress(bar, 0);
		});

		VideoEvents.on("skip-to", function(e, progress) {
			skip(progress);
		});

		var last = 0;
		VideoEvents.on("next-state-peek", function(e, next) {
			var step = next.time - last;
			last = next.time;
			var progress = next.time / videoLength * 100;
			UIFactory.changeProgress(bar, progress, step);
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