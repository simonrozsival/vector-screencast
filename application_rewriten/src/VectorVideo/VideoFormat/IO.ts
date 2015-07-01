/// <referece path="../VideoData/Video" />

module VideoFormat {
	
	import Video = VideoData.Video;
		
	export interface Reader {
		LoadVideo(file: any): Video;
	} 
	
	export interface Writer {
		SaveVideo(data: Video): Blob;
	}
	
}