/**
 * Private data accessor. Adds support for dynamic private properties for objects.
 * @return {function} The private access function.
 */
var privateData = (function() {

	if ( typeof Object.prototype.uniqueId == "undefined" ) {
	    var id = 0;
        Object.prototype.uniqueId = function() {
            if ( typeof this.__uniqueid == "undefined" ) {
                this.__uniqueid = ++id;
            }
            return this.__uniqueid;
        };
    }

    // this stores all the private data of all objects
    var data = {};

    /**
     * Get access to objects private data.
     * @param  {object} obj Any object.
     * @return {object}     Private data.
     */
    function privateData(obj) {
    	var uid = obj.uniqueId();
    	if(!data.hasOwnProperty(uid)) {
    		data[uid] = {};
    	}

    	return data[uid];
    }

    return privateData;

})();