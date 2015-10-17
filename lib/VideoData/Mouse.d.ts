import VideoEvents from '../Helpers/VideoEvents';
import PointingDevice, { PointingDeviceEvent } from './PointingDevice';
import VideoTimer from '../Helpers/VideoTimer';
export default class Mouse extends PointingDevice {
    constructor(events: VideoEvents, board: HTMLElement, timer: VideoTimer);
    InitControlsAvoiding(): void;
    protected onMouseMove(e: PointingDeviceEvent): any;
    protected onMouseDown(e: PointingDeviceEvent): any;
    protected onMouseUp(e: PointingDeviceEvent): any;
    protected onMouseLeave(e: PointingDeviceEvent): any;
    protected onMouseEnter(e: MouseEvent): any;
    protected onMouseOver(e: PointingDeviceEvent): any;
}
