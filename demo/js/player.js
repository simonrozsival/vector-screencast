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
		playButtonId: "play",
		buttonContainer: "#button-container",
		progressBarContainer: "#progress-bar",
		timerContainer: "#video-time",
		progressbarRefreshPeriod: 30
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
	dataProvider.setOffset(this.canvas.offset());
	dataProvider.registerDataConsumer(this);
	this.dataProvider = dataProvider;

	// create a cursor
	this.cursor = new Cursor(this.board, 20, "white"); // @todo load or calculate these constants somehow
	var initState = dataProvider.getCurrentCursorState();
	this.cursor.moveTo(initState.x, initState.y);

	// progress information - default values
	this.playing = false;
	this.time = 0;

	this.prepareControls();
};

KhanAcademyPlayer.prototype.prepareControls = function() {

	// [1] playing button
	this.playButton = $("<button></button>").addClass("btn btn-success").attr("id", this.settings.playButtonId);
	var icon = $("<span></span>").addClass("glyphicon glyphicon-play");
	
	this.playButton.append(icon);
	$(this.settings.buttonContainer).append(this.playButton);		

	// [2] progress bar
	this.progressBar = $("<div></div>").addClass("progress-bar progress-bar-success").attr("role", "progress-bar");
	this.preloadedBar = $("<div></div>").addClass("progress-bar progress-bar-info");
	var progressBarContainer = $(this.settings.progressBarContainer);
	progressBarContainer.append(this.progressBar);
	progressBarContainer.append(this.preloadedBar);

	// [3] displayed time
	this.textSpan = $("<strong></strong>").addClass("time").attr("id", "current-time").text(secondsToString(this.time));
	this.videoLength = this.dataProvider.getMetaData().length;
	totalTime = $("<span></span>").addClass("time").attr("id", "total-time").text(millisecondsToString(this.videoLength));
	var timerContainer = $(this.settings.timerContainer);
	timerContainer.append(this.textSpan).append("<span>&nbsp;/&nbsp;</span>").append(totalTime);

};

KhanAcademyPlayer.prototype.replay = function() {
	this.drawer.clearAll(this.board.width(), this.board.height());
	this.time = 0;
	this.updateDisplayedTime(this.time);	

	var _this = this;
	setTimeout(function(){
		_this.dataProvider.rewind();
		_this.dataProvider.start();
		_this.runTimeCounter(_this.time);
		_this.playButton.children(".glyphicon").removeClass("glyphicon-play").removeClass("glyphicon-repeat").addClass("glyphicon-pause");
	}, 1000);
};

KhanAcademyPlayer.prototype.start = function () {
	// UI changes
	this.playButton.children(".glyphicon").removeClass("glyphicon-play").removeClass("glyphicon-repeat").addClass("glyphicon-pause");

	// start recording
	this.dataProvider.start();
	this.runTimeCounter(this.time);
};

KhanAcademyPlayer.prototype.onReachedEnd = function() {
	if(this.playing == true) {
		this.reachedEnd = true;
		this.playing = false;
		this.stop(true);
	}
}

KhanAcademyPlayer.prototype.stop = function (reachedEnd) {
	this.dataProvider.stop(reachedEnd);

	// inform the user about uploading that is in process
	var icon = this.playButton.children(".glyphicon");
  	icon.removeClass("glyphicon-pause");

	if(reachedEnd == false) { // do not inform the data provider if the stop was signaled by him
		icon.addClass("glyphicon-play"); // it is just paused
	} else {
		icon.addClass("glyphicon-repeat"); // it is just paused		
		this.updateDisplayedTime(this.videoLength); // make sure the progressbar goes to 100%
	}

	this.stopTimeCounter();
	//saveRecordedData(recorder);
};

KhanAcademyPlayer.prototype.getCanvas = function() {
	return this.canvas;
};

KhanAcademyPlayer.prototype.runTimeCounter = function(time) {
	this.time = time;
	this.textSpan.text(secondsToString(this.time));
	var _this = this;
	this.tick = setInterval(function() {	
		_this.time += _this.settings.progressbarRefreshPeriod;	
		_this.updateDisplayedTime(_this.time);
	}, this.settings.progressbarRefreshPeriod);
};

KhanAcademyPlayer.prototype.updateDisplayedTime = function(time) {
	console.log(time);

	var text = millisecondsToString(time);
	this.textSpan.text(text);

	var percents = time / this.videoLength * 100;
	this.progressBar.css("width", percents + "%");
}

KhanAcademyPlayer.prototype.stopTimeCounter = function() {
	clearInterval(this.tick);
};


KhanAcademyPlayer.prototype.startWhenReady = function() {

	//
	//
	
	var _this = this;
	
	//
	//

	$("body").on("click", "#" + this.settings.playButtonId, function(e) {
		e.preventDefault();
		var btn = $(this);

		// disable the button until the initialization is 
		btn.attr("disabled", "disabled");

		// toggle recording
		if(_this.playing == false) {
			if(_this.reachedEnd == false) {
				_this.start();
			} else {
				_this.replay();
			}
		} else {
			_this.stop(false);
		}

		_this.playing = !_this.playing;


		// the button can be pressed again
		btn.removeAttr("disabled");
	});
};


//
//
// PROCESS signals from the data provider
//
//

KhanAcademyPlayer.prototype.recieveNewState = function(state) {

	if(state == undefined) {
		console.log("No more data. Can't recieve new state.");
		return;
	}

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
