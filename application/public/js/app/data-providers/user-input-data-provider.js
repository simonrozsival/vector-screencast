
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
	var lastState;


	function UserInputDataProvider() {
		document.onmousemove = function(e) { onMouseMove(e) };
		document.onmousedown = function(e) { onMouseDown(e); };
		document.onmouseup = function(e) { onMouseUp(e); };
		window.onblur = function(e) { onMouseUp(e); }; // mouse up can't be determined when window (tab) is not focused - the app acts unexpectedly

		init();
	}

	/**
	 * Return current cursor state in time.
 	 * @returns {State}
	 */
	var getCurrentCursorState = function() {
		return new State({
			x: cursor.x,
			y: cursor.y,
			pressure: getPressure(),
			time: timer.currentTime()
		});
	};

	var getPressure = function() {
		if(penApi && penApi.pointerType == 1) { // 1 == PEN, 0 == MOUSE, 3 == ERASER
			return penApi.pressure; // pressure is from 0.0 to 1.0 - in percent
		} else {
			return state.mouseDown ? 1 : 0;
		}
	};

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

		VideoEvents.on("canvas-container-ready", function(e, canvasContainer) {
			var rect = canvasContainer.getBoundingClientRect();
			offset = {
				top: rect.top,
				left: rect.left
			};
		});

		VideoEvents.on("start", start);
		VideoEvents.on("continue", start);
		VideoEvents.on("pause", pause);
		VideoEvents.on("stop", pause);

		// is Wacom tablet ready?
		VideoEvents.on("wacom-plugin-ready", function(e, plugin) {
			console.log("Wacom plugin: ", plugin.version);
			if(!!plugin === true // plugin is 'undefined' if the tablet isn't installed or plugged in
				&& !!plugin.version === true) {
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
		if(action != undefined) {
			VideoEvents.trigger("new-state", action);
		}
	};

	//
	// User input
	//  

	var onMouseMove = function(e) {
		if(state.running) {		
			cursor = correctMouseCoords.call(this, e);
			var current = getCurrentCursorState();
			reportAction(current);
			lastState = current;
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