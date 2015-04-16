

var VideoEvents = (function() {
    
    var events = {};

    return {

        trigger: function(event) {
            e = events[event] || false
            if(e !== false) {                                    
                for(var e in events[event]) {
                    events[event][e].apply(this, arguments);
                }
            }
        },

        on: function(event, callback) {
            if(!events.hasOwnProperty(event)) {
                events[event] = [];
            }

            events[event].push(callback);
        }
    };

})();