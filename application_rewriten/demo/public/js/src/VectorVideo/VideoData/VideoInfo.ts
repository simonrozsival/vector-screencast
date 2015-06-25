/// <reference path="AudioPlayer" />

module VideoData {
	
	/**
	 * 
	 */
	export class VideoInfo {
		// content information
		public AudioTracks: Array<AudioSource>;
		
		// technical data
		public Length: number;		
		public Width: number;
		public Height: number;
		public BackgroundColor: string;
	}
	
}