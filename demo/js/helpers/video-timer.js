
function VideoTimer() {
    this.resetTimer();
}

VideoTimer.prototype.resetTimer = function() {
    this.startTime = 0;
    this.startTime = this.currentTime();
}

VideoTimer.prototype.currentTime = function() {
    return (new Date()).getTime() - this.startTime;
}