/**
 * Created by rozsival on 11/04/15.
 */

/**
 * @property    {number}    x
 * @property    {number}    y
 * @property    {number}    pressure
 * @property    {number}    time
 * @property    {String}    type
 * @class
 */
var State = (function() {

    /**
     *
     * @param {Object|number} x
     * @param {number} y
     * @param {number} pressure
     * @param {number} time
     * @param {String} type
     * @constructor
     */
    function State(x, y, pressure, time, type) {
        if(typeof x === "object") {
            this.x = x.x;
            this.y = x.y;
            this.pressure = x.pressure;
            this.time = x.time;
            this.type = x.type;
        } else {
            this.x = x;
            this.y = y;
            this.pressure = pressure;
            this.time = time;
            this.type = type;
        }
    }

    return State;
})();