import VideoEvents from '../Helpers/VideoEvents';
import TouchEventsAPI from './Touch';
import VideoTimer from '../Helpers/VideoTimer';
export default class AppleForceTouch extends TouchEventsAPI {
    private useAppleForceTouchAPI;
    private forceLevel;
    constructor(events: VideoEvents, board: HTMLElement, canvas: HTMLElement, timer: VideoTimer);
    static isAvailable(): boolean;
    GetPressure(): number;
    private checkForce(webkitForce);
}
