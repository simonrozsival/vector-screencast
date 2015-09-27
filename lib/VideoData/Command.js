var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VideoEvents_1 = require('../Helpers/VideoEvents');
var State_1 = require('../Helpers/State');
var Command = (function () {
    function Command(time) {
        this.time = time;
    }
    Object.defineProperty(Command.prototype, "Time", {
        get: function () { return this.time; },
        enumerable: true,
        configurable: true
    });
    Command.prototype.Execute = function (events) {
        throw new Error("Not implemented");
    };
    Command.prototype.Clone = function () {
        throw new Error("Not implemented");
    };
    return Command;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Command;
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
    MoveCursor.prototype.Execute = function (events) {
        events.trigger(VideoEvents_1.VideoEventType.CursorState, new State_1.CursorState(this.Time, this.x, this.y, this.p));
    };
    MoveCursor.prototype.Clone = function () {
        return new MoveCursor(this.x, this.y, this.p, this.Time);
    };
    return MoveCursor;
})(Command);
exports.MoveCursor = MoveCursor;
var DrawNextSegment = (function (_super) {
    __extends(DrawNextSegment, _super);
    function DrawNextSegment() {
        _super.apply(this, arguments);
    }
    DrawNextSegment.prototype.Execute = function (events) {
        events.trigger(VideoEvents_1.VideoEventType.DrawSegment);
    };
    DrawNextSegment.prototype.Clone = function () {
        return new DrawNextSegment(this.Time);
    };
    return DrawNextSegment;
})(Command);
exports.DrawNextSegment = DrawNextSegment;
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
    ChangeBrushColor.prototype.Execute = function (events) {
        events.trigger(VideoEvents_1.VideoEventType.ChangeColor, this.color);
    };
    ChangeBrushColor.prototype.Clone = function () {
        return new ChangeBrushColor(this.color, this.Time);
    };
    return ChangeBrushColor;
})(Command);
exports.ChangeBrushColor = ChangeBrushColor;
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
    ChangeBrushSize.prototype.Execute = function (events) {
        events.trigger(VideoEvents_1.VideoEventType.ChangeBrushSize, this.size);
    };
    ChangeBrushSize.prototype.Clone = function () {
        return new ChangeBrushSize(this.size, this.Time);
    };
    return ChangeBrushSize;
})(Command);
exports.ChangeBrushSize = ChangeBrushSize;
var ClearCanvas = (function (_super) {
    __extends(ClearCanvas, _super);
    function ClearCanvas(color, time) {
        _super.call(this, time);
        this.color = color;
    }
    Object.defineProperty(ClearCanvas.prototype, "Color", {
        get: function () { return this.color; },
        enumerable: true,
        configurable: true
    });
    ClearCanvas.prototype.Execute = function (events) {
        events.trigger(VideoEvents_1.VideoEventType.ClearCanvas, this.color);
    };
    ClearCanvas.prototype.Clone = function () {
        return new ClearCanvas(this.color, this.Time);
    };
    return ClearCanvas;
})(Command);
exports.ClearCanvas = ClearCanvas;
