var test = require("tape");
var buffer = require("./");
var through = require("through");

function readable() {
	var stream = through();
	var i = 0;
	(function loop() {
		setImmediate(function() {
			i += 1;
			stream.emit("data", "data");
			if (i < 10) loop();
			else stream.emit("end");
		});
	}());
	return stream;
}

function testStream(stream, n, t) {
	var i = 0;
	stream.on("data", function(data) {
		t.equal(data, "data");
		i += 1;
		if (i > n) {
			t.ok(false);
		}
	});
}

test("replay from before any data events", function(t) {
	var r = readable(),
		b = r.pipe(buffer());
	testStream(b.replay(through()), 10, t);
	r.on("end", function() {
		t.equal(b.buffer.length, 10);
		t.end();
	});
});


test("replay in middle of data events", function(t) {
	var r = readable(),
		b = r.pipe(buffer());

	r.on("data", function() {
		testStream(b.replay(through()), 10, t);
	});

	r.on("end", function() {
		t.end();
	});
});

test("replay after all data events", function(t) {
	var r = readable(),
		b = r.pipe(buffer()),
		dst = through();

	r.on("end", function() {
		testStream(b.replay(dst));
	});

	dst.on("end", function() {
		t.end();
	});
});
