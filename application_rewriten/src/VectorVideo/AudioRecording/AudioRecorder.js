/// <reference path="../../libs/DefinitelyTyped/webaudioapi/waa.d.ts" />
/// <reference path="../Settings/RecorderSettings" /> 
/// <reference path="../Helpers/Errors" />
/// <reference path="../Helpers/VideoEvents" />
var AudioRecording;
(function (AudioRecording) {
    /**
     * The main audio recording class.
     * This implementation wraps the HTML5 API and takes care of everything needed on the client side.
     */
    var AudioRecorder = (function () {
        /**
         * Initialise the audio recoder
         * @param	config	Audio recorder settings from the outside.
         */
        function AudioRecorder(config) {
            /** Is the audio being captured? */
            this.recording = false;
            /** Path to the recording web Worker. This path is absolute and it should be changed if the worker path changes. */
            this.recordingWorkerPath = "/js/workers/recording-worker.js";
            /** @type {Boolean} */
            this.initSuccessful = false;
            /** @type {Boolean} */
            this.doNotStartRecording = false;
            /** Default settings of audio recording */
            this.settings = {
                host: "http://localhost",
                port: 3000,
                path: "/upload/audio"
            };
            // update default settings
            if (!!config.host)
                this.settings.host = config.host;
            if (!!config.port)
                this.settings.port = config.port;
            if (!!config.path)
                this.settings.path = config.path;
            // wait until the user starts recording
            this.recording = false;
        }
        /**
         * Prepare audio recording.
         * Unless the website uses an SSL certificate, the browser will ask for microphone access
         * each time this method is called.
         * @param	success		Initialisation success callback
         */
        AudioRecorder.prototype.Init = function (success) {
            //window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
            navigator.getUserMedia = (navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia);
            if (!!navigator.getUserMedia) {
                navigator.getUserMedia(
                // constraints - we record only audio
                {
                    video: false,
                    audio: true
                }, 
                // success callback
                // success callback
                function (localMediaStream) {
                    if (this.doNotStartRecording === false) {
                        this.input = this.context.createMediaStreamSource(localMediaStream);
                        // create processing node
                        var bufferSize = 2048;
                        var recorder = this.context.createScriptProcessor(bufferSize, 1, 1);
                        recorder.onaudioprocess = this.processData;
                        this.input.connect(recorder);
                        recorder.connect(this.context.destination);
                        this.initSuccessful = true;
                        // create web worker audio processor
                        this.createAudioProcessor("web-socket", this.settings, function () { return console.log("Audio recording is ready."); });
                        // call callback and register the tool for later
                        if (!!success) {
                            success();
                        }
                        VideoEvents.trigger(VideoEventType.RegisterRecordingTool, "audio-recorder");
                    }
                }, 
                // error callback
                // error callback
                function (err) {
                    if (err.name === "PermissionDeniedError") {
                        Errors.Report(ErrorType.Warning, "User didn't allow microphone recording.");
                    }
                    Errors.Report(ErrorType.Warning, "Can't record audio", err);
                });
            }
            else {
                console.log("getUserMedia not supported by the browser");
                Errors.Report(ErrorType.Warning, "getUserMedia not supported by the browser");
            }
        };
        /**
         * Creates a web worker that will process the audio and upload it to the server.
         * @param	processorType	Type of the audio processor.
         * @param	cfg				Upload configuration.
         * @param	success			This callback will be called if the worker is created
         * @param	error			This callback will be called if web workers aren't supported
         */
        AudioRecorder.prototype.CreateAudioProcessor = function (processorType, cfg, success, error) {
            if (Worker) {
                this.recordingWorker = new Worker(this.recordingWorkerPath);
                this.recordingWorker.postMessage({
                    cmd: "init",
                    AudioProcessorType: processorType || "web-sockets",
                    port: cfg.port,
                    host: cfg.host,
                    path: cfg.path
                });
                // call optional user's callback
                if (!!success) {
                    success();
                }
            }
            else {
                Errors.Report(ErrorType.Fatal, "No web workers support - this feature is not supported by the browser.");
                // call optional user's callback
                if (!!error) {
                    error();
                }
            }
        };
        /**
         * Start recording
         */
        AudioRecorder.prototype.Start = function () {
            // check, if recorder was successfully initialised first
            if (this.initSuccessful === true) {
                if (!this.recordingWorker) {
                    Errors.Report(ErrorType.Fatal, "No audio processor was set.");
                    return false;
                }
                else {
                    this.recording = true;
                    return true;
                }
            }
            else {
                // user didn't allow the audio recording (or doesn't have a microphone)
                this.doNotStartRecording = true;
                // idea for future development:
                // If there is a way to hide the "allow microphone access" (-> I dan't want to access the microphone any more,
                // the user already started recording without it) bar or popup, implement it here.
                // - I haven't yet found how to accomplish that...
                return false;
            }
        };
        /**
         * Continue recording
         */
        AudioRecorder.prototype.Continue = function () {
            // check, if recorder was successfully initialised first
            if (this.initSuccessful) {
                if (!this.recordingWorker) {
                    Errors.Report(ErrorType.Fatal, "No audio processor was set.");
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
        /**
         * Pause recording
         */
        AudioRecorder.prototype.Pause = function () {
            // check, if recorder was successfully initialised first
            if (this.initSuccessful) {
                this.recording = false;
                return true;
            }
            else {
            }
            return false;
        };
        /**
         * Stop the recording
         */
        AudioRecorder.prototype.Stop = function (success) {
            if (this.initSuccessful === true) {
                // stop recording
                if (this.Pause()) {
                    if (this.recordingWorker) {
                        // prepare for response from the worker first
                        this.recordingWorker.onmessage = function (e) {
                            var msg = e.data;
                            if (!msg.hasOwnProperty("error")) {
                                console.log("Worker response is invalid (missing property 'error')", e.data);
                                return;
                            }
                            if (msg.error === true) {
                                Errors.Report(ErrorType.Fatal, msg.message);
                            }
                            else {
                                VideoEvents.trigger(VideoEventType.RecordingToolFinished, "audio-recorder");
                                var sources;
                                for (var i = 0; i < msg.files.length; i++) {
                                    var file = msg.files[i];
                                    var source = new AudioSource(file.url, file.type);
                                    sources.push(source);
                                }
                                success(sources);
                            }
                        };
                        // now send the message to the worker
                        this.recordingWorker.postMessage({
                            cmd: "finish"
                        });
                    }
                }
            }
            else {
                // there was no recording
                Errors.Report(ErrorType.Warning, "Can't stop AudioRecorder - it wasn't ever initialised.");
            }
        };
        /**
         *
         */
        AudioRecorder.prototype.isRecording = function () {
            return this.initSuccessful;
        };
        /**
         *
         */
        AudioRecorder.prototype.processData = function (data) {
            if (this.recording === false) {
                return; // recording has not started or is paused
            }
            // grab only the left channel - lower quality but half the data to transfer..
            // most NTB microphones are mono..
            var left = data.inputBuffer.getChannelData(0);
            if (this.recordingWorker) {
                this.recordingWorker.postMessage({
                    cmd: "pushData",
                    data: left
                });
            }
        };
        return AudioRecorder;
    })();
    AudioRecording.AudioRecorder = AudioRecorder;
})(AudioRecording || (AudioRecording = {}));
//# sourceMappingURL=AudioRecorder.js.map