/// <reference path="../../VideoData/Metadata" />
/// <reference path="../../Helpers/SVG" />
var VideoFormat;
(function (VideoFormat) {
    var SVGAnimation;
    (function (SVGAnimation) {
        var SVGA = Helpers.SVGA;
        var MetadataFactory = (function () {
            function MetadataFactory() {
            }
            MetadataFactory.prototype.FromSVG = function (rootNode) {
                throw new Error("Not implemented");
            };
            MetadataFactory.prototype.ToSVG = function (data) {
                // the "root" element
                var meta = SVGA.CreateElement("metadata");
                // video lenght
                var length = SVGA.CreateElement("length");
                length.textContent = data.Length.toFixed(3);
                meta.appendChild(length);
                length = null;
                // original video width
                var width = SVGA.CreateElement("width");
                width.textContent = data.Width.toFixed(0);
                meta.appendChild(width);
                width = null;
                // original video height
                var height = SVGA.CreateElement("height");
                height.textContent = data.Height.toFixed(0);
                meta.appendChild(height);
                height = null;
                // audio tracks
                var audioElement = SVGA.CreateElement("audio");
                for (var i = 0; i < data.AudioTracks.length; i++) {
                    var audioSource = data.AudioTracks[i];
                    var source = SVGA.CreateElement("audioSource", {
                        "type": audioSource.MimeType,
                        "src": audioSource.Url
                    });
                    audioElement.appendChild(source);
                    source = null;
                }
                meta.appendChild(audioElement);
                // That's it.
                return meta;
            };
            return MetadataFactory;
        })();
        SVGAnimation.MetadataFactory = MetadataFactory;
    })(SVGAnimation = VideoFormat.SVGAnimation || (VideoFormat.SVGAnimation = {}));
})(VideoFormat || (VideoFormat = {}));
