/**
 * Event Aggregator object.
 * @author Šimon Rozsíval
 */
var Helpers;
(function (Helpers) {
    /**
     * The list of supported video events.
     */
    (function (VideoEventType) {
        VideoEventType[VideoEventType["Start"] = 0] = "Start";
        VideoEventType[VideoEventType["Pause"] = 1] = "Pause";
        VideoEventType[VideoEventType["Continue"] = 2] = "Continue";
        VideoEventType[VideoEventType["Stop"] = 3] = "Stop";
        VideoEventType[VideoEventType["ReachEnd"] = 4] = "ReachEnd";
        VideoEventType[VideoEventType["Replay"] = 5] = "Replay";
        VideoEventType[VideoEventType["JumpTo"] = 6] = "JumpTo";
        VideoEventType[VideoEventType["BufferStatus"] = 7] = "BufferStatus";
        VideoEventType[VideoEventType["CursorState"] = 8] = "CursorState";
        VideoEventType[VideoEventType["ChangeColor"] = 9] = "ChangeColor";
        VideoEventType[VideoEventType["ChangeBrushSize"] = 10] = "ChangeBrushSize";
        VideoEventType[VideoEventType["CurrentTime"] = 11] = "CurrentTime";
        VideoEventType[VideoEventType["Render"] = 12] = "Render";
        VideoEventType[VideoEventType["ClearCanvas"] = 13] = "ClearCanvas";
        VideoEventType[VideoEventType["VideoInfoLoaded"] = 14] = "VideoInfoLoaded";
        VideoEventType[VideoEventType["CanvasSize"] = 15] = "CanvasSize";
        VideoEventType[VideoEventType["CanvasOffset"] = 16] = "CanvasOffset";
        VideoEventType[VideoEventType["RegisterRecordingTool"] = 17] = "RegisterRecordingTool";
        VideoEventType[VideoEventType["RecordingToolFinished"] = 18] = "RecordingToolFinished";
        VideoEventType[VideoEventType["RecordingFinished"] = 19] = "RecordingFinished";
        VideoEventType[VideoEventType["StartUpload"] = 20] = "StartUpload";
        VideoEventType[VideoEventType["DownloadData"] = 21] = "DownloadData";
    })(Helpers.VideoEventType || (Helpers.VideoEventType = {}));
    var VideoEventType = Helpers.VideoEventType;
    var VideoEvent = (function () {
        function VideoEvent(type) {
            this.type = type;
            this.listeners = [];
        }
        Object.defineProperty(VideoEvent.prototype, "Type", {
            get: function () { return this.type; },
            enumerable: true,
            configurable: true
        });
        /**
         * Attach a new listener.
         */
        VideoEvent.prototype.on = function (command) {
            this.listeners.push(command);
        };
        /**
         * Remove listener
         */
        VideoEvent.prototype.off = function (command) {
            var index = this.listeners.indexOf(command);
            if (index >= 0) {
                // delete just the one listener
                this.listeners.splice(index, 1);
            }
        };
        /**
         * Trigger this event
         */
        VideoEvent.prototype.trigger = function (args) {
            for (var i = 0; i < this.listeners.length; i++) {
                var cmd = this.listeners[i];
                this.triggerAsync(cmd, args);
            }
        };
        /**
         * Trigger event handle asynchronousely
         */
        VideoEvent.prototype.triggerAsync = function (command, args) {
            setTimeout(function () {
                command.apply(this, args);
            }, 0);
        };
        return VideoEvent;
    })();
    /**
     * Global mediator class.
     * Implements the Mediator design pattern.
     */
    var VideoEvents = (function () {
        function VideoEvents() {
        }
        /**
         * Register new event listener
         */
        VideoEvents.on = function (type, command) {
            if (type in VideoEvents.events === false) {
                VideoEvents.events[type] = new VideoEvent(type);
            }
            VideoEvents.events[type].on(command);
        };
        /**
         * Unregister event listener
         */
        VideoEvents.off = function (type, command) {
            if (type in VideoEvents.events === true) {
                VideoEvents.events[type].off(command);
            }
        };
        /**
         * Trigger an event
         */
        VideoEvents.trigger = function (type) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var e = VideoEvents.events[type];
            if (!!e) {
                e.trigger(args);
            }
        };
        /** Registered events */
        VideoEvents.events = [];
        return VideoEvents;
    })();
    Helpers.VideoEvents = VideoEvents;
})(Helpers || (Helpers = {}));
//# sourceMappingURL=VideoEvents.js.map