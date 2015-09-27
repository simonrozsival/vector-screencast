webpackJsonp([0],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	var AudioPlayer_1 = __webpack_require__(6);
	var VideoEvents_1 = __webpack_require__(7);
	var Errors_1 = __webpack_require__(8);
	var PlayerUI_1 = __webpack_require__(10);
	var VideoTimer_1 = __webpack_require__(19);
	var CanvasDrawer_1 = __webpack_require__(20);
	var Command_1 = __webpack_require__(24);
	var Chunk_1 = __webpack_require__(26);
	var File_1 = __webpack_require__(27);
	var IO_1 = __webpack_require__(28);
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

/***/ 10:
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var VideoEvents_1 = __webpack_require__(7);
	var HTML_1 = __webpack_require__(9);
	var HelperFunctions_1 = __webpack_require__(11);
	var BasicElements_1 = __webpack_require__(12);
	var Board_1 = __webpack_require__(13);
	var TimeLine_1 = __webpack_require__(18);
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

/***/ 18:
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var VideoEvents_1 = __webpack_require__(7);
	var BasicElements_1 = __webpack_require__(12);
	var HelperFunctions_1 = __webpack_require__(11);
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

/***/ 20:
/***/ function(module, exports, __webpack_require__) {

	var VideoEvents_1 = __webpack_require__(7);
	var HTML_1 = __webpack_require__(9);
	var Path_1 = __webpack_require__(21);
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


/***/ }

});
//# sourceMappingURL=player.js.map