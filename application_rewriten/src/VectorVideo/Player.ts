/// <reference path="Helpers/Errors" />
/// <reference path="Drawing/IDrawingStrategy" />
/// <reference path="Drawing/SVGDrawer" />
/// <reference path="Settings/PlayerSettings" />
/// <reference path="UI/PlayerUI" />
/// <reference path="VideoData/AudioPlayer" />
/// <reference path="VideoData/Video" />
/// <reference path="VideoFormat/IO" />
/// <reference path="VideoFormat/AnimatedSVGReader" />

import Errors = Helpers.Errors;
import ErrorType = Helpers.ErrorType;
import AudioPlayer = VideoData.AudioPlayer;

module VectorVideo {
    
    export class Player {
        
        /** The UI */        
        private ui: UI.PlayerUI;
        
        /** Drawing strategy */
        private drawer: IDrawingStrategy;
        
        constructor(id: string, private settings: Settings.IPlayerSettings) {
            var container: HTMLElement = document.getElementById(id);
            if(!container) {
				Errors.Report(ErrorType.Fatal, `Container #${id} doesn't exist. Video Player couldn't be initialised.`);
            }
                       
            // init the UI
            this.ui = new UI.PlayerUI(id, settings.Localization);
            this.drawer = new SVGDrawer();
            this.ui.AcceptCanvas(this.drawer.GetCanvas());
                        
            // read the file
            var reader: VideoFormat.IReader = new VideoFormat.AnimatedSVGReader();
            var videoFile: VideoData.Video = new VideoData.Video(settings.Source, reader);
            var audioPlayer = new AudioPlayer(reader.GetInfo().AudioTracks);
            
            // @todo
        }
        
    }
}

