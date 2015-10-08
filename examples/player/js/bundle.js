/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Player_1 = __webpack_require__(1);
	window.onload = function () {
	    var player = new Player_1.default("player-container", {
	        Source: "/data/demo-video.svg"
	    });
	    console.log(player.Events);
	};


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var AudioPlayer_1 = __webpack_require__(2);
	var VideoEvents_1 = __webpack_require__(3);
	var Errors_1 = __webpack_require__(4);
	var PlayerUI_1 = __webpack_require__(6);
	var VideoTimer_1 = __webpack_require__(15);
	var CanvasDrawer_1 = __webpack_require__(16);
	var Command_1 = __webpack_require__(20);
	var Chunk_1 = __webpack_require__(22);
	var File_1 = __webpack_require__(23);
	var IO_1 = __webpack_require__(24);
	var Player = (function () {
	    function Player(id, settings) {
	        var _this = this;
	        this.settings = settings;
	        this.lastMouseMoveState = null;
	        this.events = new VideoEvents_1.default();
	        var container = document.getElementById(id);
	        if (!container) {
	            Errors_1.default.Report(Errors_1.ErrorType.Fatal, "Container #" + id + " doesn't exist. Video Player couldn't be initialised.");
	        }
	        while (!!container.firstChild) {
	            container.removeChild(container.firstChild);
	        }
	        if (!settings.Localization) {
	            var loc = {
	                NoJS: "Your browser does not support JavaScript or it is turned off. Video can't be recorded without enabled JavaScript in your browser.",
	                DataLoadingFailed: "Unfortunatelly, downloading data failed.",
	                DataIsCorrupted: "This video can't be played, the data is corrupted.",
	                ControlPlayback: "Play/Pause video",
	                Play: "Play",
	                Pause: "Pause",
	                Replay: "Replay",
	                TimeStatus: "Video progress",
	                VolumeControl: "Volume controls",
	                VolumeUp: "Volume up",
	                VolumeDown: "Volume down",
	                Mute: "Mute",
	                Busy: "Loading..."
	            };
	            settings.Localization = loc;
	        }
	        this.timer = new VideoTimer_1.default(false);
	        this.ui = !!settings.UI ? settings.UI : new PlayerUI_1.default(id, this.events);
	        this.ui.Timer = this.timer;
	        this.ui.Localization = settings.Localization;
	        if (!!settings.ShowControls) {
	            this.ui.CreateControls(!!settings.Autohide);
	        }
	        this.drawer = !!settings.DrawingStrategy ? settings.DrawingStrategy : new CanvasDrawer_1.default(true);
	        this.drawer.SetEvents(this.events);
	        this.ui.AcceptCanvas(this.drawer.CreateCanvas());
	        container.appendChild(this.ui.GetHTML());
	        this.events.on(VideoEvents_1.VideoEventType.Start, function () { return _this.Play(); });
	        this.events.on(VideoEvents_1.VideoEventType.Pause, function () { return _this.Pause(); });
	        this.events.on(VideoEvents_1.VideoEventType.ReachEnd, function () { return _this.Pause(); });
	        this.events.on(VideoEvents_1.VideoEventType.ClearCanvas, function (color) { return _this.ClearCavnas(color); });
	        this.events.on(VideoEvents_1.VideoEventType.ChangeColor, function (color) { return _this.drawer.SetCurrentColor(color); });
	        this.events.on(VideoEvents_1.VideoEventType.JumpTo, function (progress) { return _this.JumpTo(progress); });
	        this.events.on(VideoEvents_1.VideoEventType.DrawSegment, function () { return _this.DrawSegment(); });
	        this.events.on(VideoEvents_1.VideoEventType.DrawPath, function (path) {
	            _this.drawnPath.DrawWholePath();
	            _this.drawnPath = null;
	        });
	        this.busyLevel = 0;
	        this.events.on(VideoEvents_1.VideoEventType.Busy, function () { return _this.Busy(); });
	        this.events.on(VideoEvents_1.VideoEventType.Ready, function () { return _this.Ready(); });
	        this.ui.SetBusyText(settings.Localization.Busy);
	        this.events.trigger(VideoEvents_1.VideoEventType.Busy);
	        File_1.default.ReadFileAsync(settings.Source, function (file) {
	            _this.ProcessVideoData(file);
	            _this.MonitorResize(container);
	            window.onresize = function () { return _this.MonitorResize(container); };
	        }, function (errStatusCode) {
	            Errors_1.default.Report(Errors_1.ErrorType.Warning, _this.settings.Localization.DataLoadingFailed);
	            _this.ui.SetBusyText(settings.Localization.DataLoadingFailed);
	        });
	    }
	    Object.defineProperty(Player.prototype, "Events", {
	        get: function () { return this.events; },
	        enumerable: true,
	        configurable: true
	    });
	    Player.prototype.MonitorResize = function (container) {
	        var rect = container.getBoundingClientRect();
	        if (rect.width !== this.oldWidth || rect.height !== this.oldHeight) {
	            this.drawer.Stretch();
	            var scalingFactor = this.drawer.SetupOutputCorrection(this.video.Metadata.Width, this.video.Metadata.Height);
	            this.events.trigger(VideoEvents_1.VideoEventType.CanvasScalingFactor, scalingFactor);
	            if (!!this.video) {
	                this.RedrawCurrentScreen();
	            }
	            this.oldWidth = rect.width;
	            this.oldHeight = rect.height;
	        }
	    };
	    Player.prototype.ProcessVideoData = function (data) {
	        try {
	            var reader = !!this.settings.VideoFormat ? this.settings.VideoFormat : new IO_1.default();
	            this.video = reader.LoadVideo(this.events, data);
	            reader = null;
	            this.audio = new AudioPlayer_1.default(this.events, this.video.Metadata.AudioTracks);
	        }
	        catch (e) {
	            reader = null;
	            this.video = null;
	            this.audio = null;
	            this.ui.SetBusyText(this.settings.Localization.DataIsCorrupted);
	            return;
	        }
	        this.events.trigger(VideoEvents_1.VideoEventType.VideoInfoLoaded, this.video.Metadata);
	        this.video.RewindMinusOne();
	        this.MoveToNextChunk();
	        this.events.trigger(VideoEvents_1.VideoEventType.Ready);
	        if (!!this.settings.Autoplay) {
	            this.events.trigger(VideoEvents_1.VideoEventType.Start);
	        }
	    };
	    Player.prototype.Play = function () {
	        var _this = this;
	        this.isPlaying = true;
	        this.timer.Resume();
	        !!this.audio && this.audio.Play();
	        this.ticking = requestAnimationFrame(function () { return _this.Tick(); });
	    };
	    Player.prototype.Pause = function () {
	        this.timer.Pause();
	        this.isPlaying = false;
	        !!this.audio && this.audio.Pause();
	        cancelAnimationFrame(this.ticking);
	    };
	    Player.prototype.Tick = function () {
	        var _this = this;
	        this.Sync();
	        this.ticking = requestAnimationFrame(function () { return _this.Tick(); });
	    };
	    Player.prototype.Sync = function () {
	        while (!!this.video.CurrentChunk) {
	            if (this.video.CurrentChunk.CurrentCommand === undefined) {
	                this.MoveToNextChunk();
	                if (!this.video.CurrentChunk
	                    || !this.video.CurrentChunk.CurrentCommand) {
	                    if (this.timer.CurrentTime() >= this.video.Metadata.Length) {
	                        this.ReachedEnd();
	                    }
	                    break;
	                }
	            }
	            if (this.video.CurrentChunk.CurrentCommand.Time > this.timer.CurrentTime()) {
	                break;
	            }
	            if (this.video.CurrentChunk.CurrentCommand instanceof Command_1.MoveCursor) {
	                this.lastMouseMoveState = this.video.CurrentChunk.CurrentCommand;
	            }
	            else {
	                this.video.CurrentChunk.CurrentCommand.Execute(this.events);
	            }
	            this.video.CurrentChunk.MoveNextCommand();
	        }
	        if (this.lastMouseMoveState !== null) {
	            this.lastMouseMoveState.Execute(this.events);
	            this.lastMouseMoveState = null;
	        }
	        if (this.drawnPath !== null) {
	            this.drawnPath.Draw();
	        }
	    };
	    Player.prototype.MoveToNextChunk = function () {
	        do {
	            this.video.MoveNextChunk();
	            if (!this.video.CurrentChunk) {
	                this.ReachedEnd();
	                break;
	            }
	            this.video.CurrentChunk.ExecuteInitCommands(this.events);
	            if (this.video.CurrentChunk instanceof Chunk_1.PathChunk) {
	                this.drawnPath = this.drawer.CreatePath(this.events);
	                var path = this.video.CurrentChunk.Path;
	                this.drawnPath.Segments = path.Segments;
	                this.drawnPath.Color = path.Color;
	                this.drawnSegment = 0;
	                path = this.drawnPath;
	            }
	            else {
	                this.drawnPath = null;
	            }
	            if (this.video.PeekNextChunk()
	                && this.video.PeekNextChunk().StartTime <= this.timer.CurrentTime()) {
	                this.video.CurrentChunk.Render(this.events);
	            }
	            else {
	                break;
	            }
	        } while (true);
	    };
	    Player.prototype.JumpTo = function (progress) {
	        var wasPlaying = this.isPlaying;
	        var time = progress * this.video.Metadata.Length;
	        var videoTime = this.timer.CurrentTime();
	        this.timer.SetTime(time);
	        this.audio.JumpTo(progress);
	        if (this.isPlaying) {
	            this.events.trigger(VideoEvents_1.VideoEventType.Pause);
	        }
	        var startChunk = 0;
	        if (time >= videoTime) {
	            startChunk = this.video.FastforwardErasedChunksUntil(time);
	        }
	        else {
	            startChunk = this.video.RewindToLastEraseBefore(time);
	        }
	        if (startChunk !== this.video.CurrentChunkNumber) {
	            this.video.SetCurrentChunkNumber = startChunk - 1;
	            this.MoveToNextChunk();
	        }
	        this.Sync();
	        this.ui.UpdateCurrentTime();
	        if (wasPlaying === true) {
	            this.events.trigger(VideoEvents_1.VideoEventType.Start);
	        }
	    };
	    Player.prototype.RedrawCurrentScreen = function () {
	        var wasPlaying = this.isPlaying;
	        if (this.isPlaying) {
	            this.events.trigger(VideoEvents_1.VideoEventType.Pause);
	        }
	        var startChunk = 0;
	        startChunk = this.video.RewindToLastEraseBefore(this.timer.CurrentTime());
	        this.video.SetCurrentChunkNumber = startChunk - 1;
	        this.MoveToNextChunk();
	        this.Sync();
	        if (wasPlaying === true) {
	            this.events.trigger(VideoEvents_1.VideoEventType.Start);
	        }
	    };
	    Player.prototype.ReachedEnd = function () {
	        this.events.trigger(VideoEvents_1.VideoEventType.ReachEnd);
	    };
	    Player.prototype.ClearCavnas = function (color) {
	        this.drawer.ClearCanvas(color);
	    };
	    Player.prototype.DrawSegment = function () {
	        if (this.drawnSegment === 0) {
	            this.drawnPath.StartDrawingPath(this.drawnPath.Segments[0]);
	            this.drawnSegment++;
	        }
	        else {
	            this.drawnPath.DrawSegment(this.drawnPath.Segments[this.drawnSegment++]);
	        }
	    };
	    Player.prototype.Busy = function () {
	        this.busyLevel++;
	        this.wasPlayingWhenBusy = this.wasPlayingWhenBusy || this.isPlaying;
	        this.events.trigger(VideoEvents_1.VideoEventType.Pause);
	        this.ui.Busy();
	    };
	    Player.prototype.Ready = function () {
	        if (--this.busyLevel === 0) {
	            if (this.wasPlayingWhenBusy === true) {
	                this.events.trigger(VideoEvents_1.VideoEventType.Start);
	                this.wasPlayingWhenBusy = false;
	            }
	            this.ui.Ready();
	        }
	    };
	    return Player;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Player;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="audio.d.ts" />
	var VideoEvents_1 = __webpack_require__(3);
	var Errors_1 = __webpack_require__(4);
	var HTML_1 = __webpack_require__(5);
	(function (AudioSourceType) {
	    AudioSourceType[AudioSourceType["MP3"] = 0] = "MP3";
	    AudioSourceType[AudioSourceType["OGG"] = 1] = "OGG";
	    AudioSourceType[AudioSourceType["WAV"] = 2] = "WAV";
	})(exports.AudioSourceType || (exports.AudioSourceType = {}));
	var AudioSourceType = exports.AudioSourceType;
	var AudioSource = (function () {
	    function AudioSource(url, type) {
	        this.url = url;
	        this.type = type;
	    }
	    Object.defineProperty(AudioSource.prototype, "Url", {
	        get: function () { return this.url; },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AudioSource.prototype, "Type", {
	        get: function () { return this.type; },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(AudioSource.prototype, "MimeType", {
	        get: function () {
	            switch (this.type) {
	                case AudioSourceType.MP3:
	                    return "audio/mp3";
	                case AudioSourceType.OGG:
	                    return "audio/ogg";
	                case AudioSourceType.WAV:
	                    return "audio/wav";
	                default:
	                    return null;
	            }
	        },
	        enumerable: true,
	        configurable: true
	    });
	    AudioSource.StringToType = function (type) {
	        switch (type) {
	            case "audio/mp3":
	                return AudioSourceType.MP3;
	            case "audio/wav":
	                return AudioSourceType.WAV;
	            case "audio/ogg":
	                return AudioSourceType.OGG;
	            default:
	                throw new Error("Unknown audio type " + type);
	        }
	    };
	    return AudioSource;
	})();
	exports.AudioSource = AudioSource;
	var AudioPlayer = (function () {
	    function AudioPlayer(events, sources) {
	        this.events = events;
	        this.audio = this.CreateAudio(sources);
	        if (this.audio === null) {
	            this.isReady = false;
	        }
	        else {
	            this.playing = false;
	            this.reachedEnd = false;
	            this.InitAudio();
	            this.isReady = true;
	            document.documentElement.appendChild(this.audio);
	            console.log("Audio is available.");
	        }
	    }
	    Object.defineProperty(AudioPlayer.prototype, "IsReady", {
	        get: function () { return this.isReady; },
	        enumerable: true,
	        configurable: true
	    });
	    AudioPlayer.prototype.CreateAudio = function (sources) {
	        try {
	            var audio = new Audio();
	            if (!audio.canPlayType) {
	                Errors_1.default.Report(Errors_1.ErrorType.Warning, "AudioPlayer: browser does not support HTML5 audio");
	                return null;
	            }
	            var canPlayAtLeastOne = false;
	            for (var i = 0; i < sources.length; i++) {
	                var element = sources[i];
	                if (audio.canPlayType(element.MimeType) === "probably") {
	                    var source = HTML_1.default.CreateElement("source", {
	                        src: element.Url,
	                        type: element.MimeType
	                    });
	                    audio.appendChild(source);
	                    canPlayAtLeastOne = true;
	                }
	            }
	            if (canPlayAtLeastOne === false) {
	                for (var i = 0; i < sources.length; i++) {
	                    var element = sources[i];
	                    if (audio.canPlayType(element.MimeType) === "maybe") {
	                        var source = HTML_1.default.CreateElement("source", {
	                            src: element.Url,
	                            type: element.MimeType
	                        });
	                        audio.appendChild(source);
	                        canPlayAtLeastOne = true;
	                    }
	                }
	            }
	            if (canPlayAtLeastOne === false) {
	                Errors_1.default.Report(Errors_1.ErrorType.Warning, "Browser can't play any of available audio sources.", sources);
	                return null;
	            }
	            return audio;
	        }
	        catch (e) {
	            Errors_1.default.Report(Errors_1.ErrorType.Warning, "AudioPlayer: can't create audio element", e);
	            return null;
	        }
	    };
	    AudioPlayer.prototype.InitAudio = function () {
	        var _this = this;
	        this.audio.onended = function () { return _this.events.trigger(VideoEvents_1.VideoEventType.ReachEnd); };
	        this.audio.onwaiting = function () { return _this.Busy(); };
	        this.audio.oncanplay = function () { return _this.Ready(); };
	        this.events.on(VideoEvents_1.VideoEventType.Mute, function () { return _this.Mute(); });
	        this.events.on(VideoEvents_1.VideoEventType.VolumeUp, function () { return _this.VolumeUp(); });
	        this.events.on(VideoEvents_1.VideoEventType.VolumeDown, function () { return _this.VolumeDown(); });
	        this.MonitorBufferingAsync();
	    };
	    ;
	    AudioPlayer.prototype.Busy = function () {
	        if (this.playing) {
	            this.triggeredBusyState = true;
	            this.events.trigger(VideoEvents_1.VideoEventType.Pause);
	        }
	    };
	    AudioPlayer.prototype.Ready = function () {
	        if (this.triggeredBusyState) {
	            this.events.trigger(VideoEvents_1.VideoEventType.Ready);
	            this.triggeredBusyState = false;
	        }
	    };
	    AudioPlayer.prototype.Play = function () {
	        if (this.isReady) {
	            if (this.reachedEnd == true) {
	                this.Rewind();
	            }
	            this.audio.play();
	        }
	    };
	    AudioPlayer.prototype.InitiatePlay = function () {
	        this.events.trigger(VideoEvents_1.VideoEventType.Start);
	    };
	    AudioPlayer.prototype.Pause = function () {
	        if (this.isReady) {
	            this.audio.pause();
	        }
	    };
	    AudioPlayer.prototype.ReachedEnd = function () {
	        this.reachedEnd = true;
	        this.Pause();
	    };
	    AudioPlayer.prototype.Replay = function () {
	        this.Rewind();
	        this.Play();
	    };
	    AudioPlayer.prototype.Rewind = function () {
	        if (this.isReady) {
	            this.audio.pause();
	            this.audio.currentTime = 0;
	            this.reachedEnd = false;
	        }
	    };
	    AudioPlayer.prototype.MonitorBufferingAsync = function () {
	        var _this = this;
	        var lastEnd = 0;
	        this.checkPreloaded = setInterval(function () {
	            var end = _this.audio.buffered.end(_this.audio.buffered.length - 1);
	            if (end !== lastEnd) {
	                _this.events.trigger(VideoEvents_1.VideoEventType.BufferStatus, end);
	                lastEnd = end;
	            }
	            if (end === _this.audio.duration) {
	                clearInterval(_this.checkPreloaded);
	            }
	        }, 300);
	    };
	    AudioPlayer.prototype.JumpTo = function (progress) {
	        if (!this.isReady)
	            return;
	        this.reachedEnd = false;
	        var time = this.audio.duration * progress;
	        this.ChangePosition(time);
	        clearInterval(this.checkPreloaded);
	        this.MonitorBufferingAsync();
	    };
	    AudioPlayer.prototype.ChangePosition = function (seconds) {
	        this.audio.currentTime = seconds;
	    };
	    AudioPlayer.prototype.Mute = function () {
	        this.audio.muted = !this.audio.muted;
	    };
	    AudioPlayer.prototype.VolumeUp = function () {
	        this.audio.volume = Math.min(1, this.audio.volume + 0.1);
	    };
	    AudioPlayer.prototype.VolumeDown = function () {
	        this.audio.volume = Math.max(0, this.audio.volume - 0.1);
	    };
	    return AudioPlayer;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = AudioPlayer;


/***/ },
/* 3 */
/***/ function(module, exports) {

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


/***/ },
/* 4 */
/***/ function(module, exports) {

	//namespace VectorScreencast.Helpers {
	(function (ErrorType) {
	    ErrorType[ErrorType["Warning"] = 0] = "Warning";
	    ErrorType[ErrorType["Fatal"] = 1] = "Fatal";
	})(exports.ErrorType || (exports.ErrorType = {}));
	var ErrorType = exports.ErrorType;
	var Errors = (function () {
	    function Errors() {
	    }
	    Errors.TurnOn = function () { this.doLog = true; };
	    Errors.TurnOff = function () { this.doLog = false; };
	    Errors.SetLogFunction = function (f) {
	        this.LogFunction = f;
	    };
	    Errors.Report = function (type) {
	        var args = [];
	        for (var _i = 1; _i < arguments.length; _i++) {
	            args[_i - 1] = arguments[_i];
	        }
	        if (this.doLog) {
	            this.LogFunction(type, args);
	        }
	    };
	    Errors.ErrorTypeName = function (e) {
	        switch (e) {
	            case ErrorType.Warning:
	                return "Warning";
	            case ErrorType.Fatal:
	                return "Fatal error";
	            default:
	                return "Unknown error type";
	        }
	    };
	    Errors.doLog = true;
	    Errors.LogFunction = function (type, args) {
	        if (type === ErrorType.Fatal) {
	            throw new Error("Fatal Error: " + args.join("; "));
	        }
	        else {
	            console.log(Errors.ErrorTypeName(type), args);
	        }
	    };
	    return Errors;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Errors;


/***/ },
/* 5 */
/***/ function(module, exports) {

	//namespace VectorScreencast.Helpers {
	var HTML = (function () {
	    function HTML() {
	    }
	    HTML.CreateElement = function (name, attributes, children) {
	        var el = document.createElement(name);
	        if (!!attributes) {
	            HTML.SetAttributes(el, attributes);
	        }
	        if (!!children && Array.isArray(children)) {
	            for (var i in children) {
	                el.appendChild(children[i]);
	            }
	        }
	        return el;
	    };
	    HTML.SetAttributes = function (el, attributes) {
	        for (var attr in attributes) {
	            el.setAttribute(attr, attributes[attr]);
	        }
	    };
	    return HTML;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = HTML;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var VideoEvents_1 = __webpack_require__(3);
	var HTML_1 = __webpack_require__(5);
	var HelperFunctions_1 = __webpack_require__(7);
	var BasicElements_1 = __webpack_require__(8);
	var Board_1 = __webpack_require__(9);
	var TimeLine_1 = __webpack_require__(14);
	var PlayerUI = (function (_super) {
	    __extends(PlayerUI, _super);
	    function PlayerUI(id, events) {
	        var _this = this;
	        _super.call(this, "div", id + "-player");
	        this.id = id;
	        this.events = events;
	        this.isBusy = false;
	        this.tickingInterval = 200;
	        this.isMuted = false;
	        this.AddClass("vector-video-wrapper");
	        this.board = this.CreateBoard();
	        this.AddChild(this.board);
	        this.events.on(VideoEvents_1.VideoEventType.Start, function () { return _this.StartPlaying(); });
	        this.events.on(VideoEvents_1.VideoEventType.Pause, function () { return _this.PausePlaying(); });
	        this.events.on(VideoEvents_1.VideoEventType.ReachEnd, function () { return _this.ReachedEnd(); });
	        this.events.on(VideoEvents_1.VideoEventType.JumpTo, function () { return _this.JumpTo(); });
	        this.events.on(VideoEvents_1.VideoEventType.ClearCanvas, function (c) { return _this.GetHTML().style.backgroundColor = c.CssValue; });
	        this.isPlaying = false;
	        this.reachedEnd = false;
	    }
	    PlayerUI.prototype.CreateControls = function (autohide) {
	        var _this = this;
	        this.timeline = this.CreateTimeLine();
	        this.hidingButton = new BasicElements_1.IconOnlyButton(autohide ? "icon-show" : "icon-hide", "", function (e) { return _this.ToggleAutohiding(); })
	            .AddClasses("autohiding-toggle");
	        this.controls = new BasicElements_1.Panel("div", this.id + "-controls")
	            .AddClasses("ui-controls", "ui-control")
	            .AddChildren(this.CreateButtonsPanel(), this.timeline, this.CreateTimeStatus(), this.CreateAudioControls());
	        !!autohide && this.controls.AddClass("autohide");
	        this.AddChildren(new BasicElements_1.Panel("div")
	            .AddClass("ui-controls-wrapper")
	            .AddChildren(this.controls, this.hidingButton));
	        this.events.on(VideoEvents_1.VideoEventType.VideoInfoLoaded, function (meta) {
	            _this.videoDuration = meta.Length;
	            _this.totalTime.GetHTML().textContent = HelperFunctions_1.millisecondsToString(meta.Length);
	            _this.timeline.Length = meta.Length;
	        });
	        this.events.on(VideoEvents_1.VideoEventType.BufferStatus, function (seconds) { return _this.timeline.SetBuffer(seconds * 1000); });
	        this.BindKeyboardShortcuts();
	    };
	    PlayerUI.prototype.SetBusyText = function (text) {
	        HTML_1.default.SetAttributes(this.GetHTML(), { "data-busy-string": text });
	    };
	    PlayerUI.prototype.BindKeyboardShortcuts = function () {
	        var _this = this;
	        var spacebar = 32;
	        var leftArrow = 37;
	        var rightArrow = 39;
	        var skipTime = 5000;
	        window.onkeyup = function (e) {
	            switch (e.keyCode) {
	                case spacebar:
	                    _this.PlayPause();
	                    break;
	                case leftArrow:
	                    _this.timeline.SkipTo(Math.max(0, _this.Timer.CurrentTime() - skipTime));
	                    break;
	                case rightArrow:
	                    _this.timeline.SkipTo(Math.min(_this.Timer.CurrentTime() + skipTime, _this.videoDuration));
	                    break;
	            }
	        };
	    };
	    PlayerUI.prototype.AcceptCanvas = function (canvas) {
	        this.board.GetHTML().appendChild(canvas);
	    };
	    PlayerUI.prototype.CreateBoard = function () {
	        var _this = this;
	        var board = new Board_1.default(this.id + "-board", this.events);
	        board.GetHTML().onclick = function () { return _this.PlayPause(); };
	        return board;
	    };
	    PlayerUI.prototype.CreateButtonsPanel = function () {
	        var _this = this;
	        this.playPauseButton = new BasicElements_1.IconOnlyButton("icon-play", this.Localization.Play, function (e) { return _this.PlayPause(); });
	        return new BasicElements_1.Panel("div")
	            .AddChildren(new BasicElements_1.H2(this.Localization.ControlPlayback), this.playPauseButton)
	            .AddClass("ui-controls-panel");
	    };
	    PlayerUI.prototype.PlayPause = function () {
	        if (this.isBusy || !this.controls)
	            return;
	        if (this.reachedEnd) {
	            this.reachedEnd = false;
	            this.timeline.SkipTo(0);
	            this.events.trigger(VideoEvents_1.VideoEventType.Start);
	            return;
	        }
	        if (this.isPlaying === true) {
	            this.PausePlaying();
	            this.events.trigger(VideoEvents_1.VideoEventType.Pause);
	        }
	        else {
	            this.StartPlaying();
	            this.events.trigger(VideoEvents_1.VideoEventType.Start);
	        }
	    };
	    PlayerUI.prototype.JumpTo = function () {
	        if (!this.controls)
	            return;
	        if (this.reachedEnd === true) {
	            this.reachedEnd = false;
	            this.playPauseButton.ChangeIcon("icon-play");
	        }
	    };
	    PlayerUI.prototype.StartPlaying = function () {
	        var _this = this;
	        if (!this.controls)
	            return;
	        if (this.isPlaying === false) {
	            this.isPlaying = true;
	            this.playPauseButton.ChangeIcon("icon-pause");
	            this.playPauseButton.ChangeContent(this.Localization.Pause);
	            this.AddClass("playing");
	            this.ticking = setInterval(function () { return _this.UpdateCurrentTime(); }, this.tickingInterval);
	        }
	    };
	    PlayerUI.prototype.PausePlaying = function () {
	        if (!this.controls)
	            return;
	        this.isPlaying = false;
	        this.playPauseButton.ChangeIcon("icon-play");
	        this.playPauseButton.ChangeContent(this.Localization.Play);
	        this.RemoveClass("playing");
	        clearInterval(this.ticking);
	    };
	    PlayerUI.prototype.CreateTimeLine = function () {
	        return new TimeLine_1.default(this.id + "-timeline", this.events);
	    };
	    PlayerUI.prototype.CreateTimeStatus = function () {
	        this.currentTime = new BasicElements_1.SimpleElement("span", "0:00");
	        this.totalTime = new BasicElements_1.SimpleElement("span", "0:00");
	        return new BasicElements_1.Panel("div")
	            .AddChildren(new BasicElements_1.H2(this.Localization.TimeStatus), new BasicElements_1.Panel("div")
	            .AddChildren(this.currentTime, new BasicElements_1.SimpleElement("span", " / "), this.totalTime)
	            .AddClass("ui-time"))
	            .AddClass("ui-controls-panel");
	    };
	    PlayerUI.prototype.UpdateCurrentTime = function (time) {
	        this.currentTime.GetHTML().textContent = HelperFunctions_1.millisecondsToString(!!time ? time : this.Timer.CurrentTime());
	        this.timeline.Sync(!!time ? time : this.Timer.CurrentTime());
	    };
	    PlayerUI.prototype.ReachedEnd = function () {
	        if (!this.controls)
	            return;
	        this.PausePlaying();
	        this.playPauseButton.ChangeIcon("icon-replay").ChangeContent(this.Localization.Replay);
	        this.reachedEnd = true;
	        this.UpdateCurrentTime();
	    };
	    PlayerUI.prototype.Busy = function () {
	        this.AddClass("busy");
	        this.isBusy = true;
	    };
	    PlayerUI.prototype.Ready = function () {
	        this.RemoveClass("busy");
	        this.isBusy = false;
	    };
	    PlayerUI.prototype.CreateAudioControls = function () {
	        var _this = this;
	        return new BasicElements_1.Panel("div", this.id + "-audio")
	            .AddChildren(new BasicElements_1.H2(this.Localization.VolumeControl), new BasicElements_1.Panel("div", this.id + "-audio-controls")
	            .AddChildren((this.volumeDownBtn = new BasicElements_1.IconOnlyButton("icon-volume-down", this.Localization.VolumeDown, function (e) { return _this.VolumeDown(); })), (this.volumeUpBtn = new BasicElements_1.IconOnlyButton("icon-volume-up", this.Localization.VolumeUp, function (e) { return _this.VolumeUp(); })), (this.volumeOffBtn = new BasicElements_1.IconOnlyButton("icon-volume-off", this.Localization.Mute, function (e) { return _this.Mute(); })))
	            .AddClass("btn-group"))
	            .AddClasses("ui-controls-panel", "vector-video-audio-controls");
	    };
	    PlayerUI.prototype.VolumeUp = function () {
	        this.events.trigger(VideoEvents_1.VideoEventType.VolumeUp);
	    };
	    PlayerUI.prototype.VolumeDown = function () {
	        this.events.trigger(VideoEvents_1.VideoEventType.VolumeDown);
	    };
	    PlayerUI.prototype.Mute = function () {
	        if (!this.isMuted) {
	            HTML_1.default.SetAttributes(this.volumeDownBtn.GetHTML(), { disabled: "disabled" });
	            HTML_1.default.SetAttributes(this.volumeUpBtn.GetHTML(), { disabled: "disabled" });
	            this.volumeOffBtn.AddClass("active");
	        }
	        else {
	            this.volumeDownBtn.GetHTML().removeAttribute("disabled");
	            this.volumeUpBtn.GetHTML().removeAttribute("disabled");
	            this.volumeOffBtn.RemoveClass("active");
	        }
	        this.isMuted = !this.isMuted;
	        this.events.trigger(VideoEvents_1.VideoEventType.Mute);
	    };
	    PlayerUI.prototype.ToggleAutohiding = function () {
	        if (this.controls.HasClass("autohide")) {
	            this.controls.RemoveClass("autohide");
	            this.hidingButton.ChangeIcon("icon-hide");
	        }
	        else {
	            this.controls.AddClass("autohide");
	            this.hidingButton.ChangeIcon("icon-show");
	        }
	    };
	    return PlayerUI;
	})(BasicElements_1.Panel);
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = PlayerUI;


/***/ },
/* 7 */
/***/ function(module, exports) {

	//namespace VectorScreencast.Helpers {
	var COORDS_PRECISION = 3;
	function maxDecPlaces(n, precision) {
	    if (precision === void 0) { precision = COORDS_PRECISION; }
	    return Number(n.toFixed(precision));
	}
	exports.maxDecPlaces = maxDecPlaces;
	function precise(n, precision) {
	    if (precision === void 0) { precision = COORDS_PRECISION; }
	    return maxDecPlaces(n, precision).toString();
	}
	exports.precise = precise;
	function secondsToString(s) {
	    var time;
	    var minutes = Math.floor(s / 60);
	    time = minutes + ":";
	    var seconds = Math.floor(s % 60);
	    if (seconds <= 9) {
	        time += "0" + seconds.toString(10);
	    }
	    else {
	        time += seconds.toString(10);
	    }
	    return time;
	}
	exports.secondsToString = secondsToString;
	;
	function millisecondsToString(ms) {
	    return secondsToString(Math.floor(ms / 1000));
	}
	exports.millisecondsToString = millisecondsToString;
	;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var HTML_1 = __webpack_require__(5);
	var SimpleElement = (function () {
	    function SimpleElement(tag, content) {
	        if (tag instanceof HTMLElement) {
	            this.element = tag;
	        }
	        else {
	            this.element = HTML_1.default.CreateElement(tag);
	        }
	        if (!!content) {
	            this.element.textContent = content;
	        }
	    }
	    SimpleElement.prototype.GetHTML = function () { return this.element; };
	    SimpleElement.prototype.HasClass = function (className) {
	        return this.GetHTML().classList.contains(className);
	    };
	    SimpleElement.prototype.AddClass = function (className) {
	        return this.AddClasses(className);
	    };
	    SimpleElement.prototype.AddClasses = function () {
	        var classes = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            classes[_i - 0] = arguments[_i];
	        }
	        for (var i = 0; i < classes.length; i++) {
	            this.GetHTML().classList.add(classes[i]);
	        }
	        return this;
	    };
	    SimpleElement.prototype.RemoveClass = function (className) {
	        return this.RemoveClasses(className);
	    };
	    SimpleElement.prototype.RemoveClasses = function () {
	        var classes = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            classes[_i - 0] = arguments[_i];
	        }
	        for (var i = 0; i < classes.length; i++) {
	            this.GetHTML().classList.remove(classes[i]);
	        }
	        return this;
	    };
	    return SimpleElement;
	})();
	exports.SimpleElement = SimpleElement;
	var Button = (function (_super) {
	    __extends(Button, _super);
	    function Button(text, onClick) {
	        _super.call(this, "button");
	        this.AddClass("ui-button");
	        this.content = new SimpleElement("span", text);
	        this.GetHTML().appendChild(this.content.GetHTML());
	        if (!!onClick) {
	            this.GetHTML().onclick = onClick;
	        }
	    }
	    Button.prototype.ChangeContent = function (content) {
	        this.content.GetHTML().innerHTML = content;
	        return this;
	    };
	    return Button;
	})(SimpleElement);
	exports.Button = Button;
	var IconButton = (function (_super) {
	    __extends(IconButton, _super);
	    function IconButton(iconClass, content, onClick) {
	        _super.call(this, content, onClick);
	        this.iconClass = iconClass;
	        this.icon = new SimpleElement("span", "").AddClasses("icon", iconClass);
	        this.AddClass("has-icon");
	        this.GetHTML().appendChild(this.icon.GetHTML());
	    }
	    IconButton.prototype.ChangeIcon = function (iconClass) {
	        this.icon.RemoveClass(this.iconClass).AddClass(iconClass);
	        this.iconClass = iconClass;
	        return this;
	    };
	    return IconButton;
	})(Button);
	exports.IconButton = IconButton;
	var IconOnlyButton = (function (_super) {
	    __extends(IconOnlyButton, _super);
	    function IconOnlyButton(iconClass, title, onClick) {
	        _super.call(this, iconClass, "", onClick);
	        this.ChangeContent(title);
	        this.AddClass("icon-only-button");
	    }
	    IconOnlyButton.prototype.ChangeContent = function (content) {
	        HTML_1.default.SetAttributes(this.GetHTML(), { title: content });
	        return this;
	    };
	    return IconOnlyButton;
	})(IconButton);
	exports.IconOnlyButton = IconOnlyButton;
	var Heading = (function (_super) {
	    __extends(Heading, _super);
	    function Heading(level, text) {
	        _super.call(this, "h" + level, text);
	    }
	    return Heading;
	})(SimpleElement);
	exports.Heading = Heading;
	var H2 = (function (_super) {
	    __extends(H2, _super);
	    function H2(text) {
	        _super.call(this, 2, text);
	    }
	    return H2;
	})(Heading);
	exports.H2 = H2;
	var Panel = (function () {
	    function Panel(tag, id) {
	        this.element = HTML_1.default.CreateElement(tag);
	        if (!!id) {
	            HTML_1.default.SetAttributes(this.element, { id: id });
	        }
	        this.elements = [];
	    }
	    Object.defineProperty(Panel.prototype, "Children", {
	        get: function () { return this.elements; },
	        enumerable: true,
	        configurable: true
	    });
	    Panel.prototype.AddChild = function (el) {
	        return this.AddChildren(el);
	    };
	    Panel.prototype.AddChildren = function () {
	        var elements = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            elements[_i - 0] = arguments[_i];
	        }
	        for (var i = 0; i < elements.length; i++) {
	            this.elements.push(elements[i]);
	            this.GetHTML().appendChild(elements[i].GetHTML());
	        }
	        return this;
	    };
	    Panel.prototype.GetHTML = function () { return this.element; };
	    Panel.prototype.HasClass = function (className) {
	        return this.GetHTML().classList.contains(className);
	    };
	    Panel.prototype.AddClass = function (className) {
	        return this.AddClasses(className);
	    };
	    Panel.prototype.AddClasses = function () {
	        var classes = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            classes[_i - 0] = arguments[_i];
	        }
	        for (var i = 0; i < classes.length; i++) {
	            this.GetHTML().classList.add(classes[i]);
	        }
	        return this;
	    };
	    Panel.prototype.RemoveClass = function (className) {
	        return this.RemoveClasses(className);
	    };
	    Panel.prototype.RemoveClasses = function () {
	        var classes = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            classes[_i - 0] = arguments[_i];
	        }
	        for (var i = 0; i < classes.length; i++) {
	            this.GetHTML().classList.remove(classes[i]);
	        }
	        return this;
	    };
	    return Panel;
	})();
	exports.Panel = Panel;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var VideoEvents_1 = __webpack_require__(3);
	var HTML_1 = __webpack_require__(5);
	var BasicElements_1 = __webpack_require__(8);
	var Cursor_1 = __webpack_require__(10);
	var Board = (function (_super) {
	    __extends(Board, _super);
	    function Board(id, events) {
	        var _this = this;
	        _super.call(this, "div", id);
	        this.events = events;
	        HTML_1.default.SetAttributes(this.GetHTML(), { class: "vector-video-board" });
	        this.cursor = new Cursor_1.default(events);
	        this.AddChild(this.cursor);
	        HTML_1.default.SetAttributes(this.GetHTML(), { position: "relative" });
	        events.on(VideoEvents_1.VideoEventType.CursorState, function (state) { return _this.UpdateCursorPosition(state); });
	        events.on(VideoEvents_1.VideoEventType.CursorState, function (state) { return _this.UpdateCursorPosition(state); });
	        events.on(VideoEvents_1.VideoEventType.ChangeBrushSize, function (state) { return _this.UpdateCursorSize(state); });
	        events.on(VideoEvents_1.VideoEventType.ChangeColor, function (state) { return _this.UpdateCursorColor(state); });
	        events.on(VideoEvents_1.VideoEventType.ChangeColor, function (state) { return _this.UpdateCursorColor(state); });
	        events.on(VideoEvents_1.VideoEventType.CanvasScalingFactor, function (scalingFactor) { return _this.UpdateCursorScale(scalingFactor); });
	        events.on(VideoEvents_1.VideoEventType.CursorOffset, function (offset) { return _this.cursor.Offset = offset; });
	    }
	    Object.defineProperty(Board.prototype, "Width", {
	        get: function () {
	            return this.GetHTML().clientWidth;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Board.prototype, "Height", {
	        get: function () {
	            return this.GetHTML().clientHeight;
	        },
	        set: function (height) {
	            this.GetHTML().clientHeight = height;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Board.prototype, "IsRecording", {
	        set: function (isRecording) {
	            isRecording ? this.GetHTML().classList.add("recording") : this.GetHTML().classList.remove("recording");
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Board.prototype.UpdateCursorPosition = function (state) {
	        this.cursor.MoveTo(state.X, state.Y);
	    };
	    Board.prototype.UpdateCursorSize = function (size) {
	        this.cursor.ChangeSize(size);
	    };
	    Board.prototype.UpdateCursorColor = function (color) {
	        this.cursor.ChangeColor(color);
	    };
	    Board.prototype.UpdateCursorScale = function (scalingFactor) {
	        this.cursor.SetScalingFactor(scalingFactor);
	    };
	    return Board;
	})(BasicElements_1.Panel);
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Board;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Vector_1 = __webpack_require__(11);
	var BasicElements_1 = __webpack_require__(8);
	var VideoEvents_1 = __webpack_require__(3);
	var SVG_1 = __webpack_require__(12);
	var Color_1 = __webpack_require__(13);
	var Cursor = (function (_super) {
	    __extends(Cursor, _super);
	    function Cursor(events) {
	        _super.call(this, "div");
	        this.events = events;
	        this.radius = 20;
	        this.stroke = 3;
	        this.position = new Vector_1.default(0, 0);
	        this.offset = new Vector_1.default(0, 0);
	        this.CreateHTML();
	        this.scalingFactor = 1;
	        this.size = null;
	    }
	    Object.defineProperty(Cursor.prototype, "Offset", {
	        set: function (val) {
	            this.offset = val;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Cursor.prototype.CreateHTML = function () {
	        var _this = this;
	        this.svg = SVG_1.default.CreateElement("svg", {
	            width: 2 * this.radius,
	            height: 2 * this.radius
	        });
	        this.GetHTML().appendChild(this.svg);
	        this.bgColor = Color_1.default.BackgroundColor;
	        this.color = Color_1.default.ForegroundColor;
	        this.dot = SVG_1.default.CreateDot(new Vector_1.default(this.radius, this.radius), this.radius - this.stroke, this.bgColor.CssValue);
	        SVG_1.default.SetAttributes(this.dot, {
	            "stroke": this.color.CssValue,
	            "stroke-width": this.stroke
	        });
	        this.svg.appendChild(this.dot);
	        this.GetHTML().style.position = "absolute";
	        this.GetHTML().style.background = "transparent";
	        this.GetHTML().style.lineHeight = "0";
	        this.events.on(VideoEvents_1.VideoEventType.ClearCanvas, function (color) {
	            _this.bgColor = color;
	            SVG_1.default.SetAttributes(_this.dot, { fill: _this.bgColor.CssValue });
	            _this.ChangeColor(_this.color);
	        });
	    };
	    Cursor.prototype.MoveTo = function (x, y) {
	        this.GetHTML().style.left = (x * this.scalingFactor - this.radius - this.stroke + this.offset.X) + "px";
	        this.GetHTML().style.top = (y * this.scalingFactor - this.radius - this.stroke + this.offset.Y) + "px";
	        this.position = new Vector_1.default(x, y);
	    };
	    Cursor.prototype.ChangeColor = function (color) {
	        if (color.CssValue === this.bgColor.CssValue) {
	            color = color.CssValue === Color_1.default.ForegroundColor.CssValue ? Color_1.default.BackgroundColor : Color_1.default.ForegroundColor;
	        }
	        SVG_1.default.SetAttributes(this.dot, {
	            stroke: color.CssValue
	        });
	        this.color = color;
	    };
	    Cursor.prototype.ChangeSize = function (size) {
	        this.size = size;
	        var originalRadius = this.radius;
	        this.radius = (size.Size * this.scalingFactor) / 2 - 2;
	        var calculatedSize = 2 * (this.radius + this.stroke);
	        SVG_1.default.SetAttributes(this.svg, {
	            width: calculatedSize,
	            height: calculatedSize
	        });
	        var shift = originalRadius - this.radius;
	        this.MoveTo(this.position.X + shift, this.position.Y + shift);
	        SVG_1.default.SetAttributes(this.dot, {
	            cx: calculatedSize / 2,
	            cy: calculatedSize / 2,
	            r: Math.max(1, this.radius - this.stroke)
	        });
	    };
	    Cursor.prototype.SetScalingFactor = function (sf) {
	        this.scalingFactor = sf;
	        if (!!this.size) {
	            this.ChangeSize(this.size);
	        }
	    };
	    return Cursor;
	})(BasicElements_1.SimpleElement);
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Cursor;


/***/ },
/* 11 */
/***/ function(module, exports) {

	var Vector2 = (function () {
	    function Vector2(x, y) {
	        this.x = x;
	        this.y = y;
	    }
	    Object.defineProperty(Vector2.prototype, "X", {
	        get: function () { return this.x; },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Vector2.prototype, "Y", {
	        get: function () { return this.y; },
	        enumerable: true,
	        configurable: true
	    });
	    Vector2.prototype.isEqualTo = function (b) {
	        return this.X === b.X && this.Y === b.Y;
	    };
	    Vector2.prototype.getSize = function () {
	        return Math.sqrt(this.getSizeSq());
	    };
	    ;
	    Vector2.prototype.getSizeSq = function () {
	        return this.x * this.x + this.y * this.y;
	    };
	    Vector2.prototype.distanceTo = function (b) {
	        var dx = this.x - b.X;
	        var dy = this.y - b.Y;
	        return Math.sqrt(dx * dx + dy * dy);
	    };
	    ;
	    Vector2.prototype.normalize = function () {
	        var size = this.getSize();
	        if (size === 0) {
	            throw new Error("Can't normalize zero vector.");
	        }
	        this.scale(1 / size);
	        return this;
	    };
	    ;
	    Vector2.prototype.getNormal = function () {
	        return (new Vector2(-this.y, this.x)).normalize();
	    };
	    ;
	    Vector2.prototype.add = function (b) {
	        this.x += b.X;
	        this.y += b.Y;
	        return this;
	    };
	    ;
	    Vector2.prototype.subtract = function (b) {
	        this.x -= b.X;
	        this.y -= b.Y;
	        return this;
	    };
	    ;
	    Vector2.prototype.scale = function (c) {
	        this.x *= c;
	        this.y *= c;
	        return this;
	    };
	    ;
	    Vector2.prototype.pointInBetween = function (b) {
	        return new Vector2((this.x + b.X) / 2, (this.y + b.Y) / 2);
	    };
	    Vector2.prototype.clone = function () {
	        return new Vector2(this.x, this.y);
	    };
	    ;
	    return Vector2;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Vector2;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var HelperFunctions_1 = __webpack_require__(7);
	var SVG = (function () {
	    function SVG() {
	    }
	    Object.defineProperty(SVG, "Namespace", {
	        get: function () { return this.namespace; },
	        enumerable: true,
	        configurable: true
	    });
	    SVG.CreateDot = function (center, radius, color) {
	        return this.CreateElement("circle", {
	            cx: HelperFunctions_1.precise(center.X),
	            cy: HelperFunctions_1.precise(center.Y),
	            r: HelperFunctions_1.precise(radius),
	            fill: color,
	            stroke: "transparent"
	        });
	    };
	    SVG.CreateCircle = function (center, radius, color) {
	        if (radius > 0) {
	            return this.CreateElement("circle", {
	                cx: HelperFunctions_1.precise(center.X),
	                cy: HelperFunctions_1.precise(center.Y),
	                r: HelperFunctions_1.precise(radius),
	                stroke: color,
	                fill: "transparent",
	                "stroke-width": 1
	            });
	        }
	        return null;
	    };
	    SVG.CreateLine = function (start, end, width, color) {
	        if (width > 0) {
	            return this.CreateElement("path", {
	                fill: "transparent",
	                stroke: color,
	                "stroke-width": HelperFunctions_1.precise(width),
	                d: this.MoveToString(start) + " " + this.LineToString(end)
	            });
	        }
	        return null;
	    };
	    SVG.CreateElement = function (name, attributes) {
	        var el = document.createElementNS(this.namespace, name);
	        if (!!attributes) {
	            this.SetAttributes(el, attributes);
	        }
	        return el;
	    };
	    SVG.SetAttributes = function (el, attributes) {
	        if (!el) {
	            console.log(attributes);
	        }
	        for (var attr in attributes) {
	            el.setAttributeNS(null, attr, attributes[attr]);
	        }
	    };
	    SVG.MoveToString = function (a) {
	        return "M " + HelperFunctions_1.precise(a.X) + "," + HelperFunctions_1.precise(a.Y);
	    };
	    SVG.LineToString = function (a) {
	        return "L " + HelperFunctions_1.precise(a.X) + "," + HelperFunctions_1.precise(a.Y);
	    };
	    SVG.CurveToString = function (a, b, c) {
	        return "C " + HelperFunctions_1.precise(a.X) + "," + HelperFunctions_1.precise(a.Y) + " " + HelperFunctions_1.precise(b.X) + "," + HelperFunctions_1.precise(b.Y) + " " + HelperFunctions_1.precise(c.X) + "," + HelperFunctions_1.precise(c.Y);
	    };
	    SVG.ArcString = function (end, radius, startAngle) {
	        return "A " + HelperFunctions_1.precise(radius) + "," + HelperFunctions_1.precise(radius) + " " + startAngle + " 0,0 " + HelperFunctions_1.precise(end.X) + "," + HelperFunctions_1.precise(end.Y);
	    };
	    SVG.attr = function (node, name) {
	        var attr = node.attributes.getNamedItemNS(null, name);
	        if (!!attr) {
	            return attr.textContent;
	        }
	        throw new Error("Attribute " + name + " is missing in " + node.localName);
	    };
	    SVG.numAttr = function (node, name) {
	        return Number(node.attributes.getNamedItemNS(null, name).textContent);
	    };
	    SVG.namespace = "http://www.w3.org/2000/svg";
	    return SVG;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = SVG;
	var SVGA = (function () {
	    function SVGA() {
	    }
	    Object.defineProperty(SVGA, "Namespace", {
	        get: function () { return this.namespace; },
	        enumerable: true,
	        configurable: true
	    });
	    SVGA.CreateElement = function (name, attributes) {
	        var el = document.createElementNS(this.namespace, "a:" + name);
	        if (!!attributes) {
	            this.SetAttributes(el, attributes);
	        }
	        return el;
	    };
	    SVGA.SetAttributes = function (el, attributes) {
	        if (!el) {
	            console.log(attributes);
	        }
	        for (var attr in attributes) {
	            var a = document.createAttributeNS(this.namespace, "a:" + attr);
	            a.textContent = attributes[attr];
	            el.attributes.setNamedItemNS(a);
	        }
	    };
	    SVGA.attr = function (node, name, defaultValue) {
	        var attr = node.attributes.getNamedItemNS(this.Namespace, name);
	        if (!!attr) {
	            return attr.textContent;
	        }
	        if (!!defaultValue) {
	            return defaultValue;
	        }
	        throw new Error("Attribute " + name + " is missing in " + node.localName);
	    };
	    SVGA.numAttr = function (node, name, defaultValue) {
	        return Number(SVGA.attr(node, name, defaultValue !== undefined ? defaultValue.toString() : undefined));
	    };
	    SVGA.namespace = "http://www.rozsival.com/2015/vector-screencast";
	    return SVGA;
	})();
	exports.SVGA = SVGA;


/***/ },
/* 13 */
/***/ function(module, exports) {

	//namespace VectorScreencast.UI {
	var Color = (function () {
	    function Color(cssValue) {
	        this.cssValue = cssValue;
	    }
	    Object.defineProperty(Color.prototype, "CssValue", {
	        get: function () { return this.cssValue; },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Color, "BackgroundColor", {
	        get: function () {
	            return new Color(this.backgroundPrototype.CssValue);
	        },
	        set: function (c) { this.backgroundPrototype = c; },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Color, "ForegroundColor", {
	        get: function () {
	            return new Color(this.foregroundPrototype.CssValue);
	        },
	        set: function (c) { this.foregroundPrototype = c; },
	        enumerable: true,
	        configurable: true
	    });
	    Color.backgroundPrototype = new Color("#111");
	    Color.foregroundPrototype = new Color("#fff");
	    return Color;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Color;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var VideoEvents_1 = __webpack_require__(3);
	var BasicElements_1 = __webpack_require__(8);
	var HelperFunctions_1 = __webpack_require__(7);
	var TimeLine = (function (_super) {
	    __extends(TimeLine, _super);
	    function TimeLine(id, events) {
	        var _this = this;
	        _super.call(this, "div", id);
	        this.events = events;
	        this.length = 0;
	        this.GetHTML().classList.add("ui-progressbar");
	        var bar = new BasicElements_1.Panel("div");
	        bar.AddClass("ui-progress");
	        bar.AddChild(new BasicElements_1.SimpleElement("div").AddClass("ui-current-time"));
	        this.progresbar = bar;
	        this.AddChild(bar);
	        bar = null;
	        var buffer = new BasicElements_1.SimpleElement("div");
	        buffer.AddClass("ui-buffer");
	        this.bufferbar = buffer;
	        this.AddChild(buffer);
	        buffer = null;
	        this.arrow = new BasicElements_1.SimpleElement("div", "0:00");
	        this.arrow.AddClass("ui-arrow");
	        this.AddChild(this.arrow);
	        this.Sync(0);
	        this.GetHTML().onclick = function (e) { return _this.OnClick(e); };
	        this.GetHTML().onmousemove = function (e) { return _this.OnMouseMove(e); };
	    }
	    Object.defineProperty(TimeLine.prototype, "Length", {
	        set: function (length) { this.length = length; },
	        enumerable: true,
	        configurable: true
	    });
	    TimeLine.prototype.OnClick = function (e) {
	        var time = (e.clientX - this.GetHTML().clientLeft) / this.GetHTML().clientWidth * this.length;
	        this.SkipTo(time);
	    };
	    TimeLine.prototype.OnMouseMove = function (e) {
	        var progress = (e.clientX - this.GetHTML().clientLeft) / this.GetHTML().clientWidth;
	        var time = HelperFunctions_1.millisecondsToString(progress * this.length);
	        this.arrow.GetHTML().textContent = time;
	        this.arrow.GetHTML().style.left = progress * 100 + "%";
	        var rect = this.arrow.GetHTML().getBoundingClientRect();
	        if (rect.left < 0) {
	            this.arrow.GetHTML().style.left = rect.width / 2 + "px";
	        }
	        else if (rect.right > this.GetHTML().getBoundingClientRect().right) {
	            this.arrow.GetHTML().style.left = (this.GetHTML().getBoundingClientRect().right - (rect.width / 2)) + "px";
	        }
	    };
	    TimeLine.prototype.Sync = function (time) {
	        this.progresbar.GetHTML().style.width = this.length > 0 ? time / this.length * 100 + "%" : "O%";
	    };
	    TimeLine.prototype.SetBuffer = function (time) {
	        this.bufferbar.GetHTML().style.width = this.length > 0 ? time / this.length * 100 + "%" : "O%";
	    };
	    TimeLine.prototype.SkipTo = function (time) {
	        this.events.trigger(VideoEvents_1.VideoEventType.JumpTo, time / this.length);
	        this.Sync(time);
	    };
	    return TimeLine;
	})(BasicElements_1.Panel);
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = TimeLine;


/***/ },
/* 15 */
/***/ function(module, exports) {

	var VideoTimer = (function () {
	    function VideoTimer(running) {
	        this.pauseTime = 0;
	        if (!window.performance) {
	            this.clock = Date;
	        }
	        else {
	            this.clock = window.performance;
	        }
	        this.paused = !running;
	        this.Reset();
	    }
	    Object.defineProperty(VideoTimer.prototype, "StartTime", {
	        get: function () { return this.startTime; },
	        enumerable: true,
	        configurable: true
	    });
	    VideoTimer.prototype.CurrentTime = function () {
	        return !this.paused ? this.clock.now() - this.startTime : this.pauseTime;
	    };
	    VideoTimer.prototype.SetTime = function (milliseconds) {
	        if (this.paused) {
	            this.pauseTime = milliseconds;
	        }
	        else {
	            this.startTime = this.clock.now() - milliseconds;
	        }
	    };
	    VideoTimer.prototype.Pause = function () {
	        this.pauseTime = this.CurrentTime();
	        this.paused = true;
	    };
	    VideoTimer.prototype.Resume = function () {
	        this.paused = false;
	        this.Reset();
	        this.SetTime(this.pauseTime);
	    };
	    VideoTimer.prototype.Reset = function () {
	        this.startTime = this.clock.now();
	    };
	    return VideoTimer;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = VideoTimer;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var VideoEvents_1 = __webpack_require__(3);
	var HTML_1 = __webpack_require__(5);
	var Path_1 = __webpack_require__(17);
	var CanvasDrawer = (function () {
	    function CanvasDrawer(curved) {
	        if (curved === void 0) { curved = true; }
	        this.curved = curved;
	    }
	    CanvasDrawer.prototype.SetEvents = function (events) {
	        this.events = events;
	    };
	    CanvasDrawer.prototype.CreateCanvas = function () {
	        this.canvas = HTML_1.default.CreateElement("canvas");
	        this.context = this.canvas.getContext("2d");
	        return this.canvas;
	    };
	    CanvasDrawer.prototype.Stretch = function () {
	        var parent = this.canvas.parentElement;
	        var width = parent.clientWidth;
	        var height = parent.clientHeight;
	        this.originalHeight = height;
	        this.originalWidth = width;
	        HTML_1.default.SetAttributes(this.canvas, {
	            width: width,
	            height: height
	        });
	        this.events.trigger(VideoEvents_1.VideoEventType.CanvasSize, width, height);
	    };
	    CanvasDrawer.prototype.SetupOutputCorrection = function (sourceWidth, sourceHeight) {
	        var wr = this.canvas.width / sourceWidth;
	        var hr = this.canvas.height / sourceHeight;
	        var min = Math.min(wr, hr);
	        this.context.scale(min, min);
	        return min;
	    };
	    CanvasDrawer.prototype.ClearCanvas = function (color) {
	        this.context.fillStyle = color.CssValue;
	        this.context.fillRect(0, 0, this.originalWidth, this.originalHeight);
	    };
	    CanvasDrawer.prototype.SetCurrentColor = function (color) {
	        this.currentColor = color;
	    };
	    CanvasDrawer.prototype.CreatePath = function (events) {
	        return new Path_1.CanvasPath(events, this.curved, this.currentColor.CssValue, this.context);
	    };
	    return CanvasDrawer;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = CanvasDrawer;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var SVG_1 = __webpack_require__(12);
	var Vector_1 = __webpack_require__(11);
	var VideoEvents_1 = __webpack_require__(3);
	var Spline_1 = __webpack_require__(18);
	var Segments_1 = __webpack_require__(19);
	var Path = (function () {
	    function Path(events, curved, color, wireframe) {
	        this.events = events;
	        this.curved = curved;
	        this.color = color;
	        this.wireframe = wireframe;
	        if (this.wireframe === undefined) {
	            this.wireframe = false;
	        }
	        this.segments = [];
	        this.pathPoints = [];
	    }
	    Object.defineProperty(Path.prototype, "Segments", {
	        get: function () {
	            return this.segments;
	        },
	        set: function (value) {
	            this.segments = value;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Path.prototype, "LastDrawnSegment", {
	        get: function () {
	            return this.lastDrawnSegment;
	        },
	        set: function (value) {
	            this.lastDrawnSegment = value;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Path.prototype, "LastPoint", {
	        get: function () {
	            return this.pathPoints[this.iterator];
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Path.prototype, "LastButOnePoint", {
	        get: function () {
	            return this.pathPoints[Math.max(0, this.iterator - 1)];
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Path.prototype, "LastButTwoPoint", {
	        get: function () {
	            return this.pathPoints[Math.max(0, this.iterator - 2)];
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Path.prototype, "Color", {
	        get: function () {
	            return this.color;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Path.prototype.StartPath = function (pt, radius) {
	        this.segments = [new Segments_1.ZeroLengthSegment(pt.clone().add(new Vector_1.default(0, radius)), pt.clone().add(new Vector_1.default(0, -radius)))];
	        this.startPosition = pt;
	        this.startRadius = radius;
	        this.iterator = -1;
	        this.DrawStartDot(pt, radius);
	        this.lastDrawnSegment = this.segments[0];
	    };
	    Path.prototype.DrawStartDot = function (pt, radius) {
	        throw new Error("Not impelmented");
	    };
	    Path.prototype.InitPath = function (right, left) {
	        this.segments = [new Segments_1.ZeroLengthSegment(left, right)];
	        this.pathPoints.push({ Left: left, Right: right });
	        this.iterator = 0;
	    };
	    Path.prototype.StartDrawingPath = function (seg) {
	        this.DrawStartDot(seg.Left.pointInBetween(seg.Right), seg.Left.distanceTo(seg.Right) / 2);
	        this.lastDrawnSegment = seg;
	    };
	    Path.prototype.ExtendPath = function (right, left) {
	        var last = this.pathPoints[this.pathPoints.length - 1];
	        if (last.Left.isEqualTo(left) && last.Right.isEqualTo(right)) {
	            return;
	        }
	        var segment = this.CalculateSegment(right, left);
	        this.DrawSegment(segment);
	        this.events.trigger(VideoEvents_1.VideoEventType.DrawSegment, segment);
	        this.segments.push(segment);
	        this.pathPoints.push({ Left: left, Right: right });
	        this.iterator++;
	    };
	    Path.prototype.CalculateSegment = function (right, left) {
	        if (this.curved) {
	            return this.CalculateCurvedSegment(right, left);
	        }
	        return this.CalculateQuarilateralSegment(right, left);
	    };
	    Path.prototype.CalculateCurvedSegment = function (right, left) {
	        var leftBezier = Spline_1.Spline.catmullRomToBezier(this.LastButTwoPoint.Left, this.LastButOnePoint.Left, this.LastPoint.Left, left);
	        var rightBezier = Spline_1.Spline.catmullRomToBezier(this.LastButTwoPoint.Right, this.LastButOnePoint.Right, this.LastPoint.Right, right);
	        var segment = new Segments_1.CurvedSegment(leftBezier, rightBezier);
	        this.DrawCurvedSegment(segment);
	        return segment;
	    };
	    Path.prototype.DrawCurvedSegment = function (segment) {
	        throw new Error("Not implemented");
	    };
	    Path.prototype.CalculateQuarilateralSegment = function (right, left) {
	        return new Segments_1.QuadrilateralSegment(left, right);
	    };
	    Path.prototype.DrawQuadrilateralSegment = function (segment) {
	        throw new Error("Not implemented");
	    };
	    Path.prototype.Draw = function () {
	    };
	    Path.prototype.DrawSegment = function (seg) {
	        if (seg instanceof Segments_1.CurvedSegment) {
	            this.DrawCurvedSegment(seg);
	        }
	        else if (seg instanceof Segments_1.QuadrilateralSegment) {
	            this.DrawQuadrilateralSegment(seg);
	        }
	        this.lastDrawnSegment = seg;
	    };
	    Path.angle = function (vec) {
	        return Math.atan2(-vec.X, vec.Y) - Math.PI / 2;
	    };
	    Path.prototype.DrawWholePath = function () {
	        this.iterator = 0;
	        if (this.segments.length === 0)
	            return;
	        var start = this.segments[0].Left.clone().add(this.segments[0].Right).scale(0.5);
	        var radius = start.distanceTo(this.segments[0].Left);
	        this.DrawStartDot(start, radius);
	        this.lastDrawnSegment = this.segments[0];
	        while (this.iterator < this.segments.length) {
	            this.DrawSegment(this.segments[this.iterator++]);
	        }
	        this.Draw();
	    };
	    return Path;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Path;
	var SvgPath = (function (_super) {
	    __extends(SvgPath, _super);
	    function SvgPath(events, curved, color, canvas) {
	        _super.call(this, events, curved, color);
	        this.canvas = canvas;
	    }
	    SvgPath.prototype.DrawStartDot = function (position, radius) {
	        this.path = this.CreatePathElement();
	        var left = new Vector_1.default(position.X - radius, position.Y);
	        var right = new Vector_1.default(position.X + radius, position.Y);
	        var center = right.pointInBetween(left);
	        var startDirection = left.clone().subtract(center);
	        var endDirection = right.clone().subtract(center);
	        var arc = SVG_1.default.ArcString(right, center.distanceTo(right), Path.angle(startDirection));
	        this.right = SVG_1.default.MoveToString(right);
	        this.left = SVG_1.default.LineToString(left) + " " + arc;
	        this.cap = SVG_1.default.ArcString(left, center.distanceTo(left), Path.angle(endDirection));
	        SVG_1.default.SetAttributes(this.path, { d: this.right + this.cap + this.left });
	        this.canvas.appendChild(this.path);
	    };
	    SvgPath.prototype.InitPath = function (right, left) {
	        _super.prototype.InitPath.call(this, right, left);
	        this.StartDrawingPath(this.segments[0]);
	    };
	    SvgPath.prototype.CreatePathElement = function () {
	        var options;
	        if (this.wireframe) {
	            options = {
	                "stroke": this.color,
	                "stroke-width": 1
	            };
	        }
	        else {
	            options = {
	                "fill": this.color
	            };
	        }
	        return SVG_1.default.CreateElement("path", options);
	    };
	    SvgPath.prototype.DrawCurvedSegment = function (segment) {
	        this.right += SVG_1.default.CurveToString(segment.RightBezier.StartCP, segment.RightBezier.EndCP, segment.RightBezier.End);
	        this.left = SVG_1.default.CurveToString(segment.LeftBezier.EndCP, segment.LeftBezier.StartCP, segment.LeftBezier.Start) + " " + this.left;
	        var center = segment.Right.pointInBetween(segment.Left);
	        var startDirection = segment.Right.clone().subtract(center);
	        this.cap = SVG_1.default.ArcString(segment.Left, center.distanceTo(segment.Left), Path.angle(startDirection));
	    };
	    SvgPath.prototype.DrawQuadrilateralSegment = function (segment) {
	        this.right += SVG_1.default.LineToString(segment.Right);
	        this.left = SVG_1.default.LineToString(this.lastDrawnSegment.Left) + " " + this.left;
	        var center = segment.Right.pointInBetween(segment.Left);
	        var startDirection = segment.Right.clone().subtract(center);
	        this.cap = SVG_1.default.ArcString(segment.Left, center.distanceTo(segment.Left), Path.angle(startDirection));
	    };
	    SvgPath.prototype.GetPathString = function () {
	        return this.right + this.cap + this.left;
	    };
	    SvgPath.prototype.Draw = function () {
	        SVG_1.default.SetAttributes(this.path, {
	            d: this.GetPathString()
	        });
	    };
	    return SvgPath;
	})(Path);
	exports.SvgPath = SvgPath;
	var CanvasPath = (function (_super) {
	    __extends(CanvasPath, _super);
	    function CanvasPath(events, curved, color, context) {
	        _super.call(this, events, curved, color);
	        this.context = context;
	        this.context.fillStyle = this.color;
	    }
	    CanvasPath.prototype.DrawStartDot = function (position, radius) {
	        this.context.beginPath();
	        this.DrawDot(position, radius);
	        this.Draw();
	    };
	    CanvasPath.prototype.DrawDot = function (c, r) {
	        this.context.arc(c.X, c.Y, r, 0, 2 * Math.PI, true);
	    };
	    CanvasPath.prototype.DrawQuadrilateralSegment = function (segment) {
	        this.context.moveTo(this.lastDrawnSegment.Right.X, this.lastDrawnSegment.Right.Y);
	        this.context.lineTo(this.lastDrawnSegment.Left.X, this.lastDrawnSegment.Left.Y);
	        this.context.lineTo(segment.Left.X, segment.Left.Y);
	        var center = segment.Left.pointInBetween(segment.Right);
	        var startDirection = segment.Right.clone().subtract(center);
	        var endDirection = segment.Left.clone().subtract(center);
	        this.context.arc(center.X, center.Y, center.distanceTo(segment.Left), Path.angle(startDirection), Path.angle(endDirection), false);
	    };
	    CanvasPath.prototype.DrawCurvedSegment = function (segment) {
	        this.context.moveTo(segment.RightBezier.Start.X, segment.RightBezier.Start.Y);
	        this.context.lineTo(segment.LeftBezier.Start.X, segment.LeftBezier.Start.Y);
	        this.context.bezierCurveTo(segment.LeftBezier.StartCP.X, segment.LeftBezier.StartCP.Y, segment.LeftBezier.EndCP.X, segment.LeftBezier.EndCP.Y, segment.LeftBezier.End.X, segment.LeftBezier.End.Y);
	        var center = segment.RightBezier.End.pointInBetween(segment.LeftBezier.End);
	        var startDirection = segment.RightBezier.End.clone().subtract(center);
	        var endDirection = segment.LeftBezier.End.clone().subtract(center);
	        this.context.arc(center.X, center.Y, center.distanceTo(segment.LeftBezier.End), Path.angle(startDirection), Path.angle(endDirection), false);
	        this.context.bezierCurveTo(segment.RightBezier.EndCP.X, segment.RightBezier.EndCP.Y, segment.RightBezier.StartCP.X, segment.RightBezier.StartCP.Y, segment.RightBezier.Start.X, segment.RightBezier.Start.Y);
	    };
	    CanvasPath.prototype.Draw = function () {
	        this.context.closePath();
	        this.context.fill();
	        this.context.beginPath();
	    };
	    return CanvasPath;
	})(Path);
	exports.CanvasPath = CanvasPath;


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	///<reference path="./Vector.ts" />
	var Vector_1 = __webpack_require__(11);
	var Spline = (function () {
	    function Spline() {
	    }
	    Spline.catmullRomToBezier = function (a, b, c, d) {
	        return new BezierCurveSegment(b, new Vector_1.default((-1 / 6 * a.X) + b.X + (1 / 6 * c.X), (-1 / 6 * a.Y) + b.Y + (1 / 6 * c.Y)), c, new Vector_1.default((1 / 6 * b.X) + c.X + (-1 / 6 * d.X), (1 / 6 * b.Y) + c.Y + (-1 / 6 * d.Y)));
	    };
	    return Spline;
	})();
	exports.Spline = Spline;
	var BezierCurveSegment = (function () {
	    function BezierCurveSegment(start, startCP, end, endCP) {
	        this.start = start;
	        this.startCP = startCP;
	        this.end = end;
	        this.endCP = endCP;
	    }
	    Object.defineProperty(BezierCurveSegment.prototype, "Start", {
	        get: function () { return this.start; },
	        set: function (vec) { this.start = vec; },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(BezierCurveSegment.prototype, "StartCP", {
	        get: function () { return this.startCP; },
	        set: function (vec) { this.startCP = vec; },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(BezierCurveSegment.prototype, "End", {
	        get: function () { return this.end; },
	        set: function (vec) { this.end = vec; },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(BezierCurveSegment.prototype, "EndCP", {
	        get: function () { return this.endCP; },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(BezierCurveSegment.prototype, "EndCp", {
	        set: function (vec) { this.endCP = vec; },
	        enumerable: true,
	        configurable: true
	    });
	    return BezierCurveSegment;
	})();
	exports.BezierCurveSegment = BezierCurveSegment;


/***/ },
/* 19 */
/***/ function(module, exports) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Segment = (function () {
	    function Segment() {
	    }
	    Object.defineProperty(Segment.prototype, "Left", {
	        get: function () { throw new Error("Not implemented"); },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Segment.prototype, "Right", {
	        get: function () { throw new Error("Not implemented"); },
	        enumerable: true,
	        configurable: true
	    });
	    return Segment;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Segment;
	var QuadrilateralSegment = (function (_super) {
	    __extends(QuadrilateralSegment, _super);
	    function QuadrilateralSegment(left, right) {
	        _super.call(this);
	        this.left = left;
	        this.right = right;
	    }
	    Object.defineProperty(QuadrilateralSegment.prototype, "Left", {
	        get: function () { return this.left; },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(QuadrilateralSegment.prototype, "Right", {
	        get: function () { return this.right; },
	        enumerable: true,
	        configurable: true
	    });
	    return QuadrilateralSegment;
	})(Segment);
	exports.QuadrilateralSegment = QuadrilateralSegment;
	var ZeroLengthSegment = (function (_super) {
	    __extends(ZeroLengthSegment, _super);
	    function ZeroLengthSegment(left, right) {
	        _super.call(this, left, right);
	    }
	    return ZeroLengthSegment;
	})(QuadrilateralSegment);
	exports.ZeroLengthSegment = ZeroLengthSegment;
	var CurvedSegment = (function (_super) {
	    __extends(CurvedSegment, _super);
	    function CurvedSegment(left, right) {
	        _super.call(this);
	        this.left = left;
	        this.right = right;
	    }
	    Object.defineProperty(CurvedSegment.prototype, "Left", {
	        get: function () { return this.left.End; },
	        set: function (vec) { this.left.End = vec; },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(CurvedSegment.prototype, "Right", {
	        get: function () { return this.right.End; },
	        set: function (vec) { this.right.End = vec; },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(CurvedSegment.prototype, "LeftBezier", {
	        get: function () { return this.left; },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(CurvedSegment.prototype, "RightBezier", {
	        get: function () { return this.right; },
	        enumerable: true,
	        configurable: true
	    });
	    return CurvedSegment;
	})(Segment);
	exports.CurvedSegment = CurvedSegment;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var VideoEvents_1 = __webpack_require__(3);
	var State_1 = __webpack_require__(21);
	var Command = (function () {
	    function Command(time) {
	        this.time = time;
	    }
	    Object.defineProperty(Command.prototype, "Time", {
	        get: function () { return this.time; },
	        enumerable: true,
	        configurable: true
	    });
	    Command.prototype.Execute = function (events) {
	        throw new Error("Not implemented");
	    };
	    Command.prototype.Clone = function () {
	        throw new Error("Not implemented");
	    };
	    return Command;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Command;
	var MoveCursor = (function (_super) {
	    __extends(MoveCursor, _super);
	    function MoveCursor(x, y, p, time) {
	        _super.call(this, time);
	        this.x = x;
	        this.y = y;
	        this.p = p;
	    }
	    Object.defineProperty(MoveCursor.prototype, "X", {
	        get: function () { return this.x; },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(MoveCursor.prototype, "Y", {
	        get: function () { return this.y; },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(MoveCursor.prototype, "P", {
	        get: function () { return this.p; },
	        enumerable: true,
	        configurable: true
	    });
	    MoveCursor.prototype.Execute = function (events) {
	        events.trigger(VideoEvents_1.VideoEventType.CursorState, new State_1.CursorState(this.Time, this.x, this.y, this.p));
	    };
	    MoveCursor.prototype.Clone = function () {
	        return new MoveCursor(this.x, this.y, this.p, this.Time);
	    };
	    return MoveCursor;
	})(Command);
	exports.MoveCursor = MoveCursor;
	var DrawNextSegment = (function (_super) {
	    __extends(DrawNextSegment, _super);
	    function DrawNextSegment() {
	        _super.apply(this, arguments);
	    }
	    DrawNextSegment.prototype.Execute = function (events) {
	        events.trigger(VideoEvents_1.VideoEventType.DrawSegment);
	    };
	    DrawNextSegment.prototype.Clone = function () {
	        return new DrawNextSegment(this.Time);
	    };
	    return DrawNextSegment;
	})(Command);
	exports.DrawNextSegment = DrawNextSegment;
	var ChangeBrushColor = (function (_super) {
	    __extends(ChangeBrushColor, _super);
	    function ChangeBrushColor(color, time) {
	        _super.call(this, time);
	        this.color = color;
	    }
	    Object.defineProperty(ChangeBrushColor.prototype, "Color", {
	        get: function () { return this.color; },
	        enumerable: true,
	        configurable: true
	    });
	    ChangeBrushColor.prototype.Execute = function (events) {
	        events.trigger(VideoEvents_1.VideoEventType.ChangeColor, this.color);
	    };
	    ChangeBrushColor.prototype.Clone = function () {
	        return new ChangeBrushColor(this.color, this.Time);
	    };
	    return ChangeBrushColor;
	})(Command);
	exports.ChangeBrushColor = ChangeBrushColor;
	var ChangeBrushSize = (function (_super) {
	    __extends(ChangeBrushSize, _super);
	    function ChangeBrushSize(size, time) {
	        _super.call(this, time);
	        this.size = size;
	    }
	    Object.defineProperty(ChangeBrushSize.prototype, "Size", {
	        get: function () { return this.size; },
	        enumerable: true,
	        configurable: true
	    });
	    ChangeBrushSize.prototype.Execute = function (events) {
	        events.trigger(VideoEvents_1.VideoEventType.ChangeBrushSize, this.size);
	    };
	    ChangeBrushSize.prototype.Clone = function () {
	        return new ChangeBrushSize(this.size, this.Time);
	    };
	    return ChangeBrushSize;
	})(Command);
	exports.ChangeBrushSize = ChangeBrushSize;
	var ClearCanvas = (function (_super) {
	    __extends(ClearCanvas, _super);
	    function ClearCanvas(color, time) {
	        _super.call(this, time);
	        this.color = color;
	    }
	    Object.defineProperty(ClearCanvas.prototype, "Color", {
	        get: function () { return this.color; },
	        enumerable: true,
	        configurable: true
	    });
	    ClearCanvas.prototype.Execute = function (events) {
	        events.trigger(VideoEvents_1.VideoEventType.ClearCanvas, this.color);
	    };
	    ClearCanvas.prototype.Clone = function () {
	        return new ClearCanvas(this.color, this.Time);
	    };
	    return ClearCanvas;
	})(Command);
	exports.ClearCanvas = ClearCanvas;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Vector_1 = __webpack_require__(11);
	(function (StateType) {
	    StateType[StateType["ChangeBrushSize"] = 0] = "ChangeBrushSize";
	    StateType[StateType["ChangeColor"] = 1] = "ChangeColor";
	    StateType[StateType["Cursor"] = 2] = "Cursor";
	})(exports.StateType || (exports.StateType = {}));
	var StateType = exports.StateType;
	var State = (function () {
	    function State(type, time) {
	        this.type = type;
	        this.time = time;
	    }
	    State.prototype.GetType = function () { return this.type; };
	    State.prototype.GetTime = function () { return this.time; };
	    return State;
	})();
	exports.State = State;
	var CursorState = (function (_super) {
	    __extends(CursorState, _super);
	    function CursorState(time, x, y, pressure) {
	        _super.call(this, StateType.Cursor, time);
	        this.x = x;
	        this.y = y;
	        this.pressure = pressure;
	    }
	    Object.defineProperty(CursorState.prototype, "X", {
	        get: function () { return this.x; },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(CursorState.prototype, "Y", {
	        get: function () { return this.y; },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(CursorState.prototype, "Pressure", {
	        get: function () { return this.pressure; },
	        enumerable: true,
	        configurable: true
	    });
	    CursorState.prototype.getPosition = function () {
	        return new Vector_1.default(this.x, this.y);
	    };
	    return CursorState;
	})(State);
	exports.CursorState = CursorState;
	var ColorState = (function (_super) {
	    __extends(ColorState, _super);
	    function ColorState(time, color) {
	        _super.call(this, StateType.ChangeColor, time);
	        this.color = color;
	    }
	    Object.defineProperty(ColorState.prototype, "Color", {
	        get: function () { return this.color; },
	        enumerable: true,
	        configurable: true
	    });
	    return ColorState;
	})(State);
	exports.ColorState = ColorState;
	var SizeState = (function (_super) {
	    __extends(SizeState, _super);
	    function SizeState(time, size) {
	        _super.call(this, StateType.ChangeBrushSize, time);
	        this.size = size;
	    }
	    Object.defineProperty(SizeState.prototype, "Size", {
	        get: function () { return this.size; },
	        enumerable: true,
	        configurable: true
	    });
	    return SizeState;
	})(State);
	exports.SizeState = SizeState;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var VideoEvents_1 = __webpack_require__(3);
	var Chunk = (function () {
	    function Chunk(time, lastErase) {
	        this.time = time;
	        this.lastErase = lastErase;
	        this.initCommands = [];
	        this.commands = [];
	        this.cmdIterator = 0;
	    }
	    Object.defineProperty(Chunk.prototype, "StartTime", {
	        get: function () { return this.time; },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Chunk.prototype, "LastErase", {
	        get: function () { return this.lastErase; },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Chunk.prototype, "CurrentCommand", {
	        get: function () {
	            return this.commands[this.cmdIterator];
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Chunk.prototype.PeekNextCommand = function () {
	        return this.commands[this.cmdIterator + 1];
	    };
	    Chunk.prototype.MoveNextCommand = function () { this.cmdIterator++; };
	    Chunk.prototype.Rewind = function () { this.cmdIterator = 0; };
	    Chunk.prototype.ExecuteInitCommands = function (events) {
	        for (var i = 0; i < this.initCommands.length; i++) {
	            this.initCommands[i].Execute(events);
	        }
	    };
	    Chunk.prototype.GetCommand = function (i) {
	        return i < this.commands.length ? this.commands[i] : null;
	    };
	    Chunk.prototype.PushCommand = function (cmd) {
	        this.commands.push(cmd);
	    };
	    Object.defineProperty(Chunk.prototype, "Commands", {
	        get: function () {
	            return this.commands;
	        },
	        set: function (value) {
	            this.commands = value;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Chunk.prototype, "InitCommands", {
	        get: function () {
	            return this.initCommands;
	        },
	        set: function (initCmds) {
	            this.initCommands = initCmds;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Chunk.prototype.Render = function (events) {
	        throw new Error("Not implemented");
	    };
	    return Chunk;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Chunk;
	var VoidChunk = (function (_super) {
	    __extends(VoidChunk, _super);
	    function VoidChunk() {
	        _super.apply(this, arguments);
	    }
	    VoidChunk.prototype.Render = function () { };
	    return VoidChunk;
	})(Chunk);
	exports.VoidChunk = VoidChunk;
	var PathChunk = (function (_super) {
	    __extends(PathChunk, _super);
	    function PathChunk(path, time, lastErase) {
	        _super.call(this, time, lastErase);
	        this.path = path;
	    }
	    Object.defineProperty(PathChunk.prototype, "Path", {
	        get: function () { return this.path; },
	        enumerable: true,
	        configurable: true
	    });
	    PathChunk.prototype.Render = function (events) { events.trigger(VideoEvents_1.VideoEventType.DrawPath); };
	    return PathChunk;
	})(Chunk);
	exports.PathChunk = PathChunk;
	var EraseChunk = (function (_super) {
	    __extends(EraseChunk, _super);
	    function EraseChunk(color, time, lastErase) {
	        _super.call(this, time, lastErase);
	        this.color = color;
	    }
	    Object.defineProperty(EraseChunk.prototype, "Color", {
	        get: function () { return this.color; },
	        enumerable: true,
	        configurable: true
	    });
	    EraseChunk.prototype.ExecuteInitCommands = function (events) {
	        this.Render(events);
	        _super.prototype.ExecuteInitCommands.call(this, events);
	    };
	    EraseChunk.prototype.Render = function (events) {
	        events.trigger(VideoEvents_1.VideoEventType.ClearCanvas, this.color);
	    };
	    return EraseChunk;
	})(Chunk);
	exports.EraseChunk = EraseChunk;


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var HTML_1 = __webpack_require__(5);
	var File = (function () {
	    function File() {
	    }
	    File.Check = function (req, mimeType) {
	        return req.status === 200
	            && !!mimeType ? req.getResponseHeader("ContentType") === mimeType : true;
	    };
	    File.Exists = function (url, mimeType) {
	        var req = new XMLHttpRequest();
	        req.open("HEAD", url, false);
	        req.send();
	        return this.Check(req, mimeType);
	    };
	    File.ExistsAsync = function (url, success, error, mimeType) {
	        var _this = this;
	        var req = new XMLHttpRequest();
	        req.open("HEAD", url, true);
	        req.onerror = error;
	        req.ontimeout = error;
	        req.onload = function (e) {
	            if (_this.Check(req, mimeType)) {
	                success(e);
	            }
	            else {
	                error(e);
	            }
	        };
	        req.send();
	    };
	    File.ReadFileAsync = function (url, success, error) {
	        var req = new XMLHttpRequest();
	        req.open("GET", url, true);
	        req.onerror = function (e) { return error(req.status); };
	        req.ontimeout = function (e) { return error(req.status); };
	        req.onload = function (e) {
	            if (req.status === 200) {
	                success(!!req.responseXML ? req.responseXML : req.response);
	            }
	            else {
	                error(req.status);
	            }
	        };
	        req.send();
	    };
	    File.ReadXmlAsync = function (url, success, error) {
	        var req = new XMLHttpRequest();
	        req.open("GET", url, true);
	        req.onerror = function (e) { return error(req.status); };
	        req.ontimeout = function (e) { return error(req.status); };
	        req.onload = function (e) {
	            if (req.status === 200) {
	                success(req.responseXML);
	            }
	            else {
	                error(req.status);
	            }
	        };
	        req.send();
	    };
	    File.Download = function (blob, name) {
	        var a = HTML_1.default.CreateElement("a", {
	            css: "display: none"
	        });
	        document.documentElement.appendChild(a);
	        var url = URL.createObjectURL(blob);
	        HTML_1.default.SetAttributes(a, {
	            href: url,
	            download: name
	        });
	        a.click();
	        URL.revokeObjectURL(url);
	    };
	    File.CurrentDateTime = function () {
	        var date = new Date();
	        return "$(date.getMonth())-$(date.getDay())-$(date.getFullYear())_$(date.getHour())-$(date.getMinute())";
	    };
	    File.StartDownloadingWav = function (blob) {
	        File.Download(blob, "recording-" + File.CurrentDateTime() + ".wav");
	    };
	    File.StartDownloadingXml = function (text) {
	        var blob = new Blob([text], { type: "text/xml" });
	        File.Download(blob, "data-" + File.CurrentDateTime() + ".xml");
	    };
	    return File;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = File;


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var Video_1 = __webpack_require__(25);
	var Chunk_1 = __webpack_require__(22);
	var ChunkFactories_1 = __webpack_require__(26);
	var CommandFactories_1 = __webpack_require__(27);
	var MetadataFactory_1 = __webpack_require__(29);
	var SVG_1 = __webpack_require__(12);
	var IO = (function () {
	    function IO() {
	        this.VideoChunksLayerType = "video-chunks";
	        this.commandFactory = new CommandFactories_1.MoveCursorFactory(new CommandFactories_1.DrawSegmentFactory(new CommandFactories_1.ChangeBrushColorFactory(new CommandFactories_1.ChangeBrushSizeFactory(new CommandFactories_1.ClearCanvasFactory()))));
	        this.eraseChunkFactory = new ChunkFactories_1.EraseChunkFactory();
	        this.chunkFactory = new ChunkFactories_1.VoidChunkFactory(new ChunkFactories_1.PathChunkFactory(this.eraseChunkFactory));
	        this.metadataFactory = new MetadataFactory_1.default();
	    }
	    IO.prototype.SaveVideo = function (data) {
	        var type = document.implementation.createDocumentType('svg:svg', '-//W3C//DTD SVG 1.1//EN', 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd');
	        var doc = document.implementation.createDocument('http://www.w3.org/2000/svg', 'svg', type);
	        doc.documentElement.setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns:a", SVG_1.SVGA.Namespace);
	        SVG_1.default.SetAttributes(doc.rootElement, {
	            width: data.Metadata.Width,
	            height: data.Metadata.Height,
	            viewBox: "0 0 " + data.Metadata.Width + " " + data.Metadata.Height
	        });
	        doc.rootElement.appendChild(this.metadataFactory.ToSVG(data.Metadata));
	        this.eraseChunkFactory.Width = data.Metadata.Width;
	        this.eraseChunkFactory.Height = data.Metadata.Height;
	        var chunks = SVG_1.default.CreateElement("g");
	        SVG_1.SVGA.SetAttributes(chunks, { "type": this.VideoChunksLayerType });
	        data.Rewind();
	        while (!!data.CurrentChunk) {
	            chunks.appendChild(this.chunkFactory.ToSVG(data.CurrentChunk, this.commandFactory));
	            data.MoveNextChunk();
	        }
	        doc.rootElement.appendChild(chunks);
	        var serializer = new XMLSerializer();
	        return new Blob([serializer.serializeToString(doc)], { type: "application/svg+xml" });
	    };
	    IO.prototype.LoadVideo = function (events, doc) {
	        if (doc instanceof Document === false) {
	            throw new Error("SVGAnimation IO parsing error: Document must be an XML document");
	        }
	        var xml = doc;
	        if (xml.documentElement.childElementCount !== 2) {
	            throw new Error("SVGAnimation document root element must have exactely two children nodes, but has " + xml.documentElement.childNodes.length + " instead");
	        }
	        var video = new Video_1.default();
	        var metaNode = xml.documentElement.firstElementChild;
	        video.Metadata = this.metadataFactory.FromSVG(metaNode);
	        var chunksLayer = metaNode.nextElementSibling;
	        if (chunksLayer.localName !== "g" || SVG_1.SVGA.attr(chunksLayer, "type") !== this.VideoChunksLayerType) {
	            throw new Error(("SVGAnimation IO parsing error: chunks layer must be a SVG\u00A0<g> node with a:type='" + this.VideoChunksLayerType + "',")
	                + (" got <" + chunksLayer.localName + "> with a:type='" + SVG_1.SVGA.attr(chunksLayer, "type") + "'"));
	        }
	        var lastErase = 0;
	        var i = 0;
	        var chunk = chunksLayer.firstElementChild;
	        while (!!chunk) {
	            var next = this.chunkFactory.FromSVG(events, chunk, this.commandFactory);
	            next.LastErase = lastErase;
	            video.PushChunk(next);
	            if (next instanceof Chunk_1.EraseChunk) {
	                lastErase = i;
	            }
	            chunk = chunk.nextElementSibling;
	            i++;
	        }
	        video.Rewind();
	        return video;
	    };
	    IO.prototype.GetExtension = function () {
	        return "svg";
	    };
	    IO.prototype.GetMimeType = function () {
	        return "application/svg+xml";
	    };
	    return IO;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = IO;


/***/ },
/* 25 */
/***/ function(module, exports) {

	var Video = (function () {
	    function Video() {
	        this.chunks = [];
	    }
	    Object.defineProperty(Video.prototype, "Metadata", {
	        get: function () { return this.metadata; },
	        set: function (value) { this.metadata = value; },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Video.prototype, "CurrentChunk", {
	        get: function () {
	            return this.chunks[this.currentChunk];
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Video.prototype, "CurrentChunkNumber", {
	        get: function () {
	            return this.currentChunk;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Video.prototype, "SetCurrentChunkNumber", {
	        set: function (n) {
	            this.currentChunk = n;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Video.prototype.PeekNextChunk = function () {
	        return this.chunks[this.currentChunk + 1];
	    };
	    Video.prototype.MoveNextChunk = function () {
	        this.currentChunk++;
	        if (!!this.CurrentChunk) {
	            this.CurrentChunk.Rewind();
	        }
	    };
	    Video.prototype.PushChunk = function (chunk) {
	        this.currentChunk = this.chunks.push(chunk) - 1;
	        return this.currentChunk;
	    };
	    Video.prototype.Rewind = function () {
	        this.currentChunk = 0;
	    };
	    Video.prototype.RewindMinusOne = function () {
	        this.currentChunk = -1;
	    };
	    Video.prototype.FastforwardErasedChunksUntil = function (time) {
	        var c = this.FindChunk(time, +1);
	        return Math.max(this.currentChunk, this.chunks[c].LastErase);
	    };
	    Video.prototype.RewindToLastEraseBefore = function (time) {
	        var c = this.FindChunk(time, -1);
	        return this.chunks[c].LastErase;
	    };
	    Video.prototype.FindChunk = function (time, directionHint) {
	        var foundChunk = Math.min(this.currentChunk, this.chunks.length - 2);
	        while ((!!this.chunks[foundChunk] && !!this.chunks[foundChunk + 1])
	            && (this.chunks[foundChunk].StartTime <= time && this.chunks[foundChunk + 1].StartTime >= time) === false) {
	            foundChunk += directionHint;
	        }
	        if (foundChunk < 0) {
	            return 0;
	        }
	        return foundChunk;
	    };
	    return Video;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Video;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var SVG_1 = __webpack_require__(12);
	var Vector_1 = __webpack_require__(11);
	var Chunk_1 = __webpack_require__(22);
	var Command_1 = __webpack_require__(20);
	var Path_1 = __webpack_require__(17);
	var Segments_1 = __webpack_require__(19);
	var Color_1 = __webpack_require__(13);
	var Spline_1 = __webpack_require__(18);
	var TIME_PRECISION = 2;
	var ChunkFactory = (function () {
	    function ChunkFactory(next) {
	        this.next = next;
	    }
	    ChunkFactory.prototype.FromSVG = function (events, node, cmdFactory) {
	        if (!!this.next) {
	            return this.next.FromSVG(events, node, cmdFactory);
	        }
	        throw new Error("Chunk loading failed: Unsupported node " + node.nodeName + ".");
	    };
	    ChunkFactory.prototype.ToSVG = function (chunk, cmdFactory) {
	        if (!!this.next) {
	            return this.next.ToSVG(chunk, cmdFactory);
	        }
	        throw new Error("Chunk export failed: Unsupported command " + typeof (chunk) + ".");
	    };
	    ChunkFactory.prototype.CommandsToSVG = function (node, cmds, cmdFactory, chunkStart) {
	        for (var i = 0; i < cmds.length; i++) {
	            node.appendChild(cmdFactory.ToSVG(cmds[i], chunkStart));
	        }
	        return node;
	    };
	    ChunkFactory.GetCommands = function (cmd, cmdFactory, chunkStart) {
	        var initCommands = this.initCmds.filter(function (v) { return v !== null; }).map(function (v) { return v.Clone(); });
	        var cmds = [];
	        while (!!cmd) {
	            var loadedCmd = cmdFactory.FromSVG(cmd, chunkStart);
	            cmds.push(loadedCmd);
	            cmd = cmd.nextElementSibling;
	            if (loadedCmd instanceof Command_1.MoveCursor) {
	                this.initCmds[0] = loadedCmd;
	            }
	            else if (loadedCmd instanceof Command_1.ChangeBrushColor) {
	                this.initCmds[1] = loadedCmd;
	            }
	            else if (loadedCmd instanceof Command_1.ChangeBrushSize) {
	                this.initCmds[2] = loadedCmd;
	            }
	        }
	        return [initCommands, cmds];
	    };
	    ChunkFactory.initCmds = [null, null, null];
	    return ChunkFactory;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = ChunkFactory;
	var VoidChunkFactory = (function (_super) {
	    __extends(VoidChunkFactory, _super);
	    function VoidChunkFactory() {
	        _super.apply(this, arguments);
	    }
	    VoidChunkFactory.prototype.FromSVG = function (events, node, cmdFactory) {
	        if (SVG_1.SVGA.attr(node, "type") === VoidChunkFactory.NodeName) {
	            var chunk = new Chunk_1.VoidChunk(SVG_1.SVGA.numAttr(node, "t"), 0);
	            _a = ChunkFactory.GetCommands(node.firstElementChild, cmdFactory, chunk.StartTime), chunk.InitCommands = _a[0], chunk.Commands = _a[1];
	            return chunk;
	        }
	        return _super.prototype.FromSVG.call(this, events, node, cmdFactory);
	        var _a;
	    };
	    VoidChunkFactory.prototype.ToSVG = function (chunk, cmdFactory) {
	        if (chunk instanceof Chunk_1.VoidChunk) {
	            var node = SVG_1.default.CreateElement("g");
	            SVG_1.SVGA.SetAttributes(node, {
	                "type": VoidChunkFactory.NodeName,
	                "t": chunk.StartTime.toFixed(TIME_PRECISION)
	            });
	            this.CommandsToSVG(node, chunk.Commands, cmdFactory, chunk.StartTime);
	            return node;
	        }
	        return _super.prototype.ToSVG.call(this, chunk, cmdFactory);
	    };
	    VoidChunkFactory.NodeName = "void";
	    return VoidChunkFactory;
	})(ChunkFactory);
	exports.VoidChunkFactory = VoidChunkFactory;
	var InstructionType;
	(function (InstructionType) {
	    InstructionType[InstructionType["Move"] = 0] = "Move";
	    InstructionType[InstructionType["Line"] = 1] = "Line";
	    InstructionType[InstructionType["Curve"] = 2] = "Curve";
	    InstructionType[InstructionType["Arc"] = 3] = "Arc";
	    InstructionType[InstructionType["Close"] = 4] = "Close";
	})(InstructionType || (InstructionType = {}));
	var InstructionFactory = (function () {
	    function InstructionFactory(letter, type, coordsCount, next) {
	        this.letter = letter;
	        this.type = type;
	        this.coordsCount = coordsCount;
	        this.next = next;
	    }
	    InstructionFactory.prototype.Create = function (c) {
	        var letter = c.shift();
	        if (letter === this.letter) {
	            var coords = [];
	            for (var i = 0; i < this.coordsCount; i++) {
	                coords.push(this.CreateVector2(c.shift()));
	            }
	            return {
	                type: this.type,
	                coords: coords
	            };
	        }
	        else {
	            if (!!this.next) {
	                c.unshift(letter);
	                return this.next.Create(c);
	            }
	            throw new Error("Unsupported instruction letter '" + letter + "'");
	        }
	    };
	    InstructionFactory.prototype.CreateVector2 = function (pair) {
	        var coords = pair.split(",");
	        if (coords.length !== 2) {
	            throw new Error("Coordinates pair '" + pair + "' is not valid");
	        }
	        return new Vector_1.default(Number(coords[0]), Number(coords[1]));
	    };
	    return InstructionFactory;
	})();
	var ArcFactory = (function (_super) {
	    __extends(ArcFactory, _super);
	    function ArcFactory(next) {
	        _super.call(this, "A", InstructionType.Arc, 3, next);
	    }
	    ArcFactory.prototype.Create = function (c) {
	        var letter = c.shift();
	        if (letter === this.letter) {
	            var coords = [];
	            coords.push(this.CreateVector2(c.shift()));
	            c.shift();
	            coords.push(this.CreateVector2(c.shift()));
	            coords.push(this.CreateVector2(c.shift()));
	            return {
	                type: this.type,
	                coords: coords
	            };
	        }
	        else {
	            if (!!this.next) {
	                c.unshift(letter);
	                return this.next.Create(c);
	            }
	            throw new Error("Unsupported instruction letter '" + letter + "'");
	        }
	    };
	    return ArcFactory;
	})(InstructionFactory);
	var PathChunkFactory = (function (_super) {
	    __extends(PathChunkFactory, _super);
	    function PathChunkFactory(next) {
	        _super.call(this, next);
	        this.next = next;
	        this.instructionFactory = new InstructionFactory("C", InstructionType.Curve, 3, new InstructionFactory("L", InstructionType.Line, 1, new InstructionFactory("M", InstructionType.Move, 1, new ArcFactory())));
	    }
	    PathChunkFactory.prototype.FromSVG = function (events, node, cmdFactory) {
	        if (SVG_1.SVGA.attr(node, "type") === PathChunkFactory.NodeName) {
	            if (node.childElementCount === 0) {
	                throw new Error("Path chunk no child elements.");
	            }
	            var pathNode = node.firstElementChild;
	            if (pathNode.localName !== "path") {
	                throw new Error("Path chunk must begin with a <path> element, but " + pathNode.localName + " found instead");
	            }
	            var chunk = new Chunk_1.PathChunk(this.SVGNodeToPath(events, pathNode), SVG_1.SVGA.numAttr(node, "t"), 0);
	            _a = ChunkFactory.GetCommands(pathNode.nextElementSibling, cmdFactory, chunk.StartTime), chunk.InitCommands = _a[0], chunk.Commands = _a[1];
	            return chunk;
	        }
	        return _super.prototype.FromSVG.call(this, events, node, cmdFactory);
	        var _a;
	    };
	    PathChunkFactory.prototype.ToSVG = function (chunk, cmdFactory) {
	        if (chunk instanceof Chunk_1.PathChunk) {
	            var node = SVG_1.default.CreateElement("g");
	            SVG_1.SVGA.SetAttributes(node, {
	                "type": PathChunkFactory.NodeName,
	                "t": chunk.StartTime.toFixed(TIME_PRECISION)
	            });
	            node.appendChild(this.PathToSVGNode(chunk.Path));
	            this.CommandsToSVG(node, chunk.Commands, cmdFactory, chunk.StartTime);
	            return node;
	        }
	        return _super.prototype.ToSVG.call(this, chunk, cmdFactory);
	    };
	    PathChunkFactory.prototype.SVGNodeToPath = function (events, node) {
	        var color = SVG_1.default.attr(node, "fill");
	        var path = new Path_1.default(events, true, color);
	        var d = SVG_1.default.attr(node, "d");
	        node = null;
	        var c = d.split(" ").filter(function (val) { return val.length > 0; });
	        var instructions = [];
	        while (c.length > 0) {
	            instructions.push(this.instructionFactory.Create(c));
	        }
	        c = null;
	        d = null;
	        var l = instructions.length - 1;
	        if (instructions.length >= 2 && instructions[0].type === InstructionType.Move && instructions[l].type === InstructionType.Arc) {
	            path.Segments.push(new Segments_1.ZeroLengthSegment(instructions[l - 1].coords[0], instructions[0].coords[0]));
	            instructions.pop();
	            instructions.pop();
	            instructions.shift();
	        }
	        else {
	            throw new Error("Only " + instructions.length + " valid instructions recognized in a path string");
	        }
	        if (instructions.length === 1) {
	            var start = path.Segments[0].Right;
	            var end = instructions[0].coords[2];
	            path.Segments = [new Segments_1.ZeroLengthSegment(start, end)];
	            return path;
	        }
	        l = instructions.length - 1;
	        var prevSegment = path.Segments[0];
	        for (var i = 0; i < Math.floor(instructions.length / 2); i++) {
	            if (instructions[i].type === InstructionType.Line) {
	                var qseg = new Segments_1.QuadrilateralSegment(instructions[i].coords[0], instructions[l - i].coords[0]);
	                path.Segments.push(qseg);
	                if (prevSegment instanceof Segments_1.CurvedSegment) {
	                    prevSegment.Left = instructions[l - i].coords[0].clone();
	                }
	                prevSegment = qseg;
	            }
	            else if (instructions[i].type === InstructionType.Curve) {
	                var right = new Spline_1.BezierCurveSegment(null, instructions[i].coords[0], instructions[i].coords[2], instructions[i].coords[1]);
	                var left = new Spline_1.BezierCurveSegment(instructions[l - i].coords[2], instructions[l - i].coords[1], null, instructions[l - i].coords[0]);
	                var seg = new Segments_1.CurvedSegment(left, right);
	                if (!!prevSegment && prevSegment instanceof Segments_1.CurvedSegment) {
	                    prevSegment.Left = seg.LeftBezier.Start.clone();
	                    seg.RightBezier.Start = prevSegment.RightBezier.End.clone();
	                }
	                else if (!!prevSegment && prevSegment instanceof Segments_1.QuadrilateralSegment) {
	                    seg.RightBezier.Start = prevSegment.Right.clone();
	                }
	                path.Segments.push(seg);
	                prevSegment = seg;
	            }
	            else {
	                throw new Error("Unsupported path segment type " + instructions[i].type + " ");
	            }
	        }
	        if (!!prevSegment && prevSegment instanceof Segments_1.CurvedSegment) {
	            prevSegment.Left = instructions[Math.floor(instructions.length / 2)].coords[2].clone();
	        }
	        return path;
	    };
	    PathChunkFactory.prototype.PathToSVGNode = function (path) {
	        var segments = path.Segments;
	        var seg = segments[0];
	        var center = seg.Right.pointInBetween(seg.Left);
	        var startDirection = seg.Left.clone().subtract(center);
	        var endDirection = seg.Right.clone().subtract(center);
	        var arc = SVG_1.default.ArcString(seg.Right, center.distanceTo(seg.Right), Path_1.default.angle(startDirection));
	        var right = "";
	        var left = " " + arc;
	        for (var i = 0; i < segments.length; i++) {
	            var seg = segments[i];
	            if (seg instanceof Segments_1.ZeroLengthSegment) {
	                right += SVG_1.default.MoveToString(seg.Right) + " ";
	                left = SVG_1.default.MoveToString(seg.Left) + " " + left;
	            }
	            else if (seg instanceof Segments_1.CurvedSegment) {
	                right += SVG_1.default.CurveToString(seg.RightBezier.StartCP, seg.RightBezier.EndCP, seg.RightBezier.End) + " ";
	                left = SVG_1.default.CurveToString(seg.LeftBezier.EndCP, seg.LeftBezier.StartCP, seg.LeftBezier.Start) + " " + left;
	            }
	            else if (seg instanceof Segments_1.QuadrilateralSegment) {
	                right += SVG_1.default.LineToString(seg.Right) + " ";
	                left = SVG_1.default.LineToString(seg.Left) + " " + left;
	            }
	            else {
	                throw new Error("Unsupported segment type " + typeof (seg));
	            }
	        }
	        seg = segments[segments.length - 1];
	        center = seg.Right.pointInBetween(seg.Left);
	        startDirection = seg.Right.clone().subtract(center);
	        endDirection = seg.Left.clone().subtract(center);
	        var cap = SVG_1.default.ArcString(seg.Left, center.distanceTo(seg.Left), Path_1.default.angle(startDirection)) + " ";
	        return SVG_1.default.CreateElement("path", {
	            "fill": path.Color,
	            "d": right + cap + left
	        });
	    };
	    PathChunkFactory.NodeName = "path";
	    return PathChunkFactory;
	})(ChunkFactory);
	exports.PathChunkFactory = PathChunkFactory;
	var EraseChunkFactory = (function (_super) {
	    __extends(EraseChunkFactory, _super);
	    function EraseChunkFactory() {
	        _super.apply(this, arguments);
	        this.Width = 0;
	        this.Height = 0;
	    }
	    EraseChunkFactory.prototype.FromSVG = function (events, node, cmdFactory) {
	        if (SVG_1.SVGA.attr(node, "type") === EraseChunkFactory.NodeName) {
	            if (node.childElementCount === 0) {
	                throw new Error("Erase chunk no child elements.");
	            }
	            var rectNode = node.firstElementChild;
	            if (rectNode.localName !== "rect") {
	                throw new Error("Erase chunk must begin with a <rect> element, but " + rectNode.localName + " found instead");
	            }
	            var chunk = new Chunk_1.EraseChunk(new Color_1.default(SVG_1.default.attr(rectNode, "fill")), SVG_1.SVGA.numAttr(node, "t"), 0);
	            _a = ChunkFactory.GetCommands(rectNode.nextElementSibling, cmdFactory, chunk.StartTime), chunk.InitCommands = _a[0], chunk.Commands = _a[1];
	            return chunk;
	        }
	        return _super.prototype.FromSVG.call(this, events, node, cmdFactory);
	        var _a;
	    };
	    EraseChunkFactory.prototype.ToSVG = function (chunk, cmdFactory) {
	        if (chunk instanceof Chunk_1.EraseChunk) {
	            var node = SVG_1.default.CreateElement("g");
	            SVG_1.SVGA.SetAttributes(node, {
	                "type": EraseChunkFactory.NodeName,
	                "t": chunk.StartTime.toFixed(TIME_PRECISION)
	            });
	            node.appendChild(SVG_1.default.CreateElement("rect", { "fill": chunk.Color.CssValue, width: this.Width, height: this.Height }));
	            this.CommandsToSVG(node, chunk.Commands, cmdFactory, chunk.StartTime);
	            return node;
	        }
	        return _super.prototype.ToSVG.call(this, chunk, cmdFactory);
	    };
	    EraseChunkFactory.NodeName = "erase";
	    return EraseChunkFactory;
	})(ChunkFactory);
	exports.EraseChunkFactory = EraseChunkFactory;


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Command_1 = __webpack_require__(20);
	var SVG_1 = __webpack_require__(12);
	var HelperFunctions_1 = __webpack_require__(7);
	var Color_1 = __webpack_require__(13);
	var Brush_1 = __webpack_require__(28);
	var TIME_PRECISION = 2;
	var COORDS_PRECISION = 3;
	var PRESSURE_PRECISION = 4;
	var CommandFactory = (function () {
	    function CommandFactory(next) {
	        this.next = next;
	    }
	    CommandFactory.prototype.FromSVG = function (node, chunkStart) {
	        if (!!this.next) {
	            return this.next.FromSVG(node, chunkStart);
	        }
	        throw new Error("Command loading failed: Unsupported node " + node.nodeName + ".");
	    };
	    CommandFactory.prototype.getCmdTime = function (el, chunkStart) {
	        return SVG_1.SVGA.numAttr(el, "t", 0) + chunkStart;
	    };
	    CommandFactory.prototype.ToSVG = function (cmd, chunkStart) {
	        if (!!this.next) {
	            return this.next.ToSVG(cmd, chunkStart);
	        }
	        throw new Error("Command export failed: Unsupported command " + typeof cmd + ".");
	    };
	    CommandFactory.prototype.storeTime = function (el, time) {
	        if (time > 0) {
	            SVG_1.SVGA.SetAttributes(el, { "t": HelperFunctions_1.precise(time, TIME_PRECISION) });
	        }
	    };
	    return CommandFactory;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = CommandFactory;
	var MoveCursorFactory = (function (_super) {
	    __extends(MoveCursorFactory, _super);
	    function MoveCursorFactory() {
	        _super.apply(this, arguments);
	    }
	    MoveCursorFactory.prototype.FromSVG = function (node, chunkStart) {
	        if (node.localName === MoveCursorFactory.NodeName) {
	            return new Command_1.MoveCursor(SVG_1.SVGA.numAttr(node, "x"), SVG_1.SVGA.numAttr(node, "y"), SVG_1.SVGA.numAttr(node, "p", 0), _super.prototype.getCmdTime.call(this, node, chunkStart));
	        }
	        return _super.prototype.FromSVG.call(this, node, chunkStart);
	    };
	    MoveCursorFactory.prototype.ToSVG = function (cmd, chunkStart) {
	        if (cmd instanceof Command_1.MoveCursor) {
	            var options = {
	                "x": HelperFunctions_1.precise(cmd.X),
	                "y": HelperFunctions_1.precise(cmd.Y)
	            };
	            if (cmd.P > 0) {
	                options["p"] = HelperFunctions_1.precise(cmd.P, PRESSURE_PRECISION);
	            }
	            var cmdEl = SVG_1.SVGA.CreateElement(MoveCursorFactory.NodeName, options);
	            _super.prototype.storeTime.call(this, cmdEl, cmd.Time - chunkStart);
	            return cmdEl;
	        }
	        return _super.prototype.ToSVG.call(this, cmd, chunkStart);
	    };
	    MoveCursorFactory.NodeName = "m";
	    return MoveCursorFactory;
	})(CommandFactory);
	exports.MoveCursorFactory = MoveCursorFactory;
	var DrawSegmentFactory = (function (_super) {
	    __extends(DrawSegmentFactory, _super);
	    function DrawSegmentFactory() {
	        _super.apply(this, arguments);
	    }
	    DrawSegmentFactory.prototype.FromSVG = function (node, chunkStart) {
	        if (node.localName === DrawSegmentFactory.NodeName) {
	            return new Command_1.DrawNextSegment(_super.prototype.getCmdTime.call(this, node, chunkStart));
	        }
	        return _super.prototype.FromSVG.call(this, node, chunkStart);
	    };
	    DrawSegmentFactory.prototype.ToSVG = function (cmd, chunkStart) {
	        if (cmd instanceof Command_1.DrawNextSegment) {
	            var cmdEl = SVG_1.SVGA.CreateElement(DrawSegmentFactory.NodeName);
	            _super.prototype.storeTime.call(this, cmdEl, cmd.Time - chunkStart);
	            return cmdEl;
	        }
	        return _super.prototype.ToSVG.call(this, cmd, chunkStart);
	    };
	    DrawSegmentFactory.NodeName = "d";
	    return DrawSegmentFactory;
	})(CommandFactory);
	exports.DrawSegmentFactory = DrawSegmentFactory;
	var ChangeBrushColorFactory = (function (_super) {
	    __extends(ChangeBrushColorFactory, _super);
	    function ChangeBrushColorFactory() {
	        _super.apply(this, arguments);
	    }
	    ChangeBrushColorFactory.prototype.FromSVG = function (node, chunkStart) {
	        if (node.localName === ChangeBrushColorFactory.NodeName) {
	            return new Command_1.ChangeBrushColor(new Color_1.default(SVG_1.SVGA.attr(node, "c")), _super.prototype.getCmdTime.call(this, node, chunkStart));
	        }
	        return _super.prototype.FromSVG.call(this, node, chunkStart);
	    };
	    ChangeBrushColorFactory.prototype.ToSVG = function (cmd, chunkStart) {
	        if (cmd instanceof Command_1.ChangeBrushColor) {
	            var cmdEl = SVG_1.SVGA.CreateElement(ChangeBrushColorFactory.NodeName, {
	                "c": cmd.Color.CssValue
	            });
	            _super.prototype.storeTime.call(this, cmdEl, cmd.Time - chunkStart);
	            return cmdEl;
	        }
	        return _super.prototype.ToSVG.call(this, cmd, chunkStart);
	    };
	    ChangeBrushColorFactory.NodeName = "c";
	    return ChangeBrushColorFactory;
	})(CommandFactory);
	exports.ChangeBrushColorFactory = ChangeBrushColorFactory;
	var ChangeBrushSizeFactory = (function (_super) {
	    __extends(ChangeBrushSizeFactory, _super);
	    function ChangeBrushSizeFactory() {
	        _super.apply(this, arguments);
	    }
	    ChangeBrushSizeFactory.prototype.FromSVG = function (node, chunkStart) {
	        if (node.localName === ChangeBrushSizeFactory.NodeName) {
	            return new Command_1.ChangeBrushSize(new Brush_1.default(SVG_1.SVGA.numAttr(node, "w")), _super.prototype.getCmdTime.call(this, node, chunkStart));
	        }
	        return _super.prototype.FromSVG.call(this, node, chunkStart);
	    };
	    ChangeBrushSizeFactory.prototype.ToSVG = function (cmd, chunkStart) {
	        if (cmd instanceof Command_1.ChangeBrushSize) {
	            var cmdEl = SVG_1.SVGA.CreateElement(ChangeBrushSizeFactory.NodeName, {
	                "w": cmd.Size.Size
	            });
	            _super.prototype.storeTime.call(this, cmdEl, cmd.Time - chunkStart);
	            return cmdEl;
	        }
	        return _super.prototype.ToSVG.call(this, cmd, chunkStart);
	    };
	    ChangeBrushSizeFactory.NodeName = "s";
	    return ChangeBrushSizeFactory;
	})(CommandFactory);
	exports.ChangeBrushSizeFactory = ChangeBrushSizeFactory;
	var ClearCanvasFactory = (function (_super) {
	    __extends(ClearCanvasFactory, _super);
	    function ClearCanvasFactory() {
	        _super.apply(this, arguments);
	    }
	    ClearCanvasFactory.prototype.FromSVG = function (node, chunkStart) {
	        if (node.localName === ClearCanvasFactory.NodeName) {
	            return new Command_1.ClearCanvas(new Color_1.default(SVG_1.SVGA.attr(node, "c")), _super.prototype.getCmdTime.call(this, node, chunkStart));
	        }
	        return _super.prototype.FromSVG.call(this, node, chunkStart);
	    };
	    ClearCanvasFactory.prototype.ToSVG = function (cmd, chunkStart) {
	        if (cmd instanceof Command_1.ClearCanvas) {
	            var cmdEl = SVG_1.SVGA.CreateElement(ClearCanvasFactory.NodeName, {
	                "c": cmd.Color.CssValue
	            });
	            _super.prototype.storeTime.call(this, cmdEl, cmd.Time - chunkStart);
	            return cmdEl;
	        }
	        return _super.prototype.ToSVG.call(this, cmd, chunkStart);
	    };
	    ClearCanvasFactory.NodeName = "e";
	    return ClearCanvasFactory;
	})(CommandFactory);
	exports.ClearCanvasFactory = ClearCanvasFactory;


/***/ },
/* 28 */
/***/ function(module, exports) {

	//namespace VectorScreencast.UI {
	var BrushSize = (function () {
	    function BrushSize(size) {
	        this.size = size;
	    }
	    Object.defineProperty(BrushSize.prototype, "Size", {
	        get: function () { return this.size; },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(BrushSize.prototype, "Unit", {
	        get: function () { return "px"; },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(BrushSize.prototype, "CssValue", {
	        get: function () { return "" + this.Size + this.Unit; },
	        enumerable: true,
	        configurable: true
	    });
	    return BrushSize;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = BrushSize;


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var Metadata_1 = __webpack_require__(30);
	var SVG_1 = __webpack_require__(12);
	var AudioPlayer_1 = __webpack_require__(2);
	var MetadataFactory = (function () {
	    function MetadataFactory() {
	    }
	    MetadataFactory.prototype.FromSVG = function (rootNode) {
	        var meta = new Metadata_1.default();
	        if (rootNode.localName !== "metadata") {
	            throw new Error("MetadataFactory error parsing SVG: Wrong metadata element " + rootNode.localName);
	        }
	        var length = rootNode.firstElementChild;
	        if (length.localName !== "length") {
	            throw new Error("MetadataFactory error parsing SVG: Expected 'length', found '" + length.nodeName + "'");
	        }
	        meta.Length = Number(length.textContent);
	        var width = length.nextElementSibling;
	        length = null;
	        if (width.localName !== "width") {
	            throw new Error("MetadataFactory error parsing SVG: Expected 'length', found '" + width.nodeName + "'");
	        }
	        meta.Width = Number(width.textContent);
	        var height = width.nextElementSibling;
	        width = null;
	        if (height.localName !== "height") {
	            throw new Error("MetadataFactory error parsing SVG: Expected 'length', found '" + height.nodeName + "'");
	        }
	        meta.Height = Number(height.textContent);
	        meta.AudioTracks = [];
	        var audioElement = height.nextElementSibling;
	        var audioSource = audioElement.firstElementChild;
	        while (!!audioSource) {
	            var type = AudioPlayer_1.AudioSource.StringToType(SVG_1.SVGA.attr(audioSource, "type"));
	            meta.AudioTracks.push(new AudioPlayer_1.AudioSource(SVG_1.SVGA.attr(audioSource, "src"), type));
	            audioSource = audioSource.nextElementSibling;
	        }
	        return meta;
	    };
	    MetadataFactory.prototype.ToSVG = function (data) {
	        var meta = SVG_1.default.CreateElement("metadata");
	        var length = SVG_1.SVGA.CreateElement("length");
	        length.textContent = data.Length.toFixed(3);
	        meta.appendChild(length);
	        length = null;
	        var width = SVG_1.SVGA.CreateElement("width");
	        width.textContent = data.Width.toFixed(0);
	        meta.appendChild(width);
	        width = null;
	        var height = SVG_1.SVGA.CreateElement("height");
	        height.textContent = data.Height.toFixed(0);
	        meta.appendChild(height);
	        height = null;
	        var audioElement = SVG_1.SVGA.CreateElement("audio");
	        for (var i = 0; i < data.AudioTracks.length; i++) {
	            var audioSource = data.AudioTracks[i];
	            var source = SVG_1.SVGA.CreateElement("source", {
	                "type": audioSource.MimeType,
	                "src": audioSource.Url
	            });
	            audioElement.appendChild(source);
	            source = null;
	        }
	        meta.appendChild(audioElement);
	        return meta;
	    };
	    return MetadataFactory;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = MetadataFactory;


/***/ },
/* 30 */
/***/ function(module, exports) {

	var Metadata = (function () {
	    function Metadata() {
	    }
	    return Metadata;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Metadata;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map