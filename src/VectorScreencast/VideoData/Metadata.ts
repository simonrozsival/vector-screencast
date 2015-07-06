/// <reference path="../AudioData/AudioPlayer" />

module VideoData {	
	
	import AudioSource = AudioData.AudioSource;

	/**
	 * 
	 */
	export class Metadata {
		// content information
		public AudioTracks: Array<AudioSource>;
		
		// technical data
		public Length: number;		
		public Width: number;
		public Height: number;
	}
	
}