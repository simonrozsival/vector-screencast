
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
		_this.rewind();
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

	// I have returned the very last state when this function was called last
	if(this.reachedEnd == true) {
		this.nextState = this.currentState;
		this.stop(true);
		return undefined;
	}

	do {
		this.nextState = this.videoInformation.getNext();

		if(this.nextState == undefined) {
			// reached the end of the video!
			this.reachedEnd = true; // return the current state, but then stop
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
		inside: true // @todo - I shouldn't use this at all...
	};
};

XmlDataProvider.prototype.getMetaData = function() {
	return this.videoInformation.getMetaData(); // this information is available only after the document is loaded!
}

XmlDataProvider.prototype.rewind = function() {
	this.videoInformation.rewind();
	this.lastState = { time: 0 };
	this.currentState = this.videoInformation.getNext();
	this.nextState = this.videoInformation.getNext();
	this.reachedEnd = false;
}

XmlDataProvider.prototype.start = function() {
	this.running = true;
	this.tick();
};

XmlDataProvider.prototype.tick = function() {

	if(this.currentState == undefined) {
		console.log("No more data. Can't `tick`.");
		return;
	}

	var _this = this;
	var timeGap = this.currentState.time - this.lastState.time;
	this.timeout = setTimeout(function(){
		// this is "window" in this context
		if(_this.running) {
			_this.parent.reportAction.call(_this);
			_this.tick();
		}
	}, timeGap);
}

XmlDataProvider.prototype.stop = function(reachedEnd) {
	if(this.running == true) {
		this.running = false;

		if(reachedEnd == true) {
			this.consumer.onReachedEnd();
		}
	}
}