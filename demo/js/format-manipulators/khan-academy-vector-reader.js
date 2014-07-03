
function KhanAcademyVectorReader() {
	this.chunks = [];
	this.loadedSuccessfully = false;
}


KhanAcademyVectorReader.prototype.loadFile = function(fileName, reportError, onSuccess, validation) {
	var _this = this; // because of change of context

	// download the whole file - it shoud be small enough
	$.ajax({
		
		type: "GET",
		url: fileName,
		dataType: "xml",	

		success:	function(data) {

						// 
						// this is now not the KhanAcademyVectorReader object!
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
						
						if(_this.checkVersion($xml)) {
							if(_this.loadData($xml)) {
								console.log("Data was loaded successfully.");
								_this.loadedSuccessfully = true;
								onSuccess(); // call the callback
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

KhanAcademyVectorReader.prototype.isLoaded = function() {
	return this.loadedSuccessfully == true;
}

/**
 * The version of documents that is supported by this
 * @return {string} Supported version.
 */
KhanAcademyVectorReader.prototype.supportedVersion = function() { return "dev"; };

KhanAcademyVectorReader.prototype.checkVersion = function($xml) { 
	var attr = $xml.find("animation").attr("version");
	return attr == this.supportedVersion();
};

KhanAcademyVectorReader.prototype.xsdFile = function() {
	return "/xml/khan-academy/vector-video.xsd";
};

KhanAcademyVectorReader.prototype.validateXmlDocument = function(rawXml, validationFunction) {

	// if validation was requested
	if(typeof validationFunction == "function") {
		if(!validationFunction(rawXml, this.xsdFile())) {
			console.log("Validation against an XSD document was requested and it failed.");
			return false;
		}
	}
	//

	return true; // there might be no validation at all
	// @todo: Explain here in comments, why validation is not strictly required.
}

KhanAcademyVectorReader.prototype.getMetaData = function() {
	return this.meta;
};

KhanAcademyVectorReader.prototype.loadData = function($xml) {
	// I know that:
	// - the file is a well-formed XML (but it doesn't have to be valid!)
	// - the version is OK too
	
	// [1] load meta data

	var search = function(parent) {
		var data = {};

		parent.children().each(function(){
			var child = $(this);
			data[this.tagName] = child.children().length > 0 ? search(child) : child.text();
		});

		return data;
	};
	this.meta = search($xml.find("meta"));	

	// [2] load image data

	var reader = this;
	$xml.find("chunk").each(function(){
		// this is now the current chunk
		var chunk = $(this);
		
		var data = {
			start: chunk.attr("start"),
			currentColor: chunk.attr("currentColor"),
			currentBrushSize: chunk.attr("currentBrushSize"),
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
						pressure: parseInt(item.attr("p")),
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
						color: item.attr("value")
					});
					break;
			}
		});

		reader.chunks.push(data);
	});

	return true;
};

KhanAcademyVectorReader.prototype.getNext = function() {
	if(this.chunks.length <= this.currentChunk) {
		return undefined;
	}

	if(this.chunks[this.currentChunk].cursor.length <= this.currentStep) {
		// skip to the next chunk
		this.currentStep = 0;
		this.currentChunk++;

		// have I reached the very end of the video?
		if(this.chunks.length <= this.currentChunk) {
			// end of the video
			return undefined;
		}
	}

	var chunk = this.chunks[this.currentChunk].cursor[this.currentStep++];
	return chunk;
};


KhanAcademyVectorReader.prototype.getPrerenderedData = function(from, to) {

};

KhanAcademyVectorReader.prototype.rewind = function() {
	this.currentChunk = 0; // the first chunk
	this.currentStep = 0; // the first "step" of the first chunk
};