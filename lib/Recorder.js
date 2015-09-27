var PointingDevice_1 = require('./VideoData/PointingDevice');
var Video_1 = require('./VideoData/Video');
var Chunk_1 = require('./VideoData/Chunk');
var Command_1 = require('./VideoData/Command');
var DynaDraw_1 = require('./Drawing/DynaDraw');
var SVGDrawer_1 = require('./Drawing/SVGDrawer');
var AudioRecorder_1 = require('./AudioData/AudioRecorder');
var VideoEvents_1 = require('./Helpers/VideoEvents');
var Errors_1 = require('./Helpers/Errors');
var VideoTimer_1 = require('./Helpers/VideoTimer');
var Metadata_1 = require('./VideoData/Metadata');
var Color_1 = require('./UI/Color');
var Brush_1 = require('./UI/Brush');
var File_1 = require('./Helpers/File');
var IO_1 = require('./VideoFormat/SVGAnimation/IO');
var RecorderUI_1 = require('./UI/RecorderUI');
var Recorder = (function () {
    function Recorder(id, settings) {
        var _this = this;
        this.id = id;
        this.settings = settings;
        this.events = new VideoEvents_1.default();
        this.isRecording = false;
        this.timer = new VideoTimer_1.default(false);
        this.recordingBlocked = false;
        this.data = new Video_1.default();
        this.lastEraseData = 0;
        this.recordAllRawData = settings.RecordAllRawData !== undefined ? !!settings.RecordAllRawData : true;
        if (!!settings.DefaultBackgroundColor)
            Color_1.default.BackgroundColor = settings.DefaultBackgroundColor;
        if (!!settings.DefaultBrushColor)
            Color_1.default.ForegroundColor = settings.DefaultBrushColor;
        var container = document.getElementById(id);
        if (!container) {
            Errors_1.default.Report(Errors_1.ErrorType.Fatal, "Container #" + id + " doesn't exist. Video Recorder couldn't be initialised.");
            return;
        }
        while (!!container.firstChild) {
            container.removeChild(container.firstChild);
        }
        if (!settings.ColorPallete || settings.ColorPallete.length === 0) {
            var colors = [];
            colors.push(new Color_1.default("#ffffff"));
            colors.push(new Color_1.default("#fa5959"));
            colors.push(new Color_1.default("#8cfa59"));
            colors.push(new Color_1.default("#59a0fa"));
            colors.push(new Color_1.default("#fbff06"));
            colors.push(Color_1.default.BackgroundColor);
            settings.ColorPallete = colors;
        }
        if (!colors.indexOf(Color_1.default.BackgroundColor)) {
            colors.push(Color_1.default.BackgroundColor);
        }
        if (!settings.BrushSizes || settings.BrushSizes.length === 0) {
            var brushes = [];
            brushes.push(new Brush_1.default(2));
            brushes.push(new Brush_1.default(3));
            brushes.push(new Brush_1.default(4));
            brushes.push(new Brush_1.default(6));
            brushes.push(new Brush_1.default(8));
            brushes.push(new Brush_1.default(10));
            brushes.push(new Brush_1.default(15));
            brushes.push(new Brush_1.default(80));
            settings.BrushSizes = brushes;
        }
        if (!settings.Localization) {
            var loc = {
                NoJS: "Your browser does not support JavaScript or it is turned off. Video can't be recorded without enabled JavaScript in your browser.",
                Busy: "Preparing recording studio...",
                RecPause: "Control recording",
                Record: "Start",
                Pause: "Pause recording",
                Upload: "Upload",
                UploadInProgress: "Uploading data...",
                ChangeColor: "Change brush color",
                ChangeSize: "Change brush size",
                Erase: "Eraser",
                EraseAll: "Erase everything",
                WaitingText: "Please be patient. Uploading video usually takes some times - up to a few minutes if your video is over ten minutes long. Do not close this tab or browser window.",
                UploadWasSuccessful: "Upload was successful",
                RedirectPrompt: "Upload was successful - press OK to continue",
                UploadFailure: "Upload failed.",
                FailureApology: "We are sorry, but upload failed. Do you want to download your data to your computer instead?",
                AudioRecording: "Audio recording",
                AudioRecordingAvailable: "Audio recording is available",
                AudioRecordingUnavailable: "Audio recording is unavailable"
            };
            settings.Localization = loc;
        }
        this.events.on(VideoEvents_1.VideoEventType.ChangeBrushSize, function (size) { return _this.ChangeBrushSize(size); });
        this.events.on(VideoEvents_1.VideoEventType.ChangeColor, function (color) { return _this.ChangeColor(color); });
        this.events.on(VideoEvents_1.VideoEventType.CursorState, function (state) { return _this.ProcessCursorState(state); });
        this.events.on(VideoEvents_1.VideoEventType.ClearCanvas, function (color) { return _this.ClearCanvas(color); });
        this.events.on(VideoEvents_1.VideoEventType.Start, function () { return _this.Start(); });
        this.events.on(VideoEvents_1.VideoEventType.Pause, function () { return _this.Pause(); });
        this.events.on(VideoEvents_1.VideoEventType.StartUpload, function () { return _this.StartUpload(); });
        this.busyLevel = 0;
        this.events.on(VideoEvents_1.VideoEventType.Busy, function () { return _this.Busy(); });
        this.events.on(VideoEvents_1.VideoEventType.Ready, function () { return _this.Ready(); });
        this.events.on(VideoEvents_1.VideoEventType.StartPath, function (path) {
            _this.PushChunk(new Chunk_1.PathChunk(path, _this.timer.CurrentTime(), _this.lastEraseData));
            _this.data.CurrentChunk.PushCommand(new Command_1.DrawNextSegment(_this.timer.CurrentTime()));
        });
        this.events.on(VideoEvents_1.VideoEventType.DrawSegment, function () { return _this.data.CurrentChunk.PushCommand(new Command_1.DrawNextSegment(_this.timer.CurrentTime())); });
        var min = brushes.reduce(function (previousValue, currentValue, index, arr) { return previousValue.Size < currentValue.Size ? previousValue : currentValue; }).Size;
        var max = brushes.reduce(function (previousValue, currentValue, index, arr) { return previousValue.Size > currentValue.Size ? previousValue : currentValue; }).Size;
        this.drawer = !!settings.DrawingStrategy ? settings.DrawingStrategy : new SVGDrawer_1.default(true);
        this.drawer.SetEvents(this.events);
        this.dynaDraw = new DynaDraw_1.default(this.events, function () { return _this.drawer.CreatePath(_this.events); }, !settings.DisableDynamicLineWidth, min, max, this.timer);
        this.ui = !!settings.UI ? settings.UI : new RecorderUI_1.default(id, this.events);
        this.ui.Timer = this.timer;
        this.ui.Localization = settings.Localization;
        this.ui.SetBusyText(settings.Localization.Busy);
        this.ui.CreateHTML(!!settings.Autohide, settings.ColorPallete, settings.BrushSizes);
        var canvas = this.drawer.CreateCanvas();
        this.ui.AcceptCanvas(canvas);
        container.appendChild(this.ui.GetHTML());
        this.drawer.Stretch();
        this.pointer = PointingDevice_1.default.SelectBestMethod(this.events, this.ui.GetHTML(), canvas, this.timer);
        if (!!settings.Audio) {
            this.audioRecorder = new AudioRecorder_1.default(settings.Audio, this.events);
            this.audioRecorder.Init();
        }
        this.ClearCanvas(Color_1.default.BackgroundColor);
        this.events.trigger(VideoEvents_1.VideoEventType.ChangeColor, Color_1.default.ForegroundColor);
        this.events.trigger(VideoEvents_1.VideoEventType.ChangeBrushSize, new Brush_1.default(5));
    }
    Object.defineProperty(Recorder.prototype, "Events", {
        get: function () { return this.events; },
        enumerable: true,
        configurable: true
    });
    Recorder.prototype.Start = function () {
        if (this.isRecording === false) {
            this.isRecording = true;
            this.PushChunk(new Chunk_1.VoidChunk(this.timer.CurrentTime(), this.lastEraseData));
            this.timer.Resume();
            if (this.audioRecorder) {
                this.audioRecorder.Start();
            }
        }
    };
    Recorder.prototype.Pause = function () {
        if (this.isRecording === true) {
            this.isRecording = false;
            this.PushChunk(new Chunk_1.VoidChunk(this.timer.CurrentTime(), this.lastEraseData));
            this.timer.Pause();
            if (this.audioRecorder) {
                this.audioRecorder.Pause();
            }
        }
    };
    Recorder.prototype.StartUpload = function () {
        var _this = this;
        this.recordingBlocked = true;
        var info = new Metadata_1.default();
        info.Length = this.timer.CurrentTime();
        info.Width = this.ui.Width;
        info.Height = this.ui.Height;
        info.AudioTracks = [];
        this.data.Metadata = info;
        if (!!this.audioRecorder
            && this.audioRecorder.isRecording()) {
            this.audioRecorder.Stop(function (files) {
                _this.data.Metadata.AudioTracks = files;
                _this.UploadData();
            }, function () {
                _this.FinishRecording(false);
            });
        }
        else {
            this.UploadData();
        }
    };
    Recorder.prototype.ChangeBrushSize = function (size) {
        !this.recordingBlocked && this.data.CurrentChunk.PushCommand(new Command_1.ChangeBrushSize(size, this.timer.CurrentTime()));
        this.dynaDraw.SetBrushSize(size);
    };
    Recorder.prototype.ChangeColor = function (color) {
        !this.recordingBlocked && this.data.CurrentChunk.PushCommand(new Command_1.ChangeBrushColor(color, this.timer.CurrentTime()));
        this.drawer.SetCurrentColor(color);
    };
    Recorder.prototype.ProcessCursorState = function (state) {
        !this.recordingBlocked
            && (this.recordAllRawData || this.isRecording)
            && this.data.CurrentChunk.PushCommand(new Command_1.MoveCursor(state.X, state.Y, this.recordAllRawData ? state.Pressure : 0, this.timer.CurrentTime()));
        this.dynaDraw.ObserveCursorMovement(state);
    };
    Recorder.prototype.ClearCanvas = function (color) {
        var time = this.timer.CurrentTime();
        this.lastEraseData = this.PushChunk(new Chunk_1.EraseChunk(color, time, this.lastEraseData));
        this.data.CurrentChunk.PushCommand(new Command_1.ClearCanvas(color, time));
        this.drawer.ClearCanvas(color);
    };
    Recorder.prototype.PushChunk = function (chunk) {
        return this.data.PushChunk(chunk);
    };
    Recorder.prototype.Busy = function () {
        this.busyLevel++;
        this.wasRecordingWhenBusy = this.wasRecordingWhenBusy || this.isRecording;
        this.events.trigger(VideoEvents_1.VideoEventType.Pause);
        this.ui.Busy();
    };
    Recorder.prototype.Ready = function () {
        if (--this.busyLevel === 0) {
            if (this.wasRecordingWhenBusy === true) {
                this.events.trigger(VideoEvents_1.VideoEventType.Start);
                this.wasRecordingWhenBusy = false;
            }
            this.ui.Ready();
        }
    };
    Recorder.prototype.UploadData = function () {
        var _this = this;
        var writer = !!this.settings.VideoFormat ? this.settings.VideoFormat : new IO_1.default();
        var videoBlob = writer.SaveVideo(this.data);
        console.log(videoBlob);
        this.events.on(VideoEvents_1.VideoEventType.DownloadData, function () {
            File_1.default.Download(videoBlob, "recorded-animation." + writer.GetExtension());
        });
        this.ui.SetBusyText(this.settings.Localization.UploadInProgress);
        this.events.trigger(VideoEvents_1.VideoEventType.Busy);
        var formData = new FormData();
        formData.append("extension", writer.GetExtension());
        formData.append("file", videoBlob);
        var req = new XMLHttpRequest();
        req.open("POST", this.settings.UploadURL, true);
        req.onerror = function (e) { return _this.FinishRecording(false); };
        req.onload = function (e) {
            var response = JSON.parse(req.response);
            if (req.status === 200
                && response.hasOwnProperty("success")
                && response.success === true) {
                var url = response.hasOwnProperty("redirect") ? response.redirect : false;
                _this.FinishRecording(true, url);
            }
            else {
                _this.FinishRecording(false);
            }
        };
        req.send(formData);
    };
    Recorder.prototype.FinishRecording = function (success, url) {
        if (success === true) {
            this.ui.SetBusyText(this.settings.Localization.UploadWasSuccessful);
            if (typeof url === "string") {
                if (confirm(this.settings.Localization.RedirectPrompt)) {
                    window.location.replace(url);
                }
            }
            else {
                alert(this.settings.Localization.UploadWasSuccessful);
            }
        }
        else {
            this.ui.SetBusyText(this.settings.Localization.UploadFailure);
            if (confirm(this.settings.Localization.FailureApology)) {
                this.events.trigger(VideoEvents_1.VideoEventType.DownloadData);
            }
        }
    };
    return Recorder;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Recorder;
