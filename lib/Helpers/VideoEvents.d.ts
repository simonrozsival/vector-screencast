export declare enum VideoEventType {
    Start = 0,
    Pause = 1,
    ReachEnd = 2,
    JumpTo = 3,
    VideoInfoLoaded = 4,
    BufferStatus = 5,
    CursorState = 6,
    ChangeColor = 7,
    ChangeBrushSize = 8,
    StartPath = 9,
    DrawSegment = 10,
    DrawPath = 11,
    ClearCanvas = 12,
    RedrawCanvas = 13,
    CanvasSize = 14,
    CanvasScalingFactor = 15,
    CursorOffset = 16,
    RegisterRecordingTool = 17,
    RecordingToolFinished = 18,
    MuteAudioRecording = 19,
    AudioRecordingAvailable = 20,
    AudioRecordingUnavailable = 21,
    StartUpload = 22,
    DownloadData = 23,
    VolumeUp = 24,
    VolumeDown = 25,
    Mute = 26,
    Busy = 27,
    Ready = 28,
    length = 29,
}
export default class VideoEvents {
    private events;
    constructor();
    on(type: VideoEventType, command: Function): void;
    off(type: VideoEventType, command: Function): void;
    trigger(type: VideoEventType, ...args: Array<any>): void;
}
