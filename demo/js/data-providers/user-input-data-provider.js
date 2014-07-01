

// UserInputDataProvider inherits from BaseDataProvider

UserInputDataProvider.prototype = BaseDataProvider;
UserInputDataProvider.prototype.parent = BaseDataProvider;


function UserInputDataProvider() {
	// init variables
	this.cursorX = 0;
	this.cursorY = 0;
	this.pressed = false;
	this.offset = {
		left: 0,
		top: 0
	};

	this.timer = new VideoTimer();

	var _this = this;
	document.onmousemove = function(e) { _this.onMouseMove(e) };
	document.onmousedown = function(e) { _this.onMouseDown(e); };
	document.onmouseup = function(e) { _this.onMouseUp(e); };
	window.onblur = function(e) { _this.onMouseUp(e); }; // mouse up can't be determined when window (tab) is not focused - the app acts unexpectedly
}

UserInputDataProvider.prototype.getCurrentCursorState = function() {
	return {
		x: this.cursorX,
		y: this.cursorY,
		pressure: this.pressed ? 1 : 0,
		time: this.timer.currentTime(),
		inside: this.inside(),
	};
}

UserInputDataProvider.prototype.correctMouseCoords = function(e) {
	if (e.pageX == undefined || e.pageY == undefined) {
		console.log("Wrong 'correctMouseCoords' parameter. Event data required.");
	}

	return {
		x: e.pageX - this.offset.left,
		y: e.pageY - this.offset.top
	};
}

UserInputDataProvider.prototype.inside = function() {
	return this.parent.isInside.call(this, this.cursorX, this.cursorY);
}

//
// User input
//  

UserInputDataProvider.prototype.onMouseMove = function(e) {
	var coords = this.correctMouseCoords(e);
	this.cursorX = coords.x;
	this.cursorY = coords.y;
	this.reportAction();
}

UserInputDataProvider.prototype.onMouseDown = function(e) {
	this.pressed = true;
	this.reportAction();
}

UserInputDataProvider.prototype.onMouseUp = function(e) {
	this.pressed = false;
	this.reportAction();
}

UserInputDataProvider.prototype.onMouseOver = function(e) {
	this.inside = true;
	this.reportAction();
}

UserInputDataProvider.prototype.onMouseOut = function(e) {
	this.inside = false;
	this.reportAction();
}