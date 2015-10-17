import { DrawingStrategy } from './DrawingStrategy';
import VideoEvents from '../Helpers/VideoEvents';
import Color from '../UI/Color';
import Path from './Path';
export default class CanvasDrawer implements DrawingStrategy {
    protected curved: boolean;
    protected events: VideoEvents;
    SetEvents(events: VideoEvents): void;
    constructor(curved?: boolean);
    private originalWidth;
    private originalHeight;
    private canvas;
    private context;
    CreateCanvas(): HTMLElement;
    Stretch(): void;
    SetupOutputCorrection(sourceWidth: number, sourceHeight: number): number;
    ClearCanvas(color: Color): void;
    protected currentColor: Color;
    SetCurrentColor(color: Color): void;
    CreatePath(events: VideoEvents): Path;
}
