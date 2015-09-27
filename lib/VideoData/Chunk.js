var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VideoEvents_1 = require('../Helpers/VideoEvents');
var Chunk = (function () {
    function Chunk(time, lastErase) {
        this.time = time;
        this.lastErase = lastErase;
        this.initCommands = [];
        this.commands = [];
        this.cmdIterator = 0;
    }
    Object.defineProperty(Chunk.prototype, "StartTime", {
        get: function () { return this.time; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chunk.prototype, "LastErase", {
        get: function () { return this.lastErase; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chunk.prototype, "CurrentCommand", {
        get: function () {
            return this.commands[this.cmdIterator];
        },
        enumerable: true,
        configurable: true
    });
    Chunk.prototype.PeekNextCommand = function () {
        return this.commands[this.cmdIterator + 1];
    };
    Chunk.prototype.MoveNextCommand = function () { this.cmdIterator++; };
    Chunk.prototype.Rewind = function () { this.cmdIterator = 0; };
    Chunk.prototype.ExecuteInitCommands = function (events) {
        for (var i = 0; i < this.initCommands.length; i++) {
            this.initCommands[i].Execute(events);
        }
    };
    Chunk.prototype.GetCommand = function (i) {
        return i < this.commands.length ? this.commands[i] : null;
    };
    Chunk.prototype.PushCommand = function (cmd) {
        this.commands.push(cmd);
    };
    Object.defineProperty(Chunk.prototype, "Commands", {
        get: function () {
            return this.commands;
        },
        set: function (value) {
            this.commands = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chunk.prototype, "InitCommands", {
        get: function () {
            return this.initCommands;
        },
        set: function (initCmds) {
            this.initCommands = initCmds;
        },
        enumerable: true,
        configurable: true
    });
    Chunk.prototype.Render = function (events) {
        throw new Error("Not implemented");
    };
    return Chunk;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Chunk;
var VoidChunk = (function (_super) {
    __extends(VoidChunk, _super);
    function VoidChunk() {
        _super.apply(this, arguments);
    }
    VoidChunk.prototype.Render = function () { };
    return VoidChunk;
})(Chunk);
exports.VoidChunk = VoidChunk;
var PathChunk = (function (_super) {
    __extends(PathChunk, _super);
    function PathChunk(path, time, lastErase) {
        _super.call(this, time, lastErase);
        this.path = path;
    }
    Object.defineProperty(PathChunk.prototype, "Path", {
        get: function () { return this.path; },
        enumerable: true,
        configurable: true
    });
    PathChunk.prototype.Render = function (events) { events.trigger(VideoEvents_1.VideoEventType.DrawPath); };
    return PathChunk;
})(Chunk);
exports.PathChunk = PathChunk;
var EraseChunk = (function (_super) {
    __extends(EraseChunk, _super);
    function EraseChunk(color, time, lastErase) {
        _super.call(this, time, lastErase);
        this.color = color;
    }
    Object.defineProperty(EraseChunk.prototype, "Color", {
        get: function () { return this.color; },
        enumerable: true,
        configurable: true
    });
    EraseChunk.prototype.ExecuteInitCommands = function (events) {
        this.Render(events);
        _super.prototype.ExecuteInitCommands.call(this, events);
    };
    EraseChunk.prototype.Render = function (events) {
        events.trigger(VideoEvents_1.VideoEventType.ClearCanvas, this.color);
    };
    return EraseChunk;
})(Chunk);
exports.EraseChunk = EraseChunk;
