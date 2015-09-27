var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VideoEvents_1 = require('../Helpers/VideoEvents');
var HTML_1 = require('../Helpers/HTML');
var HelperFunctions_1 = require('../Helpers/HelperFunctions');
var BasicElements_1 = require('./BasicElements');
var Buttons_1 = require('./Buttons');
var Board_1 = require('./Board');
var Color_1 = require('../UI/Color');
var RecorderUI = (function (_super) {
    __extends(RecorderUI, _super);
    function RecorderUI(id, events) {
        _super.call(this, "div", id + "-recorder");
        this.id = id;
        this.events = events;
        this.tickingInterval = 100;
        this.AddClass("vector-video-wrapper");
        this.isRecording = false;
        this.isBusy = false;
        this.micIsMuted = false;
    }
    Object.defineProperty(RecorderUI.prototype, "Width", {
        get: function () {
            return this.board.Width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecorderUI.prototype, "Height", {
        get: function () {
            return this.board.Height;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecorderUI.prototype, "BackgroundColor", {
        get: function () {
            return Color_1.default.BackgroundColor.CssValue;
        },
        enumerable: true,
        configurable: true
    });
    RecorderUI.prototype.CreateHTML = function (autohide, colorPallete, brushSizes) {
        this.board = this.CreateBoard();
        this.controls = new BasicElements_1.Panel("div", this.id + "-controls")
            .AddChildren(this.CreateButtonsPanel().AddClass("ui-controls-panel"), this.CreateColorsPanel(colorPallete).AddClass("ui-controls-panel"), this.CreateBrushSizesPanel(brushSizes).AddClass("ui-controls-panel"), this.CreateEraserPanel().AddClass("ui-controls-panel"), this.CreateEraseAllPanel().AddClass("ui-controls-panel"), this.CreateMicPanel().AddClass("ui-controls-panel"))
            .AddClasses("ui-controls", "ui-control");
        !!autohide && this.controls.AddClass("autohide");
        this.AddChildren(this.board, new BasicElements_1.Panel("div").AddClass("ui-controls-wrapper")
            .AddChild(this.controls));
    };
    RecorderUI.prototype.Busy = function () {
        this.AddClass("busy");
        this.isBusy = true;
    };
    RecorderUI.prototype.Ready = function () {
        this.RemoveClass("busy");
        this.isBusy = false;
    };
    RecorderUI.prototype.SetBusyText = function (text) {
        HTML_1.default.SetAttributes(this.GetHTML(), { "data-busy-string": text });
    };
    RecorderUI.prototype.AcceptCanvas = function (canvas) {
        this.board.GetHTML().appendChild(canvas);
    };
    RecorderUI.prototype.CreateBoard = function () {
        var board = new Board_1.default(this.id + "-board", this.events);
        return board;
    };
    RecorderUI.prototype.CreateButtonsPanel = function () {
        var _this = this;
        var buttonsPanel = new BasicElements_1.Panel("div", this.id + "-panels");
        this.recPauseButton = new BasicElements_1.IconButton("icon-rec", this.Localization.Record, function (e) { return _this.RecordPause(); });
        this.uploadButton = new BasicElements_1.IconButton("icon-upload", this.Localization.Upload, function (e) { return _this.InitializeUpload(); });
        HTML_1.default.SetAttributes(this.uploadButton.GetHTML(), { "disabled": "disabled" });
        buttonsPanel.AddChildren(new BasicElements_1.H2(this.Localization.RecPause), new BasicElements_1.Panel("div").AddClass("btn-group")
            .AddChildren(this.recPauseButton, this.uploadButton));
        return buttonsPanel;
    };
    RecorderUI.prototype.RecordPause = function () {
        if (this.isRecording === true) {
            this.PauseRecording();
            this.uploadButton.GetHTML().removeAttribute("disabled");
            this.RemoveClass("recording");
        }
        else {
            this.StartRecording();
            HTML_1.default.SetAttributes(this.uploadButton.GetHTML(), { "disabled": "disabled" });
            this.AddClass("recording");
        }
    };
    RecorderUI.prototype.StartRecording = function () {
        var _this = this;
        if (this.isRecording === false) {
            this.isRecording = true;
            this.recPauseButton.ChangeIcon("icon-pause");
            this.board.IsRecording = true;
            this.ticking = setInterval(function () { return _this.Tick(); }, this.tickingInterval);
            this.events.trigger(VideoEvents_1.VideoEventType.Start);
        }
    };
    RecorderUI.prototype.PauseRecording = function () {
        if (this.isRecording === true) {
            this.isRecording = false;
            this.recPauseButton.ChangeIcon("icon-rec");
            this.board.IsRecording = false;
            clearInterval(this.ticking);
            this.events.trigger(VideoEvents_1.VideoEventType.Pause);
        }
    };
    RecorderUI.prototype.Tick = function () {
        this.recPauseButton.ChangeContent(HelperFunctions_1.millisecondsToString(this.Timer.CurrentTime()));
    };
    RecorderUI.prototype.InitializeUpload = function () {
        HTML_1.default.SetAttributes(this.recPauseButton.GetHTML(), { "disabled": "disabled" });
        HTML_1.default.SetAttributes(this.uploadButton.GetHTML(), { "disabled": "disabled" });
        this.events.trigger(VideoEvents_1.VideoEventType.StartUpload);
    };
    RecorderUI.prototype.CreateColorsPanel = function (colorPallete) {
        var colorsGroup = new BasicElements_1.Panel("div").AddClass("btn-group");
        for (var i = 0; i < colorPallete.length; i++) {
            var btn = new Buttons_1.ChangeColorButton(this.events, colorPallete[i]);
            colorsGroup.AddChild(btn);
        }
        return new BasicElements_1.Panel("div")
            .AddClass("color-pallete")
            .AddChildren(new BasicElements_1.H2(this.Localization.ChangeColor), colorsGroup);
    };
    RecorderUI.prototype.CreateBrushSizesPanel = function (brushSizes) {
        var sizesGroup = new BasicElements_1.Panel("div").AddClass("btn-group");
        for (var i = 0; i < brushSizes.length; i++) {
            sizesGroup.AddChild(new Buttons_1.ChangeBrushSizeButton(this.events, brushSizes[i]));
        }
        return new BasicElements_1.Panel("div")
            .AddClass("brush-sizes")
            .AddChildren(new BasicElements_1.H2(this.Localization.ChangeSize), sizesGroup);
    };
    RecorderUI.prototype.CreateEraserPanel = function () {
        this.switchToEraserButton = new Buttons_1.ChangeColorButton(this.events, Color_1.default.BackgroundColor);
        return new BasicElements_1.Panel("div", this.id + "-erase")
            .AddChildren(new BasicElements_1.H2(this.Localization.Erase), this.switchToEraserButton);
    };
    RecorderUI.prototype.CreateEraseAllPanel = function () {
        var _this = this;
        var panel = new BasicElements_1.Panel("div", this.id + "-erase");
        var title = new BasicElements_1.H2(this.Localization.EraseAll);
        panel.AddChild(title);
        this.eraseAllButton = new Buttons_1.ChangeColorButton(this.events, Color_1.default.BackgroundColor, function () { return _this.EraseAll(); });
        this.events.on(VideoEvents_1.VideoEventType.ChangeColor, function (color) {
            _this.currentColor = color;
            _this.eraseAllButton.SetColor(color);
        });
        panel.AddChild(this.eraseAllButton);
        return panel;
    };
    RecorderUI.prototype.EraseAll = function () {
        this.events.trigger(VideoEvents_1.VideoEventType.ClearCanvas, this.currentColor);
        this.switchToEraserButton.SetColor(this.currentColor);
    };
    RecorderUI.prototype.CreateMicPanel = function () {
        var _this = this;
        this.micButton = new BasicElements_1.IconOnlyButton("icon-mic-off", this.Localization.AudioRecordingUnavailable, function () { return _this.MuteMic(); });
        HTML_1.default.SetAttributes(this.micButton.GetHTML(), { disabled: "disabled" });
        this.events.on(VideoEvents_1.VideoEventType.AudioRecordingAvailable, function () {
            _this.micButton.GetHTML().removeAttribute("disabled");
            if (!_this.micIsMuted) {
                _this.micButton.ChangeIcon("icon-mic").ChangeContent(_this.Localization.AudioRecordingAvailable);
            }
        });
        this.events.on(VideoEvents_1.VideoEventType.AudioRecordingUnavailable, function () {
            _this.micButton.ChangeIcon("icon-mic-off").ChangeContent(_this.Localization.AudioRecordingUnavailable);
            HTML_1.default.SetAttributes(_this.micButton.GetHTML(), { disabled: "disabled" });
        });
        return new BasicElements_1.Panel("div").AddChildren(new BasicElements_1.H2(this.Localization.AudioRecording), this.micButton);
    };
    RecorderUI.prototype.MuteMic = function () {
        this.events.trigger(VideoEvents_1.VideoEventType.MuteAudioRecording);
        this.micIsMuted = !this.micIsMuted;
        if (this.micIsMuted) {
            this.micButton.ChangeIcon("icon-mic-off");
        }
        else {
            this.micButton.ChangeIcon("icon-mic");
        }
    };
    return RecorderUI;
})(BasicElements_1.Panel);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RecorderUI;
