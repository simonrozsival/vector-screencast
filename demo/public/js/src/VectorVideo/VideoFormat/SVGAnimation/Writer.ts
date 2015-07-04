/// <reference path="../IO" />
/// <reference path="../../VideoData/Chunk" />
/// <reference path="ChunkFactories" />
/// <reference path="CommandFactories" />
/// <reference path="MetadataFactory" />

module VideoFormat.SVGAnimation {
	
	import Video = VideoData.Video;
	import Metadata = VideoData.Metadata;
	import Chunk = VideoData.Chunk;
	import SVG = Helpers.SVG;
	import SVGA = Helpers.SVGA;
		
	/**
	 * Read video information from an SVG file.
	 */
	export class Writer implements VideoFormat.Writer {
						
		/** Factories for creating parts of the video */
		private chunkFactory: ChunkFactory;
		private commandFactory: CommandFactory; 
		private metadataFactory: MetadataFactory;
		
		constructor() {				
			// chain of responsibility - command factory and chunk factory
			// note: moving cursor is the most typical and far most frequent command - IT **MUST** BE FIRST IN THE CHAIN!
			this.commandFactory = new MoveCursorFactory(
										new DrawSegmentFactory(
											new ChangeBrushColorFactory(
												new ChangeBrushSizeFactory(
													new ClearCanvasFactory()
												)
											)
										)
									);
									
			this.chunkFactory = new VoidChunkFactory(
										new PathChunkFactory(
											new EraseChunkFactory()
										)
									);
									
			this.metadataFactory = new MetadataFactory();
		}
		
		/**
		 * Load video from defined URL
		 * @param	{VideoData.Video}	data	Recorded video data
		 */
		public SaveVideo(data: VideoData.Video): Blob  {						
			// init the document
			var type: DocumentType = document.implementation.createDocumentType('svg:svg', '-//W3C//DTD SVG 1.1//EN', 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd');
			var doc: Document = document.implementation.createDocument('http://www.w3.org/2000/svg', 'svg', type);
			doc.documentElement.setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns:a", SVGA.Namespace);
			SVG.SetAttributes(doc.rootElement, {
				width: data.Metadata.Width,
				height: data.Metadata.Height,
				viewBox: `0 0 ${data.Metadata.Width} ${data.Metadata.Height}`				
			});
			
			// save the metadata
			doc.rootElement.appendChild(this.metadataFactory.ToSVG(data.Metadata));
			
			// all the chunks
			var chunks: Node = SVG.CreateElement("g", { "type": "video-chunks" });
			data.Rewind();
			while(!!data.CurrentChunk) {
				chunks.appendChild(this.chunkFactory.ToSVG(data.CurrentChunk, this.commandFactory));
				data.MoveNextChunk();
			}
			doc.rootElement.appendChild(chunks);	
			
			// serialize the document to string and then create a blob out of it
			var serializer = new XMLSerializer();
			var blob = new Blob([ serializer.serializeToString(doc) ], { type: "application/svg+xml" });			
			return blob;
		}
		
	}
	
}