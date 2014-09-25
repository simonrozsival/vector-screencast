
var RecordingSettings = (function() {


	// javascript inheritance from BasicSettings (./basic-settings.js)
	RecordingSettings.prototype = BasicSettings;
	RecordingSettings.prototype.constructor = RecordingSettings;

	// private variables
	var settings = {
		pallete: {
			white: "#ffffff",
			yellow: "#fbff06"
		},
		widths: {
			narrow: 5, // in pixels!!
			normal: 15,
			wide: 25
		},
		defaultColor: "yellow",
		defaultSize: "normal",
		colorsPanel: undefined,
		brushSizesPanel: undefined
	};

	var currentSettings;
	

	function RecordingSettings(options) {

		$.extend(true, settings, options);

		// set settings before creating the panels - so default settings can by highlighted
		currentSettings = {
			color: settings.pallete[settings.defaultColor],
			brushSize: settings.widths[settings.defaultSize]
		};

		// create the panels for sellecting 
		preparePanels.call(this);
	}

	RecordingSettings.prototype.getCurrentSettings = function() {
		return settings;
	};


	var preparePanels = function() {
		if(settings.colorsPanel != undefined) {
			var panel = $(settings.colorsPanel);
			for (var color in settings.pallete) {
				var btn = addColorButton(panel, color, settings.pallete[color]);
			}

			// dynamically added elements, i have to attach the event to some other element - like the body, that is always present in a HTML document
			$("body").on("click", settings.colorsPanel + " button", function(e) {
				$(this).addClass("active").siblings().removeClass("active");
				settings.color = $(this).data("color");
			});
		}		

		// @todo the same with sizes
	};

	var addColorButton = function(panel, colorName, colorValue) {
		var btn = $("<button></button>").data("color", colorValue).css("background-color", colorValue).attr("title", colorName);
		if(colorValue == settings.color) {
			btn.addClass("active");
		}
		panel.append(btn);
	};

	return RecordingSettings;

})();
