var VideoTimer = (function () {
    function VideoTimer(running) {
        this.pauseTime = 0;
        if (!window.performance) {
            this.clock = Date;
        }
        else {
            this.clock = window.performance;
        }
        this.paused = !running;
        this.Reset();
    }
    Object.defineProperty(VideoTimer.prototype, "StartTime", {
        get: function () { return this.startTime; },
        enumerable: true,
        configurable: true
    });
    VideoTimer.prototype.CurrentTime = function () {
        return !this.paused ? this.clock.now() - this.startTime : this.pauseTime;
    };
    VideoTimer.prototype.SetTime = function (milliseconds) {
        if (this.paused) {
            this.pauseTime = milliseconds;
        }
        else {
            this.startTime = this.clock.now() - milliseconds;
        }
    };
    VideoTimer.prototype.Pause = function () {
        this.pauseTime = this.CurrentTime();
        this.paused = true;
    };
    VideoTimer.prototype.Resume = function () {
        this.paused = false;
        this.Reset();
        this.SetTime(this.pauseTime);
    };
    VideoTimer.prototype.Reset = function () {
        this.startTime = this.clock.now();
    };
    return VideoTimer;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VideoTimer;
