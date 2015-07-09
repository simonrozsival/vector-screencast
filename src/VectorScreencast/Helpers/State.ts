/// <reference path="../VectorScreencast" />

module VectorScreencast.Helpers {
    
    export enum StateType {
        ChangeBrushSize,
        ChangeColor,
        Cursor
    }
    
    export class State {        
        /** Type of this state */
        public GetType(): StateType { return this.type; }                                
        
        /** Time elapsed from video start in milliseconds */
        public GetTime(): number { return this.time; }
        
        /**
         * @param   type    State type
         * @param   time    Time when this state should be processed
         */
        constructor(private type: StateType, private time: number) { }
    }
    
    /**
     * Class representing state of app.
     */
    export class CursorState extends State {
        
        constructor(time: number,
                    private x: number,
                    private y: number,
                    private pressure: number) {
                        super(StateType.Cursor, time);
                    }
                    
        /** Get pointing device X coordinate */        
        get X(): number { return this.x; }
        
        /** Get pointing device Y coordinate */
        get Y(): number { return this.y; }
        
        /** Get pointing device pressure from 0 to 1 */                
        get Pressure(): number { return this.pressure; }                
        
        /**
         * Get pointing device position as a vector
         */
        getPosition(): Vector2 {
            return new Vector2(this.x, this.y);
        }    
        
    }       
    
    /**
     * Class representing state of app.
     */
    export class ColorState extends State {
                
        constructor(time: number, private color: UI.Color) {
            super(StateType.ChangeColor, time);
        }        
        
        public get Color(): UI.Color { return this.color; }
        
    }       
    
    /**
     * Class representing state of app.
     */
    export class SizeState extends State {
                        
        constructor(time: number, private size: UI.BrushSize) {
            super(StateType.ChangeBrushSize, time);
        }
        
        public get Size() : UI.BrushSize { return this.size; }
                
    }       
}