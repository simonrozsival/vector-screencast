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

function Cursor(board, size, color) {
	var canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	canvas.id = "video-cursor"
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

	// position the cursor
	canvas.style.position = "absolute";
	canvas.style.background = "transparent";
	board.append(canvas);
	board.addClass("no-pointer");
	this.element = canvas;
	this.offset = offset;
}

Cursor.prototype.moveTo = function (x, y) {
	this.element.style.left = (x - this.offset) + "px";
	this.element.style.top = (y - this.offset) + "px";
}