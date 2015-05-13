/// <reference path="../Helpers/State" />
/// <reference path="../VideoData/IVideoInfo" />

module VideoFormat {
	
	/**
	 * An interface for a writer of VectorVideo format
	 */
	export interface IWritter {
		SetInfo(info: IVideoInfo) : void;
		SetNextState(state: Helpers.State) : void;
		SetNextPrerenderedLine(line: any) : void;
		ToString() : string;
	}
	
	/**
	 * An interface for a reader of VectorVideo format
	 */
	export interface IReader {
		ReadFile(document: XMLDocument) : void;
		GetInfo() : IVideoInfo;
		GetNextState() : Helpers.State;		
		GetNextPrerenderedLine() : any;
		GetNextPrerenderedLineFinishTime() : number;   
	}
	
}