/// <reference path="BasicElements" />
/// <reference path="Cursor" />
/// <reference path="Color" />
/// <reference path="../Drawing/IDrawingStrategy" />
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
    /**
     * The board itself.
     */
    var Board = (function (_super) {
        __extends(Board, _super);
        /**
         * @param	id	HTML element id attribute value
         */
        function Board(id) {
            _super.call(this, "div", id); // Panel
            // create a cursor 
            var CursorSize = 20;
            this.cursor = new UI.Cursor(CursorSize, UI.Color.ForegroundColor);
            this.AddChild(this.cursor);
            // the implicit color of the board is dark, but it might be different 
            this.GetHTML().style.backgroundColor = UI.Color.BackgroundColor.CssValue;
            Helpers.HTML.SetAttributes(this.GetHTML(), { position: "relative" });
            // move the cursor
            VideoEvents.on(VideoEventType.CursorState, this.UpdateCursorPosition);
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
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Board.prototype, "BackgroundColor", {
            /** Get the color of the board */
            get: function () {
                return this.GetHTML().style.backgroundColor;
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
        return Board;
    })(UI.Panel);
    UI.Board = Board;
})(UI || (UI = {}));
//# sourceMappingURL=Board.js.map