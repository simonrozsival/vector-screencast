/// <reference path="audio.d.ts" />
var VideoEvents_1 = require('../Helpers/VideoEvents');
var Errors_1 = require('../Helpers/Errors');
var HTML_1 = require('../Helpers/HTML');
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
