/// <reference path="../Drawing/IDrawingStrategy.ts" />
/// <reference path="../Localization/IRecorderLocalization.ts" />

module Settings {
	
	/**
	 * The inteface of obligatory and possible settings for the Vector Video Recorder
	 */
	export interface IRecorderSettings {
		// obligatory				
		UploadURL:			string;		
		// non-obligatory
		DrawingStrategy?: 	Drawing.IDrawingStrategy;		
		Audio?: 			IAudioRecorderSettings;
		Localization?: 		Localization.IRecorderLocalization,
		ColorPallete?: 		Array<UI.Color>,
		BrushSizes?: 		Array<UI.BrushSize>
	}
	
	export interface IAudioRecorderSettings {
		// audio upload settings
		port?: number;
		host?: string;
		path?: string;
	} 
	
		
}