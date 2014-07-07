/**
 * Khanova Škola - vektorové video
 *
 * HELPER FUNCTIONS
 * This script contains several useful functions used throughout the project.
 *
 * @author:     Šimon Rozsíval (simon@rozsival.com)
 * @project:    Vector screencast for Khan Academy (Bachelor thesis)
 * @license:    MIT
 */

/**
 * Does this object implement needed functions?
 * @param  {object}  obj The examined object;
 * @return {bool}     Returns true when the object has all the functions, otherwise returns false;
 */
var hasMethods = function(obj /*, method list as strings */){
    var i = 1, methodName;
    while((methodName = arguments[i++])){
        if(typeof obj[methodName] != 'function') {
            return false;
        }
    }
    return true;
};

/**
 * Converts an integer value of seconds to a human-readable time format - "0:00"
 * @param  {integer} s seconds
 * @return {string}    Human readable time
 */
var secondsToString = function(s) {
    var seconds = s % 60;
    if(seconds <= 9) {
        seconds = "0" + seconds; // seconds should have leading zero if lesser than 10
    }

    var minutes = Math.floor(s / 60);
    return minutes + ":" + seconds;
};

/**
 * Converts an integer value of milliseconds to a human-readable time format - "0:00"
 * @param  {integer} ms     milliseconds
 * @return {string}         Human readable time
 */
var millisecondsToString = function(ms) {
    return secondsToString(Math.floor(ms / 1000));
};


/**
 * Get HEX color value of an object.
 * @type {jQuery object}
 */
$.cssHooks.backgroundColor = {
    get: function(elem) {
        if (elem.currentStyle)
            var bg = elem.currentStyle["backgroundColor"];
        else if (window.getComputedStyle)
            var bg = document.defaultView.getComputedStyle(elem,
                null).getPropertyValue("background-color");
        if (bg.search("rgb") == -1)
            return bg;
        else {
            bg = bg.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            function hex(x) {
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }
            return "#" + hex(bg[1]) + hex(bg[2]) + hex(bg[3]);
        }
    }
}

/**
 * Get a parametr form the URL
 * @param  {string} name Name of the parameter.
 * @return {string}      Value of the parameter. Empty string there is none.
 */
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
