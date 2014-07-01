/**
* Khanova Škola - vektorové video
*
* THE VIDEO RECORDER OBJECT
* This is the base stylesheet that contains the basic layout and appearance of the board.
*
* @author:		Šimon Rozsíval (simon@rozsival.com)
* @project:	Vector screencast for Khan Academy (Bachelor thesis)
* @license:	MIT
*/

KhanAcademyRecorder.prototype = new KhanAcademyPlayer();
KhanAcademyRecorder.prototype.parent = KhanAcademyPlayer.prototype;
KhanAcademyRecorder.prototype.constructor = KhanAcademyRecorder;

function KhanAcademyRecorder (options, drawer, dataProvider) {

	this.parent.init(options, drawer, dataProvider);

	// cursor & drawn segments history
	this.cursorMovement = [];
	

	// init canvas
	this.context = this.canvas[0].getContext("2d");


	// init microphone
	// @todo: learn how to and implement it...
	
};

KhanAcademyRecorder.prototype.start = function () {
	this.recording = true;
};

KhanAcademyRecorder.prototype.stop = function () {
	this.painting = false;
	this.recording = false;
};

//
//
// PROCESS signals from the data provider
//
//

KhanAcademyRecorder.prototype.recieveNewState = function(state) {
	if(this.recording == true) {

		this.parent.recieveNewState(state);

	}
};
