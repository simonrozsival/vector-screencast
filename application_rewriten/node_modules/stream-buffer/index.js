// jshint node:true
"use strict";

var through = require("through");

module.exports = function() {
	var ended = false;

	var stream = through(function(data) {
		this.buffer.push(data);
		this.queue(data);
	}, function() {
		ended = true;
		this.queue(null);
	});

	stream.buffer = [];
	stream.replay = function(stream) {
		this.buffer.forEach(function(data) {
			stream.write(data);
		});

		if (ended) {
			stream.end();
		}
		else {
			this.pipe(stream);
		}

		return stream;
	};

	return stream;
};
