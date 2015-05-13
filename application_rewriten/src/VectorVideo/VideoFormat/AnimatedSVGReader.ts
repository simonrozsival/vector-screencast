/// <reference path="IO" />
/// <reference path="AnimatedSVGWriter" />
/// <reference path="../VideoData/AudioPlayer" />
/// <reference path="../Helpers/Errors" />
/// <reference path="../VideoData/IVideoInfo" />

import AudioSourceType = VideoData.AudioSourceType;
import AudioSource = VideoData.AudioSource;

module VideoFormat {
	
	export class AnimatedSVGReader implements IReader {		
		
		/** The input file */
		private file: XMLDocument;
		
		/**
		 * Open and parse the input
		 */
		public ReadFile(file: XMLDocument) : void {
			this.file = file;
			// Make a simple test - is it an SVG or not? The file might be invalid or corrupt, but that will be revield later. 
			if(!file.firstChild || file.firstChild.nodeName.toUpperCase() !== "SVG") {					
				Errors.Report(ErrorType.Fatal, "Can't read input file - it is not an SVG file.");	
			}
		}
		
		/**
		 * Extracts information about the video from the extended SVG
		 */
		public GetInfo() : IVideoInfo {
			var videoInfo: IVideoInfo;
			
			// width and height are parameters of SVG root element
			if(this.file.rootElement.hasAttributeNS(SVG.Namespace, "width")) {
				videoInfo.Width = Number(this.file.rootElement.attributes.getNamedItemNS(SVG.Namespace, "width"));
			} else {
				Errors.Report(ErrorType.Fatal, "SVG doesn't have the width attribute.");	
			}			
			// the same for height...
			if(this.file.rootElement.hasAttributeNS(SVG.Namespace, "height")) {
				videoInfo.Height = Number(this.file.rootElement.attributes.getNamedItemNS(SVG.Namespace, "height"));
			} else {
				Errors.Report(ErrorType.Fatal, "SVG doesn't have the height attribute.");	
			}			
			
			// @todo - Background
			videoInfo.BackgroundColor = "black";
						
			// search for <info> element
			var infoSearch: NodeList = this.file.getElementsByTagNameNS(AnimatedSVG.Namespace, AnimatedSVG.TypeToName(AnimatedSVGNodeType.Info));
			if(infoSearch.length !== 1) { // there must be ONE <info> element
				Errors.Report(ErrorType.Fatal, `SVG file doesn't contain ${AnimatedSVG.TypeToName(AnimatedSVGNodeType.Info)} element.`);
			}
			
			// the very info element
			var info: Node = infoSearch.item(0);
			
			// go through all it's children and save their values
			for(var i = 0; i < info.childNodes.length; i++) {
				var node: Node = info.childNodes.item(i);
				
				switch(AnimatedSVG.NameToType(node.nodeName)) {
					case AnimatedSVGNodeType.Author:
						videoInfo.AuthorName = node.textContent;
						break;
					case AnimatedSVGNodeType.Title:
						videoInfo.VideoTitle = node.textContent;
						break;
					case AnimatedSVGNodeType.Description:
						videoInfo.VideoDescription = node.textContent;
						break;
					case AnimatedSVGNodeType.AudioTracks:
						this.LoadAudioSources(videoInfo, node);
						break;
					default:
						Errors.Report(ErrorType.Fatal, `Unexpected node ${node.nodeName} inside the ${AnimatedSVG.TypeToName(AnimatedSVGNodeType.Info)} element.`);
				}
			}
			
			if(videoInfo.AudioTracks.length === 0) {
				Errors.Report(ErrorType.Warning, "No audio is available.");
			}
			
			return videoInfo;
		}
		
		/**
		 * Loads all given audio sources
		 * @param	info	Extracted information goes here
		 * @param	audio	XML node containing information about audio audio sources 
		 */
		private LoadAudioSources(info: IVideoInfo, audio: Node) : void {
			for (var i = 0; i < audio.childNodes.length; i++) {
				var element = audio.childNodes[i];
				var type: Attr = element.attributes.getNamedItemNS(AnimatedSVG.Namespace, AnimatedSVG.AttributeToName(AnimatedSVGAttributeType.AudioType));
				if(!!type) {
					info.AudioTracks.push(new AudioSource(element.textContent, AudioSource.StringToType(type.textContent)));
				}				
			}
		}
		
		/**
		 * Return next state
		 */
		public GetNextState() : State {
			// @todo
			return null;
		}
		
		/**
		 * 
		 */
		public GetNextPrerenderedLine() : any {			
			// @todo
			return null;
		}
		
		/**
		 * 
		 */
		public GetNextPrerenderedLineFinishTime() : number {
			// @todo
			return 0;
		}
	}
	
}