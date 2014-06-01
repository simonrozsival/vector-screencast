/**
 * Khanova Škola - vektorové video
 *
 * THE VIDEO PLAYER OBJECT
 * This is the base stylesheet that contains the basic layout and appearance of the board.
 *
 * @author:		Šimon Rozsíval (simon@rozsival.com)
 * @project:	Vector screencast for Khan Academy (Bachelor thesis)
 * @license:	MIT
 */

function KhanAcademyPlayer (boardEl, Raphael) {

	// init variables to default values
	this.board = boardEl;
	this.painting = false;
	this.inside = false;

	// init canvas
	this.boardCanvas = Raphael(boardEl, boardEl.width(), boardEl.height());
	this.ox = board.offsetLeft;
	this.oy = board.offsetTop;

	// init microphone
};

KhanAcademyPlayer.prototype.start = function () {
	player = this;
	window.onmousemove = function(e) {
		console.log("move");
		player.setPosition(e.clientX, e.clientY);
	};
	window.onmousedown = function(e) {
		player.storePosition();
		player.painting = true;
	};
	window.onmouseup = function(e) {
		console.log("up");
		//player.painting = false;
	};
	player.board.on("mouseout", function(e) {
		console.log("out");
		player.mouseOut(e);
	});
	player.board.onmouseover = function(e) {
		console.log("over");
		player.mouseOver();
	};


	this.tick = setInterval(function() {
		if(player.painting && player.inside) {
			player.draw();
		}
	}, 10);
};

KhanAcademyPlayer.prototype.stop = function () {
	clearInterval(this.tick);
};

KhanAcademyPlayer.prototype.mouseMove = function(e) {
	this.setPosition(e.clientX, e.clientY);
};

KhanAcademyPlayer.prototype.mouseDown = function(e) {
	this.storePosition();
	this.painting = true;
};

KhanAcademyPlayer.prototype.mouseUp = function() {
	this.painting = false;
};

KhanAcademyPlayer.prototype.mouseOut = function(e) {
	if(this.painting == true) {
		this.setPosition(e.clientX, e.clientY);
		this.draw();
	}

	this.inside = false;
};

KhanAcademyPlayer.prototype.mouseOver = function() {
	if(this.inside == false) {
		this.storePosition();
	}

	this.inside = true;
};

KhanAcademyPlayer.prototype.setPosition = function(absoluteX, absoluteY) {
	this.x = absoluteX-this.ox;
	this.y = absoluteY-this.oy;
};

KhanAcademyPlayer.prototype.storePosition = function() {
	this.fromX = this.x;
	this.fromY = this.y;
};

KhanAcademyPlayer.prototype.draw = function() {
	var segment = this.boardCanvas.path(Raphael.format("M{0};{1}L{2};{3}", this.fromX, this.fromY, this.x, this.y));	
	segment.attr({fill: '#FAF31E', stroke: '#FAF31E', 'stroke-width': 3});
	this.storePosition();								
};