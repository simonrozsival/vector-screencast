/// <reference path="IO" />
/// <reference path="AnimatedSVGWriter" />
/// <reference path="../VideoData/AudioPlayer" />
/// <reference path="../Helpers/Errors" />
/// <reference path="../VideoData/IVideoInfo" />
var AudioSourceType = VideoData.AudioSourceType;
var AudioSource = VideoData.AudioSource;
var VideoFormat;
(function (VideoFormat) {
    var AnimatedSVGReader = (function () {
        function AnimatedSVGReader() {
        }
        /**
         * Open and parse the input
         */
        AnimatedSVGReader.prototype.ReadFile = function (file) {
            this.file = file;
            // Make a simple test - is it an SVG or not? The file might be invalid or corrupt, but that will be revield later. 
            if (!file.firstChild || file.firstChild.nodeName.toUpperCase() !== "SVG") {
                Errors.Report(ErrorType.Fatal, "Can't read input file - it is not an SVG file.");
            }
        };
        /**
         * Extracts information about the video from the extended SVG
         */
        AnimatedSVGReader.prototype.GetInfo = function () {
            var videoInfo;
            // width and height are parameters of SVG root element
            if (this.file.rootElement.hasAttributeNS(SVG.Namespace, "width")) {
                videoInfo.Width = Number(this.file.rootElement.attributes.getNamedItemNS(SVG.Namespace, "width"));
            }
            else {
                Errors.Report(ErrorType.Fatal, "SVG doesn't have the width attribute.");
            }
            // the same for height...
            if (this.file.rootElement.hasAttributeNS(SVG.Namespace, "height")) {
                videoInfo.Height = Number(this.file.rootElement.attributes.getNamedItemNS(SVG.Namespace, "height"));
            }
            else {
                Errors.Report(ErrorType.Fatal, "SVG doesn't have the height attribute.");
            }
            // @todo - Background
            videoInfo.BackgroundColor = "black";
            // search for <info> element
            var infoSearch = this.file.getElementsByTagNameNS(VideoFormat.AnimatedSVG.Namespace, VideoFormat.AnimatedSVG.TypeToName(VideoFormat.AnimatedSVGNodeType.Info));
            if (infoSearch.length !== 1) {
                Errors.Report(ErrorType.Fatal, "SVG file doesn't contain " + VideoFormat.AnimatedSVG.TypeToName(VideoFormat.AnimatedSVGNodeType.Info) + " element.");
            }
            // the very info element
            var info = infoSearch.item(0);
            // go through all it's children and save their values
            for (var i = 0; i < info.childNodes.length; i++) {
                var node = info.childNodes.item(i);
                switch (VideoFormat.AnimatedSVG.NameToType(node.nodeName)) {
                    case VideoFormat.AnimatedSVGNodeType.Author:
                        videoInfo.AuthorName = node.textContent;
                        break;
                    case VideoFormat.AnimatedSVGNodeType.Title:
                        videoInfo.VideoTitle = node.textContent;
                        break;
                    case VideoFormat.AnimatedSVGNodeType.Description:
                        videoInfo.VideoDescription = node.textContent;
                        break;
                    case VideoFormat.AnimatedSVGNodeType.AudioTracks:
                        this.LoadAudioSources(videoInfo, node);
                        break;
                    default:
                        Errors.Report(ErrorType.Fatal, "Unexpected node " + node.nodeName + " inside the " + VideoFormat.AnimatedSVG.TypeToName(VideoFormat.AnimatedSVGNodeType.Info) + " element.");
                }
            }
            if (videoInfo.AudioTracks.length === 0) {
                Errors.Report(ErrorType.Warning, "No audio is available.");
            }
            return videoInfo;
        };
        /**
         * Loads all given audio sources
         * @param	info	Extracted information goes here
         * @param	audio	XML node containing information about audio audio sources
         */
        AnimatedSVGReader.prototype.LoadAudioSources = function (info, audio) {
            for (var i = 0; i < audio.childNodes.length; i++) {
                var element = audio.childNodes[i];
                var type = element.attributes.getNamedItemNS(VideoFormat.AnimatedSVG.Namespace, VideoFormat.AnimatedSVG.AttributeToName(VideoFormat.AnimatedSVGAttributeType.AudioType));
                if (!!type) {
                    info.AudioTracks.push(new AudioSource(element.textContent, AudioSource.StringToType(type.textContent)));
                }
            }
        };
        /**
         * Return next state
         */
        AnimatedSVGReader.prototype.GetNextState = function () {
            // @todo
            return null;
        };
        /**
         *
         */
        AnimatedSVGReader.prototype.GetNextPrerenderedLine = function () {
            // @todo
            return null;
        };
        /**
         *
         */
        AnimatedSVGReader.prototype.GetNextPrerenderedLineFinishTime = function () {
            // @todo
            return 0;
        };
        return AnimatedSVGReader;
    })();
    VideoFormat.AnimatedSVGReader = AnimatedSVGReader;
})(VideoFormat || (VideoFormat = {}));
//# sourceMappingURL=AnimatedSVGReader.js.map