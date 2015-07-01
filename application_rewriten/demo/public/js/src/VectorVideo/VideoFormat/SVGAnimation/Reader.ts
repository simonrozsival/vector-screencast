/// <reference path="../IO" />
/// <reference path="../../VideoData/Chunk" />
/// <reference path="ChunkFactories" />
/// <reference path="CommandFactories" />
/// <reference path="MetadataFactory" />

module VideoFormat.SVGAnimation {
	
	import Video = VideoData.Video;
	import Metadata = VideoData.Metadata;
	import Chunk = VideoData.Chunk;
		
	/**
	 * Read video information from an SVG file.
	 */
	export class Reader implements VideoFormat.Reader {
						
		/** Factories for creating parts of the video */
		private chunkFactory: ChunkFactory;
		private commandFactory: CommandFactory; 
		private metadataFactory: MetadataFactory;
		
		constructor(protected doc: XMLDocument) {				
			// chain of responsibility - command factory and chunk factory
			// note: moving cursor is the most typical and far most frequent command - IT **MUST** BE FIRST IN THE CHAIN!
			this.commandFactory = new MoveCursorFactory(
										new ChangeBrushColorFactory(
											new ChangeBrushSizeFactory(
												new ClearCanvasFactory()
											)
										));
			this.chunkFactory = new VoidChunkFactory(
										new PathChunkFactory(
											new EraseChunkFactory()
										)
									);
			this.metadataFactory = new MetadataFactory();
		}
		
		/**
		 * Load video from defined URL
		 * @param	{string}	fileURL		Source file URL containing SVGAnimation data
		 */
		public LoadVideo(): Video  {						
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
		}
		
	}
	
}