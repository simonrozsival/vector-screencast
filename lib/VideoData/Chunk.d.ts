import VideoEvents from '../Helpers/VideoEvents';
import Command from './Command';
import Path from '../Drawing/Path';
import Color from '../UI/Color';
export default class Chunk {
    protected time: number;
    protected lastErase: number;
    StartTime: number;
    LastErase: number;
    private initCommands;
    private commands;
    private cmdIterator;
    CurrentCommand: Command;
    PeekNextCommand(): Command;
    MoveNextCommand(): void;
    Rewind(): void;
    constructor(time: number, lastErase: number);
    ExecuteInitCommands(events: VideoEvents): void;
    GetCommand(i: number): Command;
    PushCommand(cmd: Command): void;
    Commands: Array<Command>;
    InitCommands: Array<Command>;
    Render(events: VideoEvents): void;
}
export declare class VoidChunk extends Chunk {
    Render(): void;
}
export declare class PathChunk extends Chunk {
    protected path: Path;
    Path: Path;
    constructor(path: Path, time: number, lastErase: number);
    Render(events: VideoEvents): void;
}
export declare class EraseChunk extends Chunk {
    protected color: Color;
    Color: Color;
    ExecuteInitCommands(events: VideoEvents): void;
    Render(events: VideoEvents): void;
    constructor(color: Color, time: number, lastErase: number);
}
