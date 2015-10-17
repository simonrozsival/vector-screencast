import { DrawingStrategy } from './DrawingStrategy';
import VideoEvents from '../Helpers/VideoEvents';
import Color from '../UI/Color';
import Path from './Path';
export default class SVGDrawer implements DrawingStrategy {
    protected curved: boolean;
    protected events: VideoEvents;
    SetEvents(events: VideoEvents): void;
    constructor(curved?: boolean);
    private svg;
    private canvas;
    private bg;
    CreateCanvas(): HTMLElement;
    Stretch(): void;
    ClearCanvas(color: Color): void;
    protected currentColor: Color;
    SetCurrentColor(color: Color): void;
    CreatePath(events: VideoEvents): Path;
    SetupOutputCorrection(sourceWidth: number, sourceHeight: number): number;
}
