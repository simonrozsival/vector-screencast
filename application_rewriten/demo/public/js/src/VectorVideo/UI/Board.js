/// <reference path="BasicElements" />
/// <reference path="Cursor" />
/// <reference path="Color" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="../Helpers/State" />
/// <reference path="../Helpers/HTML" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var UI;
(function (UI) {
    var HTML = Helpers.HTML;
    var VideoEvents = Helpers.VideoEvents;
    var VideoEventType = Helpers.VideoEventType;
    /**
     * The board itself.
     */
    var Board = (function (_super) {
        __extends(Board, _super);
        /**
         * Create a new board
         * @param	id	HTML element id attribute value
         */
        function Board(id) {
            var _this = this;
            _super.call(this, "div", id); // Panel
            HTML.SetAttributes(this.GetHTML(), { class: "vector-video-board" });
            // create a cursor 
            this.cursor = new UI.Cursor();
            this.AddChild(this.cursor);
            // make board's position relative for the cursor			
            HTML.SetAttributes(this.GetHTML(), { position: "relative" });
            // move the cursor
            VideoEvents.on(VideoEventType.CursorState, function (state) { return _this.UpdateCursorPosition(state); });
            VideoEvents.on(VideoEventType.CursorState, function (state) { return _this.UpdateCursorPosition(state); });
            VideoEvents.on(VideoEventType.ChangeBrushSize, function (state) { return _this.UpdateCursorSize(state); });
            VideoEvents.on(VideoEventType.ChangeColor, function (state) { return _this.UpdateCursorColor(state); });
            VideoEvents.on(VideoEventType.ChangeColor, function (state) { return _this.UpdateCursorColor(state); });
            VideoEvents.on(VideoEventType.CanvasScalingFactor, function (scalingFactor) { return _this.UpdateCursorScale(scalingFactor); });
        }
        Object.defineProperty(Board.prototype, "Width", {
            /** Get the width of the board in pixels */
            get: function () {
                return this.GetHTML().clientWidth;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Board.prototype, "Height", {
            /** Get the height of the board in pixels */
            get: function () {
                return this.GetHTML().clientHeight;
            },
            /** Set the height of the board in pixels */
            set: function (height) {
                this.GetHTML().clientHeight = height;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Board.prototype, "IsRecording", {
            /** Get the color of the board */
            set: function (isRecording) {
                isRecording ? this.GetHTML().classList.add("recording") : this.GetHTML().classList.remove("recording");
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Position the element
         */
        Board.prototype.UpdateCursorPosition = function (state) {
            this.cursor.MoveTo(state.X, state.Y); // @todo: correct the position
        };
        /**
         * Position the element
         */
        Board.prototype.UpdateCursorSize = function (size) {
            this.cursor.ChangeSize(size);
        };
        /**
         *
         */
        Board.prototype.UpdateCursorColor = function (color) {
            this.cursor.ChangeColor(color);
        };
        /**
         * Position the element
         */
        Board.prototype.UpdateCursorScale = function (scalingFactor) {
            this.cursor.SetScalingFactor(scalingFactor);
        };
        return Board;
    })(UI.Panel);
    UI.Board = Board;
})(UI || (UI = {}));
