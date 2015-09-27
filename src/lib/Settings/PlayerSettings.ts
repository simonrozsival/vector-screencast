import { Reader } from '../VideoFormat/VideoFormat';
import { DrawingStrategy } from '../Drawing/DrawingStrategy';
import * as Localization from '../Localization/Player';
import PlayerUI from '../UI/PlayerUI';

//namespace VectorScreencast.Settings {
	
	/**
	 * The inteface of obligatory and possible settings for the Vector Screencast Recorder
	 */
	export interface PlayerSettings {
		/** URL of the source vector screencast video file. */
		Source:				string;
		/**
		 * Video format reader - instance implementing VideoFormat.Reader. Default is SVGAnimation.
		 * You must specify a video format reader if you use different format than SVG, VectorScreencast.Player
		 * doesn't examine source file's extension or MIME type.
		 */
		VideoFormat?:		Reader;
		/** Instance of Drawing.DrawingStrategy. Defines how the data will be rendered on the screen. Default is Drawing.CanvasDrawer */
		DrawingStrategy?: 	DrawingStrategy;
		/** Localization object literal. Default language is English. */
		Localization?: 		Localization.Player;
		/** Object instance defining the HTML structure of the player. */
		UI?:				PlayerUI;
		/**
		 * If set to true, video will start playing as soon as it is loaded.
		 * - default is *false*
		 */
		Autoplay?: 			boolean;
		/**
		 * If set to true, UI controls will hide when playing so the user isn't distracted.
		 * Controlswill appear if the mouse hovers above them or a button in bottom right corner is clicked.
		 * - default is *false*  
		 */
		Autohide?:			boolean;
		/**
		 * If set to false, user won't be able to control the video - click any buttons.
		 * - default is *true*
		 */
		ShowControls?:		boolean;
	}	
	
//}