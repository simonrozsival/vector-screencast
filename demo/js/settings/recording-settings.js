
// javascript inheritance from BasicSettings (./basic-settings.js)
RecordingSettings.prototype = BasicSettings;
RecordingSettings.prototype.constructor = RecordingSettings;

function RecordingSettings(options) {
	this.settings = {
		pallete: {
			white: "#ffffff",
			yellow: "#fbff06"
		},
		widths: {
			narrow: 1, // in pixels!!
			normal: 3,
			wide: 5
		},
		defaultColor: "yellow",
		defaultSize: "normal",
		colorsPanel: undefined,
		brushSizesPanel: undefined
	};

	$.extend(true, this.settings, options);

	// set settings before creating the panels - so default settings can by highlighted
	this.currentSettings = {
		color: this.settings.pallete[this.settings.defaultColor],
		brushSize: this.settings.widths[this.settings.defaultSize]
	};

	// create the panels for sellecting 
	this.preparePanels();
}

RecordingSettings.prototype.preparePanels = function() {
	if(this.settings.colorsPanel != undefined) {
		var panel = $(this.settings.colorsPanel);
		if(panel.exists()) {
			for (var color in this.settings.pallete) {
				this.addColorButton(panel, color, this.settings.pallete[color]);
			}

			var recordingSettings = this;
			// dynamically added elements, i have to attach the event to some other element - like the body, that is always present in a HTML document
			$("body").on("click", this.settings.colorsPanel + " button", function(e) {
				$(this).addClass("active").siblings().removeClass("active");
				recordingSettings.currentSettings.color = $(this).attr("data-color");
			});
		} 
	}		

	// @todo the same with sizes
};

RecordingSettings.prototype.addColorButton = function(panel, colorName, colorValue) {
	var btn = $("<button data-color='" + colorValue + "' style='background-color: " + colorValue + "' title='"+ colorName +"'></button>");
	if(colorValue == this.currentSettings.color) {
		btn.addClass("active");
	}
	panel.append(btn);
};

