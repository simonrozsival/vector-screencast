
// Abstract class

BaseDataProvider = {
	whenReady: function(callback) {
		this.onReadyCallback = callback;
		if(this.isReady) { // the callback was attached after the data provider became ready, fire it straight away
			this.onReady();
		}
	},

	onReady: function() {
		if(typeof this.onReadyCallback == "function") {
			this.onReadyCallback();
		}
		this.isReady = true;
	},

	registerDataConsumer: function(consumer) {
		this.consumer = consumer;
		var canvas = this.consumer.getCanvas();
		this.canvasWidth = canvas.width();
		this.canvasHeight = canvas.height();
		this.running = false;
	},

	setOffset: function(offset) {
		this.offset = offset;
	},

	isInside: function(x, y) {
		var w = this.canvasWidth;
		var h = this.canvasHeight;

		return x >= 0 && x <= w && y >= 0 && y <= h;
	},

	getCurrentCursorState: function() {
		return {}; // this should be overriden
	},

	start: function() {
		this.running = true;
	},

	pause: function() {
		this.running = false;
	},

	reportAction: function() {
		var currentState = this.getCurrentCursorState();
		this.consumer.recieveNewState(currentState);
	}
}