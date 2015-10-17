import Color from '../UI/Color';
import VideoEvents from '../Helpers/VideoEvents';
import Path from './Path';
export interface DrawingStrategy {
    CreateCanvas(): HTMLElement;
    Stretch(): void;
    ClearCanvas(color: Color): void;
    CreatePath(events: VideoEvents): Path;
    SetCurrentColor(color: Color): void;
    SetupOutputCorrection(sourceWidth: number, sourceHeight: number): number;
    SetEvents(events: VideoEvents): void;
}
