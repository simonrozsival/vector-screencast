/// <reference path="../Helpers/State" />
/// <reference path="ICursor" />
/// <reference path="../Helpers/VideoTimer" />
var CursorState = Helpers.CursorState;
var Timer = Helpers.VideoTimer;
var VideoData;
(function (VideoData) {
    /**
     * Mouse input detection and processing.
     */
    var Mouse = (function () {
        function Mouse(board) {
            this.board = board;
            // board events						
            this.board.onmousemove = this.onMouseMove;
            this.board.onmousedown = this.onMouseDown;
            this.board.onmouseup = this.onMouseUp;
            this.board.onmouseleave = this.onMouseUp; // release the mouse also when the user tries to draw outside of the "board"
            document.onblur = this.onLooseFocus; // mouse up can't be detected when window (tab) is not focused - the app behaviour would be weird
            // video events			
            VideoEvents.on(VideoEventType.Start, this.Start);
            VideoEvents.on(VideoEventType.Start, this.Start);
            VideoEvents.on(VideoEventType.Pause, this.Pause);
            VideoEvents.on(VideoEventType.Stop, this.Pause);
            // init the timer - a high resolution timer, if possible
            this.timer = new Timer();
        }
        /** Last known cursor position */
        Mouse.prototype.getCursor = function () { return this.cursor; };
        /**
         * Start capturing mouse movement.
         */
        Mouse.prototype.Start = function () {
            this.isRunning = true;
            this.timer.Reset();
        };
        /**
         * Pause mouse movement caputring.
         */
        Mouse.prototype.Pause = function () {
            this.isRunning = false;
        };
        /**
         * Mouse pressure is either 1 (mouse button is down) or 0 (mouse button is up).
         */
        Mouse.prototype.GetPressure = function () {
            return this.isMouseDown === true ? 1 : 0;
        };
        /**
         * Trace mouse movement.
         */
        Mouse.prototype.onMouseMove = function (e) {
            if (this.isRunning) {
                this.cursor = this.getCursorPosition(e);
                this.ReportAction();
            }
        };
        /**
         * Start drawing lines.
         */
        Mouse.prototype.onMouseDown = function (e) {
            if (this.isRunning) {
                this.isMouseDown = true;
                this.cursor = this.getCursorPosition(e);
                this.ReportAction();
            }
        };
        /**
         * Stop drawing lines.
         */
        Mouse.prototype.onMouseUp = function (e) {
            if (this.isRunning) {
                this.isMouseDown = false;
                this.cursor = this.getCursorPosition(e);
                this.ReportAction();
            }
        };
        /**
         * Force stop drawing lines.
         */
        Mouse.prototype.onLooseFocus = function (e) {
            this.isMouseDown = false;
        };
        /**
         * Extract the information about cursor position relative to the board.
         */
        Mouse.prototype.getCursorPosition = function (e) {
            if (e.pageX == undefined || e.pageY == undefined) {
                console.log("Wrong 'correctMouseCoords' parameter. Event data required.");
            }
            return {
                x: e.pageX,
                y: e.pageY
            };
        };
        /**
         * Report cursor movement
         */
        Mouse.prototype.ReportAction = function () {
            var state = new CursorState(this.cursor.x, this.cursor.y, this.GetPressure(), this.timer.CurrentTime());
            VideoEvents.trigger(VideoEventType.CursorState, state);
        };
        return Mouse;
    })();
    VideoData.Mouse = Mouse;
})(VideoData || (VideoData = {}));
//# sourceMappingURL=Mouse.js.map