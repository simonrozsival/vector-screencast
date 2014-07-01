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

function KhanAcademyPlayer() {}

KhanAcademyPlayer.prototype.init = function(options, drawer, dataProvider) {

	this.settings = {
		board: "#khan-academy-board",
		canvas: "#khan-academy-board canvas",
	};

	$.extend(true, this.settings, options);

	// board data
	this.board = $(this.settings.board); 

	// init variables to default values
	this.canvas = $(this.settings.canvas);

	// Drawer is the object that takes care of drawing lines.
	this.drawer = drawer;

	// init the data provider
	// - register as a data consumer to the data provider
	dataProvider.registerDataConsumer(this);
	dataProvider.setOffset(this.canvas.offset());
	this.dataProvider = dataProvider;

	// create a cursor
	this.cursor = new Cursor(this.board, 20, "white"); // @todo load or calculate these constants somehow
	var initState = dataProvider.getCurrentCursorState();
	this.cursor.moveTo(initState.x, initState.y);
	this.playing = false;

};

KhanAcademyPlayer.prototype.start = function () {
	this.playing = true;
	this.dataProvider.start();
};

KhanAcademyPlayer.prototype.stop = function () {
	this.painting = false;
	this.recording = false;
};

KhanAcademyPlayer.prototype.getCanvas = function() {
	return this.canvas;
}

//
//
// PROCESS signals from the data provider
//
//

KhanAcademyPlayer.prototype.recieveNewState = function(state) {

	// [1] set the cursor
	this.cursor.moveTo(state.x, state.y);

	// [2] draw a segment if the button is pressed and the cursor
	// is inside the recording area or it has just left the area
	if(state.pressure > 0) {

		if(state.inside == true || this.lastState.inside == true) {

			if(this.lastState == undefined // the very first state
				|| this.lastState.pressure == 0
				|| this.lastState.inside == false) {

				this.drawer.startLine(state.x, state.y, state.pressure);
			} else {
				this.drawer.drawSegment(state.x, state.y, state.pressure);
			}

		}

	} else if (this.lastState !== undefined && this.lastState.presure > 0) {
		this.darwer.endLine(state.x, state.y);
	}

	// save this state for next time
	this.lastState = state;

};


//
//
// HELPER methods
//
//

KhanAcademyPlayer.prototype.clearAll = function() {
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
}
