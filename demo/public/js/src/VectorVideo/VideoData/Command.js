var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VideoData;
(function (VideoData) {
    var VideoEvents = Helpers.VideoEvents;
    var VideoEventType = Helpers.VideoEventType;
    /**
     * Commands are used to trigger some event at given moment.
     */
    var Command = (function () {
        function Command(time) {
            this.time = time;
        }
        Object.defineProperty(Command.prototype, "Time", {
            get: function () { return this.time; },
            enumerable: true,
            configurable: true
        });
        Command.prototype.Execute = function () {
            throw new Error("Not implemented");
        };
        return Command;
    })();
    VideoData.Command = Command;
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
        MoveCursor.prototype.Execute = function () {
            VideoEvents.trigger(VideoEventType.CursorState, new Helpers.CursorState(this.Time, this.x, this.y, this.p));
        };
        return MoveCursor;
    })(Command);
    VideoData.MoveCursor = MoveCursor;
    var DrawNextSegment = (function (_super) {
        __extends(DrawNextSegment, _super);
        function DrawNextSegment() {
            _super.apply(this, arguments);
        }
        DrawNextSegment.prototype.Execute = function () {
            VideoEvents.trigger(VideoEventType.DrawSegment);
        };
        return DrawNextSegment;
    })(Command);
    VideoData.DrawNextSegment = DrawNextSegment;
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
        ChangeBrushColor.prototype.Execute = function () {
            VideoEvents.trigger(VideoEventType.ChangeColor, this.color.CssValue);
        };
        return ChangeBrushColor;
    })(Command);
    VideoData.ChangeBrushColor = ChangeBrushColor;
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
        ChangeBrushSize.prototype.Execute = function () {
            VideoEvents.trigger(VideoEventType.ChangeBrushSize, this.size.Size, this.size.Unit);
        };
        return ChangeBrushSize;
    })(Command);
    VideoData.ChangeBrushSize = ChangeBrushSize;
    var ClearCanvas = (function (_super) {
        __extends(ClearCanvas, _super);
        function ClearCanvas() {
            _super.apply(this, arguments);
        }
        ClearCanvas.prototype.Execute = function () {
            VideoEvents.trigger(VideoEventType.ClearCanvas);
        };
        return ClearCanvas;
    })(Command);
    VideoData.ClearCanvas = ClearCanvas;
})(VideoData || (VideoData = {}));
