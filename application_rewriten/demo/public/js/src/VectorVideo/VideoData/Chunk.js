/// <reference path="Command" />
/// <reference path="../Helpers/State" />
/// <reference path="../Helpers/VideoTimer" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="../Drawing/Path" />
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
     * Chunk represents part of the whole video process.
     * It starts in a specific time and contains list of commands and pre-rendered paths,
     * that are used to render one chunk in a single moment without unnecessary looping through all commands.
     * Each chunk contains an information about the last time the screen was erased.
     */
    var Chunk = (function () {
        /*private*/ function Chunk(time, lastErase) {
            this.time = time;
            this.lastErase = lastErase;
            this.initCommands = [];
            this.commands = [];
            this.cmdIterator = 0;
            this.pathIterator = 0;
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
                return this.commands[this.cmdIterator]; // if the index exceeds the bound of the array, undefined is returned
            },
            enumerable: true,
            configurable: true
        });
        Chunk.prototype.PeekNextCommand = function () {
            return this.commands[this.cmdIterator + 1]; // if the index exceeds the bound of the array, undefined is returned
        };
        Chunk.prototype.MoveNextCommand = function () { this.cmdIterator++; };
        /**
         * Execute all initialising commands to make sure video is in the right state
         * before continuing the playback. This is necessary when skipping to different point
         * on the timeline and skipping rendering of some parts of the video using "lastErase" hints..
         */
        Chunk.prototype.ExecuteInitCommands = function () {
            this.initCommands.forEach(function (cmd) {
                cmd.Execute();
            });
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
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Chunk.prototype, "InitCommands", {
            get: function () {
                return this.initCommands;
            },
            enumerable: true,
            configurable: true
        });
        Chunk.prototype.Render = function () {
            throw new Error("Not implemented");
        };
        return Chunk;
    })();
    VideoData.Chunk = Chunk;
    /**
     * Concrete chunks:
     */
    var VoidChunk = (function (_super) {
        __extends(VoidChunk, _super);
        function VoidChunk() {
            _super.apply(this, arguments);
        }
        Object.defineProperty(VoidChunk, "NodeName", {
            get: function () { return "void"; },
            enumerable: true,
            configurable: true
        });
        return VoidChunk;
    })(Chunk);
    VideoData.VoidChunk = VoidChunk;
    var PathChunk = (function (_super) {
        __extends(PathChunk, _super);
        function PathChunk(path, time, lastErase) {
            _super.call(this, time, lastErase);
            this.path = path;
        }
        Object.defineProperty(PathChunk, "NodeName", {
            get: function () { return "path"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PathChunk.prototype, "Path", {
            get: function () { return this.path; },
            enumerable: true,
            configurable: true
        });
        PathChunk.prototype.Render = function () {
            VideoEvents.trigger(VideoEventType.DrawPath, this.path);
        };
        return PathChunk;
    })(Chunk);
    VideoData.PathChunk = PathChunk;
    var EraseChunk = (function (_super) {
        __extends(EraseChunk, _super);
        function EraseChunk(color, time, lastErase) {
            _super.call(this, time, lastErase);
            this.color = color;
        }
        Object.defineProperty(EraseChunk, "NodeName", {
            get: function () { return "erase"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EraseChunk.prototype, "Color", {
            get: function () { return this.color; },
            enumerable: true,
            configurable: true
        });
        return EraseChunk;
    })(Chunk);
    VideoData.EraseChunk = EraseChunk;
})(VideoData || (VideoData = {}));
