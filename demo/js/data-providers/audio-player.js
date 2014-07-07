
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
			var contentType = "audio/" + source;

			if(!!audio.canPlayType(contentType)) {	
				// can play type returned "probably" or "maybe"
				// it would return "" if this browser does not support this type (-> I use "!!" to convert string to boolean (empty string -> false))
				$source = $("<source>").attr("type", contentType).attr("src", sources[source]);
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
			changePosition(audio.duration * progress);
		});
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
	}

	return AudioPlayer;

})();
