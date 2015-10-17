import VideoEvents from '../Helpers/VideoEvents';
import VideoTimer from '../Helpers/VideoTimer';
import PointingDevice from './PointingDevice';
export interface PointingDeviceFactory {
    (events: VideoEvents, board: HTMLElement, timer: VideoTimer): PointingDevice;
}
export default class PointerEventsAPI extends PointingDevice {
    private currentEvent;
    constructor(events: VideoEvents, board: HTMLElement, timer: VideoTimer);
    GetPressure(): number;
    InitControlsAvoiding(): void;
    protected onPointerMove(e: PointerEvent): any;
    protected onPointerDown(e: PointerEvent): any;
    protected onPointerUp(e: PointerEvent): any;
    protected onPointerLeave(e: PointerEvent): any;
    protected onPointerEnter(e: PointerEvent): any;
    protected onPointerOver(e: PointerEvent): any;
}
