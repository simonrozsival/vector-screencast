/**
 * Khanova Škola - vektorové video
 *
 * UI FACTORY OBJECT
 * This is a static object that helps creating common UI elements, as icons, buttons or progress bars.
 *
 * @author:		Šimon Rozsíval (simon@rozsival.com)
 * @project:	Vector screencast for Khan Academy (Bachelor thesis)
 * @license:	MIT
 */


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
			progress = Number(bar.data("progress")) + sign * number(progress.substr(1));
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

	//
	// Cursor cross ... -|-
	//

	createCursorCanvas:  function(size, color) {
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
	}

};