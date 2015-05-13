/**
 * Event Aggregator object.
 * @author Šimon Rozsíval
 */
var VideoEvents = (function() {

    /** @type {(object|{string: callback[]})}   The list of all events. */
    var events = {};

    /**
     * Triggers a specified event callback asynchronously.
     * @param {string}  event   Event identificator
     * @param {number}  i       Callback index
     */
    var triggerAsync = function(event, i, _arguments) {
        setTimeout(function() {
            events[event][i].apply(this, _arguments);
        }, 0);
    };

    return {

        /**
         * Trigger all callbacks subscribed to a specified event.
         * @param {string} event    Event identificator
         */
        trigger: function(event) {
            if(events.hasOwnProperty(event)) {
                for(var i = 0; i < events[event].length; ++i) {
                    triggerAsync.call(this, event, i, arguments);
                }
            }
        },

        /**
         * Subscribe for an event.
         * @param {string}      event       Event identificator
         * @param {callback}    callback    Callback function
         */
        on: function(event, callback) {
            if(!events.hasOwnProperty(event)) {
                events[event] = [];
            }

            events[event].push(callback);
        },

        /**
         * Unsubscribe for an event.
         * @param {string}      event       Event identificator
         * @param {callback}    callback    Subscribed callback to be removed
         */
        off: function(event, callback) {            
            if(events.hasOwnProperty(event)) {
                var index = events[event].indexOf(callback);
                if(index !== -1) { // -1 means nothing was found
                    events[event].splice(index, 1);
                }
            }
        }
    };

})();