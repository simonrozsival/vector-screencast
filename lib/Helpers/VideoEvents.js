/**
 * Event Aggregator object.
 * @author Šimon Rozsíval
 */
(function (VideoEventType) {
    VideoEventType[VideoEventType["Start"] = 0] = "Start";
    VideoEventType[VideoEventType["Pause"] = 1] = "Pause";
    VideoEventType[VideoEventType["ReachEnd"] = 2] = "ReachEnd";
    VideoEventType[VideoEventType["JumpTo"] = 3] = "JumpTo";
    VideoEventType[VideoEventType["VideoInfoLoaded"] = 4] = "VideoInfoLoaded";
    VideoEventType[VideoEventType["BufferStatus"] = 5] = "BufferStatus";
    VideoEventType[VideoEventType["CursorState"] = 6] = "CursorState";
    VideoEventType[VideoEventType["ChangeColor"] = 7] = "ChangeColor";
    VideoEventType[VideoEventType["ChangeBrushSize"] = 8] = "ChangeBrushSize";
    VideoEventType[VideoEventType["StartPath"] = 9] = "StartPath";
    VideoEventType[VideoEventType["DrawSegment"] = 10] = "DrawSegment";
    VideoEventType[VideoEventType["DrawPath"] = 11] = "DrawPath";
    VideoEventType[VideoEventType["ClearCanvas"] = 12] = "ClearCanvas";
    VideoEventType[VideoEventType["RedrawCanvas"] = 13] = "RedrawCanvas";
    VideoEventType[VideoEventType["CanvasSize"] = 14] = "CanvasSize";
    VideoEventType[VideoEventType["CanvasScalingFactor"] = 15] = "CanvasScalingFactor";
    VideoEventType[VideoEventType["CursorOffset"] = 16] = "CursorOffset";
    VideoEventType[VideoEventType["RegisterRecordingTool"] = 17] = "RegisterRecordingTool";
    VideoEventType[VideoEventType["RecordingToolFinished"] = 18] = "RecordingToolFinished";
    VideoEventType[VideoEventType["MuteAudioRecording"] = 19] = "MuteAudioRecording";
    VideoEventType[VideoEventType["AudioRecordingAvailable"] = 20] = "AudioRecordingAvailable";
    VideoEventType[VideoEventType["AudioRecordingUnavailable"] = 21] = "AudioRecordingUnavailable";
    VideoEventType[VideoEventType["StartUpload"] = 22] = "StartUpload";
    VideoEventType[VideoEventType["DownloadData"] = 23] = "DownloadData";
    VideoEventType[VideoEventType["VolumeUp"] = 24] = "VolumeUp";
    VideoEventType[VideoEventType["VolumeDown"] = 25] = "VolumeDown";
    VideoEventType[VideoEventType["Mute"] = 26] = "Mute";
    VideoEventType[VideoEventType["Busy"] = 27] = "Busy";
    VideoEventType[VideoEventType["Ready"] = 28] = "Ready";
    VideoEventType[VideoEventType["length"] = 29] = "length";
})(exports.VideoEventType || (exports.VideoEventType = {}));
var VideoEventType = exports.VideoEventType;
var VideoEvent = (function () {
    function VideoEvent(type) {
        this.type = type;
        this.listeners = new Array(0);
    }
    Object.defineProperty(VideoEvent.prototype, "Type", {
        get: function () { return this.type; },
        enumerable: true,
        configurable: true
    });
    VideoEvent.prototype.on = function (command) {
        this.listeners.push(command);
    };
    VideoEvent.prototype.off = function (command) {
        var index = this.listeners.indexOf(command);
        if (index >= 0) {
            this.listeners.splice(index, 1);
        }
    };
    VideoEvent.prototype.trigger = function (args) {
        for (var i = 0; i < this.listeners.length; i++) {
            var cmd = this.listeners[i];
            cmd.apply(this, args);
        }
    };
    return VideoEvent;
})();
var VideoEvents = (function () {
    function VideoEvents() {
        this.events = new Array(VideoEventType.length);
    }
    VideoEvents.prototype.on = function (type, command) {
        if (!this.events[type]) {
            this.events[type] = new VideoEvent(type);
        }
        this.events[type].on(command);
    };
    VideoEvents.prototype.off = function (type, command) {
        if (!!this.events[type]) {
            this.events[type].off(command);
        }
    };
    VideoEvents.prototype.trigger = function (type) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var e = this.events[type];
        if (!!e) {
            e.trigger(args);
        }
    };
    return VideoEvents;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VideoEvents;
