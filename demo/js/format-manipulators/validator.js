

function validate(xml, xsdFileName) {

	// load the content of the xsd document
	$.get(xsdFileName, function(xsd) {
		var module = {
			xml: xml,
			schema: xsd,
			arguments: ["--noout", "--schema", "demo.xml", xsdFileName]
		}

		var xmllint = validateXML(module);
		console.log(xmllint);

		//
		// @todo Finish validation.
		//

	}).fail(function() {
		// could not load the xsd file
		// -> skip validation
		

	});
}