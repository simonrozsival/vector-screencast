/// <reference path="../../VectorScreencast" />

module VectorScreencast.VideoFormat.JSONAnimation {
	
	import Metadata = VideoData.Metadata;
	
	export interface MetadataJSONFormat {
		length: number,
		width: number,
		height: number,
		audio: Array<AudioSourceJSONFormat>
	}
	
	export interface AudioSourceJSONFormat {
		type: string,
		src: string
	}
	
	export class MetadataFactory {
		
		FromJSON(data: any): Metadata {
			var meta: Metadata = new Metadata();
									
			// [1] video lenght			
			if(data.hasOwnProperty("length") === false) {
				throw new Error(`MetadataFactory error parsing JSON: 'length' is missing`);
			}			
			meta.Length = Number(data.length);
			
			// [2] video width
			if(data.hasOwnProperty("width") === false) {
				throw new Error(`MetadataFactory error parsing JSON: 'width' is missing`);
			}			
			meta.Width = Number(data.width);
			
			// [3] video lenght
			if(data.hasOwnProperty("height") === false) {
				throw new Error(`MetadataFactory error parsing JSON: 'height' is missing`);
			}			
			meta.Height = Number(data.height);
						
			// [4] audio tracks
			meta.AudioTracks = [];
			if(data.hasOwnProperty("audio") === false || Array.isArray(data.audio) === false) {
				throw new Error(`MetadataFactory error parsing JSON: 'audio' is either missing, or is not an array`);
			}
			
			for(var i = 0; i < data.audio.length; i++) {
				var s = data.audio[i];
				if(s.hasOwnProperty("src") === false) throw new Error(`MetadataFactory error parsing JSON: 'audio[${i}]' doesn't have 'src' attr`);
				if(s.hasOwnProperty("type") === false) throw new Error(`MetadataFactory error parsing JSON: 'audio[${i}]' doesn't have 'type' attr`); 
				
				var type: AudioData.AudioSourceType = AudioData.AudioSource.StringToType(s.type);
				meta.AudioTracks.push(new AudioData.AudioSource(s.src, type));
			}
			
			// That's it.
			return meta;
		}
		
		ToJSON(data: Metadata): MetadataJSONFormat {
			// audio tracks
			var audio: Array<AudioSourceJSONFormat> = [];
			for(var i = 0; i < data.AudioTracks.length; i++) {
				audio.push({
					src: data.AudioTracks[i].Url,
					type: data.AudioTracks[i].MimeType
				});
			}			
			
			// That's it.
			return {
				length: data.Length,
				width: data.Width,
				height: data.Height,
				audio: audio
			};
		}
		
	}
	
}