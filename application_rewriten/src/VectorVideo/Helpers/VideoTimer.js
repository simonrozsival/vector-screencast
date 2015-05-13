var Helpers;
(function (Helpers) {
    /**
    * (High resolution) timer.
    */
    var VideoTimer = (function () {
        /**
         * Creates a timer and resets it.
         */
        function VideoTimer() {
            /** Current time of the moment when the timer was paused. */
            this.pauseTime = 0;
            /** @type {Date|object} */
            if (!window.performance) {
                this.clock = Date;
            }
            else {
                this.clock = window.performance; // High resolution timer
            }
            this.paused = false;
            this.Reset();
        }
        Object.defineProperty(VideoTimer.prototype, "StartTime", {
            get: function () { return this.startTime; },
            enumerable: true,
            configurable: true
        });
        /**
         * Get time ellapsed since the last clock reset
         */
        VideoTimer.prototype.CurrentTime = function () {
            return this.paused ? this.clock.now() - this.startTime : this.pauseTime;
        };
        /**
         * Set the timer to a specific point (in milliseconds)
         */
        VideoTimer.prototype.SetTime = function (milliseconds) {
            this.Reset();
            this.startTime += milliseconds;
        };
        /**
         * Pause the timer
         */
        VideoTimer.prototype.Pause = function () {
            this.pauseTime = this.CurrentTime();
        };
        /**
         * Unpause the timer
         */
        VideoTimer.prototype.Resume = function () {
            this.paused = false;
            this.SetTime(-this.pauseTime);
        };
        /**
         * Start counting from zero
         */
        VideoTimer.prototype.Reset = function () {
            this.startTime = this.CurrentTime();
        };
        return VideoTimer;
    })();
    Helpers.VideoTimer = VideoTimer;
})(Helpers || (Helpers = {}));
//# sourceMappingURL=VideoTimer.js.map