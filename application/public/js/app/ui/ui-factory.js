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
	 * Creates a jQuery object representing a button element with classes specific for Twitter Bootstrap 3 button.
	 * @param  {string} type Button type - suffix of class name - "btn-<type>". See http://bootstrapdocs.com/v3.2.0/docs/css/#buttons for list of button types.
	 * @return {HTMLElement} Button element
	 */
	button: function(type) {
		return HTML.createElement("button", { class: "btn btn-" + type, "data-type": type });
	},

	/**
	 * Changes icon type. *this* should be the jQuery object of the icon. Function useage: *UIFactory. changeIcon(icon, "new-type")*
	 * @param  {string} type New icon type - glyphicon class sufix.
	 * @return {HTMLElement}
	 */
	changeButton: function(button, type) {
		HTML.setAttributes(button, {
			class: "btn btn-" + type,
			"data-type": type
		});

		return button
	},

	//
	// Progress bars
	//

	/**
	 * Creates a jQuery object representing a div element with classes specific for Twitter Bootstrap 3 progress bar.
	 * @param  {string} type Progressbar type - suffix of class name - "progress-bar-<type>". See http://bootstrapdocs.com/v3.2.0/docs/css/#progressbars for list of button types.
	 * @return {HTMLElement} Progressbar
	 */
	progressbar: function(type, initialProgress) {
		return HTML.createElement("div", {
			class: "progress-bar progress-bar-" + type,
			"data-progress": initialProgress,
			css: "width: " + initialProgress + "%",
			role: "progress-bar"
		});
	},

	/**
	 * Changes progressbar type and progress.
	 * @param  {object} bar      Progress bar object.
	 * @param  {string}	progress Progress in percents.
	 * @param  {int}	time     Time in milliseconds - how long will it take to animate the progress change.
	 * @return {void}
	 */
	changeProgress: function(bar, progress, time) {

		// the progress might be
		var first = progress.innerHTML[0];
		if(first === "+" || first === "-") {
			var sign = first === "+" ? 1 : -1;
			progress = Number(bar.getAttribute("data-progress")) + sign * Number(progress.substr(1));
		};

		bar.stop(); // stop any animation that is in progress
		if (time == undefined) {
			bar.style.width = progress + "%";
		} else {
			// time is defined - animate the progress
			bar.style.transitionDuration = (time / 1000) + "s";
			bar.style.width = progress + "%";
		}

		bar.setAttribute("data-progress", progress);
	},

	//
	// Cursor cross ... -|-
	//

	/**
	 * Create canvas element with a cross on transparent background.
	 * @param  {int}	size  Width and height of the cross in pixels.
	 * @param  {string} color Css color atribute. Specifies the color of the cross.
	 * @return {Element}    The SVG element.
	 */
	createCursorCanvas:  function(size, color) {
		var canvas = SVG.createElement("svg", {
			width: size,
			height: size
		});
		var offset = size / 2;

		// draw the "+"
		var path = SVG.createElement("path", {
			fill: "transparent",
			stroke: color,
			"stroke-width": size * 0.1,
			d: "M " + offset + ",0 L " + offset + "," + size + " M 0," + offset + " L " + size + "," + offset + " Z"
		});
		canvas.appendChild(path);

		// I want to move the cursor to any point and the stuff behind the cursor must be visible
		canvas.style.position = "absolute";
		canvas.style.background = "transparent";

		return canvas;
	}

};