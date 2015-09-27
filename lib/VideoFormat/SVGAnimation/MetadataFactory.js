var Metadata_1 = require('../../VideoData/Metadata');
var SVG_1 = require('../../Helpers/SVG');
var AudioPlayer_1 = require('../../AudioData/AudioPlayer');
var MetadataFactory = (function () {
    function MetadataFactory() {
    }
    MetadataFactory.prototype.FromSVG = function (rootNode) {
        var meta = new Metadata_1.default();
        if (rootNode.localName !== "metadata") {
            throw new Error("MetadataFactory error parsing SVG: Wrong metadata element " + rootNode.localName);
        }
        var length = rootNode.firstElementChild;
        if (length.localName !== "length") {
            throw new Error("MetadataFactory error parsing SVG: Expected 'length', found '" + length.nodeName + "'");
        }
        meta.Length = Number(length.textContent);
        var width = length.nextElementSibling;
        length = null;
        if (width.localName !== "width") {
            throw new Error("MetadataFactory error parsing SVG: Expected 'length', found '" + width.nodeName + "'");
        }
        meta.Width = Number(width.textContent);
        var height = width.nextElementSibling;
        width = null;
        if (height.localName !== "height") {
            throw new Error("MetadataFactory error parsing SVG: Expected 'length', found '" + height.nodeName + "'");
        }
        meta.Height = Number(height.textContent);
        meta.AudioTracks = [];
        var audioElement = height.nextElementSibling;
        var audioSource = audioElement.firstElementChild;
        while (!!audioSource) {
            var type = AudioPlayer_1.AudioSource.StringToType(SVG_1.SVGA.attr(audioSource, "type"));
            meta.AudioTracks.push(new AudioPlayer_1.AudioSource(SVG_1.SVGA.attr(audioSource, "src"), type));
            audioSource = audioSource.nextElementSibling;
        }
        return meta;
    };
    MetadataFactory.prototype.ToSVG = function (data) {
        var meta = SVG_1.default.CreateElement("metadata");
        var length = SVG_1.SVGA.CreateElement("length");
        length.textContent = data.Length.toFixed(3);
        meta.appendChild(length);
        length = null;
        var width = SVG_1.SVGA.CreateElement("width");
        width.textContent = data.Width.toFixed(0);
        meta.appendChild(width);
        width = null;
        var height = SVG_1.SVGA.CreateElement("height");
        height.textContent = data.Height.toFixed(0);
        meta.appendChild(height);
        height = null;
        var audioElement = SVG_1.SVGA.CreateElement("audio");
        for (var i = 0; i < data.AudioTracks.length; i++) {
            var audioSource = data.AudioTracks[i];
            var source = SVG_1.SVGA.CreateElement("source", {
                "type": audioSource.MimeType,
                "src": audioSource.Url
            });
            audioElement.appendChild(source);
            source = null;
        }
        meta.appendChild(audioElement);
        return meta;
    };
    return MetadataFactory;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MetadataFactory;
