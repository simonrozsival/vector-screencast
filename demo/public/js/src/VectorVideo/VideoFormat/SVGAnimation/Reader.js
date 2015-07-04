/// <reference path="../IO" />
/// <reference path="../../VideoData/Chunk" />
/// <reference path="ChunkFactories" />
/// <reference path="CommandFactories" />
/// <reference path="MetadataFactory" />
var VideoFormat;
(function (VideoFormat) {
    var SVGAnimation;
    (function (SVGAnimation) {
        var Video = VideoData.Video;
        /**
         * Read video information from an SVG file.
         */
        var Reader = (function () {
            function Reader(doc) {
                this.doc = doc;
                // chain of responsibility - command factory and chunk factory
                // note: moving cursor is the most typical and far most frequent command - IT **MUST** BE FIRST IN THE CHAIN!
                this.commandFactory = new SVGAnimation.MoveCursorFactory(new SVGAnimation.ChangeBrushColorFactory(new SVGAnimation.ChangeBrushSizeFactory(new SVGAnimation.ClearCanvasFactory())));
                this.chunkFactory = new SVGAnimation.VoidChunkFactory(new SVGAnimation.PathChunkFactory(new SVGAnimation.EraseChunkFactory()));
                this.metadataFactory = new SVGAnimation.MetadataFactory();
            }
            /**
             * Load video from defined URL
             * @param	{string}	fileURL		Source file URL containing SVGAnimation data
             */
            Reader.prototype.LoadVideo = function () {
                // load the data from the file passed through the constructor						
                var video = new Video();
                // load video info
                video.Metadata = this.metadataFactory.FromSVG(this.doc.rootElement);
                // load chunks of data
                var chunksLayer = new NodeList(); /// mock!!!			
                for (var i = 0; i < chunksLayer.length; i++) {
                    video.PushChunk(this.chunkFactory.FromSVG(chunksLayer.item(i), this.commandFactory));
                }
                return video;
            };
            return Reader;
        })();
        SVGAnimation.Reader = Reader;
    })(SVGAnimation = VideoFormat.SVGAnimation || (VideoFormat.SVGAnimation = {}));
})(VideoFormat || (VideoFormat = {}));
