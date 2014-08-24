/**
 * Khanova Škola - vektorové video
 *
 * BASIC LINE DRAWING OBJECT
 * This is the base script containing basic line drawing
 *
 * @author:		Šimon Rozsíval (simon@rozsival.com)
 * @project:	Vector screencast for Khan Academy (Bachelor thesis)
 * @license:	MIT
 */


var SimpleLines = (function() {

	// private variables
	var canvas, context;
	var x = 0, y = 0, pressure = 0;
	var width, height;
	var settings;

	function SimpleLines($canvas, settingsObject) {

		// $canvas is a jQuery object
		canvas = $canvas[0];
		context = canvas.getContext("2d");
		this.settings = settings;
		width = $canvas.width();
		height = $canvas.height();
		settings = settingsObject;

		// attach events
		var _this = this;
		VideoEvents.on("rewind", function() {
			clearAll();
		});

		var lastState = { x: this.x, y: this.y, pressure: this.pressure, inside: true };
		VideoEvents.on("new-state", function(e, state) {
			if(state.pressure > 0) {
				//if(state.inside == true || lastState.inside == true) {
					if(lastState.pressure == 0
						) {//|| lastState.inside == false) {
						startLine.call(_this, state.x, state.y, state.pressure);
					} else {
						continueLine.call(_this, state.x, state.y, state.pressure);
					}
				//}
			} else if (lastState.pressure > 0) {
				endLine.call(_this, state.x, state.y);
			}

			// save this state for next time
			lastState = state;
		});

		VideoEvents.on("skip-to", function(e, progress) {

		});

	};

	var startLine = function(x, y, pressure) {
		drawDot(x, y, pressure);

		// save the data
		this.x = x;
		this.y = y;
	};

	var continueLine = function(x, y, pressure) {
		drawSegment.call(this, x, y, pressure);

		// save the data
		this.x = x;
		this.y = y;
	};

	var drawDot = function(x, y, pressure) {		
		var c = context;

		// load current settings
		var current = settings.getCurrentSettings();
		var radius = (current.brushSize * pressure) / 2;
		c.fillStyle = current.color;

		// draw a dot
		c.beginPath();
		c.arc(x, y, radius, 0, Math.PI*2, true); 
		c.closePath();
		c.fill();
	};

	var drawSegment = function(x, y, pressure) {
		var c = context;

		var current = settings.getCurrentSettings();
		c.lineWidth = current.brushSize * pressure;
		c.strokeStyle = current.color;

		// draw path from the prev point to this one
		c.beginPath();
		c.moveTo(this.x, this.y);
		c.lineTo(x, y);
		c.stroke();
		c.closePath();
	};

	var endLine = function(x, y, pressure) {
		drawDot(x, y, pressure);
	};

	var clearAll = function() {
		context.clearRect(0, 0, width, height);
	};


	return SimpleLines;
})();
