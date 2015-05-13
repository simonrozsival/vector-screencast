/**
 * Created by rozsival on 25/04/15.
 */

var DelayedInvokeQueue = (function() {

    /** @type {Worker|DelayedInvokeWorkerMockup} */
    var worker;

    /** @type {object} */
    var queue = [];

    function DelayedInvokeQueue() {
        if(!!window.Worker && false) { // (!! trick - convert to boolean)
            worker = new Worker("delayed-invoke-worker.js");
        } else {
            worker = new DelayedInvokeWorkerMockup();
        }

        worker.onmessage = receiveMessage;
    }

    /**
     * Delay function call for a specified time.
     * @param {function}    callback    What to do.
     * @param {number}      ms          Delay time in milliseconds.
     */
    DelayedInvokeQueue.prototype.enqueue = function(callback, ms) {
        queue.push(callback);
        worker.postMessage({ time: ms });
    };

    var receiveMessage = function() {
        queue.shift().call();
    };

    return DelayedInvokeQueue;

})();

var DelayedInvokeWorkerMockup = (function() {

    /**
     * Prepare mockup object.
     * @constructor
     */
    function DelayedInvokeWorkerMockup() {
        // default onmessage - don't do anything
        this.onmessage = function() { };
    }

    /**
     * Add timeout.
     * @param data
     */
    DelayedInvokeWorkerMockup.prototype.postMessage = function(data) {
        setTimeout(this.onmessage, data.time);
    };

    return DelayedInvokeWorkerMockup;

})();