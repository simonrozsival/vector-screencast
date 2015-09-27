
import { AudioSource } from '../AudioData/AudioPlayer';

//namespace VectorScreencast.VideoData {

	/**
	 * Basic information about the video
	 */
	export default class Metadata {		
		/** Duration of the video in milliseconds */
		public Length: number;		
		/** Width of the board */
		public Width: number;
		/** Height of the board */
		public Height: number;
		/** Available audio tracks */
		public AudioTracks: Array<AudioSource>;
	}
	
//}