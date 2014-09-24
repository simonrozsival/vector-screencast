/**
* Khanova Škola - vektorové video
*
* THE VIDEO PLAYER OBJECT
* This is the base stylesheet that contains the basic layout and appearance of the board.
*
* @author:		Šimon Rozsíval (simon@rozsival.com)
* @project:	Vector screencast for Khan Academy (Bachelor thesis)
* @license:	MIT
*/

var KhanAcademyPlayer = (function(){

	var defaults = {
		container: {
			selector: "#player",
		},
		cursor: {
			size: 20,
			color: "#fff"
		}
	};

	function KhanAcademyPlayer(options) {
		// [0] - settings
		options = $.extend(defaults, options);
		var el = $(options.container.selector);

		// [1] - init events
		VideoEvents.init(el);

		// [2] - prepare the UI
		var ui = new PlayerUI({
			container: el
		});		
		var cursor = new Cursor(ui.board, options.cursor.size, options.cursor.color);

		// [3] - prepare the player
		var settings = new BasicSettings();		
		var lineDrawer = new RoundedLines(settings);
		var dataProvider = new XmlDataProvider(options.xml.file);
		var audioPlayer = new AudioPlayer([{
			format: options.audio.format,
			file: options.audio.file
		}]);


	}

	return KhanAcademyPlayer;

})();