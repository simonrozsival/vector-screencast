/// <reference path="../Helpers/State" />
/// <reference path="ICursor" />
/// <reference path="../Helpers/VideoTimer" />
/// <reference path="../Helpers/VideoEvents" />
var VideoData;
(function (VideoData) {
    var VideoEvents = Helpers.VideoEvents;
    var VideoEventType = Helpers.VideoEventType;
    var CursorState = Helpers.CursorState;
    var Timer = Helpers.VideoTimer;
    /**
     * Mouse input detection and processing.
     */
    var PointingDevice = (function () {
        function PointingDevice(board) {
            var _this = this;
            this.board = board;
            // video events			
            VideoEvents.on(VideoEventType.Start, function () { return _this.Start(); });
            VideoEvents.on(VideoEventType.Start, function () { return _this.Start(); });
            VideoEvents.on(VideoEventType.Pause, function () { return _this.Pause(); });
            VideoEvents.on(VideoEventType.Stop, function () { return _this.Pause(); });
            // init the timer - a high resolution timer, if possible
            this.timer = new Timer();
            this.timer.Pause();
            this.isHoveringOverUIControl = false;
        }
        /** Last known cursor position */
        PointingDevice.prototype.getCursor = function () { return this.cursor; };
        /**
         * Filter all clicks on buttons and other possible UI controls
         */
        PointingDevice.prototype.InitControlsAvoiding = function () {
            var _this = this;
            var controls = document.getElementsByClassName("ui-control");
            for (var i = 0; i < controls.length; i++) {
                var element = controls[i];
                element.onmouseover = function (e) { return _this.isHoveringOverUIControl = true; };
                element.onmouseout = function (e) { return _this.isHoveringOverUIControl = false; };
            }
        };
        /**
         * Start capturing mouse movement.
         */
        PointingDevice.prototype.Start = function () {
            this.isRunning = true;
            this.timer.Resume();
        };
        /**
         * Pause mouse movement caputring.
         */
        PointingDevice.prototype.Pause = function () {
            this.isRunning = false;
            this.timer.Pause();
        };
        /**
         * Mouse pressure is either 1 (mouse button is down) or 0 (mouse button is up) while the mouse is inside the area of canvas.
         */
        PointingDevice.prototype.GetPressure = function () {
            return (this.isDown === true && this.isInside === true) ? 1 : 0;
        };
        /**
         * Trace mouse movement.
         */
        PointingDevice.prototype.onMove = function (e) {
            //if(this.isRunning) { // experiment: track mouse movement event when not recording, but don't record clicking		
            this.cursor = this.getCursorPosition(e);
            this.ReportAction();
            //}
        };
        /**
         * Start drawing lines.
         */
        PointingDevice.prototype.onDown = function (e) {
            if (this.isHoveringOverUIControl === false) {
                this.isDown = true;
                this.cursor = this.getCursorPosition(e);
                this.ReportAction();
            }
        };
        /**
         * Stop drawing lines.
         */
        PointingDevice.prototype.onUp = function (e) {
            //if(this.isRunning) {
            this.isDown = false;
            this.cursor = this.getCursorPosition(e);
            this.ReportAction();
            //}
        };
        /**
         * Stop drawing lines.
         */
        PointingDevice.prototype.onLeave = function (e) {
            if (this.GetPressure() > 0) {
                this.onMove(e); // draw one more segment
                this.isDown = false;
                this.onMove(e); // discontinue the line
                this.isDown = true; // back to current state
            }
            this.isInside = false;
        };
        /**
         * Mark down that the cursor is hovering over the canvas.
         */
        PointingDevice.prototype.onOver = function (e) {
            this.isInside = true;
        };
        /**
         * Force stop drawing lines.
         */
        PointingDevice.prototype.onLooseFocus = function (e) {
            this.isInside = false;
            this.isDown = false;
        };
        /**
         * Extract the information about cursor position relative to the board.
         */
        PointingDevice.prototype.getCursorPosition = function (e) {
            if (e.clientX == undefined || e.clientY == undefined) {
                console.log("Wrong 'getCursorPosition' parameter. Event data required.");
            }
            return {
                x: e.clientX,
                y: e.clientY
            };
        };
        /**
         * Report cursor movement
         */
        PointingDevice.prototype.ReportAction = function () {
            var state = new CursorState(this.timer.CurrentTime(), this.cursor.x, this.cursor.y, this.GetPressure());
            VideoEvents.trigger(VideoEventType.CursorState, state);
        };
        return PointingDevice;
    })();
    VideoData.PointingDevice = PointingDevice;
})(VideoData || (VideoData = {}));
