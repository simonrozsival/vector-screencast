/// <reference path="../Helpers/Errors" />
/// <reference path="../Drawing/DrawingStrategy" />
/// <reference path="../Drawing/SVGDrawer" />
/// <reference path="../Settings/PlayerSettings" />
/// <reference path="../UI/PlayerUI" />
/// <reference path="../AudioData/AudioPlayer" />
/// <reference path="../VideoData/Video" />
/// <reference path="../VideoFormat/IO" />
/// <reference path="../VideoFormat/SVGAnimation/Reader" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="../UI/Cursor" />
var VectorVideo;
(function (VectorVideo) {
    var AudioPlayer = AudioData.AudioPlayer;
    var VideoEvents = Helpers.VideoEvents;
    var VideoEventType = Helpers.VideoEventType;
    var Errors = Helpers.Errors;
    var ErrorType = Helpers.ErrorType;
    var Player = (function () {
        function Player(id, settings) {
            var _this = this;
            this.settings = settings;
            var container = document.getElementById(id);
            if (!container) {
                Helpers.Errors.Report(Helpers.ErrorType.Fatal, "Container #" + id + " doesn't exist. Video Player couldn't be initialised.");
            }
            // init the UI and bind it to an instance of a rendering strategy
            this.ui = new UI.PlayerUI(id, settings.Localization, this.timer);
            this.drawer = !!settings.DrawingStrategy ? settings.DrawingStrategy : new Drawing.SVGDrawer(true);
            this.ui.AcceptCanvas(this.drawer.CreateCanvas());
            this.drawer.Stretch();
            this.drawer.ClearCanvas(UI.Color.BackgroundColor);
            // read the file
            Helpers.File.ReadXmlAsync(settings.Source, function (xml) {
                var reader = new VideoFormat.SVGAnimation.Reader(xml);
                _this.video = reader.LoadVideo();
                _this.audio = new AudioPlayer(_this.video.Metadata.AudioTracks);
                VideoEvents.trigger(VideoEventType.VideoInfoLoaded, _this.video.Metadata);
                var scalingFactor = _this.drawer.SetupOutputCorrection(_this.video.Metadata.Width, _this.video.Metadata.Height);
                VideoEvents.trigger(VideoEventType.CanvasScalingFactor, scalingFactor);
            }, function (errStatusCode) {
                Errors.Report(ErrorType.Warning, _this.settings.Localization.DataLoadingFailed);
            });
            // Record paths
            VideoEvents.on(VideoEventType.StartPath, function (path) { return console.log("draw path: ", path); });
            VideoEvents.on(VideoEventType.DrawSegment, function () { return console.log("draw next segment"); });
            // prepare a paused timer
            this.timer = new Helpers.VideoTimer(false);
        }
        /**
         * Start (resume) playing of the video from current position
         */
        Player.prototype.Play = function () {
            var _this = this;
            this.isPlaying = true;
            this.timer.Resume();
            this.audio.Pause();
            this.ticking = requestAnimationFrame(function () { return _this.Tick(); }); // start async ticking
        };
        /**
         * Pause playing of the video immediately
         */
        Player.prototype.Pause = function () {
            this.timer.Pause();
            this.isPlaying = false;
            this.audio.Pause();
            cancelAnimationFrame(this.ticking);
        };
        Player.prototype.Tick = function () {
            var _this = this;
            this.Sync();
            this.ticking = requestAnimationFrame(function () { return _this.Tick(); });
        };
        Player.prototype.Sync = function () {
            // loop through the
            while (this.video.CurrentChunk.CurrentCommand.Time < this.timer.CurrentTime()) {
                this.video.CurrentChunk.CurrentCommand.Execute();
                this.video.CurrentChunk.MoveNextCommand();
                // move to next chunk, if the last one just ended
                if (this.video.CurrentChunk.CurrentCommand === undefined) {
                    do {
                        this.video.MoveNextChunk();
                        if (this.video.CurrentChunk === undefined) {
                            this.ReachedEnd();
                            break;
                        }
                        this.video.CurrentChunk.ExecuteInitCommands();
                        // use the prerendered data as much as possible
                        if (this.video.PeekNextChunk().StartTime <= this.timer.CurrentTime()) {
                            this.video.CurrentChunk.Render(); // render the whole chunk
                        }
                        else {
                            // this chunk will not be rendered at once
                            break;
                        }
                    } while (true);
                }
            }
        };
        /**
         * Skip to a specific time on the timeline. This method is used mainly when the user clicks
         * on the progressbar and the percents are calculated.
         * @param   {number}    progress    The progress to jump to in percent (value in [0; 1]).
         */
        Player.prototype.JumpTo = function (progress) {
            var wasPlaying = this.isPlaying;
            this.Pause();
            var time = progress * this.video.Metadata.Length * 1000; // convert to milliseconds
            if (time >= this.timer.CurrentTime()) {
                this.video.FastforwardErasedChunksUntil(time);
            }
            else {
                this.video.RewindToLastEraseBefore(time);
            }
            this.timer.SetTime(time);
            this.Sync(); // make as many steps as needed to sync canvas status
            // video is paused, so ticking won't continue after it is synchronised
            // rendering request will also be made
            if (wasPlaying === true) {
                this.Play(); // continue from the new point in time
            }
        };
        /**
         * Inform everyone, that I have reached the end
         */
        Player.prototype.ReachedEnd = function () {
            VideoEvents.trigger(VideoEventType.ReachEnd);
        };
        return Player;
    })();
    VectorVideo.Player = Player;
})(VectorVideo || (VectorVideo = {}));
