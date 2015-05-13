/**
 * Event Aggregator object.
 * @author Šimon Rozsíval
 */
module Helpers {   
    
    /**
     * The list of supported video events.
     */
    export enum VideoEventType {        
        Start,
        Pause,
        Continue,
        Stop,
        ReachEnd,
        Replay,
        JumpTo,
        BufferStatus,
        
        CursorState,
        ChangeColor,
        ChangeBrushSize,
        CurrentTime,
        Render,
        ClearCanvas,
            
        VideoInfoLoaded,
        CanvasSize,
        CanvasOffset,
        
        RegisterRecordingTool,
        RecordingToolFinished,
        
        RecordingFinished,
        StartUpload,
        DownloadData,
    }
    
    class VideoEvent {
        private listeners: Array<Function>;         
        public get Type() : VideoEventType { return this.type; }
        
        constructor(private type: VideoEventType) {
            this.listeners = [];
        }
        
        /**
         * Attach a new listener.
         */
        public on(command: Function) : void {
            this.listeners.push(command);
        }
        
        /**
         * Remove listener
         */
        public off(command: Function) : void {
            var index: number = this.listeners.indexOf(command);
            if(index >= 0) {            
                // delete just the one listener
                this.listeners.splice(index, 1);                 
            }
        }
        
        /**
         * Trigger this event
         */
        public trigger(args: Array<any>) : void {
            for (var i = 0; i < this.listeners.length; i++) {
                var cmd = this.listeners[i];
                this.triggerAsync(cmd, args);      
                /* TYPESCRIPT 1.6
                await this.triggerAsync(cmd, arguments);
                */
            }
        }
        
        /**
         * Trigger event handle asynchronousely
         */
        private triggerAsync(command: Function, args: Array<any>) : void {
            setTimeout(function () {
                command.apply(this, args);
            }, 0);
        }
        
        /* TYPESCRIPT 1.6:
        private async triggerAsync(command: Function, arguments: Array<any>) : void {
            command.apply(this, arguments);
        }
        */
    } 
    
    /**
     * An interface for holding an associative array of events.
     */
    interface IEvents {
        [index: number]: VideoEvent;
    }
    
    /**
     * Global mediator class.
     * Implements the Mediator design pattern.
     */
    export class VideoEvents {
        /** Registered events */
        private static events: IEvents = [];
         
        /**
         * Register new event listener
         */
        public static on(type: VideoEventType, command: Function) {
            
            if(type in VideoEvents.events === false) {
                VideoEvents.events[<number> type] = new VideoEvent(type);
            }
            
            VideoEvents.events[type].on(command);
        }
        
        /**
         * Unregister event listener
         */
        public static off(type: VideoEventType, command: Function) {
            if(type in VideoEvents.events === true) {            
                VideoEvents.events[<number> type].off(command);
            }
        }
         
         
        /**
         * Trigger an event
         */
        public static trigger(type: VideoEventType, ...args: Array<any>) {
            var e = VideoEvents.events[<number> type];
            if(!!e) { // !! - convert to boolean 
                e.trigger(args);
            }
        }
    }  
}