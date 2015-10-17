import VideoEvents from '../../Helpers/VideoEvents';
import Chunk from '../../VideoData/Chunk';
import Command from '../../VideoData/Command';
import CommandFactory from './CommandFactories';
export interface CommandsPair extends Array<Array<Command>> {
    0: Array<Command>;
    1: Array<Command>;
}
export default class ChunkFactory {
    protected next: ChunkFactory;
    constructor(next?: ChunkFactory);
    FromSVG(events: VideoEvents, node: Node, cmdFactory: CommandFactory): Chunk;
    ToSVG(chunk: Chunk, cmdFactory: CommandFactory): Node;
    protected CommandsToSVG(node: Node, cmds: Array<Command>, cmdFactory: CommandFactory, chunkStart: number): Node;
    private static initCmds;
    protected static GetCommands(cmd: Element, cmdFactory: CommandFactory, chunkStart: number): CommandsPair;
}
export declare class VoidChunkFactory extends ChunkFactory {
    private static NodeName;
    FromSVG(events: VideoEvents, node: Element, cmdFactory: CommandFactory): Chunk;
    ToSVG(chunk: Chunk, cmdFactory: CommandFactory): Node;
}
export declare class PathChunkFactory extends ChunkFactory {
    protected next: ChunkFactory;
    private static NodeName;
    private instructionFactory;
    constructor(next?: ChunkFactory);
    FromSVG(events: VideoEvents, node: Element, cmdFactory: CommandFactory): Chunk;
    ToSVG(chunk: Chunk, cmdFactory: CommandFactory): Node;
    private SVGNodeToPath(events, node);
    private PathToSVGNode(path);
}
export declare class EraseChunkFactory extends ChunkFactory {
    private static NodeName;
    Width: number;
    Height: number;
    FromSVG(events: VideoEvents, node: Element, cmdFactory: CommandFactory): Chunk;
    ToSVG(chunk: Chunk, cmdFactory: CommandFactory): Node;
}
