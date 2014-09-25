
// Abstract class

var BaseDataProvider = {

	ready: function() {
		VideoEvents.trigger("data-ready");
	},

	init: function() {
		var _this = this;
		VideoEvents.on("start", function() {
			_this.start();
		});

		VideoEvents.on("pause", function() {
			_this.pause();
		});
	},

	start: function() {
		this.running = true;
	},

	pause: function() {
		this.running = false;
	},

	reportAction: function(state) {
		if(state != undefined && state != {}) {
			VideoEvents.trigger("new-state", state);
		}
	}
};