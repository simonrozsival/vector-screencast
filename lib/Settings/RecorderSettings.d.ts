import Color from '../UI/Color';
import { DrawingStrategy } from '../Drawing/DrawingStrategy';
import * as Localization from '../Localization/Recorder';
import RecorderUI from '../UI/RecorderUI';
import BrushSize from '../UI/Brush';
import { Writer } from '../VideoFormat/VideoFormat';
export interface RecorderSettings {
    UploadURL: string;
    DrawingStrategy?: DrawingStrategy;
    Audio?: AudioRecorderSettings;
    Localization?: Localization.Recorder;
    DefaultBrushColor?: Color;
    DefaultBackgroundColor?: Color;
    BrushSizes?: Array<BrushSize>;
    ColorPallete?: Array<Color>;
    DisableDynamicLineWidth?: boolean;
    UI?: RecorderUI;
    Autohide?: boolean;
    RecordAllRawData?: boolean;
    VideoFormat?: Writer;
}
export interface AudioRecorderSettings {
    port?: number;
    host?: string;
    path?: string;
    recordingWorkerPath?: string;
}
