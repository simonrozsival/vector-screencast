/// <reference path="../../VectorScreencast" />

module VectorScreencast.VideoFormat.SVGAnimation {
	
	import Metadata = VideoData.Metadata;
	import SVG = Helpers.SVG;
	import SVGA = Helpers.SVGA;
	
	export class MetadataFactory {
		
		FromSVG(rootNode: Element): Metadata {
			var meta: Metadata = new Metadata();
			
			// [0] is this the correct element?
			if (rootNode.localName !== "metadata") {
				throw new Error(`MetadataFactory error parsing SVG: Wrong metadata element ${rootNode.localName}`);
			}
						
			// [1] video lenght			
			var length: Element = rootNode.firstElementChild;
			if(length.localName !== "length") {
				throw new Error(`MetadataFactory error parsing SVG: Expected 'length', found '${length.nodeName}'`);
			}
			
			meta.Length = Number(length.textContent);
			
			// [2] video width
			var width: Element = length.nextElementSibling;
			length = null;
			if(width.localName !== "width") {
				throw new Error(`MetadataFactory error parsing SVG: Expected 'length', found '${width.nodeName}'`);
			}
			
			meta.Width = Number(width.textContent);
			
			// [3] video lenght
			var height: Element = width.nextElementSibling;
			width = null;
			if(height.localName !== "height") {
				throw new Error(`MetadataFactory error parsing SVG: Expected 'length', found '${height.nodeName}'`);
			}
			
			meta.Height = Number(height.textContent);
						
			// [4] audio tracks
			meta.AudioTracks = [];
			var audioElement: Element = height.nextElementSibling;
			var audioSource: Element = audioElement.firstElementChild;
			while(!!audioSource) {
				var type: AudioData.AudioSourceType = AudioData.AudioSource.StringToType(SVGA.attr(audioSource, "type"));
				meta.AudioTracks.push(new AudioData.AudioSource(SVGA.attr(audioSource, "src"), type));
				audioSource = audioSource.nextElementSibling;
			}
			
			// That's it.
			return meta;
		}
		
		ToSVG(data: Metadata): Node {			
			// the "root" element
			var meta: Node = SVGA.CreateElement("metadata");
			
			// video lenght
			var length: Node = SVGA.CreateElement("length");
			length.textContent = data.Length.toFixed(3);
			meta.appendChild(length);
			length = null;
			
			// original video width
			var width: Node = SVGA.CreateElement("width");
			width.textContent = data.Width.toFixed(0);
			meta.appendChild(width);
			width = null;
						
			// original video height
			var height: Node = SVGA.CreateElement("height");
			height.textContent = data.Height.toFixed(0);
			meta.appendChild(height);
			height = null;
						
			// audio tracks
			var audioElement: Node = SVGA.CreateElement("audio");
			for(var i = 0; i < data.AudioTracks.length; i++) {
				var audioSource = data.AudioTracks[i];
				var source: Node = SVGA.CreateElement("source", {
					"type": audioSource.MimeType,
					"src": audioSource.Url
				});
				audioElement.appendChild(source);			
				source = null;
			}
			meta.appendChild(audioElement);			
			
			// That's it.
			return meta;
		}
		
	}
	
}