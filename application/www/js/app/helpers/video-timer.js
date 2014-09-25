
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

})();