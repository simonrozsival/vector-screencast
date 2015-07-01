/// <reference path="Mouse.ts" />
/// <reference path="../Helpers/HTML.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VideoData;
(function (VideoData) {
    /**
     * Touch Events API
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
     */
    var TouchEventsAPI = (function (_super) {
        __extends(TouchEventsAPI, _super);
        function TouchEventsAPI(board) {
            var _this = this;
            _super.call(this, board); // obligatory parent constructor call
            board.addEventListener("touchstart", function (ev) { return _this.TouchStart(ev); });
            board.addEventListener("touchend", function (ev) { return _this.TouchEnd(ev); });
            board.addEventListener("touchcancel", function (ev) { return _this.TouchEnd(ev); });
            board.addEventListener("touchleave", function (ev) { return _this.TouchLeave(ev); });
            board.addEventListener("touchmove", function (ev) { return _this.TouchMove(ev); });
        }
        TouchEventsAPI.prototype.TouchStart = function (event) {
            event.preventDefault();
            var touches = event.changedTouches;
            // select the first touch and follow only this one touch			
            var touch = touches[0];
            this.currentTouch = touch.identifier;
            this.onDown(touch);
        };
        TouchEventsAPI.prototype.TouchLeave = function (event) {
            event.preventDefault();
            var touch = this.filterTouch(event.changedTouches);
            if (touch === null) {
                return; // current touch hasn't left the board
            }
            this.onLeave(touch);
        };
        TouchEventsAPI.prototype.TouchEnd = function (event) {
            event.preventDefault();
            var touch = this.filterTouch(event.changedTouches);
            if (touch === null) {
                return;
            }
            this.onUp(touch);
            // forget about the one concrete touch
            this.currentTouch = null;
        };
        TouchEventsAPI.prototype.TouchMove = function (event) {
            event.preventDefault();
            var touch = this.filterTouch(event.changedTouches);
            if (touch === null) {
                return;
            }
            this.onMove(touch);
        };
        /**
         * Find the current touch by it's identifier
         */
        TouchEventsAPI.prototype.filterTouch = function (touchList) {
            for (var i = 0; i < touchList.length; i++) {
                var element = touchList[i];
                if (element.identifier === this.currentTouch) {
                    return element;
                }
            }
            return null;
        };
        return TouchEventsAPI;
    })(VideoData.PointingDevice);
    VideoData.TouchEventsAPI = TouchEventsAPI;
})(VideoData || (VideoData = {}));
