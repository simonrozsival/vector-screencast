import Metadata from './Metadata';
import Chunk from './Chunk';
export default class Video {
    constructor();
    Metadata: Metadata;
    protected metadata: Metadata;
    protected chunks: Array<Chunk>;
    protected currentChunk: number;
    CurrentChunk: Chunk;
    CurrentChunkNumber: number;
    SetCurrentChunkNumber: number;
    PeekNextChunk(): Chunk;
    MoveNextChunk(): void;
    PushChunk(chunk: Chunk): number;
    Rewind(): void;
    RewindMinusOne(): void;
    FastforwardErasedChunksUntil(time: number): number;
    RewindToLastEraseBefore(time: number): number;
    private FindChunk(time, directionHint);
}
