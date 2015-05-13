/// <reference path="IVideoInfo" />
/// <reference path="../VideoFormat/IO" />
/// <reference path="../Helpers/File" />
/// <reference path="../Helpers/Errors" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="../Helpers/State" />
/// <reference path="../Helpers/VideoTimer" />
var VideoEvents = Helpers.VideoEvents;
var VideoEventType = Helpers.VideoEventType;
var StateType = Helpers.StateType;
var VideoTimer = Helpers.VideoTimer;
var VideoData;
(function (VideoData) {
    var Video = (function () {
        /**
         *
         */
        function Video(url, formatReader) {
            this.formatReader = formatReader;
            this.timer = null;
            this.hasData = false;
            this.isPlaying = false;
            Helpers.File.ReadXmlAsync(url, this.ProcessInputFile, this.ReadingFileError);
            // 
            VideoEvents.on(VideoEventType.CanvasSize, this.CanvasSizeChanged);
            VideoEvents.on(VideoEventType.Start, this.Start);
            VideoEvents.on(VideoEventType.Continue, this.Start);
            VideoEvents.on(VideoEventType.Pause, this.Pause);
            VideoEvents.on(VideoEventType.Stop, this.Pause);
            VideoEvents.on(VideoEventType.JumpTo, this.JumpTo);
            VideoEvents.on(VideoEventType.ReachEnd, this.Pause);
        }
        Object.defineProperty(Video.prototype, "Info", {
            get: function () { return this.info; },
            enumerable: true,
            configurable: true
        });
        /**
         * Process the downloaded XML source.
         */
        Video.prototype.ProcessInputFile = function (xml) {
            this.hasData = true;
            this.formatReader.ReadFile(xml);
            // load video information
            this.info = this.formatReader.GetInfo();
            VideoEvents.trigger(VideoEventType.VideoInfoLoaded, this.info); // anyone can have the info
        };
        /**
         * Handle an error that occured while downloading or parsing the input XML document.
         */
        Video.prototype.ReadingFileError = function (e) {
            Errors.Report(ErrorType.Fatal, "Source file couldn't be read and the video won't be played.");
        };
        /**
         * Compute image scaling factor based on original canvas size and current canvas size
         */
        Video.prototype.CanvasSizeChanged = function (width, height) {
            // make sure it doesn't get out of current user's canvas
            this.scale = Math.min(width / this.info.Width, height / this.info.Height);
        };
        /**
         * Acommodate the position to current canvas size
         */
        Video.prototype.CorrectCoords = function (pos) {
            return {
                x: pos.x * this.scale,
                y: pos.y * this.scale
            };
        };
        Video.prototype.Start = function () {
            if (this.timer === null) {
                this.timer = new VideoTimer();
            }
            else {
                this.timer.Resume();
            }
            this.isPlaying = true;
            this.Tick(); // this will render as much as needed and then will become async
        };
        Video.prototype.Pause = function () {
            this.timer.Pause();
            this.isPlaying = false; // Tick() will stop after next animation frame (in 1/60s)
        };
        Video.prototype.Replay = function () {
            //this
        };
        Video.prototype.JumpTo = function (progress) {
            var wasPlaying = this.isPlaying;
            this.Pause();
            var time = progress * this.info.Length * 1000; // convert to milliseconds
            if (time >= this.timer.CurrentTime()) {
                this.SkipForward(time);
            }
            else {
                this.SkipBackward(time);
            }
            if (wasPlaying === true) {
                this.Start(); // continue from the new point in time
            }
        };
        Video.prototype.SkipForward = function (time) {
            this.timer.SetTime(time);
            this.timer.Pause();
            while (line.FinishTime <= this.formatReader.GetNextPrerenderedLineFinishTime()) {
                var line = this.formatReader.GetNextPrerenderedLine();
                this.PublishWholeLine(line);
            }
            this.Tick(); // make as many steps as needed
            // video is paused, so ticking won't continue after it is synchronised
            // rendering request will also be made
        };
        Video.prototype.SkipBackward = function (time) {
            // rewind... (erase everything)
            this.
                // ...and then skip forward
                Tick();
        };
        Video.prototype.PublishWholeLine = function (line) {
            // @todo
        };
        /**
         * Stop playback when end is reached.
         */
        Video.prototype.ReachedEnd = function () {
            this.Pause();
        };
        /**
         * Inform everyone, that I have reached the end
         */
        Video.prototype.ForceReachedEnd = function () {
            VideoEvents.trigger(VideoEventType.ReachEnd);
        };
        /**
         * Keep the video running (as long as it is not paused).
         */
        Video.prototype.Tick = function () {
            // number of states that have drawn something on the canvas			
            var drawingStates = 0;
            // apply as many states as needed (usually 1 or 2)
            while (this.nextState.GetTime() <= this.timer.CurrentTime()) {
                drawingStates += this.ProcessState(this.nextState);
                this.nextState = this.formatReader.GetNextState();
                if (!this.nextState) {
                    // I have reached the end
                    this.ForceReachedEnd();
                }
            }
            // request frame rendering (if something interesting happened, of course)
            if (drawingStates > 0) {
                this.RequestRendering();
            }
            // repaint on next animation frame
            if (this.isPlaying) {
                requestAnimationFrame(this.Tick); // 1 frame takes about 1/60s
            }
        };
        /**
         * Tell the drawer that there is something it should render...
         */
        Video.prototype.RequestRendering = function () {
            VideoEvents.trigger(VideoEventType.Render);
        };
        /**
         * Returns 1 if something is drawn, 0 otherwise
         * @param	state	Next state
         */
        Video.prototype.ProcessState = function (state) {
            switch (state.GetType()) {
                case StateType.ChangeBrushSize:
                    this.ChangeBrushSize(state);
                    return 0;
                case StateType.ChangeColor:
                    this.ChangeColor(state);
                    return 0;
                case StateType.Cursor:
                    this.MoveCursor(state);
                    // nothing is redrawn if the cursor is just 'hovering' over the canvas
                    // - unless this is where the line ends...
                    return state.Pressure > 0
                        || this.lastCursorState.Pressure > 0 ? 1 : 0;
            }
        };
        Video.prototype.ChangeColor = function (state) {
            VideoEvents.trigger(VideoEventType.ChangeColor, state.Color.CssValue);
        };
        Video.prototype.ChangeBrushSize = function (state) {
            VideoEvents.trigger(VideoEventType.ChangeBrushSize, state.Size.Size * this.scale);
        };
        Video.prototype.MoveCursor = function (state) {
            VideoEvents.trigger(VideoEventType.CursorState, state);
        };
        return Video;
    })();
    VideoData.Video = Video;
})(VideoData || (VideoData = {}));
//# sourceMappingURL=Video.js.map