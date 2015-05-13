/// <reference path="../Drawing/IDrawingStrategy" />
/// <reference path="../Localization/IPlayerLocalization" />

module Settings {
	
	/**
	 * The inteface of obligatory and possible settings for the Vector Video Recorder
	 */
	export interface IPlayerSettings {
		Source:				string,
		DrawingStrategy?: 	Drawing.IDrawingStrategy;
		Localization?: 		Localization.IPlayerLocalization;
	}	
	
		
}