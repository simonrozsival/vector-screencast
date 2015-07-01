/// <reference path="IO" />
/// <reference path="AnimatedSVG" />
/// <reference path="../VideoData/VideoInfo" />
/// <reference path="../Helpers/State" />
/// <reference path="../Helpers/SVG" />

import Metadata = Video.Metadata;
import State = Helpers.State;
//import SVG = Helpers.SVG;

module VideoFormat {
		
	/**
	 * This class takes video data and converts them into the extended SVG format. 
	 */
	export class AnimatedSVGWriter implements IWritter {
			
		/** The document */
		private document: Document;
								
		/**
		 * Prepare the XML document that will be built.
		 * The namespaces are standard SVG and my custom Animated SVG
		 */
		constructor() {
			var type: DocumentType = document.implementation.createDocumentType('svg:svg', '-//W3C//DTD SVG 1.1//EN', 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd');
			this.document = document.implementation.createDocument('http://www.w3.org/2000/svg', 'svg:svg', type);
			this.document.documentElement.setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns:a", AnimatedSVG.Namespace);
		}
						
		/**
		 * Encode the video information into the SVG format
		 */
		public SetInfo(info: Metadata) : void {
			// store width, height and background information 
			
			
			var infoElement: Element 	= this.document.createElementNS(AnimatedSVG.Namespace, AnimatedSVG.TypeToName(AnimatedSVGNodeType.Info));
						
			// video lenght
			var length: Element	= this.document.createElementNS(AnimatedSVG.Namespace, AnimatedSVG.TypeToName(AnimatedSVGNodeType.Length));
			length.textContent = info.Length.toString(10);
			infoElement.appendChild(length);
			
			// audio tracks
			var audioElement: Element = this.document.createElementNS(AnimatedSVG.Namespace,  AnimatedSVG.TypeToName(AnimatedSVGNodeType.AudioTracks));
			for(var i = 0; i < info.AudioTracks.length; i++) {
				var audioSource = info.AudioTracks[i];
				var source: Element = this.document.createElementNS(AnimatedSVG.Namespace, AnimatedSVG.TypeToName(AnimatedSVGNodeType.AudioSource));
				source.setAttributeNS(AnimatedSVG.Namespace, "type", audioSource.MimeType);
				source.setAttributeNS(AnimatedSVG.Namespace, "src", audioSource.Url);
				audioElement.appendChild(source);			
			}
			infoElement.appendChild(audioElement);
		}
		
		public SetNextState(state: State) : void {
			// @todo
		}
		
		public SetNextPrerenderedLine(line: any) : void {
			var path: Element = <Element> line;
			this.document.rootElement.appendChild(path);
			// @todo
		}
		
		/**
		 * Serialize the output before sending to the server.
		 */
		public ToString() : string {
			return this.document.documentElement.outerHTML;
		}
		
	}
	
}