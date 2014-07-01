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

	var defaults = {
		recButtonId: "rec",
		saveButtonId: "save",
		buttonContainer: "#rec-button-container"
	};

	$.extend(defaults, options);

	this.parent.init(defaults, drawer, dataProvider);

	// cursor & drawn segments history
	this.cursorMovement = [];	
	this.recording = false;
	this.time = 0;

	// init canvas
	this.context = this.canvas[0].getContext("2d");

	// init microphone
	// @todo: learn how to and implement it...
	// 
};

KhanAcademyPlayer.prototype.prepareControls = function() {

	// recording button
	var recButton = $("<button></button>").addClass("btn btn-danger").attr("id", this.settings.recButtonId);
	var icon = $("<span></span>").addClass("glyphicon glyphicon-record");
	var textSpan = $("<span>REC</span>");
	recButton.append(icon).append(textSpan);
	this.recButton = recButton;

	// save button
	var saveButton = $("<button></button>").addClass("btn btn-default").attr("id", this.settings.saveButtonId).attr("disabled", "disabled");
	var saveIcon = $("<span></span>").addClass("glyphicon glyphicon-upload");
	var textUpload = $("<span>SAVE</span>");
	saveButton.append(saveIcon).append(textUpload);
	this.saveButton = saveButton;

	// add them to the DOM
	var container = $(this.settings.buttonContainer);
	container.append(recButton);
	container.append(saveButton);		

	// I will change to time
	this.textSpan = textSpan;
};

KhanAcademyRecorder.prototype.updateDisplayedTime = function(time) {
	this.textSpan.text(millisecondsToString(time));
};

KhanAcademyRecorder.prototype.start = function() {
	// update the UI
	$("#board-canvas").addClass("active");
	this.recButton.children(".glyphicon").removeClass("glyphicon-record").addClass("glyphicon-stop");

	// start recording
	this.dataProvider.registerDataConsumer(this);
	this.dataProvider.start();
	this.runTimeCounter(this.time);
};

KhanAcademyRecorder.prototype.stop = function() {
	$(this).children(".glyphicon");

	this.stopTimeCounter();
	//saveRecordedData(recorder);

	// inform the user that uploading has finished and he can record again
	this.recButton.children(".glyphicon").removeClass("glyphicon-upload").addClass("glyphicon-record");
	this.saveButton.removeAttr("disabled");
	$("#board-canvas").removeClass("active");
};

KhanAcademyRecorder.prototype.startWhenReady = function() {

	//
	//
	
	var _this = this;
	
	//
	//
	
	this.time = 0;

	$("body").on("click", "#" + this.settings.recButtonId, function(e) {
		e.preventDefault();

		// disable the button until the initialization is 
		$(this).attr("disabled", "disabled");

		// toggle recording
		_this.recording == false ? _this.start() : _this.stop();
		_this.recording = !_this.recording;


		// the button can be pressed again
		$(this).removeAttr("disabled");
	});
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
