import VideoEvents from '../Helpers/VideoEvents';
import VideoTimer from '../Helpers/VideoTimer';
import Mouse from './Mouse';
export default class TouchEventsAPI extends Mouse {
    protected canvas: HTMLElement;
    constructor(events: VideoEvents, container: HTMLElement, canvas: HTMLElement, timer: VideoTimer);
    private currentTouch;
    private TouchStart(event);
    protected TouchLeave(event: TouchEvent): void;
    protected TouchEnd(event: TouchEvent): void;
    protected TouchMove(event: TouchEvent): void;
    private filterTouch(touchList);
}
