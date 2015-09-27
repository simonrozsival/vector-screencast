/// <reference path="audio.d.ts" />
var VideoEvents_1 = require('../Helpers/VideoEvents');
var Errors_1 = require('../Helpers/Errors');
var AudioPlayer_1 = require('./AudioPlayer');
var AudioRecorder = (function () {
    function AudioRecorder(config, events) {
        var _this = this;
        this.events = events;
        this.recording = false;
        this.initSuccessful = false;
        this.doNotStartRecording = false;
        this.settings = {
            host: "http://localhost",
            port: 4000,
            path: "/upload/audio",
            recordingWorkerPath: "/js/workers/RecordingWorker.js"
        };
        if (!!config.host)
            this.settings.host = config.host;
        if (!!config.port)
            this.settings.port = config.port;
        if (!!config.path)
            this.settings.path = config.path;
        this.recording = false;
        this.muted = false;
        this.events.on(VideoEvents_1.VideoEventType.MuteAudioRecording, function () { return _this.muted = !_this.muted; });
        this.error = function (msg) { return console.log("AudioRecorder error: ", msg); };
        this.success = function (msg) { return console.log("AudioRecorder success: ", msg); };
    }
    AudioRecorder.prototype.Init = function (success) {
        var _this = this;
        navigator.getUserMedia = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia);
        if (!!navigator.getUserMedia && window.hasOwnProperty("AudioContext")) {
            var context = (new AudioContext()
                || null);
            this.events.trigger(VideoEvents_1.VideoEventType.Busy);
            navigator.getUserMedia({
                video: false,
                audio: true
            }, function (localMediaStream) {
                if (_this.doNotStartRecording === false) {
                    _this.input = context.createMediaStreamSource(localMediaStream);
                    var bufferSize = 2048;
                    _this.scriptProcessorNode = context.createScriptProcessor(bufferSize, 1, 1);
                    _this.scriptProcessorNode.onaudioprocess = function (data) { return _this.processData(data); };
                    _this.input.connect(_this.scriptProcessorNode);
                    _this.scriptProcessorNode.connect(context.destination);
                    _this.initSuccessful = true;
                    _this.CreateAudioProcessor("web-socket", _this.settings, function () { return console.log("Audio recording is ready."); });
                    if (!!success) {
                        success();
                    }
                    _this.events.trigger(VideoEvents_1.VideoEventType.AudioRecordingAvailable);
                    _this.events.trigger(VideoEvents_1.VideoEventType.RegisterRecordingTool, "audio-recorder");
                    _this.events.trigger(VideoEvents_1.VideoEventType.Ready);
                }
            }, function (err) {
                if (err.name === "PermissionDeniedError") {
                    Errors_1.default.Report(Errors_1.ErrorType.Warning, "User didn't allow microphone recording.");
                }
                Errors_1.default.Report(Errors_1.ErrorType.Warning, "Can't record audio", err);
                _this.events.trigger(VideoEvents_1.VideoEventType.AudioRecordingUnavailable);
                _this.events.trigger(VideoEvents_1.VideoEventType.Ready);
            });
        }
        else {
            console.log("getUserMedia not supported by the browser");
            Errors_1.default.Report(Errors_1.ErrorType.Warning, "getUserMedia not supported by the browser");
            this.events.trigger(VideoEvents_1.VideoEventType.AudioRecordingUnavailable);
        }
    };
    AudioRecorder.prototype.CreateAudioProcessor = function (processorType, cfg, success, error) {
        var _this = this;
        if (Worker) {
            this.recordingWorker = new Worker(cfg.recordingWorkerPath);
            this.recordingWorker.onmessage = function (e) { return _this.ReceiveMessageFromWorker(e); };
            this.recordingWorker.postMessage({
                cmd: "init",
                AudioProcessorType: processorType || "web-sockets",
                port: cfg.port,
                host: cfg.host,
                path: cfg.path
            });
            if (!!success) {
                success();
            }
        }
        else {
            Errors_1.default.Report(Errors_1.ErrorType.Fatal, "No web workers support - this feature is not supported by the browser.");
            if (!!error) {
                error();
            }
        }
    };
    AudioRecorder.prototype.Start = function () {
        if (this.initSuccessful === true) {
            if (!this.recordingWorker) {
                Errors_1.default.Report(Errors_1.ErrorType.Fatal, "No audio processor was set.");
                return false;
            }
            else {
                this.recording = true;
                return true;
            }
        }
        else {
            this.doNotStartRecording = true;
            return false;
        }
    };
    AudioRecorder.prototype.Continue = function () {
        if (this.initSuccessful) {
            if (!this.recordingWorker) {
                Errors_1.default.Report(Errors_1.ErrorType.Fatal, "No audio processor was set.");
                return false;
            }
            else {
                this.recording = true;
                return true;
            }
        }
        else {
        }
        return false;
    };
    AudioRecorder.prototype.Pause = function () {
        if (this.initSuccessful) {
            this.recording = false;
            return true;
        }
        else {
        }
        return false;
    };
    AudioRecorder.prototype.Stop = function (success, error) {
        this.success = success;
        this.error = error;
        if (this.initSuccessful === true) {
            if (this.Pause()) {
                if (this.recordingWorker) {
                    this.recordingWorker.postMessage({
                        cmd: "finish"
                    });
                }
            }
        }
        else {
            Errors_1.default.Report(Errors_1.ErrorType.Warning, "Can't stop AudioRecorder - it wasn't ever initialised.");
            error();
        }
    };
    AudioRecorder.prototype.isRecording = function () {
        return this.initSuccessful;
    };
    AudioRecorder.prototype.processData = function (data) {
        if (this.recording === false) {
            return;
        }
        var left = data.inputBuffer.getChannelData(0);
        if (this.muted) {
            for (var i = 0; i < left.length; i++) {
                left[i] = 0;
            }
        }
        if (this.recordingWorker) {
            this.recordingWorker.postMessage({
                cmd: "pushData",
                data: left
            });
        }
    };
    AudioRecorder.prototype.ReceiveMessageFromWorker = function (e) {
        var msg = e.data;
        if (!msg.hasOwnProperty("type")) {
            console.log("Worker response is invalid (missing property 'type')", e.data);
            this.error("AudioRecorder received invalid message from the worker.");
            return;
        }
        switch (msg.type) {
            case "error":
                this.error(msg.msg);
            case "network-error":
                this.WorkerNetworkError();
                break;
            case "finished":
                this.WorkerFinished(msg);
                break;
            default:
                console.log("Unknown message type: ", msg.type, msg);
                break;
        }
    };
    AudioRecorder.prototype.WorkerFinished = function (msg) {
        this.recordingWorker.terminate();
        this.recordingWorker = null;
        this.events.trigger(VideoEvents_1.VideoEventType.RecordingToolFinished, "audio-recorder");
        var sources = [];
        for (var i = 0; i < msg.files.length; i++) {
            var file = msg.files[i];
            var source = new AudioPlayer_1.AudioSource(file.url, AudioPlayer_1.AudioSource.StringToType(file.type));
            sources.push(source);
        }
        this.success(sources);
    };
    AudioRecorder.prototype.WorkerNetworkError = function () {
        this.events.trigger(VideoEvents_1.VideoEventType.AudioRecordingUnavailable);
    };
    return AudioRecorder;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AudioRecorder;
