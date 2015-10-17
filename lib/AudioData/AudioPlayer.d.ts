/// <reference path="../../src/lib/AudioData/audio.d.ts" />
import VideoEvents from '../Helpers/VideoEvents';
export declare enum AudioSourceType {
    MP3 = 0,
    OGG = 1,
    WAV = 2,
}
export declare class AudioSource {
    private url;
    private type;
    Url: string;
    Type: AudioSourceType;
    MimeType: string;
    constructor(url: string, type: AudioSourceType);
    static StringToType(type: string): AudioSourceType;
}
export default class AudioPlayer {
    protected events: VideoEvents;
    private isReady;
    IsReady: boolean;
    private audio;
    private playing;
    private reachedEnd;
    constructor(events: VideoEvents, sources: Array<AudioSource>);
    private CreateAudio(sources);
    private InitAudio();
    private triggeredBusyState;
    private Busy();
    private Ready();
    Play(): void;
    private InitiatePlay();
    Pause(): void;
    ReachedEnd(): void;
    Replay(): void;
    Rewind(): void;
    private checkPreloaded;
    private MonitorBufferingAsync();
    JumpTo(progress: number): void;
    private ChangePosition(seconds);
    private Mute();
    private VolumeUp();
    private VolumeDown();
}
