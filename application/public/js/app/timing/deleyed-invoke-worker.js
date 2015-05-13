/**
 * Created by rozsival on 25/04/15.
 */

var isRunning = false;

self.onmessage = function(data) {
    queue.push(data.time);
    if(!isRunning) {
        run();
    }
};

var run = function() {
    /** @type {object} Timeouts queue - contains waiting times in milliseconds (possibly high resolution time). */
    var queue = [];

    /** @type {VideoTimer} (High resolution) timer */
    var timer = new VideoTimer();

    do {
        if(queue.length > 0) {
            var next = queue.shift();
            timer.resetTimer();
            while(timer.currentTime() < next) {
                // keep spinning
            }
            // notify the parrent that another task should be executed
            self.postMessage();
        }
    } while (true);
};
