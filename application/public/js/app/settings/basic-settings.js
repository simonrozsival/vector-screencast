
var BasicSettings = (function() {

	var settings = {
		color: "",
		brushSize: 0,
		correctionRatio: 1
	};

	function BasicSettings(options) {
		$.extend(true, settings, options);

		VideoEvents.on("new-board-correction-ratio", function(e, ratio) {
			var originalSize = settings.brushSize / settings.correctionRatio;
			settings.brushSize = originalSize * ratio;
		});

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
		settings.brushSize = size;
	};

	BasicSettings.prototype.getCurrentSettings = function() {
		return settings;
	};


	return BasicSettings;

})();