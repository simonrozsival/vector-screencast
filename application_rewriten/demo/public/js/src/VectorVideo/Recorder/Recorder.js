/// <reference path="../Settings/BrushSettings" />
/// <reference path="../Settings/RecorderSettings" />
/// <reference path="../AudioData/AudioRecorder" />
/// <reference path="../VideoData/PointingDevice" />
/// <reference path="../VideoData/Mouse" />
/// <reference path="../VideoData/Touch" />
/// <reference path="../VideoData/Pointer" />
/// <reference path="../VideoData/WacomTablet" />
/// <reference path="../Drawing/SVGDrawer" />
/// <reference path="../Drawing/CanvasDrawer" />
/// <reference path="../Drawing/DynaDraw" />
/// <reference path="../VideoData/Metadata" />
/// <reference path="../VideoData/Video" />
/// <reference path="../Helpers/File" />
/// <reference path="../UI/RecorderUI" />
/// <reference path="../UI/BasicElements" />
/// <reference path="../Localization/IRecorderLocalization" />
/// <reference path="../VideoFormat/SVGAnimation/Writer" />
var VectorVideo;
(function (VectorVideo) {
    var Video = VideoData.Video;
    var Mouse = VideoData.Mouse;
    var WacomTablet = VideoData.WacomTablet;
    var TouchEventsAPI = VideoData.TouchEventsAPI;
    var PointerEventsAPI = VideoData.PointerEventsAPI;
    var SVGDrawer = Drawing.SVGDrawer;
    var AudioRecorder = AudioData.AudioRecorder;
    var Errors = Helpers.Errors;
    var ErrorType = Helpers.ErrorType;
    var VideoEvents = Helpers.VideoEvents;
    var VideoEventType = Helpers.VideoEventType;
    var Metadata = VideoData.Metadata;
    var Recorder = (function () {
        /**
         * Create a new instance of recorder.
         * @param	id			Unique ID of this Recorder instance
         * @param	sttings		Recorder settings
         */
        function Recorder(id, settings) {
            var _this = this;
            this.id = id;
            this.settings = settings;
            // do not start recording until the user want's to start
            this.isRecording = false;
            // create paused stopwatch
            this.timer = new Helpers.VideoTimer(false);
            // recording is allowed even when not recording - but will be blcoked
            // when upload starts
            this.recordingBlocked = false;
            // select the container - it must exist
            var container = document.getElementById(id);
            if (!container) {
                Errors.Report(ErrorType.Fatal, "Container #" + id + " doesn't exist. Video Recorder couldn't be initialised.");
                return; // do not start
            }
            if (!!settings.Audio) {
                // only if settings are 
                this.audioRecorder = new AudioRecorder(settings.Audio);
                this.audioRecorder.Init();
            }
            if (!settings.ColorPallete || settings.ColorPallete.length === 0) {
                // default color pallete
                var colors = [];
                colors.push(new UI.Color("white", "#ffffff"));
                colors.push(new UI.Color("red", "#fa5959"));
                colors.push(new UI.Color("green", "#8cfa59"));
                colors.push(new UI.Color("blue", "#59a0fa"));
                colors.push(new UI.Color("yellow", "#fbff06"));
                colors.push(UI.Color.BackgroundColor);
                settings.ColorPallete = colors;
            }
            if (!settings.BrushSizes || settings.BrushSizes.length === 0) {
                // default brush sizes
                var brushes = [];
                brushes.push(new UI.BrushSize("pixel", 2, "px"));
                brushes.push(new UI.BrushSize("tiny", 5, "px"));
                brushes.push(new UI.BrushSize("small", 8, "px"));
                brushes.push(new UI.BrushSize("medium", 14, "px"));
                brushes.push(new UI.BrushSize("large", 20, "px"));
                brushes.push(new UI.BrushSize("extra", 80, "px"));
                settings.BrushSizes = brushes;
            }
            if (!settings.Localization) {
                // default localization
                var loc = {
                    NoJS: "Your browser does not support JavaScript or it is turned off. Video can't be recorded without enabled JavaScript in your browser.",
                    RecPause: "Control recording",
                    Record: "Start",
                    Pause: "Pause recording",
                    Upload: "Upload",
                    ChangeColor: "Change brush color",
                    ChangeSize: "Change brush size",
                    Erase: "Eraser",
                    EraseAll: "Erase everything",
                    WaitingText: "Please be patient. Uploading video usually takes some times - up to a few minutes if your video is over ten minutes long. Do not close this tab or browser window.",
                    UploadWasSuccessful: "Upload was successful",
                    RedirectPrompt: "Upload was successful - do you want to view your just recorded video?",
                    FailureApology: "Upload failed. Do you want to download your data to your computer instead?"
                };
                settings.Localization = loc;
            }
            // Bind video events
            VideoEvents.on(VideoEventType.ChangeBrushSize, function (size) { return _this.ChangeBrushSize(size); });
            VideoEvents.on(VideoEventType.ChangeColor, function (color) { return _this.ChangeColor(color); });
            VideoEvents.on(VideoEventType.CursorState, function (state) { return _this.ProcessCursorState(state); });
            VideoEvents.on(VideoEventType.ClearCanvas, function (color) { return _this.ClearCanvas(color); });
            VideoEvents.on(VideoEventType.Start, function () { return _this.Start(); });
            VideoEvents.on(VideoEventType.Continue, function () { return _this.Continue(); });
            VideoEvents.on(VideoEventType.Pause, function () { return _this.Pause(); });
            VideoEvents.on(VideoEventType.StartUpload, function () { return _this.StartUpload(); });
            // Record paths
            VideoEvents.on(VideoEventType.StartPath, function (path) { return _this.data.PushChunk(new VideoData.PathChunk(path, _this.timer.CurrentTime(), _this.lastEraseData)); });
            VideoEvents.on(VideoEventType.DrawSegment, function () { return _this.data.CurrentChunk.PushCommand(new VideoData.DrawNextSegment(_this.timer.CurrentTime())); });
            var min = brushes.reduce(function (previousValue, currentValue, index, arr) { return previousValue.Size < currentValue.Size ? previousValue : currentValue; }).Size;
            var max = brushes.reduce(function (previousValue, currentValue, index, arr) { return previousValue.Size > currentValue.Size ? previousValue : currentValue; }).Size;
            // the most important part - the rendering and drawing strategy
            // - default drawing strategy is using SVG
            this.drawer = !!settings.DrawingStrategy ? settings.DrawingStrategy : new SVGDrawer(true);
            this.dynaDraw = new Drawing.DynaDraw(function () { return _this.drawer.CreatePath(); }, true, min, max, this.timer);
            // create UI and connect it to the drawer			
            this.ui = new UI.RecorderUI(id, settings.ColorPallete, settings.BrushSizes, settings.Localization, this.timer);
            this.ui.AcceptCanvas(this.drawer.CreateCanvas());
            container.appendChild(this.ui.GetHTML());
            this.drawer.Stretch(); // adapt to the environment
            this.drawer.ClearCanvas(UI.Color.BackgroundColor); // set default bg color
            // select best input method
            var wacomApi = WacomTablet.IsAvailable();
            if (window.hasOwnProperty("PointerEvent")) {
                var pointer = new PointerEventsAPI(container);
                pointer.InitControlsAvoiding();
                console.log("Pointer Events API is used");
            }
            else if (wacomApi !== null) {
                var tablet = new WacomTablet(container, wacomApi);
                console.log("Wacom WebPAPI is used");
            }
            else {
                var mouse = new Mouse(container);
                mouse.InitControlsAvoiding();
                var touch = new TouchEventsAPI(container);
                console.log("Mouse and Touch Events API are used.");
            }
            // prepare data storage
            this.data = new Video();
            this.lastEraseData = 0;
            this.data.PushChunk(new VideoData.EraseChunk(UI.Color.BackgroundColor, 0, 0)); // clear the background with current background color
            this.data.PushChunk(new VideoData.VoidChunk(0, 0));
        }
        /**
         * Start recording. Everything must be initialised
         * and from this moment all data must be stored properly.
         */
        Recorder.prototype.Start = function () {
            this.isRecording = true;
            this.timer.Resume();
            if (this.audioRecorder) {
                this.audioRecorder.Start();
            }
        };
        /**
         * Pause recording. Do not record data temporarily.
         */
        Recorder.prototype.Pause = function () {
            this.isRecording = false;
            this.timer.Pause();
            if (this.audioRecorder) {
                this.audioRecorder.Pause();
            }
        };
        /**
         * Continue recording after the process has been paused for a while.
         */
        Recorder.prototype.Continue = function () {
            this.isRecording = true;
            this.timer.Resume();
            if (this.audioRecorder) {
                this.audioRecorder.Continue();
            }
        };
        /**
         * Stop recording and upload the recorded data.
         */
        Recorder.prototype.StartUpload = function () {
            var _this = this;
            // do not record any new data
            this.recordingBlocked = true;
            // prepare metadata based on current status
            var info = new Metadata();
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
                    _this.FinishRecording(false); // upload of audio failed
                });
            }
            else {
                // there was no audio
                this.UploadData();
            }
        };
        /**
         * User want's to change brush thickness.
         * @param	size	New brush size
         */
        Recorder.prototype.ChangeBrushSize = function (size) {
            // User can change the size even if recording hasn't started or is paused
            !this.recordingBlocked && this.data.CurrentChunk.PushCommand(new VideoData.ChangeBrushSize(size, this.timer.CurrentTime()));
            this.dynaDraw.SetBrushSize(size);
        };
        /**
         * User want's to change brush color.
         * @param	colo	New brush color
         */
        Recorder.prototype.ChangeColor = function (color) {
            // User can change the color even if recording hasn't started or is paused
            !this.recordingBlocked && this.data.CurrentChunk.PushCommand(new VideoData.ChangeBrushColor(color, this.timer.CurrentTime()));
            this.drawer.SetCurrentColor(color);
        };
        /**
         * User moved the mouse or a digital pen.
         */
        Recorder.prototype.ProcessCursorState = function (state) {
            !this.recordingBlocked && this.data.CurrentChunk.PushCommand(new VideoData.MoveCursor(state.X, state.Y, state.Pressure, this.timer.CurrentTime()));
            this.dynaDraw.ObserveCursorMovement(state);
        };
        /**
         * User moved the mouse or a digital pen.
         */
        Recorder.prototype.ClearCanvas = function (color) {
            // add data only if recording is in progress
            var time = this.timer.CurrentTime();
            this.lastEraseData = this.data.PushChunk(new VideoData.EraseChunk(color, time, this.lastEraseData));
            !this.recordingBlocked && this.data.PushChunk(new VideoData.VoidChunk(time, this.lastEraseData)); // erase chunk must not contain any cursor movement
            this.drawer.ClearCanvas(color);
        };
        //
        // Upload the result
        //
        /**
         * Upload the recorded data to the server.
         * @param	info	Information about the video.
         */
        Recorder.prototype.UploadData = function () {
            var _this = this;
            // get the recorded XML
            var writer = new VideoFormat.SVGAnimation.Writer();
            var xml = writer.SaveVideo(this.data);
            console.log(xml);
            Helpers.File.Download(xml, "recorded.svg");
            // if I need saving the data to local computer in the future
            VideoEvents.on(VideoEventType.DownloadData, function () {
                Helpers.File.Download(xml, "recorded-animation.svg");
            });
            // Upload the data via POST Ajax request
            var req = new XMLHttpRequest();
            req.open("POST", this.settings.UploadURL, true); // async post request			
            req.onerror = function (e) { return _this.FinishRecording(false); }; // upload failed
            req.onload = function (e) {
                var response = JSON.parse(req.responseBody);
                if (req.status === 200 // HTTP code 200 === success
                    && response.hasOwnProperty("success")
                    && response.success === true) {
                    var url = response.hasOwnProperty("redirect") ? response.redirect : false;
                    _this.FinishRecording(true, url);
                }
                else {
                    _this.FinishRecording(false); // upload failed
                }
            };
            req.send(xml);
        };
        /**
         * Redirect the user after successfully finishing recording.
         * Nothing is returned, if everything is OK and the user agrees
         * then user is redirected to the player to check his recording.
         *
         * @param  success	Was the whole process successful?
         * @param  url 		Url to be redirected to
         */
        Recorder.prototype.FinishRecording = function (success, url) {
            // inform everyone..
            VideoEvents.trigger(VideoEventType.RecordingFinished);
            // 
            if (success === true) {
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
                if (confirm(this.settings.Localization.FailureApology)) {
                    // download all the recorded data locally
                    VideoEvents.trigger(VideoEventType.DownloadData);
                }
            }
        };
        return Recorder;
    })();
    VectorVideo.Recorder = Recorder;
})(VectorVideo || (VectorVideo = {}));
