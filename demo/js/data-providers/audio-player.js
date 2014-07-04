
var AudioPlayer = (function() {

	function AudioPlayer(sources, events) {

		// create audio element
		var $audio = $("<audio>").attr("preload", "auto");
		var audio = $audio[0]; // access to the HTML5 api - I don't want to have it wrapped in the jQuery object

		// default value - if something fails, it will remain set to 'false'
		this.initSuccessful = false;

		if(audio.canPlayType == undefined) {
			console.log("ERROR: browser does not support HTML5 audio");
			return;
		}

		// the audio is stopped when the page is loaded
		audio.autoplay = false;
		this.playing = false;

		// add sources
		var canPlaySound = false;
		for (var source in sources) {
			var contentType = "audio/" + source;

			if(!!audio.canPlayType(contentType)) {			
				// can play type returned "probably" or "maybe"
				// it would return "" if this browser does not support this type (-> I use "!!" to convert string to boolean)
				$source = $("<source>").attr("type", contentType).attr("src", sources[source]);
				$audio.append($source);
				canPlaySound = true;
			}
		}

		// check if at least one source is probably acceptable
		if(canPlaySound == true) {
			// init was successful
			this.initSuccessful = true; 
			this.audio = audio;
			this.$audio = $audio;

			// default system events
			attachPrivateEvents.call(this);

			// user can pass his events
			attachEvents.call(this, events);

			// attach the player to the document
			$("body").append($audio);
			console.log("SUCCESS: audio is available");
		} else {
			console.log("ERROR: can't play any provided audio sources");
		}

	}

	//
	// private functions section:
	// 
	
	var attachPrivateEvents = function() {
		var $audio = this.$audio;
		var _this = this;

		$audio.on("ended", function() {
			_this.playing = false;
			_this.reachedEnd = true;
			console.log("(audio reached end)");
		});
	};
	

	var attachEvents = function(events) {
		var $audio = this.$audio;
		var _this = this;

		for (var eventName in events) {
			$audio.on(eventName, events[eventName]);
		}
	};


	//
	// public functions section:
	//

	AudioPlayer.prototype.play = function() {
		if(this.initSuccessful) {
			if(this.reachedEnd == true) {
				this.rewind();
			}

			this.audio.play();
		}
	};

	AudioPlayer.prototype.pause = function() {
		if(this.initSuccessful) {
			this.audio.pause();
		}
	};

	AudioPlayer.prototype.rewind = function() {
		if(this.initSuccessful) {
			this.audio.currentTime = 0;
			this.reachedEnd == false;
		}
	};

	AudioPlayer.prototype.canPlay = function(callback) {
		this.audio.canPlay = callback;
	};

	AudioPlayer.prototype.registerPlayPauseButton = function(buttonSelector) {
		var _this = this;
		$("body").on("click", buttonSelector, function() {
			_this.playing ? _this.pause() : _this.play();
			_this.playing = !_this.playing;
		});
	}	





	return AudioPlayer;

})();
