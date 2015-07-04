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
    var PointerEventsAPI = (function (_super) {
        __extends(PointerEventsAPI, _super);
        function PointerEventsAPI(board) {
            var _this = this;
            _super.call(this, board);
            // board events						
            this.board.addEventListener("pointermove", function (e) { return _this.onPointerMove(e); });
            this.board.addEventListener("pointerdown", function (e) { return _this.onPointerDown(e); });
            this.board.addEventListener("pointerup", function (e) { return _this.onPointerUp(e); });
            this.board.addEventListener("pointerleave", function (e) { return _this.onPointerLeave(e); }); // release the mouse also when the user tries to draw outside of the "board"
            this.board.addEventListener("pointerenter", function (e) { return _this.onPointerLeave(e); });
            this.board.addEventListener("pointerover", function (e) { return _this.onPointerOver(e); }); // maybe start a new line, if the button is pressed
            this.currentEvent = null;
            this.isDown = false;
        }
        /**
         * Return pressure of the mouse, touch or pen.
         */
        PointerEventsAPI.prototype.GetPressure = function () {
            if (this.isDown === false || this.currentEvent === null) {
                return 0; // no envent, no pressure
            }
            // if(this.currentEvent.pointerType === "mouse"
            // 	|| this.currentEvent.pointerType === "touch") {
            // 		return 1; // button is pressed or touchscreen touched - maximum presure
            // }
            return this.currentEvent.pressure; // this device knows, what is current pressure
        };
        /**
         * Filter all clicks on buttons and other possible UI controls
         */
        PointerEventsAPI.prototype.InitControlsAvoiding = function () {
            var _this = this;
            var controls = document.getElementsByClassName("ui-control");
            for (var i = 0; i < controls.length; i++) {
                var element = controls[i];
                element.onpointerover = function (e) { return _this.isHoveringOverUIControl = true; };
                element.onpointerout = function (e) { return _this.isHoveringOverUIControl = false; };
            }
        };
        /**
         * Trace mouse movement.
         */
        PointerEventsAPI.prototype.onPointerMove = function (e) {
            this.onMove(e);
            this.currentEvent = e;
        };
        /**
         * Start drawing lines.
         */
        PointerEventsAPI.prototype.onPointerDown = function (e) {
            this.onDown(e);
            this.currentEvent = e;
        };
        /**
         * Stop drawing lines.
         */
        PointerEventsAPI.prototype.onPointerUp = function (e) {
            this.onUp(e);
            this.currentEvent = e;
        };
        /**
         * Stop drawing lines.
         */
        PointerEventsAPI.prototype.onPointerLeave = function (e) {
            this.onLeave(e);
            this.currentEvent = e;
        };
        /**
         * Make sure the status of mouse button is consistent.
         */
        PointerEventsAPI.prototype.onPointerEnter = function (e) {
            if (e.buttons === 0) {
                this.isDown = false; // check mouse down status
            }
            this.currentEvent = e;
        };
        /**
         * Mark down that the cursor is hovering over the canvas.
         */
        PointerEventsAPI.prototype.onPointerOver = function (e) {
            this.isInside = true;
            this.currentEvent = e;
        };
        return PointerEventsAPI;
    })(VideoData.PointingDevice);
    VideoData.PointerEventsAPI = PointerEventsAPI;
})(VideoData || (VideoData = {}));
