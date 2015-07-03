/// <reference path="../IO" />
/// <reference path="../../VideoData/Chunk" />
/// <reference path="ChunkFactories" />
/// <reference path="CommandFactory" />
/// <reference path="MetadataFactory" />

module VideoFormat.JSONAnimation {
	
	import Video = VideoData.Video;
	import Metadata = VideoData.Metadata;
	import Chunk = VideoData.Chunk;
	import SVG = Helpers.SVG;
	import SVGA = Helpers.SVGA;
	
	
	interface VideoJSONFormat {
		meta: MetadataJSONFormat,
		chunks: Array<ChunkJSONFormat>	
	}
		
		
	/**
	 * Read video information from an SVG file.
	 */
	export class IO implements VideoFormat.Writer, VideoFormat.Reader {
						
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
		 * @return	{Blob}						The converted data.
		 */
		public SaveVideo(video: Video): Blob  {					
			var data: VideoJSONFormat = {
				meta: this.metadataFactory.ToJSON(video.Metadata),
				chunks: []
			}
			
			video.Rewind();
			while(!!video.CurrentChunk) {
				data.chunks.push(this.chunkFactory.ToJSON(video.CurrentChunk, this.commandFactory));
				video.MoveNextChunk();
			}	
			
			// serialize the document to string and then create a blob out of it
			return new Blob([ JSON.stringify(data) ], { type: "application/json" });
		}
		
		/**
		 * Read an JSON document and if it is valid, return the data contianed.
		 * @param	{string}	doc		Downloaded JSON document.
		 * @return	{Video}				Video data
		 */
		public LoadVideo(doc: string): Video {
			// JSON.parse() throws SyntaxError if the JSON is not valid 
			var data: any = JSON.parse(doc);
			
			if(data.hasOwnProperty("meta") === false
				|| data.hasOwnProperty("chunks") === false
				|| Array.isArray(data.chunks) === false) {
					throw new Error("Given JSON is not a valid JSONAnimation");
				}
													
			var video: Video = new Video();						
			video.Metadata = this.metadataFactory.FromJSON(data.meta);
						
			for(var i = 0; i < data.chunks.length; ++i) {
				video.PushChunk(this.chunkFactory.FromJSON(data.chunks[i], this.commandFactory));
			}
			
			video.Rewind(); // currentChunk = 0
			return video;
		}
				
		GetExtension(): string {
			return "json";
		}
		
		GetMimeType(): string {
			return "application/json";
		}
	}
	
}