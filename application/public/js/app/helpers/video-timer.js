/**
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

})();