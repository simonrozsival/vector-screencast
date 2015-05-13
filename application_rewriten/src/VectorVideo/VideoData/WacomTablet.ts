/// <reference path="Mouse.ts" />
/// <reference path="../Helpers/HTML.ts" />

import HTML = Helpers.HTML;

module VideoData {
	
	/**
	 * This is an interface compatible with Wacom Pen API
	 */
	export interface IWacomApi {
		pressure: number;
		pointerType: number;
	}
	
	/**
	 * A small hack - convince TypeScript, that this special HTML element
	 * has the attributes "version" and "penAPI".
	 */
	interface IWacomPlugin extends HTMLElement {
		version: number;
		penAPI: IWacomApi;
	}
	
	/**
	 * Pointer type
	 * see http://www.wacomeng.com/web/WebPluginReleaseNotes.htm#Group_x0020_77
	 */
	enum WacomPointerType {
		OutOfProximity = 0,
		Pen = 1,
		Mouse = 2,
		Eraseer = 3
	}
	
	/**
	 * Wacom tablets can be used to enhance the recording with their ability to detect pen pressure
	 * for variable thickness of drawn lines.  
	 */
	export class WacomTablet extends Mouse {
		
		constructor(board: HTMLElement, private penApi: IWacomApi) {
			super(board); // obligatory parent constructor call
		}
		
		/**
		 * Current level of pressure. 
		 * @return {number}	The pressure from 0.0 to 1.0
		 */
		protected GetPressure() : number {
			if(this.penApi && this.penApi.pointerType == WacomPointerType.Pen) {
				return this.penApi.pressure; // pressure is from 0.0 (no pressure) to 1.0 (max pressure)
			}
		}
		
		/**
		 * Is Wacom API available on this computer and this browser?
		 */
		public static IsAvailable() : IWacomApi {			
			// create the plugin according to the documentation
			var plugin: IWacomPlugin = <IWacomPlugin> HTML.CreateElement("object", { type:	"application/x-wacomtabletplugin" });
			plugin.style.display = "none";
			document.body.appendChild(plugin);
						
			// does the plugin work?
			if(!!plugin.version === true) {
				console.log("Wacom tablet is connected and plugin installed. Plugin version is " + plugin.version + ".");
				return plugin.penAPI;
			}
			
			return null;
		}
		
	}
	
}