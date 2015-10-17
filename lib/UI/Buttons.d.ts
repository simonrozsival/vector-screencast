import Color from './Color';
import { Button } from './BasicElements';
import BrushSize from './Brush';
import VideoEvents from '../Helpers/VideoEvents';
export declare class ChangeColorButton extends Button {
    protected events: VideoEvents;
    private static active;
    private color;
    constructor(events: VideoEvents, color: Color, callback?: Function);
    private ChangeColor(e);
    SetColor(color: Color): void;
}
export declare class ChangeBrushSizeButton extends Button {
    protected events: VideoEvents;
    private size;
    private static active;
    constructor(events: VideoEvents, size: BrushSize);
    private ChangeSize(e);
}
