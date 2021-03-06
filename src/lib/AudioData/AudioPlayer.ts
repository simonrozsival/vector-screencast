/// <reference path="audio.d.ts" />

import VideoEvents, { VideoEventType } from '../Helpers/VideoEvents';
import Errors, { ErrorType } from '../Helpers/Errors';
import HTML from '../Helpers/HTML';

//namespace VectorScreencast.AudioData {
	
	/**
	 * Enumeration of supported audio types.
	 */
	export enum AudioSourceType {
		/** audio/mp3 */
		MP3,
		/** audio/ogg */
		OGG,
		/** audio/wav */
		WAV
	}
	
	/**
	 * Class representing one audio source.
	 */
	export class AudioSource {
		
		/** Read only audio URL. */
		public get Url() : string { return this.url; }
		
		/** Read only information about the type of the source. */
		public get Type() : AudioSourceType { return this.type; }
		
		/** The MIME type of the audio source. */
		public get MimeType() : string {
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
		}
		
		constructor(private url: string, private type: AudioSourceType) { }
		
		/**
		 * Convert the MIME type to AudioSourceType
		 * @param 	type 	Audio MIME type
		 * @return			The appropriate audio source type enum item 
		 */
		public static StringToType(type: string) : AudioSourceType {
			switch(type) {
				case "audio/mp3":
					return AudioSourceType.MP3;
				case "audio/wav":
					return AudioSourceType.WAV;
				case "audio/ogg":
					return AudioSourceType.OGG;
				default:
					throw new Error("Unknown audio type " + type);
			}
		}
	}
	
	/**
	 * This is the audio player
	 */
	export default class AudioPlayer {
		private isReady: boolean;
		public get IsReady() : boolean { return this.isReady; }
		
		private audio: HTMLAudioElement;		
		private playing: boolean;
		private reachedEnd: boolean;
		
		constructor(protected events: VideoEvents, sources: Array<AudioSource>) {
			// create audio element
			this.audio = this.CreateAudio(sources);
			if(this.audio === null) { // no source can be played
				this.isReady = false;		
			} else {
				// the audio is stopped when the page is loaded
				this.playing = false;
				this.reachedEnd = false;
	
				// init was successful
				this.InitAudio();
				this.isReady = true;
	
				// attach the player to the document
				document.documentElement.appendChild(this.audio);
				console.log("Audio is available.");				
			}
		}
		
		/**
		 * Create an audio element and attach supported 
		 */
		private CreateAudio(sources: Array<AudioSource>) : HTMLAudioElement {
			try {
				var audio: HTMLAudioElement = new Audio();
				if(!audio.canPlayType) {
					Errors.Report(ErrorType.Warning, "AudioPlayer: browser does not support HTML5 audio");
					return null;
				}
				
				var canPlayAtLeastOne: boolean = false;			
				for (var i = 0; i < sources.length; i++) {
					var element: AudioSource = sources[i];
					if(audio.canPlayType(element.MimeType) === "probably") { // 'probably' is the best we can get
						var source: HTMLElement = HTML.CreateElement("source", {
							src: element.Url,
							type: element.MimeType
						});
						audio.appendChild(source);
						canPlayAtLeastOne = true;	
					}
				}
				
				if(canPlayAtLeastOne === false) {								
					for (var i = 0; i < sources.length; i++) {
						var element: AudioSource = sources[i];
						if(audio.canPlayType(element.MimeType) === "maybe") { // 'maybe' might also work...
							var source: HTMLElement = HTML.CreateElement("source", {
								src: element.Url,
								type: element.MimeType
							});
							audio.appendChild(source);
							canPlayAtLeastOne = true;	
						}
					}					
				}
				
				// no source can be played by the browser?
				if(canPlayAtLeastOne === false) {
					Errors.Report(ErrorType.Warning, "Browser can't play any of available audio sources.", sources);
					return null;
				}
				
				return audio;
			} catch(e) {
				// unsupported browser
				Errors.Report(ErrorType.Warning, "AudioPlayer: can't create audio element", e);
				return null;
			}
		}

		//
		// private functions section:
		// 
		
		private InitAudio() : void {			
			// important audio events
			this.audio.onended = () => this.events.trigger(VideoEventType.ReachEnd);
			this.audio.onwaiting = () => this.Busy();
			this.audio.oncanplay = () => this.Ready();
			
			// user's volume settings			
			this.events.on(VideoEventType.Mute, 		() => this.Mute());
			this.events.on(VideoEventType.VolumeUp, 	() => this.VolumeUp());
			this.events.on(VideoEventType.VolumeDown,	() => this.VolumeDown());
	
			this.MonitorBufferingAsync();
		};
		
		private triggeredBusyState: boolean;
		
		private Busy(): void {
			if(this.playing) {
				this.triggeredBusyState = true;
				this.events.trigger(VideoEventType.Pause);				
			}
		}
		
		private Ready(): void {
			if(this.triggeredBusyState) {
				this.events.trigger(VideoEventType.Ready);
				this.triggeredBusyState = false; // do not fire more than once for each Busy() status				
			}
		}
			
		/**
		 * Start playling
		 */
		public Play() : void {
			if(this.isReady) {
				if(this.reachedEnd == true) {
					this.Rewind();
				}
	
				this.audio.play();
			}
		}
		
		/**
		 * Be the one who tells others, when to play!
		 */
		private InitiatePlay() : void {
			this.events.trigger(VideoEventType.Start);
		}
	
		/**
		 * Pause audio
		 */
		public Pause() : void {
			if(this.isReady) {
				this.audio.pause();
			}
		}
				
		/**
		 * Video playback has ended.
		 */
		public ReachedEnd() : void {
			this.reachedEnd = true;
			this.Pause();
		}	
	
		/**
		 * Play the audio from the start.
		 */
		public Replay() : void {
			this.Rewind();
			this.Play();
		}
		
		/**
		 * Change current position back to the start
		 */
		public Rewind() : void {
			if(this.isReady) {
				this.audio.pause();
				this.audio.currentTime = 0;
				this.reachedEnd = false;
			}
		}
		
		/** Interval handle */
		private checkPreloaded: number;
		
		/**
		 * Asynchronousely monitor current audio buffer
		 */
		private MonitorBufferingAsync() : void {			
			// Has the browser preloaded something since last time?
			// Change the css styles only if needed.
			var lastEnd: number = 0;
			this.checkPreloaded = <number><any>setInterval(() => {
				var end: number = this.audio.buffered.end(this.audio.buffered.length - 1); 
				if(end !== lastEnd) {
					this.events.trigger(VideoEventType.BufferStatus, end);
					lastEnd = end;
				}
				
				if(end === this.audio.duration) {
					clearInterval(this.checkPreloaded);
				}
			}, 300); // every second check, how much is preloaded
		}
		
		/**
		 * Jump to a given position.
		 * It might take some time before the audio is ready - pause the playback and start as soon as ready.
		 */
		public JumpTo(progress: number) : void {
			if(!this.isReady) return; // no audio is available
			
			this.reachedEnd = false; // if I was at the end and I changed the position, I am not at the end any more!			
			var time: number = this.audio.duration * progress; // duration is in seconds
			this.ChangePosition(time);
			
			// monitor preloading buffer
			clearInterval(this.checkPreloaded);
			this.MonitorBufferingAsync();
		}
	
		/**
		 * Change current audio position to specified time
		 */
		private ChangePosition(seconds: number) : void {
			this.audio.currentTime = seconds;
		}		
		
		/**
		 * Volume MUTE/UP/DOWN
		 */
		
		private Mute(): void {
			this.audio.muted = !this.audio.muted;
		}
		
		private VolumeUp(): void {
			this.audio.volume = Math.min(1, this.audio.volume + 0.1);			
		} 
		
		private VolumeDown(): void {
			this.audio.volume = Math.max(0, this.audio.volume - 0.1);
		} 
	}
//}