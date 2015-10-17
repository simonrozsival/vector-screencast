import VideoEvents from '../Helpers/VideoEvents';
import Color from '../UI/Color';
import BrushSize from '../UI/Brush';
export default class Command {
    private time;
    Time: number;
    constructor(time: number);
    Execute(events: VideoEvents): void;
    Clone(): Command;
}
export declare class MoveCursor extends Command {
    protected x: number;
    protected y: number;
    protected p: number;
    X: number;
    Y: number;
    P: number;
    constructor(x: number, y: number, p: number, time: number);
    Execute(events: VideoEvents): void;
    Clone(): Command;
}
export declare class DrawNextSegment extends Command {
    Execute(events: VideoEvents): void;
    Clone(): Command;
}
export declare class ChangeBrushColor extends Command {
    protected color: Color;
    Color: Color;
    constructor(color: Color, time: number);
    Execute(events: VideoEvents): void;
    Clone(): Command;
}
export declare class ChangeBrushSize extends Command {
    protected size: BrushSize;
    Size: BrushSize;
    constructor(size: BrushSize, time: number);
    Execute(events: VideoEvents): void;
    Clone(): Command;
}
export declare class ClearCanvas extends Command {
    protected color: Color;
    Color: Color;
    constructor(color: Color, time: number);
    Execute(events: VideoEvents): void;
    Clone(): Command;
}
