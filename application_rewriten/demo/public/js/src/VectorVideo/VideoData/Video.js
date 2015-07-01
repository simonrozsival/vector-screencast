/// <reference path="Metadata" />
/// <reference path="Command" />
/// <reference path="Chunk" />
/// <reference path="ICursor" />
/// <reference path="../VideoFormat/IO" />
/// <reference path="../Helpers/File" />
/// <reference path="../Helpers/Errors" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="../Helpers/State" />
/// <reference path="../Helpers/VideoTimer" />
/// <reference path="../Drawing/Path" />
var VideoData;
(function (VideoData) {
    var Video = (function () {
        /**
         * Video data storage
         */
        function Video() {
            this.chunks = [];
        }
        Object.defineProperty(Video.prototype, "Metadata", {
            /** Video information. */
            get: function () { return this.metadata; },
            set: function (value) { this.metadata = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Video.prototype, "CurrentChunk", {
            /** Reference to current chunk */
            get: function () {
                return this.chunks[this.currentChunk]; // if the index exceeds the bound of the array, undefined is returned
            },
            enumerable: true,
            configurable: true
        });
        /** Look for the next chunk, but do not move the iterator. */
        Video.prototype.PeekNextChunk = function () {
            return this.chunks[this.currentChunk + 1];
        };
        /** Jump to the next chunk */
        Video.prototype.MoveNextChunk = function () { this.currentChunk++; };
        /**
         * Add a new chunk at the end of the data.
         */
        Video.prototype.PushChunk = function (chunk) {
            this.currentChunk = this.chunks.push(chunk) - 1;
            return this.currentChunk;
        };
        /**
         * Change current chunk to the very first
         */
        Video.prototype.Rewind = function () {
            this.currentChunk = 0;
        };
        /**
         * Go on in time until you find the given timeframe and skip to the very preciding "erase" chunk.
         * If the "erase" chunk preceded current chunk, then there are no erased chunks to fastforward and currentChunk
         * remains untouched.
         * @param	{number}	time			Searched time point in milliseconds
         */
        Video.prototype.FastforwardErasedChunksUntil = function (time) {
            var c = this.FindChunk(time, +1); // seek among the future chunks
            this.currentChunk = Math.max(this.currentChunk, this.chunks[c].LastErase);
        };
        /**
         * Go back in time until you find the given timeframe and skip to the very preceding "erase" chunk.
         * @param	{number}	time			Searched time point in milliseconds
         */
        Video.prototype.RewindToLastEraseBefore = function (time) {
            var c = this.FindChunk(time, -1); // seek among the past chunks
            this.currentChunk = this.chunks[c].LastErase;
        };
        /**
         * Find a chunk that starts at or after "time" and ends after "time"
         * @param	{number}	time			Searched time point in milliseconds
         * @param	{number}	directionHint	1 for searching in the future, -1 to search in the past
         */
        Video.prototype.FindChunk = function (time, directionHint) {
            var foundChunk = this.currentChunk;
            while ((!!this.chunks[foundChunk] && !!this.chunks[foundChunk + 1])
                && (this.chunks[foundChunk].StartTime > time || this.chunks[foundChunk].StartTime <= time)) {
                foundChunk += directionHint;
            }
            if (!this.CurrentChunk) {
                return 0; // I haven't found, what I was looking for, return the first chunk ever
            }
            if (this.CurrentChunk.StartTime < time) {
                return this.chunks.length - 1; // return the very last chunk
            }
            return foundChunk;
        };
        return Video;
    })();
    VideoData.Video = Video;
})(VideoData || (VideoData = {}));
