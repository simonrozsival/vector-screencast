

var XmlWriter = (function() {
	
	var namespaces = {
		"xmlns": "http://www.rozsival.com/xml/khan-academy",
		"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
		"xmlns:noNmespaceSchemaLocation": "vector-video.xsd"
	};

	var createRootElement = function(version) {
		var animation = createElem("animation").attr("version", version);
		for (var ns in namespaces) {
			animation.attr(ns, namespaces[ns]);
		}

		return animation;
	};

	var createinfoElement = function(info, name) {
		if(name == undefined) {
			name = "info-data"; // the root elem.
		}

		var root = createElem(name);
		for (var item in info) {
			if(typeof info[item] == "object") {
				root.append(createinfoElement(info[item], item))
			} else {
				var el = createElem(item);
				el.text(info[item]);
				root.append(el);
			}
		}

		return root;
	};
	var createDataElement = function(data) {
		var dataEl = createElem("data");

		for (var i = 0; i < data.length; i++) {
			var chunk = createElem("chunk")
							.attr("start", data[i].start)
							.attr("currentColor", data[i].color)
							.attr("currentBrushSize", data[i].brushSize);
			var cursor = createElem("cursor");
			var cursorData = data[i].cursor;
			for(var j = 0; j < cursorData.length; j++) {
				var item = cursorData[j];

				switch (item.type) {
					case "cursor-movement":
						var m = createElem("m")
									.attr("x", item.x)
									.attr("y", item.y)
									.attr("p", item.pressure)
									.attr("t", item.time);

						cursor.append(m);
						break;
					case "color-change":
						var c = createElem("c");
						c.value = item.color;
						cursor.append(c);
						break;
					case "brush-size-change":
						var s = createElem("s");
						s.value = item.size;
						cursor.append(s);
						break;						
				}

			}
			chunk.append(cursor);

			var svg = $("<svg></svg>");
			// ...
			
			chunk.append(svg);
			dataEl.append(chunk);
		}

		return dataEl;
	}

	var createElem = function(name) {
		return $("<" + name + " />");
	}

	return {
		write: function(info, data) {
			if(info == undefined || data == undefined) {
				console.log("Nothing to save.");
				return;
			}

			var rootEl = createRootElement("dev");
			var infoEl = createinfoElement(info);
			console.log("info: ", infoEl);
			var dataEl = createDataElement(data);

			rootEl.append(infoEl).append(dataEl);

			return rootEl;
		}
	};

})();