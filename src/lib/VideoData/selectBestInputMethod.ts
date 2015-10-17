
import PointingDevice from './PointingDevice';
import WacomTablet, { IWacomApi } from './WacomTablet';
import PointerEventsAPI from './Pointer';
import AppleForceTouch from './AppleForceTouch';
import TouchEventsAPI from './Touch';
import VideoEvents from '../Helpers/VideoEvents';
import VideoTimer from '../Helpers/VideoTimer';


export default function selectBestInputMethod(events: VideoEvents, board: HTMLElement, canvas: HTMLElement, timer: VideoTimer): PointingDevice {
	var device: PointingDevice;
	
	// select best input method
	var wacomApi: IWacomApi = WacomTablet.IsAvailable();
	if (wacomApi !== null) { // Wacom plugin is prefered
		device = new WacomTablet(events, board, timer, wacomApi);
		console.log("Wacom WebPAPI is used");
	} else if (window.hasOwnProperty("PointerEvent")) { // pointer events implement pressure-sensitivity
		device = new PointerEventsAPI(events, board, timer);
		console.log("Pointer Events API is used");
	} else if (AppleForceTouch.isAvailable()) {
		device = new AppleForceTouch(events, board, canvas, timer);
		console.log("Apple Force Touch Events over Touch Events API is used");
	} else { // fallback to mouse + touch events
		device = new TouchEventsAPI(events, board, canvas, timer);
		console.log("Touch Events API are used.");
	}
				
	device.InitControlsAvoiding();
	return device;
}