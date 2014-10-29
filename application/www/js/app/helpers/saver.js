/**
 * Khanova Škola - vektorové video
 *
 * SAVING HELPER
 * This static object provides simple way to save WAV and XML data.
 * 
 * @author:		Šimon Rozsíval (simon@rozsival.com)
 * @project:	Vector screencast for Khan Academy (Bachelor thesis)
 * @license:	MIT
 */

var Saver = (function() {

	var saveBlob = function(blob, name) {
		var a = $("<a>").hide();
		$("body").append(a);
		var url = URL.createObjectURL(blob);
		a.attr("href", url);
		a.attr("download", name);
		console.log(a);
		a[0].click(); // click on the link - it is more straighforward without jQuery
		URL.revokeObjectURL(url);
	};

	return {
		saveWav: function(blob) {
			saveBlob(blob, "recording.wav");
		},

		saveXml: function(text) {
			var blob = new Blob([text], { type: "text/xml" });
			saveBlob(blob, "data.xml");
		}
	};
	
})();