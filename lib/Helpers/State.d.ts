import Vector2 from './Vector';
import Color from '../UI/Color';
import BrushSize from '../UI/Brush';
export declare enum StateType {
    ChangeBrushSize = 0,
    ChangeColor = 1,
    Cursor = 2,
}
export declare class State {
    private type;
    private time;
    GetType(): StateType;
    GetTime(): number;
    constructor(type: StateType, time: number);
}
export declare class CursorState extends State {
    private x;
    private y;
    private pressure;
    constructor(time: number, x: number, y: number, pressure: number);
    X: number;
    Y: number;
    Pressure: number;
    getPosition(): Vector2;
}
export declare class ColorState extends State {
    private color;
    constructor(time: number, color: Color);
    Color: Color;
}
export declare class SizeState extends State {
    private size;
    constructor(time: number, size: BrushSize);
    Size: BrushSize;
}
