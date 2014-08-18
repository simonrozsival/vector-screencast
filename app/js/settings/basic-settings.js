
var BasicSettings = (function() {

	var settings = {
		color: "#fbff06", // yellow
		brushSize: 3
	};

	function BasicSettings(options) {
		$.extend(true, settings, options);

		VideoEvents.on("color-change", function(e, color) {
			setColor(color);
		});

		VideoEvents.on("brush-size-change", function(e, size) {
			setSize(size);
		});
	}

	var setColor = function(color) {
		settings.color = color;
	};

	var setSize = function(size) {
		settings.size = size;
	};

	BasicSettings.prototype.getCurrentSettings = function() {
		return settings;
	};


	return BasicSettings;

})();