

function BasicSettings(options) {
	this.currentSettings = {
		color: "#fbff06", // yellow
		brushSize: 3
	}

	$.extend(true, this.currentSettings, options);
}

BasicSettings.prototype.setColor = function(color) {
	this.currentSettings.color = color;
};

BasicSettings.prototype.setSize = function(size) {
	this.currentSettings.size = size;
};

BasicSettings.prototype.getCurrentSettings = function() {
	return this.currentSettings;
};