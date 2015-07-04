/// <reference path="../Drawing/DrawingStrategy" />
/// <reference path="../Localization/IPlayerLocalization" />

module Settings {
	
	/**
	 * The inteface of obligatory and possible settings for the Vector Video Recorder
	 */
	export interface IPlayerSettings {
		Source:				string;
		VideoFormat?:		VideoFormat.Reader;
		
		DrawingStrategy?: 	Drawing.DrawingStrategy;
		
		Localization?: 		Localization.IPlayerLocalization;
		UI?:				UI.PlayerUI;
		Autoplay?: 			boolean;
		Autohide?:			boolean;
		ShowControls?:		boolean;
	}	
	
		
}