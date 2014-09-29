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

var Player = (function(){

	var settings = {
		container: {
			selector: "#player",
		},
		cursor: {
			size: 20,
			color: "#fff"
		},
		audio: []
	};

	function Player(options) {
		// [0] - settings
		$.extend(true, settings, options);
		var el = $(settings.container.selector);

		// [1] - init events
		//VideoEvents.init(el);

		// [2] - prepare the UI
		var ui = new PlayerUI({
			container: el
		});

		// [3] - prepare the player
		var settingsMonitor = new BasicSettings();		
		var lineDrawer = new RoundedLines(settingsMonitor);
		var dataProvider = new XmlDataProvider(options.xml.file);
		var audioPlayer = new AudioPlayer(settings.audio);

	}

	return Player;

})();