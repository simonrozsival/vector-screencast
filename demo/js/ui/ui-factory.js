
var UIFactory = {
	
	glyphicon: function(type) {
		return $("<span></span>").addClass("glyphicon glyphicon-" + type).attr("data-icon-type", type);
	},

	changeIcon: function(type) {
		var icon = this;
		var old = icon.data("icon-type");
		icon.removeClass("glyphicon-" + old).addClass("glyphicon-" + type).data("icon-type", type);
	},

	button: function(type) {
		return $("<button></button>").addClass("btn btn-" + type).data("type", type);	
	},

	changeButton: function(button, type) {
		return button.removeClass("btn-" + button.data("type")).addClass("btn-" + type).data("type", type);
	},

	//
	// Progress bars
	//

	progressbar: function(type, initialProgress) {
		return $("<div></div>")
					.addClass("progress-bar progress-bar-" + type)
					.attr("role", "progress-bar")
					.data("progress", initialProgress)
					.css("width", initialProgress + "%");
	},

	changeProgress: function(bar, progress, time) {

		// the progress might be
		var first = progress.toString()[0];
		if(first == "+" || first == "-") {			
			var sign = first == "+" ? 1 : -1;
			progress = number(bar.data("progress")) + sign * number(progress.substr(1));
		};

		bar.stop(); // stop any animation that is in progress
		if (time == undefined) {
			bar.css("width", progress + "%");
		} else {
			// time is defined - animate the progress
			bar.animate({
				width: progress + "%",
			}, time, "linear");
		}

		bar.data("progress", progress);
	},

};