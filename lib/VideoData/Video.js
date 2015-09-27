var Video = (function () {
    function Video() {
        this.chunks = [];
    }
    Object.defineProperty(Video.prototype, "Metadata", {
        get: function () { return this.metadata; },
        set: function (value) { this.metadata = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Video.prototype, "CurrentChunk", {
        get: function () {
            return this.chunks[this.currentChunk];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Video.prototype, "CurrentChunkNumber", {
        get: function () {
            return this.currentChunk;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Video.prototype, "SetCurrentChunkNumber", {
        set: function (n) {
            this.currentChunk = n;
        },
        enumerable: true,
        configurable: true
    });
    Video.prototype.PeekNextChunk = function () {
        return this.chunks[this.currentChunk + 1];
    };
    Video.prototype.MoveNextChunk = function () {
        this.currentChunk++;
        if (!!this.CurrentChunk) {
            this.CurrentChunk.Rewind();
        }
    };
    Video.prototype.PushChunk = function (chunk) {
        this.currentChunk = this.chunks.push(chunk) - 1;
        return this.currentChunk;
    };
    Video.prototype.Rewind = function () {
        this.currentChunk = 0;
    };
    Video.prototype.RewindMinusOne = function () {
        this.currentChunk = -1;
    };
    Video.prototype.FastforwardErasedChunksUntil = function (time) {
        var c = this.FindChunk(time, +1);
        return Math.max(this.currentChunk, this.chunks[c].LastErase);
    };
    Video.prototype.RewindToLastEraseBefore = function (time) {
        var c = this.FindChunk(time, -1);
        return this.chunks[c].LastErase;
    };
    Video.prototype.FindChunk = function (time, directionHint) {
        var foundChunk = Math.min(this.currentChunk, this.chunks.length - 2);
        while ((!!this.chunks[foundChunk] && !!this.chunks[foundChunk + 1])
            && (this.chunks[foundChunk].StartTime <= time && this.chunks[foundChunk + 1].StartTime >= time) === false) {
            foundChunk += directionHint;
        }
        if (foundChunk < 0) {
            return 0;
        }
        return foundChunk;
    };
    return Video;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Video;
