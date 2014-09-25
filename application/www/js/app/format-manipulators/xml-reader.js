
var XmlReader = (function() {

	// video header
	var info;

	// an ordered array of video data
	var chunks = [];

	// current step
	var currentChunk, currentStep;

	var loadedSuccessfully = false;

	function XmlReader(opts) {
		VideoEvents.on("rewind", function() {
			rewind();
		});

		loadFile(opts, function() {
			// set initial values when the data is loaded
			rewind();			
		});
	}


	var loadFile = function(opts, callback) {
		
		var reportError = console.log;
		if(opts.hasOwnProperty("error") && typeof opts.error == "function") {
			var reportError = opts.error;
		}

		// download the whole file - it shoud be small
		$.ajax({
			
			type: "GET",
			url: opts.file,
			dataType: "xml",	

			success:	function(data) {

							// 
							// this is now not the XmlReader object!
							// 

							var $xml = $(data); // data must be well-formed to succeed
							//
							// @note: the "$" indicates that the variable contains a jQuery object
							// 
							
							if($xml.length == 0) { // jQuery returns an empty array, when data is not well-formed XML
								// xml was not well-formed
								console.log("Document is not a well-formed XML document and the video can't be loaded nor played.");
								return null;
							}
							
							if(checkVersion($xml)) {
								if(loadData($xml)) {
									console.log("Data was loaded successfully.");
									loadedSuccessfully = true;

									// private callback, it is always set
									callback.call();

									//
									// Everything is set up now.
									//
									
									// call a callback if it was set from the outside as an option
									if(opts.hasOwnProperty("success") && typeof opts.success == "function") {
										opts.success.call();
									}
								} else {
									console.log("Could not load data from a valid document.");
									if(typeof reportError == "function") {
										reportError("An error occured while loading data.");
									}
								}
							} else {
								console.log("Document is not valid or the version of the document is unsupported.");
								if(typeof reportError == "function") {
									reportError("Could not open this document. It is damaged or the version of the document is not supported.");
								}
							}
						},

			fail: 	function() {
						console.log("Retrieving the file failed.");
						if (typeof reportError == "function") {
							reportError("Could not open the document.");
						}
					},
		});
	}

	XmlReader.prototype.isLoaded = function() {
		return loadedSuccessfully === true;
	}

	/**
	 * The version of documents that is supported by this
	 * @return {string} Supported version.
	 */
	var supportedVersion = function() { return "dev"; };

	var checkVersion = function($xml) { 
		var attr = $xml.find("animation").attr("version");
		return attr == supportedVersion();
	};

	var xsdFile = function() {
		return "/xml/khan-academy/vector-video.xsd";
	};

	var validateXmlDocument = function(rawXml, validationFunction) {

		// if validation was requested
		if(typeof validationFunction == "function") {
			if(!validationFunction(rawXml, xsdFile())) {
				console.log("Validation against an XSD document was requested and it failed.");
				return false;
			}
		}
		//

		return true; // there might be no validation at all
		// @todo: Explain here in comments, why validation is not strictly required.
	}

	XmlReader.prototype.getInfo = function() {
		return info;
	};

	var loadData = function($xml) {
		// I know that:
		// - the file is a well-formed XML (but it doesn't have to be valid!)
		// - the version is OK too
		
		// [1] load info data

		var search = function(parent) {
			var data = {};

			parent.children().each(function(){
				var child = $(this);
				data[this.tagName] = child.children().length > 0 ? search(child) : child.text();
			});

			return data;
		};
		
		info = search($xml.find("info"));	

		// [2] load image data

		$xml.find("chunk").each(function(){
			// this is now the current chunk
			var chunk = $(this);
			
			var data = {
				start: chunk.attr("start"),
				currentColor: chunk.attr("current-color"),
				currentBrushSize: chunk.attr("current-brush-size"),
				cursor: [],
				prerendered: chunk.children("svg")
			};

			chunk.children("cursor").children().each(function(){
				var tagName = this.tagName;
				var item = $(this);
				switch (tagName) {
					case "m":
						data.cursor.push({
							type: "cursor-movement",
							x: parseInt(item.attr("x")),
							y: parseInt(item.attr("y")),
							pressure: parseFloat(item.attr("p")),
							time: parseInt(item.attr("t"))
						});
						break;
					case "c":
						data.cursor.push({
							type: "color-change",
							color: item.attr("value")
						});
						break;
					case "s":
						data.cursor.push({
							type: "brush-size-change",
							size: parseInt(item.attr("value"))
						});
						break;
				}
			});

			chunks.push(data);
		});

		return true;
	};

	XmlReader.prototype.getNext = function() {
		if(chunks.length <= currentChunk) {
			return undefined;
		}

		if(chunks[currentChunk].cursor.length <= currentStep) {
			// skip to the next chunk
			currentStep = 0;
			currentChunk++;

			// have I reached the very end of the video?
			if(chunks.length <= currentChunk) {
				// end of the video
				return undefined;
			}
		}

		var chunk = chunks[currentChunk].cursor[currentStep++];
		return chunk;
	};


	XmlReader.prototype.getPrerenderedData = function(from, to) {
		
	};

	var rewind = function() {
		console.log("rewind");
		jumpTo(0, 0);
	};

	var jumpTo = function(chunk, step) {
		currentChunk = chunk; // the first chunk
		currentStep = step; // the first "step" of the first chunk
		VideoEvents.trigger("color-change", chunks[currentChunk].currentColor);
		VideoEvents.trigger("brush-size-change", chunks[currentChunk].currentBrushSize);
	};

	return XmlReader;

})();