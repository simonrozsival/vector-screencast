/// <reference path="VideoData" />
/// <reference path="VideoFormat/SVGAnimation/IO" />

/**
 * Reading and writing video data to (different) Vector Screencast formats.
 * @prefered
 */
module VectorScreencast.VideoFormat {
	
	import Video = VideoData.Video;
		
	/**
	 * Instance of this interface is capable of parsing a specific file format.
	 */
	export interface Reader {
		/**
		 * Read contents of a file and extrac all the information about the video.
		 * @param	events	Events aggregator
		 * @param	file	The downloaded source file
		 * @return			Video data
		 */
		LoadVideo(events: Helpers.VideoEvents, file: any): Video;
		
		/**
		 * Get supported extension
		 * @return		File extension
		 */
		GetExtension(): string;
		
		/**
		 * Get supported MIME type
		 * @return		File extension
		 */
		GetMimeType(): string;
	} 
	
	/**
	 * Instance of this interface is capable of converting recorded video data
	 * to a specific file format.
	 */
	export interface Writer {
		/**
		 * Convert video data to a specific format
		 * @param	data	Recorded video data
		 * @return			The formated file
		 */
		SaveVideo(data: Video): Blob;
				
		/**
		 * Get supported extension
		 * @return		File extension
		 */
		GetExtension(): string;
		
		/**
		 * Get supported MIME type
		 * @return		File extension
		 */
		GetMimeType(): string;
	}
	
}