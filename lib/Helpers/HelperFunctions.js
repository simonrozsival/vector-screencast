//namespace VectorScreencast.Helpers {
var COORDS_PRECISION = 3;
function maxDecPlaces(n, precision) {
    if (precision === void 0) { precision = COORDS_PRECISION; }
    return Number(n.toFixed(precision));
}
exports.maxDecPlaces = maxDecPlaces;
function precise(n, precision) {
    if (precision === void 0) { precision = COORDS_PRECISION; }
    return maxDecPlaces(n, precision).toString();
}
exports.precise = precise;
function secondsToString(s) {
    var time;
    var minutes = Math.floor(s / 60);
    time = minutes + ":";
    var seconds = Math.floor(s % 60);
    if (seconds <= 9) {
        time += "0" + seconds.toString(10);
    }
    else {
        time += seconds.toString(10);
    }
    return time;
}
exports.secondsToString = secondsToString;
;
function millisecondsToString(ms) {
    return secondsToString(Math.floor(ms / 1000));
}
exports.millisecondsToString = millisecondsToString;
;
