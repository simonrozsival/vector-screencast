import Command from '../../VideoData/Command';
export default class CommandFactory {
    protected next: CommandFactory;
    constructor(next?: CommandFactory);
    FromSVG(node: Node, chunkStart: number): Command;
    protected getCmdTime(el: Node, chunkStart: number): number;
    ToSVG(cmd: Command, chunkStart: number): Node;
    protected storeTime(el: Node, time: number): void;
}
export declare class MoveCursorFactory extends CommandFactory {
    private static NodeName;
    FromSVG(node: Node, chunkStart: number): Command;
    ToSVG(cmd: Command, chunkStart: number): Node;
}
export declare class DrawSegmentFactory extends CommandFactory {
    private static NodeName;
    FromSVG(node: Node, chunkStart: number): Command;
    ToSVG(cmd: Command, chunkStart: number): Node;
}
export declare class ChangeBrushColorFactory extends CommandFactory {
    private static NodeName;
    FromSVG(node: Node, chunkStart: number): Command;
    ToSVG(cmd: Command, chunkStart: number): Node;
}
export declare class ChangeBrushSizeFactory extends CommandFactory {
    private static NodeName;
    FromSVG(node: Node, chunkStart: number): Command;
    ToSVG(cmd: Command, chunkStart: number): Node;
}
export declare class ClearCanvasFactory extends CommandFactory {
    private static NodeName;
    FromSVG(node: Node, chunkStart: number): Command;
    ToSVG(cmd: Command, chunkStart: number): Node;
}
