
module VideoFormat {
	
	/**
	 * 
	 */
	export enum AnimatedSVGNodeType {
		Info,
		Author,
		Title,
		Description,
		Length,
		AudioTracks,
		AudioSource,
	}
	
	/**
	 * 
	 */
	export enum AnimatedSVGAttributeType {
		AudioType,
	}
	
	/**
	 * 
	 */
	export class AnimatedSVG {
		
		/** The namespace of the Animated SVG */
		static get Namespace() : string { return "http://www.rozsival.com/khan-academy/animated-svg"; }
		
		/**
		 * Convert the AnimatedSVGNodeType value to string name of XML node.
		 */
		static TypeToName(type: AnimatedSVGNodeType) : string {
			switch (type) {
				case AnimatedSVGNodeType.Info: 				return "info";
				case AnimatedSVGNodeType.Author: 			return "author";
				case AnimatedSVGNodeType.Title: 			return "title";
				case AnimatedSVGNodeType.Description:		return "description";
				case AnimatedSVGNodeType.Length: 			return "length";
				case AnimatedSVGNodeType.AudioTracks:		return "audio";
				case AnimatedSVGNodeType.AudioSource:		return "source";
				
				default:
					throw new Error("Given type is unsupported by Animated SVG.");
			}
		}
		
		/**
		 * Convert the string name of XML node to AnimatedSVGNodeType value
		 */
		static NameToType(name: string) : AnimatedSVGNodeType {
			switch (name) {
				case "info":			return AnimatedSVGNodeType.Info; 		
				case "author":			return AnimatedSVGNodeType.Author; 	
				case "title":			return AnimatedSVGNodeType.Title; 	
				case "description":		return AnimatedSVGNodeType.Description;
				case "length":			return AnimatedSVGNodeType.Length; 	
				case "audio":			return AnimatedSVGNodeType.AudioTracks;
				case "source":			return AnimatedSVGNodeType.AudioSource;
				
				default:
					throw new Error(`No Animated SVG node type corresponds to the given name '${name}'`);
			}
		}
		
		/**
		 * Convert the XML attribute of Animated SVG to string 
		 */
		static AttributeToName(attr: AnimatedSVGAttributeType) : string {
			switch (attr) {
				case AnimatedSVGAttributeType.AudioType:			return "type";
				
				default:
					throw new Error("Given attribute is unsupported by Animated SVG."); 
			}
		}
				
		
		/**
		 * Convert the string name of XML attribute to AnimatedSVGAttributeType value
		 */
		static NameToAttribute(name: string) : AnimatedSVGAttributeType {
			switch (name) {
				case "type":			return AnimatedSVGAttributeType.AudioType;
				
				default:
					throw new Error(`No Animated SVG attribute name corresponds to the given name '${name}'`);
			}
		}
		
	}	
	
	
}