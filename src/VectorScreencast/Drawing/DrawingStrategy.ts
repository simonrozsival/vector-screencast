

module VectorScreencast.Drawing {
	
    /**
     * An interface describing a drawing strategy.
     */
	export interface DrawingStrategy {        
        CreateCanvas(): Element;        
		Stretch(): void;
        ClearCanvas(color: UI.Color): void;
        CreatePath(events: Helpers.VideoEvents): Path;
        SetCurrentColor(color: UI.Color): void;	
        SetupOutputCorrection(sourceWidth: number, sourceHeight: number): number;
        SetEvents(events: Helpers.VideoEvents): void;
	} 
	
}