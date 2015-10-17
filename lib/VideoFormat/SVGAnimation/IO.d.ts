import Video from '../../VideoData/Video';
import VideoEvents from '../../Helpers/VideoEvents';
import { Writer, Reader } from '../VideoFormat';
export default class IO implements Writer, Reader {
    private chunkFactory;
    private commandFactory;
    private metadataFactory;
    private eraseChunkFactory;
    constructor();
    private VideoChunksLayerType;
    SaveVideo(data: Video): Blob;
    LoadVideo(events: VideoEvents, doc: any): Video;
    GetExtension(): string;
    GetMimeType(): string;
}
