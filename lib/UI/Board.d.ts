import VideoEvents from '../Helpers/VideoEvents';
import { Panel } from './BasicElements';
export default class Board extends Panel {
    protected events: VideoEvents;
    private cursor;
    Width: number;
    Height: number;
    IsRecording: boolean;
    constructor(id: string, events: VideoEvents);
    private UpdateCursorPosition(state);
    private UpdateCursorSize(size);
    private UpdateCursorColor(color);
    private UpdateCursorScale(scalingFactor);
}
