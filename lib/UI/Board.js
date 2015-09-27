var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VideoEvents_1 = require('../Helpers/VideoEvents');
var HTML_1 = require('../Helpers/HTML');
var BasicElements_1 = require('./BasicElements');
var Cursor_1 = require('./Cursor');
var Board = (function (_super) {
    __extends(Board, _super);
    function Board(id, events) {
        var _this = this;
        _super.call(this, "div", id);
        this.events = events;
        HTML_1.default.SetAttributes(this.GetHTML(), { class: "vector-video-board" });
        this.cursor = new Cursor_1.default(events);
        this.AddChild(this.cursor);
        HTML_1.default.SetAttributes(this.GetHTML(), { position: "relative" });
        events.on(VideoEvents_1.VideoEventType.CursorState, function (state) { return _this.UpdateCursorPosition(state); });
        events.on(VideoEvents_1.VideoEventType.CursorState, function (state) { return _this.UpdateCursorPosition(state); });
        events.on(VideoEvents_1.VideoEventType.ChangeBrushSize, function (state) { return _this.UpdateCursorSize(state); });
        events.on(VideoEvents_1.VideoEventType.ChangeColor, function (state) { return _this.UpdateCursorColor(state); });
        events.on(VideoEvents_1.VideoEventType.ChangeColor, function (state) { return _this.UpdateCursorColor(state); });
        events.on(VideoEvents_1.VideoEventType.CanvasScalingFactor, function (scalingFactor) { return _this.UpdateCursorScale(scalingFactor); });
        events.on(VideoEvents_1.VideoEventType.CursorOffset, function (offset) { return _this.cursor.Offset = offset; });
    }
    Object.defineProperty(Board.prototype, "Width", {
        get: function () {
            return this.GetHTML().clientWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Board.prototype, "Height", {
        get: function () {
            return this.GetHTML().clientHeight;
        },
        set: function (height) {
            this.GetHTML().clientHeight = height;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Board.prototype, "IsRecording", {
        set: function (isRecording) {
            isRecording ? this.GetHTML().classList.add("recording") : this.GetHTML().classList.remove("recording");
        },
        enumerable: true,
        configurable: true
    });
    Board.prototype.UpdateCursorPosition = function (state) {
        this.cursor.MoveTo(state.X, state.Y);
    };
    Board.prototype.UpdateCursorSize = function (size) {
        this.cursor.ChangeSize(size);
    };
    Board.prototype.UpdateCursorColor = function (color) {
        this.cursor.ChangeColor(color);
    };
    Board.prototype.UpdateCursorScale = function (scalingFactor) {
        this.cursor.SetScalingFactor(scalingFactor);
    };
    return Board;
})(BasicElements_1.Panel);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Board;
