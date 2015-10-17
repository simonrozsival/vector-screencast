import VideoEvents from '../Helpers/VideoEvents';
import { Panel } from './BasicElements';
export default class TimeLine extends Panel {
    protected events: VideoEvents;
    private length;
    Length: number;
    private progresbar;
    private bufferbar;
    private arrow;
    constructor(id: string, events: VideoEvents);
    private OnClick(e);
    private OnMouseMove(e);
    Sync(time: number): void;
    SetBuffer(time: number): void;
    SkipTo(time: number): void;
}
