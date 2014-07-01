
XmlDataProvider.prototype = BaseDataProvider;
XmlDataProvider.prototype.parent = BaseDataProvider;

function XmlDataProvider(fileName, settings) {
	this.timer = new VideoTimer();

	var errorReport = function(msg) {
		alert(msg); // @todo replace this with a flash message
	};

	var _this = this;
	var onSuccess = function() {
		// this is not XmlDataProvider in this context

		_this.lastState = { time: 0 };
		_this.currentState = _this.videoInformation.getNext();
		_this.nextState = _this.videoInformation.getNext();
		_this.onReady();
	};

	this.videoInformation = new KhanAcademyVectorReader();
	this.videoInformation.loadFile(fileName, errorReport, onSuccess);//, validate); // - validation does not work well so far..
	this.settings = settings;
	this.running = false;	
}

XmlDataProvider.prototype.getCurrentCursorState = function() {
	this.lastState = this.currentState;
	this.currentState = this.nextState;

	do {
		this.nextState = this.videoInformation.getNext();

		if(this.nextState == undefined) {
			// reached the end of the video!
			this.nextState = this.currentState;
			this.stop();
			break;
		}

		switch(this.nextState.type) {
			case "color-change":
				this.settings.setColor(this.nextState.value);
				break;
			case "brush-size-change":
				this.settings.setSize(this.nextState.value);
				break;
		}
	} while (this.nextState != undefined && this.nextState.type != "cursor-movement");

	return {
		x: this.currentState.x,
		y: this.currentState.y,
		pressure: this.currentState.pressure,
		time: this.currentState.time,
		inside: true // @todo - I shouldn't use this after all...
	};
};

XmlDataProvider.prototype.start = function() {
	this.running = true;
	this.tick();
};

XmlDataProvider.prototype.tick = function() {
	var _this = this;
	this.timeout = setTimeout(function(){
		// this is "window" in this context
		_this.parent.reportAction.call(_this);
		if(_this.running) {
			_this.tick();
		}
	}, this.currentState.time - this.lastState.time);
}

XmlDataProvider.prototype.stop = function() {
	this.running = false;
}