/// <reference path="../Helpers/HTML.ts" />
/// <reference path="../Helpers/VideoEvents.ts" />
var AudioData;
(function (AudioData) {
    var VideoEvents = Helpers.VideoEvents;
    var VideoEventType = Helpers.VideoEventType;
    var Errors = Helpers.Errors;
    var ErrorType = Helpers.ErrorType;
    /**
     * Enumeration of supported audio types.
     */
    (function (AudioSourceType) {
        AudioSourceType[AudioSourceType["MP3"] = 0] = "MP3";
        AudioSourceType[AudioSourceType["OGG"] = 1] = "OGG";
        AudioSourceType[AudioSourceType["WAV"] = 2] = "WAV";
    })(AudioData.AudioSourceType || (AudioData.AudioSourceType = {}));
    var AudioSourceType = AudioData.AudioSourceType;
    /**
     * Class representing one audio source.
     */
    var AudioSource = (function () {
        function AudioSource(url, type) {
            this.url = url;
            this.type = type;
        }
        Object.defineProperty(AudioSource.prototype, "Url", {
            /** Read only audio URL. */
            get: function () { return this.url; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AudioSource.prototype, "Type", {
            /** Read only information about the type of the source. */
            get: function () { return this.type; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AudioSource.prototype, "MimeType", {
            /** The MIME type of the audio source. */
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
        /**
         * Convert the MIME type to AudioSourceType
         * @param 	type 	Audio MIME type
         * @return			The appropriate audio source type enum item
         */
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
    AudioData.AudioSource = AudioSource;
    /**
     * This is the audio player
     */
    var AudioPlayer = (function () {
        function AudioPlayer(sources) {
            // create audio element
            this.audio = this.CreateAudio(sources);
            if (this.audio === null) {
                this.isReady = false;
            }
            else {
                // the audio is stopped when the page is loaded
                this.playing = false;
                this.reachedEnd = false;
                // init was successful
                this.InitAudio();
                this.isReady = true;
                // attach the player to the document
                document.appendChild(this.audio);
                console.log("Audio is available.");
            }
        }
        Object.defineProperty(AudioPlayer.prototype, "IsReady", {
            get: function () { return this.isReady; },
            enumerable: true,
            configurable: true
        });
        /**
         * Create an audio element and attach supported
         */
        AudioPlayer.prototype.CreateAudio = function (sources) {
            try {
                var audio = new Audio();
                if (!audio.canPlayType) {
                    Errors.Report(ErrorType.Warning, "AudioPlayer: browser does not support HTML5 audio");
                    return null;
                }
                var canPlayAtLeastOne = false;
                for (var i = 0; i < sources.length; i++) {
                    var element = sources[i];
                    if (audio.canPlayType(element.MimeType) === "probably") {
                        var source = Helpers.HTML.CreateElement("source", {
                            src: element.Url,
                            type: element.MimeType
                        });
                        audio.appendChild(source);
                        canPlayAtLeastOne = true;
                    }
                }
                // no source can be played by the browser?
                if (canPlayAtLeastOne === false) {
                    Errors.Report(ErrorType.Warning, "Browser can't play any of available audio sources.", sources);
                    return null;
                }
                return audio;
            }
            catch (e) {
                // unsupported browser
                Errors.Report(ErrorType.Warning, "AudioPlayer: can't create audio element", e);
                return null;
            }
        };
        //
        // private functions section:
        // 
        AudioPlayer.prototype.InitAudio = function () {
            // important audio events
            this.audio.onended = function () { return VideoEvents.trigger(VideoEventType.ReachEnd); };
            this.audio.onpause = this.InitiatePause;
            this.audio.ontimeupdate = this.ReportCurrentTime;
            // synchronize audio playback with video
            VideoEvents.on(VideoEventType.Start, this.Play);
            VideoEvents.on(VideoEventType.Pause, this.Pause);
            VideoEvents.on(VideoEventType.Stop, this.Pause);
            VideoEvents.on(VideoEventType.ReachEnd, this.ReachedEnd);
            VideoEvents.on(VideoEventType.Replay, this.Replay);
            VideoEvents.on(VideoEventType.JumpTo, this.JumpTo);
            this.MonitorBufferingAsync();
        };
        ;
        /**
         * Start playling
         */
        AudioPlayer.prototype.Play = function () {
            if (this.isReady) {
                if (this.reachedEnd == true) {
                    this.Rewind();
                }
                this.audio.play();
            }
        };
        /**
         * Be the one who tells others, when to play!
         */
        AudioPlayer.prototype.InitiatePlay = function () {
            VideoEvents.trigger(VideoEventType.Start);
        };
        /**
         * Pause audio
         */
        AudioPlayer.prototype.Pause = function () {
            if (this.isReady) {
                this.audio.pause();
            }
        };
        /**
         * Be the one who tells others, when to pause!
         */
        AudioPlayer.prototype.InitiatePause = function () {
            VideoEvents.trigger(VideoEventType.Pause);
        };
        /**
         * Video playback has ended.
         */
        AudioPlayer.prototype.ReachedEnd = function () {
            this.reachedEnd = true;
            this.Pause();
        };
        /**
         * Play the audio from the start.
         */
        AudioPlayer.prototype.Replay = function () {
            this.Rewind();
            this.Play();
        };
        /**
         * Change current position back to the start
         */
        AudioPlayer.prototype.Rewind = function () {
            if (this.isReady) {
                this.audio.pause();
                this.audio.currentTime = 0;
                this.reachedEnd = false;
            }
        };
        /**
         * Asynchronousely monitor current audio buffer
         */
        AudioPlayer.prototype.MonitorBufferingAsync = function () {
            // Has the browser preloaded something since last time?
            // Change the css styles only if needed.
            var lastEnd = 0;
            this.checkPreloaded = setInterval(function () {
                if (this.audio.canPlayThrough) {
                    clearInterval(this.checkPreloaded); // no need to run this loop any more
                }
                else {
                    var end = this.audio.buffered.end(this.audio.buffered.length - 1);
                    if (end !== lastEnd) {
                        VideoEvents.trigger(VideoEventType.BufferStatus, end);
                        lastEnd = end;
                    }
                }
            }, 1000); // every second check, how much is preloaded
        };
        /**
         * Jump to a given position.
         * It might take some time before the audio is ready - pause the playback and start as soon as ready.
         */
        AudioPlayer.prototype.JumpTo = function (progress) {
            this.reachedEnd = false; // if I was at the end and I changed the position, I am not at the end any more!			
            var time = this.audio.duration * progress; // duration is in seconds
            if (this.playing === true) {
                this.InitiatePause(); // pause before changing position
                this.ChangePosition(time, this.InitiatePlay); // start playing when ready		
            }
            else {
                this.ChangePosition(time); // do not start playling
            }
            // monitor preloading buffer
            clearInterval(this.checkPreloaded);
            this.MonitorBufferingAsync();
        };
        /**
         * Change current audio position to specified time
         */
        AudioPlayer.prototype.ChangePosition = function (seconds, callback) {
            console.log("audio - change position to " + seconds + "s");
            this.audio.oncanplay = callback;
            this.audio.currentTime = seconds;
        };
        /**
         * Report current time so everyone can synchronize
         */
        AudioPlayer.prototype.ReportCurrentTime = function () {
            VideoEvents.trigger(VideoEventType.CurrentTime, this.audio.currentTime);
        };
        return AudioPlayer;
    })();
    AudioData.AudioPlayer = AudioPlayer;
})(AudioData || (AudioData = {}));
