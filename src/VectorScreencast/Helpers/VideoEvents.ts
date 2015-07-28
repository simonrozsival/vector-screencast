/**
 * Event Aggregator object.
 * @author Šimon Rozsíval
 */
module VectorScreencast.Helpers {   
    
    /**
     * The list of supported video events.
     */
    export enum VideoEventType {
        /** Start or resume playing or recording of the video. */
        Start,
        /** Pause playing or recording of the video. */
        Pause,
        /** End was reached while playing the video. */
        ReachEnd,
        /** Jump to any position of the played video. Time must be specified as a parameter of the triggered event. */
        JumpTo,
        
        /** Video information was extracted from the source file. Metadata object instance must be specifiend as a parameter of the triggered event. */
        VideoInfoLoaded,
        /** Announces the last time that the audio is buffered at the moment. Time in milliseconds must be specified as a paramter of the triggered event. */
        BufferStatus,
        
        /** Announce cursor state. State object instance must be specified as a paramter of the triggered event. */
        CursorState,
        /** Announce current color change. Color object instnace must be specified as a parameter of the triggered event. */
        ChangeColor,
        /** Announce current brush size change. BrushSize object instnace must be specified as a parameter of the triggered event. */
        ChangeBrushSize,
        
        /** Start drawing a new path. Path object instnace must be specified as a parameter of the triggered event. */
        StartPath,
        /** Draw next segment of current path. */
        DrawSegment,
        /** Draw current path as a whole. */
        DrawPath,
        /** Clear the canvas with a single color. Color object instance must be specified as a parameter of the triggered event. */
        ClearCanvas,
        /** Redraw current state of the canvas. */
        RedrawCanvas,
        
        /** Announce canvas size. Width and height numbers must be specified as two paramters of the triggered event.  */
        CanvasSize,
        /** Announce canvas scaling factor. A number must be specified as a parameter of the triggered event. */
        CanvasScalingFactor,
        /** The offset of the cursor from the top left corner of the board element. */
        CursorOffset,
        
        /** Register a recording tool, that should be counted with. */
        RegisterRecordingTool,
        /** One of the recording tools has finsihed. */
        RecordingToolFinished,
        
        /** Mute/Unmute audio recording */
        MuteAudioRecording,
        /** Audio recording is OK. */
        AudioRecordingAvailable,
        /** Audio recording is unavailable for some reason - missing mic, mic not allowed, server not responding. */
        AudioRecordingUnavailable,
        
        /** Start uploading of the recorded data to the server. */
        StartUpload,
        /** Force download of recorded data. */
        DownloadData,
        
        /** Increase the volume. */
        VolumeUp,
        /** Decrease the volume. */
        VolumeDown,
        /** Mute/unmute the audio. */
        Mute,
        
        /** One part of the process is busy. */
        Busy,
        /** One part of the process is not busy any more. */
        Ready,
        
        // DO NOT ADD NEW EVENTS UNDERNEATH:
        /** Hack - the 'length' enum option is declared as last, so it gets the number, that resembles the count of the event types. */ 
        length
    } // if nothing follows "length", then VideoEventType.length gives the total count of valid values
    
    
    /**
     * Video event instance. 
     */
    class VideoEvent {
        /** Collection of subscribed listeners. */
        private listeners: Array<Function>;
        /** Type of this video event. */
        public get Type(): VideoEventType { return this.type; }

        /**
         * @param   type    Event type.
         */
        constructor(private type: VideoEventType) {
            this.listeners = new Array(0); // prepare a dense empty array
        }
        
        /**
         * Attach a new listener.
         * @param   command     New listener. 
         */
        public on(command: Function): void {
            this.listeners.push(command);
        }
        
        /**
         * Remove listener
         * @param   command     Listener to be removed.
         */
        public off(command: Function): void {
            var index: number = this.listeners.indexOf(command);
            if (index >= 0) {            
                // delete just the one listener
                this.listeners.splice(index, 1);
            }
        }
        
        /**
         * Trigger this event
         * @param   args    Array of all arguments to be passed to the listeners.
         */
        public trigger(args: Array<any>): void {
            for (var i = 0; i < this.listeners.length; i++) {
                var cmd = this.listeners[i];
                cmd.apply(this, args);
            }
        }
    } 
    
    /**
     * An interface for holding an associative array of events.
     */
    interface Events {
        [index: number]: VideoEvent;
    }
    
    /**
     * Global mediator class. Implements the Mediator/Event aggregator design pattern.
     */
    export class VideoEvents {
        
        /** Registered events */
        private events: Events;
        
        constructor() {
            this.events = new Array(VideoEventType.length);
        }
         
        /**
         * Register new event listener.
         * @param   type    Event type.
         * @param   command Command to register as a listener of this event.
         */
        public on(type: VideoEventType, command: Function) {
            if (!this.events[<number> type]) {
                this.events[<number> type] = new VideoEvent(type);
            }

            this.events[type].on(command);
        }
        
        /**
         * Unregister event listener.
         * @param   type    Event type.
         * @param   command The function to unregister.
         */
        public off(type: VideoEventType, command: Function) {
            if (!!this.events[<number> type]) {
                this.events[<number> type].off(command);
            }
        }         
         
        /**
         * Trigger an event.
         * @param   type    Event type.
         * @param   args    A variadic array of arguments.
         */
        public trigger(type: VideoEventType, ...args: Array<any>) {
            var e = this.events[<number> type];
            if (!!e) { // !! - convert to boolean 
                e.trigger(args);
            }
        }
    }
}