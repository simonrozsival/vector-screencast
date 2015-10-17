import VideoEvents from '../Helpers/VideoEvents';
import Video from '../VideoData/Video';
export interface Reader {
    LoadVideo(events: VideoEvents, file: any): Video;
    GetExtension(): string;
    GetMimeType(): string;
}
export interface Writer {
    SaveVideo(data: Video): Blob;
    GetExtension(): string;
    GetMimeType(): string;
}
