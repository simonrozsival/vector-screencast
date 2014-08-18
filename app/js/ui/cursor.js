/**
 * Khanova Škola - vektorové video
 *
 * CURSOR OBJECT
 * This object represents the cursor and provides functions for moving the cursor
 *
 * @author:		Šimon Rozsíval (simon@rozsival.com)
 * @project:	Vector screencast for Khan Academy (Bachelor thesis)
 * @license:	MIT
 */

var Cursor = (function(){

	function Cursor(board, size, color) {
		var canvas = createElement.call(this, size, color);

		// position the cursor
		board.append(canvas);
		this.element = canvas;
		this.offset = size / 2;

		// move the cursor whenever a new state is available
		var _this = this;
		$("body").on("video/new-state", function(e, state) {
			if(state != undefined) {
				moveTo.call(_this, state.x, state.y);
			}
		});
	}

	var createElement = function(size, color) {
		var canvas = document.createElement("canvas");
		canvas.width = size;
		canvas.height = size;
		var context = canvas.getContext("2d");
		var offset = size / 2;

		// draw the "+"
		context.lineWidth = size * 0.1; // 10% of the size
		context.strokeStyle = color;
		context.beginPath();

		// vertical line
		context.moveTo(offset, 0);
		context.lineTo(offset, size);

		// horizontal line
		context.moveTo(0, offset);
		context.lineTo(size, offset);

		context.stroke();
		context.closePath();

		// I want to move the cursor to any point and the stuff behind the cursor must be visible
		canvas.style.position = "absolute";
		canvas.style.background = "transparent";

		return canvas;
	};

	var moveTo = function (x, y) {
		this.element.style.left = (x - this.offset) + "px";
		this.element.style.top = (y - this.offset) + "px";
	};

	return Cursor;
})();