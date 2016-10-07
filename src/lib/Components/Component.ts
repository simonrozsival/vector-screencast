
import { IElement } from '../UI/BasicElements';
import VideoEvents from '../Helpers/VideoEvents';

/**
 * Simple string key-value pairs map for any parameters for components and their
 */
export interface ComponentParams {
	[index: string]: string;
}

export interface Component {	
	GetId(): string;
	GetType(): string;
	GetUIElement(): IElement;
	ExecuteCommand(cmd: string, params: ComponentParams): void;
}

export interface ComponentFactory {
	(id: string, params: ComponentParams, events: VideoEvents): Component;
}