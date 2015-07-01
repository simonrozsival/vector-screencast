var Helpers;
(function (Helpers) {
    var COORDS_PRECISION = 3;
    /**
     * Prints a number rounded and with trimmed trailing zeros.
     */
    function precise(n, precision) {
        if (precision === void 0) { precision = COORDS_PRECISION; }
        return Number(n.toFixed(precision)).toString(); // isn't there a better way?
    }
    Helpers.precise = precise;
    /**
    * Converts an integer value of seconds to a human-readable time format - "0:00"
    * @param  s seconds
    * @return Human readable time
    */
    function secondsToString(s) {
        var time;
        var minutes = Math.floor(s / 60);
        time = minutes + ":";
        var seconds = Math.floor(s % 60);
        if (seconds <= 9) {
            time += "0" + seconds.toString(10); // seconds should have leading zero if lesser than 10
        }
        else {
            time += seconds.toString(10);
        }
        return time;
    }
    Helpers.secondsToString = secondsToString;
    ;
    /**
    * Converts an integer value of milliseconds to a human-readable time format - "0:00"
    * @param  ms     Time in milliseconds
    * @return Human readable time
    */
    function millisecondsToString(ms) {
        return secondsToString(Math.floor(ms / 1000));
    }
    Helpers.millisecondsToString = millisecondsToString;
    ;
})(Helpers || (Helpers = {}));
