/// <reference path="../VectorScreencast" />

module VectorScreencast.VideoData {
	
	import StateType = Helpers.StateType;
	import VideoTimer = Helpers.VideoTimer;
	import VideoEvents = Helpers.VideoEvents;
	import VideoEventType = Helpers.VideoEventType;
				
	/**
	 * Video data storage - contains information about the chunks,
	 * commands and metadata of the video.
	 */
	export class Video {				
		constructor() {
			this.chunks = [];
		}
		
		/** Video meta-information getter. */
		public get Metadata() : Metadata { return this.metadata; }	
		/** Video meta-information setter. */
		public set Metadata(value: Metadata) { this.metadata = value; }		
		/** Video meta-information. */
		protected metadata: Metadata;	
		
		/** Data chunks iteration */
		protected chunks: Array<Chunk>;
		/** Chunks' interator */
		protected currentChunk: number;
		
		/** Reference to current chunk */
		public get CurrentChunk(): Chunk {
			return this.chunks[this.currentChunk]; // if the index exceeds the bound of the array, undefined is returned
		}		
				
		/** Reference to current chunk */
		public get CurrentChunkNumber(): number {
			return this.currentChunk; // if the index exceeds the bound of the array, undefined is returned
		}		
				
		/** Reference to current chunk */
		public set SetCurrentChunkNumber(n: number) {
			this.currentChunk = n; // if the index exceeds the bound of the array, undefined is returned
		}		
		
		/** Look for the next chunk, but do not move the iterator. */
		public PeekNextChunk(): Chunk {
			return this.chunks[this.currentChunk + 1];
		}		
		
		/** Jump to the begining next chunk */
		public MoveNextChunk(): void {
			this.currentChunk++;
			if(!!this.CurrentChunk) {
				this.CurrentChunk.Rewind();				
			}
		}
		
		
		/**
		 * Add a new chunk at the end of the data.
		 */
		public PushChunk(chunk: Chunk): number {
			this.currentChunk = this.chunks.push(chunk) - 1;			
			return this.currentChunk;
		}
		
		
		
		/**.
		 * Change current chunk to the one before the very first
		 */
		public Rewind() : void {
			this.currentChunk = 0;
		}
		
		/**
		 * Rewind one item before the very first one - the next MoveNextChunk will enter the first chunk.
		 */
		public RewindMinusOne(): void {
			this.currentChunk = -1;
		}
		
		/**
		 * Go on in time until you find the given timeframe and skip to the very preciding "erase" chunk.
		 * If the "erase" chunk preceded current chunk, then there are no erased chunks to fastforward and currentChunk
		 * remains untouched.
		 * @param	time			Searched time point in milliseconds
		 */
		public FastforwardErasedChunksUntil(time: number): number {			
			var c: number = this.FindChunk(time, +1); // seek among the future chunks
			return Math.max(this.currentChunk, this.chunks[c].LastErase);
		}   
		
		/**
		 * Go back in time until you find the given timeframe and skip to the very preceding "erase" chunk.
		 * @param	time			Searched time point in milliseconds
		 */	
		public RewindToLastEraseBefore(time: number): number {
			var c: number = this.FindChunk(time, -1); // seek among the past chunks
			return this.chunks[c].LastErase;
		}
		
		/**
		 * Find a chunk that starts at or after "time" and ends after "time"
		 * @param	time			Searched time point in milliseconds
		 * @param	directionHint	1 for searching in the future, -1 to search in the past
		 */
		private FindChunk(time: number, directionHint: number): number {			
			var foundChunk: number = Math.min(this.currentChunk, this.chunks.length - 2);			
			while((!!this.chunks[foundChunk] && !!this.chunks[foundChunk + 1])
					&& (this.chunks[foundChunk].StartTime <= time && this.chunks[foundChunk + 1].StartTime >= time) === false) {
						
				foundChunk += directionHint;
			}
			
			if(foundChunk < 0) { // I have gone too far to the past
				return 0; // I haven't found, what I was looking for, return the first chunk ever
			}
			
			return foundChunk;
		}
	}
	
}