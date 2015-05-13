/// <reference path="Settings/BrushSettings" />
/// <reference path="Settings/RecorderSettings" />
/// <reference path="AudioRecording/AudioRecorder" />
/// <reference path="VideoData/Mouse" />
/// <reference path="VideoData/WacomTablet" />
/// <reference path="Drawing/SVGDrawer" />
/// <reference path="VideoData/IVideoInfo" />
/// <reference path="Helpers/File" />
/// <reference path="UI/RecorderUI" />
/// <reference path="UI/BasicElements" />
/// <reference path="UI/Modal" />
/// <reference path="VideoFormat/IO" />
/// <reference path="VideoFormat/AnimatedSVGWriter" />
/// <reference path="Localization/IRecorderLocalization" />
var Mouse = VideoData.Mouse;
var WacomTablet = VideoData.WacomTablet;
var SVGDrawer = Drawing.SVGDrawer;
var AudioRecorder = AudioRecording.AudioRecorder;
var VectorVideo;
(function (VectorVideo) {
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
            this.current = {
                Color: "#fff",
                Size: 3
            };
            // do not start recording until the user want's to start
            this.isRecording = false;
            this.lastTime = 0;
            this.data = [];
            // select the container - it must exist
            var container = document.getElementById(id);
            if (!container) {
                Errors.Report(ErrorType.Fatal, "Container #" + id + " doesn't exist. Video Recorder couldn't be initialised.");
                return; // do not start
            }
            // select best input method
            var wacomApi = WacomTablet.IsAvailable();
            if (wacomApi !== null) {
                this.dataProvider = new WacomTablet(container, wacomApi);
            }
            else {
                this.dataProvider = new Mouse(container);
            }
            // the most important part - the drawer
            if (!!settings.DrawingStrategy) {
                this.drawer = settings.DrawingStrategy;
            }
            else {
                // default drawing strategy is SVG
                this.drawer = new SVGDrawer();
            }
            if (!!settings.Audio) {
                // only if settings are 
                this.audioRecorder = new AudioRecorder(settings.Audio);
                this.audioRecorder.Init();
            }
            if (!settings.ColorPallete) {
                // default color pallete
                var colors = [];
                colors.push(new UI.Color("white", "#ffffff"));
                colors.push(new UI.Color("red", "#fa5959"));
                colors.push(new UI.Color("green", "#8cfa59"));
                colors.push(new UI.Color("blue", "#59a0fa"));
                colors.push(new UI.Color("yellow", "#fbff06"));
                settings.ColorPallete = colors;
            }
            if (!settings.BrushSizes) {
                // default brush sizes
                var brushes = [];
                brushes.push(new UI.BrushSize("tiny", 2, "px"));
                brushes.push(new UI.BrushSize("small", 5, "px"));
                brushes.push(new UI.BrushSize("medium", 10, "px"));
                brushes.push(new UI.BrushSize("large", 20, "px"));
                settings.BrushSizes = brushes;
            }
            if (!settings.Localization) {
                // default localization
                var loc = {
                    NoJS: "Your browser does not support JavaScript or it is turned off. Video can't be recorded without enabled JavaScript in your browser.",
                    Record: "Record video",
                    Pause: "Pause recording",
                    UploadModalTitle: "Save recorded video",
                    Upload: "Upload",
                    ChangeColor: "Change brush color",
                    ChangeSize: "Change brush size",
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
            VideoEvents.on(VideoEventType.CursorState, function (state) { return _this.ProcessCursorState; });
            VideoEvents.on(VideoEventType.Start, function () { return _this.Start(); });
            VideoEvents.on(VideoEventType.Continue, function () { return _this.Continue(); });
            VideoEvents.on(VideoEventType.Pause, function () { return _this.Pause(); });
            VideoEvents.on(VideoEventType.StartUpload, function (info) { return _this.StartUpload(info); });
            // prepare the UI
            this.ui = new UI.RecorderUI(id, settings.ColorPallete, settings.BrushSizes, settings.Localization);
            this.ui.AcceptCanvas(this.drawer.GetCanvas());
            container.appendChild(this.ui.GetHTML());
        }
        /**
         * Start recording. Everything must be initialised
         * and from this moment all data must be stored properly.
         */
        Recorder.prototype.Start = function () {
            this.isRecording = true;
            if (this.audioRecorder) {
                this.audioRecorder.start();
            }
        };
        /**
         * Pause recording. Do not record data temporarily.
         */
        Recorder.prototype.Pause = function () {
            this.isRecording = false;
            if (this.audioRecorder) {
                this.audioRecorder.pause();
            }
        };
        /**
         * Continue recording after the process has been paused for a while.
         */
        Recorder.prototype.Continue = function () {
            this.isRecording = true;
            if (this.audioRecorder) {
                this.audioRecorder.continue();
            }
        };
        /**
         * Stop recording and upload the recorded data.
         * @param	@todo
         */
        Recorder.prototype.StartUpload = function (info) {
            this.isRecording = false;
            if (!!this.audioRecorder
                && this.audioRecorder.isRecording()) {
                this.audioRecorder.stop({
                    success: function (files) {
                        info.AudioTracks = files;
                        this.UploadData(info);
                    },
                    error: function () {
                        this.FinishRecording(false); // upload failed
                    }
                });
            }
            else {
                // there was no audio
                info.AudioTracks = []; // no audio
                this.UploadData(info);
            }
        };
        /**
         * User want's to change brush thickness.
         * @param	size	New brush size
         */
        Recorder.prototype.ChangeBrushSize = function (size) {
            // User can change the size even if recording hasn't started or is paused
            //this.data.push(); // @todo
            this.drawer.SetBrushSize(size);
        };
        /**
         * User want's to change brush color.
         * @param	colo	New brush color
         */
        Recorder.prototype.ChangeColor = function (color) {
            // User can change the color even if recording hasn't started or is paused
            //this.data.push(); // @todo
            this.drawer.SetBrushColor(color);
        };
        /**
         * User moved the mouse or a digital pen.
         */
        Recorder.prototype.ProcessCursorState = function (state) {
            if (this.isRecording === true) {
                // add data only if recording is in progress
                //this.data.push(state); // @todo
                this.drawer.ProcessNewState(state);
            }
        };
        //
        // Upload the result
        //
        /**
         * Upload the recorded data to the server.
         * @param	info	Information about the video.
         */
        Recorder.prototype.UploadData = function (info) {
            var _this = this;
            // update info according to recorded data
            info.Length = this.lastTime;
            // board data
            info.Width = this.ui.Width;
            info.Height = this.ui.Height;
            info.BackgroundColor = this.ui.BackgroundColor;
            // get the recorded XML
            var writer = new VideoFormat.AnimatedSVGWriter();
            var xml = writer.ToString();
            // if I need saving the data to local computer in the future
            VideoEvents.on(VideoEventType.DownloadData, function () {
                Helpers.File.StartDownloadingXml(xml);
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
//# sourceMappingURL=Recorder.js.map