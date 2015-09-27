var AudioPlayer_1 = require('./AudioData/AudioPlayer');
var VideoEvents_1 = require('./Helpers/VideoEvents');
var Errors_1 = require('./Helpers/Errors');
var PlayerUI_1 = require('./UI/PlayerUI');
var VideoTimer_1 = require('./Helpers/VideoTimer');
var CanvasDrawer_1 = require('./Drawing/CanvasDrawer');
var Command_1 = require('./VideoData/Command');
var Chunk_1 = require('./VideoData/Chunk');
var File_1 = require('./Helpers/File');
var IO_1 = require('./VideoFormat/SVGAnimation/IO');
var Player = (function () {
    function Player(id, settings) {
        var _this = this;
        this.settings = settings;
        this.lastMouseMoveState = null;
        this.events = new VideoEvents_1.default();
        var container = document.getElementById(id);
        if (!container) {
            Errors_1.default.Report(Errors_1.ErrorType.Fatal, "Container #" + id + " doesn't exist. Video Player couldn't be initialised.");
        }
        while (!!container.firstChild) {
            container.removeChild(container.firstChild);
        }
        if (!settings.Localization) {
            var loc = {
                NoJS: "Your browser does not support JavaScript or it is turned off. Video can't be recorded without enabled JavaScript in your browser.",
                DataLoadingFailed: "Unfortunatelly, downloading data failed.",
                DataIsCorrupted: "This video can't be played, the data is corrupted.",
                ControlPlayback: "Play/Pause video",
                Play: "Play",
                Pause: "Pause",
                Replay: "Replay",
                TimeStatus: "Video progress",
                VolumeControl: "Volume controls",
                VolumeUp: "Volume up",
                VolumeDown: "Volume down",
                Mute: "Mute",
                Busy: "Loading..."
            };
            settings.Localization = loc;
        }
        this.timer = new VideoTimer_1.default(false);
        this.ui = !!settings.UI ? settings.UI : new PlayerUI_1.default(id, this.events);
        this.ui.Timer = this.timer;
        this.ui.Localization = settings.Localization;
        if (!!settings.ShowControls) {
            this.ui.CreateControls(!!settings.Autohide);
        }
        this.drawer = !!settings.DrawingStrategy ? settings.DrawingStrategy : new CanvasDrawer_1.default(true);
        this.drawer.SetEvents(this.events);
        this.ui.AcceptCanvas(this.drawer.CreateCanvas());
        container.appendChild(this.ui.GetHTML());
        this.events.on(VideoEvents_1.VideoEventType.Start, function () { return _this.Play(); });
        this.events.on(VideoEvents_1.VideoEventType.Pause, function () { return _this.Pause(); });
        this.events.on(VideoEvents_1.VideoEventType.ReachEnd, function () { return _this.Pause(); });
        this.events.on(VideoEvents_1.VideoEventType.ClearCanvas, function (color) { return _this.ClearCavnas(color); });
        this.events.on(VideoEvents_1.VideoEventType.ChangeColor, function (color) { return _this.drawer.SetCurrentColor(color); });
        this.events.on(VideoEvents_1.VideoEventType.JumpTo, function (progress) { return _this.JumpTo(progress); });
        this.events.on(VideoEvents_1.VideoEventType.DrawSegment, function () { return _this.DrawSegment(); });
        this.events.on(VideoEvents_1.VideoEventType.DrawPath, function (path) {
            _this.drawnPath.DrawWholePath();
            _this.drawnPath = null;
        });
        this.busyLevel = 0;
        this.events.on(VideoEvents_1.VideoEventType.Busy, function () { return _this.Busy(); });
        this.events.on(VideoEvents_1.VideoEventType.Ready, function () { return _this.Ready(); });
        this.ui.SetBusyText(settings.Localization.Busy);
        this.events.trigger(VideoEvents_1.VideoEventType.Busy);
        File_1.default.ReadFileAsync(settings.Source, function (file) {
            _this.ProcessVideoData(file);
            _this.MonitorResize(container);
            window.onresize = function () { return _this.MonitorResize(container); };
        }, function (errStatusCode) {
            Errors_1.default.Report(Errors_1.ErrorType.Warning, _this.settings.Localization.DataLoadingFailed);
            _this.ui.SetBusyText(settings.Localization.DataLoadingFailed);
        });
    }
    Object.defineProperty(Player.prototype, "Events", {
        get: function () { return this.events; },
        enumerable: true,
        configurable: true
    });
    Player.prototype.MonitorResize = function (container) {
        var rect = container.getBoundingClientRect();
        if (rect.width !== this.oldWidth || rect.height !== this.oldHeight) {
            this.drawer.Stretch();
            var scalingFactor = this.drawer.SetupOutputCorrection(this.video.Metadata.Width, this.video.Metadata.Height);
            this.events.trigger(VideoEvents_1.VideoEventType.CanvasScalingFactor, scalingFactor);
            if (!!this.video) {
                this.RedrawCurrentScreen();
            }
            this.oldWidth = rect.width;
            this.oldHeight = rect.height;
        }
    };
    Player.prototype.ProcessVideoData = function (data) {
        try {
            var reader = !!this.settings.VideoFormat ? this.settings.VideoFormat : new IO_1.default();
            this.video = reader.LoadVideo(this.events, data);
            reader = null;
            this.audio = new AudioPlayer_1.default(this.events, this.video.Metadata.AudioTracks);
        }
        catch (e) {
            reader = null;
            this.video = null;
            this.audio = null;
            this.ui.SetBusyText(this.settings.Localization.DataIsCorrupted);
            return;
        }
        this.events.trigger(VideoEvents_1.VideoEventType.VideoInfoLoaded, this.video.Metadata);
        this.video.RewindMinusOne();
        this.MoveToNextChunk();
        this.events.trigger(VideoEvents_1.VideoEventType.Ready);
        if (!!this.settings.Autoplay) {
            this.events.trigger(VideoEvents_1.VideoEventType.Start);
        }
    };
    Player.prototype.Play = function () {
        var _this = this;
        this.isPlaying = true;
        this.timer.Resume();
        !!this.audio && this.audio.Play();
        this.ticking = requestAnimationFrame(function () { return _this.Tick(); });
    };
    Player.prototype.Pause = function () {
        this.timer.Pause();
        this.isPlaying = false;
        !!this.audio && this.audio.Pause();
        cancelAnimationFrame(this.ticking);
    };
    Player.prototype.Tick = function () {
        var _this = this;
        this.Sync();
        this.ticking = requestAnimationFrame(function () { return _this.Tick(); });
    };
    Player.prototype.Sync = function () {
        while (!!this.video.CurrentChunk) {
            if (this.video.CurrentChunk.CurrentCommand === undefined) {
                this.MoveToNextChunk();
                if (!this.video.CurrentChunk
                    || !this.video.CurrentChunk.CurrentCommand) {
                    if (this.timer.CurrentTime() >= this.video.Metadata.Length) {
                        this.ReachedEnd();
                    }
                    break;
                }
            }
            if (this.video.CurrentChunk.CurrentCommand.Time > this.timer.CurrentTime()) {
                break;
            }
            if (this.video.CurrentChunk.CurrentCommand instanceof Command_1.MoveCursor) {
                this.lastMouseMoveState = this.video.CurrentChunk.CurrentCommand;
            }
            else {
                this.video.CurrentChunk.CurrentCommand.Execute(this.events);
            }
            this.video.CurrentChunk.MoveNextCommand();
        }
        if (this.lastMouseMoveState !== null) {
            this.lastMouseMoveState.Execute(this.events);
            this.lastMouseMoveState = null;
        }
        if (this.drawnPath !== null) {
            this.drawnPath.Draw();
        }
    };
    Player.prototype.MoveToNextChunk = function () {
        do {
            this.video.MoveNextChunk();
            if (!this.video.CurrentChunk) {
                this.ReachedEnd();
                break;
            }
            this.video.CurrentChunk.ExecuteInitCommands(this.events);
            if (this.video.CurrentChunk instanceof Chunk_1.PathChunk) {
                this.drawnPath = this.drawer.CreatePath(this.events);
                var path = this.video.CurrentChunk.Path;
                this.drawnPath.Segments = path.Segments;
                this.drawnPath.Color = path.Color;
                this.drawnSegment = 0;
                path = this.drawnPath;
            }
            else {
                this.drawnPath = null;
            }
            if (this.video.PeekNextChunk()
                && this.video.PeekNextChunk().StartTime <= this.timer.CurrentTime()) {
                this.video.CurrentChunk.Render(this.events);
            }
            else {
                break;
            }
        } while (true);
    };
    Player.prototype.JumpTo = function (progress) {
        var wasPlaying = this.isPlaying;
        var time = progress * this.video.Metadata.Length;
        var videoTime = this.timer.CurrentTime();
        this.timer.SetTime(time);
        this.audio.JumpTo(progress);
        if (this.isPlaying) {
            this.events.trigger(VideoEvents_1.VideoEventType.Pause);
        }
        var startChunk = 0;
        if (time >= videoTime) {
            startChunk = this.video.FastforwardErasedChunksUntil(time);
        }
        else {
            startChunk = this.video.RewindToLastEraseBefore(time);
        }
        if (startChunk !== this.video.CurrentChunkNumber) {
            this.video.SetCurrentChunkNumber = startChunk - 1;
            this.MoveToNextChunk();
        }
        this.Sync();
        this.ui.UpdateCurrentTime();
        if (wasPlaying === true) {
            this.events.trigger(VideoEvents_1.VideoEventType.Start);
        }
    };
    Player.prototype.RedrawCurrentScreen = function () {
        var wasPlaying = this.isPlaying;
        if (this.isPlaying) {
            this.events.trigger(VideoEvents_1.VideoEventType.Pause);
        }
        var startChunk = 0;
        startChunk = this.video.RewindToLastEraseBefore(this.timer.CurrentTime());
        this.video.SetCurrentChunkNumber = startChunk - 1;
        this.MoveToNextChunk();
        this.Sync();
        if (wasPlaying === true) {
            this.events.trigger(VideoEvents_1.VideoEventType.Start);
        }
    };
    Player.prototype.ReachedEnd = function () {
        this.events.trigger(VideoEvents_1.VideoEventType.ReachEnd);
    };
    Player.prototype.ClearCavnas = function (color) {
        this.drawer.ClearCanvas(color);
    };
    Player.prototype.DrawSegment = function () {
        if (this.drawnSegment === 0) {
            this.drawnPath.StartDrawingPath(this.drawnPath.Segments[0]);
            this.drawnSegment++;
        }
        else {
            this.drawnPath.DrawSegment(this.drawnPath.Segments[this.drawnSegment++]);
        }
    };
    Player.prototype.Busy = function () {
        this.busyLevel++;
        this.wasPlayingWhenBusy = this.wasPlayingWhenBusy || this.isPlaying;
        this.events.trigger(VideoEvents_1.VideoEventType.Pause);
        this.ui.Busy();
    };
    Player.prototype.Ready = function () {
        if (--this.busyLevel === 0) {
            if (this.wasPlayingWhenBusy === true) {
                this.events.trigger(VideoEvents_1.VideoEventType.Start);
                this.wasPlayingWhenBusy = false;
            }
            this.ui.Ready();
        }
    };
    return Player;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Player;
