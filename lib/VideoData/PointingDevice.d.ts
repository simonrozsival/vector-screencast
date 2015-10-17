import VideoEvents from '../Helpers/VideoEvents';
import VideoTimer from '../Helpers/VideoTimer';
import Cursor from './Cursor';
export interface PointingDeviceEvent {
    clientX: number;
    clientY: number;
}
export default class PointingDevice {
    protected events: VideoEvents;
    protected board: HTMLElement;
    protected timer: VideoTimer;
    static SelectBestMethod(events: VideoEvents, board: HTMLElement, canvas: HTMLElement, timer: VideoTimer): PointingDevice;
    protected isDown: boolean;
    protected isInside: boolean;
    protected isHoveringOverUIControl: boolean;
    protected cursor: Cursor;
    getCursor(): Cursor;
    constructor(events: VideoEvents, board: HTMLElement, timer: VideoTimer);
    InitControlsAvoiding(): void;
    protected GetPressure(): number;
    protected onMove(e: PointingDeviceEvent): any;
    protected onDown(e: PointingDeviceEvent): any;
    protected onUp(e: PointingDeviceEvent): any;
    protected onLeave(e: PointingDeviceEvent): any;
    protected onOver(e: PointingDeviceEvent): any;
    private onLooseFocus(e);
    protected getCursorPosition(e: PointingDeviceEvent): Cursor;
    private ReportAction();
}
