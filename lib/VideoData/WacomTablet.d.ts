import VideoEvents from '../Helpers/VideoEvents';
import VideoTimer from '../Helpers/VideoTimer';
import Mouse from './Mouse';
import PointingDevice from './PointingDevice';
export interface IWacomApi {
    pressure: number;
    pointerType: number;
}
export default class WacomTablet extends Mouse {
    private penApi;
    constructor(events: VideoEvents, board: HTMLElement, timer: VideoTimer, penApi: IWacomApi);
    static Factory(api: IWacomApi): (events: VideoEvents, board: HTMLElement, timer: VideoTimer) => PointingDevice;
    protected GetPressure(): number;
    static IsAvailable(): IWacomApi;
}
