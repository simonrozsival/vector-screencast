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
	
	/**
	 * Creates a jQuery object representing a span element with classes specific for Twitter Bootstrap 3 icon.
	 * @param  {string} type Icon type - sufix of class name - "glyphicon-<type>". See http://bootstrapdocs.com/v3.2.0/docs/components#glyphicons for the list of icons.
	 * @return {object}      jQuery object, needs to be pushed into the DOM
	 */
	glyphicon: function(type) {
		return $("<span></span>").addClass("glyphicon glyphicon-" + type).attr("data-icon-type", type);
	},

	/**
	 * Changes icon type.
	 * @param  {object} jQuery icon object.
	 * @param  {[type]} type New icon type - glyphicon class sufix.
	 * @return {void}
	 */
	changeIcon: function(icon, type) {
		var old = icon.data("icon-type");
		icon.removeClass("glyphicon-" + old).addClass("glyphicon-" + type).data("icon-type", type);
	},

	/**
	 * Creates a jQuery object representing a button element with classes specific for Twitter Bootstrap 3 button.
	 * @param  {string} type Button type - suffix of class name - "btn-<type>". See http://bootstrapdocs.com/v3.2.0/docs/css/#buttons for list of button types.
	 * @return {[type]}      [description]
	 */
	button: function(type) {
		return $("<button></button>").addClass("btn btn-" + type).data("type", type);	
	},

	/**
	 * Changes icon type. *this* should be the jQuery object of the icon. Function useage: *UIFactory. changeIcon(icon, "new-type")*
	 * @param  {string} type New icon type - glyphicon class sufix.
	 * @return {void}
	 */
	changeButton: function(button, type) {
		return button.removeClass("btn-" + button.data("type")).addClass("btn-" + type).data("type", type);
	},

	//
	// Progress bars
	//

	/**
	 * Creates a jQuery object representing a div element with classes specific for Twitter Bootstrap 3 progress bar.
	 * @param  {string} type Progressbar type - suffix of class name - "progress-bar-<type>". See http://bootstrapdocs.com/v3.2.0/docs/css/#progressbars for list of button types.
	 * @return {[type]}      [description]
	 */
	progressbar: function(type, initialProgress) {
		return $("<div></div>")
					.addClass("progress-bar progress-bar-" + type)
					.attr("role", "progress-bar")
					.data("progress", initialProgress)
					.css("width", initialProgress + "%");
	},

	/**
	 * Changes progressbar type and progress.
	 * @param  {object} bar      Progress bar object.
	 * @param  {int} 	progress Progress in percents.
	 * @param  {int}	time     Time in milliseconds - how long will it take to animate the progress change.
	 * @return {void}
	 */
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

	/**
	 * Create canvas element with a cross on transparent background.
	 * @param  {int}	size  Width and height of the cross in pixels.
	 * @param  {string} color Css color atribute. Specifies the color of the cross.
	 * @return {DOMObject}    The cavnas element.
	 */
	createCursorCanvas:  function(size, color) {
		var canvas = document.createElement("canvas");
		canvas.width = size;
		canvas.height = size;
		var context = canvas.getContext("2d");
		var offset = size / 2;

		// draw the "+"
		context.lineWidth = size * 0.1; // 10% of the size is the line
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