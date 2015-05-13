/// <reference path="Helpers/Errors" />
/// <reference path="Drawing/IDrawingStrategy" />
/// <reference path="Drawing/SVGDrawer" />
/// <reference path="Settings/PlayerSettings" />
/// <reference path="UI/PlayerUI" />
/// <reference path="VideoData/AudioPlayer" />
/// <reference path="VideoData/Video" />
/// <reference path="VideoFormat/IO" />
/// <reference path="VideoFormat/AnimatedSVGReader" />
var Errors = Helpers.Errors;
var ErrorType = Helpers.ErrorType;
var AudioPlayer = VideoData.AudioPlayer;
var VectorVideo;
(function (VectorVideo) {
    var Player = (function () {
        function Player(id, settings) {
            this.settings = settings;
            var container = document.getElementById(id);
            if (!container) {
                Errors.Report(ErrorType.Fatal, "Container #" + id + " doesn't exist. Video Player couldn't be initialised.");
            }
            // init the UI
            this.ui = new UI.PlayerUI(id, settings.Localization);
            this.drawer = new SVGDrawer();
            this.ui.AcceptCanvas(this.drawer.GetCanvas());
            // read the file
            var reader = new VideoFormat.AnimatedSVGReader();
            var videoFile = new VideoData.Video(settings.Source, reader);
            var audioPlayer = new AudioPlayer(reader.GetInfo().AudioTracks);
            // @todo
        }
        return Player;
    })();
    VectorVideo.Player = Player;
})(VectorVideo || (VectorVideo = {}));
//# sourceMappingURL=Player.js.map