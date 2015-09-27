import Video from '../../VideoData/Video';
import Metadata from '../../VideoData/Metadata';
import Chunk, { EraseChunk, PathChunk, VoidChunk } from '../../VideoData/Chunk';

import ChunkFactory, { EraseChunkFactory, VoidChunkFactory, PathChunkFactory } from './ChunkFactories';
import CommandFactory, { MoveCursorFactory, DrawSegmentFactory, ChangeBrushColorFactory, ChangeBrushSizeFactory, ClearCanvasFactory } from './CommandFactories';
import MetadataFactory from './MetadataFactory'; 

import Vector2 from '../../Helpers/Vector';
import { IAttributes } from '../../Helpers/HTML';
import SVG, { SVGA } from '../../Helpers/SVG';
import VideoEvents from '../../Helpers/VideoEvents';
	
import { Writer, Reader } from '../VideoFormat';
	
//namespace VectorScreencast.VideoFormat.SVGAnimation {
	
	/**
	 * Read video information from an SVG file.
	 */
	export default class IO implements Writer, Reader {
						
		/** Factories for creating parts of the video */
		private chunkFactory: ChunkFactory;
		private commandFactory: CommandFactory; 
		private metadataFactory: MetadataFactory;
		
		/** Erase factory needs aditional information */
		private eraseChunkFactory: EraseChunkFactory;
		
		/**
		 * Initialises parsing factories for chunks, commands and metadata.
		 */
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
									
			this.eraseChunkFactory = new EraseChunkFactory();
			this.chunkFactory = new VoidChunkFactory(
										new PathChunkFactory(
											this.eraseChunkFactory
										)
									);
									
			this.metadataFactory = new MetadataFactory();
		}
		
		private VideoChunksLayerType = "video-chunks";
		
		/**
		 * Load video from defined URL
		 * @param	{VideoData.Video}	data	Recorded video data
		 * @return	{Blob}						The converted data.
		 */
		public SaveVideo(data: Video): Blob  {						
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
			
			// configure erase factory with canvas dimensions
			this.eraseChunkFactory.Width = data.Metadata.Width;
			this.eraseChunkFactory.Height = data.Metadata.Height;
			
			// all the chunks
			var chunks: Node = SVG.CreateElement("g");
			SVGA.SetAttributes(chunks, { "type": this.VideoChunksLayerType });
			data.Rewind();
			while(!!data.CurrentChunk) {
				chunks.appendChild(this.chunkFactory.ToSVG(data.CurrentChunk, this.commandFactory));
				data.MoveNextChunk();
			}
			doc.rootElement.appendChild(chunks);	
			
			// serialize the document to string and then create a blob out of it
			var serializer = new XMLSerializer();
			return new Blob([ serializer.serializeToString(doc) ], { type: "application/svg+xml" });
		}
		
		/**
		 * Read an XML document and if it is valid, return the data contianed.
		 * @param	{Document}	doc		Downloaded XML document.
		 * @return	{Video}				Video data
		 */
		public LoadVideo(events: VideoEvents, doc: any): Video {
			if(doc instanceof Document === false) {
				throw new Error(`SVGAnimation IO parsing error: Document must be an XML document`);
			}
			
			var xml: Document = doc;
			if(xml.documentElement.childElementCount !== 2) {
				throw new Error(`SVGAnimation document root element must have exactely two children nodes, but has ${xml.documentElement.childNodes.length} instead`)
			}
						
			var video: Video = new Video();						
						
			// load video info
			var metaNode = xml.documentElement.firstElementChild;
			video.Metadata = this.metadataFactory.FromSVG(metaNode);
			
			// load chunks of data
			var chunksLayer: Element = metaNode.nextElementSibling;
			if(chunksLayer.localName !== "g" || SVGA.attr(chunksLayer, "type") !== this.VideoChunksLayerType) {
				throw new Error(`SVGAnimation IO parsing error: chunks layer must be a SVG <g> node with a:type='${this.VideoChunksLayerType}',`
									+ ` got <${chunksLayer.localName}> with a:type='${SVGA.attr(chunksLayer, "type")}'`);
			}
			
			var lastErase: number = 0;
			var i: number = 0;						
			var chunk: Element = chunksLayer.firstElementChild;
			while(!!chunk) {
				var next = this.chunkFactory.FromSVG(events, chunk, this.commandFactory);
				next.LastErase = lastErase;
				video.PushChunk(next);				
				if(next instanceof EraseChunk) {
					// remember the position of last erase 
					lastErase = i;
				}				
				chunk = chunk.nextElementSibling;
				i++;				
			}
			
			video.Rewind(); // currentChunk = 0
			return video;
		}
				
		/**
		 * The extension is SVG.
		 */
		GetExtension(): string {
			return "svg";
		}
		
		/**
		 * MIME type of SVG files is "application/svg+xml"
		 */
		GetMimeType(): string {
			return "application/svg+xml";
		}
		
	}
//}