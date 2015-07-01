

module Drawing {
	
    /**
     * An interface describing a drawing strategy.
     */
	export interface DrawingStrategy {        
        CreateCanvas(): Element;        
		Stretch(): void;
        ClearCanvas(color: UI.Color): void;
        CreatePath(): Path;
        SetCurrentColor(color: UI.Color): void;	
        SetupOutputCorrection(sourceWidth: number, sourceHeight: number): number;
	} 
	
}