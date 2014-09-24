
var Tester = (function() {

	// "constants"
	var success = "success";
	var fail = "danger";
	var log = "info"; 
	// ^ these are bootstrap 3 alert classes

	function Tester($container) {
		this.resultBox = initHtmlStructure.call(this, $container);
		this.resultsCount = 0;
		this.reportedMsgs = [];
	}

	//
	// private functions section:
	// 
	
	var initHtmlStructure = function($container) {
		// prepare html (requires Bootstrap 3 css linked)
		var $row = $("<div></div>").addClass("row");
		var $col = $("<div></div>").addClass("col-xs-12");
		var $title = $("<h2>Test result</h2>");
		var $p = $("<p>Please do not interact with the UI until the test is over to avoid breaching the results.</p>");
		var $resultBox = $("<div></div>").addClass("well");
		
		// insert created elements into the document
		$col.append($title).append($p).append($resultBox);
		$row.append($col);
		$container.append($row);

		return $resultBox;
	};

	var reportMsg = function(status, msg) {
		// don't log one test result twice! (e.g. play/pause/play -> play is trigerred twice in auido test)
		if(status == log || this.reportedMsgs.indexOf(msg) == -1) {
	 		var $alertbox = $("<p></p>").addClass("alert alert-" + status).html(msg);
			this.resultBox.append($alertbox);
			//$alertbox.hide().fadeIn();

			// update the stats
			if(status != log) {
				this.resultsCount++;
				this.reportedMsgs.push(msg);
			}
		}
	};
	


	// 
	// public functions section:	
	// 

	Tester.prototype.start = function(expectedResultsCount, timeLimit) {
		if(timeLimit == undefined) {
			timeLimit = 1000; // 1s
		}

		var _this = this;
		setTimeout(function(){
			if(_this.resultsCount == expectedResultsCount) {
				_this.reportSuccess.call(_this, "All tests were run (" + _this.resultsCount + " of " + expectedResultsCount + ").");
			} else {
				_this.reportError.call(_this, "Not all tests were run before max time limit exceeded (" + _this.resultsCount + " of " + expectedResultsCount + ").");
			}
		}, timeLimit);
	};

	Tester.prototype.reportSuccess = function(msg) {
		reportMsg.call(this, success, msg);
	};

	Tester.prototype.reportError = function(msg) {
		reportMsg.call(this, fail, msg);
	};

	Tester.prototype.log = function(msg) {
		reportMsg.call(this, log, "(" + msg + ")");
	};
	

	return Tester;

})();