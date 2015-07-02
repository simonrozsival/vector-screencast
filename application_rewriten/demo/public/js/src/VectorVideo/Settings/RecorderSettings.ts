/// <reference path="../Drawing/DrawingStrategy.ts" />
/// <reference path="../Localization/IRecorderLocalization.ts" />
/// <reference path="../UI/Color" />
/// <reference path="../UI/Brush" />

module Settings {
	
	/**
	 * The inteface of obligatory and possible settings for the Vector Video Recorder
	 */
	export interface IRecorderSettings {
		// obligatory				
		UploadURL:			string;		
		// non-obligatory
		DrawingStrategy?: 	Drawing.DrawingStrategy;		
		Audio?: 			IAudioRecorderSettings;
		Localization?: 		Localization.IRecorderLocalization;
		ColorPallete?: 		Array<UI.Color>;
		BrushSizes?: 		Array<UI.BrushSize>;
		
		UI?:				UI.RecorderUI;			
		Autohide?:			boolean;
	}
	
	export interface IAudioRecorderSettings {
		// audio upload settings
		port?: number;
		host?: string;
		path?: string;
		recordingWorkerPath?: string; // absolute path to the recording web Worker
	} 
	
		
}