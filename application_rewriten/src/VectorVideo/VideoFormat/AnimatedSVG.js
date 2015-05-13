var VideoFormat;
(function (VideoFormat) {
    /**
     *
     */
    (function (AnimatedSVGNodeType) {
        AnimatedSVGNodeType[AnimatedSVGNodeType["Info"] = 0] = "Info";
        AnimatedSVGNodeType[AnimatedSVGNodeType["Author"] = 1] = "Author";
        AnimatedSVGNodeType[AnimatedSVGNodeType["Title"] = 2] = "Title";
        AnimatedSVGNodeType[AnimatedSVGNodeType["Description"] = 3] = "Description";
        AnimatedSVGNodeType[AnimatedSVGNodeType["Length"] = 4] = "Length";
        AnimatedSVGNodeType[AnimatedSVGNodeType["AudioTracks"] = 5] = "AudioTracks";
        AnimatedSVGNodeType[AnimatedSVGNodeType["AudioSource"] = 6] = "AudioSource";
    })(VideoFormat.AnimatedSVGNodeType || (VideoFormat.AnimatedSVGNodeType = {}));
    var AnimatedSVGNodeType = VideoFormat.AnimatedSVGNodeType;
    /**
     *
     */
    (function (AnimatedSVGAttributeType) {
        AnimatedSVGAttributeType[AnimatedSVGAttributeType["AudioType"] = 0] = "AudioType";
    })(VideoFormat.AnimatedSVGAttributeType || (VideoFormat.AnimatedSVGAttributeType = {}));
    var AnimatedSVGAttributeType = VideoFormat.AnimatedSVGAttributeType;
    /**
     *
     */
    var AnimatedSVG = (function () {
        function AnimatedSVG() {
        }
        Object.defineProperty(AnimatedSVG, "Namespace", {
            /** The namespace of the Animated SVG */
            get: function () { return "http://www.rozsival.com/khan-academy/animated-svg"; },
            enumerable: true,
            configurable: true
        });
        /**
         * Convert the AnimatedSVGNodeType value to string name of XML node.
         */
        AnimatedSVG.TypeToName = function (type) {
            switch (type) {
                case AnimatedSVGNodeType.Info: return "info";
                case AnimatedSVGNodeType.Author: return "author";
                case AnimatedSVGNodeType.Title: return "title";
                case AnimatedSVGNodeType.Description: return "description";
                case AnimatedSVGNodeType.Length: return "length";
                case AnimatedSVGNodeType.AudioTracks: return "audio";
                case AnimatedSVGNodeType.AudioSource: return "source";
                default:
                    throw new Error("Given type is unsupported by Animated SVG.");
            }
        };
        /**
         * Convert the string name of XML node to AnimatedSVGNodeType value
         */
        AnimatedSVG.NameToType = function (name) {
            switch (name) {
                case "info": return AnimatedSVGNodeType.Info;
                case "author": return AnimatedSVGNodeType.Author;
                case "title": return AnimatedSVGNodeType.Title;
                case "description": return AnimatedSVGNodeType.Description;
                case "length": return AnimatedSVGNodeType.Length;
                case "audio": return AnimatedSVGNodeType.AudioTracks;
                case "source": return AnimatedSVGNodeType.AudioSource;
                default:
                    throw new Error("No Animated SVG node type corresponds to the given name '" + name + "'");
            }
        };
        /**
         * Convert the XML attribute of Animated SVG to string
         */
        AnimatedSVG.AttributeToName = function (attr) {
            switch (attr) {
                case AnimatedSVGAttributeType.AudioType: return "type";
                default:
                    throw new Error("Given attribute is unsupported by Animated SVG.");
            }
        };
        /**
         * Convert the string name of XML attribute to AnimatedSVGAttributeType value
         */
        AnimatedSVG.NameToAttribute = function (name) {
            switch (name) {
                case "type": return AnimatedSVGAttributeType.AudioType;
                default:
                    throw new Error("No Animated SVG attribute name corresponds to the given name '" + name + "'");
            }
        };
        return AnimatedSVG;
    })();
    VideoFormat.AnimatedSVG = AnimatedSVG;
})(VideoFormat || (VideoFormat = {}));
//# sourceMappingURL=AnimatedSVG.js.map