/// <reference path="../Helpers/State" />
/// <reference path="../VideoData/VideoInfo" />

module VideoFormat {
	
	import VideoInfo = VideoData.VideoInfo;
	
	/**
	 * An interface for a writer of VectorVideo format
	 */
	export interface IWritter {
		SetInfo(info: VideoInfo) : void;
		SetNextState(state: Helpers.State) : void;
		SetNextPrerenderedLine(line: any) : void;
		ToString() : string;
	}
	
	/**
	 * An interface for a reader of VectorVideo format
	 */
	export interface IReader {
		ReadFile(document: XMLDocument) : void;
		GetInfo() : VideoInfo;
		GetNextState() : Helpers.State;		
		GetNextPrerenderedLine() : any;
		GetNextPrerenderedLineFinishTime() : number;   
	}
	
}