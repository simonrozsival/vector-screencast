/// <reference path="../../src/lib/AudioData/audio.d.ts" />
import VideoEvents from '../Helpers/VideoEvents';
import { AudioSource } from './AudioPlayer';
import { AudioRecorderSettings } from '../Settings/RecorderSettings';
export default class AudioRecorder {
    protected events: VideoEvents;
    private input;
    private recording;
    private scriptProcessorNode;
    private recordingWorker;
    private initSuccessful;
    private doNotStartRecording;
    private muted;
    private settings;
    private error;
    private success;
    constructor(config: AudioRecorderSettings, events: VideoEvents);
    Init(success?: () => any): void;
    private CreateAudioProcessor(processorType, cfg, success?, error?);
    Start(): boolean;
    Continue(): boolean;
    Pause(): boolean;
    Stop(success: (sources: Array<AudioSource>) => any, error: () => void): void;
    isRecording(): boolean;
    private processData(data);
    private ReceiveMessageFromWorker(e);
    private WorkerFinished(msg);
    private WorkerNetworkError();
}
