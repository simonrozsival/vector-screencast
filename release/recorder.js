webpackJsonp([1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var PointingDevice_1 = __webpack_require__(35);
	var Video_1 = __webpack_require__(29);
	var Chunk_1 = __webpack_require__(26);
	var Command_1 = __webpack_require__(24);
	var DynaDraw_1 = __webpack_require__(41);
	var SVGDrawer_1 = __webpack_require__(42);
	var AudioRecorder_1 = __webpack_require__(43);
	var VideoEvents_1 = __webpack_require__(7);
	var Errors_1 = __webpack_require__(8);
	var VideoTimer_1 = __webpack_require__(19);
	var Metadata_1 = __webpack_require__(34);
	var Color_1 = __webpack_require__(17);
	var Brush_1 = __webpack_require__(32);
	var File_1 = __webpack_require__(27);
	var IO_1 = __webpack_require__(28);
	var RecorderUI_1 = __webpack_require__(44);
	var Recorder = (function () {
	    function Recorder(id, settings) {
	        var _this = this;
	        this.id = id;
	        this.settings = settings;
	        this.events = new VideoEvents_1.default();
	        this.isRecording = false;
	        this.timer = new VideoTimer_1.default(false);
	        this.recordingBlocked = false;
	        this.data = new Video_1.default();
	        this.lastEraseData = 0;
	        this.recordAllRawData = settings.RecordAllRawData !== undefined ? !!settings.RecordAllRawData : true;
	        if (!!settings.DefaultBackgroundColor)
	            Color_1.default.BackgroundColor = settings.DefaultBackgroundColor;
	        if (!!settings.DefaultBrushColor)
	            Color_1.default.ForegroundColor = settings.DefaultBrushColor;
	        var container = document.getElementById(id);
	        if (!container) {
	            Errors_1.default.Report(Errors_1.ErrorType.Fatal, "Container #" + id + " doesn't exist. Video Recorder couldn't be initialised.");
	            return;
	        }
	        while (!!container.firstChild) {
	            container.removeChild(container.firstChild);
	        }
	        if (!settings.ColorPallete || settings.ColorPallete.length === 0) {
	            var colors = [];
	            colors.push(new Color_1.default("#ffffff"));
	            colors.push(new Color_1.default("#fa5959"));
	            colors.push(new Color_1.default("#8cfa59"));
	            colors.push(new Color_1.default("#59a0fa"));
	            colors.push(new Color_1.default("#fbff06"));
	            colors.push(Color_1.default.BackgroundColor);
	            settings.ColorPallete = colors;
	        }
	        if (!colors.indexOf(Color_1.default.BackgroundColor)) {
	            colors.push(Color_1.default.BackgroundColor);
	        }
	        if (!settings.BrushSizes || settings.BrushSizes.length === 0) {
	            var brushes = [];
	            brushes.push(new Brush_1.default(2));
	            brushes.push(new Brush_1.default(3));
	            brushes.push(new Brush_1.default(4));
	            brushes.push(new Brush_1.default(6));
	            brushes.push(new Brush_1.default(8));
	            brushes.push(new Brush_1.default(10));
	            brushes.push(new Brush_1.default(15));
	            brushes.push(new Brush_1.default(80));
	            settings.BrushSizes = brushes;
	        }
	        if (!settings.Localization) {
	            var loc = {
	                NoJS: "Your browser does not support JavaScript or it is turned off. Video can't be recorded without enabled JavaScript in your browser.",
	                Busy: "Preparing recording studio...",
	                RecPause: "Control recording",
	                Record: "Start",
	                Pause: "Pause recording",
	                Upload: "Upload",
	                UploadInProgress: "Uploading data...",
	                ChangeColor: "Change brush color",
	                ChangeSize: "Change brush size",
	                Erase: "Eraser",
	                EraseAll: "Erase everything",
	                WaitingText: "Please be patient. Uploading video usually takes some times - up to a few minutes if your video is over ten minutes long. Do not close this tab or browser window.",
	                UploadWasSuccessful: "Upload was successful",
	                RedirectPrompt: "Upload was successful - press OK to continue",
	                UploadFailure: "Upload failed.",
	                FailureApology: "We are sorry, but upload failed. Do you want to download your data to your computer instead?",
	                AudioRecording: "Audio recording",
	                AudioRecordingAvailable: "Audio recording is available",
	                AudioRecordingUnavailable: "Audio recording is unavailable"
	            };
	            settings.Localization = loc;
	        }
	        this.events.on(VideoEvents_1.VideoEventType.ChangeBrushSize, function (size) { return _this.ChangeBrushSize(size); });
	        this.events.on(VideoEvents_1.VideoEventType.ChangeColor, function (color) { return _this.ChangeColor(color); });
	        this.events.on(VideoEvents_1.VideoEventType.CursorState, function (state) { return _this.ProcessCursorState(state); });
	        this.events.on(VideoEvents_1.VideoEventType.ClearCanvas, function (color) { return _this.ClearCanvas(color); });
	        this.events.on(VideoEvents_1.VideoEventType.Start, function () { return _this.Start(); });
	        this.events.on(VideoEvents_1.VideoEventType.Pause, function () { return _this.Pause(); });
	        this.events.on(VideoEvents_1.VideoEventType.StartUpload, function () { return _this.StartUpload(); });
	        this.busyLevel = 0;
	        this.events.on(VideoEvents_1.VideoEventType.Busy, function () { return _this.Busy(); });
	        this.events.on(VideoEvents_1.VideoEventType.Ready, function () { return _this.Ready(); });
	        this.events.on(VideoEvents_1.VideoEventType.StartPath, function (path) {
	            _this.PushChunk(new Chunk_1.PathChunk(path, _this.timer.CurrentTime(), _this.lastEraseData));
	            _this.data.CurrentChunk.PushCommand(new Command_1.DrawNextSegment(_this.timer.CurrentTime()));
	        });
	        this.events.on(VideoEvents_1.VideoEventType.DrawSegment, function () { return _this.data.CurrentChunk.PushCommand(new Command_1.DrawNextSegment(_this.timer.CurrentTime())); });
	        var min = brushes.reduce(function (previousValue, currentValue, index, arr) { return previousValue.Size < currentValue.Size ? previousValue : currentValue; }).Size;
	        var max = brushes.reduce(function (previousValue, currentValue, index, arr) { return previousValue.Size > currentValue.Size ? previousValue : currentValue; }).Size;
	        this.drawer = !!settings.DrawingStrategy ? settings.DrawingStrategy : new SVGDrawer_1.default(true);
	        this.drawer.SetEvents(this.events);
	        this.dynaDraw = new DynaDraw_1.default(this.events, function () { return _this.drawer.CreatePath(_this.events); }, !settings.DisableDynamicLineWidth, min, max, this.timer);
	        this.ui = !!settings.UI ? settings.UI : new RecorderUI_1.default(id, this.events);
	        this.ui.Timer = this.timer;
	        this.ui.Localization = settings.Localization;
	        this.ui.SetBusyText(settings.Localization.Busy);
	        this.ui.CreateHTML(!!settings.Autohide, settings.ColorPallete, settings.BrushSizes);
	        var canvas = this.drawer.CreateCanvas();
	        this.ui.AcceptCanvas(canvas);
	        container.appendChild(this.ui.GetHTML());
	        this.drawer.Stretch();
	        this.pointer = PointingDevice_1.default.SelectBestMethod(this.events, this.ui.GetHTML(), canvas, this.timer);
	        if (!!settings.Audio) {
	            this.audioRecorder = new AudioRecorder_1.default(settings.Audio, this.events);
	            this.audioRecorder.Init();
	        }
	        this.ClearCanvas(Color_1.default.BackgroundColor);
	        this.events.trigger(VideoEvents_1.VideoEventType.ChangeColor, Color_1.default.ForegroundColor);
	        this.events.trigger(VideoEvents_1.VideoEventType.ChangeBrushSize, new Brush_1.default(5));
	    }
	    Object.defineProperty(Recorder.prototype, "Events", {
	        get: function () { return this.events; },
	        enumerable: true,
	        configurable: true
	    });
	    Recorder.prototype.Start = function () {
	        if (this.isRecording === false) {
	            this.isRecording = true;
	            this.PushChunk(new Chunk_1.VoidChunk(this.timer.CurrentTime(), this.lastEraseData));
	            this.timer.Resume();
	            if (this.audioRecorder) {
	                this.audioRecorder.Start();
	            }
	        }
	    };
	    Recorder.prototype.Pause = function () {
	        if (this.isRecording === true) {
	            this.isRecording = false;
	            this.PushChunk(new Chunk_1.VoidChunk(this.timer.CurrentTime(), this.lastEraseData));
	            this.timer.Pause();
	            if (this.audioRecorder) {
	                this.audioRecorder.Pause();
	            }
	        }
	    };
	    Recorder.prototype.StartUpload = function () {
	        var _this = this;
	        this.recordingBlocked = true;
	        var info = new Metadata_1.default();
	        info.Length = this.timer.CurrentTime();
	        info.Width = this.ui.Width;
	        info.Height = this.ui.Height;
	        info.AudioTracks = [];
	        this.data.Metadata = info;
	        if (!!this.audioRecorder
	            && this.audioRecorder.isRecording()) {
	            this.audioRecorder.Stop(function (files) {
	                _this.data.Metadata.AudioTracks = files;
	                _this.UploadData();
	            }, function () {
	                _this.FinishRecording(false);
	            });
	        }
	        else {
	            this.UploadData();
	        }
	    };
	    Recorder.prototype.ChangeBrushSize = function (size) {
	        !this.recordingBlocked && this.data.CurrentChunk.PushCommand(new Command_1.ChangeBrushSize(size, this.timer.CurrentTime()));
	        this.dynaDraw.SetBrushSize(size);
	    };
	    Recorder.prototype.ChangeColor = function (color) {
	        !this.recordingBlocked && this.data.CurrentChunk.PushCommand(new Command_1.ChangeBrushColor(color, this.timer.CurrentTime()));
	        this.drawer.SetCurrentColor(color);
	    };
	    Recorder.prototype.ProcessCursorState = function (state) {
	        !this.recordingBlocked
	            && (this.recordAllRawData || this.isRecording)
	            && this.data.CurrentChunk.PushCommand(new Command_1.MoveCursor(state.X, state.Y, this.recordAllRawData ? state.Pressure : 0, this.timer.CurrentTime()));
	        this.dynaDraw.ObserveCursorMovement(state);
	    };
	    Recorder.prototype.ClearCanvas = function (color) {
	        var time = this.timer.CurrentTime();
	        this.lastEraseData = this.PushChunk(new Chunk_1.EraseChunk(color, time, this.lastEraseData));
	        this.data.CurrentChunk.PushCommand(new Command_1.ClearCanvas(color, time));
	        this.drawer.ClearCanvas(color);
	    };
	    Recorder.prototype.PushChunk = function (chunk) {
	        return this.data.PushChunk(chunk);
	    };
	    Recorder.prototype.Busy = function () {
	        this.busyLevel++;
	        this.wasRecordingWhenBusy = this.wasRecordingWhenBusy || this.isRecording;
	        this.events.trigger(VideoEvents_1.VideoEventType.Pause);
	        this.ui.Busy();
	    };
	    Recorder.prototype.Ready = function () {
	        if (--this.busyLevel === 0) {
	            if (this.wasRecordingWhenBusy === true) {
	                this.events.trigger(VideoEvents_1.VideoEventType.Start);
	                this.wasRecordingWhenBusy = false;
	            }
	            this.ui.Ready();
	        }
	    };
	    Recorder.prototype.UploadData = function () {
	        var _this = this;
	        var writer = !!this.settings.VideoFormat ? this.settings.VideoFormat : new IO_1.default();
	        var videoBlob = writer.SaveVideo(this.data);
	        console.log(videoBlob);
	        this.events.on(VideoEvents_1.VideoEventType.DownloadData, function () {
	            File_1.default.Download(videoBlob, "recorded-animation." + writer.GetExtension());
	        });
	        this.ui.SetBusyText(this.settings.Localization.UploadInProgress);
	        this.events.trigger(VideoEvents_1.VideoEventType.Busy);
	        var formData = new FormData();
	        formData.append("extension", writer.GetExtension());
	        formData.append("file", videoBlob);
	        var req = new XMLHttpRequest();
	        req.open("POST", this.settings.UploadURL, true);
	        req.onerror = function (e) { return _this.FinishRecording(false); };
	        req.onload = function (e) {
	            var response = JSON.parse(req.response);
	            if (req.status === 200
	                && response.hasOwnProperty("success")
	                && response.success === true) {
	                var url = response.hasOwnProperty("redirect") ? response.redirect : false;
	                _this.FinishRecording(true, url);
	            }
	            else {
	                _this.FinishRecording(false);
	            }
	        };
	        req.send(formData);
	    };
	    Recorder.prototype.FinishRecording = function (success, url) {
	        if (success === true) {
	            this.ui.SetBusyText(this.settings.Localization.UploadWasSuccessful);
	            if (typeof url === "string") {
	                if (confirm(this.settings.Localization.RedirectPrompt)) {
	                    window.location.replace(url);
	                }
	            }
	            else {
	                alert(this.settings.Localization.UploadWasSuccessful);
	            }
	        }
	        else {
	            this.ui.SetBusyText(this.settings.Localization.UploadFailure);
	            if (confirm(this.settings.Localization.FailureApology)) {
	                this.events.trigger(VideoEvents_1.VideoEventType.DownloadData);
	            }
	        }
	    };
	    return Recorder;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Recorder;


/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */,
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var VideoEvents_1 = __webpack_require__(7);
	var State_1 = __webpack_require__(25);
	var WacomTablet_1 = __webpack_require__(36);
	var Pointer_1 = __webpack_require__(38);
	var AppleForceTouch_1 = __webpack_require__(39);
	var Touch_1 = __webpack_require__(40);
	var PointingDevice = (function () {
	    function PointingDevice(events, board, timer) {
	        this.events = events;
	        this.board = board;
	        this.timer = timer;
	        this.isHoveringOverUIControl = false;
	    }
	    PointingDevice.SelectBestMethod = function (events, board, canvas, timer) {
	        var device;
	        var wacomApi = WacomTablet_1.default.IsAvailable();
	        if (wacomApi !== null) {
	            device = new WacomTablet_1.default(events, board, timer, wacomApi);
	            console.log("Wacom WebPAPI is used");
	        }
	        else if (window.hasOwnProperty("PointerEvent")) {
	            device = new Pointer_1.default(events, board, timer);
	            console.log("Pointer Events API is used");
	        }
	        else if (AppleForceTouch_1.default.isAvailable()) {
	            device = new AppleForceTouch_1.default(events, board, canvas, timer);
	            console.log("Apple Force Touch Events over Touch Events API is used");
	        }
	        else {
	            device = new Touch_1.default(events, board, canvas, timer);
	            console.log("Touch Events API are used.");
	        }
	        device.InitControlsAvoiding();
	        return device;
	    };
	    PointingDevice.prototype.getCursor = function () { return this.cursor; };
	    PointingDevice.prototype.InitControlsAvoiding = function () {
	        var _this = this;
	        var controls = document.getElementsByClassName("ui-control-panel");
	        for (var i = 0; i < controls.length; i++) {
	            var element = controls[i];
	            element.onmouseover = function (e) { return _this.isHoveringOverUIControl = true; };
	            element.onmouseout = function (e) { return _this.isHoveringOverUIControl = false; };
	        }
	    };
	    PointingDevice.prototype.GetPressure = function () {
	        return (this.isDown === true && this.isInside === true) ? 1 : 0;
	    };
	    PointingDevice.prototype.onMove = function (e) {
	        this.cursor = this.getCursorPosition(e);
	        this.ReportAction();
	    };
	    PointingDevice.prototype.onDown = function (e) {
	        if (this.isHoveringOverUIControl === false) {
	            this.isDown = true;
	            this.cursor = this.getCursorPosition(e);
	            this.ReportAction();
	        }
	    };
	    PointingDevice.prototype.onUp = function (e) {
	        this.isDown = false;
	        this.cursor = this.getCursorPosition(e);
	        this.ReportAction();
	    };
	    PointingDevice.prototype.onLeave = function (e) {
	        if (this.GetPressure() > 0) {
	            this.onMove(e);
	            this.isDown = false;
	            this.onMove(e);
	            this.isDown = true;
	        }
	        this.isInside = false;
	    };
	    PointingDevice.prototype.onOver = function (e) {
	        this.isInside = true;
	    };
	    PointingDevice.prototype.onLooseFocus = function (e) {
	        this.isInside = false;
	        this.isDown = false;
	    };
	    PointingDevice.prototype.getCursorPosition = function (e) {
	        if (e.clientX == undefined || e.clientY == undefined) {
	            console.log("Wrong 'getCursorPosition' parameter. Event data required.");
	        }
	        return {
	            x: e.clientX,
	            y: e.clientY
	        };
	    };
	    PointingDevice.prototype.ReportAction = function () {
	        var state = new State_1.CursorState(this.timer.CurrentTime(), this.cursor.x, this.cursor.y, this.GetPressure());
	        this.events.trigger(VideoEvents_1.VideoEventType.CursorState, state);
	    };
	    return PointingDevice;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = PointingDevice;


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Mouse_1 = __webpack_require__(37);
	var HTML_1 = __webpack_require__(9);
	var WacomPointerType;
	(function (WacomPointerType) {
	    WacomPointerType[WacomPointerType["OutOfProximity"] = 0] = "OutOfProximity";
	    WacomPointerType[WacomPointerType["Pen"] = 1] = "Pen";
	    WacomPointerType[WacomPointerType["Mouse"] = 2] = "Mouse";
	    WacomPointerType[WacomPointerType["Eraseer"] = 3] = "Eraseer";
	})(WacomPointerType || (WacomPointerType = {}));
	var WacomTablet = (function (_super) {
	    __extends(WacomTablet, _super);
	    function WacomTablet(events, board, timer, penApi) {
	        _super.call(this, events, board, timer);
	        this.penApi = penApi;
	    }
	    WacomTablet.Factory = function (api) {
	        return function (events, board, timer) { return new WacomTablet(events, board, timer, api); };
	    };
	    WacomTablet.prototype.GetPressure = function () {
	        if (this.isDown === false || this.isInside === false) {
	            return 0;
	        }
	        if (this.penApi && this.penApi.pointerType == WacomPointerType.Pen) {
	            return this.isInside === true ? this.penApi.pressure : 0;
	        }
	        else {
	            return _super.prototype.GetPressure.call(this);
	        }
	    };
	    WacomTablet.IsAvailable = function () {
	        var plugin = HTML_1.default.CreateElement("object", { type: "application/x-wacomtabletplugin" });
	        document.body.appendChild(plugin);
	        if (!!plugin.version === true) {
	            console.log("Wacom tablet is connected and plugin installed. Plugin version is " + plugin.version + ".");
	            return plugin.penAPI;
	        }
	        return null;
	    };
	    return WacomTablet;
	})(Mouse_1.default);
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = WacomTablet;


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var PointingDevice_1 = __webpack_require__(35);
	var Mouse = (function (_super) {
	    __extends(Mouse, _super);
	    function Mouse(events, board, timer) {
	        var _this = this;
	        _super.call(this, events, board, timer);
	        this.board.onmousemove = function (e) { return _this.onMouseMove(e); };
	        this.board.onmousedown = function (e) { return _this.onMouseDown(e); };
	        this.board.onmouseup = function (e) { return _this.onMouseUp(e); };
	        this.board.onmouseleave = function (e) { return _this.onMouseLeave(e); };
	        this.board.onmouseenter = function (e) { return _this.onMouseEnter(e); };
	        this.board.onmouseover = function (e) { return _this.onMouseOver(e); };
	    }
	    Mouse.prototype.InitControlsAvoiding = function () {
	        var _this = this;
	        var controls = document.getElementsByClassName("ui-control");
	        for (var i = 0; i < controls.length; i++) {
	            var element = controls[i];
	            element.onmouseover = function (e) { return _this.isHoveringOverUIControl = true; };
	            element.onmouseout = function (e) { return _this.isHoveringOverUIControl = false; };
	        }
	    };
	    Mouse.prototype.onMouseMove = function (e) {
	        this.onMove(e);
	    };
	    Mouse.prototype.onMouseDown = function (e) {
	        this.onDown(e);
	    };
	    Mouse.prototype.onMouseUp = function (e) {
	        this.onUp(e);
	    };
	    Mouse.prototype.onMouseLeave = function (e) {
	        this.onLeave(e);
	    };
	    Mouse.prototype.onMouseEnter = function (e) {
	        if (e.buttons === 0) {
	            this.isDown = false;
	        }
	    };
	    Mouse.prototype.onMouseOver = function (e) {
	        this.isInside = true;
	    };
	    return Mouse;
	})(PointingDevice_1.default);
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Mouse;


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var PointingDevice_1 = __webpack_require__(35);
	var PointerEventsAPI = (function (_super) {
	    __extends(PointerEventsAPI, _super);
	    function PointerEventsAPI(events, board, timer) {
	        var _this = this;
	        _super.call(this, events, board, timer);
	        this.board.addEventListener("pointermove", function (e) { return _this.onPointerMove(e); });
	        this.board.addEventListener("pointerdown", function (e) { return _this.onPointerDown(e); });
	        this.board.addEventListener("pointerup", function (e) { return _this.onPointerUp(e); });
	        this.board.addEventListener("pointerleave", function (e) { return _this.onPointerLeave(e); });
	        this.board.addEventListener("pointerenter", function (e) { return _this.onPointerLeave(e); });
	        this.board.addEventListener("pointerover", function (e) { return _this.onPointerOver(e); });
	        this.currentEvent = null;
	        this.isDown = false;
	    }
	    PointerEventsAPI.prototype.GetPressure = function () {
	        if (this.isDown === false || this.currentEvent === null) {
	            return 0;
	        }
	        if (this.currentEvent.pointerType === "pen") {
	            return this.currentEvent.pressure;
	        }
	        return 1;
	    };
	    PointerEventsAPI.prototype.InitControlsAvoiding = function () {
	        var _this = this;
	        var controls = document.getElementsByClassName("ui-control");
	        for (var i = 0; i < controls.length; i++) {
	            var element = controls[i];
	            element.onpointerover = function (e) { return _this.isHoveringOverUIControl = true; };
	            element.onpointerout = function (e) { return _this.isHoveringOverUIControl = false; };
	        }
	    };
	    PointerEventsAPI.prototype.onPointerMove = function (e) {
	        this.onMove(e);
	        this.currentEvent = e;
	    };
	    PointerEventsAPI.prototype.onPointerDown = function (e) {
	        this.onDown(e);
	        this.currentEvent = e;
	    };
	    PointerEventsAPI.prototype.onPointerUp = function (e) {
	        this.onUp(e);
	        this.currentEvent = e;
	    };
	    PointerEventsAPI.prototype.onPointerLeave = function (e) {
	        this.onLeave(e);
	        this.currentEvent = e;
	    };
	    PointerEventsAPI.prototype.onPointerEnter = function (e) {
	        if (e.buttons === 0) {
	            this.isDown = false;
	        }
	        this.currentEvent = e;
	    };
	    PointerEventsAPI.prototype.onPointerOver = function (e) {
	        this.isInside = true;
	        this.currentEvent = e;
	    };
	    return PointerEventsAPI;
	})(PointingDevice_1.default);
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = PointerEventsAPI;


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Touch_1 = __webpack_require__(40);
	var AppleForceTouch = (function (_super) {
	    __extends(AppleForceTouch, _super);
	    function AppleForceTouch(events, board, canvas, timer) {
	        var _this = this;
	        _super.call(this, events, board, canvas, timer);
	        this.board.onmousemove = function (e) { return _this.checkForce(e.webkitForce); };
	        this.forceLevel = 0;
	    }
	    AppleForceTouch.isAvailable = function () {
	        return "WEBKIT_FORCE_AT_FORCE_MOUSE_DOWN" in MouseEvent;
	    };
	    AppleForceTouch.prototype.GetPressure = function () {
	        return this.forceLevel;
	    };
	    AppleForceTouch.prototype.checkForce = function (webkitForce) {
	        this.forceLevel = Math.min(1, webkitForce);
	    };
	    return AppleForceTouch;
	})(Touch_1.default);
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = AppleForceTouch;


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Mouse_1 = __webpack_require__(37);
	var TouchEventsAPI = (function (_super) {
	    __extends(TouchEventsAPI, _super);
	    function TouchEventsAPI(events, container, canvas, timer) {
	        var _this = this;
	        _super.call(this, events, container, timer);
	        this.canvas = canvas;
	        canvas.addEventListener("touchstart", function (ev) { return _this.TouchStart(ev); });
	        canvas.addEventListener("touchend", function (ev) { return _this.TouchEnd(ev); });
	        canvas.addEventListener("touchcancel", function (ev) { return _this.TouchEnd(ev); });
	        canvas.addEventListener("touchleave", function (ev) { return _this.TouchLeave(ev); });
	        canvas.addEventListener("touchmove", function (ev) { return _this.TouchMove(ev); });
	    }
	    TouchEventsAPI.prototype.TouchStart = function (event) {
	        event.preventDefault();
	        var touches = event.changedTouches;
	        var touch = touches[0];
	        this.currentTouch = touch.identifier;
	        this.isInside = true;
	        this.isHoveringOverUIControl = false;
	        this.onMouseDown(touch);
	    };
	    TouchEventsAPI.prototype.TouchLeave = function (event) {
	        event.preventDefault();
	        var touch = this.filterTouch(event.changedTouches);
	        if (touch === null) {
	            return;
	        }
	        this.onMouseLeave(touch);
	    };
	    TouchEventsAPI.prototype.TouchEnd = function (event) {
	        var touch = this.filterTouch(event.changedTouches);
	        if (touch === null) {
	            return;
	        }
	        this.onMouseUp(touch);
	        this.currentTouch = null;
	    };
	    TouchEventsAPI.prototype.TouchMove = function (event) {
	        event.preventDefault();
	        var touch = this.filterTouch(event.changedTouches);
	        if (touch === null) {
	            return;
	        }
	        this.onMouseMove(touch);
	    };
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
	})(Mouse_1.default);
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = TouchEventsAPI;


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var Vector_1 = __webpack_require__(15);
	var VideoEvents_1 = __webpack_require__(7);
	var DynaDraw = (function () {
	    function DynaDraw(events, pathFactory, slowSimulation, minBrushSize, maxBrushSize, timer) {
	        var _this = this;
	        this.events = events;
	        this.pathFactory = pathFactory;
	        this.slowSimulation = slowSimulation;
	        this.minBrushSize = minBrushSize;
	        this.maxBrushSize = maxBrushSize;
	        this.minMass = 1;
	        this.maxMass = 10;
	        this.minFriction = 0.4;
	        this.maxFriction = 0.6;
	        this.brushes = {};
	        this.oneFrame = 1000 / 60;
	        this.cursor = new BrushTip(true, timer);
	        if (slowSimulation === true) {
	            requestAnimationFrame(function (time) {
	                _this.lastAnimationTime = time;
	                _this.Tick(time);
	            });
	        }
	        else {
	            requestAnimationFrame(function () { return _this.TickWhile(); });
	        }
	    }
	    DynaDraw.prototype.SetBrushSize = function (size) {
	        this.currentBrushSize = size;
	    };
	    DynaDraw.prototype.interpolateMass = function (brushSize) {
	        return this.minMass + (this.maxMass - this.minMass) * (brushSize - this.minBrushSize) / (this.maxBrushSize - this.minBrushSize);
	    };
	    DynaDraw.prototype.interpolateFriction = function (brushSize) {
	        return this.maxFriction - (this.maxFriction - this.minFriction) * (brushSize - this.minBrushSize) / (this.maxBrushSize - this.minBrushSize);
	    };
	    DynaDraw.prototype.GetBrush = function (brushSize) {
	        if (!this.brushes[brushSize]) {
	            this.brushes[brushSize] = new BrushInstance(this.interpolateMass(brushSize), this.interpolateFriction(brushSize), brushSize);
	        }
	        return this.brushes[brushSize];
	    };
	    DynaDraw.prototype.ObserveCursorMovement = function (cursor) {
	        try {
	            var nextPoint = new Vector_1.default(cursor.X, cursor.Y);
	            if (cursor.Pressure > 0) {
	                if (!this.lastState || this.lastState.Pressure === 0) {
	                    this.path = this.pathFactory();
	                    this.events.trigger(VideoEvents_1.VideoEventType.StartPath, this.path);
	                    this.StartPath(nextPoint, cursor.Pressure);
	                }
	                else {
	                    this.NextPoint(nextPoint, cursor.Pressure);
	                }
	            }
	            else if (this.lastState && this.lastState.Pressure > 0) {
	                this.EndPath(nextPoint, this.lastState.Pressure);
	            }
	        }
	        catch (err) {
	            console.log("ProcessNewState error: ", err);
	        }
	        this.lastState = cursor;
	    };
	    DynaDraw.prototype.StartPath = function (position, pressure) {
	        this.cursor.Reset(position, this.GetBrush(this.currentBrushSize.Size));
	        this.position = position;
	        this.pressure = pressure;
	        this.cursor.StartPath(this.path, position, pressure);
	    };
	    DynaDraw.prototype.NextPoint = function (position, pressure) {
	        this.position = position;
	        this.pressure = pressure;
	    };
	    DynaDraw.prototype.EndPath = function (position, pressure) {
	        this.position = position;
	    };
	    DynaDraw.prototype.TickWhile = function () {
	        var _this = this;
	        if (!!this.position) {
	            var d2 = 0;
	            var step = 0;
	            do {
	                d2 = this.cursor.ApplyForce(this.position);
	                step += d2;
	                if (step > this.currentBrushSize.Size) {
	                    this.cursor.Draw(this.path, this.pressure);
	                    step = 0;
	                }
	            } while (d2 > 0);
	            if (step > 0) {
	                this.cursor.Draw(this.path, this.pressure);
	            }
	            this.position = null;
	        }
	        requestAnimationFrame(function (time) { return _this.TickWhile(); });
	    };
	    DynaDraw.prototype.Tick = function (time) {
	        var _this = this;
	        if (!!this.path) {
	            if (this.cursor.ApplyForce(this.position) > 0) {
	                this.cursor.Draw(this.path, this.pressure);
	            }
	            else {
	                if (!this.position) {
	                    this.path = null;
	                }
	            }
	        }
	        this.lastAnimationTime = time;
	        requestAnimationFrame(function (time) { return _this.Tick(time); });
	    };
	    return DynaDraw;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = DynaDraw;
	var BrushInstance = (function () {
	    function BrushInstance(mass, friction, size) {
	        this.mass = mass;
	        this.friction = friction;
	        this.size = size;
	    }
	    Object.defineProperty(BrushInstance.prototype, "Mass", {
	        get: function () { return this.mass; },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(BrushInstance.prototype, "Friction", {
	        get: function () { return this.friction; },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(BrushInstance.prototype, "Size", {
	        get: function () { return this.size; },
	        enumerable: true,
	        configurable: true
	    });
	    return BrushInstance;
	})();
	var Threshold;
	(function (Threshold) {
	    Threshold[Threshold["Velocity"] = 1] = "Velocity";
	})(Threshold || (Threshold = {}));
	var BrushTip = (function () {
	    function BrushTip(calculateSpeed, timer) {
	        this.calculateSpeed = calculateSpeed;
	        this.timer = timer;
	    }
	    BrushTip.prototype.Reset = function (position, brush) {
	        this.brush = brush;
	        this.position = position.clone();
	        this.startPosition = position.clone();
	        this.previousPosition = position.clone();
	        this.previousPressure = -1;
	        this.mousePosition = position.clone();
	        this.acceleration = new Vector_1.default(0, 0);
	        this.velocity = new Vector_1.default(0, 0);
	        this.firstSegment = true;
	    };
	    BrushTip.prototype.ApplyForce = function (mouse) {
	        if (mouse !== null) {
	            var force = mouse.clone().subtract(this.position);
	            this.acceleration = force.clone().scale(1 / this.brush.Mass);
	            this.velocity.add(this.acceleration);
	            this.mousePosition = mouse;
	        }
	        this.velocity.scale(1 - this.brush.Friction);
	        if (this.velocity.getSizeSq() < 1) {
	            return 0;
	        }
	        mouse = null;
	        force = null;
	        this.acceleration = null;
	        this.angle = this.velocity.getNormal();
	        this.position.add(this.velocity);
	        return this.velocity.getSizeSq();
	    };
	    BrushTip.prototype.Draw = function (path, pressure) {
	        var relativeSpeed = this.calculateSpeed === true ? this.velocity.getSize() / (this.brush.Size * this.brush.Size) : 0;
	        var width = this.getRadius(pressure, relativeSpeed);
	        this.angle.scale(width);
	        if (this.firstSegment) {
	            path.InitPath(this.startPosition.clone().add(this.angle), this.startPosition.clone().subtract(this.angle));
	            this.firstSegment = false;
	        }
	        path.ExtendPath(this.position.clone().add(this.angle), this.position.clone().subtract(this.angle));
	        path.Draw();
	    };
	    BrushTip.prototype.StartPath = function (path, pt, pressure) {
	        path.StartPath(pt, this.getRadius(pressure, 0));
	    };
	    BrushTip.prototype.getRadius = function (pressure, speed) {
	        if (this.previousPressure < 0)
	            this.previousPressure = pressure;
	        var interpolatedPressure = this.interpolatePressure(pressure);
	        var radius = this.speedFactor(speed) * this.brush.Size * interpolatedPressure / 2;
	        this.previousPosition = this.position.clone();
	        this.previousPressure = interpolatedPressure;
	        return radius;
	    };
	    BrushTip.prototype.interpolatePressure = function (mousePressure) {
	        var d1 = this.position.distanceTo(this.previousPosition);
	        var d2 = this.position.distanceTo(this.mousePosition);
	        if (d1 === 0 && d2 === 0) {
	            return mousePressure;
	        }
	        return (d1 / (d1 + d2)) * (mousePressure - this.previousPressure) + this.previousPressure;
	    };
	    BrushTip.prototype.speedFactor = function (speed) {
	        return Math.max(1 - speed, 0.4);
	    };
	    BrushTip.threshold = 0.001;
	    return BrushTip;
	})();


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var SVG_1 = __webpack_require__(16);
	var VideoEvents_1 = __webpack_require__(7);
	var Vector_1 = __webpack_require__(15);
	var Path_1 = __webpack_require__(21);
	var SVGDrawer = (function () {
	    function SVGDrawer(curved) {
	        if (curved === void 0) { curved = true; }
	        this.curved = curved;
	    }
	    SVGDrawer.prototype.SetEvents = function (events) {
	        this.events = events;
	    };
	    SVGDrawer.prototype.CreateCanvas = function () {
	        this.svg = SVG_1.default.CreateElement("svg");
	        var backgroundLayer = SVG_1.default.CreateElement("g");
	        this.bg = SVG_1.default.CreateElement("rect", {
	            id: "background"
	        });
	        backgroundLayer.appendChild(this.bg);
	        this.svg.appendChild(backgroundLayer);
	        this.canvas = SVG_1.default.CreateElement("g", {
	            id: "canvas"
	        });
	        this.svg.appendChild(this.canvas);
	        return this.svg;
	    };
	    SVGDrawer.prototype.Stretch = function () {
	        var parent = this.svg.parentElement;
	        var width = parent.clientWidth;
	        var height = parent.clientHeight;
	        SVG_1.default.SetAttributes(this.svg, {
	            width: width,
	            height: height
	        });
	        SVG_1.default.SetAttributes(this.bg, {
	            width: width,
	            height: height
	        });
	        this.events.trigger(VideoEvents_1.VideoEventType.CanvasSize, width, height);
	    };
	    SVGDrawer.prototype.ClearCanvas = function (color) {
	        while (!!this.canvas.firstChild) {
	            this.canvas.removeChild(this.canvas.firstChild);
	        }
	        SVG_1.default.SetAttributes(this.bg, { fill: color.CssValue });
	    };
	    SVGDrawer.prototype.SetCurrentColor = function (color) {
	        this.currentColor = color;
	    };
	    SVGDrawer.prototype.CreatePath = function (events) {
	        return new Path_1.SvgPath(events, this.curved, this.currentColor.CssValue, this.canvas);
	    };
	    SVGDrawer.prototype.SetupOutputCorrection = function (sourceWidth, sourceHeight) {
	        var wr = this.svg.clientWidth / sourceWidth;
	        var hr = this.svg.clientHeight / sourceHeight;
	        var min = Math.min(wr, hr);
	        SVG_1.default.SetAttributes(this.svg, {
	            "viewBox": "0 0 " + sourceWidth + " " + sourceHeight
	        });
	        if (min === wr) {
	            this.events.trigger(VideoEvents_1.VideoEventType.CursorOffset, new Vector_1.default(0, (this.svg.clientHeight - sourceHeight * min) / 2));
	        }
	        else {
	            this.events.trigger(VideoEvents_1.VideoEventType.CursorOffset, new Vector_1.default((this.svg.clientWidth - sourceWidth * min) / 2, 0));
	        }
	        return min;
	    };
	    return SVGDrawer;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = SVGDrawer;


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="audio.d.ts" />
	var VideoEvents_1 = __webpack_require__(7);
	var Errors_1 = __webpack_require__(8);
	var AudioPlayer_1 = __webpack_require__(6);
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


/***/ },
/* 44 */
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
	var Buttons_1 = __webpack_require__(45);
	var Board_1 = __webpack_require__(13);
	var Color_1 = __webpack_require__(17);
	var RecorderUI = (function (_super) {
	    __extends(RecorderUI, _super);
	    function RecorderUI(id, events) {
	        _super.call(this, "div", id + "-recorder");
	        this.id = id;
	        this.events = events;
	        this.tickingInterval = 100;
	        this.AddClass("vector-video-wrapper");
	        this.isRecording = false;
	        this.isBusy = false;
	        this.micIsMuted = false;
	    }
	    Object.defineProperty(RecorderUI.prototype, "Width", {
	        get: function () {
	            return this.board.Width;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(RecorderUI.prototype, "Height", {
	        get: function () {
	            return this.board.Height;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(RecorderUI.prototype, "BackgroundColor", {
	        get: function () {
	            return Color_1.default.BackgroundColor.CssValue;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    RecorderUI.prototype.CreateHTML = function (autohide, colorPallete, brushSizes) {
	        this.board = this.CreateBoard();
	        this.controls = new BasicElements_1.Panel("div", this.id + "-controls")
	            .AddChildren(this.CreateButtonsPanel().AddClass("ui-controls-panel"), this.CreateColorsPanel(colorPallete).AddClass("ui-controls-panel"), this.CreateBrushSizesPanel(brushSizes).AddClass("ui-controls-panel"), this.CreateEraserPanel().AddClass("ui-controls-panel"), this.CreateEraseAllPanel().AddClass("ui-controls-panel"), this.CreateMicPanel().AddClass("ui-controls-panel"))
	            .AddClasses("ui-controls", "ui-control");
	        !!autohide && this.controls.AddClass("autohide");
	        this.AddChildren(this.board, new BasicElements_1.Panel("div").AddClass("ui-controls-wrapper")
	            .AddChild(this.controls));
	    };
	    RecorderUI.prototype.Busy = function () {
	        this.AddClass("busy");
	        this.isBusy = true;
	    };
	    RecorderUI.prototype.Ready = function () {
	        this.RemoveClass("busy");
	        this.isBusy = false;
	    };
	    RecorderUI.prototype.SetBusyText = function (text) {
	        HTML_1.default.SetAttributes(this.GetHTML(), { "data-busy-string": text });
	    };
	    RecorderUI.prototype.AcceptCanvas = function (canvas) {
	        this.board.GetHTML().appendChild(canvas);
	    };
	    RecorderUI.prototype.CreateBoard = function () {
	        var board = new Board_1.default(this.id + "-board", this.events);
	        return board;
	    };
	    RecorderUI.prototype.CreateButtonsPanel = function () {
	        var _this = this;
	        var buttonsPanel = new BasicElements_1.Panel("div", this.id + "-panels");
	        this.recPauseButton = new BasicElements_1.IconButton("icon-rec", this.Localization.Record, function (e) { return _this.RecordPause(); });
	        this.uploadButton = new BasicElements_1.IconButton("icon-upload", this.Localization.Upload, function (e) { return _this.InitializeUpload(); });
	        HTML_1.default.SetAttributes(this.uploadButton.GetHTML(), { "disabled": "disabled" });
	        buttonsPanel.AddChildren(new BasicElements_1.H2(this.Localization.RecPause), new BasicElements_1.Panel("div").AddClass("btn-group")
	            .AddChildren(this.recPauseButton, this.uploadButton));
	        return buttonsPanel;
	    };
	    RecorderUI.prototype.RecordPause = function () {
	        if (this.isRecording === true) {
	            this.PauseRecording();
	            this.uploadButton.GetHTML().removeAttribute("disabled");
	            this.RemoveClass("recording");
	        }
	        else {
	            this.StartRecording();
	            HTML_1.default.SetAttributes(this.uploadButton.GetHTML(), { "disabled": "disabled" });
	            this.AddClass("recording");
	        }
	    };
	    RecorderUI.prototype.StartRecording = function () {
	        var _this = this;
	        if (this.isRecording === false) {
	            this.isRecording = true;
	            this.recPauseButton.ChangeIcon("icon-pause");
	            this.board.IsRecording = true;
	            this.ticking = setInterval(function () { return _this.Tick(); }, this.tickingInterval);
	            this.events.trigger(VideoEvents_1.VideoEventType.Start);
	        }
	    };
	    RecorderUI.prototype.PauseRecording = function () {
	        if (this.isRecording === true) {
	            this.isRecording = false;
	            this.recPauseButton.ChangeIcon("icon-rec");
	            this.board.IsRecording = false;
	            clearInterval(this.ticking);
	            this.events.trigger(VideoEvents_1.VideoEventType.Pause);
	        }
	    };
	    RecorderUI.prototype.Tick = function () {
	        this.recPauseButton.ChangeContent(HelperFunctions_1.millisecondsToString(this.Timer.CurrentTime()));
	    };
	    RecorderUI.prototype.InitializeUpload = function () {
	        HTML_1.default.SetAttributes(this.recPauseButton.GetHTML(), { "disabled": "disabled" });
	        HTML_1.default.SetAttributes(this.uploadButton.GetHTML(), { "disabled": "disabled" });
	        this.events.trigger(VideoEvents_1.VideoEventType.StartUpload);
	    };
	    RecorderUI.prototype.CreateColorsPanel = function (colorPallete) {
	        var colorsGroup = new BasicElements_1.Panel("div").AddClass("btn-group");
	        for (var i = 0; i < colorPallete.length; i++) {
	            var btn = new Buttons_1.ChangeColorButton(this.events, colorPallete[i]);
	            colorsGroup.AddChild(btn);
	        }
	        return new BasicElements_1.Panel("div")
	            .AddClass("color-pallete")
	            .AddChildren(new BasicElements_1.H2(this.Localization.ChangeColor), colorsGroup);
	    };
	    RecorderUI.prototype.CreateBrushSizesPanel = function (brushSizes) {
	        var sizesGroup = new BasicElements_1.Panel("div").AddClass("btn-group");
	        for (var i = 0; i < brushSizes.length; i++) {
	            sizesGroup.AddChild(new Buttons_1.ChangeBrushSizeButton(this.events, brushSizes[i]));
	        }
	        return new BasicElements_1.Panel("div")
	            .AddClass("brush-sizes")
	            .AddChildren(new BasicElements_1.H2(this.Localization.ChangeSize), sizesGroup);
	    };
	    RecorderUI.prototype.CreateEraserPanel = function () {
	        this.switchToEraserButton = new Buttons_1.ChangeColorButton(this.events, Color_1.default.BackgroundColor);
	        return new BasicElements_1.Panel("div", this.id + "-erase")
	            .AddChildren(new BasicElements_1.H2(this.Localization.Erase), this.switchToEraserButton);
	    };
	    RecorderUI.prototype.CreateEraseAllPanel = function () {
	        var _this = this;
	        var panel = new BasicElements_1.Panel("div", this.id + "-erase");
	        var title = new BasicElements_1.H2(this.Localization.EraseAll);
	        panel.AddChild(title);
	        this.eraseAllButton = new Buttons_1.ChangeColorButton(this.events, Color_1.default.BackgroundColor, function () { return _this.EraseAll(); });
	        this.events.on(VideoEvents_1.VideoEventType.ChangeColor, function (color) {
	            _this.currentColor = color;
	            _this.eraseAllButton.SetColor(color);
	        });
	        panel.AddChild(this.eraseAllButton);
	        return panel;
	    };
	    RecorderUI.prototype.EraseAll = function () {
	        this.events.trigger(VideoEvents_1.VideoEventType.ClearCanvas, this.currentColor);
	        this.switchToEraserButton.SetColor(this.currentColor);
	    };
	    RecorderUI.prototype.CreateMicPanel = function () {
	        var _this = this;
	        this.micButton = new BasicElements_1.IconOnlyButton("icon-mic-off", this.Localization.AudioRecordingUnavailable, function () { return _this.MuteMic(); });
	        HTML_1.default.SetAttributes(this.micButton.GetHTML(), { disabled: "disabled" });
	        this.events.on(VideoEvents_1.VideoEventType.AudioRecordingAvailable, function () {
	            _this.micButton.GetHTML().removeAttribute("disabled");
	            if (!_this.micIsMuted) {
	                _this.micButton.ChangeIcon("icon-mic").ChangeContent(_this.Localization.AudioRecordingAvailable);
	            }
	        });
	        this.events.on(VideoEvents_1.VideoEventType.AudioRecordingUnavailable, function () {
	            _this.micButton.ChangeIcon("icon-mic-off").ChangeContent(_this.Localization.AudioRecordingUnavailable);
	            HTML_1.default.SetAttributes(_this.micButton.GetHTML(), { disabled: "disabled" });
	        });
	        return new BasicElements_1.Panel("div").AddChildren(new BasicElements_1.H2(this.Localization.AudioRecording), this.micButton);
	    };
	    RecorderUI.prototype.MuteMic = function () {
	        this.events.trigger(VideoEvents_1.VideoEventType.MuteAudioRecording);
	        this.micIsMuted = !this.micIsMuted;
	        if (this.micIsMuted) {
	            this.micButton.ChangeIcon("icon-mic-off");
	        }
	        else {
	            this.micButton.ChangeIcon("icon-mic");
	        }
	    };
	    return RecorderUI;
	})(BasicElements_1.Panel);
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = RecorderUI;


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var BasicElements_1 = __webpack_require__(12);
	var VideoEvents_1 = __webpack_require__(7);
	var HTML_1 = __webpack_require__(9);
	var ChangeColorButton = (function (_super) {
	    __extends(ChangeColorButton, _super);
	    function ChangeColorButton(events, color, callback) {
	        var _this = this;
	        _super.call(this, "");
	        this.events = events;
	        this.SetColor(color);
	        this.GetHTML().onclick = function (e) { return !!callback ? callback() : _this.ChangeColor(e); };
	    }
	    ChangeColorButton.prototype.ChangeColor = function (e) {
	        if (!!ChangeColorButton.active) {
	            ChangeColorButton.active.GetHTML().classList.remove("active");
	        }
	        this.GetHTML().classList.add("active");
	        ChangeColorButton.active = this;
	        this.events.trigger(VideoEvents_1.VideoEventType.ChangeColor, this.color);
	    };
	    ChangeColorButton.prototype.SetColor = function (color) {
	        this.color = color;
	        HTML_1.default.SetAttributes(this.GetHTML(), {
	            class: "option",
	            "data-color": color.CssValue,
	            style: "background-color: " + color.CssValue
	        });
	    };
	    return ChangeColorButton;
	})(BasicElements_1.Button);
	exports.ChangeColorButton = ChangeColorButton;
	var ChangeBrushSizeButton = (function (_super) {
	    __extends(ChangeBrushSizeButton, _super);
	    function ChangeBrushSizeButton(events, size) {
	        var _this = this;
	        _super.call(this, "");
	        this.events = events;
	        this.size = size;
	        var dot = HTML_1.default.CreateElement("span", {
	            style: "width: " + size.CssValue + ";\t\n\t\t\t\t\t\theight: " + size.CssValue + ";\n\t\t\t\t\t\tborder-radius: " + size.Size / 2 + size.Unit + "; \n\t\t\t\t\t\tdisplay: inline-block;\n\t\t\t\t\t\tbackground: black;\n\t\t\t\t\t\tmargin-top: " + -size.Size / 2 + size.Unit + ";",
	            class: "dot",
	            "data-size": size.Size
	        });
	        this.GetHTML().appendChild(dot);
	        HTML_1.default.SetAttributes(this.GetHTML(), {
	            class: "option",
	            "data-size": size.Size
	        });
	        this.GetHTML().onclick = function (e) { return _this.ChangeSize(e); };
	    }
	    ChangeBrushSizeButton.prototype.ChangeSize = function (e) {
	        e.preventDefault();
	        if (!!ChangeBrushSizeButton.active) {
	            ChangeBrushSizeButton.active.GetHTML().classList.remove("active");
	        }
	        this.GetHTML().classList.add("active");
	        ChangeBrushSizeButton.active = this;
	        this.events.trigger(VideoEvents_1.VideoEventType.ChangeBrushSize, this.size);
	    };
	    return ChangeBrushSizeButton;
	})(BasicElements_1.Button);
	exports.ChangeBrushSizeButton = ChangeBrushSizeButton;


/***/ }
]);
//# sourceMappingURL=recorder.js.map