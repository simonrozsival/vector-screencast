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

var tryParseInt = function(maybeInt) {
    var tmp = parseInt(maybeInt);
    if(tmp != NaN) {
        return tmp;
    }

    return maybeInt; // could be renamed to "notAInt" ... ;-)
}


(function($) {


    //
    //
    //  jQuery extensions
    //
    //

    /**
     * This simple jQuery extension gives me an easy way to check, if a selector selected something or not.
     * Usage: var = something = $("#something"); if(something.exists()) { something.html("found an element with id 'something'"); }
     * @return {bool} Selector selected something (== the array of found elements has at least one element)
     */
    $.fn.exists = function() {
        return this.lenght !== 0;
    };

}(jQuery));