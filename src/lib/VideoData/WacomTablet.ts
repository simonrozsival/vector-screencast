import VideoEvents, { VideoEventType } from '../Helpers/VideoEvents';
import VideoTimer from '../Helpers/VideoTimer';
import Mouse from './Mouse';
import PointingDevice from './PointingDevice';
import HTML from '../Helpers/HTML';

//namespace VectorScreencast.VideoData {
	
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
	export default class WacomTablet extends Mouse {
		
		constructor(events: VideoEvents, container: HTMLElement, board: HTMLElement, timer: VideoTimer, private penApi: IWacomApi) {
			super(events, container, board, timer);
		}
		
		/**
		 * Current level of pressure. When the mouse is outside of the canvas, then it is automaticaly zero.
		 * @return {number}	The pressure from 0.0 to 1.0
		 */
		protected GetPressure() : number {
			// avoid unnecessary lines outside of the canvas
			if(this.isDown === false || this.isInside === false) {
				return 0;
			}
			
			if(this.penApi && this.penApi.pointerType == WacomPointerType.Pen) {
				return this.isInside === true ? this.penApi.pressure : 0; // pressure is from 0.0 (no pressure) to 1.0 (max pressure)
			} else {
				return super.GetPressure();
			}
		}
		
		/**
		 * Is Wacom API available on this computer and this browser?
		 */
		public static IsAvailable() : IWacomApi {			
			// create the plugin according to the documentation
			var plugin: IWacomPlugin = <IWacomPlugin> HTML.CreateElement("object", { type:	"application/x-wacomtabletplugin" });
			//plugin.style.display = "none";
			document.body.appendChild(plugin);
						
			// does the plugin work?
			if(!!plugin.version === true) {
				console.log("Wacom tablet is connected and plugin installed. Plugin version is " + plugin.version + ".");
				return plugin.penAPI;
			}
			
			return null;
		}
		
	}
	
//}