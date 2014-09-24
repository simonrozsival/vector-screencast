/**
 * Khanova Škola - vektorové video
 *
 * CURSOR OBJECT
 * This object represents the cursor and provides functions for moving the cursor
 *
 * @author:		Šimon Rozsíval (simon@rozsival.com)
 * @project:	Vector screencast for Khan Academy (Bachelor thesis)
 * @license:	MIT
 */

var Cursor = (function(){

	var settings = {
		size: 20,
		color: "#fff"
	};

	function Cursor(options) {
		// load the settings
		$.extend(true, settings, options);

		// position the cursor
		this.element = UIFactory.createCursorCanvas.call(this, settings.size, settings.color);
		this.offset = settings.size / 2;

		// move the cursor whenever a new state is available
		var _this = this;
		$("body").on("video/new-state", function(e, state) {
			if(state != undefined) {
				moveTo.call(_this, state.x, state.y);
			}
		});
	}

	var moveTo = function (x, y) {
		this.element.style.left = (x - this.offset) + "px";
		this.element.style.top = (y - this.offset) + "px";
	};

	return Cursor;

})();