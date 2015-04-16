

var XmlWriter = (function() {
	
	var namespaces = {
		"xmlns": "http://www.rozsival.com/xml/khan-academy",
		"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
		"xmlns:noNmespaceSchemaLocation": "vector-video.xsd"
	};

	var createRootElement = function(version) {
		var attrs = { version: version };
		for (var ns in namespaces) {
			attrs[ns] = namespaces[ns];
		}
		var animation = HTML.createElement("animation", attrs);
		return animation;
	};

	var createInfoElement = function(info, name) {
		name = name || "info";
		var root = HTML.createElement(name);
		for (var item in info) {
			if(Array.isArray(info[item])) {
				root = []; // return an array of nodes
				for(var i in info[item]) {
					root.push(createInfoElement(info[item][i], name));
				}
			} else if(typeof info[item] == "object") {
				var child = createInfoElement(info[item], item);
				if(Array.isArray(child)) {
					for(var i in child) {
						root.appendChild(child[i]);
					}
				} else {
					root.appendChild(child);
				}
			} else {
				var el = HTML.createElement(item, name);
				el.textContent = info[item];
				root.appendChild(el);
			}
		}

		return root;
	};
	var createDataElement = function(data) {
		var dataEl = HTML.createElement("data");

		for (var i = 0; i < data.length; i++) {
			var chunk = HTML.createElement("chunk", {
				start: data[i].start,
				"current-color": data[i].color,
				"current-brush-size": data[i].size
			});
			var cursor = HTML.createElement("cursor");
			var cursorData = data[i].cursor;
			for(var j = 0; j < cursorData.length; j++) {
				var item = cursorData[j];

				switch (item.type) {
					case "cursor-movement":
						var m = HTML.createElement("m", {
							x: item.x,
							y: item.y,
							p: item.pressure,
							t: item.time
						});
						cursor.appendChild(m);
						break;
					case "color-change":
						var c = HTML.createElement("c", {
							value: item.color
						});
						cursor.appendChild(c);
						break;
					case "brush-size-change":
						var s = HTML.createElement("s", {
							value: item.size
						});
						cursor.append(s);
						break;						
				}

			}
			chunk.appendChild(cursor);

			var svg = HTML.createElement("svg");
			// ...
			
			chunk.appendChild(svg);
			dataEl.appendChild(chunk);
		}

		return dataEl;
	}
	
	return {
		write: function(info, data) {
			if(info == undefined || data == undefined) {
				console.log("Nothing to save.");
				return;
			}

			var rootEl = createRootElement("dev");
			var infoEl = createInfoElement(info);
			var dataEl = createDataElement(data);

			rootEl.appendChild(infoEl);
			rootEl.appendChild(dataEl);

			return rootEl;
		}
	};

})();