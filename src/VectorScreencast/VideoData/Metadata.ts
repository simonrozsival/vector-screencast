/// <reference path="../VectorScreencast" />

module VectorScreencast.VideoData {	
	
	import AudioSource = AudioData.AudioSource;

	/**
	 * Basic information about the video
	 */
	export class Metadata {		
		/** Duration of the video in milliseconds */
		public Length: number;		
		/** Width of the board */
		public Width: number;
		/** Height of the board */
		public Height: number;
		/** Available audio tracks */
		public AudioTracks: Array<AudioSource>;
	}
	
}