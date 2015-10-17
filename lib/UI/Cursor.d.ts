import Vector2 from '../Helpers/Vector';
import { SimpleElement } from './BasicElements';
import BrushSize from './Brush';
import VideoEvents from '../Helpers/VideoEvents';
import Color from './Color';
export default class Cursor extends SimpleElement {
    protected events: VideoEvents;
    protected radius: number;
    protected svg: Element;
    protected dot: Element;
    protected position: Vector2;
    protected offset: Vector2;
    Offset: Vector2;
    protected stroke: number;
    protected scalingFactor: number;
    protected size: BrushSize;
    constructor(events: VideoEvents);
    private bgColor;
    private color;
    private CreateHTML();
    MoveTo(x: number, y: number): void;
    ChangeColor(color: Color): void;
    ChangeSize(size: BrushSize): void;
    SetScalingFactor(sf: number): void;
}
