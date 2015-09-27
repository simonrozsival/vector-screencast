var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VideoEvents_1 = require('../Helpers/VideoEvents');
var HTML_1 = require('../Helpers/HTML');
var HelperFunctions_1 = require('../Helpers/HelperFunctions');
var BasicElements_1 = require('./BasicElements');
var Board_1 = require('./Board');
var TimeLine_1 = require('./TimeLine');
var PlayerUI = (function (_super) {
    __extends(PlayerUI, _super);
    function PlayerUI(id, events) {
        var _this = this;
        _super.call(this, "div", id + "-player");
        this.id = id;
        this.events = events;
        this.isBusy = false;
        this.tickingInterval = 200;
        this.isMuted = false;
        this.AddClass("vector-video-wrapper");
        this.board = this.CreateBoard();
        this.AddChild(this.board);
        this.events.on(VideoEvents_1.VideoEventType.Start, function () { return _this.StartPlaying(); });
        this.events.on(VideoEvents_1.VideoEventType.Pause, function () { return _this.PausePlaying(); });
        this.events.on(VideoEvents_1.VideoEventType.ReachEnd, function () { return _this.ReachedEnd(); });
        this.events.on(VideoEvents_1.VideoEventType.JumpTo, function () { return _this.JumpTo(); });
        this.events.on(VideoEvents_1.VideoEventType.ClearCanvas, function (c) { return _this.GetHTML().style.backgroundColor = c.CssValue; });
        this.isPlaying = false;
        this.reachedEnd = false;
    }
    PlayerUI.prototype.CreateControls = function (autohide) {
        var _this = this;
        this.timeline = this.CreateTimeLine();
        this.hidingButton = new BasicElements_1.IconOnlyButton(autohide ? "icon-show" : "icon-hide", "", function (e) { return _this.ToggleAutohiding(); })
            .AddClasses("autohiding-toggle");
        this.controls = new BasicElements_1.Panel("div", this.id + "-controls")
            .AddClasses("ui-controls", "ui-control")
            .AddChildren(this.CreateButtonsPanel(), this.timeline, this.CreateTimeStatus(), this.CreateAudioControls());
        !!autohide && this.controls.AddClass("autohide");
        this.AddChildren(new BasicElements_1.Panel("div")
            .AddClass("ui-controls-wrapper")
            .AddChildren(this.controls, this.hidingButton));
        this.events.on(VideoEvents_1.VideoEventType.VideoInfoLoaded, function (meta) {
            _this.videoDuration = meta.Length;
            _this.totalTime.GetHTML().textContent = HelperFunctions_1.millisecondsToString(meta.Length);
            _this.timeline.Length = meta.Length;
        });
        this.events.on(VideoEvents_1.VideoEventType.BufferStatus, function (seconds) { return _this.timeline.SetBuffer(seconds * 1000); });
        this.BindKeyboardShortcuts();
    };
    PlayerUI.prototype.SetBusyText = function (text) {
        HTML_1.default.SetAttributes(this.GetHTML(), { "data-busy-string": text });
    };
    PlayerUI.prototype.BindKeyboardShortcuts = function () {
        var _this = this;
        var spacebar = 32;
        var leftArrow = 37;
        var rightArrow = 39;
        var skipTime = 5000;
        window.onkeyup = function (e) {
            switch (e.keyCode) {
                case spacebar:
                    _this.PlayPause();
                    break;
                case leftArrow:
                    _this.timeline.SkipTo(Math.max(0, _this.Timer.CurrentTime() - skipTime));
                    break;
                case rightArrow:
                    _this.timeline.SkipTo(Math.min(_this.Timer.CurrentTime() + skipTime, _this.videoDuration));
                    break;
            }
        };
    };
    PlayerUI.prototype.AcceptCanvas = function (canvas) {
        this.board.GetHTML().appendChild(canvas);
    };
    PlayerUI.prototype.CreateBoard = function () {
        var _this = this;
        var board = new Board_1.default(this.id + "-board", this.events);
        board.GetHTML().onclick = function () { return _this.PlayPause(); };
        return board;
    };
    PlayerUI.prototype.CreateButtonsPanel = function () {
        var _this = this;
        this.playPauseButton = new BasicElements_1.IconOnlyButton("icon-play", this.Localization.Play, function (e) { return _this.PlayPause(); });
        return new BasicElements_1.Panel("div")
            .AddChildren(new BasicElements_1.H2(this.Localization.ControlPlayback), this.playPauseButton)
            .AddClass("ui-controls-panel");
    };
    PlayerUI.prototype.PlayPause = function () {
        if (this.isBusy || !this.controls)
            return;
        if (this.reachedEnd) {
            this.reachedEnd = false;
            this.timeline.SkipTo(0);
            this.events.trigger(VideoEvents_1.VideoEventType.Start);
            return;
        }
        if (this.isPlaying === true) {
            this.PausePlaying();
            this.events.trigger(VideoEvents_1.VideoEventType.Pause);
        }
        else {
            this.StartPlaying();
            this.events.trigger(VideoEvents_1.VideoEventType.Start);
        }
    };
    PlayerUI.prototype.JumpTo = function () {
        if (!this.controls)
            return;
        if (this.reachedEnd === true) {
            this.reachedEnd = false;
            this.playPauseButton.ChangeIcon("icon-play");
        }
    };
    PlayerUI.prototype.StartPlaying = function () {
        var _this = this;
        if (!this.controls)
            return;
        if (this.isPlaying === false) {
            this.isPlaying = true;
            this.playPauseButton.ChangeIcon("icon-pause");
            this.playPauseButton.ChangeContent(this.Localization.Pause);
            this.AddClass("playing");
            this.ticking = setInterval(function () { return _this.UpdateCurrentTime(); }, this.tickingInterval);
        }
    };
    PlayerUI.prototype.PausePlaying = function () {
        if (!this.controls)
            return;
        this.isPlaying = false;
        this.playPauseButton.ChangeIcon("icon-play");
        this.playPauseButton.ChangeContent(this.Localization.Play);
        this.RemoveClass("playing");
        clearInterval(this.ticking);
    };
    PlayerUI.prototype.CreateTimeLine = function () {
        return new TimeLine_1.default(this.id + "-timeline", this.events);
    };
    PlayerUI.prototype.CreateTimeStatus = function () {
        this.currentTime = new BasicElements_1.SimpleElement("span", "0:00");
        this.totalTime = new BasicElements_1.SimpleElement("span", "0:00");
        return new BasicElements_1.Panel("div")
            .AddChildren(new BasicElements_1.H2(this.Localization.TimeStatus), new BasicElements_1.Panel("div")
            .AddChildren(this.currentTime, new BasicElements_1.SimpleElement("span", " / "), this.totalTime)
            .AddClass("ui-time"))
            .AddClass("ui-controls-panel");
    };
    PlayerUI.prototype.UpdateCurrentTime = function (time) {
        this.currentTime.GetHTML().textContent = HelperFunctions_1.millisecondsToString(!!time ? time : this.Timer.CurrentTime());
        this.timeline.Sync(!!time ? time : this.Timer.CurrentTime());
    };
    PlayerUI.prototype.ReachedEnd = function () {
        if (!this.controls)
            return;
        this.PausePlaying();
        this.playPauseButton.ChangeIcon("icon-replay").ChangeContent(this.Localization.Replay);
        this.reachedEnd = true;
        this.UpdateCurrentTime();
    };
    PlayerUI.prototype.Busy = function () {
        this.AddClass("busy");
        this.isBusy = true;
    };
    PlayerUI.prototype.Ready = function () {
        this.RemoveClass("busy");
        this.isBusy = false;
    };
    PlayerUI.prototype.CreateAudioControls = function () {
        var _this = this;
        return new BasicElements_1.Panel("div", this.id + "-audio")
            .AddChildren(new BasicElements_1.H2(this.Localization.VolumeControl), new BasicElements_1.Panel("div", this.id + "-audio-controls")
            .AddChildren((this.volumeDownBtn = new BasicElements_1.IconOnlyButton("icon-volume-down", this.Localization.VolumeDown, function (e) { return _this.VolumeDown(); })), (this.volumeUpBtn = new BasicElements_1.IconOnlyButton("icon-volume-up", this.Localization.VolumeUp, function (e) { return _this.VolumeUp(); })), (this.volumeOffBtn = new BasicElements_1.IconOnlyButton("icon-volume-off", this.Localization.Mute, function (e) { return _this.Mute(); })))
            .AddClass("btn-group"))
            .AddClasses("ui-controls-panel", "vector-video-audio-controls");
    };
    PlayerUI.prototype.VolumeUp = function () {
        this.events.trigger(VideoEvents_1.VideoEventType.VolumeUp);
    };
    PlayerUI.prototype.VolumeDown = function () {
        this.events.trigger(VideoEvents_1.VideoEventType.VolumeDown);
    };
    PlayerUI.prototype.Mute = function () {
        if (!this.isMuted) {
            HTML_1.default.SetAttributes(this.volumeDownBtn.GetHTML(), { disabled: "disabled" });
            HTML_1.default.SetAttributes(this.volumeUpBtn.GetHTML(), { disabled: "disabled" });
            this.volumeOffBtn.AddClass("active");
        }
        else {
            this.volumeDownBtn.GetHTML().removeAttribute("disabled");
            this.volumeUpBtn.GetHTML().removeAttribute("disabled");
            this.volumeOffBtn.RemoveClass("active");
        }
        this.isMuted = !this.isMuted;
        this.events.trigger(VideoEvents_1.VideoEventType.Mute);
    };
    PlayerUI.prototype.ToggleAutohiding = function () {
        if (this.controls.HasClass("autohide")) {
            this.controls.RemoveClass("autohide");
            this.hidingButton.ChangeIcon("icon-hide");
        }
        else {
            this.controls.AddClass("autohide");
            this.hidingButton.ChangeIcon("icon-show");
        }
    };
    return PlayerUI;
})(BasicElements_1.Panel);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PlayerUI;
