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
	$(this.settings.buttonContainer).append(recButton);		

	this.textSpan = textSpan;

}

KhanAcademyRecorder.prototype.startWhenReady = function() {

	//
	//
	
	var _this = this;
	
	//
	//
	
	this.time = 0;

	var startRecording = function() {
		// update the UI
		$("#board-canvas").addClass("active");
		$(this).children(".glyphicon").removeClass("glyphicon-record").addClass("glyphicon-stop");

		// start recording
		_this.clearAll();
		_this.dataProvider.registerDataConsumer(_this);
		_this.dataProvider.start();
		_this.runTimeCounter(_this.time);
	};

	var stopRecording = function() {
		// inform the user about uploading that is in process
		$(this).removeClass("btn-danger").addClass("btn-default")
				.children(".glyphicon").removeClass("glyphicon-stop").addClass("glyphicon-upload");

		_this.stopTimeCounter();
		//saveRecordedData(recorder);

		// inform the user that uploading has finished and he can record again
		$(this).removeClass("btn-default").addClass("btn-danger")
				.children(".glyphicon").removeClass("glyphicon-upload").addClass("glyphicon-record");
		$("#board-canvas").removeClass("active");
	};

	$("body").on("click", "#" + this.settings.recButtonId, function(e) {
		e.preventDefault();

		// disable the button until the initialization is 
		$(this).attr("disabled", "disabled");

		// toggle recording
		_this.recording == false ? startRecording() : stopRecording();
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
