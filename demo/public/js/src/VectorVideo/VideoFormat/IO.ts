/// <referece path="../VideoData/Video" />

module VideoFormat {
	
	import Video = VideoData.Video;
		
	export interface Reader {
		LoadVideo(file: any): Video;
		GetExtension(): string;
		GetMimeType(): string;
	} 
	
	export interface Writer {
		SaveVideo(data: Video): Blob;
		GetExtension(): string;
		GetMimeType(): string;
	}
	
}