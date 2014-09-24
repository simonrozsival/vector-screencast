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


var RoundedLines = (function() {

	// private variables
	var canvas, context;
	var last = {
		x: 0,
		y: 0,
		radius: 0
	};

	// dimensions of the board
	var board = {
		width: 0,
		height: 0
	};

	// current settings - color and size
	var settings;

	function RoundedLines(settingsObject) {

		VideoEvents.on("canvas-ready", function(e, $canvas) {
			canvas = $canvas[0];
			context = canvas.getContext("2d");
			board.width = $canvas.width();
			board.height = $canvas.height();
		});

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
		var radius = calculateRadius(pressure);
		drawDot(x, y, radius);

		// save the data
		last.x = x;
		last.y = y;
		last.radius = radius;
	};

	var continueLine = function(x, y, pressure) {
		var radius = calculateRadius(pressure);
		drawSegment.call(this, x, y, radius);

		// save the data
		last.x = x;
		last.y = y;
		last.radius = radius;
	};

	var calculateRadius = function(pressure) {
		return (pressure * current().brushSize) / 2;
	};

	var current = function() {
		return settings.getCurrentSettings();
	};

	var drawDot = function(x, y, radius) {		
		var c = context;

		// load current settings
		c.fillStyle = current().color;

		// draw a dot
		c.beginPath();
		c.arc(x, y, radius, 0, Math.PI*2, true); 
		c.closePath();
		c.fill();
	};

	var drawSegment = function(x, y, radius) {
		var c = context;

		var current = settings.getCurrentSettings();
		c.strokeStyle = current.color;

		// draw path from the prev point to this one
		c.beginPath();

		var points = calculatePathPoints(x, y, radius);
		var start = points.shift();
		c.moveTo(start.x, start.y);
		for(i in points) {		
			var point = points[i];
			c.lineTo(point.x, point.y);
		}
		c.closePath();
		c.fill();

		drawDot(x, y, radius);
	};

	var calculatePathPoints = function(x, y, radius) {

		// calculate the normal vector and normalise it
		var normalVector = {
			x: last.y - y,
			y: x - last.x
		};
		var norm = Math.sqrt(normalVector.x*normalVector.x + normalVector.y*normalVector.y);
		normalVector.x /= norm;
		normalVector.y /= norm;

		return [
			// A' point
			{
				x: last.x + normalVector.x*last.radius,
				y: last.y + normalVector.y*last.radius
			},
			// A"
			{
				x: last.x - normalVector.x*last.radius,
				y: last.y - normalVector.y*last.radius
			},
			// B"
			{
				x: x - normalVector.x*radius,
				y: y - normalVector.y*radius
			},
			// B'
			{
				x: x + normalVector.x*radius,
				y: y + normalVector.y*radius
			}
		];
	};

	var endLine = function(x, y, pressure) {
		// don't draw anything - segment ends with a dot..
		lastNormalVector = {x: 0, y: 0};
	};

	var clearAll = function() {
		context.clearRect(0, 0, board.width, board.height);
	};


	return RoundedLines;
})();
