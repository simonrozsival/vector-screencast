var Video_1 = require('../../VideoData/Video');
var Chunk_1 = require('../../VideoData/Chunk');
var ChunkFactories_1 = require('./ChunkFactories');
var CommandFactories_1 = require('./CommandFactories');
var MetadataFactory_1 = require('./MetadataFactory');
var SVG_1 = require('../../Helpers/SVG');
var IO = (function () {
    function IO() {
        this.VideoChunksLayerType = "video-chunks";
        this.commandFactory = new CommandFactories_1.MoveCursorFactory(new CommandFactories_1.DrawSegmentFactory(new CommandFactories_1.ChangeBrushColorFactory(new CommandFactories_1.ChangeBrushSizeFactory(new CommandFactories_1.ClearCanvasFactory()))));
        this.eraseChunkFactory = new ChunkFactories_1.EraseChunkFactory();
        this.chunkFactory = new ChunkFactories_1.VoidChunkFactory(new ChunkFactories_1.PathChunkFactory(this.eraseChunkFactory));
        this.metadataFactory = new MetadataFactory_1.default();
    }
    IO.prototype.SaveVideo = function (data) {
        var type = document.implementation.createDocumentType('svg:svg', '-//W3C//DTD SVG 1.1//EN', 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd');
        var doc = document.implementation.createDocument('http://www.w3.org/2000/svg', 'svg', type);
        doc.documentElement.setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns:a", SVG_1.SVGA.Namespace);
        SVG_1.default.SetAttributes(doc.rootElement, {
            width: data.Metadata.Width,
            height: data.Metadata.Height,
            viewBox: "0 0 " + data.Metadata.Width + " " + data.Metadata.Height
        });
        doc.rootElement.appendChild(this.metadataFactory.ToSVG(data.Metadata));
        this.eraseChunkFactory.Width = data.Metadata.Width;
        this.eraseChunkFactory.Height = data.Metadata.Height;
        var chunks = SVG_1.default.CreateElement("g");
        SVG_1.SVGA.SetAttributes(chunks, { "type": this.VideoChunksLayerType });
        data.Rewind();
        while (!!data.CurrentChunk) {
            chunks.appendChild(this.chunkFactory.ToSVG(data.CurrentChunk, this.commandFactory));
            data.MoveNextChunk();
        }
        doc.rootElement.appendChild(chunks);
        var serializer = new XMLSerializer();
        return new Blob([serializer.serializeToString(doc)], { type: "application/svg+xml" });
    };
    IO.prototype.LoadVideo = function (events, doc) {
        if (doc instanceof Document === false) {
            throw new Error("SVGAnimation IO parsing error: Document must be an XML document");
        }
        var xml = doc;
        if (xml.documentElement.childElementCount !== 2) {
            throw new Error("SVGAnimation document root element must have exactely two children nodes, but has " + xml.documentElement.childNodes.length + " instead");
        }
        var video = new Video_1.default();
        var metaNode = xml.documentElement.firstElementChild;
        video.Metadata = this.metadataFactory.FromSVG(metaNode);
        var chunksLayer = metaNode.nextElementSibling;
        if (chunksLayer.localName !== "g" || SVG_1.SVGA.attr(chunksLayer, "type") !== this.VideoChunksLayerType) {
            throw new Error(("SVGAnimation IO parsing error: chunks layer must be a SVG\u00A0<g> node with a:type='" + this.VideoChunksLayerType + "',")
                + (" got <" + chunksLayer.localName + "> with a:type='" + SVG_1.SVGA.attr(chunksLayer, "type") + "'"));
        }
        var lastErase = 0;
        var i = 0;
        var chunk = chunksLayer.firstElementChild;
        while (!!chunk) {
            var next = this.chunkFactory.FromSVG(events, chunk, this.commandFactory);
            next.LastErase = lastErase;
            video.PushChunk(next);
            if (next instanceof Chunk_1.EraseChunk) {
                lastErase = i;
            }
            chunk = chunk.nextElementSibling;
            i++;
        }
        video.Rewind();
        return video;
    };
    IO.prototype.GetExtension = function () {
        return "svg";
    };
    IO.prototype.GetMimeType = function () {
        return "application/svg+xml";
    };
    return IO;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = IO;
