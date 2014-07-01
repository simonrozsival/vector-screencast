/**
 * Khanova Škola - vektorové video
 *
 * BASIC LINE DRAWING OBJECT
 * This is the base script containing basic line drawing
 *
 * @author:		Šimon Rozsíval (simon@rozsival.com)
 * @project:	Vector screencast for Khan Academy (Bachelor thesis)
 * @license:	MIT
 */


function BasicLineDrawer($canvas, settings) {

	// $canvas is a jQuery object
	var canvas = $canvas[0];

	this.context = canvas.getContext("2d");
	this.x = 0;
	this.y = 0;
	this.pressure = 0;
	this.settings = settings;

}

BasicLineDrawer.prototype.startLine = function(x, y, pressure) {
	this.x = x;
	this.y = y;
	this.pressure = pressure;
}

BasicLineDrawer.prototype.drawSegment = function(x, y, presure) {
	var c = this.context;

	var settings = this.settings.currentSettings;
	c.lineWidth = settings.brushSize * presure;
	c.strokeStyle = settings.color;

	// draw path from the prev point to this one
	c.beginPath();
	c.moveTo(this.x, this.y);
	c.lineTo(x, y);
	c.stroke();
	c.closePath();

	// save the data
	this.x = x;
	this.y = y;
}

BasicLineDrawer.prototype.endLine = function(x, y, pressure) {

}

BasicLineDrawer.prototype.setColor = function(color) {
	this.color = color;
}
