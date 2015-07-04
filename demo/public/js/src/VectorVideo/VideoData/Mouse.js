/// <reference path="../Helpers/State" />
/// <reference path="ICursor" />
/// <reference path="../Helpers/VideoTimer" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="PointingDevice" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VideoData;
(function (VideoData) {
    /**
     * Mouse input detection and processing.
     */
    var Mouse = (function (_super) {
        __extends(Mouse, _super);
        function Mouse(board) {
            var _this = this;
            _super.call(this, board);
            // board events						
            this.board.onmousemove = function (e) { return _this.onMouseMove(e); };
            this.board.onmousedown = function (e) { return _this.onMouseDown(e); };
            this.board.onmouseup = function (e) { return _this.onMouseUp(e); };
            this.board.onmouseleave = function (e) { return _this.onMouseLeave(e); }; // release the mouse also when the user tries to draw outside of the "board"
            this.board.onmouseenter = function (e) { return _this.onMouseEnter(e); };
            this.board.onmouseover = function (e) { return _this.onMouseOver(e); }; // maybe start a new line, if the button is pressed
        }
        /**
         * Filter all clicks on buttons and other possible UI controls
         */
        Mouse.prototype.InitControlsAvoiding = function () {
            var _this = this;
            var controls = document.getElementsByClassName("ui-control");
            for (var i = 0; i < controls.length; i++) {
                var element = controls[i];
                element.onmouseover = function (e) { return _this.isHoveringOverUIControl = true; };
                element.onmouseout = function (e) { return _this.isHoveringOverUIControl = false; };
            }
        };
        /**
         * Trace mouse movement.
         */
        Mouse.prototype.onMouseMove = function (e) {
            this.onMove(e);
        };
        /**
         * Start drawing lines.
         */
        Mouse.prototype.onMouseDown = function (e) {
            this.onDown(e);
        };
        /**
         * Stop drawing lines.
         */
        Mouse.prototype.onMouseUp = function (e) {
            this.onUp(e);
        };
        /**
         * Stop drawing lines.
         */
        Mouse.prototype.onMouseLeave = function (e) {
            this.onLeave(e);
        };
        /**
         * Make sure the status of mouse button is consistent.
         */
        Mouse.prototype.onMouseEnter = function (e) {
            if (e.buttons === 0) {
                this.isDown = false; // check mouse down status
            }
        };
        /**
         * Mark down that the cursor is hovering over the canvas.
         */
        Mouse.prototype.onMouseOver = function (e) {
            this.isInside = true;
        };
        return Mouse;
    })(VideoData.PointingDevice);
    VideoData.Mouse = Mouse;
})(VideoData || (VideoData = {}));
