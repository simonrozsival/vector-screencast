
var UserInputDataProvider = (function() {

	// private variables	
	var state = {
		running: false,
		mouseDown: false
	};

	var offset;

	// cursor position
	var cursor = {
		x: 0,
		y: 0
	};
	var timer;
	var penApi = false;


	function UserInputDataProvider() {
		document.onmousemove = function(e) { onMouseMove(e) };
		document.onmousedown = function(e) { onMouseDown(e); };
		document.onmouseup = function(e) { onMouseUp(e); };
		window.onblur = function(e) { onMouseUp(e); }; // mouse up can't be determined when window (tab) is not focused - the app acts unexpectedly

		init();
	}

	var getCurrentCursorState = function() {
		return {
			x: cursor.x,
			y: cursor.y,
			pressure: getPressure(),
			time: timer.currentTime()
		};
	};

	var getPressure = function() {
		if(penApi && penApi.pointerType == 1) { // 1 == PEN, 0 == MOUSE, 3 == ERASER
			return penApi.pressure; // pressure is from 0.0 to 1.0 - in percent
		} else {
			return state.mouseDown ? 1 : 0;
		}
	}

	var correctMouseCoords = function(e) {
		if (e.pageX == undefined || e.pageY == undefined) {
			console.log("Wrong 'correctMouseCoords' parameter. Event data required.");
		}

		return {
			x: e.pageX - offset.left,
			y: e.pageY - offset.top
		};
	};

	// 
	// Events
	//
	
	var init = function() {
		timer = new VideoTimer();

		VideoEvents.on("canvas-ready", function(e, canvas) {
			offset = canvas.offset();
		});

		VideoEvents.on("start", function() {
			start();
		});

		VideoEvents.on("pause", function() {
			pause();
		});

		// is Wacom tablet ready?
		VideoEvents.on("wacom-plugin-ready", function(e, $plugin) {
			var plugin = $plugin[0];
			if(plugin.version != undefined) {
				console.log("Wacom tablet is connected and plugin installed. Plugin version is " + plugin.version + ".");
				penApi = plugin.penAPI;
			}
		});
	};

	var start = function() {
		state.running = true;
		timer.resetTimer();
	};

	var pause = function() {
		state.running = false;
	};

	var reportAction = function(action) {
		if(action != undefined && action != {}) {
			VideoEvents.trigger("new-state", action);
		}
	};

	//
	// User input
	//  

	var onMouseMove = function(e) {
		if(state.running) {		
			cursor = correctMouseCoords.call(this, e);
			reportAction(getCurrentCursorState());
		}
	};

	var onMouseDown = function(e) {
		if(state.running) {		
			state.mouseDown = true;
			reportAction(getCurrentCursorState());
		}
	};

	var onMouseUp = function(e) {
		if(state.running) {
			state.mouseDown = false;
			reportAction(getCurrentCursorState());
		}
	};

	return UserInputDataProvider;

})();