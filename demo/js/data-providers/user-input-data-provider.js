
var UserInputDataProvider = (function() {

	// private variables
	var running = false;
	var offset;
	var pressed = false;
	var cursorX = 0;
	var cursorY = 0;
	var timer = new VideoTimer();


	function UserInputDataProvider(canvasOffset) {
		offset = canvasOffset;
		
		document.onmousemove = function(e) { onMouseMove(e) };
		document.onmousedown = function(e) { onMouseDown(e); };
		document.onmouseup = function(e) { onMouseUp(e); };
		window.onblur = function(e) { onMouseUp(e); }; // mouse up can't be determined when window (tab) is not focused - the app acts unexpectedly

		init();
	}

	var getCurrentCursorState = function() {
		return {
			x: cursorX,
			y: cursorY,
			pressure: pressed ? 1 : 0,
			time: timer.currentTime()
		};
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
	

	var ready = function() {
		VideoEvents.trigger("data-ready");
	};

	var init = function() {
		VideoEvents.on("start", function() {
			start();
		});

		VideoEvents.on("pause", function() {
			pause();
		});
	};

	var start = function() {
		running = true;
		timer.resetTimer();
	};

	var pause = function() {
		running = false;
	};

	var reportAction = function(state) {
		if(state != undefined && state != {}) {
			VideoEvents.trigger("new-state", state);
		}
	};

	//
	// User input
	//  

	var onMouseMove = function(e) {
		if(running) {		
			var coords = correctMouseCoords.call(this, e);
			cursorX = coords.x;
			cursorY = coords.y;
			reportAction(getCurrentCursorState());
		}
	};

	var onMouseDown = function(e) {
		if(running) {		
			pressed = true;
			reportAction(getCurrentCursorState());
		}
	};

	var onMouseUp = function(e) {
		if(running) {
			pressed = false;
			reportAction(getCurrentCursorState());
		}
	};

	return UserInputDataProvider;

})();