

var VideoEvents = (function() {
    
    var el;

    var formProperEventName = function(event) {
        return "video/" + event; // prefixes the event name
    };

    return {
        init: function(element) {
            if(el == undefined) {
                el = element;
            }
        },

        trigger: function(event) {
        	// if this method is called with more than one argument
        	// than the other arguments will be passed to the event
            var args = Array.prototype.slice.call(arguments); // I have to covnert arguments object to an array
        	args.shift(); // the first argument is the "event"
        	// "arguments" now doesn't contain the first arg.
            
            el.trigger(formProperEventName(event), args);
        },

        on: function(event, callback) {
    	   el.on(formProperEventName(event), callback);
        }
    };

})();