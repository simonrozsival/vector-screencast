import Color from '../UI/Color';
import { DrawingStrategy } from '../Drawing/DrawingStrategy';
import * as Localization from '../Localization/Recorder';
import RecorderUI from '../UI/RecorderUI';
import BrushSize from '../UI/Brush';
import { Writer } from '../VideoFormat';

//namespace VectorScreencast.Settings {
	
	/**
	 * The inteface of obligatory and possible settings for the Vector Screencast Recorder
	 */
	export interface RecorderSettings {
		/** URL, where the data will be uploaded using a POST request. */	
		UploadURL:			string;		
		/** Instance of Drawing.DrawingStrategy. Defines how the data will be rendered on the screen. Default is Drawing.CanvasDrawer */		
		DrawingStrategy?: 	DrawingStrategy;
		/** Audio recording settings instance. */
		Audio?: 			AudioRecorderSettings;
		/** Localization object literal. Default language is English. */
		Localization?: 		Localization.Recorder;
		/** Default brush color */
		DefaultBrushColor?:	Color;
		/** Default board background color */
		DefaultBackgroundColor?: Color;
		/** Array of brush size options. */
		BrushSizes?: 		Array<BrushSize>;
		/** Array of colors for the color palete. */
		ColorPallete?: 		Array<Color>;
		/** Enable or disable dynamic line width depending on brush's speed. */
		DisableDynamicLineWidth?:	boolean;
		/** Object instance defining the HTML structure of the recorder. */		
		UI?:				RecorderUI;	
		/**
		 * If set to true, UI controls will hide when playing so the user isn't distracted.
		 * Controlswill appear if the mouse hovers above them or a button in bottom right corner is clicked.
		 * @default false  
		 */		
		Autohide?:			boolean;		
		/**
		 * Some data are irrelevant for plaback, should it be recorded anyway?
		 * @default true
		 */
		RecordAllRawData?:	boolean;
		/**
		 * Instance of VideoFormat.Writer, that defines the format of the output.
		 * @default VideoFormat.SVGAnimation.IO
		 */
		VideoFormat?:		Writer;	
	}
	
	/**
	 * Settings of audio recording. A process handling WebSockets from ther audio recorder
	 * must be running on a server and listening under a specific host name, port and path.
	 *
	 * Audio recording needs a URL of a web worker, that is responsible for communication with the server. 
	 */
	export interface AudioRecorderSettings {
		/**
		 * Port number of the server process.
		 * @default	4000
		 */
		port?: number;
		/**
		 * Host name of the server.
		 * @default	localhost
		 */
		host?: string;
		/**
		 * Specific server route
		 * @default '/'
		 */
		path?: string;
		/**
		 * URL of worker script.
		 */
		recordingWorkerPath?: string; // absolute path to the recording web Worker
	} 
	
		
//}