/// <reference path="AudioPlayer" />

module VideoData {
	
	/**
	 * 
	 */
	export interface IVideoInfo {
		// content information
		AudioTracks: Array<AudioSource>;
		
		// technical data
		Length: number;		
		Width: number;
		Height: number;
		BackgroundColor: string;
	}
	
}