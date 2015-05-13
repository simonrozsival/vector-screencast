/// <reference path="IO" />
/// <reference path="AnimatedSVG" />
/// <reference path="../VideoData/IVideoInfo" />
/// <reference path="../Helpers/State" />
/// <reference path="../Helpers/SVG" />
var State = Helpers.State;
var SVG = Helpers.SVG;
var VideoFormat;
(function (VideoFormat) {
    /**
     * This class takes video data and converts them into the extended SVG format.
     */
    var AnimatedSVGWriter = (function () {
        /**
         * Prepare the XML document that will be built.
         * The namespaces are standard SVG and my custom Animated SVG
         */
        function AnimatedSVGWriter() {
            var type = document.implementation.createDocumentType('svg:svg', '-//W3C//DTD SVG 1.1//EN', 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd');
            this.document = document.implementation.createDocument('http://www.w3.org/2000/svg', 'svg:svg', type);
            this.document.documentElement.setAttributeNS(VideoFormat.AnimatedSVG.Namespace, "xmlns:a", VideoFormat.AnimatedSVG.Namespace);
        }
        /**
         * Encode the video information into the SVG format
         */
        AnimatedSVGWriter.prototype.SetInfo = function (info) {
            // store width, height and background information 
            var infoElement = this.document.createElementNS(VideoFormat.AnimatedSVG.Namespace, VideoFormat.AnimatedSVG.TypeToName(VideoFormat.AnimatedSVGNodeType.Info));
            // video author
            var author = this.document.createElementNS(VideoFormat.AnimatedSVG.Namespace, VideoFormat.AnimatedSVG.TypeToName(VideoFormat.AnimatedSVGNodeType.Author));
            author.textContent = info.AuthorName;
            infoElement.appendChild(author);
            // video title
            var title = this.document.createElementNS(VideoFormat.AnimatedSVG.Namespace, VideoFormat.AnimatedSVG.TypeToName(VideoFormat.AnimatedSVGNodeType.Title));
            title.textContent = info.VideoTitle;
            infoElement.appendChild(title);
            // video description
            var description = this.document.createElementNS(VideoFormat.AnimatedSVG.Namespace, VideoFormat.AnimatedSVG.TypeToName(VideoFormat.AnimatedSVGNodeType.Description));
            description.textContent = info.VideoDescription;
            infoElement.appendChild(description);
            // video lenght
            var length = this.document.createElementNS(VideoFormat.AnimatedSVG.Namespace, VideoFormat.AnimatedSVG.TypeToName(VideoFormat.AnimatedSVGNodeType.Length));
            length.textContent = info.Length.toString(10);
            infoElement.appendChild(length);
            // audio tracks
            var audioElement = this.document.createElementNS(VideoFormat.AnimatedSVG.Namespace, VideoFormat.AnimatedSVG.TypeToName(VideoFormat.AnimatedSVGNodeType.AudioTracks));
            for (var i = 0; i < info.AudioTracks.length; i++) {
                var audioSource = info.AudioTracks[i];
                var source = this.document.createElementNS(VideoFormat.AnimatedSVG.Namespace, VideoFormat.AnimatedSVG.TypeToName(VideoFormat.AnimatedSVGNodeType.AudioSource));
                source.setAttributeNS(VideoFormat.AnimatedSVG.Namespace, "type", audioSource.MimeType);
                source.setAttributeNS(VideoFormat.AnimatedSVG.Namespace, "src", audioSource.Url);
                audioElement.appendChild(source);
            }
            infoElement.appendChild(audioElement);
        };
        AnimatedSVGWriter.prototype.SetNextState = function (state) {
            // @todo
        };
        AnimatedSVGWriter.prototype.SetNextPrerenderedLine = function (line) {
            var path = line;
            this.document.rootElement.appendChild(path);
            // @todo
        };
        /**
         * Serialize the output before sending to the server.
         */
        AnimatedSVGWriter.prototype.ToString = function () {
            return this.document.documentElement.outerHTML;
        };
        return AnimatedSVGWriter;
    })();
    VideoFormat.AnimatedSVGWriter = AnimatedSVGWriter;
})(VideoFormat || (VideoFormat = {}));
//# sourceMappingURL=AnimatedSVGWriter.js.map